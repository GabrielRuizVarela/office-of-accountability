import { NextRequest } from 'next/server'

import { createPipelineState, startPipeline } from '@/lib/engine/pipeline'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const { investigationId } = await params

  let body: { pipeline_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  if (!body.pipeline_id) {
    return Response.json(
      { success: false, error: 'Missing required field: pipeline_id' },
      { status: 400 },
    )
  }

  try {
    const state = await createPipelineState({
      pipeline_id: body.pipeline_id,
      caso_slug: investigationId,
    })
    await startPipeline(state.id)

    return Response.json({ success: true, data: state })
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
      { success: false, error: 'Failed to start pipeline run' },
      { status: 500 },
    )
  }
}
