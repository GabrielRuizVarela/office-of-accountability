/**
 * Temporal pattern detection algorithm — M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for nodes with date properties within a caso_slug namespace,
 * buckets events by month, detects temporal clusters (>mean+2σ),
 * and creates hypothesis Proposals for anomalous time periods.
 */

import type { AlgorithmKind } from './types'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'
import type { Algorithm, AlgorithmContext, AlgorithmResult } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Months with event count > mean + ZSCORE_THRESHOLD * stddev are flagged */
const ZSCORE_THRESHOLD = 2

// ---------------------------------------------------------------------------
// TemporalAlgorithm
// ---------------------------------------------------------------------------

interface DateNodeRow {
  nodeId: string
  name: string
  label: string
  date: string
}

export class TemporalAlgorithm implements Algorithm {
  kind: AlgorithmKind = 'temporal'

  async run(context: AlgorithmContext): Promise<AlgorithmResult> {
    const errors: string[] = []
    let hypothesesCreated = 0
    let nodesAnalyzed = 0

    // Step 1: Query nodes with date property in namespace
    let rows: readonly DateNodeRow[] = []
    try {
      const result = await readQuery<DateNodeRow>(
        `MATCH (n {caso_slug: $casoSlug})
         WHERE n.date IS NOT NULL
         RETURN n.id AS nodeId, n.name AS name, labels(n)[0] AS label, n.date AS date`,
        { casoSlug: context.casoSlug },
        (record) => ({
          nodeId: record.get('nodeId') as string,
          name: record.get('name') as string,
          label: record.get('label') as string,
          date: record.get('date') as string,
        }),
      )
      rows = result.records
      nodesAnalyzed = rows.length
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`Temporal date query: ${message}`)
    }

    if (rows.length === 0) {
      return { hypotheses_created: 0, nodes_analyzed: nodesAnalyzed, errors }
    }

    // Step 2: Bucket events by month (YYYY-MM)
    const buckets = new Map<string, DateNodeRow[]>()
    for (const row of rows) {
      const month = toYearMonth(row.date)
      if (!month) continue
      const list = buckets.get(month)
      if (list) {
        list.push(row)
      } else {
        buckets.set(month, [row])
      }
    }

    if (buckets.size === 0) {
      return { hypotheses_created: 0, nodes_analyzed: nodesAnalyzed, errors }
    }

    // Step 3: Compute mean and stddev of events per month
    const counts = Array.from(buckets.values()).map((b) => b.length)
    const mean = counts.reduce((sum, c) => sum + c, 0) / counts.length
    const variance =
      counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / counts.length
    const stddev = Math.sqrt(variance)

    const threshold = mean + ZSCORE_THRESHOLD * stddev

    // Step 4: Create hypothesis Proposals for cluster months
    for (const [period, members] of buckets) {
      if (stddev <= 0 || members.length <= threshold) continue

      const confidence =
        0.3 + 0.2 * Math.min(1, (members.length - threshold) / stddev)

      try {
        await createProposal({
          pipeline_state_id: context.pipelineStateId,
          stage_id: context.stageId,
          type: 'hypothesis',
          payload: {
            algorithm: 'temporal_pattern',
            period,
            event_count: members.length,
            entities: members.map((m) => ({
              nodeId: m.nodeId,
              name: m.name,
              label: m.label,
            })),
            size: members.length,
          },
          confidence,
          reasoning: `Detected ${members.length} events in ${period} (mean: ${Math.round(mean * 100) / 100}/month, stddev: ${Math.round(stddev * 100) / 100}) \u2014 temporal cluster exceeding 2\u03C3 threshold`,
        })
        hypothesesCreated++
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Proposal for period ${period}: ${message}`)
      }
    }

    return {
      hypotheses_created: hypothesesCreated,
      nodes_analyzed: nodesAnalyzed,
      errors,
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract YYYY-MM from a date string. Returns null if unparseable. */
function toYearMonth(dateStr: string): string | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
