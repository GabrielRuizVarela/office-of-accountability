import { NextRequest } from 'next/server'

import { listByPipelineState, batchReview } from '@/lib/engine/proposals'
import type { ProposalStatus } from '@/lib/engine/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  await params

  const pipeline_state_id = request.nextUrl.searchParams.get('pipeline_state_id')
  if (!pipeline_state_id) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_state_id' },
      { status: 400 },
    )
  }

  const status = request.nextUrl.searchParams.get('status') as ProposalStatus | null

  try {
    const proposals = await listByPipelineState(
      pipeline_state_id,
      status ?? undefined,
    )

    return Response.json({ success: true, data: proposals })
  } catch (error) {
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

    return Response.json({ success: true, data: { reviewed } })
  } catch (error) {
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
