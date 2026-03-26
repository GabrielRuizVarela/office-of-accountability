/**
 * Seed compliance frameworks into Neo4j - M11 Phase 2c.
 * Run with: npx tsx scripts/seed-compliance.ts
 *
 * Reads all YAML framework definitions from src/lib/compliance/frameworks/,
 * validates against Zod schemas, and MERGEs into Neo4j.
 *
 * Idempotent - safe to run multiple times.
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { loadAllFrameworks } from '../src/lib/compliance/loader'
import { closeDriver } from '../src/lib/neo4j/client'

async function main(): Promise<void> {
  console.log('Seeding compliance frameworks...\n')

  const result = await loadAllFrameworks()

  for (const fw of result.frameworks) {
    console.log(
      `  ✓ ${fw.frameworkId}: ${fw.rulesCreated} rules, ${fw.checklistItemsCreated} checklist items`,
    )
  }

  console.log(`\nFrameworks loaded: ${result.frameworks.length}`)
  console.log(`Errors:           ${result.totalErrors}`)
  console.log(`Duration:         ${result.durationMs}ms`)

  if (result.totalErrors > 0) {
    await closeDriver()
    process.exit(1)
  }

  console.log('\nCompliance seed complete.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Compliance seed failed:', error)
  process.exit(1)
})
