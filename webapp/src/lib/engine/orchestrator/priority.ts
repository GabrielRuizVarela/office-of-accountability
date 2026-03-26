/**
 * Orchestrator priority - scoring, rebalancing, diminishing returns, and focus suggestions.
 * No orchestrator loop logic here (that's orchestrator.ts in Step 3.2).
 */

import neo4j from 'neo4j-driver-lite'
import type { OrchestratorTask } from '../types'
import type { SynthesisReport } from './synthesis'
import type { IterationMetrics } from '../research-metrics'
import { readQuery, executeWrite } from '../../neo4j/client'

// ---------------------------------------------------------------------------
// scorePriority - weighted priority score (pure function)
// ---------------------------------------------------------------------------

/**
 * Computes a weighted priority score (1–10) for a task based on its base
 * priority and current iteration metrics.
 *
 * - Low novelty + low-yield task type → reduce priority
 * - High corroboration score → boost corroboration-related tasks
 */
export function scorePriority(task: OrchestratorTask, metrics: IterationMetrics): number {
  let score = task.priority

  // Reduce priority for low-yield patterns when novelty is drying up
  if (metrics.novelty_score < 0.1 && (task.type === 'research_connections' || task.type === 'investigate_link')) {
    score -= 2
  }

  // Boost tasks that corroborate existing findings when corroboration is strong
  if (metrics.corroboration_score > 0.5 && task.type === 'corroborate') {
    score += 2
  }

  // Slight boost when coverage is growing and task adds new information
  if (metrics.coverage_delta > 0.05) {
    score += 1
  }

  // Clamp to 1–10 integer
  return Math.min(10, Math.max(1, Math.round(score)))
}

// ---------------------------------------------------------------------------
// rebalance - reprioritize pending tasks based on synthesis results
// ---------------------------------------------------------------------------

/**
 * Updates priority of pending OrchestratorTask nodes based on synthesis findings.
 * Boosts tasks whose target appears in corroborations; reduces tasks in duplicates.
 * Single UNWIND-based UPDATE query.
 */
export async function rebalance(investigation_id: string, synthesis: SynthesisReport): Promise<void> {
  // Build a map of target → priority adjustment
  const adjustments = new Map<string, number>()

  // Boost for corroborated targets (more evidence = higher priority)
  for (const corr of synthesis.corroborations) {
    const current = adjustments.get(corr.target) ?? 0
    adjustments.set(corr.target, current + 2)
  }

  // Reduce for duplicate targets (already covered)
  for (const dup of synthesis.duplicates) {
    // duplicates don't have a "target" field, skip adjustment for canonical
    // We reduce priority on tasks matching duplicate groups - but since
    // DuplicateGroup only has proposal IDs, not task targets, we skip this
    // if we can't map back. In practice, rebalance operates on corroborations.
  }

  if (adjustments.size === 0) return

  const updates = Array.from(adjustments.entries()).map(([target, delta]) => ({
    target,
    delta: neo4j.int(delta),
  }))

  const cypher = `
    UNWIND $updates AS u
    MATCH (t:OrchestratorTask)
    WHERE t.investigation_id = $investigation_id
      AND t.status = 'pending'
      AND t.target = u.target
    WITH t, u,
         CASE
           WHEN t.priority + u.delta > 10 THEN 10
           WHEN t.priority + u.delta < 1 THEN 1
           ELSE t.priority + u.delta
         END AS new_priority
    SET t.priority = new_priority
  `

  await executeWrite(cypher, { investigation_id, updates })
}

// ---------------------------------------------------------------------------
// detectDiminishingReturns - check for declining novelty (pure function)
// ---------------------------------------------------------------------------

/**
 * Returns true if the last 3+ iterations show declining novelty_score
 * AND declining coverage_delta - signals the investigation is stalling.
 */
export function detectDiminishingReturns(metricsHistory: IterationMetrics[]): boolean {
  if (metricsHistory.length < 3) return false

  const last3 = metricsHistory.slice(-3)

  // Check novelty trend is strictly decreasing
  const noveltyDecreasing =
    last3[0].novelty_score > last3[1].novelty_score &&
    last3[1].novelty_score > last3[2].novelty_score

  // Check coverage trend is strictly decreasing
  const coverageDecreasing =
    last3[0].coverage_delta > last3[1].coverage_delta &&
    last3[1].coverage_delta > last3[2].coverage_delta

  return noveltyDecreasing && coverageDecreasing
}

// ---------------------------------------------------------------------------
// suggestNewFocus - find uncovered graph regions
// ---------------------------------------------------------------------------

/**
 * Finds node labels/clusters in the graph that have few or no OrchestratorTask
 * coverage, suggesting new investigation angles.
 */
export async function suggestNewFocus(investigation_id: string): Promise<string[]> {
  const cypher = `
    MATCH (n)
    WHERE n.caso_slug = $investigation_id
    WITH labels(n) AS node_labels
    UNWIND node_labels AS label
    WITH label, count(*) AS node_count
    WHERE label <> 'OrchestratorTask' AND label <> 'PipelineState'
    OPTIONAL MATCH (t:OrchestratorTask)
    WHERE t.investigation_id = $investigation_id
      AND t.target CONTAINS label
    WITH label, node_count, count(t) AS task_count
    RETURN label
    ORDER BY task_count ASC, node_count DESC
    LIMIT $limit
  `

  const result = await readQuery(
    cypher,
    { investigation_id, limit: neo4j.int(10) },
    (record) => record.get('label') as string,
  )

  return [...result.records]
}
