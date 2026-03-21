/**
 * API route: GET /api/caso/[slug]/person/[actorSlug]
 * Returns person data with graph, events, and documents.
 */

import { NextRequest } from 'next/server'

import { getClientConfig } from '@/lib/investigations/registry'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; actorSlug: string }> },
) {
  const { slug, actorSlug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!actorSlug || actorSlug.length > 200) {
    return Response.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    // Person detail queries are currently in caso-libra module
    // (uses generic labels + caso_slug, so works for caso-libra data)
    if (slug === 'caso-libra') {
      const { getPersonBySlug } = await import('@/lib/caso-libra')
      const data = await getPersonBySlug(actorSlug)
      if (!data) {
        return Response.json({ error: 'Person not found' }, { status: 404 })
      }
      return Response.json(data)
    }

    // For other investigations, use the query builder for basic node lookup
    const { getQueryBuilder } = await import('@/lib/investigations/query-builder')
    const qb = getQueryBuilder()
    const person = await qb.getNodeBySlug(slug, 'Person', actorSlug)
    if (!person) {
      return Response.json({ error: 'Person not found' }, { status: 404 })
    }
    const graph = await qb.getNodeConnections(slug, person.id)
    return Response.json({ person: person.properties, graph, events: [], documents: [] })
  } catch (error) {
    console.error('Failed to fetch person:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
