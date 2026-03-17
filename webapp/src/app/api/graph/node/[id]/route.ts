/**
 * GET /api/graph/node/[id]
 *
 * Returns the neighborhood graph (nodes + links) for a given node ID.
 * The ID can be an application-level `id`, `slug`, or `acta_id`.
 *
 * Query params:
 *   - limit (optional): max neighbors to return (1-200, default 50)
 *
 * Responses:
 *   - 200: { nodes, links } GraphData JSON
 *   - 400: invalid parameters
 *   - 404: node not found
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { getNodeNeighborhood } from '@/lib/graph'
import { nodeIdSchema } from '@/lib/graph/validation'

const limitSchema = z.coerce.number().int().min(1).max(200).default(50)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params

  const idResult = nodeIdSchema.safeParse(id)
  if (!idResult.success) {
    return Response.json({ success: false, error: 'Invalid node ID format' }, { status: 400 })
  }

  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')
  const limitResult = limitSchema.safeParse(limitParam ?? undefined)

  if (!limitResult.success) {
    return Response.json(
      { success: false, error: 'Invalid limit parameter (must be integer 1-200)' },
      { status: 400 },
    )
  }

  try {
    const data = await getNodeNeighborhood(idResult.data, limitResult.data)

    if (data === null) {
      return Response.json({ success: false, error: 'Node not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data,
      meta: {
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
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
