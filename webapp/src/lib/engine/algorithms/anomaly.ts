/**
 * Anomaly detection algorithm - M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for degree distribution within a caso_slug namespace,
 * computes mean + stddev, and flags statistically anomalous nodes
 * (high-degree outliers and isolated nodes) as hypothesis Proposals.
 *
 * Also exports a standalone detectAnomalies() function for API routes.
 */

import neo4j from 'neo4j-driver-lite'

import type { AlgorithmKind } from './types'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'
import type { Algorithm, AlgorithmContext, AlgorithmResult } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Nodes with degree > mean + ZSCORE_THRESHOLD * stddev are flagged */
const ZSCORE_THRESHOLD = 2

// ---------------------------------------------------------------------------
// Standalone data types
// ---------------------------------------------------------------------------

export interface Anomaly {
  type: 'high_degree' | 'isolated_cluster' | 'temporal_gap' | 'tier_mismatch'
  description: string
  node_ids: string[]
  severity: number // 0–1
}

// ---------------------------------------------------------------------------
// Standalone query function
// ---------------------------------------------------------------------------

/**
 * Detect anomalies in the investigation graph.
 *
 * - high_degree: nodes with degree > mean + 3*stddev
 * - tier_mismatch: bronze nodes with > 5 connections (should be promoted)
 *
 * Returns Anomaly[] sorted by severity descending.
 */
export async function detectAnomalies(casoSlug: string): Promise<Anomaly[]> {
  // Query degree for all nodes
  const degreeResult = await readQuery<{
    id: string
    name: string
    label: string
    tier: string
    degree: number
  }>(
    `MATCH (n {caso_slug: $casoSlug})
     OPTIONAL MATCH (n)-[r]-()
     WITH n, count(r) AS degree
     RETURN n.id AS id,
            n.name AS name,
            labels(n)[0] AS label,
            coalesce(n.confidence_tier, 'bronze') AS tier,
            degree`,
    { casoSlug },
    (record) => ({
      id: record.get('id') as string,
      name: record.get('name') as string,
      label: record.get('label') as string,
      tier: record.get('tier') as string,
      degree: neo4j.isInt(record.get('degree'))
        ? (record.get('degree') as { toNumber(): number }).toNumber()
        : (record.get('degree') as number),
    }),
  )

  const rows = degreeResult.records
  if (rows.length === 0) return []

  const anomalies: Anomaly[] = []

  // Compute mean and stddev
  const degrees = rows.map((r) => r.degree)
  const mean = degrees.reduce((sum, d) => sum + d, 0) / degrees.length
  const variance = degrees.reduce((sum, d) => sum + (d - mean) ** 2, 0) / degrees.length
  const stddev = Math.sqrt(variance)
  const highDegreeThreshold = mean + 3 * stddev

  // High-degree outliers
  if (stddev > 0) {
    const outliers = rows.filter((r) => r.degree > highDegreeThreshold)
    for (const node of outliers) {
      const zScore = (node.degree - mean) / stddev
      const severity = Math.min(1, (zScore - 3) / 3 + 0.5) // 0.5 at z=3, 1 at z=6
      anomalies.push({
        type: 'high_degree',
        description: `"${node.name}" (${node.label}) has ${node.degree} connections - ${zScore.toFixed(1)}σ above mean`,
        node_ids: [node.id],
        severity: Math.max(0, Math.min(1, severity)),
      })
    }
  }

  // Tier mismatch: bronze nodes with > 5 connections
  const tierMismatches = rows.filter((r) => r.tier === 'bronze' && r.degree > 5)
  for (const node of tierMismatches) {
    const severity = Math.min(1, node.degree / 20) // scale 0–1 for degree 0–20
    anomalies.push({
      type: 'tier_mismatch',
      description: `Bronze node "${node.name}" (${node.label}) has ${node.degree} connections and should be promoted`,
      node_ids: [node.id],
      severity,
    })
  }

  // Sort by severity descending
  anomalies.sort((a, b) => b.severity - a.severity)

  return anomalies
}

// ---------------------------------------------------------------------------
// AnomalyAlgorithm
// ---------------------------------------------------------------------------

interface DegreeRow {
  nodeId: string
  name: string
  label: string
  degree: number
}

export class AnomalyAlgorithm implements Algorithm {
  kind: AlgorithmKind = 'anomaly'

  async run(context: AlgorithmContext): Promise<AlgorithmResult> {
    const errors: string[] = []
    let hypothesesCreated = 0
    let nodesAnalyzed = 0

    // Step 1: Query degree distribution for all nodes in namespace
    let rows: readonly DegreeRow[] = []
    try {
      const result = await readQuery<DegreeRow>(
        `MATCH (n {caso_slug: $casoSlug})
         OPTIONAL MATCH (n)-[r]-()
         WITH n, count(r) AS degree
         RETURN n.id AS nodeId, n.name AS name, labels(n)[0] AS label, degree`,
        { casoSlug: context.casoSlug },
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
      errors.push(`Degree distribution query: ${message}`)
    }

    if (rows.length === 0) {
      return { hypotheses_created: 0, nodes_analyzed: nodesAnalyzed, errors }
    }

    // Step 2: Compute mean and stddev of degree distribution
    const degrees = rows.map((r) => r.degree)
    const mean = degrees.reduce((sum, d) => sum + d, 0) / degrees.length
    const variance =
      degrees.reduce((sum, d) => sum + (d - mean) ** 2, 0) / degrees.length
    const stddev = Math.sqrt(variance)

    const highDegreeThreshold = mean + ZSCORE_THRESHOLD * stddev

    // Step 3: Flag high-degree anomalies
    for (const row of rows) {
      if (stddev > 0 && row.degree > highDegreeThreshold) {
        try {
          await createProposal({
            pipeline_state_id: context.pipelineStateId,
            stage_id: context.stageId,
            type: 'hypothesis',
            payload: {
              algorithm: 'anomaly_detection',
              anomaly_type: 'high_degree',
              nodeId: row.nodeId,
              name: row.name,
              label: row.label,
              degree: row.degree,
              mean: Math.round(mean * 100) / 100,
              stddev: Math.round(stddev * 100) / 100,
            },
            confidence: 0.3 + 0.2 * Math.min(1, (row.degree - highDegreeThreshold) / stddev),
            reasoning: `Node "${row.name}" has ${row.degree} connections (mean: ${Math.round(mean * 100) / 100}, stddev: ${Math.round(stddev * 100) / 100}), exceeding 2\u03C3 threshold \u2014 statistically anomalous connectivity`,
          })
          hypothesesCreated++
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          errors.push(`Proposal for high-degree node ${row.nodeId}: ${message}`)
        }
      }
    }

    // Step 4: Flag isolated nodes (degree 0)
    for (const row of rows) {
      if (row.degree === 0) {
        try {
          await createProposal({
            pipeline_state_id: context.pipelineStateId,
            stage_id: context.stageId,
            type: 'hypothesis',
            payload: {
              algorithm: 'anomaly_detection',
              anomaly_type: 'isolated',
              nodeId: row.nodeId,
              name: row.name,
              label: row.label,
              degree: 0,
            },
            confidence: 0.3,
            reasoning: `Node "${row.name}" has 0 connections \u2014 potential suspicious omission or incomplete data`,
          })
          hypothesesCreated++
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          errors.push(`Proposal for isolated node ${row.nodeId}: ${message}`)
        }
      }
    }

    return {
      hypotheses_created: hypothesesCreated,
      nodes_analyzed: nodesAnalyzed,
      errors,
    }
  }
}
