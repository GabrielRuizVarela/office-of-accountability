/**
 * GET /api/graph/query
 *
 * Structured graph queries with filters for node type, date range,
 * jurisdiction, and relationship type. Returns matching nodes and
 * their inter-connections in { nodes, links } format.
 *
 * Query params:
 *   - label (optional): node type filter (Politician, Legislation, Vote, Investigation)
 *   - dateFrom (optional): inclusive start date (YYYY-MM-DD)
 *   - dateTo (optional): inclusive end date (YYYY-MM-DD)
 *   - jurisdiction (optional): jurisdiction filter (nacional, provincial, municipal)
 *   - relType (optional): filter to nodes with this relationship type
 *   - limit (optional): max nodes to return (1-200, default 50)
 *   - cursor (optional): opaque cursor from previous response's nextCursor
 *
 * Responses:
 *   - 200: { success, data: { nodes, links }, meta: { totalCount, limit, nextCursor } }
 *   - 400: invalid parameters
 *   - 504: query timed out
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { queryNodes } from '@/lib/graph'

const labelSchema = z
  .enum(['Politician', 'Legislation', 'Vote', 'Investigation'])
  .optional()

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .optional()

const jurisdictionSchema = z
  .enum(['nacional', 'provincial', 'municipal'])
  .optional()

const relTypeSchema = z
  .enum([
    'CAST_VOTE',
    'REPRESENTS',
    'AUTHORED',
    'SPONSORED',
    'REFERENCES',
    'MEMBER_OF',
    'DONATED_TO',
  ])
  .optional()

const limitSchema = z.coerce.number().int().min(1).max(200).default(50)

const cursorSchema = z.string().min(1).max(500).optional()

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)

  const labelResult = labelSchema.safeParse(url.searchParams.get('label') ?? undefined)
  if (!labelResult.success) {
    return Response.json(
      {
        success: false,
        error: 'Invalid label (must be Politician, Legislation, Vote, or Investigation)',
      },
      { status: 400 },
    )
  }

  const dateFromResult = dateSchema.safeParse(url.searchParams.get('dateFrom') ?? undefined)
  if (!dateFromResult.success) {
    return Response.json(
      { success: false, error: 'Invalid dateFrom (must be YYYY-MM-DD)' },
      { status: 400 },
    )
  }

  const dateToResult = dateSchema.safeParse(url.searchParams.get('dateTo') ?? undefined)
  if (!dateToResult.success) {
    return Response.json(
      { success: false, error: 'Invalid dateTo (must be YYYY-MM-DD)' },
      { status: 400 },
    )
  }

  const jurisdictionResult = jurisdictionSchema.safeParse(
    url.searchParams.get('jurisdiction') ?? undefined,
  )
  if (!jurisdictionResult.success) {
    return Response.json(
      {
        success: false,
        error: 'Invalid jurisdiction (must be nacional, provincial, or municipal)',
      },
      { status: 400 },
    )
  }

  const relTypeResult = relTypeSchema.safeParse(url.searchParams.get('relType') ?? undefined)
  if (!relTypeResult.success) {
    return Response.json(
      { success: false, error: 'Invalid relType' },
      { status: 400 },
    )
  }

  const limitResult = limitSchema.safeParse(url.searchParams.get('limit') ?? undefined)
  if (!limitResult.success) {
    return Response.json(
      { success: false, error: 'Invalid limit (must be integer 1-200)' },
      { status: 400 },
    )
  }

  const cursorResult = cursorSchema.safeParse(url.searchParams.get('cursor') ?? undefined)
  if (!cursorResult.success) {
    return Response.json(
      { success: false, error: 'Invalid cursor parameter' },
      { status: 400 },
    )
  }

  // Require at least one filter to prevent unbounded queries
  const hasFilter =
    labelResult.data !== undefined ||
    dateFromResult.data !== undefined ||
    dateToResult.data !== undefined ||
    jurisdictionResult.data !== undefined ||
    relTypeResult.data !== undefined

  if (!hasFilter) {
    return Response.json(
      {
        success: false,
        error: 'At least one filter is required (label, dateFrom, dateTo, jurisdiction, or relType)',
      },
      { status: 400 },
    )
  }

  try {
    const result = await queryNodes(
      {
        label: labelResult.data,
        dateFrom: dateFromResult.data,
        dateTo: dateToResult.data,
        jurisdiction: jurisdictionResult.data,
        relType: relTypeResult.data,
      },
      limitResult.data,
      cursorResult.data,
    )

    return Response.json({
      success: true,
      data: result.data,
      meta: {
        totalCount: result.totalCount,
        limit: limitResult.data,
        nextCursor: result.nextCursor,
        nodeCount: result.data.nodes.length,
        linkCount: result.data.links.length,
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
