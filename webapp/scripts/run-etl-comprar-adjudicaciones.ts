/**
 * ETL runner for Compr.ar adjudicaciones pipeline (Wave 15).
 * Run with: npx tsx scripts/run-etl-comprar-adjudicaciones.ts
 *
 * Pipeline: Download -> Parse -> Normalize -> Transform -> Load
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - Sistema de Contrataciones Electronicas -- Adjudicaciones (2015-2020)
 *   https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchAdjudicacionesData } from '../src/etl/comprar-adjudicaciones'
import { transformAdjudicacionesAll } from '../src/etl/comprar-adjudicaciones'
import { loadAdjudicacionesAll } from '../src/etl/comprar-adjudicaciones'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  console.log('='.repeat(60))
  console.log('Wave 15: Compr.ar Adjudicaciones ETL Pipeline')
  console.log('='.repeat(60))

  // -- 1. Verify Neo4j connectivity -------------------------------------------
  console.log('\nConnecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch adjudicaciones data -------------------------------------------
  console.log('Fetching Compr.ar adjudicaciones (2015-2020)...')
  const fetchStart = Date.now()
  const fetched = await fetchAdjudicacionesData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Total rows:  ${fetched.stats.totalRows}`)
  console.log(`  Years:       ${fetched.stats.years.join(', ')}`)
  for (const [year, count] of Object.entries(fetched.stats.rowsByYear)) {
    console.log(`    ${year}: ${count.toLocaleString()} rows`)
  }
  console.log()

  if (fetched.stats.totalRows === 0) {
    console.error('No data fetched. Aborting.')
    await closeDriver()
    process.exit(1)
  }

  // -- 3. Transform -----------------------------------------------------------
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformAdjudicacionesAll(fetched.rows)

  console.log(`  Contracts:         ${transformed.contracts.length.toLocaleString()}`)
  console.log(`  Contractors:       ${transformed.contractors.length.toLocaleString()}`)
  console.log(`  AWARDED_TO rels:   ${transformed.awardedToRels.length.toLocaleString()}`)
  console.log(`  Skipped (no CUIT): ${transformed.skippedNoCuit.toLocaleString()}`)
  console.log(`  caso_slug:         ${transformed.casoSlug}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load ----------------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadAdjudicacionesAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? '[OK]' : '[!!]'
    console.log(`  ${status} ${step.label}: ${step.totalItems.toLocaleString()} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('-'.repeat(60))
  const status = loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'
  console.log(`Wave 15 Adjudicaciones ETL ${status}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Rows parsed:        ${fetched.stats.totalRows.toLocaleString()}`)
  console.log(`  Contracts created:  ${transformed.contracts.length.toLocaleString()}`)
  console.log(`  Contractors created:${transformed.contractors.length.toLocaleString()}`)
  console.log(`  Relationships:      ${transformed.awardedToRels.length.toLocaleString()}`)
  console.log(`  Skipped (no CUIT):  ${transformed.skippedNoCuit.toLocaleString()}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Adjudicaciones ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
