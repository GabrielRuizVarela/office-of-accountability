/**
 * API route: GET /api/caso/[slug]/person/[actorSlug]
 * Returns person data with graph, events, and documents for a given investigation.
 */

import { getClientConfig } from '@/lib/investigations/registry'
import { getPersonBySlug as getLibraPersonBySlug } from '@/lib/caso-libra'
import { getPersonBySlug as getEpsteinPersonBySlug } from '@/lib/caso-epstein'

export async function GET(
  _request: Request,
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
    return Response.json(
      { success: false, error: 'Invalid slug' },
      { status: 400 },
    )
  }

  const getPersonFn =
    slug === 'caso-libra' ? getLibraPersonBySlug :
    slug === 'caso-epstein' ? getEpsteinPersonBySlug :
    null

  if (!getPersonFn) {
    return Response.json(
      { success: false, error: 'Person lookup not available for this investigation' },
      { status: 404 },
    )
  }

  try {
    const data = await getPersonFn(actorSlug)

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
