import { NextRequest } from 'next/server'
import neo4j from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  try {
    // Query 1: Isolated nodes (no relationships)
    const isolatedResult = await readQuery<{
      id: string
      name: string | null
      label: string
    }>(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE NOT (n)-[]-()
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
       LIMIT 50`,
      { casoSlug },
      (r) => ({
        id: r.get('id') as string,
        name: r.get('name') as string | null,
        label: r.get('label') as string,
      }),
    )

    // Query 2: Low-confidence nodes (bronze tier)
    const lowConfidenceResult = await readQuery<{
      id: string
      name: string | null
      label: string
      confidence_tier: string
      created_at: string | null
    }>(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE n.confidence_tier = 'bronze'
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label,
              n.confidence_tier AS confidence_tier, n.created_at AS created_at
       ORDER BY n.created_at DESC
       LIMIT 50`,
      { casoSlug },
      (r) => ({
        id: r.get('id') as string,
        name: r.get('name') as string | null,
        label: r.get('label') as string,
        confidence_tier: r.get('confidence_tier') as string,
        created_at: r.get('created_at') as string | null,
      }),
    )

    // Query 3: Sparse types - node labels where relationship count < node count
    const sparseResult = await readQuery<{
      label: string
      node_count: number
      rel_count: number
    }>(
      `MATCH (n {caso_slug: $casoSlug})
       WITH labels(n)[0] AS label, count(n) AS node_count
       OPTIONAL MATCH (m {caso_slug: $casoSlug})-[r]-()
       WHERE labels(m)[0] = label
       WITH label, node_count, count(r) AS rel_count
       WHERE rel_count < node_count
       RETURN label, node_count, rel_count
       ORDER BY node_count DESC`,
      { casoSlug },
      (r) => ({
        label: r.get('label') as string,
        node_count: neo4j.isInt(r.get('node_count'))
          ? (r.get('node_count') as { toNumber(): number }).toNumber()
          : (r.get('node_count') as number),
        rel_count: neo4j.isInt(r.get('rel_count'))
          ? (r.get('rel_count') as { toNumber(): number }).toNumber()
          : (r.get('rel_count') as number),
      }),
    )

    const isolatedNodes = isolatedResult.records
    const lowConfidence = lowConfidenceResult.records
    const sparseTypes = sparseResult.records

    // Generate investigative questions based on gaps
    const questions: string[] = []
    if (isolatedNodes.length > 0) {
      questions.push(
        `${isolatedNodes.length} isolated nodes found - what relationships might connect them?`,
      )
    }
    if (lowConfidence.length > 0) {
      questions.push(
        `${lowConfidence.length} bronze-tier nodes need verification - which sources can confirm them?`,
      )
    }
    if (sparseTypes.length > 0) {
      const labels = sparseTypes.map((t) => t.label).join(', ')
      questions.push(
        `Sparse relationship coverage for: ${labels} - are there missing connections?`,
      )
    }

    return Response.json({
      success: true,
      data: {
        isolated_nodes: isolatedNodes,
        low_confidence: lowConfidence,
        sparse_types: sparseTypes,
        questions,
      },
    })
  } catch (error) {
    console.error('[engine/analyze/gaps]', error)
    // All errors in this route stem from DB queries - return 503 so callers
    // can treat it uniformly as "database unavailable / service degraded"
    return Response.json(
      { success: false, error: 'Database unavailable' },
      { status: 503 },
    )
  }
}
