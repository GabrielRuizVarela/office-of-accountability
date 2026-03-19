// Run with: npx tsx scripts/backfill-tiers.ts
//
// Adds ingestion_wave, confidence_tier, and source properties
// to all existing nodes that don't have them (original seed data).

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

const LABELS = ['Person', 'Location', 'Event', 'Document', 'Organization', 'LegalCase', 'Flight']

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }

  for (const label of LABELS) {
    const result = await executeWrite(
      `MATCH (n:${label})
       WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave IS NULL
       SET n.ingestion_wave = 0,
           n.confidence_tier = 'gold',
           n.source = 'seed'
       RETURN count(n) AS updated`,
    )
    const count = result.records.length > 0 ? 'done' : '0'
    console.log(`  ${label}: ${count}`)
  }

  // Also backfill relationships
  const relTypes = ['ASSOCIATED_WITH', 'EMPLOYED_BY', 'AFFILIATED_WITH', 'OWNED',
                    'PARTICIPATED_IN', 'FILED_IN', 'DOCUMENTED_BY', 'MENTIONED_IN',
                    'FLEW_WITH', 'FINANCED']

  for (const relType of relTypes) {
    await executeWrite(
      `MATCH ()-[r:${relType}]->()
       WHERE r.confidence_tier IS NULL
       SET r.confidence_tier = 'gold',
           r.source = 'seed',
           r.ingestion_wave = 0`,
    )
    console.log(`  Rel ${relType}: backfilled`)
  }

  console.log('\nBackfill complete.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Backfill failed:', error)
  closeDriver().finally(() => process.exit(1))
})
