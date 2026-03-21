import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'
import { getQueryBuilder } from '@/lib/investigations/query-builder'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params

  // Validate slug against the registry
  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!id) {
    return Response.json(
      { success: false, error: 'Missing node id' },
      { status: 400 },
    )
  }

  // Parse optional depth query param (default 1, max 3)
  const depthParam = request.nextUrl.searchParams.get('depth')
  const depth = depthParam ? Math.max(1, Math.min(parseInt(depthParam, 10) || 1, 3)) : undefined

  try {
    const data = await getQueryBuilder().getNodeConnections(slug, id, depth)
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
      { success: false, error: 'Failed to load node' },
      { status: 500 },
    )
  }
}
