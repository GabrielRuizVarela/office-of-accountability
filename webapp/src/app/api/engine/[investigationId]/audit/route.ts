import { NextRequest } from 'next/server'

import { getChain } from '@/lib/engine/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  await params

  const searchParams = request.nextUrl.searchParams
  const pipelineStateId = searchParams.get('pipeline_state_id')

  if (!pipelineStateId) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_state_id' },
      { status: 400 },
    )
  }

  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam, 10) : 50

  if (isNaN(limit) || limit < 1) {
    return Response.json(
      { success: false, error: 'Invalid limit parameter' },
      { status: 400 },
    )
  }

  try {
    const entries = await getChain(pipelineStateId, limit)

    return Response.json({ success: true, data: { entries } })
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
      { success: false, error: 'Failed to retrieve audit entries' },
      { status: 500 },
    )
  }
}
