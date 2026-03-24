/**
 * ETL runner for Wave 4: CABA BAC_OCDS (provincial OCDS data).
 * Run with: npx tsx scripts/run-etl-ocds-provincial.ts
 *
 * Pipeline: Clone repo + Download JSON -> Parse OCDS -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - Buenos Aires Compras (BAC) — OCDS standard releases
 *   23,298 releases covering Jan–Jun 2022
 *   OCID prefix: ocds-bulbcf
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchOcdsProvincialData } from '../src/etl/obras-publicas/ocds-provincial'
import { transformOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial'
import { loadOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  // -- 1. Verify Neo4j connectivity -------------------------------------------
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch CABA BAC_OCDS data -------------------------------------------
  console.log('=== CABA BAC_OCDS (Wave 4) ===')
  console.log('Fetching OCDS releases from Buenos Aires data portal...')
  const fetchStart = Date.now()
  const data = await fetchOcdsProvincialData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Total releases:    ${data.stats.totalReleases}`)
  console.log(`  With tender:       ${data.stats.withTender}`)
  console.log(`  With award:        ${data.stats.withAward}`)
  console.log(`  With contract:     ${data.stats.withContract}`)
  console.log(`  Date range:        ${data.stats.dateRange.earliest} to ${data.stats.dateRange.latest}\n`)

  // -- 3. Transform OCDS releases ---------------------------------------------
  console.log('Transforming OCDS releases...')
  const transformStart = Date.now()
  const transformed = transformOcdsProvincialAll(data.releases)

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

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('='.repeat(50))
  console.log(`Wave 4 OCDS Provincial ETL ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Wave 4 OCDS Provincial ETL failed:', error)
  closeDriver().finally(() => process.exit(1))
})
