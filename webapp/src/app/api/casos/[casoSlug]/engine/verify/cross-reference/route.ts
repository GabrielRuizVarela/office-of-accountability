import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'

import { writeQuery } from '@/lib/neo4j/client'

const bodySchema = z.object({
  match_type: z.enum(['cuit', 'dni', 'name_fuzzy']),
  threshold: z.number().min(0).max(1).optional(),
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

  const threshold = body.threshold ?? 0.8

  try {
    let cypher: string
    let confidence: number

    if (body.match_type === 'cuit') {
      confidence = 1.0
      cypher = `
        MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
        WHERE a.cuit IS NOT NULL
          AND a.cuit = b.cuit
          AND id(a) < id(b)
          AND NOT (a)-[:SAME_ENTITY]-(b)
        MERGE (a)-[:SAME_ENTITY {confidence: $confidence, match_type: 'cuit'}]->(b)
        RETURN count(*) AS matches_found
      `
    } else if (body.match_type === 'dni') {
      confidence = 0.95
      cypher = `
        MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
        WHERE a.dni IS NOT NULL
          AND a.dni = b.dni
          AND id(a) < id(b)
          AND NOT (a)-[:SAME_ENTITY]-(b)
        MERGE (a)-[:SAME_ENTITY {confidence: $confidence, match_type: 'dni'}]->(b)
        RETURN count(*) AS matches_found
      `
    } else {
      // name_fuzzy — exact name match as approximation
      confidence = 0.9
      cypher = `
        MATCH (a {caso_slug: $casoSlug}), (b {caso_slug: $casoSlug})
        WHERE a.name IS NOT NULL
          AND a.name = b.name
          AND id(a) < id(b)
          AND NOT (a)-[:SAME_ENTITY]-(b)
        MERGE (a)-[:SAME_ENTITY {confidence: $confidence, match_type: 'name_fuzzy'}]->(b)
        RETURN count(*) AS matches_found
      `
    }

    const result = await writeQuery<{ matches_found: number }>(
      cypher,
      { casoSlug, confidence, threshold },
      (r) => ({
        matches_found: neo4j.isInt(r.get('matches_found'))
          ? (r.get('matches_found') as { toNumber(): number }).toNumber()
          : (r.get('matches_found') as number),
      }),
    )

    const matchesFound = result.records[0]?.matches_found ?? 0

    return Response.json({
      success: true,
      data: {
        match_type: body.match_type,
        matches_found: matchesFound,
      },
    })
  } catch (error) {
    console.error('[engine/verify/cross-reference]', error)
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
      { success: false, error: 'Failed to run cross-reference pass' },
      { status: 500 },
    )
  }
}
