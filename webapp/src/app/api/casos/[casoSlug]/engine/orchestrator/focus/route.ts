import { NextRequest } from 'next/server'
import neo4j from 'neo4j-driver-lite'
import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery, writeQuery } from '@/lib/neo4j/client'
import type { OrchestratorState } from '@/lib/engine/types'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'

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
// GET /api/casos/[casoSlug]/engine/orchestrator/focus
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  const pipelineId = request.nextUrl.searchParams.get('pipeline_id')
  if (!pipelineId) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_id' },
      { status: 400 },
    )
  }

  try {
    const result = await readQuery<OrchestratorState>(
      `MATCH (n:OrchestratorState {investigation_id: $pipelineId})
       RETURN n LIMIT $limit`,
      { pipelineId, limit: neo4j.int(1) },
      (r) => nodeProps(r) as unknown as OrchestratorState,
    )

    if (result.records.length === 0) {
      return Response.json(
        { success: false, error: 'No orchestrator state found for this pipeline' },
        { status: 404 },
      )
    }

    const state = result.records[0] as unknown as OrchestratorState
    return Response.json({
      success: true,
      data: {
        current_focus: state.current_focus ?? null,
        updated_at: state.updated_at,
      },
    })
  } catch (error) {
    return dbError(error instanceof Error ? error.message : String(error))
  }
}

// ---------------------------------------------------------------------------
// PUT /api/casos/[casoSlug]/engine/orchestrator/focus
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  const rl = checkRateLimit(`engine:focus:${casoSlug}`, ENGINE_RATE_LIMITS.focus)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const pipelineId = body.pipeline_id
  const focus = body.focus

  if (typeof pipelineId !== 'string' || !pipelineId) {
    return Response.json(
      { success: false, error: 'Missing required field: pipeline_id' },
      { status: 400 },
    )
  }

  if (typeof focus !== 'string' || !focus) {
    return Response.json(
      { success: false, error: 'Missing required field: focus' },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()

  try {
    const result = await writeQuery<OrchestratorState>(
      `MERGE (n:OrchestratorState {investigation_id: $pipelineId})
       SET n.current_focus = $focus, n.updated_at = $now
       RETURN n`,
      { pipelineId, focus, now },
      (r) => nodeProps(r) as unknown as OrchestratorState,
    )

    const state = result.records[0] as unknown as OrchestratorState
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          current_focus: state.current_focus ?? null,
          updated_at: state.updated_at,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset_at),
        },
      },
    )
  } catch (error) {
    return dbError(error instanceof Error ? error.message : String(error))
  }
}
