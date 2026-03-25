/**
 * ETL runner for Wave 6: Investigative seed data (Odebrecht, Cuadernos, Siemens).
 * Run with: npx tsx scripts/run-etl-investigative-seed.ts
 *
 * Loads manually curated seed JSONs into Neo4j as BriberyCase, Intermediary nodes.
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { SeedFileSchema } from '../src/etl/obras-publicas/investigative-seed'
import { transformAllSeeds } from '../src/etl/obras-publicas/investigative-seed'
import { loadInvestigativeSeedAll } from '../src/etl/obras-publicas/investigative-seed'
import type { SeedFile } from '../src/etl/obras-publicas/investigative-seed'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

const SEED_FILES = [
  'odebrecht-argentina.json',
  'cuadernos.json',
  'siemens-fcpa.json',
]

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

  // -- 2. Load seed JSON files ------------------------------------------------
  const researchDir = join(process.cwd(), 'src', 'etl', 'obras-publicas', 'research')
  const seeds: SeedFile[] = []

  console.log('=== LOADING SEED FILES ===')
  for (const filename of SEED_FILES) {
    const filepath = join(researchDir, filename)
    if (!existsSync(filepath)) {
      console.log(`  SKIP: ${filename} (not found)`)
      continue
    }

    try {
      const raw = JSON.parse(readFileSync(filepath, 'utf-8'))
      const validated = SeedFileSchema.parse(raw)
      seeds.push(validated)
      console.log(`  OK: ${filename}`)
      console.log(`    Companies: ${validated.companies.length}`)
      console.log(`    Intermediaries: ${validated.intermediaries.length}`)
      console.log(`    Projects: ${validated.projects.length}`)
      console.log(`    Politicians: ${validated.politicians.length}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`  ERROR: ${filename}: ${msg}`)
    }
  }

  if (seeds.length === 0) {
    console.log('\nNo seed files found. Nothing to load.')
    await closeDriver()
    return
  }

  // -- 3. Transform -----------------------------------------------------------
  console.log('\nTransforming seed data...')
  const transformStart = Date.now()
  const transformed = transformAllSeeds(seeds)

  console.log(`  BriberyCases:     ${transformed.briberyCases.length}`)
  console.log(`  Intermediaries:   ${transformed.intermediaries.length}`)
  console.log(`  Contractors:      ${transformed.contractors.length}`)
  console.log(`  PublicWorks:      ${transformed.publicWorks.length}`)
  console.log(`  CASE_INVOLVES:    ${transformed.caseInvolvesRels.length}`)
  console.log(`  BRIBED_BY:        ${transformed.bribedByRels.length}`)
  console.log(`  INTERMEDIATED:    ${transformed.intermediatedRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 4. Load into Neo4j -----------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadInvestigativeSeedAll(transformed)

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
  console.log(`Wave 6 ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Seed files loaded:  ${seeds.length}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Wave 6 ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
