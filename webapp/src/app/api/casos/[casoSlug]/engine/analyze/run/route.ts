import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

const bodySchema = z.object({
  type: z.enum(['procurement', 'ownership', 'connections', 'temporal', 'centrality']),
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
      // COUNT relationships per node, rank by degree
      const result = await readQuery<{
        id: string
        name: string | null
        label: string
        degree: number
      }>(
        `MATCH (n {caso_slug: $casoSlug})
         WITH n, labels(n)[0] AS label, size([(n)-[]-() | 1]) AS degree
         ORDER BY degree DESC
         LIMIT 50
         RETURN n.id AS id, n.name AS name, label, degree`,
        { casoSlug },
        (r) => ({
          id: r.get('id') as string,
          name: r.get('name') as string | null,
          label: r.get('label') as string,
          degree: neo4j.isInt(r.get('degree'))
            ? (r.get('degree') as { toNumber(): number }).toNumber()
            : (r.get('degree') as number),
        }),
      )

      return Response.json({
        success: true,
        data: {
          type: body.type,
          results: result.records,
        },
      })
    }

    if (body.type === 'temporal') {
      // Find Event pairs within 7-day windows
      const result = await readQuery<{
        e1_id: string
        e1_name: string | null
        e1_date: string | null
        e2_id: string
        e2_name: string | null
        e2_date: string | null
        days_apart: number
      }>(
        `MATCH (e1:Event {caso_slug: $casoSlug}), (e2:Event {caso_slug: $casoSlug})
         WHERE e1.date IS NOT NULL
           AND e2.date IS NOT NULL
           AND id(e1) < id(e2)
           AND abs(duration.between(date(e1.date), date(e2.date)).days) <= 7
         RETURN e1.id AS e1_id, e1.name AS e1_name, e1.date AS e1_date,
                e2.id AS e2_id, e2.name AS e2_name, e2.date AS e2_date,
                abs(duration.between(date(e1.date), date(e2.date)).days) AS days_apart
         LIMIT 30`,
        { casoSlug },
        (r) => ({
          e1_id: r.get('e1_id') as string,
          e1_name: r.get('e1_name') as string | null,
          e1_date: r.get('e1_date') as string | null,
          e2_id: r.get('e2_id') as string,
          e2_name: r.get('e2_name') as string | null,
          e2_date: r.get('e2_date') as string | null,
          days_apart: neo4j.isInt(r.get('days_apart'))
            ? (r.get('days_apart') as { toNumber(): number }).toNumber()
            : (r.get('days_apart') as number),
        }),
      )

      return Response.json({
        success: true,
        data: {
          type: body.type,
          co_occurrences: result.records,
        },
      })
    }

    // For procurement, ownership, connections — return graph summary
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
