/**
 * Centrality algorithm — M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for degree centrality within a caso_slug namespace,
 * then creates hypothesis Proposals for high-centrality nodes.
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
