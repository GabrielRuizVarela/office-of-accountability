/**
 * GET /api/graph/search
 *
 * Searches nodes by query string across fulltext indexes.
 * Supports optional label filtering.
 *
 * Query params:
 *   - q (required): search query string (1-200 chars)
 *   - limit (optional): max results to return (1-100, default 20)
 *   - label (optional): filter by node label (Politician, Legislation, Investigation)
 *
 * Responses:
 *   - 200: { success, data: { nodes, links }, meta: { totalCount } }
 *   - 400: invalid or missing parameters
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { searchNodes, searchNodesByLabel } from '@/lib/graph'

const querySchema = z.string().min(1, 'Query must not be empty').max(200)

const limitSchema = z.coerce.number().int().min(1).max(100).default(20)

const labelSchema = z.enum(['Politician', 'Legislation', 'Investigation']).optional()

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)

  const q = url.searchParams.get('q')
  const queryResult = querySchema.safeParse(q)

  if (!queryResult.success) {
    return Response.json(
      { success: false, error: 'Missing or invalid query parameter "q" (1-200 characters)' },
      { status: 400 },
    )
  }

  const limitParam = url.searchParams.get('limit')
  const limitResult = limitSchema.safeParse(limitParam ?? undefined)

  if (!limitResult.success) {
    return Response.json(
      { success: false, error: 'Invalid limit parameter (must be integer 1-100)' },
      { status: 400 },
    )
  }

  const labelParam = url.searchParams.get('label')
  const labelResult = labelSchema.safeParse(labelParam ?? undefined)

  if (!labelResult.success) {
    return Response.json(
      {
        success: false,
        error: 'Invalid label parameter (must be Politician, Legislation, or Investigation)',
      },
      { status: 400 },
    )
  }

  try {
    const result = labelResult.data
      ? await searchNodesByLabel(queryResult.data, labelResult.data, limitResult.data)
      : await searchNodes(queryResult.data, limitResult.data)

    return Response.json({
      success: true,
      data: result.data,
      meta: {
        totalCount: result.totalCount,
      },
    })
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
