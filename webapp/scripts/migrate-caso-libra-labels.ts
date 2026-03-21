/**
 * Migrate Caso Libra from CasoLibra* prefixed labels to generic labels.
 *
 * Two-phase migration:
 *   Phase 1 (non-destructive): Create generic-labeled nodes with caso_slug + prefixed IDs,
 *     recreate all relationships between new generic nodes.
 *   Phase 2 (destructive): Delete all CasoLibra* nodes + relationships.
 *
 * Run with: npx tsx scripts/migrate-caso-libra-labels.ts [--phase 1|2|both]
 *
 * Idempotent — uses MERGE for Phase 1. Phase 2 only runs after verification.
 */

import { getDriver, closeDriver } from '../src/lib/neo4j/client'

const QUERY_TIMEOUT_MS = 30_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }
const CASO_SLUG = 'caso-libra'

// ---------------------------------------------------------------------------
// Label mapping: CasoLibra* → generic label
// ---------------------------------------------------------------------------

const LABEL_MAP: Record<string, { generic: string; idProp: string }> = {
  CasoLibraPerson: { generic: 'Person', idProp: 'id' },
  CasoLibraOrganization: { generic: 'Organization', idProp: 'id' },
  CasoLibraToken: { generic: 'Token', idProp: 'id' },
  CasoLibraEvent: { generic: 'Event', idProp: 'id' },
  CasoLibraDocument: { generic: 'Document', idProp: 'id' },
  CasoLibraWallet: { generic: 'Wallet', idProp: 'address' },
}

// ---------------------------------------------------------------------------
// Phase 1: Create generic-labeled nodes (non-destructive)
// ---------------------------------------------------------------------------

