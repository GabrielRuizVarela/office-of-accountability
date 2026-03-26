/**
 * /api/investigations
 *
 * POST - Create a new investigation (auth required)
 * GET  - List published investigations (public)
 *
 * Responses:
 *   POST 201: created investigation
 *   POST 400: invalid input
 *   POST 401: not authenticated
 *   GET  200: paginated list
 *   GET  400: invalid query params
 *   503: Neo4j unreachable
 */

import {
  createInvestigationSchema,
  listInvestigationsSchema,
  createInvestigation,
  listInvestigations,
} from '@/lib/investigation'
import { getSession } from '@/lib/auth/session'
import {
  sanitizeTipTapBody,
  extractEmbeddedNodeIds,
  validateEmbeddedNodeIds,
} from '@/lib/investigation/sanitize'

function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('connect') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ServiceUnavailable') ||
      error.message.includes('SessionExpired'))
  )
}

export async function POST(request: Request): Promise<Response> {
  const session = await getSession()
  if (!session) {
    return Response.json({ success: false, error: 'Authentication required' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createInvestigationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Invalid input', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    // Sanitize TipTap body - strip dangerous HTML, event handlers, javascript: URIs
    let sanitizedBody: string
    try {
      sanitizedBody = sanitizeTipTapBody(parsed.data.body)
    } catch {
      return Response.json(
        { success: false, error: 'Invalid body format: must be valid TipTap JSON' },
        { status: 400 },
      )
    }

    // Extract and validate embedded node IDs from the body content
    const embeddedIds = extractEmbeddedNodeIds(sanitizedBody)
    if (embeddedIds.length > 0) {
      const missing = await validateEmbeddedNodeIds(embeddedIds)
      if (missing.length > 0) {
        return Response.json(
          {
            success: false,
            error: 'Embedded nodes not found',
            details: missing,
          },
          { status: 400 },
        )
      }
    }

    // Use sanitized body and validated embedded IDs as referenced_node_ids
    const input = {
      ...parsed.data,
      body: sanitizedBody,
      referenced_node_ids: embeddedIds.length > 0 ? [...embeddedIds] : (parsed.data.referenced_node_ids ?? []),
    }

    const result = await createInvestigation(input, session.user.id)

    return Response.json(
      {
        success: true,
        data: result,
      },
      { status: 201 },
    )
  } catch (error) {
    if (isConnectionError(error)) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    throw error
  }
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const params = {
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    tag: url.searchParams.get('tag') ?? undefined,
  }

  const parsed = listInvestigationsSchema.safeParse(params)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Invalid query parameters', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const result = await listInvestigations(parsed.data.page, parsed.data.limit, parsed.data.tag)

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
