/**
 * Orchestrator dispatch - plan, persist, collect, and reassign investigation tasks.
 * No orchestrator loop logic here (that's orchestrator.ts in Step 3.2).
 */

import neo4j from 'neo4j-driver-lite'
import type { OrchestratorTask } from '../types'
import type { GapReport } from '../gap-detector'
import type { ResearchDirective } from '../research-program'
import { readQuery, executeWrite } from '../../neo4j/client'

// ---------------------------------------------------------------------------
// planBatch - create in-memory tasks from gaps + directives
// ---------------------------------------------------------------------------

/**
 * Creates OrchestratorTask objects from structural gaps and research directives.
 * Returns in-memory task objects - no DB write (use dispatchBatch for that).
 */
export function planBatch(
  investigation_id: string,
  gaps: GapReport,
  directives: ResearchDirective[],
): OrchestratorTask[] {
  const now = new Date().toISOString()
  const tasks: OrchestratorTask[] = []

  // Tasks from isolated nodes (priority 7 - need connections)
  for (const node of gaps.isolated_nodes) {
    tasks.push({
      id: crypto.randomUUID(),
      investigation_id,
      type: 'research_connections',
      target: node.name || node.id,
      priority: 7,
      status: 'pending',
      dependencies: [],
      created_at: now,
    })
  }

  // Tasks from low-confidence clusters (priority 8 - need corroboration)
  for (const cluster of gaps.low_confidence_clusters) {
    tasks.push({
      id: crypto.randomUUID(),
      investigation_id,
      type: 'corroborate',
      target: cluster.name || cluster.node_id,
      priority: 8,
      status: 'pending',
      dependencies: [],
      created_at: now,
    })
  }

  // Tasks from missing relationships (priority 6 - potential links)
  for (const rel of gaps.missing_relationships) {
    tasks.push({
      id: crypto.randomUUID(),
      investigation_id,
      type: 'investigate_link',
      target: `${rel.source_name} <-> ${rel.target_name}`,
      priority: 6,
      status: 'pending',
      dependencies: [],
      created_at: now,
    })
  }

  // Tasks from research directives (priority from directive)
  for (const directive of directives) {
    tasks.push({
      id: crypto.randomUUID(),
      investigation_id,
      type: 'directive',
      target: directive.question,
      priority: Math.min(Math.max(directive.priority, 1), 10),
      status: 'pending',
      dependencies: [],
      created_at: now,
    })
  }

  return tasks
}

// ---------------------------------------------------------------------------
// dispatchBatch - persist tasks to Neo4j in a single UNWIND query
// ---------------------------------------------------------------------------

/**
 * Creates OrchestratorTask nodes in Neo4j in a single batched query.
 */
export async function dispatchBatch(tasks: OrchestratorTask[]): Promise<void> {
  if (tasks.length === 0) return

  const cypher = `
    UNWIND $tasks AS t
    CREATE (task:OrchestratorTask {
      id: t.id,
      investigation_id: t.investigation_id,
      type: t.type,
      target: t.target,
      priority: t.priority,
      status: t.status,
      dependencies: t.dependencies,
      created_at: t.created_at
    })
  `

  const taskParams = tasks.map((t) => ({
    id: t.id,
    investigation_id: t.investigation_id,
    type: t.type,
    target: t.target,
    priority: neo4j.int(t.priority),
    status: t.status,
    assigned_to: t.assigned_to ?? null,
    dependencies: t.dependencies,
    result_summary: t.result_summary ?? null,
    created_at: t.created_at,
    completed_at: t.completed_at ?? null,
  }))

  await executeWrite(cypher, { tasks: taskParams })
}

// ---------------------------------------------------------------------------
// collectResults - fetch completed tasks for an investigation
// ---------------------------------------------------------------------------

/**
 * Returns completed OrchestratorTask nodes for the given investigation,
 * sorted by completed_at DESC.
 */
export async function collectResults(investigation_id: string): Promise<OrchestratorTask[]> {
  const cypher = `
    MATCH (t:OrchestratorTask)
    WHERE t.investigation_id = $investigation_id
      AND t.status = 'completed'
    RETURN t
    ORDER BY t.completed_at DESC
    LIMIT $limit
  `

  const result = await readQuery(
    cypher,
    { investigation_id, limit: neo4j.int(500) },
    (record) => {
      const t = record.get('t').properties
      return {
        id: t.id as string,
        investigation_id: t.investigation_id as string,
        type: t.type as string,
        target: t.target as string,
        priority: typeof t.priority === 'object' && 'toNumber' in t.priority
          ? (t.priority as { toNumber: () => number }).toNumber()
          : (t.priority as number),
        status: t.status as OrchestratorTask['status'],
        assigned_to: (t.assigned_to as string) || undefined,
        dependencies: (t.dependencies as string[]) ?? [],
        result_summary: (t.result_summary as string) || undefined,
        created_at: t.created_at as string,
        completed_at: (t.completed_at as string) || undefined,
      } satisfies OrchestratorTask
    },
  )

  return [...result.records]
}

// ---------------------------------------------------------------------------
// reassign - change task assignment and set status to 'assigned'
// ---------------------------------------------------------------------------

/**
 * Reassigns a task to a new agent, setting its status to 'assigned'.
 */
export async function reassign(task_id: string, new_agent: string): Promise<void> {
  const cypher = `
    MATCH (t:OrchestratorTask { id: $task_id })
    SET t.assigned_to = $new_agent,
        t.status = 'assigned'
  `

  await executeWrite(cypher, { task_id, new_agent })
}
