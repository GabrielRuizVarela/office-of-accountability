/**
 * GET /api/politico/[slug]/votes
 *
 * Returns paginated vote history for a politician.
 *
 * Query params:
 *   - page (optional): page number (1+, default 1)
 *   - limit (optional): results per page (1-100, default 20)
 *
 * Responses:
 *   - 200: paginated vote history
 *   - 400: invalid parameters
 *   - 404: politician not found
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { getPoliticianBySlug, getPoliticianVoteHistory, politicianSlugSchema } from '@/lib/graph'

const pageSchema = z.coerce.number().int().min(1).default(1)
const limitSchema = z.coerce.number().int().min(1).max(100).default(20)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params

  const slugResult = politicianSlugSchema.safeParse(slug)
  if (!slugResult.success) {
    return Response.json({ success: false, error: 'Invalid slug format' }, { status: 400 })
  }

  const url = new URL(request.url)
  const pageResult = pageSchema.safeParse(url.searchParams.get('page') ?? undefined)
  const limitResult = limitSchema.safeParse(url.searchParams.get('limit') ?? undefined)

  if (!pageResult.success) {
    return Response.json({ success: false, error: 'Invalid page parameter' }, { status: 400 })
  }
  if (!limitResult.success) {
    return Response.json({ success: false, error: 'Invalid limit parameter' }, { status: 400 })
  }

  try {
    // Verify politician exists
    const politician = await getPoliticianBySlug(slugResult.data)
    if (!politician) {
      return Response.json({ success: false, error: 'Politician not found' }, { status: 404 })
    }

    const data = await getPoliticianVoteHistory(slugResult.data, pageResult.data, limitResult.data)

    return Response.json(
      {
        success: true,
        data,
        meta: {
          slug: slugResult.data,
          name: politician.name,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800',
        },
      },
    )
  } catch (error) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes('connect') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ServiceUnavailable') ||
        error.message.includes('SessionExpired'))

    if (isConnectionError) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }

    throw error
  }
}
