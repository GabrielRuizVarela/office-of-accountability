/**
 * ETL runner for Argentine federal judiciary designations pipeline.
 * Run with: NEO4J_QUERY_TIMEOUT_MS=60000 npx tsx scripts/run-etl-judiciary.ts
 *
 * Pipeline: Download CSV -> Transform -> Match (Politicians, DDJJ, Companies) -> Load
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'
import { normalizeName } from '../src/etl/como-voto/transformer'
import { fetchJudiciaryData } from '../src/etl/judiciary'
import { transformJudiciaryAll } from '../src/etl/judiciary'
import { loadJudiciaryAll } from '../src/etl/judiciary'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ---------------------------------------------------------------------------
// Fetch existing graph data for cross-matching
// ---------------------------------------------------------------------------

async function fetchPoliticianLookup(): Promise<Map<string, string>> {
  const result = await readQuery(
    `MATCH (p:Politician)
     RETURN p.id AS id, p.full_name AS full_name`,
    {},
    (r) => ({
      id: r.get('id') as string,
      full_name: r.get('full_name') as string,
    }),
  )

  // normalized name -> id (null-out ambiguous)
  const lookup = new Map<string, string>()
  for (const r of result.records) {
    const key = normalizeName(r.full_name)
    if (!key) continue
    if (lookup.has(key)) {
      lookup.set(key, '') // mark ambiguous
    } else {
      lookup.set(key, r.id)
    }
  }

  // Remove ambiguous entries
  for (const [key, value] of lookup) {
    if (value === '') lookup.delete(key)
  }

  return lookup
}

async function fetchDdjjDniLookup(): Promise<Map<string, string[]>> {
  const result = await readQuery(
    `MATCH (d:AssetDeclaration)
     WHERE d.cuit IS NOT NULL AND d.cuit <> ''
     RETURN d.ddjj_id AS ddjj_id, d.cuit AS cuit`,
    {},
    (r) => ({
      ddjj_id: r.get('ddjj_id') as string,
      cuit: r.get('cuit') as string,
    }),
  )

  // Extract DNI from CUIT (format: XX-DDDDDDDD-D)
  const lookup = new Map<string, string[]>()
  for (const r of result.records) {
    const digits = r.cuit.replace(/\D/g, '')
    // CUIT is 11 digits: 2 prefix + 8 DNI + 1 check
    const dni = digits.length === 11 ? digits.slice(2, 10) : digits
    if (!dni) continue

    const existing = lookup.get(dni) ?? []
    existing.push(r.ddjj_id)
    lookup.set(dni, existing)
  }

  return lookup
}

async function fetchCompanyOfficerNameLookup(): Promise<Map<string, string[]>> {
  const result = await readQuery(
    `MATCH (o:CompanyOfficer)
     RETURN o.officer_id AS officer_id, o.name AS name`,
    {},
    (r) => ({
      officer_id: r.get('officer_id') as string,
      name: r.get('name') as string,
    }),
  )

  const lookup = new Map<string, string[]>()
  for (const r of result.records) {
    const key = normalizeName(r.name)
    if (!key) continue
    const existing = lookup.get(key) ?? []
    existing.push(r.officer_id)
    lookup.set(key, existing)
  }

  return lookup
}

async function fetchBoardMemberNameLookup(): Promise<Map<string, string[]>> {
  const result = await readQuery(
    `MATCH (b:BoardMember)
     RETURN b.igj_authority_id AS authority_id, b.name AS name`,
    {},
    (r) => ({
      authority_id: r.get('authority_id') as string,
      name: r.get('name') as string,
    }),
  )

  const lookup = new Map<string, string[]>()
  for (const r of result.records) {
    const key = normalizeName(r.name)
    if (!key) continue
    const existing = lookup.get(key) ?? []
    existing.push(r.authority_id)
    lookup.set(key, existing)
  }

  return lookup
}

// ---------------------------------------------------------------------------
// Investigation queries
// ---------------------------------------------------------------------------

async function runInvestigationQueries(): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('INVESTIGATION QUERIES')
  console.log('='.repeat(60))

  // 1. Judges appointed by each president
  console.log('\n--- Judges appointed by each president ---')
  const presResult = await readQuery(
    `MATCH (j:Judge)-[r:APPOINTED_BY]->(p:Politician)
     RETURN p.full_name AS president, count(j) AS judges
     ORDER BY judges DESC`,
    {},
    (r) => ({
      president: r.get('president') as string,
      judges: typeof r.get('judges') === 'object' ? r.get('judges').toNumber() : r.get('judges'),
    }),
  )
  for (const r of presResult.records) {
    console.log(`  ${r.president}: ${r.judges} judges`)
  }

  // 2. Key investigation judges
  console.log('\n--- Key investigation judges (Lijo, Ercolini, Arroyo Salgado) ---')
  const keyJudges = await readQuery(
    `MATCH (j:Judge)
     WHERE j.name CONTAINS 'LIJO' OR j.name CONTAINS 'Lijo'
        OR j.name CONTAINS 'ERCOLINI' OR j.name CONTAINS 'Ercolini'
        OR j.name CONTAINS 'ARROYO SALGADO' OR j.name CONTAINS 'Arroyo Salgado'
     RETURN j.name AS name, j.current_court AS court, j.appointment_date AS date, j.dni AS dni`,
    {},
    (r) => ({
      name: r.get('name') as string,
      court: r.get('court') as string,
      date: r.get('date') as string,
      dni: r.get('dni') as string,
    }),
  )
  if (keyJudges.records.length === 0) {
    console.log('  (none found - check name variants)')
  }
  for (const r of keyJudges.records) {
    console.log(`  ${r.name} | ${r.court} | appointed: ${r.date} | DNI: ${r.dni}`)
  }

  // 3. Judges who are also company officers (conflict of interest)
  console.log('\n--- Judges who are also company officers (conflict of interest) ---')
  const conflicts = await readQuery(
    `MATCH (j:Judge)-[:MAYBE_SAME_AS]->(o:CompanyOfficer)-[:OFFICER_OF_COMPANY]->(c:Company)
     RETURN j.name AS judge, c.name AS company, o.role AS role
     LIMIT 50`,
    {},
    (r) => ({
      judge: r.get('judge') as string,
      company: r.get('company') as string,
      role: r.get('role') as string | null,
    }),
  )
  if (conflicts.records.length === 0) {
    console.log('  (none found via CompanyOfficer)')
  }
  for (const r of conflicts.records) {
    console.log(`  ${r.judge} -> ${r.company} (${r.role ?? 'unknown role'})`)
  }

  // 4. Judges who are also board members of public companies
  console.log('\n--- Judges who are board members of public companies ---')
  const boardConflicts = await readQuery(
    `MATCH (j:Judge)-[:MAYBE_SAME_AS]->(b:BoardMember)-[:BOARD_MEMBER_OF]->(c:PublicCompany)
     RETURN j.name AS judge, c.name AS company, b.role AS role
     LIMIT 50`,
    {},
    (r) => ({
      judge: r.get('judge') as string,
      company: r.get('company') as string,
      role: r.get('role') as string | null,
    }),
  )
  if (boardConflicts.records.length === 0) {
    console.log('  (none found via BoardMember)')
  }
  for (const r of boardConflicts.records) {
    console.log(`  ${r.judge} -> ${r.company} (${r.role ?? 'unknown role'})`)
  }

  // 5. Judges matched to asset declarations (DDJJ)
  console.log('\n--- Judges matched to asset declarations (by DNI) ---')
  const ddjjMatches = await readQuery(
    `MATCH (j:Judge)-[r:MAYBE_SAME_AS]->(d:AssetDeclaration)
     WHERE r.match_method = 'dni_cuit'
     RETURN j.name AS judge, d.year AS year, d.agency AS agency,
            d.net_worth_end AS net_worth, d.total_net_income AS income
     ORDER BY d.net_worth_end DESC
     LIMIT 30`,
    {},
    (r) => ({
      judge: r.get('judge') as string,
      year: typeof r.get('year') === 'object' ? r.get('year').toNumber() : r.get('year'),
      agency: r.get('agency') as string,
      net_worth: r.get('net_worth'),
      income: r.get('income'),
    }),
  )
  if (ddjjMatches.records.length === 0) {
    console.log('  (none found - DDJJ may not have matching CUITs)')
  }
  for (const r of ddjjMatches.records) {
    const nw = typeof r.net_worth === 'number' ? r.net_worth.toLocaleString() : r.net_worth
    console.log(`  ${r.judge} | ${r.year} | ${r.agency} | net_worth: ${nw}`)
  }

  // 6. Summary stats
  console.log('\n--- Summary stats ---')
  const stats = await readQuery(
    `MATCH (j:Judge) RETURN count(j) AS judges
     UNION ALL
     MATCH (c:Court) RETURN count(c) AS judges
     UNION ALL
     MATCH ()-[r:APPOINTED_BY]->() RETURN count(r) AS judges
     UNION ALL
     MATCH ()-[r:SERVES_IN]->() RETURN count(r) AS judges
     UNION ALL
     MATCH (j:Judge)-[r:MAYBE_SAME_AS]->() RETURN count(r) AS judges`,
    {},
    (r) => {
      const v = r.get('judges')
      return typeof v === 'object' ? v.toNumber() : v
    },
  )
  const labels = ['Judges', 'Courts', 'APPOINTED_BY rels', 'SERVES_IN rels', 'MAYBE_SAME_AS rels (all)']
  for (let i = 0; i < stats.records.length; i++) {
    console.log(`  ${labels[i] ?? `stat ${i}`}: ${stats.records[i]}`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  // 1. Verify Neo4j connectivity
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // 2. Fetch existing graph data for cross-matching
  console.log('Loading existing graph data for cross-matching...')
  const [politicianLookup, ddjjDniLookup, companyOfficerNameLookup, boardMemberNameLookup] =
    await Promise.all([
      fetchPoliticianLookup(),
      fetchDdjjDniLookup(),
      fetchCompanyOfficerNameLookup(),
      fetchBoardMemberNameLookup(),
    ])
  console.log(`  Politicians:       ${politicianLookup.size}`)
  console.log(`  DDJJ DNI entries:  ${ddjjDniLookup.size}`)
  console.log(`  CompanyOfficers:   ${companyOfficerNameLookup.size}`)
  console.log(`  BoardMembers:      ${boardMemberNameLookup.size}\n`)

  // 3. Fetch judiciary data
  console.log('Fetching judiciary designation data...')
  const fetchStart = Date.now()
  const fetched = await fetchJudiciaryData()
  console.log(`  Fetch complete in ${formatDuration(Date.now() - fetchStart)}\n`)

  // 4. Transform
  console.log('Transforming data...')
  const transformStart = Date.now()
  const transformed = transformJudiciaryAll({
    rows: fetched.rows,
    politicianLookup,
    ddjjDniLookup,
    companyOfficerNameLookup,
    boardMemberNameLookup,
  })

  console.log(`  Judges:                    ${transformed.judges.length}`)
  console.log(`  Courts:                    ${transformed.courts.length}`)
  console.log(`  APPOINTED_BY rels:         ${transformed.appointedByRels.length}`)
  console.log(`  SERVES_IN rels:            ${transformed.servesInRels.length}`)
  console.log(`  Judge-Politician matches:  ${transformed.judgePoliticianRels.length}`)
  console.log(`  Judge-DDJJ matches:        ${transformed.judgeDdjjRels.length}`)
  console.log(`  Judge-CompanyOfficer:      ${transformed.judgeCompanyOfficerRels.length}`)
  console.log(`  Judge-BoardMember:         ${transformed.judgeBoardMemberRels.length}`)
  console.log(`  Transform complete in ${formatDuration(Date.now() - transformStart)}\n`)

  // 5. Load
  console.log('Loading into Neo4j...')
  const loadResult = await loadJudiciaryAll(transformed)

  for (const step of loadResult.steps) {
    const status = step.errors.length === 0 ? 'OK' : 'WARN'
    console.log(`  [${status}] ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)
    for (const err of step.errors) {
      console.error(`    ERROR: ${err}`)
    }
  }
  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // 6. Investigation queries
  await runInvestigationQueries()

  // Summary
  const totalDuration = Date.now() - pipelineStart
  console.log('\n' + '-'.repeat(60))
  console.log(`Judiciary ETL pipeline ${loadResult.totalErrors > 0 ? 'completed with errors' : 'completed successfully'}`)
  console.log(`  Total duration: ${formatDuration(totalDuration)}`)
  console.log(`  Load errors:    ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Judiciary ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
