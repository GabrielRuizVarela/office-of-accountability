/**
 * ETL runner for MapaInversiones — Mapa de Inversiones en Obra Publica.
 * Run with: npx tsx scripts/run-etl-mapa-inversiones.ts
 *
 * Pipeline: Download CSV -> Parse -> Transform -> Load into Neo4j
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data source:
 * - MapaInversiones: https://mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv
 */

import 'dotenv/config'

// ETL batches need more time than the default 5s query timeout
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { fetchMapaData } from '../src/etl/obras-publicas/mapa-inversiones'
import { transformMapaAll } from '../src/etl/obras-publicas/mapa-inversiones'
import { loadMapaAll } from '../src/etl/obras-publicas/mapa-inversiones'

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

  // -- 2. Fetch MapaInversiones data ------------------------------------------
  console.log('=== MAPA INVERSIONES ===')
  console.log('Fetching MapaInversiones CSV...')
  const fetchStart = Date.now()
  const mapaData = await fetchMapaData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Works: ${mapaData.count}\n`)

  // -- 3. Transform -----------------------------------------------------------
  console.log('Transforming MapaInversiones data...')
  const transformStart = Date.now()
  const transformed = transformMapaAll(mapaData.works)

  console.log(`  PublicWorks:      ${transformed.publicWorks.length}`)
  console.log(`  Contractors:     ${transformed.contractors.length}`)
  console.log(`  CONTRACTED_FOR:  ${transformed.contractedForRels.length}`)
  console.log(`  LOCATED_IN:      ${transformed.locatedInProvinceRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load into Neo4j -----------------------------------------------------
  console.log('Loading MapaInversiones into Neo4j...')
  const loadResult = await loadMapaAll(transformed)

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
  console.log(`MapaInversiones ETL ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:  ${formatDuration(totalDuration)}`)
  console.log(`  Total errors:    ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('MapaInversiones ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
