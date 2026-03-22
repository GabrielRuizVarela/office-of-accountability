/**
 * API route: GET /api/caso/[slug]/document/[docSlug]
 * Returns document data with connected entities.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getQueryBuilder } from '@/lib/investigations/query-builder'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; docSlug: string }> },
): Promise<Response> {
  const { slug, docSlug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!docSlug || docSlug.length > 200) {
    return Response.json(
      { success: false, error: 'Invalid slug' },
      { status: 400 },
    )
  }

  try {
    const node = await getQueryBuilder().getNodeBySlug(slug, 'Document', docSlug)

    if (!node) {
      return Response.json(
        { success: false, error: 'Document not found' },
        { status: 404 },
      )
    }

    // Get connections for mentioned entities
    const connections = await getQueryBuilder().getNodeConnections(slug, node.id, 1)
    const mentionedEntities = connections.nodes
      .filter((n) => n.id !== node.id)
      .map((n) => ({ id: n.id, name: n.name ?? n.id, type: n.label }))

    return Response.json({
      success: true,
      data: {
        document: { id: node.id, slug: node.slug, ...node.properties },
        mentionedEntities,
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
      { success: false, error: 'Failed to load document data' },
      { status: 500 },
    )
  }
}
