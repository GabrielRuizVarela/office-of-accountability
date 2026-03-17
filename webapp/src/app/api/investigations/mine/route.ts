/**
 * GET /api/investigations/mine
 *
 * Returns the authenticated user's investigations (all statuses).
 * Supports pagination via page/limit query params.
 *
 * Responses:
 *   200: paginated list of user's investigations
 *   400: invalid query params
 *   401: not authenticated
 *   503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { listMyInvestigations } from '@/lib/investigation'
import { getSession } from '@/lib/auth/session'

const pageSchema = z.coerce.number().int().min(1).default(1)
const limitSchema = z.coerce.number().int().min(1).max(50).default(12)

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('connect') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ServiceUnavailable') ||
      error.message.includes('SessionExpired'))
  )
}

export async function GET(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Authentication required' }, { status: 401 })
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
    const result = await listMyInvestigations(session.user.id, pageResult.data, limitResult.data)

    return Response.json({
      success: true,
      data: result.items,
      meta: {
        total: result.totalCount,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    })
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}
