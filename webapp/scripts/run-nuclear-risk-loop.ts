#!/usr/bin/env npx tsx
/**
 * Nuclear Risk Daily Pipeline — monitors global nuclear threat signals.
 *
 * Orchestrates a five-phase cycle:
 *   Phase 0: Status check (node/relationship counts)
 *   Phase 1: Ingest (Wave 0 — IAEA, NATO, US DoD, State Dept, ACA, Bulletin)
 *   Phase 2: Cross-reference (placeholder — requires LLM entity extraction)
 *   Phase 3: LLM analysis (placeholder — requires llama.cpp)
 *   Phase 4: Report (deltas + timing)
 *
 * Run with: npx tsx scripts/run-nuclear-risk-loop.ts
 */

import 'dotenv/config'

import { getDriver } from '../src/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'
import {
  classifySignals,
  applyClassifications,
  detectPatterns,
  generateBriefing,
  saveBriefing,
  type SignalForClassification,
} from '../src/etl/nuclear-risk/shared/llm-analysis'
import { isLlmAvailable as checkLlm } from '../src/etl/nuclear-risk/shared/llm-client'

// ---------------------------------------------------------------------------
// Phase runner with timeout
// ---------------------------------------------------------------------------

async function runPhase(name: string, fn: () => Promise<void>, timeoutMs: number = 300_000) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Phase: ${name}`)
  console.log('='.repeat(60))
  const start = Date.now()
  try {
    await Promise.race([
      fn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Phase "${name}" timed out after ${timeoutMs}ms`)), timeoutMs)),
    ])
    console.log(`✓ ${name} completed in ${((Date.now() - start) / 1000).toFixed(1)}s`)
  } catch (error) {
    console.error(`✗ ${name} failed after ${((Date.now() - start) / 1000).toFixed(1)}s:`, error)
  }
}

// ---------------------------------------------------------------------------
// Phase 0 & 4: Status check
// ---------------------------------------------------------------------------

interface NuclearGraphStatus {
  nuclearSignals: number
  nuclearActors: number
  weaponSystems: number
  treaties: number
  nuclearFacilities: number
  riskBriefings: number
  involvesRels: number
  referencesSystemRels: number
  totalRels: number
}

async function checkGraphStatus(): Promise<NuclearGraphStatus> {
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })
  try {
    const result = await session.run(
      `OPTIONAL MATCH (ns:NuclearSignal)
       WITH count(ns) AS nuclearSignals
       OPTIONAL MATCH (na:NuclearActor)
       WITH nuclearSignals, count(na) AS nuclearActors
       OPTIONAL MATCH (ws:WeaponSystem)
       WITH nuclearSignals, nuclearActors, count(ws) AS weaponSystems
       OPTIONAL MATCH (t:Treaty)
       WITH nuclearSignals, nuclearActors, weaponSystems, count(t) AS treaties
       OPTIONAL MATCH (nf:NuclearFacility)
       WITH nuclearSignals, nuclearActors, weaponSystems, treaties, count(nf) AS nuclearFacilities
       OPTIONAL MATCH (rb:RiskBriefing)
       WITH nuclearSignals, nuclearActors, weaponSystems, treaties, nuclearFacilities, count(rb) AS riskBriefings
       OPTIONAL MATCH ()-[inv:INVOLVES]->()
       WITH nuclearSignals, nuclearActors, weaponSystems, treaties, nuclearFacilities, riskBriefings, count(inv) AS involvesRels
       OPTIONAL MATCH ()-[rs:REFERENCES_SYSTEM]->()
       WITH nuclearSignals, nuclearActors, weaponSystems, treaties, nuclearFacilities, riskBriefings, involvesRels, count(rs) AS referencesSystemRels
       OPTIONAL MATCH ()-[r]->()
       RETURN nuclearSignals, nuclearActors, weaponSystems, treaties, nuclearFacilities, riskBriefings,
              involvesRels, referencesSystemRels, count(r) AS totalRels`,
    )

    const record = result.records[0]
    if (!record) {
      return { nuclearSignals: 0, nuclearActors: 0, weaponSystems: 0, treaties: 0, nuclearFacilities: 0, riskBriefings: 0, involvesRels: 0, referencesSystemRels: 0, totalRels: 0 }
    }

    const toNum = (v: unknown) => {
      if (typeof v === 'number') return v
      if (typeof v === 'object' && v !== null && 'toNumber' in v) return (v as { toNumber(): number }).toNumber()
      return 0
    }

    return {
      nuclearSignals: toNum(record.get('nuclearSignals')),
      nuclearActors: toNum(record.get('nuclearActors')),
      weaponSystems: toNum(record.get('weaponSystems')),
      treaties: toNum(record.get('treaties')),
      nuclearFacilities: toNum(record.get('nuclearFacilities')),
      riskBriefings: toNum(record.get('riskBriefings')),
      involvesRels: toNum(record.get('involvesRels')),
      referencesSystemRels: toNum(record.get('referencesSystemRels')),
      totalRels: toNum(record.get('totalRels')),
    }
  } finally {
    await session.close()
  }
}

