/**
 * GET /api/graph/expand/[id]
 *
 * Expands a node's neighborhood to a configurable depth (1-3 hops).
 * Returns the full sub-graph in { nodes, links } format for react-force-graph-2d.
 *
 * Query params:
 *   - depth (optional): number of hops (1-3, default 1)
 *   - limit (optional): max nodes to return (1-500, default 200)
 *
 * Responses:
 *   - 200: { success: true, data: { nodes, links }, meta }
 *   - 400: invalid parameters
 *   - 404: node not found
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { expandNodeNeighborhood } from '@/lib/graph'

const idSchema = z
  .string()
  .min(1)
  .max(500)
  .regex(
    /^[\w\-.:]+$/,
    'ID must contain only alphanumeric characters, hyphens, underscores, dots, and colons',
  )

const depthSchema = z.coerce.number().int().min(1).max(3).default(1)

const limitSchema = z.coerce.number().int().min(1).max(500).default(200)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params

  const idResult = idSchema.safeParse(id)
  if (!idResult.success) {
    return Response.json({ success: false, error: 'Invalid node ID format' }, { status: 400 })
  }

  const url = new URL(request.url)

  const depthParam = url.searchParams.get('depth')
  const depthResult = depthSchema.safeParse(depthParam ?? undefined)
  if (!depthResult.success) {
    return Response.json(
      { success: false, error: 'Invalid depth parameter (must be integer 1-3)' },
      { status: 400 },
    )
  }

  const limitParam = url.searchParams.get('limit')
  const limitResult = limitSchema.safeParse(limitParam ?? undefined)
  if (!limitResult.success) {
    return Response.json(
      { success: false, error: 'Invalid limit parameter (must be integer 1-500)' },
      { status: 400 },
    )
  }

  try {
    const data = await expandNodeNeighborhood(idResult.data, depthResult.data, limitResult.data)

    if (data === null) {
      return Response.json({ success: false, error: 'Node not found' }, { status: 404 })
    }

    return Response.json({
      success: true,
      data,
      meta: {
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
        depth: depthResult.data,
        limit: limitResult.data,
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
