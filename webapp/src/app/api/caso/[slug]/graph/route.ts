import { NextRequest } from 'next/server'

import { getInvestigationGraph } from '../../../../../lib/caso-epstein/queries'
import { CASO_EPSTEIN_SLUG } from '../../../../../lib/caso-epstein/types'
import { getNuclearRiskGraph } from '../../../../../lib/caso-nuclear-risk/graph-api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    const { searchParams } = new URL(request.url)
    const tiersParam = searchParams.get('tiers')
    const tiers = tiersParam ? tiersParam.split(',') as ('gold' | 'silver' | 'bronze')[] : undefined

    let data
    if (slug === 'riesgo-nuclear') {
      data = await getNuclearRiskGraph(tiers)
    } else {
      data = await getInvestigationGraph(CASO_EPSTEIN_SLUG, tiers)
    }

    return Response.json({ success: true, data })
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
      { success: false, error: 'Failed to load graph data' },
      { status: 500 },
    )
  }
}