function printStatusTable(status: NuclearGraphStatus) {
  console.log('  Nodes:')
  console.log(`    NuclearSignal:    ${status.nuclearSignals}`)
  console.log(`    NuclearActor:     ${status.nuclearActors}`)
  console.log(`    WeaponSystem:     ${status.weaponSystems}`)
  console.log(`    Treaty:           ${status.treaties}`)
  console.log(`    NuclearFacility:  ${status.nuclearFacilities}`)
  console.log(`    RiskBriefing:     ${status.riskBriefings}`)
  console.log('  Relationships:')
  console.log(`    INVOLVES:           ${status.involvesRels}`)
  console.log(`    REFERENCES_SYSTEM:  ${status.referencesSystemRels}`)
  console.log(`    Total:              ${status.totalRels}`)
}

// ---------------------------------------------------------------------------
// Phase 1: Ingest — Wave 0 sources
// ---------------------------------------------------------------------------

interface SourceResult {
  name: string
  fetched: number
  loaded: number
  error?: string
}

// Import all source modules directly
import { fetchIaeaData, transformIaeaItems, loadIaeaSignals } from '../src/etl/nuclear-risk/iaea'
import { fetchNatoData, transformNatoItems, loadNatoSignals } from '../src/etl/nuclear-risk/nato'
import { fetchUsDodData, transformUsDodItems, loadUsDodSignals } from '../src/etl/nuclear-risk/us-dod'
import { fetchStateDeptData, transformStateDeptItems, loadStateDeptSignals } from '../src/etl/nuclear-risk/state-dept'
import { fetchAcaData, transformAcaItems, loadAcaSignals } from '../src/etl/nuclear-risk/aca'
import { fetchBulletinData, transformBulletinItems, loadBulletinSignals } from '../src/etl/nuclear-risk/bulletin'

async function runSingleSource(name: string, fn: () => Promise<SourceResult>): Promise<SourceResult> {
  try {
    return await fn()
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { name, fetched: 0, loaded: 0, error: msg }
  }
}

