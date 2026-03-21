import { NextRequest } from 'next/server'

import { listByPipeline } from '@/lib/engine/pipeline'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
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
    const states = await listByPipeline(pipelineId)

    return Response.json({ success: true, data: states })
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
      { success: false, error: 'Failed to list pipeline states' },
      { status: 500 },
    )
  }
}
