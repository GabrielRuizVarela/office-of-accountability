/**
 * Load NATO signals into Neo4j.
 * Uses MERGE for idempotent loading and UNWIND for batching.
 */
import { getDriver } from '../../../lib/neo4j/client'
import type { NatoSignalParams } from './types'

const BATCH_SIZE = 500

const MERGE_SIGNAL = `
  UNWIND $signals AS s
  MERGE (n:NuclearSignal {id: s.id})
  SET n.date = s.date,
      n.title_en = s.title_en,
      n.title_es = s.title_es,
      n.summary_en = s.summary_en,
      n.summary_es = s.summary_es,
      n.source_url = s.source_url,
      n.source_module = s.source_module,
      n.tier = s.tier,
      n.confidence_score = s.confidence_score,
      n.ingestion_hash = s.ingestion_hash,
      n.submitted_by = s.submitted_by,
      n.created_at = s.created_at,
      n.updated_at = s.updated_at
  RETURN count(n) AS count
`

export interface LoadNatoResult {
  readonly nodesCreated: number
  readonly batches: number
}

export async function loadNatoSignals(signals: readonly NatoSignalParams[]): Promise<LoadNatoResult> {
  const driver = getDriver()
  let totalCreated = 0
  let batches = 0

  for (let i = 0; i < signals.length; i += BATCH_SIZE) {
    const batch = signals.slice(i, i + BATCH_SIZE)
    const session = driver.session()
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(MERGE_SIGNAL, { signals: batch })
      )
      const count = result.records[0]?.get('count')?.toNumber?.() ?? 0
      totalCreated += count
      batches++
      console.log(`  Batch ${batches}: ${count} signals merged`)
    } finally {
      await session.close()
    }
  }

  return { nodesCreated: totalCreated, batches }
}