async function phase1(): Promise<void> {
  console.log('=== Phase 1: Create generic-labeled nodes ===\n')
  const session = getDriver().session()

  try {
    for (const [oldLabel, { generic, idProp }] of Object.entries(LABEL_MAP)) {
      // For Wallet, the id property in generic form is `id` (not `address`).
      // We need to create a new `id` from the address, prefixed with caso_slug.
      const isWallet = oldLabel === 'CasoLibraWallet'

      const cypher = isWallet
        ? `MATCH (old:${oldLabel})
           WITH old, $casoSlug + ':' + old.address AS newId
           MERGE (new:${generic} { id: newId })
           SET new.caso_slug = $casoSlug,
               new.address = old.address,
               new.label = old.label,
               new.chain = old.chain,
               new.owner_id = CASE WHEN old.owner_id IS NOT NULL
                 THEN $casoSlug + ':' + old.owner_id ELSE null END,
               new._migrated_from = '${oldLabel}',
               new._old_id = old.address
           RETURN count(new) AS count`
        : `MATCH (old:${oldLabel})
           WITH old, $casoSlug + ':' + old.${idProp} AS newId
           MERGE (new:${generic} { id: newId })
           SET new += old { .*, id: newId, caso_slug: $casoSlug },
               new._migrated_from = '${oldLabel}',
               new._old_id = old.${idProp}
           RETURN count(new) AS count`

      const result = await session.run(cypher, { casoSlug: CASO_SLUG }, TX_CONFIG)
      const count = result.records[0]?.get('count')?.toNumber?.() ?? result.records[0]?.get('count') ?? 0
      console.log(`  ${oldLabel} → ${generic}: ${count} nodes`)
    }

    console.log('\nRecreating relationships between generic nodes...\n')

    // Recreate relationships. We match old relationship patterns and create
    // equivalent ones between the new generic nodes using prefixed IDs.
    const relMigrations = [
      // PROMOTED: Person → Token
      {
        name: 'PROMOTED',
        cypher: `MATCH (oldP:CasoLibraPerson)-[r:PROMOTED]->(oldT:CasoLibraToken)
                 MATCH (newP:Person { id: $casoSlug + ':' + oldP.id })
                 MATCH (newT:Token { id: $casoSlug + ':' + oldT.id })
                 MERGE (newP)-[:PROMOTED]->(newT)
                 RETURN count(r) AS count`,
      },
      // CREATED_BY: Token → Organization
      {
        name: 'CREATED_BY',
        cypher: `MATCH (oldT:CasoLibraToken)-[r:CREATED_BY]->(oldO:CasoLibraOrganization)
                 MATCH (newT:Token { id: $casoSlug + ':' + oldT.id })
                 MATCH (newO:Organization { id: $casoSlug + ':' + oldO.id })
                 MERGE (newT)-[:CREATED_BY]->(newO)
                 RETURN count(r) AS count`,
      },
      // AFFILIATED_WITH: Person → Organization
      {
        name: 'AFFILIATED_WITH',
        cypher: `MATCH (oldP:CasoLibraPerson)-[r:AFFILIATED_WITH]->(oldO:CasoLibraOrganization)
                 MATCH (newP:Person { id: $casoSlug + ':' + oldP.id })
                 MATCH (newO:Organization { id: $casoSlug + ':' + oldO.id })
                 MERGE (newP)-[:AFFILIATED_WITH]->(newO)
                 RETURN count(r) AS count`,
      },
      // COMMUNICATED_WITH: Person → Person (with properties)
      {
        name: 'COMMUNICATED_WITH',
        cypher: `MATCH (oldA:CasoLibraPerson)-[r:COMMUNICATED_WITH]->(oldB:CasoLibraPerson)
                 MATCH (newA:Person { id: $casoSlug + ':' + oldA.id })
                 MATCH (newB:Person { id: $casoSlug + ':' + oldB.id })
                 MERGE (newA)-[nr:COMMUNICATED_WITH { date: r.date, medium: r.medium }]->(newB)
                 RETURN count(r) AS count`,
      },
      // MET_WITH: Person → Person (with properties)
      {
        name: 'MET_WITH',
        cypher: `MATCH (oldA:CasoLibraPerson)-[r:MET_WITH]->(oldB:CasoLibraPerson)
                 MATCH (newA:Person { id: $casoSlug + ':' + oldA.id })
                 MATCH (newB:Person { id: $casoSlug + ':' + oldB.id })
                 MERGE (newA)-[nr:MET_WITH { date: r.date, location: r.location }]->(newB)
                 RETURN count(r) AS count`,
      },
      // PARTICIPATED_IN: Person → Event
      {
        name: 'PARTICIPATED_IN',
        cypher: `MATCH (oldP:CasoLibraPerson)-[r:PARTICIPATED_IN]->(oldE:CasoLibraEvent)
                 MATCH (newP:Person { id: $casoSlug + ':' + oldP.id })
                 MATCH (newE:Event { id: $casoSlug + ':' + oldE.id })
                 MERGE (newP)-[:PARTICIPATED_IN]->(newE)
                 RETURN count(r) AS count`,
      },
      // DOCUMENTED_BY: Event → Document
      {
        name: 'DOCUMENTED_BY',
        cypher: `MATCH (oldE:CasoLibraEvent)-[r:DOCUMENTED_BY]->(oldD:CasoLibraDocument)
                 MATCH (newE:Event { id: $casoSlug + ':' + oldE.id })
                 MATCH (newD:Document { id: $casoSlug + ':' + oldD.id })
                 MERGE (newE)-[:DOCUMENTED_BY]->(newD)
                 RETURN count(r) AS count`,
      },
      // MENTIONS: Document → Person|Organization|Token (dynamic target label)
      {
        name: 'MENTIONS (→ Person)',
        cypher: `MATCH (oldD:CasoLibraDocument)-[r:MENTIONS]->(oldT:CasoLibraPerson)
                 MATCH (newD:Document { id: $casoSlug + ':' + oldD.id })
                 MATCH (newT:Person { id: $casoSlug + ':' + oldT.id })
                 MERGE (newD)-[:MENTIONS]->(newT)
                 RETURN count(r) AS count`,
      },
      {
        name: 'MENTIONS (→ Organization)',
        cypher: `MATCH (oldD:CasoLibraDocument)-[r:MENTIONS]->(oldT:CasoLibraOrganization)
                 MATCH (newD:Document { id: $casoSlug + ':' + oldD.id })
                 MATCH (newT:Organization { id: $casoSlug + ':' + oldT.id })
                 MERGE (newD)-[:MENTIONS]->(newT)
                 RETURN count(r) AS count`,
      },
      {
        name: 'MENTIONS (→ Token)',
        cypher: `MATCH (oldD:CasoLibraDocument)-[r:MENTIONS]->(oldT:CasoLibraToken)
                 MATCH (newD:Document { id: $casoSlug + ':' + oldD.id })
                 MATCH (newT:Token { id: $casoSlug + ':' + oldT.id })
                 MERGE (newD)-[:MENTIONS]->(newT)
                 RETURN count(r) AS count`,
      },
      // CONTROLS: Person → Wallet (wallet uses address as old id)
      {
        name: 'CONTROLS',
        cypher: `MATCH (oldP:CasoLibraPerson)-[r:CONTROLS]->(oldW:CasoLibraWallet)
                 MATCH (newP:Person { id: $casoSlug + ':' + oldP.id })
                 MATCH (newW:Wallet { id: $casoSlug + ':' + oldW.address })
                 MERGE (newP)-[:CONTROLS]->(newW)
                 RETURN count(r) AS count`,
      },
      // SENT: Wallet → Wallet (with properties; wallet uses address as old id)
      {
        name: 'SENT',
        cypher: `MATCH (oldW1:CasoLibraWallet)-[r:SENT]->(oldW2:CasoLibraWallet)
                 MATCH (newW1:Wallet { id: $casoSlug + ':' + oldW1.address })
                 MATCH (newW2:Wallet { id: $casoSlug + ':' + oldW2.address })
                 MERGE (newW1)-[nr:SENT { hash: r.hash, amount_usd: r.amount_usd, timestamp: r.timestamp }]->(newW2)
                 RETURN count(r) AS count`,
      },
    ]

    for (const rel of relMigrations) {
      const result = await session.run(rel.cypher, { casoSlug: CASO_SLUG }, TX_CONFIG)
      const count = result.records[0]?.get('count')?.toNumber?.() ?? result.records[0]?.get('count') ?? 0
      console.log(`  ${rel.name}: ${count} relationships`)
    }

    // Verify counts match
    console.log('\n--- Verification ---\n')
    for (const [oldLabel, { generic }] of Object.entries(LABEL_MAP)) {
      const oldResult = await session.run(
        `MATCH (n:${oldLabel}) RETURN count(n) AS count`,
        {},
        TX_CONFIG,
      )
      const newResult = await session.run(
        `MATCH (n:${generic} { caso_slug: $casoSlug }) RETURN count(n) AS count`,
        { casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
      const oldCount = oldResult.records[0]?.get('count')?.toNumber?.() ?? oldResult.records[0]?.get('count') ?? 0
      const newCount = newResult.records[0]?.get('count')?.toNumber?.() ?? newResult.records[0]?.get('count') ?? 0
      const match = oldCount === newCount ? '✓' : '✗ MISMATCH'
      console.log(`  ${oldLabel}: ${oldCount} → ${generic} (caso_slug=${CASO_SLUG}): ${newCount} ${match}`)
    }

    console.log('\nPhase 1 complete.')
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Delete old CasoLibra* nodes + relationships (destructive)
// ---------------------------------------------------------------------------

async function phase2(): Promise<void> {
  console.log('=== Phase 2: Delete old CasoLibra* nodes ===\n')
  const session = getDriver().session()

  try {
    // Pre-check: verify generic nodes exist before deleting old ones
    for (const [oldLabel, { generic }] of Object.entries(LABEL_MAP)) {
      const newResult = await session.run(
        `MATCH (n:${generic} { caso_slug: $casoSlug }) RETURN count(n) AS count`,
        { casoSlug: CASO_SLUG },
        TX_CONFIG,
      )
      const newCount = newResult.records[0]?.get('count')?.toNumber?.() ?? newResult.records[0]?.get('count') ?? 0
      if (newCount === 0) {
        console.error(`  ERROR: No ${generic} nodes with caso_slug=${CASO_SLUG} found. Run Phase 1 first.`)
        process.exit(1)
      }
    }

    // Delete old nodes and their relationships
    for (const oldLabel of Object.keys(LABEL_MAP)) {
      const result = await session.run(
        `MATCH (n:${oldLabel}) DETACH DELETE n RETURN count(n) AS count`,
        {},
        TX_CONFIG,
      )
      const count = result.records[0]?.get('count')?.toNumber?.() ?? result.records[0]?.get('count') ?? 0
      console.log(`  Deleted ${count} ${oldLabel} nodes`)
    }

    // Clean up migration metadata
    console.log('\nCleaning migration metadata...')
    await session.run(
      `MATCH (n { caso_slug: $casoSlug })
       WHERE n._migrated_from IS NOT NULL
       REMOVE n._migrated_from, n._old_id`,
      { casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    console.log('Phase 2 complete. Old CasoLibra* nodes deleted.')
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const phaseIdx = args.indexOf('--phase')
  const phase = phaseIdx !== -1 ? args[phaseIdx + 1] : 'both'

  console.log(`Starting Caso Libra label migration (phase: ${phase})...\n`)

  if (phase === '1' || phase === 'both') {
    await phase1()
    console.log()
  }

  if (phase === '2' || phase === 'both') {
    await phase2()
  }

  await closeDriver()
  console.log('\nMigration complete.')
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
