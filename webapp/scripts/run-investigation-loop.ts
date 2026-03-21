/**
 * Investigation Loop — Finanzas Políticas cross-referencing engine.
 *
 * Orchestrates a four-phase cycle:
 *   Phase 1: Ingest (Compr.ar, Boletín Oficial, IGJ)
 *   Phase 2: Cross-reference (CUIT → DNI/CUIL → name matching)
 *   Phase 3: Analyze (MiroFish/Qwen 3.5 anomaly detection)
 *   Phase 4: Report (bilingual ES/EN findings)
 *
 * Run with: npx tsx scripts/run-investigation-loop.ts
 */

import 'dotenv/config'
import * as readline from 'node:readline'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import neo4j from 'neo4j-driver-lite'
import { readQuery, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}min`
}

function formatArs(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B ARS`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M ARS`
  return `$${amount.toFixed(0)} ARS`
}

async function askUser(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

// ---------------------------------------------------------------------------
// Phase 0: Status check
// ---------------------------------------------------------------------------

interface GraphStatus {
  contractors: number
  companies: number
  contracts: number
  appointments: number
  officers: number
  politicians: number
  sameEntityRels: number
  maybeSameAsRels: number
  totalContractValue: number
}

async function checkGraphStatus(): Promise<GraphStatus> {
  const counts = await readQuery(
    `OPTIONAL MATCH (ct:Contractor)
     WITH count(ct) AS contractors
     OPTIONAL MATCH (co:Company)
     WITH contractors, count(co) AS companies
     OPTIONAL MATCH (pc:PublicContract)
     WITH contractors, companies, count(pc) AS contracts
     OPTIONAL MATCH (ga:GovernmentAppointment)
     WITH contractors, companies, contracts, count(ga) AS appointments
     OPTIONAL MATCH (co2:CompanyOfficer)
     WITH contractors, companies, contracts, appointments, count(co2) AS officers
     OPTIONAL MATCH (p:Politician)
     WITH contractors, companies, contracts, appointments, officers, count(p) AS politicians
     OPTIONAL MATCH ()-[se:SAME_ENTITY]->()
     WITH contractors, companies, contracts, appointments, officers, politicians, count(se) AS sameEntity
     OPTIONAL MATCH ()-[ms:MAYBE_SAME_AS]->()
     RETURN contractors, companies, contracts, appointments, officers, politicians,
            sameEntity, count(ms) AS maybeSameAs`,
    {},
    (r) => {
      const toNum = (v: unknown) => typeof v === 'object' && v !== null && 'toNumber' in v
        ? (v as { toNumber(): number }).toNumber() : (v as number) ?? 0
      return {
        contractors: toNum(r.get('contractors')),
        companies: toNum(r.get('companies')),
        contracts: toNum(r.get('contracts')),
        appointments: toNum(r.get('appointments')),
        officers: toNum(r.get('officers')),
        politicians: toNum(r.get('politicians')),
        sameEntityRels: toNum(r.get('sameEntity')),
        maybeSameAsRels: toNum(r.get('maybeSameAs')),
      }
    },
  )

  const totalValue = await readQuery(
    `MATCH ()-[r:AWARDED_TO]->()
     RETURN sum(r.monto) AS total`,
    {},
    (r) => {
      const v = r.get('total')
      return typeof v === 'object' && v !== null && 'toNumber' in v
        ? (v as { toNumber(): number }).toNumber() : (v as number) ?? 0
    },
  )

  const status = counts.records[0] ?? {
    contractors: 0, companies: 0, contracts: 0, appointments: 0,
    officers: 0, politicians: 0, sameEntityRels: 0, maybeSameAsRels: 0,
  }

  return {
    ...status,
    totalContractValue: totalValue.records[0] ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Phase 1: Ingest
// ---------------------------------------------------------------------------

async function runIngestion(): Promise<{ etlsRun: string[]; skipped: string[]; errors: string[] }> {
  const etlsRun: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  // Dynamic imports to avoid failing if modules don't exist yet
  const etlModules = [
    { name: 'comprar', path: '../src/etl/comprar' },
    { name: 'boletin-oficial', path: '../src/etl/boletin-oficial' },
    { name: 'opencorporates', path: '../src/etl/opencorporates' },
  ]

  for (const etl of etlModules) {
    try {
      console.log(`  Running ETL: ${etl.name}...`)
      const mod = await import(etl.path)

      if (mod.fetchComprarData && mod.transformComprarAll && mod.loadComprarAll) {
        // Compr.ar ETL
        const fetched = await mod.fetchComprarData()
        // Fetch politicians for matching
        const politicians = await fetchPoliticians()
        const transformed = mod.transformComprarAll({ ...fetched, politicians })
        await mod.loadComprarAll(transformed)
        etlsRun.push(etl.name)
      } else if (mod.fetchBoletinData && mod.transformBoletinAll && mod.loadBoletinAll) {
        // Boletin Oficial ETL
        const fetched = await mod.fetchBoletinData()
        const politicians = await fetchPoliticians()
        const transformed = mod.transformBoletinAll({ ...fetched, politicians })
        await mod.loadBoletinAll(transformed)
        etlsRun.push(etl.name)
      } else if (mod.fetchIgjData && mod.transformIgjAll && mod.loadIgjAll) {
        // OpenCorporates/IGJ ETL
        const fetched = await mod.fetchIgjData()
        const politicians = await fetchPoliticians()
        const transformed = mod.transformIgjAll({ ...fetched, politicians })
        await mod.loadIgjAll(transformed)
        etlsRun.push(etl.name)
      } else {
        skipped.push(`${etl.name} (no matching exports)`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('Cannot find module') || msg.includes('MODULE_NOT_FOUND')) {
        skipped.push(`${etl.name} (module not found)`)
      } else {
        errors.push(`${etl.name}: ${msg}`)
      }
    }
  }

  return { etlsRun, skipped, errors }
}

async function fetchPoliticians() {
  const result = await readQuery(
    `MATCH (p:Politician)
     RETURN p.id AS id, p.name AS name, p.full_name AS full_name,
            p.name_key AS name_key, p.slug AS slug`,
    {},
    (r) => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      full_name: r.get('full_name') as string,
      name_key: r.get('name_key') as string,
      slug: r.get('slug') as string,
    }),
  )
  return [...result.records]
}

// ---------------------------------------------------------------------------
// Phase 2: Cross-reference
// ---------------------------------------------------------------------------

async function runCrossReferencePhase() {
  try {
    const { runCrossReference } = await import('../src/etl/cross-reference')
    return await runCrossReference()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('Cannot find module')) {
      console.log('  Cross-reference module not found. Skipping.')
      return null
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Analyze with MiroFish/Qwen
// ---------------------------------------------------------------------------

async function runAnalysisPhase() {
  try {
    const { analyzeProcurementAnomalies, analyzeOwnershipChains, analyzePoliticalConnections } =
      await import('../src/lib/mirofish/analysis')

    // Extract subgraph data for analysis
    const subgraph = await readQuery(
      `MATCH (ct:Contractor)-[se:SAME_ENTITY]-(co:Company)-[oc:OFFICER_OF_COMPANY]-(off:CompanyOfficer)
       OPTIONAL MATCH (ct)<-[aw:AWARDED_TO]-(pc:PublicContract)
       OPTIONAL MATCH (off)-[ms:MAYBE_SAME_AS]-(p:Politician)
       RETURN ct.name AS contractor, ct.cuit AS cuit,
              co.name AS company, off.name AS officer,
              pc.organismo AS agency, pc.monto AS monto,
              p.name AS politician
       LIMIT $limit`,
      { limit: neo4j.int(200) },
      (r) => ({
        contractor: r.get('contractor'),
        cuit: r.get('cuit'),
        company: r.get('company'),
        officer: r.get('officer'),
        agency: r.get('agency'),
        monto: r.get('monto'),
        politician: r.get('politician'),
      }),
    )

    if (subgraph.records.length === 0) {
      console.log('  No cross-referenced data available for analysis.')
      return null
    }

    const subgraphJson = JSON.stringify(subgraph.records, null, 2)
    console.log(`  Analyzing ${subgraph.records.length} cross-referenced entities...`)

    const results = await Promise.allSettled([
      analyzeProcurementAnomalies(subgraphJson),
      analyzeOwnershipChains(subgraphJson),
      analyzePoliticalConnections(subgraphJson),
    ])

    return results.map((r, i) => {
      const label = ['procurement', 'ownership', 'political'][i]
      if (r.status === 'fulfilled') return { label, ...r.value }
      return { label, success: false, error: r.reason?.message ?? 'Unknown error' }
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('Cannot find module')) {
      console.log('  MiroFish analysis module not found. Skipping.')
      return null
    }
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      console.log('  MiroFish/llama-server not running. Skipping analysis.')
      console.log('  Start with: /home/vg/dev/llama.cpp/build/bin/llama-server \\')
      console.log('    -m /home/vg/models/Qwen3.5-9B-Q5_K_M.gguf --port 8080 --n-gpu-layers 99 --ctx-size 8192')
      return null
    }
    throw error
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Report
// ---------------------------------------------------------------------------

function printReport(
  statusBefore: GraphStatus,
  statusAfter: GraphStatus,
  crossRefResult: unknown,
  analysisResults: unknown,
  cycleDurationMs: number,
) {
  console.log('\n' + '═'.repeat(70))
  console.log('  INVESTIGATION LOOP — CYCLE REPORT')
  console.log('  Finanzas Políticas / Argentine Political Finance')
  console.log('═'.repeat(70))

  console.log('\n📊 Graph Status (before → after):')
  console.log(`  Contractors:     ${statusBefore.contractors} → ${statusAfter.contractors}`)
  console.log(`  Companies (IGJ): ${statusBefore.companies} → ${statusAfter.companies}`)
  console.log(`  Contracts:       ${statusBefore.contracts} → ${statusAfter.contracts}`)
  console.log(`  Appointments:    ${statusBefore.appointments} → ${statusAfter.appointments}`)
  console.log(`  Officers:        ${statusBefore.officers} → ${statusAfter.officers}`)
  console.log(`  Politicians:     ${statusBefore.politicians} → ${statusAfter.politicians}`)

  console.log('\n🔗 Cross-Reference Links:')
  console.log(`  SAME_ENTITY:    ${statusBefore.sameEntityRels} → ${statusAfter.sameEntityRels}`)
  console.log(`  MAYBE_SAME_AS:  ${statusBefore.maybeSameAsRels} → ${statusAfter.maybeSameAsRels}`)

  console.log(`\n💰 Total Contract Value: ${formatArs(statusAfter.totalContractValue)}`)

  if (crossRefResult && typeof crossRefResult === 'object' && 'cuitMatches' in crossRefResult) {
    const cr = crossRefResult as unknown as { cuitMatches: unknown[]; dniMatches: unknown[]; nameMatches: unknown[]; flags: unknown[] }
    console.log('\n🔍 Cross-Reference Results (this cycle):')
    console.log(`  CUIT matches:  ${cr.cuitMatches.length}`)
    console.log(`  DNI matches:   ${cr.dniMatches.length}`)
    console.log(`  Name matches:  ${cr.nameMatches.length}`)
    console.log(`  Flags raised:  ${cr.flags.length}`)
  }

  if (analysisResults && Array.isArray(analysisResults)) {
    console.log('\n🧠 MiroFish Analysis:')
    for (const r of analysisResults) {
      const result = r as { label: string; success: boolean; error?: string }
      if (result.success) {
        console.log(`  ✓ ${result.label} — completed`)
      } else {
        console.log(`  ✗ ${result.label} — ${result.error ?? 'failed'}`)
      }
    }
  }

  console.log(`\n⏱  Cycle duration: ${formatDuration(cycleDurationMs)}`)
  console.log('═'.repeat(70))
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

async function runCycle(): Promise<void> {
  const cycleStart = Date.now()

  // ── Phase 0: Status ────────────────────────────────────────────────
  console.log('\n=== Phase 0: Graph Status Check ===')
  const statusBefore = await checkGraphStatus()
  console.log(`  Contractors: ${statusBefore.contractors}`)
  console.log(`  Companies: ${statusBefore.companies}`)
  console.log(`  Contracts: ${statusBefore.contracts}`)
  console.log(`  SAME_ENTITY links: ${statusBefore.sameEntityRels}`)
  console.log(`  MAYBE_SAME_AS links: ${statusBefore.maybeSameAsRels}`)
  console.log(`  Total contract value: ${formatArs(statusBefore.totalContractValue)}`)

  // ── Phase 1: Ingest ────────────────────────────────────────────────
  console.log('\n=== Phase 1: Data Ingestion ===')
  const ingestionResult = await runIngestion()
  console.log(`  ETLs run: ${ingestionResult.etlsRun.join(', ') || 'none'}`)
  if (ingestionResult.skipped.length > 0) {
    console.log(`  Skipped: ${ingestionResult.skipped.join(', ')}`)
  }
  if (ingestionResult.errors.length > 0) {
    console.log(`  Errors: ${ingestionResult.errors.join('; ')}`)
  }

  // ── Phase 2: Cross-Reference ──────────────────────────────────────
  console.log('\n=== Phase 2: Cross-Reference ===')
  const crossRefResult = await runCrossReferencePhase()
  if (crossRefResult) {
    const cr = crossRefResult as unknown as { cuitMatches: unknown[]; dniMatches: unknown[]; nameMatches: unknown[]; flags: unknown[] }
    console.log(`  CUIT matches: ${cr.cuitMatches.length}`)
    console.log(`  DNI matches: ${cr.dniMatches.length}`)
    console.log(`  Name matches: ${cr.nameMatches.length}`)
    console.log(`  Flags: ${cr.flags.length}`)
  }

  // ── Phase 3: Analyze ──────────────────────────────────────────────
  console.log('\n=== Phase 3: MiroFish Analysis ===')
  const analysisResults = await runAnalysisPhase()

  // ── Phase 4: Report ───────────────────────────────────────────────
  const statusAfter = await checkGraphStatus()
  printReport(statusBefore, statusAfter, crossRefResult, analysisResults, Date.now() - cycleStart)
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  Investigation Loop Engine — Finanzas Políticas     ║')
  console.log('║  Compr.ar × AFIP/IGJ × Boletín Oficial             ║')
  console.log('╚══════════════════════════════════════════════════════╝')

  console.log('\nConnecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.')

  let running = true
  while (running) {
    await runCycle()

    const answer = await askUser('\nRun another cycle? (y/n): ')
    running = answer === 'y' || answer === 'yes' || answer === 's' || answer === 'si'
  }

  console.log('\nInvestigation loop ended.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
