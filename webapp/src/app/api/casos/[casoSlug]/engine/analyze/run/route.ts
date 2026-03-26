import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'
import {
  degreeCentrality,
  detectCommunities,
  findTemporalClusters,
  detectAnomalies,
} from '@/lib/engine/algorithms'

const bodySchema = z.object({
  type: z.enum([
    'procurement',
    'ownership',
    'connections',
    'temporal',
    'centrality',
    'community',
    'anomaly',
  ]),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    const raw = await request.json()
    body = bodySchema.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { success: false, error: `Invalid request body: ${message}` },
      { status: 400 },
    )
  }

  try {
    if (body.type === 'centrality') {
      const results = await degreeCentrality(casoSlug)
      return Response.json({ success: true, data: { type: 'centrality', results } })
    }

    if (body.type === 'community') {
      const communities = await detectCommunities(casoSlug)
      return Response.json({ success: true, data: { type: 'community', communities } })
    }

    if (body.type === 'temporal') {
      const clusters = await findTemporalClusters(casoSlug)
      return Response.json({ success: true, data: { type: 'temporal', clusters } })
    }

    if (body.type === 'anomaly') {
      const anomalies = await detectAnomalies(casoSlug)
      return Response.json({ success: true, data: { type: 'anomaly', anomalies } })
    }

    // For procurement, ownership, connections - return graph summary
    const summaryResult = await readQuery<{ label: string; count: number }>(
      `MATCH (n {caso_slug: $casoSlug})
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY count DESC`,
      { casoSlug },
      (r) => ({
        label: r.get('label') as string,
        count: neo4j.isInt(r.get('count'))
          ? (r.get('count') as { toNumber(): number }).toNumber()
          : (r.get('count') as number),
      }),
    )

    return Response.json({
      success: true,
      data: {
        type: body.type,
        graph_summary: {
          node_counts_by_label: summaryResult.records,
          message: `${body.type} analysis requires LLM processing via graph.query`,
        },
      },
    })
  } catch (error) {
    console.error('[engine/analyze/run]', error)
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
      { success: false, error: 'Failed to run graph analysis' },
      { status: 500 },
    )
  }
}
