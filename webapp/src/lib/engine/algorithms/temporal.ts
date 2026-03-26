/**
 * Temporal pattern detection algorithm - M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for nodes with date properties within a caso_slug namespace,
 * buckets events by month, detects temporal clusters (>mean+2σ),
 * and creates hypothesis Proposals for anomalous time periods.
 *
 * Also exports a standalone findTemporalClusters() function for API routes.
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
// Standalone data types
// ---------------------------------------------------------------------------

export interface TemporalCluster {
  window_start: string
  window_end: string
  events: Array<{ id: string; title: string; date: string }>
}

// ---------------------------------------------------------------------------
// Standalone query function
// ---------------------------------------------------------------------------

/**
 * Find temporal clusters of Event nodes using a sliding window.
 *
 * Fetches all Event nodes with dates, sorts by date, then groups events
 * that fall within windowDays of each other. Returns clusters with at
 * least minClusterSize events.
 */
export async function findTemporalClusters(
  casoSlug: string,
  windowDays = 7,
  minClusterSize = 2,
): Promise<TemporalCluster[]> {
  const result = await readQuery<{ id: string; title: string; date: string }>(
    `MATCH (e:Event {caso_slug: $casoSlug})
     WHERE e.date IS NOT NULL
     RETURN e.id AS id,
            coalesce(e.title, e.name, e.id) AS title,
            e.date AS date
     ORDER BY e.date ASC`,
    { casoSlug },
    (record) => ({
      id: record.get('id') as string,
      title: record.get('title') as string,
      date: record.get('date') as string,
    }),
  )

  const events = result.records.filter((e) => {
    const d = new Date(e.date)
    return !isNaN(d.getTime())
  })

  if (events.length === 0) return []

  const windowMs = windowDays * 24 * 60 * 60 * 1000
  const clusters: TemporalCluster[] = []

  // Sliding window: for each event, find all events within windowDays
  let i = 0
  while (i < events.length) {
    const anchor = new Date(events[i].date).getTime()
    const group: typeof events = []

    let j = i
    while (j < events.length && new Date(events[j].date).getTime() - anchor <= windowMs) {
      group.push(events[j])
      j++
    }

    if (group.length >= minClusterSize) {
      clusters.push({
        window_start: events[i].date,
        window_end: events[j - 1].date,
        events: group,
      })
      // Advance past this cluster to avoid overlapping windows
      i = j
    } else {
      i++
    }
  }

  return clusters
}

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

