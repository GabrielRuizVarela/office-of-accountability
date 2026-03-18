/**
 * GET /api/graph/edge-provenance
 *
 * Returns provenance metadata for a specific relationship between two nodes.
 *
 * Query params:
 *   - source: source node ID
 *   - target: target node ID
 *   - type: relationship type (e.g. CAST_VOTE, REPRESENTS)
 *
 * Responses:
 *   - 200: { success: true, data: ProvenanceData }
 *   - 400: invalid parameters
 *   - 404: relationship not found
 *   - 503: Neo4j unreachable
 */

import { z } from 'zod/v4'

import { getEdgeProvenance } from '@/lib/graph'

const querySchema = z.object({
  source: z.string().min(1).max(200),
  target: z.string().min(1).max(200),
  type: z.string().min(1).max(50).regex(/^[A-Z_]+$/),
})

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const rawParams = {
    source: url.searchParams.get('source') ?? '',
    target: url.searchParams.get('target') ?? '',
    type: url.searchParams.get('type') ?? '',
  }

  const parseResult = querySchema.safeParse(rawParams)
  if (!parseResult.success) {
    return Response.json(
      { success: false, error: 'Invalid parameters', details: parseResult.error.issues },
      { status: 400 },
    )
  }

  const { source, target, type } = parseResult.data

  try {
    const provenance = await getEdgeProvenance(source, target, type)

    if (!provenance) {
      return Response.json(
        { success: false, error: 'Relationship not found' },
        { status: 404 },
      )
    }

    return Response.json({ success: true, data: provenance })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('ServiceUnavailable') || message.includes('could not perform discovery')) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    console.error('Edge provenance query failed:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
