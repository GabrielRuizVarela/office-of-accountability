import { NextRequest } from 'next/server'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery } from '@/lib/neo4j/client'
import type { OrchestratorTask } from '@/lib/engine/types'
import { orchestratorTaskStatuses } from '@/lib/engine/types'

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

function dbError(message: string): Response {
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
    { success: false, error: 'Internal server error' },
    { status: 500 },
  )
}

// ---------------------------------------------------------------------------
// GET /api/casos/[casoSlug]/engine/orchestrator/tasks
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

  const statusFilter = new URL(request.url).searchParams.get('status')
  if (
    statusFilter &&
    !orchestratorTaskStatuses.includes(
      statusFilter as (typeof orchestratorTaskStatuses)[number],
    )
  ) {
    return Response.json(
      { success: false, error: `Invalid status filter: ${statusFilter}` },
      { status: 400 },
    )
  }

  try {
    const cypher = statusFilter
      ? `MATCH (n:OrchestratorTask {investigation_id: $pipelineId, status: $status})
         RETURN n ORDER BY n.priority ASC, n.created_at ASC LIMIT $limit`
      : `MATCH (n:OrchestratorTask {investigation_id: $pipelineId})
         RETURN n ORDER BY n.priority ASC, n.created_at ASC LIMIT $limit`

    const result = await readQuery<OrchestratorTask>(
      cypher,
      { pipelineId, status: statusFilter, limit: neo4j.int(200) },
      (r) => nodeProps(r) as unknown as OrchestratorTask,
    )

    return Response.json({
      success: true,
      data: { tasks: result.records },
    })
  } catch (error) {
    return dbError(error instanceof Error ? error.message : String(error))
  }
}

// ---------------------------------------------------------------------------
// POST /api/casos/[casoSlug]/engine/orchestrator/tasks
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { investigation_id, type, target } = body as {
    investigation_id?: string
    type?: string
    target?: string
  }

  if (!investigation_id || !type || !target) {
    return Response.json(
      {
        success: false,
        error: 'Missing required fields: investigation_id, type, target',
      },
      { status: 400 },
    )
  }

  const priority =
    typeof body.priority === 'number' ? Math.min(10, Math.max(1, body.priority)) : 5
  const dependencies = Array.isArray(body.dependencies) ? body.dependencies : []
  const id = crypto.randomUUID()
  const created_at = new Date().toISOString()

  try {
    const result = await writeQuery<OrchestratorTask>(
      `CREATE (n:OrchestratorTask {
        id: $id,
        investigation_id: $investigation_id,
        type: $type,
        target: $target,
        priority: $priority,
        status: 'pending',
        dependencies: $dependencies,
        created_at: $created_at
      })
      RETURN n`,
      {
        id,
        investigation_id,
        type,
        target,
        priority: neo4j.int(priority),
        dependencies,
        created_at,
      },
      (r) => nodeProps(r) as unknown as OrchestratorTask,
    )

    return Response.json(
      { success: true, data: { task: result.records[0] } },
      { status: 201 },
    )
  } catch (error) {
    return dbError(error instanceof Error ? error.message : String(error))
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/casos/[casoSlug]/engine/orchestrator/tasks
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const taskId = body.task_id
  if (typeof taskId !== 'string' || !taskId) {
    return Response.json(
      { success: false, error: 'Missing required field: task_id' },
      { status: 400 },
    )
  }

  const sets: string[] = []
  const queryParams: Record<string, unknown> = { taskId }

  if (typeof body.priority === 'number') {
    const p = Math.min(10, Math.max(1, body.priority))
    sets.push('n.priority = $priority')
    queryParams.priority = neo4j.int(p)
  }

  if (
    typeof body.status === 'string' &&
    orchestratorTaskStatuses.includes(
      body.status as (typeof orchestratorTaskStatuses)[number],
    )
  ) {
    sets.push('n.status = $status')
    queryParams.status = body.status
    if (body.status === 'completed' || body.status === 'failed') {
      sets.push('n.completed_at = $completed_at')
      queryParams.completed_at = new Date().toISOString()
    }
  }

  if (sets.length === 0) {
    return Response.json(
      { success: false, error: 'No valid fields to update (priority, status)' },
      { status: 400 },
    )
  }

  try {
    const result = await writeQuery<OrchestratorTask>(
      `MATCH (n:OrchestratorTask {id: $taskId})
       SET ${sets.join(', ')}
       RETURN n`,
      queryParams,
      (r) => nodeProps(r) as unknown as OrchestratorTask,
    )

    if (result.records.length === 0) {
      return Response.json(
        { success: false, error: `Task not found: ${taskId}` },
        { status: 404 },
      )
    }

    return Response.json({ success: true, data: { task: result.records[0] } })
  } catch (error) {
    return dbError(error instanceof Error ? error.message : String(error))
  }
}
