import { NextRequest } from 'next/server'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'
import type { OrchestratorState, OrchestratorTask } from '@/lib/engine/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nodeProps(record: Neo4jRecord): Record<string, unknown> {
  const node = record.get('n')
  const raw = node.properties as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = neo4j.isInt(v) ? (v as { toNumber(): number }).toNumber() : v
  }
  return out
}

// ---------------------------------------------------------------------------
// GET /api/casos/[casoSlug]/engine/orchestrator
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  const pipelineId = new URL(request.url).searchParams.get('pipeline_id')
  if (!pipelineId) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_id' },
      { status: 400 },
    )
  }

  try {
    // Fetch orchestrator state
    const stateResult = await readQuery<OrchestratorState>(
      `MATCH (n:OrchestratorState {investigation_id: $pipelineId})
       RETURN n LIMIT $limit`,
      { pipelineId, limit: neo4j.int(1) },
      (r) => nodeProps(r) as unknown as OrchestratorState,
    )
    const state = stateResult.records[0] ?? null

    // Fetch task counts by status
    const taskResult = await readQuery<OrchestratorTask>(
      `MATCH (n:OrchestratorTask {investigation_id: $pipelineId})
       RETURN n ORDER BY n.priority ASC, n.created_at ASC LIMIT $limit`,
      { pipelineId, limit: neo4j.int(100) },
      (r) => nodeProps(r) as unknown as OrchestratorTask,
    )
    const tasks = taskResult.records as unknown as OrchestratorTask[]

    const pending = tasks.filter((t) => t.status === 'pending').length
    const running = tasks.filter((t) => t.status === 'running').length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const failed = tasks.filter((t) => t.status === 'failed').length

    return Response.json({
      success: true,
      data: {
        state,
        task_summary: { total: tasks.length, pending, running, completed, failed },
        tasks,
      },
    })
  } catch (error) {
    console.error('[engine/orchestrator]', error)
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to fetch orchestrator state' },
      { status: 500 },
    )
  }
}
