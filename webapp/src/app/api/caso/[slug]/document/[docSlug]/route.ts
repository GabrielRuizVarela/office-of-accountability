/**
 * API route: GET /api/caso/[slug]/document/[docSlug]
 * Returns document data with connected entities.
 */

import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; docSlug: string }> },
) {
  const { slug, docSlug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!docSlug || docSlug.length > 200) {
    return Response.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    // Document detail queries are currently in caso-libra module
    if (slug === 'caso-libra') {
      const { getDocumentBySlug } = await import('@/lib/caso-libra')
      const data = await getDocumentBySlug(docSlug)
      if (!data) {
        return Response.json({ error: 'Document not found' }, { status: 404 })
      }
      return Response.json(data)
    }

    // For other investigations, use the query builder
    const { getQueryBuilder } = await import('@/lib/investigations/query-builder')
    const qb = getQueryBuilder()
    const doc = await qb.getNodeBySlug(slug, 'Document', docSlug)
    if (!doc) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }
    return Response.json({ document: doc.properties, mentionedEntities: [] })
  } catch (error) {
    console.error('Failed to fetch document:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
