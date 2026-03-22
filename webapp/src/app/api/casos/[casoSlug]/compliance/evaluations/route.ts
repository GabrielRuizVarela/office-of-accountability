import { NextRequest } from 'next/server'
import neo4j from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'
import { checkRateLimit, ENGINE_RATE_LIMITS } from '@/lib/engine/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  const rl = checkRateLimit(`compliance:evaluations:${casoSlug}`, ENGINE_RATE_LIMITS.state)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded', retry_after_ms: rl.reset_at - Date.now() },
      { status: 429 },
    )
  }

  // Optional framework_id filter
  const url = new URL(request.url)
  const frameworkId = url.searchParams.get('framework_id')

  // Limit results (default 50)
  const limitParam = url.searchParams.get('limit')
  const limit = Math.min(Math.max(parseInt(limitParam ?? '50', 10) || 50, 1), 200)

  try {
    const cypher = frameworkId
      ? `MATCH (e:ComplianceEvaluation)
         WHERE e.investigation_id = $casoSlug AND e.framework_id = $frameworkId
         RETURN e ORDER BY e.evaluated_at DESC LIMIT $limit`
      : `MATCH (e:ComplianceEvaluation)
         WHERE e.investigation_id = $casoSlug
         RETURN e ORDER BY e.evaluated_at DESC LIMIT $limit`

    const queryParams: Record<string, unknown> = {
      casoSlug,
      limit: neo4j.int(limit),
    }
    if (frameworkId) queryParams.frameworkId = frameworkId

    const result = await readQuery(
      cypher,
      queryParams,
      (record) => {
        const node = record.get('e')
        return {
          id: node.properties.id as string,
          investigation_id: node.properties.investigation_id as string,
          framework_id: node.properties.framework_id as string,
          phase: node.properties.phase as string,
          evaluated_at: node.properties.evaluated_at as string,
          overall_score: node.properties.overall_score as number,
          gate_passed: node.properties.gate_passed as boolean,
          total_violations: typeof node.properties.total_violations === 'object'
            ? (node.properties.total_violations as { toNumber(): number }).toNumber()
            : (node.properties.total_violations as number),
        }
      },
    )

    return new Response(
      JSON.stringify({ success: true, data: result.records }),
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
    console.error('[compliance/evaluations]', error)
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
      { success: false, error: 'Failed to list compliance evaluations' },
      { status: 500 },
    )
  }
}
