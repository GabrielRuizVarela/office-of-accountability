/**
 * ETL runner for Wave 1: CONTRAT.AR + COMPR.AR SIPRO.
 * Run with: npx tsx scripts/run-etl-contratar.ts
 *
 * Pipeline: Download CSVs -> Parse -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data sources:
 * - CONTRAT.AR (7 CSVs): procedimientos, ofertas, contratos, obras, ubicaciones
 * - COMPR.AR SIPRO: supplier registry
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchContratarData } from '../src/etl/obras-publicas/contratar'
import { transformContratarAll } from '../src/etl/obras-publicas/contratar'
import { loadContratarAll } from '../src/etl/obras-publicas/contratar'
import { fetchSiproData } from '../src/etl/obras-publicas/sipro'
import { transformSiproAll } from '../src/etl/obras-publicas/sipro'
import { loadSiproAll } from '../src/etl/obras-publicas/sipro'

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

  // -- 2. Fetch CONTRAT.AR data -----------------------------------------------
  console.log('=== CONTRAT.AR ===')
  console.log('Fetching CONTRAT.AR CSVs from datos.gob.ar...')
  const fetchStart = Date.now()
  const contratarData = await fetchContratarData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Procedimientos:  ${contratarData.stats.totalProcedimientos}`)
  console.log(`  Ofertas:         ${contratarData.stats.totalOfertas}`)
  console.log(`  Contratos:       ${contratarData.stats.totalContratos}`)
  console.log(`  Obras:           ${contratarData.stats.totalObras}`)
  console.log(`  Ubicaciones:     ${contratarData.stats.totalUbicaciones}\n`)

  // -- 3. Transform CONTRAT.AR ------------------------------------------------
  console.log('Transforming CONTRAT.AR data...')
  const transformStart = Date.now()
  const contratarTransformed = transformContratarAll(contratarData)

  console.log(`  Procedures:      ${contratarTransformed.procedures.length}`)
  console.log(`  PublicWorks:      ${contratarTransformed.publicWorks.length}`)
  console.log(`  Bids:            ${contratarTransformed.bids.length}`)
  console.log(`  Contractors:     ${contratarTransformed.contractors.length}`)
  console.log(`  Contracts:       ${contratarTransformed.contracts.length}`)
  console.log(`  PROCEDURE_FOR:   ${contratarTransformed.procedureForRels.length}`)
  console.log(`  BID_ON:          ${contratarTransformed.bidOnRels.length}`)
  console.log(`  BIDDER:          ${contratarTransformed.bidderRels.length}`)
  console.log(`  CONTRACTED_FOR:  ${contratarTransformed.contractedForRels.length}`)
  console.log(`  AWARDED_TO:      ${contratarTransformed.awardedToRels.length}`)
  console.log(`  LOCATED_IN:      ${contratarTransformed.locatedInProvinceRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load CONTRAT.AR into Neo4j ------------------------------------------
  console.log('Loading CONTRAT.AR into Neo4j...')
  const contratarLoadResult = await loadContratarAll(contratarTransformed)

  for (const step of contratarLoadResult.steps) {
    const status = step.errors.length === 0 ? '[OK]' : '[!!]'
    console.log(`  ${status} ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(contratarLoadResult.durationMs)}\n`)

  // -- 5. Fetch SIPRO data ----------------------------------------------------
  console.log('=== SIPRO ===')
  console.log('Fetching SIPRO supplier registry...')
  const siproFetchStart = Date.now()
  const siproData = await fetchSiproData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - siproFetchStart)}`)
  console.log(`  Suppliers: ${siproData.count}\n`)

  // -- 6. Transform SIPRO -----------------------------------------------------
  console.log('Transforming SIPRO data...')
  const siproTransformStart = Date.now()
  const siproTransformed = transformSiproAll(siproData.suppliers)
  console.log(`  Contractors: ${siproTransformed.contractors.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - siproTransformStart)}\n`)

  // -- 7. Load SIPRO into Neo4j -----------------------------------------------
  console.log('Loading SIPRO into Neo4j...')
  const siproLoadResult = await loadSiproAll(siproTransformed)

  for (const step of siproLoadResult.steps) {
    const status = step.errors.length === 0 ? '[OK]' : '[!!]'
    console.log(`  ${status} ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(siproLoadResult.durationMs)}\n`)

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  const totalErrors = contratarLoadResult.totalErrors + siproLoadResult.totalErrors
  console.log('='.repeat(50))
  console.log(`Wave 1 ETL pipeline ${totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  CONTRAT.AR errors:  ${contratarLoadResult.totalErrors}`)
  console.log(`  SIPRO errors:       ${siproLoadResult.totalErrors}`)

  await closeDriver()

  if (totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Wave 1 ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
