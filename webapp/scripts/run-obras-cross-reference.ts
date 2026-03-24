/**
 * Cross-reference runner for obras-publicas investigation.
 * Run with: npx tsx scripts/run-obras-cross-reference.ts
 *
 * Runs the full cross-reference engine (CUIT, DNI, name matching)
 * then detects obras-publicas-specific flags.
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '120000'

import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { runCrossReference } from '../src/etl/cross-reference/engine'
import { loadCrossRefMatches } from '../src/etl/cross-reference/loader'
import { detectObrasFlags } from '../src/etl/cross-reference/obras-publicas-matchers'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${((ms % 60_000) / 1000).toFixed(0)}s`
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // -- 1. Run full cross-reference engine ------------------------------------
  console.log('=== CROSS-REFERENCE ENGINE ===')
  const crossRefStart = Date.now()
  const crossRef = await runCrossReference()

  console.log(`\n  CUIT matches:  ${crossRef.cuitMatches.length}`)
  console.log(`  DNI matches:   ${crossRef.dniMatches.length}`)
  console.log(`  Name matches:  ${crossRef.nameMatches.length}`)
  console.log(`  Flags:         ${crossRef.flags.length}`)
  console.log(`  Duration:      ${formatDuration(crossRef.durationMs)}\n`)

  // Show match breakdown by label pair
  const pairCounts = new Map<string, number>()
  for (const m of [...crossRef.cuitMatches, ...crossRef.dniMatches, ...crossRef.nameMatches]) {
    const pair = `${m.source_label} <-> ${m.target_label}`
    pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1)
  }
  console.log('  Match breakdown:')
  for (const [pair, count] of [...pairCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${pair}: ${count}`)
  }

  // -- 2. Load SAME_ENTITY rels into Neo4j -----------------------------------
  console.log('\nLoading SAME_ENTITY relationships...')
  const allMatches = [...crossRef.cuitMatches, ...crossRef.dniMatches, ...crossRef.nameMatches]
  const loadResult = await loadCrossRefMatches(allMatches)
  console.log(`  Loaded ${loadResult.totalLoaded} SAME_ENTITY rels (${loadResult.totalErrors} errors)`)
  for (const step of loadResult.steps) {
    if (step.errors.length > 0) {
      const status = '[!!]'
      console.log(`  ${status} ${step.label}: ${step.totalItems} items`)
      for (const err of step.errors.slice(0, 3)) {
        console.error(`    ERROR: ${err}`)
      }
    }
  }

  // -- 3. Detect obras-publicas-specific flags --------------------------------
  console.log('\n=== OBRAS-PUBLICAS FLAGS ===')
  const flagsStart = Date.now()
  const obrasFlags = await detectObrasFlags()

  // Group by type
  const flagsByType = new Map<string, number>()
  for (const f of obrasFlags) {
    flagsByType.set(f.flag_type, (flagsByType.get(f.flag_type) ?? 0) + 1)
  }
  console.log(`  Total flags: ${obrasFlags.length}`)
  for (const [type, count] of [...flagsByType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type}: ${count}`)
  }
  console.log(`  Flag detection: ${formatDuration(Date.now() - flagsStart)}`)

  // Show top flagged entities
  if (obrasFlags.length > 0) {
    console.log('\n  Top flagged entities:')
    const entityFlags = new Map<string, { name: string; flags: string[] }>()
    for (const f of obrasFlags) {
      const entry = entityFlags.get(f.entity_id) ?? { name: f.entity_name, flags: [] }
      entry.flags.push(f.flag_type)
      entityFlags.set(f.entity_id, entry)
    }
    const sorted = [...entityFlags.entries()].sort((a, b) => b[1].flags.length - a[1].flags.length)
    for (const [id, { name, flags }] of sorted.slice(0, 20)) {
      console.log(`    ${name}: ${flags.join(', ')}`)
    }
  }

  // Show existing cross-ref flags too
  if (crossRef.flags.length > 0) {
    console.log('\n  Cross-ref flags (from engine):')
    const cfByType = new Map<string, number>()
    for (const f of crossRef.flags) {
      cfByType.set(f.flag_type, (cfByType.get(f.flag_type) ?? 0) + 1)
    }
    for (const [type, count] of [...cfByType.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`    ${type}: ${count}`)
    }
  }

  // -- Summary ----------------------------------------------------------------
  const totalDuration = Date.now() - pipelineStart
  const totalMatches = crossRef.cuitMatches.length + crossRef.dniMatches.length + crossRef.nameMatches.length
  const totalFlags = crossRef.flags.length + obrasFlags.length

  console.log('\n' + '='.repeat(50))
  console.log('Cross-reference complete')
  console.log(`  Total SAME_ENTITY matches: ${totalMatches}`)
  console.log(`  Total investigation flags: ${totalFlags}`)
  console.log(`  Total duration:           ${formatDuration(totalDuration)}`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Cross-reference failed:', error)
  closeDriver().finally(() => process.exit(1))
})
