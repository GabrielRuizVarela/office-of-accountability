import { NextRequest } from 'next/server'

import { listByPipeline, listByCasoSlug } from '@/lib/engine/pipeline'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  const rl = checkRateLimit(`engine:state:${casoSlug}`, ENGINE_RATE_LIMITS.state)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

  const pipelineId = new URL(request.url).searchParams.get('pipeline_id')

  try {
    const states = pipelineId
      ? await listByPipeline(pipelineId)
      : await listByCasoSlug(casoSlug)

    return new Response(JSON.stringify({ success: true, data: states }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset_at),
      },
    })
  } catch (error) {
    console.error('[engine/state]', error)
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
