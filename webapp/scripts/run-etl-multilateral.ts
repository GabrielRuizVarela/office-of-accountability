/**
 * ETL runner for World Bank multilateral contracts.
 * Run with: npx tsx scripts/run-etl-multilateral.ts
 *
 * Pipeline: Fetch WB Socrata API -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - World Bank Major Contract Awards (Argentina)
 *   https://finances.worldbank.org/resource/kdui-wcs3.json
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchMultilateralData } from '../src/etl/obras-publicas/multilateral'
import { transformMultilateralAll } from '../src/etl/obras-publicas/multilateral'
import { loadMultilateralAll } from '../src/etl/obras-publicas/multilateral'

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

  // -- 2. Fetch World Bank data ------------------------------------------------
  console.log('=== WORLD BANK MULTILATERAL ===')
  console.log('Fetching World Bank contract data for Argentina...')
  const fetchStart = Date.now()
  const fetchResult = await fetchMultilateralData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Contracts:        ${fetchResult.stats.totalContracts}`)
  console.log(`  IDB sanctions:    ${fetchResult.stats.idbSanctionsFetched ? 'fetched' : 'skipped'}\n`)

  // -- 3. Transform -----------------------------------------------------------
  console.log('Transforming multilateral data...')
  const transformStart = Date.now()
  const transformed = transformMultilateralAll(fetchResult.contracts)

  console.log(`  Projects:         ${transformed.projects.length}`)
  console.log(`  Contractors:      ${transformed.contractors.length}`)
  console.log(`  Contracts:        ${transformed.contracts.length}`)
  console.log(`  FUNDED_BY:        ${transformed.fundedByRels.length}`)
  console.log(`  AWARDED_TO:       ${transformed.awardedToRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load into Neo4j ------------------------------------------------------
  console.log('Loading multilateral data into Neo4j...')
  const loadResult = await loadMultilateralAll(transformed)

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
  console.log(`Multilateral ETL ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:   ${formatDuration(totalDuration)}`)
  console.log(`  Total errors:     ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Multilateral ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
