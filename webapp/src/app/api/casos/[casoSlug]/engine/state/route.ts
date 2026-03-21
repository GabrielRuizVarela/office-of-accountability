import { NextRequest } from 'next/server'

import { listByPipeline } from '@/lib/engine/pipeline'
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

  const pipelineId = request.nextUrl.searchParams.get('pipeline_id')
  if (!pipelineId) {
    return Response.json(
      { success: false, error: 'Missing required query param: pipeline_id' },
      { status: 400 },
    )
  }

  try {
    const states = await listByPipeline(pipelineId)

    return new Response(JSON.stringify({ success: true, data: states }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rl.remaining),
        'X-RateLimit-Reset': String(rl.reset_at),
      },
    })
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
