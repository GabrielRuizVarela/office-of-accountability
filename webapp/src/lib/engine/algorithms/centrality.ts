/**
 * Centrality algorithm - M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for degree centrality within a caso_slug namespace,
 * then creates hypothesis Proposals for high-centrality nodes.
 *
 * Also exports standalone query functions (degreeCentrality, betweennessCentrality)
 * for use from API routes and analysis endpoints.
 */

import neo4j from 'neo4j-driver-lite'

import type { AlgorithmKind } from './types'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'
import type { Algorithm, AlgorithmContext, AlgorithmResult } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOP_N = 20

// ---------------------------------------------------------------------------
// Standalone data types
// ---------------------------------------------------------------------------

export interface CentralityResult {
  id: string
  name: string
  label: string
  degree: number
}

export interface BetweennessResult {
  id: string
  name: string
  label: string
  betweenness: number
}

// ---------------------------------------------------------------------------
// Standalone query functions
// ---------------------------------------------------------------------------

/**
 * Return the top-N nodes by degree centrality within a caso_slug namespace.
 */
export async function degreeCentrality(
  casoSlug: string,
  limit = 50,
): Promise<CentralityResult[]> {
  const result = await readQuery<CentralityResult>(
    `MATCH (n {caso_slug: $casoSlug})-[r]-()
     RETURN n.id AS id, n.name AS name, labels(n)[0] AS label, count(r) AS degree
     ORDER BY degree DESC
     LIMIT $limit`,
    { casoSlug, limit: neo4j.int(limit) },
    (record) => ({
      id: record.get('id') as string,
      name: record.get('name') as string,
      label: record.get('label') as string,
      degree: neo4j.isInt(record.get('degree'))
        ? (record.get('degree') as { toNumber(): number }).toNumber()
        : (record.get('degree') as number),
    }),
  )
  return [...result.records]
}

/**
 * Approximate betweenness centrality via random sampling.
 *
 * For each of `sampleSize` random source nodes, BFS/shortest-path to up to
 * 10 random targets (max depth 6). Counts how many times each intermediary
 * node appears on a shortest path and returns the top `limit` nodes.
 */
export async function betweennessCentrality(
  casoSlug: string,
  sampleSize = 50,
  limit = 30,
): Promise<BetweennessResult[]> {
  // Step 1: Fetch a random sample of source nodes
  const sampleResult = await readQuery<{ id: string; name: string; label: string }>(
    `MATCH (n {caso_slug: $casoSlug})
     WHERE n.id IS NOT NULL
     RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
     ORDER BY rand()
     LIMIT $sampleSize`,
    { casoSlug, sampleSize: neo4j.int(sampleSize) },
    (record) => ({
      id: record.get('id') as string,
      name: record.get('name') as string,
      label: record.get('label') as string,
    }),
  )

  const sources = sampleResult.records
  if (sources.length === 0) return []

  // Step 2: For each source, find shortest paths to 10 random targets and count intermediaries
  const counts = new Map<string, number>()
  const nodeInfo = new Map<string, { name: string; label: string }>()

  for (const source of sources) {
    const pathResult = await readQuery<{ intermediary: string; intermediaryName: string; intermediaryLabel: string }>(
      `MATCH (src {caso_slug: $casoSlug, id: $sourceId})
       MATCH (tgt {caso_slug: $casoSlug})
       WHERE tgt.id IS NOT NULL AND tgt.id <> $sourceId
       WITH src, tgt ORDER BY rand() LIMIT 10
       MATCH p = shortestPath((src)-[*..6]-(tgt))
       UNWIND nodes(p)[1..-1] AS intermediary
       RETURN intermediary.id AS intermediary,
              intermediary.name AS intermediaryName,
              labels(intermediary)[0] AS intermediaryLabel`,
      { casoSlug, sourceId: source.id },
      (record) => ({
        intermediary: record.get('intermediary') as string,
        intermediaryName: record.get('intermediaryName') as string,
        intermediaryLabel: record.get('intermediaryLabel') as string,
      }),
    ).catch(() => ({ records: [] as { intermediary: string; intermediaryName: string; intermediaryLabel: string }[] }))

    for (const row of pathResult.records) {
      if (!row.intermediary) continue
      counts.set(row.intermediary, (counts.get(row.intermediary) ?? 0) + 1)
      if (!nodeInfo.has(row.intermediary)) {
        nodeInfo.set(row.intermediary, { name: row.intermediaryName, label: row.intermediaryLabel })
      }
    }
  }

  // Step 3: Sort and return top nodes
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, betweenness]) => {
      const info = nodeInfo.get(id) ?? { name: id, label: 'Unknown' }
      return { id, name: info.name, label: info.label, betweenness }
    })

  return sorted
}

// ---------------------------------------------------------------------------
// CentralityAlgorithm
// ---------------------------------------------------------------------------

interface DegreeCentralityRow {
  nodeId: string
  name: string
  label: string
  degree: number
}

export class CentralityAlgorithm implements Algorithm {
  kind: AlgorithmKind = 'centrality'

  async run(context: AlgorithmContext): Promise<AlgorithmResult> {
    const errors: string[] = []
    let hypothesesCreated = 0
    let nodesAnalyzed = 0

    // Step 1: Query degree centrality
    let rows: readonly DegreeCentralityRow[] = []
    try {
      const result = await readQuery<DegreeCentralityRow>(
        `MATCH (n {caso_slug: $casoSlug})
         OPTIONAL MATCH (n)-[r]-()
         WITH n, count(r) AS degree
         ORDER BY degree DESC
         LIMIT $limit
         RETURN n.id AS nodeId, n.name AS name, labels(n)[0] AS label, degree`,
        { casoSlug: context.casoSlug, limit: neo4j.int(TOP_N) },
        (record) => ({
          nodeId: record.get('nodeId') as string,
          name: record.get('name') as string,
          label: record.get('label') as string,
          degree: neo4j.isInt(record.get('degree'))
            ? (record.get('degree') as { toNumber(): number }).toNumber()
            : (record.get('degree') as number),
        }),
      )
      rows = result.records
      nodesAnalyzed = rows.length
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`Degree centrality query: ${message}`)
    }

    if (rows.length === 0) {
      return { hypotheses_created: 0, nodes_analyzed: nodesAnalyzed, errors }
    }

    // Step 2: Compute max degree for confidence scaling
    const maxDegree = rows[0].degree

    // Step 3: Create hypothesis Proposals for high-centrality nodes
    for (const row of rows) {
      if (row.degree < 1) continue

      // Scale confidence 0.3–0.7 based on relative degree
      const confidence = maxDegree > 0
        ? 0.3 + 0.4 * (row.degree / maxDegree)
        : 0.3

      try {
        await createProposal({
          pipeline_state_id: context.pipelineStateId,
          stage_id: context.stageId,
          type: 'hypothesis',
          payload: {
            algorithm: 'degree_centrality',
            nodeId: row.nodeId,
            name: row.name,
            label: row.label,
            degree: row.degree,
            description: `High degree centrality node in investigation graph`,
          },
          confidence,
          reasoning: `Node "${row.name}" has ${row.degree} connections (top ${TOP_N} in investigation), suggesting central role`,
        })
        hypothesesCreated++
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Proposal for node ${row.nodeId}: ${message}`)
      }
    }

    return {
      hypotheses_created: hypothesesCreated,
      nodes_analyzed: nodesAnalyzed,
      errors,
    }
  }
}
