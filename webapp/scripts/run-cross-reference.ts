/**
 * Cross-reference runner — links entities across all ETL data sources.
 *
 * Runs CUIT, DNI/CUIL, and name matching in sequence, generates
 * investigation flags, and loads SAME_ENTITY relationships into Neo4j.
 *
 * Usage:
 *   npx tsx scripts/run-cross-reference.ts
 */

import 'dotenv/config'

// Allow longer queries for cross-reference joins
process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { matchByCuit, matchByDni, matchByName } from '../src/etl/cross-reference/matchers'
import { loadCrossRefMatches } from '../src/etl/cross-reference/loader'
import type { CrossRefMatch, InvestigationFlag } from '../src/etl/cross-reference/types'

// ---------------------------------------------------------------------------
// Flag detection (runs after SAME_ENTITY rels are loaded)
// ---------------------------------------------------------------------------

import { runCrossReference } from '../src/etl/cross-reference/engine'

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Cross-Reference Engine')
  console.log('='.repeat(60))

  // Step 1: Verify Neo4j connectivity
  console.log('\nConnecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  const allMatches: CrossRefMatch[] = []

  // Step 2: Phase 1 — CUIT matching
  console.log('=== Phase 1: CUIT Matching (Contractor <-> Company) ===')
  const cuitMatches = await matchByCuit()
  allMatches.push(...cuitMatches)
  console.log(`  Found ${cuitMatches.length} CUIT matches (confidence: 1.0)`)
  for (const m of cuitMatches.slice(0, 5)) {
    console.log(`    ${m.evidence}`)
  }
  if (cuitMatches.length > 5) {
    console.log(`    ... and ${cuitMatches.length - 5} more`)
  }

  // Step 3: Phase 2 — DNI/CUIL matching
  console.log('\n=== Phase 2: DNI/CUIL Matching (GovernmentAppointment <-> CompanyOfficer) ===')
  const dniMatches = await matchByDni()
  allMatches.push(...dniMatches)
  console.log(`  Found ${dniMatches.length} DNI/CUIL matches (confidence: 0.9-0.95)`)
  for (const m of dniMatches.slice(0, 5)) {
    console.log(`    ${m.evidence}`)
  }
  if (dniMatches.length > 5) {
    console.log(`    ... and ${dniMatches.length - 5} more`)
  }

  // Step 4: Phase 3 — Name matching (unmatched only)
  console.log('\n=== Phase 3: Name Matching (unmatched entities only) ===')
  const alreadyMatchedIds = new Set<string>()
  for (const m of cuitMatches) {
    alreadyMatchedIds.add(m.source_id)
    alreadyMatchedIds.add(m.target_id)
  }
  for (const m of dniMatches) {
    alreadyMatchedIds.add(m.source_id)
    alreadyMatchedIds.add(m.target_id)
  }
  const nameMatches = await matchByName(alreadyMatchedIds)
  allMatches.push(...nameMatches)

  const exactNameCount = nameMatches.filter((m) => m.match_type === 'normalized_name').length
  const fuzzyNameCount = nameMatches.filter((m) => m.match_type === 'fuzzy_name').length
  console.log(`  Found ${nameMatches.length} name matches:`)
  console.log(`    Exact normalized: ${exactNameCount} (confidence: 0.8)`)
  console.log(`    Fuzzy (Levenshtein <= 2): ${fuzzyNameCount} (confidence: 0.6)`)
  for (const m of nameMatches.slice(0, 5)) {
    console.log(`    ${m.evidence}`)
  }
  if (nameMatches.length > 5) {
    console.log(`    ... and ${nameMatches.length - 5} more`)
  }

  // Step 5: Load SAME_ENTITY relationships
  console.log('\n=== Loading SAME_ENTITY Relationships ===')
  const loadResult = await loadCrossRefMatches(allMatches)
  console.log(`  Loaded ${loadResult.totalLoaded} relationships in ${loadResult.durationMs}ms`)
  for (const step of loadResult.steps) {
    console.log(`    ${step.label}: ${step.totalItems} items, ${step.batchesRun} batches`)
    for (const err of step.errors) {
      console.error(`      ERROR: ${err}`)
    }
  }

  // Step 6: Flag generation (runs against the just-loaded SAME_ENTITY rels)
  console.log('\n=== Phase 4: Investigation Flag Detection ===')
  const crossRefResult = await runCrossReference()
  const flags = crossRefResult.flags

  const flagsByType = new Map<string, InvestigationFlag[]>()
  for (const flag of flags) {
    const existing = flagsByType.get(flag.flag_type) || []
    existing.push(flag)
    flagsByType.set(flag.flag_type, existing)
  }

  console.log(`  Total flags: ${flags.length}`)
  for (const [flagType, flagList] of flagsByType) {
    console.log(`\n  [${flagType}] (${flagList.length} flagged)`)
    for (const f of flagList.slice(0, 5)) {
      console.log(`    - ${f.entity_name}: ${f.evidence}`)
    }
    if (flagList.length > 5) {
      console.log(`    ... and ${flagList.length - 5} more`)
    }
  }

  // Step 7: Summary
  console.log('\n' + '='.repeat(60))
  console.log('CROSS-REFERENCE SUMMARY')
  console.log('='.repeat(60))
  console.log(`  CUIT matches:           ${cuitMatches.length}`)
  console.log(`  DNI/CUIL matches:       ${dniMatches.length}`)
  console.log(`  Name matches (exact):   ${exactNameCount}`)
  console.log(`  Name matches (fuzzy):   ${fuzzyNameCount}`)
  console.log(`  Total SAME_ENTITY rels: ${allMatches.length}`)
  console.log(`  Investigation flags:    ${flags.length}`)
  if (loadResult.totalErrors > 0) {
    console.log(`  Load errors:            ${loadResult.totalErrors}`)
  }
  console.log(`  Duration:               ${crossRefResult.durationMs}ms (matching + flags)`)
  console.log(`                          ${loadResult.durationMs}ms (loading)`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Cross-reference engine failed:', error)
  closeDriver().finally(() => process.exit(1))
})
