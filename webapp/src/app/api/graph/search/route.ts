/**
 * GET /api/graph/search
 *
 * Searches nodes by query string across fulltext indexes.
 * Supports optional label filtering and cursor-based pagination.
 *
 * Query params:
 *   - q (required): search query string (1-200 chars)
 *   - limit (optional): max results to return (1-100, default 20)
 *   - label (optional): filter by node label (Politician, Legislation, Investigation)
 *   - cursor (optional): opaque cursor from previous response's nextCursor
 *
 * Responses:
 *   - 200: { success, data: { nodes, links }, meta: { totalCount, nextCursor } }
 *   - 400: invalid or missing parameters
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { searchNodes, searchNodesByLabel } from '@/lib/graph'

const querySchema = z.string().min(1, 'Query must not be empty').max(200)

const limitSchema = z.coerce.number().int().min(1).max(100).default(20)

const labelSchema = z.enum(['Politician', 'Legislation', 'Investigation']).optional()

const cursorSchema = z.string().min(1).max(500).optional()

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

  const cursorParam = url.searchParams.get('cursor')
  const cursorResult = cursorSchema.safeParse(cursorParam ?? undefined)

  if (!cursorResult.success) {
    return Response.json(
      { success: false, error: 'Invalid cursor parameter' },
      { status: 400 },
    )
  }

  try {
    const result = labelResult.data
      ? await searchNodesByLabel(queryResult.data, labelResult.data, limitResult.data, cursorResult.data)
      : await searchNodes(queryResult.data, limitResult.data, cursorResult.data)

    return Response.json({
      success: true,
      data: result.data,
      meta: {
        totalCount: result.totalCount,
        nextCursor: result.nextCursor,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message

      const isTimeout =
        msg.includes('transaction has been terminated') ||
        msg.includes('Transaction timed out') ||
        msg.includes('LockClient') ||
        msg.includes('TransactionTimedOut')

      if (isTimeout) {
        return Response.json({ success: false, error: 'Query timed out' }, { status: 504 })
      }

      const isConnectionError =
        msg.includes('connect') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ServiceUnavailable') ||
        msg.includes('SessionExpired')

      if (isConnectionError) {
        return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
      }
    }

    throw error
  }
}
