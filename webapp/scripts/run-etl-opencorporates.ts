/**
 * ETL runner for IGJ Argentine corporate registry data pipeline.
 * Run with: npx tsx scripts/run-etl-opencorporates.ts
 *
 * Pipeline: Download -> Parse -> Transform -> Match Politicians -> Load
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 *
 * Data source: https://datos.gob.ar - IGJ (Inspeccion General de Justicia)
 * License: Creative Commons Attribution 4.0
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'
import { fetchIgjData } from '../src/etl/opencorporates'
import { transformIgjAll } from '../src/etl/opencorporates'
import { loadIgjAll } from '../src/etl/opencorporates'
import type { PoliticianParams } from '../src/etl/como-voto/types'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function fetchPoliticians(): Promise<PoliticianParams[]> {
  const result = await readQuery(
    `MATCH (p:Politician)
     RETURN p.id AS id, p.name AS name, p.full_name AS full_name,
            p.name_key AS name_key, p.slug AS slug, p.chamber AS chamber,
            p.province AS province, p.bloc AS bloc, p.coalition AS coalition,
            p.photo AS photo, p.total_votes AS total_votes,
            p.presence_pct AS presence_pct,
            p.source_url AS source_url, p.submitted_by AS submitted_by,
            p.tier AS tier, p.confidence_score AS confidence_score,
            p.ingestion_hash AS ingestion_hash,
            p.created_at AS created_at, p.updated_at AS updated_at`,
    {},
    (r) => ({
      id: r.get('id'),
      name: r.get('name'),
      full_name: r.get('full_name'),
      name_key: r.get('name_key'),
      slug: r.get('slug'),
      chamber: r.get('chamber'),
      province: r.get('province'),
      bloc: r.get('bloc'),
      coalition: r.get('coalition'),
      photo: r.get('photo') ?? '',
      total_votes: typeof r.get('total_votes') === 'object' ? r.get('total_votes').toNumber() : r.get('total_votes'),
      presence_pct: r.get('presence_pct'),
      source_url: r.get('source_url'),
      submitted_by: r.get('submitted_by'),
      tier: r.get('tier'),
      confidence_score: r.get('confidence_score'),
      ingestion_hash: r.get('ingestion_hash'),
      created_at: r.get('created_at'),
      updated_at: r.get('updated_at'),
    } as PoliticianParams),
  )
  return [...result.records]
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  // -- 1. Verify Neo4j connectivity ----------------------------------------
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch existing politicians for matching ---------------------------
  console.log('Loading existing politicians from Neo4j...')
  const politicians = await fetchPoliticians()
  console.log(`  Politicians loaded: ${politicians.length}\n`)

  // -- 3. Fetch IGJ data ----------------------------------------------------
  console.log('Fetching IGJ corporate registry data...')
  const fetchStart = Date.now()
  const fetched = await fetchIgjData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}\n`)

  // -- 4. Transform ---------------------------------------------------------
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformIgjAll({
    ...fetched,
    politicians,
  })

  console.log(`  Companies:              ${transformed.companies.length}`)
  console.log(`  Officers (deduped):     ${transformed.officers.length}`)
  console.log(`  OFFICER_OF_COMPANY rels: ${transformed.officerOfCompanyRels.length}`)
  console.log(`  MAYBE_SAME_AS:          ${transformed.maybeSameAsRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 5. Load --------------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadIgjAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? 'OK' : 'WARN'
    console.log(`  [${status}] ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- Summary --------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('-'.repeat(50))
  console.log(`IGJ ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration: ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:    ${loadResult.totalErrors}`)
  console.log(`  Politician matches: ${transformed.maybeSameAsRels.length}`)

  if (transformed.maybeSameAsRels.length > 0) {
    console.log('\n  Matched politicians <-> company officers:')
    for (const m of transformed.maybeSameAsRels.slice(0, 20)) {
      const officer = transformed.officers.find((o) => o.officer_id === m.officer_id)
      console.log(`    ${m.politician_id} <-> ${officer?.name ?? m.officer_id} (confidence: ${m.confidence})`)
    }
    if (transformed.maybeSameAsRels.length > 20) {
      console.log(`    ... and ${transformed.maybeSameAsRels.length - 20} more`)
    }
  }

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('IGJ ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