async function runIngestion(): Promise<SourceResult[]> {
  const tasks = [
    runSingleSource('IAEA', async () => {
      const { items } = await fetchIaeaData()
      const { signals } = transformIaeaItems(items)
      const { nodesCreated } = await loadIaeaSignals(signals)
      return { name: 'IAEA', fetched: items.length, loaded: nodesCreated }
    }),
    runSingleSource('NATO', async () => {
      const { items } = await fetchNatoData()
      const { signals } = transformNatoItems(items)
      const { nodesCreated } = await loadNatoSignals(signals)
      return { name: 'NATO', fetched: items.length, loaded: nodesCreated }
    }),
    runSingleSource('US DoD', async () => {
      const { items } = await fetchUsDodData()
      const { signals } = transformUsDodItems(items)
      const { nodesCreated } = await loadUsDodSignals(signals)
      return { name: 'US DoD', fetched: items.length, loaded: nodesCreated }
    }),
    runSingleSource('State Dept', async () => {
      const { items } = await fetchStateDeptData()
      const { signals } = transformStateDeptItems(items)
      const { nodesCreated } = await loadStateDeptSignals(signals)
      return { name: 'State Dept', fetched: items.length, loaded: nodesCreated }
    }),
    runSingleSource('ACA', async () => {
      const { items } = await fetchAcaData()
      const { signals } = transformAcaItems(items)
      const { nodesCreated } = await loadAcaSignals(signals)
      return { name: 'ACA', fetched: items.length, loaded: nodesCreated }
    }),
    runSingleSource('Bulletin', async () => {
      const { items } = await fetchBulletinData()
      const { signals } = transformBulletinItems(items)
      const { nodesCreated } = await loadBulletinSignals(signals)
      return { name: 'Bulletin', fetched: items.length, loaded: nodesCreated }
    }),
  ]

  const results = await Promise.allSettled(tasks)
  return results.map((r, i) => {
    const names = ['IAEA', 'NATO', 'US DoD', 'State Dept', 'ACA', 'Bulletin']
    if (r.status === 'fulfilled') return r.value
    return { name: names[i], fetched: 0, loaded: 0, error: r.reason?.message ?? 'Unknown error' }
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════════╗')
  console.log('║  Nuclear Risk Daily Pipeline                        ║')
  console.log('║  IAEA × NATO × DoD × State Dept × ACA × Bulletin   ║')
  console.log('╚══════════════════════════════════════════════════════╝')

  const pipelineStart = Date.now()

  // Verify Neo4j connectivity
  const driver = getDriver()
  const testSession = driver.session({ defaultAccessMode: 'READ' })
  try {
    await testSession.run('RETURN 1')
    console.log('\nConnected to Neo4j.')
  } catch (error) {
    console.error('Failed to connect to Neo4j:', error)
    process.exit(1)
  } finally {
    await testSession.close()
  }

  // ── Phase 0: Status Check ──────────────────────────────────────────
  let statusBefore: NuclearGraphStatus = {
    nuclearSignals: 0, nuclearActors: 0, weaponSystems: 0,
    treaties: 0, nuclearFacilities: 0, riskBriefings: 0,
    involvesRels: 0, referencesSystemRels: 0, totalRels: 0,
  }

  await runPhase('0 — Status Check', async () => {
    statusBefore = await checkGraphStatus()
    printStatusTable(statusBefore)
  })

  // ── Phase 1: Ingest ────────────────────────────────────────────────
  let sourceResults: SourceResult[] = []

  await runPhase('1 — Ingest (Wave 0 sources)', async () => {
    sourceResults = await runIngestion()

    for (const src of sourceResults) {
      if (src.error) {
        console.log(`  [${src.name}] error: ${src.error}`)
      } else {
        console.log(`  [${src.name}] fetched: ${src.fetched}, loaded: ${src.loaded}`)
      }
    }

    const totalFetched = sourceResults.reduce((sum, s) => sum + s.fetched, 0)
    const totalLoaded = sourceResults.reduce((sum, s) => sum + s.loaded, 0)
    const totalErrors = sourceResults.filter((s) => s.error).length
    console.log(`  Total: ${totalFetched} fetched, ${totalLoaded} loaded, ${totalErrors} errors`)
  })

  // ── Phase 2: Cross-Reference ──────────────────────────────────────
  await runPhase('2 — Cross-Reference', async () => {
    console.log('  Cross-reference — not yet implemented (requires LLM for entity extraction)')
  })

  // ── Phase 3: LLM Analysis ─────────────────────────────────────────
  await runPhase('3 — LLM Analysis (Qwen 3.5)', async () => {
    const available = await checkLlm()
    if (!available) {
      console.log('  LLM analysis — skipped (llama.cpp not running)')
      return
    }

    // Step 1: Get unclassified signals from Neo4j
    const session = driver.session({ defaultAccessMode: 'READ' })
    let unclassified: SignalForClassification[] = []
    try {
      const result = await session.run(
        `MATCH (s:NuclearSignal)
         WHERE s.severity IS NULL OR s.escalation_level IS NULL
         RETURN s.id AS id, s.title_en AS title_en, s.summary_en AS summary_en,
                s.source_module AS source_module, s.tier AS tier
         ORDER BY s.date DESC
         LIMIT $limit`,
        { limit: neo4j.int(50) },
      )
      unclassified = result.records.map(r => ({
        id: r.get('id') as string,
        title_en: r.get('title_en') as string,
        summary_en: r.get('summary_en') as string,
        source_module: r.get('source_module') as string ?? 'unknown',
        tier: r.get('tier') as string ?? 'bronze',
      }))
    } finally {
      await session.close()
    }

    if (unclassified.length === 0) {
      console.log('  No unclassified signals — skipping classification')
    } else {
      // Task 1: Classify signals
      console.log(`  Task 1: Classifying ${unclassified.length} signals...`)
      const classifications = await classifySignals(unclassified)
      const updated = await applyClassifications(classifications)
      console.log(`  Classified ${updated} signals`)

      // Task 2: Pattern detection
      console.log('  Task 2: Detecting escalation patterns...')
      const patterns = await detectPatterns()
      for (const p of patterns) {
        const flags = [...p.convergence_flags, ...p.anomaly_flags]
        console.log(`    ${p.theater}: trend=${p.trend}${flags.length > 0 ? `, flags: ${flags.length}` : ''}`)
      }

      // Task 3: Generate briefing
      console.log('  Task 3: Generating risk briefing...')
      const briefing = await generateBriefing(patterns, classifications)
      const briefingId = await saveBriefing(briefing)
      console.log(`  Briefing saved: ${briefingId} (overall score: ${briefing.overall_score})`)
      console.log(`  Summary: ${briefing.summary_en.slice(0, 200)}...`)
    }
  }, 600_000) // 10 minute timeout for LLM phase

  // ── Phase 4: Report ────────────────────────────────────────────────
  await runPhase('4 — Report', async () => {
    const statusAfter = await checkGraphStatus()

    console.log('\n  Delta (before -> after):')
    console.log(`    NuclearSignal:    ${statusBefore.nuclearSignals} -> ${statusAfter.nuclearSignals} (${statusAfter.nuclearSignals - statusBefore.nuclearSignals >= 0 ? '+' : ''}${statusAfter.nuclearSignals - statusBefore.nuclearSignals})`)
    console.log(`    NuclearActor:     ${statusBefore.nuclearActors} -> ${statusAfter.nuclearActors} (${statusAfter.nuclearActors - statusBefore.nuclearActors >= 0 ? '+' : ''}${statusAfter.nuclearActors - statusBefore.nuclearActors})`)
    console.log(`    WeaponSystem:     ${statusBefore.weaponSystems} -> ${statusAfter.weaponSystems} (${statusAfter.weaponSystems - statusBefore.weaponSystems >= 0 ? '+' : ''}${statusAfter.weaponSystems - statusBefore.weaponSystems})`)
    console.log(`    Treaty:           ${statusBefore.treaties} -> ${statusAfter.treaties} (${statusAfter.treaties - statusBefore.treaties >= 0 ? '+' : ''}${statusAfter.treaties - statusBefore.treaties})`)
    console.log(`    NuclearFacility:  ${statusBefore.nuclearFacilities} -> ${statusAfter.nuclearFacilities} (${statusAfter.nuclearFacilities - statusBefore.nuclearFacilities >= 0 ? '+' : ''}${statusAfter.nuclearFacilities - statusBefore.nuclearFacilities})`)
    console.log(`    RiskBriefing:     ${statusBefore.riskBriefings} -> ${statusAfter.riskBriefings} (${statusAfter.riskBriefings - statusBefore.riskBriefings >= 0 ? '+' : ''}${statusAfter.riskBriefings - statusBefore.riskBriefings})`)
    console.log(`    INVOLVES:         ${statusBefore.involvesRels} -> ${statusAfter.involvesRels} (${statusAfter.involvesRels - statusBefore.involvesRels >= 0 ? '+' : ''}${statusAfter.involvesRels - statusBefore.involvesRels})`)
    console.log(`    REFERENCES_SYSTEM: ${statusBefore.referencesSystemRels} -> ${statusAfter.referencesSystemRels} (${statusAfter.referencesSystemRels - statusBefore.referencesSystemRels >= 0 ? '+' : ''}${statusAfter.referencesSystemRels - statusBefore.referencesSystemRels})`)

    const durationMs = Date.now() - pipelineStart
    const durationSec = (durationMs / 1000).toFixed(1)
    console.log(`\n  Timestamp: ${new Date().toISOString()}`)
    console.log(`  Duration:  ${durationSec}s`)
  })

  // Cleanup
  await driver.close()
  console.log('\nPipeline complete. Driver closed.')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
