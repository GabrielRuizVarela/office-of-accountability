/**
 * ETL runner for DDJJ Patrimoniales (sworn asset declarations) pipeline.
 * Run with: npx tsx scripts/run-etl-ddjj.ts
 *
 * Pipeline: Download CSVs -> Parse -> Transform -> Match Politicians -> Load -> Cross-reference
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'
import { fetchDdjjData } from '../src/etl/ddjj-patrimoniales'
import { transformDdjjAll } from '../src/etl/ddjj-patrimoniales'
import { loadDdjjAll } from '../src/etl/ddjj-patrimoniales'
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

/**
 * Cross-reference: find politicians who have BOTH offshore connections
 * AND asset declarations. These are high-value investigation targets.
 */
async function findOffshoreCrossReferences(): Promise<void> {
  console.log('\nCross-referencing offshore entities with asset declarations...')

  try {
    const result = await readQuery(
      `MATCH (p:Politician)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)
       MATCH (p)-[:MAYBE_SAME_AS]->(d:AssetDeclaration)
       RETURN DISTINCT p.name AS politician_name,
              p.id AS politician_id,
              o.name AS offshore_name,
              d.year AS ddjj_year,
              d.total_assets_end AS declared_assets,
              d.agency AS agency,
              d.position AS position
       ORDER BY p.name, d.year`,
      {},
      (r) => ({
        politicianName: r.get('politician_name'),
        politicianId: r.get('politician_id'),
        offshoreName: r.get('offshore_name'),
        ddjjYear: r.get('ddjj_year'),
        declaredAssets: r.get('declared_assets'),
        agency: r.get('agency'),
        position: r.get('position'),
      }),
    )

    if (result.records.length === 0) {
      console.log('  No cross-references found (no politicians with both offshore + DDJJ links)')
      return
    }

    console.log(`\n  INVESTIGATION TARGETS: ${result.records.length} cross-references found`)
    console.log('  Politicians with BOTH offshore entities AND asset declarations:')
    console.log('  ' + '-'.repeat(80))

    let currentPolitician = ''
    for (const r of result.records) {
      if (r.politicianName !== currentPolitician) {
        currentPolitician = r.politicianName
        console.log(`\n  ${r.politicianName} (${r.politicianId})`)
        console.log(`    Offshore entity: ${r.offshoreName}`)
      }
      const assets = typeof r.declaredAssets === 'number'
        ? r.declaredAssets.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        : r.declaredAssets
      console.log(`    DDJJ ${r.ddjjYear}: ${assets} - ${r.position} @ ${r.agency}`)
    }
    console.log('\n  ' + '-'.repeat(80))
  } catch (error) {
    console.log('  Cross-reference query failed (OffshoreOfficer nodes may not exist):', error instanceof Error ? error.message : error)
  }
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

  // -- 3. Fetch DDJJ data --------------------------------------------------
  console.log('Fetching DDJJ Patrimoniales data...')
  const fetchStart = Date.now()
  const fetched = await fetchDdjjData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}`)
  console.log(`  Total rows: ${fetched.stats.totalRows}`)
  console.log(`  Years: ${fetched.stats.yearsProcessed.join(', ')}\n`)

  // -- 4. Transform --------------------------------------------------------
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformDdjjAll({
    rows: fetched.rows,
    politicians,
  })

  console.log(`  Declarations:      ${transformed.declarations.length}`)
  console.log(`  MAYBE_SAME_AS:     ${transformed.maybeSameAsRels.length}`)
  console.log(`  Matched politicians: ${transformed.matchedPoliticianIds.size}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // -- 5. Load --------------------------------------------------------------
  console.log('Loading into Neo4j...')
  const loadResult = await loadDdjjAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? 'OK' : 'WARN'
    console.log(`  [${status}] ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // -- 6. Cross-reference with offshore data --------------------------------
  await findOffshoreCrossReferences()

  // -- Summary --------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  console.log('\n' + '='.repeat(60))
  console.log(`DDJJ ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration:       ${formatDuration(totalDuration)}`)
  console.log(`  Declarations loaded:  ${transformed.declarations.length}`)
  console.log(`  Politician matches:   ${transformed.maybeSameAsRels.length} (${transformed.matchedPoliticianIds.size} unique politicians)`)
  console.log(`  Load errors:          ${loadResult.totalErrors}`)

  if (transformed.maybeSameAsRels.length > 0) {
    console.log('\n  Sample matched politicians:')
    const sampleMatches = transformed.maybeSameAsRels.slice(0, 15)
    for (const m of sampleMatches) {
      const decl = transformed.declarations.find((d) => d.ddjj_id === m.ddjj_id)
      if (decl) {
        console.log(`    ${m.politician_id} <-> ${decl.official_name} (${decl.year}, ${decl.position})`)
      }
    }
    if (transformed.maybeSameAsRels.length > 15) {
      console.log(`    ... and ${transformed.maybeSameAsRels.length - 15} more`)
    }
  }

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('DDJJ ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
