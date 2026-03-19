/**
 * ETL runner for CNE Campaign Finance data pipeline.
 * Run with: npx tsx scripts/run-etl-cne.ts
 *
 * Pipeline: Download CSVs → Parse → Transform → Match Politicians → Load
 * Idempotent — safe to re-run (uses MERGE, not CREATE).
 *
 * Data source: https://aportantes.electoral.gob.ar
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'
import { fetchCneData } from '../src/etl/cne-finance'
import { transformCneAll } from '../src/etl/cne-finance'
import { loadCneAll } from '../src/etl/cne-finance'
import type { PoliticianParams } from '../src/etl/como-voto/types'

// Use longer timeout for ETL operations
process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

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
      total_votes:
        typeof r.get('total_votes') === 'object'
          ? r.get('total_votes').toNumber()
          : r.get('total_votes'),
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

async function fetchExistingPartyNames(): Promise<string[]> {
  const result = await readQuery(
    `MATCH (p:Party) RETURN p.name AS name`,
    {},
    (r) => r.get('name') as string,
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

  // -- 2. Fetch existing data for matching ----------------------------------
  console.log('Loading existing politicians from Neo4j...')
  const politicians = await fetchPoliticians()
  console.log(`  Politicians loaded: ${politicians.length}`)

  console.log('Loading existing party names from Neo4j...')
  const partyNames = await fetchExistingPartyNames()
  console.log(`  Parties loaded: ${partyNames.length}\n`)

  // -- 3. Fetch CNE data ----------------------------------------------------
  console.log('Fetching CNE campaign finance data...')
  const fetchStart = Date.now()
  const fetched = await fetchCneData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}\n`)

  // -- 4. Transform ---------------------------------------------------------
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformCneAll({
    campaignDonations: fetched.campaignDonations,
    institutionalDonations: fetched.institutionalDonations,
    politicians,
    existingPartyNames: partyNames,
  })

  console.log(`  Donations:              ${transformed.donations.length}`)
  console.log(`  Donors:                 ${transformed.donors.length}`)
  console.log(`  Party finance nodes:    ${transformed.partyFinanceNodes.length}`)
  console.log(`  DONATED_TO rels:        ${transformed.donatedToRels.length}`)
  console.log(`  RECEIVED_DONATION rels: ${transformed.receivedDonationRels.length}`)
  console.log(`  Donor MAYBE_SAME_AS:    ${transformed.donorMaybeSameAsRels.length}`)
  console.log(`  Party MAYBE_SAME_AS:    ${transformed.partyMaybeSameRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 5. Load --------------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadCneAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? 'OK' : 'WARN'
    console.log(
      `  [${status}] ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`,
    )
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- Summary --------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('-'.repeat(50))
  console.log(
    `CNE Finance ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`,
  )
  console.log(`  Total duration:       ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:          ${loadResult.totalErrors}`)
  console.log(`  Politician matches:   ${transformed.donorMaybeSameAsRels.length}`)
  console.log(`  Party matches:        ${transformed.partyMaybeSameRels.length}`)

  if (transformed.donorMaybeSameAsRels.length > 0) {
    console.log('\n  Matched politicians as donors:')
    for (const m of transformed.donorMaybeSameAsRels.slice(0, 20)) {
      const donor = transformed.donors.find((d) => d.donor_id === m.donor_id)
      console.log(
        `    ${m.politician_id} <-> ${donor?.name ?? m.donor_id} (confidence: ${m.confidence})`,
      )
    }
    if (transformed.donorMaybeSameAsRels.length > 20) {
      console.log(`    ... and ${transformed.donorMaybeSameAsRels.length - 20} more`)
    }
  }

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('CNE Finance ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
