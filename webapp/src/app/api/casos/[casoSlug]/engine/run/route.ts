import { NextRequest } from 'next/server'

import { createPipelineState, startPipeline } from '@/lib/engine/pipeline'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  const rl = checkRateLimit(`engine:run:${casoSlug}`, ENGINE_RATE_LIMITS.run)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

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
      caso_slug: casoSlug,
    })
    await startPipeline(state.id)

    return new Response(JSON.stringify({ success: true, data: state }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset_at),
      },
    })
  } catch (error) {
    console.error('[engine/run]', error)
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
