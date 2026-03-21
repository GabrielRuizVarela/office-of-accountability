/**
 * API route: GET /api/caso/[slug]/person/[actorSlug]
 * Returns person data with graph, events, and documents.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getPersonBySlug as getLibraPersonBySlug } from '@/lib/caso-libra'
import { getPersonBySlug as getFinpolPersonBySlug } from '@/lib/caso-finanzas-politicas'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; actorSlug: string }> },
): Promise<Response> {
  const { slug, actorSlug } = await params

  const config = getClientConfig(slug)
  if (!config) {
    return Response.json(
      { success: false, error: 'Unknown investigation' },
      { status: 404 },
    )
  }

  if (!actorSlug || actorSlug.length > 200) {
    return Response.json(
      { success: false, error: 'Invalid slug' },
      { status: 400 },
    )
  }

  try {
    let data
    switch (slug) {
      case 'caso-libra':
        data = await getLibraPersonBySlug(slug, actorSlug)
        break
      case 'caso-finanzas-politicas':
        data = await getFinpolPersonBySlug(slug, actorSlug)
        break
      default:
        data = await getLibraPersonBySlug(slug, actorSlug)
    }

    if (!data) {
      return Response.json(
        { success: false, error: 'Person not found' },
        { status: 404 },
      )
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
      { success: false, error: 'Failed to load person data' },
      { status: 500 },
    )
  }
}
