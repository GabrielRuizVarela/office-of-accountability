/**
 * Standalone script to initialize Neo4j schema.
 * Run with: npx tsx scripts/init-schema.ts
 *
 * Idempotent - safe to run multiple times.
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { initializeSchema } from '../src/lib/neo4j/schema'
import { closeDriver } from '../src/lib/neo4j/client'

async function main(): Promise<void> {
  console.log('Initializing Neo4j schema...\n')

  const result = await initializeSchema()

  console.log(`Constraints:      ${result.constraintsCreated}`)
  console.log(`Fulltext indexes: ${result.fulltextIndexesCreated}`)
  console.log(`Range indexes:    ${result.rangeIndexesCreated}`)

  if (result.errors.length > 0) {
    console.error(`\nErrors (${result.errors.length}):`)
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    await closeDriver()
    process.exit(1)
  }

  console.log('\nSchema initialization complete.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Schema initialization failed:', error)
  process.exit(1)
})
