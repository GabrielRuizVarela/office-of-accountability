#!/usr/bin/env npx tsx
/**
 * Seed script for Nuclear Risk Tracking investigation data.
 *
 * Run with: npx tsx scripts/seed-nuclear-risk.ts
 *
 * Idempotent — uses MERGE for all operations. Safe to run multiple times.
 * All data is manually curated from public sources:
 * - Federation of American Scientists (FAS)
 * - Stockholm International Peace Research Institute (SIPRI)
 * - International Atomic Energy Agency (IAEA)
 * - Arms Control Association
 */

import {
  nuclearActors,
  treaties,
  weaponSystems,
  nuclearFacilities,
} from '../src/lib/caso-nuclear-risk/investigation-data'

import {
  MERGE_ACTOR,
  MERGE_TREATY,
  MERGE_WEAPON,
  MERGE_FACILITY,
  MERGE_PARTY_TO,
  MERGE_POSSESSES,
  MERGE_OPERATES,
} from '../src/lib/caso-nuclear-risk/queries'

import { getDriver, closeDriver } from '../src/lib/neo4j/client'
import { initializeSchema } from '../src/lib/neo4j/schema'

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Starting Nuclear Risk Tracking data seed...\n')

  // 1. Ensure constraints/indexes exist
  console.log('Initializing schema...')
  await initializeSchema()
  console.log('  Schema initialized\n')

  // 2. Seed actors
  const driver = getDriver()

  console.log('Seeding nuclear actors...')
  {
    const session = driver.session()
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(MERGE_ACTOR, { actors: nuclearActors }),
      )
      const count = result.records[0]?.get('count')
      console.log(`  ${count} actors seeded`)
    } finally {
      await session.close()
    }
  }

  // 3. Seed treaties
  console.log('Seeding treaties...')
  {
    const session = driver.session()
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(MERGE_TREATY, { treaties }),
      )
      const count = result.records[0]?.get('count')
      console.log(`  ${count} treaties seeded`)
    } finally {
      await session.close()
    }
  }

  // 4. Seed weapon systems
  console.log('Seeding weapon systems...')
  {
    const session = driver.session()
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(MERGE_WEAPON, { weapons: weaponSystems }),
      )
      const count = result.records[0]?.get('count')
      console.log(`  ${count} weapon systems seeded`)
    } finally {
      await session.close()
    }
  }

  // 5. Seed facilities
  console.log('Seeding nuclear facilities...')
  {
    const session = driver.session()
    try {
      const result = await session.executeWrite((tx) =>
        tx.run(MERGE_FACILITY, { facilities: nuclearFacilities }),
      )
      const count = result.records[0]?.get('count')
      console.log(`  ${count} facilities seeded`)
    } finally {
      await session.close()
    }
  }

  // 6. Create POSSESSES relationships (actor → weapon system)
  console.log('Linking actors to weapon systems (POSSESSES)...')
  {
    const rels = weaponSystems.map((w) => ({
      actor_id: w.operator_id,
      weapon_id: w.id,
    }))
    const session = driver.session()
    try {
      await session.executeWrite((tx) => tx.run(MERGE_POSSESSES, { rels }))
      console.log(`  ${rels.length} POSSESSES relationships created`)
    } finally {
      await session.close()
    }
  }

  // 7. Create OPERATES relationships (actor → facility)
  console.log('Linking actors to facilities (OPERATES)...')
  {
    const rels = nuclearFacilities.map((f) => ({
      actor_id: f.operator_id,
      facility_id: f.id,
    }))
    const session = driver.session()
    try {
      await session.executeWrite((tx) => tx.run(MERGE_OPERATES, { rels }))
      console.log(`  ${rels.length} OPERATES relationships created`)
    } finally {
      await session.close()
    }
  }

  // 8. Create PARTY_TO relationships (actor → treaty)
  console.log('Linking actors to treaties (PARTY_TO)...')
  {
    const rels: Array<{ actor_id: string; treaty_id: string }> = []
    for (const treaty of treaties) {
      for (const partyId of treaty.parties) {
        rels.push({ actor_id: partyId, treaty_id: treaty.id })
      }
    }
    const session = driver.session()
    try {
      await session.executeWrite((tx) => tx.run(MERGE_PARTY_TO, { rels }))
      console.log(`  ${rels.length} PARTY_TO relationships created`)
    } finally {
      await session.close()
    }
  }

  // 9. Done
  await closeDriver()
  console.log('\nNuclear Risk Tracking seed complete.')
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
