import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'
import { getQueryBuilder } from '@/lib/investigations/query-builder'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  // Validate slug against the registry
  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  try {
    const data = await getQueryBuilder().getStats(slug)
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
      { success: false, error: 'Failed to load stats' },
      { status: 500 },
    )
  }
}
