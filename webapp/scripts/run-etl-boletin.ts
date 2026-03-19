/**
 * ETL runner for Boletin Oficial data pipeline.
 * Run with: npx tsx scripts/run-etl-boletin.ts
 *
 * Pipeline: Download -> Parse -> Transform -> Match Politicians -> Load
 * Idempotent -- safe to re-run (uses MERGE, not CREATE).
 *
 * Data sources:
 * - Estructura Organica y Autoridades del PEN (government appointments)
 * - Sistema de Contrataciones Electronicas (procurement awards)
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'
import { fetchBoletinData } from '../src/etl/boletin-oficial'
import { transformBoletinAll } from '../src/etl/boletin-oficial'
import { loadBoletinAll } from '../src/etl/boletin-oficial'
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

  // -- 1. Verify Neo4j connectivity -------------------------------------------
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 2. Fetch existing politicians for matching -----------------------------
  console.log('Loading existing politicians from Neo4j...')
  const politicians = await fetchPoliticians()
  console.log(`  Politicians loaded: ${politicians.length}\n`)

  // -- 3. Fetch Boletin Oficial data ------------------------------------------
  console.log('Fetching Boletin Oficial data...')
  const fetchStart = Date.now()
  const fetched = await fetchBoletinData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Authorities:  ${fetched.stats.authoritiesWithNames} (of ${fetched.stats.totalAuthorities} total)`)
  console.log(`  Awards:       ${fetched.stats.totalAwards} (years: ${fetched.stats.awardYears.join(', ')})\n`)

  // -- 4. Transform -----------------------------------------------------------
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformBoletinAll({
    authorities: fetched.authorities,
    awards: fetched.awards,
    politicians,
  })

  console.log(`  Appointments:      ${transformed.appointments.length}`)
  console.log(`  Contracts:         ${transformed.contracts.length}`)
  console.log(`  Contractors:       ${transformed.contractors.length}`)
  console.log(`  AWARDED_TO rels:   ${transformed.awardedToRels.length}`)
  console.log(`  MAYBE_SAME_AS:     ${transformed.maybeSameAsRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 5. Load ----------------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadBoletinAll(transformed)

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
  console.log('-'.repeat(50))
  console.log(`Boletin Oficial ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:     ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:        ${loadResult.totalErrors}`)
  console.log(`  Politician matches: ${transformed.maybeSameAsRels.length}`)

  if (transformed.maybeSameAsRels.length > 0) {
    console.log('\n  Matched politicians <-> government appointments:')
    for (const m of transformed.maybeSameAsRels.slice(0, 20)) {
      const appt = transformed.appointments.find((a) => a.appointment_id === m.appointment_id)
      console.log(`    ${m.politician_id} <-> ${appt?.full_name ?? m.appointment_id} (${appt?.cargo ?? '?'}) [confidence: ${m.confidence}]`)
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
  console.error('Boletin Oficial ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
