/**
 * ETL runner for Wave 17: Mendoza OCDS procurement data.
 * Run with: npx tsx scripts/run-etl-mendoza-ocds.ts [--all]
 *
 * Pipeline: Download JSON -> Parse OCDS -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - Mendoza Contrataciones Abiertas — OCDS standard releases
 *   https://datosabiertos-compras.mendoza.gov.ar
 *   Publisher: Direccion General de Contrataciones y Gestion de Bienes
 *   OCID prefix: ocds-ppv9mm
 *
 * By default, only ingests period-03 (2025-2026, ~11 MB).
 * Pass --all to ingest all three periods (~223 MB total).
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { transformOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial'
import { loadOcdsProvincialAll } from '../src/etl/obras-publicas/ocds-provincial'
import {
  fetchMendozaOcdsData,
  MENDOZA_DATASETS,
  type MendozaDatasetKey,
} from '../src/etl/obras-publicas/ocds-provincial/mendoza/fetcher'

const MENDOZA_SOURCE_URL = 'https://datosabiertos-compras.mendoza.gov.ar'
const SUBMITTED_BY = 'etl:ocds-provincial-mendoza'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()
  const fetchAll = process.argv.includes('--all')

  const periods: MendozaDatasetKey[] = fetchAll
    ? MENDOZA_DATASETS.map((d) => d.key)
    : ['period-03']

  // -- 1. Verify Neo4j connectivity -------------------------------------------
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch Mendoza OCDS data ---------------------------------------------
  console.log('=== Mendoza OCDS (Wave 17) ===')
  console.log(`Periods: ${periods.join(', ')}`)
  console.log('Fetching OCDS releases from Mendoza open data portal...')
  const fetchStart = Date.now()
  const data = await fetchMendozaOcdsData(periods)
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Total releases:    ${data.stats.totalReleases}`)
  console.log(`  With tender:       ${data.stats.withTender}`)
  console.log(`  With award:        ${data.stats.withAward}`)
  console.log(`  With contract:     ${data.stats.withContract}`)
  console.log(
    `  Date range:        ${data.stats.dateRange.earliest} to ${data.stats.dateRange.latest}\n`,
  )

  // -- 3. Transform OCDS releases ---------------------------------------------
  console.log('Transforming OCDS releases...')
  const transformStart = Date.now()
  const transformed = transformOcdsProvincialAll(data.releases, {
    sourceUrl: MENDOZA_SOURCE_URL,
    submittedBy: SUBMITTED_BY,
  })

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
    console.log(
      `  ${status} ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`,
    )
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('='.repeat(50))
  console.log(
    `Wave 17 Mendoza OCDS ETL ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`,
  )
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Wave 17 Mendoza OCDS ETL failed:', error)
  closeDriver().finally(() => process.exit(1))
})
