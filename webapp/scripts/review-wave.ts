// Run with: npx tsx scripts/review-wave.ts --wave 1
//
// Quality gate: shows ingestion stats, conflicts, and a random sample of new nodes.

import { getDriver, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { loadConflicts } from '../src/lib/ingestion/quality'

const wave = parseInt(process.argv.find((a) => a.startsWith('--wave='))?.split('=')[1] ??
  process.argv[process.argv.indexOf('--wave') + 1] ?? '')

if (isNaN(wave)) {
  console.error('Usage: npx tsx scripts/review-wave.ts --wave N')
  process.exit(1)
}

async function main(): Promise<void> {
  const connected = await verifyConnectivity()
  if (!connected) { console.error('Failed to connect to Neo4j.'); process.exit(1) }

  const session = getDriver().session()
  try {
    // Node stats by type
    const statsResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave = $wave
       RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC`,
      { wave },
    )
    console.log(`\n=== Wave ${wave} Review ===\n`)
    console.log('Node counts by type:')
    let total = 0
    for (const record of statsResult.records) {
      const label = record.get('label') as string
      const count = (record.get('count') as { low: number }).low
      console.log(`  ${label}: ${count}`)
      total += count
    }
    console.log(`  TOTAL: ${total}`)

    // Edge stats
    const edgeResult = await session.run(
      `MATCH ()-[r]->() WHERE r.ingestion_wave = $wave
       RETURN type(r) AS relType, count(r) AS count ORDER BY count DESC`,
      { wave },
    )
    console.log('\nEdge counts by type:')
    let edgeTotal = 0
    for (const record of edgeResult.records) {
      const relType = record.get('relType') as string
      const count = (record.get('count') as { low: number }).low
      console.log(`  ${relType}: ${count}`)
      edgeTotal += count
    }
    console.log(`  TOTAL: ${edgeTotal}`)

    // Conflicts from file
    const conflicts = loadConflicts(wave)
    if (conflicts.length > 0) {
      console.log(`\n${conflicts.length} fuzzy match conflicts:`)
      for (const c of conflicts) {
        console.log(`  "${c.incomingName}" ≈ "${c.existingName}" (dist: ${c.distance})`)
      }
    } else {
      console.log('\nNo conflicts.')
    }

    // Random sample of 20 new nodes
    const sampleResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave = $wave
       WITH n, rand() AS r ORDER BY r LIMIT 20
       RETURN labels(n)[0] AS label, n.name AS name, n.id AS id, n.description AS desc`,
      { wave },
    )
    console.log('\nRandom sample of 20 new nodes:')
    for (const record of sampleResult.records) {
      const label = record.get('label') as string
      const name = record.get('name') as string
      const desc = (record.get('desc') as string)?.slice(0, 60) ?? ''
      console.log(`  [${label}] ${name}${desc ? ` — ${desc}...` : ''}`)
    }
  } finally {
    await session.close()
    await closeDriver()
  }
}

main().catch((error) => {
  console.error('Review failed:', error)
  closeDriver().finally(() => process.exit(1))
})
