import { NextRequest } from 'next/server'

import { listByPipelineState, batchReview, applyProposal } from '@/lib/engine/proposals'
import type { ProposalStatus } from '@/lib/engine/types'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  const rl = checkRateLimit(`engine:proposals:${casoSlug}`, ENGINE_RATE_LIMITS.proposals)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

  const pipeline_state_id = new URL(request.url).searchParams.get('pipeline_state_id')
  if (!pipeline_state_id) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_state_id' },
      { status: 400 },
    )
  }

  const status = new URL(request.url).searchParams.get('status') as ProposalStatus | null

  try {
    const proposals = await listByPipelineState(
      pipeline_state_id,
      status ?? undefined,
    )

    return new Response(JSON.stringify({ success: true, data: proposals }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset_at),
      },
    })
  } catch (error) {
    console.error('[engine/proposals]', error)
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
      { success: false, error: 'Failed to list proposals' },
      { status: 500 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  let body: { ids?: string[]; action?: string; reviewed_by?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
    return Response.json(
      { success: false, error: 'Missing required field: ids (non-empty array)' },
      { status: 400 },
    )
  }

  if (body.action !== 'approved' && body.action !== 'rejected') {
    return Response.json(
      { success: false, error: 'Missing required field: action (approved | rejected)' },
      { status: 400 },
    )
  }

  if (!body.reviewed_by) {
    return Response.json(
      { success: false, error: 'Missing required field: reviewed_by' },
      { status: 400 },
    )
  }

  try {
    const reviewed = await batchReview(body.ids, body.action, body.reviewed_by)

    // Apply approved proposals to the graph (materialize nodes/edges)
    let applied = 0
    const applyErrors: string[] = []
    if (body.action === 'approved') {
      for (const id of body.ids) {
        try {
          await applyProposal(id)
          applied++
        } catch (err) {
          applyErrors.push(`${id}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }

    return Response.json({
      success: true,
      data: { reviewed, applied, errors: applyErrors.length > 0 ? applyErrors : undefined },
    })
  } catch (error) {
    console.error('[engine/proposals]', error)
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
      { success: false, error: 'Failed to review proposals' },
      { status: 500 },
    )
  }
}
