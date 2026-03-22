import { NextRequest } from 'next/server'

import { loadFrameworksFromNeo4j, persistEvaluation } from '@/lib/compliance/pipeline'
import { evaluateFramework } from '@/lib/compliance/engine'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'
import type { CompliancePhase } from '@/lib/compliance/types'
import { compliancePhases } from '@/lib/compliance/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string; frameworkId: string }> },
) {
  const { casoSlug, frameworkId } = await params

  const rl = checkRateLimit(`compliance:evaluate:${casoSlug}`, ENGINE_RATE_LIMITS.run)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

  // Optional phase filter from query params
  const url = new URL(request.url)
  const phaseParam = url.searchParams.get('phase') ?? 'any'

  if (!compliancePhases.includes(phaseParam as CompliancePhase)) {
    return Response.json(
      { success: false, error: `Invalid phase: ${phaseParam}. Valid: ${compliancePhases.join(', ')}` },
      { status: 400 },
    )
  }

  const phase = phaseParam as CompliancePhase

  try {
    const frameworks = await loadFrameworksFromNeo4j()
    const framework = frameworks.find((fw) => fw.id === frameworkId)

    if (!framework) {
      return Response.json(
        { success: false, error: `Framework not found: ${frameworkId}` },
        { status: 404 },
      )
    }

    const report = await evaluateFramework({
      framework,
      investigationId: casoSlug,
      phase,
    })

    // Persist evaluation for audit trail
    const evaluationId = await persistEvaluation(report)

    return new Response(
      JSON.stringify({
        success: true,
        data: { ...report, evaluation_id: evaluationId },
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
    console.error('[compliance/evaluate]', error)
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
      { success: false, error: 'Failed to evaluate compliance framework' },
      { status: 500 },
    )
  }
}
