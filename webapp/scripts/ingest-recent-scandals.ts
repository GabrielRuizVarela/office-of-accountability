/**
 * Ingest key entities from recent-scandals-2024-2026.json into Neo4j.
 *
 * Creates :Person, :Organization, and :Event nodes with caso_slug "caso-finanzas-politicas"
 * and silver tier. Also creates relationships between entities.
 *
 * Run with: npx tsx scripts/ingest-recent-scandals.ts
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-finanzas-politicas'
const TIER = 'silver'
const NOW = new Date().toISOString()

// ---------------------------------------------------------------------------
// Persons
// ---------------------------------------------------------------------------

const PERSONS = [
  // $LIBRA scandal
  {
    name: 'DAVIS HAYDEN',
    role: 'CEO of Kelsier Ventures',
    context: '$LIBRA token creator, $107M insider cashout, assets frozen by Argentine judge',
    source_scandal: 'caso-libra',
  },
  {
    name: 'NOVELLI MAURICIO',
    role: 'Crypto trader, lobbyist',
    context: '$5M payment agreement to Milei found on phone, intermediary between $LIBRA promoters and Milei inner circle',
    source_scandal: 'caso-libra',
  },
  // SIDE / Caputo
  {
    name: 'AUGUADRA CRISTIAN',
    role: 'SIDE head',
    context: 'Proxy for Santiago Caputo at intelligence agency',
    source_scandal: 'santiago-caputo-side',
  },
  {
    name: 'SCATTURICE LEONARDO',
    role: 'Businessman, former intelligence operative',
    context: 'Caputo associate, received SIDE contract via Tactic COC LLC, acquired Flybondi airline, dubbed Lazaro Baez libertario',
    source_scandal: 'santiago-caputo-side',
  },
  // Capital Humano
  {
    name: 'PETTOVELLO SANDRA',
    role: 'Minister of Capital Humano',
    context: 'Cannot account for 8.3B pesos, retained 5K tonnes food while cutting dining halls',
    source_scandal: 'capital-humano-food',
  },
] as const

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

const ORGANIZATIONS = [
  {
    name: 'KELSIER VENTURES',
    org_type: 'company',
    jurisdiction: 'Delaware, USA',
    context: '$LIBRA token launch vehicle, created and launched the memecoin promoted by Milei',
    source_scandal: 'caso-libra',
  },
  {
    name: 'FLYBONDI',
    org_type: 'airline',
    jurisdiction: 'Argentina',
    context: 'Low-cost airline acquired by Caputo associate Scatturice with unclear funding post-SIDE contract',
    source_scandal: 'santiago-caputo-side',
  },
  {
    name: 'OEI (ORGANIZACION DE ESTADOS IBEROAMERICANOS)',
    org_type: 'international_organization',
    jurisdiction: 'International',
    context: 'Used for ghost employee contracts at Capital Humano, ~100 ghost employees, 1B pesos diverted',
    source_scandal: 'capital-humano-food',
  },
] as const

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const EVENTS = [
  {
    event_id: 'fp-libra-crash',
    title: '$LIBRA crypto scandal',
    description:
      '$LIBRA crypto: Milei promoted, hit $4B, crashed 90%, $107M insider cashout, 44K victims',
    category: 'scandal',
    date: '2025-02-14',
    source_scandal: 'caso-libra',
  },
  {
    event_id: 'fp-gold-london',
    title: 'BCRA gold shipped to London',
    description:
      'BCRA shipped ~37 tonnes gold ($1B+) to London secretly, refuses audit',
    category: 'scandal',
    date: '2024-09-01',
    source_scandal: 'gold-reserves-bcra',
  },
  {
    event_id: 'fp-food-crisis',
    title: 'Capital Humano food crisis',
    description:
      'Capital Humano retained 5K tonnes food while cutting dining halls, 8.3B pesos unaccounted',
    category: 'scandal',
    date: '2024-05-01',
    source_scandal: 'capital-humano-food',
  },
  {
    event_id: 'fp-dnu-abuse',
    title: 'DNU abuse pattern',
    description:
      '83 DNUs in 2 years (surpassing CFK\'s 81 in 8 years), 5+ unconstitutional',
    category: 'scandal',
    date: '2023-12-10',
    source_scandal: 'dnu-abuse',
  },
  {
    event_id: 'fp-cuadernos-trial',
    title: 'Causa Cuadernos trial',
    description:
      'Causa Cuadernos trial began Nov 2025, 87 defendants including CFK',
    category: 'scandal',
    date: '2025-11-06',
    source_scandal: 'causa-cuadernos',
  },
] as const

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

const RELATIONSHIPS = [
  {
    from_name: 'DAVIS HAYDEN',
    from_label: 'Person',
    to_name: 'KELSIER VENTURES',
    to_label: 'Organization',
    rel_type: 'CONTROLS',
    properties: {},
  },
  {
    from_name: 'SCATTURICE LEONARDO',
    from_label: 'Person',
    to_name: 'FLYBONDI',
    to_label: 'Organization',
    rel_type: 'ACQUIRED',
    properties: {},
  },
  {
    from_name: 'SCATTURICE LEONARDO',
    from_label: 'Person',
    to_name: 'CAPUTO SANTIAGO',
    to_label: 'Person',
    rel_type: 'ASSOCIATED_WITH',
    properties: { detail: 'Caputo associate' },
  },
  {
    from_name: 'PETTOVELLO SANDRA',
    from_label: 'Person',
    to_name: 'OEI (ORGANIZACION DE ESTADOS IBEROAMERICANOS)',
    to_label: 'Organization',
    rel_type: 'CONTRACTED',
    properties: { detail: 'ghost employee contracts' },
  },
] as const

// ---------------------------------------------------------------------------
// Ingestion logic
// ---------------------------------------------------------------------------

async function ingestPersons(): Promise<number> {
  let total = 0

  for (const p of PERSONS) {
    const result = await executeWrite(
      `
      MERGE (n:Person {name: $name, caso_slug: $caso_slug})
      ON CREATE SET
        n.role       = $role,
        n.context    = $context,
        n.tier       = $tier,
        n.source_scandal = $source_scandal,
        n.created_at = $now
      ON MATCH SET
        n.role       = $role,
        n.context    = $context,
        n.tier       = $tier,
        n.source_scandal = $source_scandal,
        n.updated_at = $now
      `,
      {
        name: p.name,
        caso_slug: CASO_SLUG,
        role: p.role,
        context: p.context,
        tier: TIER,
        source_scandal: p.source_scandal,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Person: ${p.name} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestOrganizations(): Promise<number> {
  let total = 0

  for (const o of ORGANIZATIONS) {
    const result = await executeWrite(
      `
      MERGE (n:Organization {name: $name, caso_slug: $caso_slug})
      ON CREATE SET
        n.org_type       = $org_type,
        n.jurisdiction   = $jurisdiction,
        n.context        = $context,
        n.tier           = $tier,
        n.source_scandal = $source_scandal,
        n.created_at     = $now
      ON MATCH SET
        n.org_type       = $org_type,
        n.jurisdiction   = $jurisdiction,
        n.context        = $context,
        n.tier           = $tier,
        n.source_scandal = $source_scandal,
        n.updated_at     = $now
      `,
      {
        name: o.name,
        caso_slug: CASO_SLUG,
        org_type: o.org_type,
        jurisdiction: o.jurisdiction,
        context: o.context,
        tier: TIER,
        source_scandal: o.source_scandal,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Organization: ${o.name} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestEvents(): Promise<number> {
  let total = 0

  for (const e of EVENTS) {
    const result = await executeWrite(
      `
      MERGE (n:Event {event_id: $event_id, caso_slug: $caso_slug})
      ON CREATE SET
        n.title          = $title,
        n.description    = $description,
        n.category       = $category,
        n.date           = $date,
        n.tier           = $tier,
        n.source_scandal = $source_scandal,
        n.created_at     = $now
      ON MATCH SET
        n.title          = $title,
        n.description    = $description,
        n.category       = $category,
        n.date           = $date,
        n.tier           = $tier,
        n.source_scandal = $source_scandal,
        n.updated_at     = $now
      `,
      {
        event_id: e.event_id,
        caso_slug: CASO_SLUG,
        title: e.title,
        description: e.description,
        category: e.category,
        date: e.date,
        tier: TIER,
        source_scandal: e.source_scandal,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Event: ${e.event_id} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestRelationships(): Promise<number> {
  let total = 0

  for (const r of RELATIONSHIPS) {
    // Build properties string for the relationship
    const propEntries = Object.entries(r.properties)
    const propStr = propEntries.length > 0
      ? ', ' + propEntries.map(([k]) => `r.${k} = $prop_${k}`).join(', ')
      : ''

    // Build params including relationship properties
    const params: Record<string, unknown> = {
      from_name: r.from_name,
      to_name: r.to_name,
      caso_slug: CASO_SLUG,
      now: NOW,
    }
    for (const [k, v] of propEntries) {
      params[`prop_${k}`] = v
    }

    const result = await executeWrite(
      `
      MATCH (a:${r.from_label} {name: $from_name, caso_slug: $caso_slug})
      MATCH (b:${r.to_label} {name: $to_name, caso_slug: $caso_slug})
      MERGE (a)-[r:${r.rel_type}]->(b)
      ON CREATE SET r.created_at = $now${propStr}
      ON MATCH SET r.updated_at = $now${propStr}
      `,
      params,
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['relationshipsCreated'] ?? 0
    total += created
    console.log(`  Rel: ${r.from_name} -[${r.rel_type}]-> ${r.to_name} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Recent Scandals Ingestion ===')
  console.log(`caso_slug: ${CASO_SLUG}, tier: ${TIER}\n`)

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('ERROR: Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Neo4j connected.\n')

  // First ensure CAPUTO SANTIAGO exists as a Person for the relationship target
  console.log('--- Ensuring prerequisite nodes ---')
  const caputoResult = await executeWrite(
    `
    MERGE (n:Person {name: $name, caso_slug: $caso_slug})
    ON CREATE SET
      n.role       = $role,
      n.tier       = $tier,
      n.context    = $context,
      n.created_at = $now
    `,
    {
      name: 'CAPUTO SANTIAGO',
      caso_slug: CASO_SLUG,
      role: 'Presidential adviser',
      tier: TIER,
      context: 'Controls SIDE, ENARSA, Health, UIF, Justice Ministry designations via parallel power network',
      now: NOW,
    },
  )
  const caputoCreated = (caputoResult.summary.counters as Record<string, number>)['nodesCreated'] ?? 0
  console.log(`  Person: CAPUTO SANTIAGO ${caputoCreated ? '(created)' : '(already exists)'}`)

  console.log('\n--- Persons ---')
  const personsCreated = await ingestPersons()

  console.log('\n--- Organizations ---')
  const orgsCreated = await ingestOrganizations()

  console.log('\n--- Events ---')
  const eventsCreated = await ingestEvents()

  console.log('\n--- Relationships ---')
  const relsCreated = await ingestRelationships()

  console.log('\n=== Summary ===')
  console.log(`Persons created:       ${personsCreated + caputoCreated}`)
  console.log(`Organizations created: ${orgsCreated}`)
  console.log(`Events created:        ${eventsCreated}`)
  console.log(`Relationships created: ${relsCreated}`)
  console.log(`Total nodes:           ${personsCreated + caputoCreated + orgsCreated + eventsCreated}`)

  await closeDriver()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
