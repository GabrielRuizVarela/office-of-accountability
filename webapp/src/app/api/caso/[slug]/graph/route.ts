import { NextRequest } from 'next/server'

import { getInvestigationGraph } from '@/lib/caso-epstein/queries'
import { getInvestigationGraph as getDictaduraGraph } from '@/lib/caso-dictadura/queries'
import { getNuclearRiskGraph } from '@/lib/caso-nuclear-risk'

const VALID_SLUGS = new Set([
  'caso-epstein',
  'obras-publicas',
  'finanzas-politicas',
  'caso-libra',
  'riesgo-nuclear',
  'caso-dictadura',
])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  try {
    if (!VALID_SLUGS.has(slug)) {
      return Response.json(
        { success: false, error: `Unknown caso slug: ${slug}` },
        { status: 404 },
      )
    }

    const { searchParams } = new URL(request.url)
    const tiersParam = searchParams.get('tiers')
    const tiers = tiersParam ? tiersParam.split(',') as ('gold' | 'silver' | 'bronze')[] : undefined
    const labelsParam = searchParams.get('labels')
    const labels = labelsParam ? labelsParam.split(',') : undefined

    let data
    if (slug === 'riesgo-nuclear') {
      data = await getNuclearRiskGraph(tiers)
    } else if (slug === 'caso-dictadura') {
      data = await getDictaduraGraph('caso-dictadura', tiers, labels)
    } else {
      data = await getInvestigationGraph(slug, tiers)
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
