/**
 * ETL runner for DNV OCDS — Direccion Nacional de Vialidad road construction.
 * Run with: npx tsx scripts/run-etl-dnv-ocds.ts
 *
 * Pipeline: Read JSONL -> Parse OCDS -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - Open Contracting Data Standard publication #18
 *   https://data.open-contracting.org/en/publication/18
 *   277 releases, 234 contracts, 58 unique road construction suppliers
 *   OCID prefix: ocds-4jg6r3
 *
 * Key: DNV data covers federal highway construction — the same sector where
 * Cuadernos cartelization was alleged. Finding Cartellone, Rovella Carranza,
 * CPC, Dycasa, Decavial, CN Sapag provides independent corroboration.
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchDnvOcdsData } from '../src/etl/obras-publicas/dnv-ocds/fetcher'
import { transformOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial/transformer'
import type { OcdsTransformOptions } from '../src/etl/obras-publicas/ocds-provincial/transformer'
import { loadOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial/loader'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DNV_OPTS: OcdsTransformOptions = {
  sourceUrl: 'https://data.open-contracting.org/en/publication/18',
  submittedBy: 'etl:dnv-ocds',
  confidenceScore: 0.9,
  tier: 'silver',
}

/** Cuadernos-linked companies to flag in output */
const CUADERNOS_KEYWORDS = [
  'CARTELLONE',
  'ROVELLA',
  'CPC',
  'DYCASA',
  'DECAVIAL',
  'SAPAG',
  'IECSA',
  'ELECTROINGENIERIA',
  'ESUCO',
  'AUSTRAL',
  'HELPORT',
]

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  console.log('=== DNV OCDS ETL — Direccion Nacional de Vialidad ===\n')

  // -- 1. Verify Neo4j connectivity -------------------------------------------
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch DNV OCDS data -------------------------------------------------
  console.log('Fetching DNV OCDS releases from local JSONL...')
  const fetchStart = Date.now()
  const data = await fetchDnvOcdsData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Total releases:    ${data.stats.totalReleases}`)
  console.log(`  With tender:       ${data.stats.withTender}`)
  console.log(`  With award:        ${data.stats.withAward}`)
  console.log(`  With contract:     ${data.stats.withContract}`)
  console.log(`  Parse errors:      ${data.stats.parseErrors}`)
  console.log(`  Date range:        ${data.stats.dateRange.earliest} to ${data.stats.dateRange.latest}\n`)

  // -- 3. Transform OCDS releases ---------------------------------------------
  console.log('Transforming OCDS releases...')
  const transformStart = Date.now()
  const transformed = transformOcdsProvincialAll(data.releases, DNV_OPTS)

  console.log(`  Procedures:      ${transformed.procedures.length}`)
  console.log(`  Bids:            ${transformed.bids.length}`)
  console.log(`  Contractors:     ${transformed.contractors.length}`)
  console.log(`  Contracts:       ${transformed.contracts.length}`)
  console.log(`  BID_ON:          ${transformed.bidOnRels.length}`)
  console.log(`  BIDDER:          ${transformed.bidderRels.length}`)
  console.log(`  AWARDED_TO:      ${transformed.awardedToRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load into Neo4j ------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadOcdsProvincialAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? '[OK]' : '[!!]'
    console.log(`  ${status} ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- 5. Cuadernos cross-reference -------------------------------------------
  console.log('=== Cuadernos-linked companies found in DNV data ===')
  let cuadernosFound = 0
  for (const contractor of transformed.contractors) {
    const upper = contractor.name.toUpperCase()
    const matches = CUADERNOS_KEYWORDS.filter((kw) => upper.includes(kw))
    if (matches.length > 0) {
      cuadernosFound += 1
      const isUte = upper.includes('UTE') || upper.includes('UNION TRANSITORIA')
      console.log(`  ${isUte ? '[UTE] ' : ''}${contractor.name}`)
      console.log(`    CUIT: ${contractor.cuit}`)
      console.log(`    Matched keywords: ${matches.join(', ')}`)
    }
  }
  console.log(`\n  Total Cuadernos-linked entities: ${cuadernosFound}\n`)

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('='.repeat(60))
  console.log(`DNV OCDS ETL ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Releases parsed:    ${data.stats.totalReleases}`)
  console.log(`  Procedures loaded:  ${transformed.procedures.length}`)
  console.log(`  Contracts loaded:   ${transformed.contracts.length}`)
  console.log(`  Contractors loaded: ${transformed.contractors.length}`)
  console.log(`  Cuadernos matches:  ${cuadernosFound}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('DNV OCDS ETL failed:', error)
  closeDriver().finally(() => process.exit(1))
})
