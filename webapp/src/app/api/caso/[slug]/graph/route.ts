import { NextRequest } from 'next/server'

import { getInvestigationGraph } from '../../../../../lib/caso-epstein/queries'
import { CASO_EPSTEIN_SLUG } from '../../../../../lib/caso-epstein/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  // Currently only the Epstein case is supported — accept any slug
  try {
    // Parse optional tier filter from query params; default to gold+silver for performance
    const { searchParams } = new URL(request.url)
    const tiersParam = searchParams.get('tiers')
    const tiers = tiersParam ? tiersParam.split(',') as ('gold' | 'silver' | 'bronze')[] : undefined
    const data = await getInvestigationGraph(CASO_EPSTEIN_SLUG, tiers)
    return Response.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    // Check for Neo4j connection errors
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
