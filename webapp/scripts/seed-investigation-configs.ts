/**
 * Seed script - creates InvestigationConfig + SchemaDefinition subgraphs
 * for all three investigations.
 *
 * Run with: npx tsx scripts/seed-investigation-configs.ts
 *
 * Idempotent - uses MERGE on all nodes and relationships.
 * Creates the following graph structure per investigation:
 *
 *   (InvestigationConfig) -[:HAS_SCHEMA]-> (SchemaDefinition)
 *     -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition) × N
 *     -[:DEFINES_REL_TYPE]-> (RelTypeDefinition) × N
 *
 * Requires NEO4J_URI, NEO4J_USER environment variables.
 */

import { getDriver, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NodeTypeDef {
  readonly name: string
  readonly properties: readonly string[]
  readonly color: string
  readonly icon: string
}

interface RelTypeDef {
  readonly name: string
  readonly from_types: string
  readonly to_types: string
}

interface InvestigationConfigData {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly caso_slug: string
  readonly status: 'active' | 'draft' | 'archived'
  readonly tags: readonly string[]
  readonly nodeTypes: readonly NodeTypeDef[]
  readonly relTypes: readonly RelTypeDef[]
}

// ---------------------------------------------------------------------------
// Schema definitions per investigation
// ---------------------------------------------------------------------------

const CASO_LIBRA: InvestigationConfigData = {
  id: 'caso-libra',
  name: 'Caso Libra',
  description: 'Investigación sobre el token $LIBRA y sus conexiones con el gobierno argentino',
  caso_slug: 'caso-libra',
  status: 'active',
  tags: ['crypto', 'argentina', 'gobierno', 'blockchain'],
  nodeTypes: [
    {
      name: 'Person',
      properties: ['id', 'name', 'slug', 'role', 'description', 'photo_url', 'nationality'],
      color: '#6366f1',
      icon: 'user',
    },
    {
      name: 'Organization',
      properties: ['id', 'name', 'slug', 'org_type', 'description', 'country'],
      color: '#f59e0b',
      icon: 'building',
    },
    {
      name: 'Token',
      properties: ['id', 'symbol', 'name', 'contract_address', 'chain', 'launch_date', 'peak_market_cap'],
      color: '#10b981',
      icon: 'coin',
    },
    {
      name: 'Event',
      properties: ['id', 'title', 'slug', 'description', 'date', 'source_url', 'event_type'],
      color: '#ef4444',
      icon: 'calendar',
    },
    {
      name: 'Document',
      properties: ['id', 'title', 'slug', 'doc_type', 'summary', 'source_url', 'date_published'],
      color: '#8b5cf6',
      icon: 'file-text',
    },
    {
      name: 'Wallet',
      properties: ['id', 'address', 'label', 'owner_id', 'chain'],
      color: '#06b6d4',
      icon: 'wallet',
    },
    {
      name: 'GovernmentAction',
      properties: ['id', 'date', 'action_es', 'action_en', 'effect_es', 'effect_en', 'source', 'source_url'],
      color: '#dc2626',
      icon: 'landmark',
    },
  ],
  relTypes: [
    { name: 'CONTROLS', from_types: 'Person', to_types: 'Wallet' },
    { name: 'SENT', from_types: 'Wallet', to_types: 'Wallet' },
    { name: 'COMMUNICATED_WITH', from_types: 'Person', to_types: 'Person' },
    { name: 'MET_WITH', from_types: 'Person', to_types: 'Person' },
    { name: 'PARTICIPATED_IN', from_types: 'Person', to_types: 'Event' },
    { name: 'DOCUMENTED_BY', from_types: 'Event', to_types: 'Document' },
    { name: 'MENTIONS', from_types: 'Document', to_types: 'Person,Organization,Token' },
    { name: 'PROMOTED', from_types: 'Person', to_types: 'Token' },
    { name: 'CREATED_BY', from_types: 'Token', to_types: 'Organization' },
    { name: 'AFFILIATED_WITH', from_types: 'Person', to_types: 'Organization' },
  ],
}

const CASO_FINANZAS_POLITICAS: InvestigationConfigData = {
  id: 'caso-finanzas-politicas',
  name: 'Caso Finanzas Políticas',
  description: 'Investigación sobre el financiamiento político en Argentina',
  caso_slug: 'caso-finanzas-politicas',
  status: 'active',
  tags: ['finanzas', 'politica', 'argentina', 'transparencia'],
  nodeTypes: [
    {
      name: 'Person',
      properties: ['id', 'name', 'slug', 'role_es', 'role_en', 'description_es', 'description_en', 'party', 'datasets'],
      color: '#6366f1',
      icon: 'user',
    },
    {
      name: 'Organization',
      properties: ['id', 'name', 'slug', 'type', 'jurisdiction', 'incorporation_date'],
      color: '#f59e0b',
      icon: 'building',
    },
    {
      name: 'Event',
      properties: ['id', 'date', 'title_es', 'title_en', 'description_es', 'description_en', 'category', 'sources'],
      color: '#ef4444',
      icon: 'calendar',
    },
    {
      name: 'MoneyFlow',
      properties: ['id', 'from_label', 'to_label', 'amount_ars', 'description_es', 'description_en', 'date', 'source', 'source_url'],
      color: '#22c55e',
      icon: 'banknote',
    },
    {
      name: 'Claim',
      properties: ['id', 'claim_es', 'claim_en', 'status', 'tier', 'source', 'source_url', 'detail_es', 'detail_en'],
      color: '#a855f7',
      icon: 'alert-triangle',
    },
  ],
  relTypes: [
    { name: 'OFFICER_OF', from_types: 'Person', to_types: 'Organization' },
    { name: 'SUBJECT_OF', from_types: 'Person', to_types: 'Claim' },
    { name: 'INVOLVED_IN', from_types: 'Person', to_types: 'Event' },
    { name: 'SOURCE_OF', from_types: 'MoneyFlow', to_types: 'Person,Organization' },
    { name: 'DESTINATION_OF', from_types: 'MoneyFlow', to_types: 'Person,Organization' },
  ],
}

const CASO_EPSTEIN: InvestigationConfigData = {
  id: 'caso-epstein',
  name: 'Caso Epstein',
  description: 'Investigation into Jeffrey Epstein network of associates and victims',
  caso_slug: 'caso-epstein',
  status: 'active',
  tags: ['epstein', 'trafficking', 'network', 'justice'],
  nodeTypes: [
    {
      name: 'Person',
      properties: ['id', 'name', 'slug', 'aliases', 'category', 'entity_type', 'occupation', 'legal_status', 'mention_count', 'search_terms', 'sources'],
      color: '#6366f1',
      icon: 'user',
    },
    {
      name: 'Organization',
      properties: ['id', 'name', 'slug', 'aliases', 'entity_type', 'metadata'],
      color: '#f59e0b',
      icon: 'building',
    },
    {
      name: 'ShellCompany',
      properties: ['id', 'name', 'slug', 'aliases', 'entity_type', 'metadata'],
      color: '#f97316',
      icon: 'briefcase',
    },
    {
      name: 'Location',
      properties: ['id', 'name', 'slug', 'aliases', 'entity_type', 'metadata'],
      color: '#14b8a6',
      icon: 'map-pin',
    },
    {
      name: 'Aircraft',
      properties: ['id', 'name', 'slug', 'aliases', 'entity_type', 'metadata'],
      color: '#0ea5e9',
      icon: 'plane',
    },
  ],
  relTypes: [
    { name: 'ASSOCIATED_WITH', from_types: 'Person', to_types: 'Person,Organization,ShellCompany' },
    { name: 'COMMUNICATED_WITH', from_types: 'Person', to_types: 'Person' },
    { name: 'TRAVELED_WITH', from_types: 'Person', to_types: 'Person' },
    { name: 'EMPLOYED_BY', from_types: 'Person', to_types: 'Organization,ShellCompany' },
    { name: 'VICTIM_OF', from_types: 'Person', to_types: 'Person' },
    { name: 'PAID_BY', from_types: 'Person', to_types: 'Person,Organization' },
    { name: 'REPRESENTED_BY', from_types: 'Person', to_types: 'Person' },
    { name: 'RECRUITED_BY', from_types: 'Person', to_types: 'Person' },
    { name: 'RELATED_TO', from_types: 'Person', to_types: 'Person,Organization,Location' },
    { name: 'OWNED_BY', from_types: 'Aircraft,ShellCompany', to_types: 'Person,Organization' },
  ],
}

const ALL_INVESTIGATIONS: readonly InvestigationConfigData[] = [
  CASO_LIBRA,
  CASO_FINANZAS_POLITICAS,
  CASO_EPSTEIN,
]

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 30_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

async function seedInvestigation(config: InvestigationConfigData): Promise<void> {
  const session = getDriver().session()
  const now = new Date().toISOString()

  try {
    await session.executeWrite(async (tx) => {
      // 1. MERGE InvestigationConfig
      await tx.run(
        `MERGE (c:InvestigationConfig {id: $id})
         SET c.name = $name,
             c.description = $description,
             c.caso_slug = $caso_slug,
             c.status = $status,
             c.tags = $tags,
             c.created_at = coalesce(c.created_at, $now),
             c.updated_at = $now`,
        {
          id: config.id,
          name: config.name,
          description: config.description,
          caso_slug: config.caso_slug,
          status: config.status,
          tags: [...config.tags],
          now,
        },
      )

      // 2. MERGE SchemaDefinition
      const schemaId = `${config.id}:schema`
      await tx.run(
        `MATCH (c:InvestigationConfig {id: $configId})
         MERGE (s:SchemaDefinition {id: $schemaId})
         SET s.updated_at = $now
         MERGE (c)-[:HAS_SCHEMA]->(s)`,
        { configId: config.id, schemaId, now },
      )

      // 3. MERGE NodeTypeDefinitions
      for (const nt of config.nodeTypes) {
        const ntId = `${config.id}:node-type:${nt.name.toLowerCase()}`
        await tx.run(
          `MATCH (s:SchemaDefinition {id: $schemaId})
           MERGE (n:NodeTypeDefinition {id: $ntId})
           SET n.name = $name,
               n.properties_json = $properties_json,
               n.color = $color,
               n.icon = $icon
           MERGE (s)-[:DEFINES_NODE_TYPE]->(n)`,
          {
            schemaId,
            ntId,
            name: nt.name,
            properties_json: JSON.stringify(nt.properties),
            color: nt.color,
            icon: nt.icon,
          },
        )
      }

      // 4. MERGE RelTypeDefinitions
      for (const rt of config.relTypes) {
        const rtId = `${config.id}:rel-type:${rt.name.toLowerCase()}`
        await tx.run(
          `MATCH (s:SchemaDefinition {id: $schemaId})
           MERGE (r:RelTypeDefinition {id: $rtId})
           SET r.name = $name,
               r.from_types = $from_types,
               r.to_types = $to_types
           MERGE (s)-[:DEFINES_REL_TYPE]->(r)`,
          {
            schemaId,
            rtId,
            name: rt.name,
            from_types: rt.from_types,
            to_types: rt.to_types,
          },
        )
      }
    }, TX_CONFIG)

    const totalNodes = 1 + 1 + config.nodeTypes.length + config.relTypes.length
    console.log(
      `  ✓ ${config.name}: InvestigationConfig + SchemaDefinition + ${config.nodeTypes.length} node types + ${config.relTypes.length} rel types (${totalNodes} nodes)`,
    )
  } finally {
    await session.close()
  }
}

async function verifySeed(): Promise<boolean> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (c:InvestigationConfig)
       OPTIONAL MATCH (c)-[:HAS_SCHEMA]->(s:SchemaDefinition)
       OPTIONAL MATCH (s)-[:DEFINES_NODE_TYPE]->(nt:NodeTypeDefinition)
       OPTIONAL MATCH (s)-[:DEFINES_REL_TYPE]->(rt:RelTypeDefinition)
       RETURN c.id AS id, c.caso_slug AS slug,
              count(DISTINCT nt) AS nodeTypes,
              count(DISTINCT rt) AS relTypes
       ORDER BY c.id`,
      {},
      TX_CONFIG,
    )

    console.log('\nVerification:')
    let allValid = true
    const expectedCounts: Record<string, { nodeTypes: number; relTypes: number }> = {}

    for (const inv of ALL_INVESTIGATIONS) {
      expectedCounts[inv.id] = {
        nodeTypes: inv.nodeTypes.length,
        relTypes: inv.relTypes.length,
      }
    }

    for (const record of result.records) {
      const id = record.get('id') as string
      const slug = record.get('slug') as string
      const ntCount = (record.get('nodeTypes') as { toNumber?: () => number }).toNumber?.() ?? record.get('nodeTypes') as number
      const rtCount = (record.get('relTypes') as { toNumber?: () => number }).toNumber?.() ?? record.get('relTypes') as number
      const expected = expectedCounts[id]

      if (!expected) {
        console.log(`  ? ${id} (slug: ${slug}) - unexpected config`)
        continue
      }

      const ntOk = ntCount === expected.nodeTypes
      const rtOk = rtCount === expected.relTypes
      const ok = ntOk && rtOk

      if (!ok) allValid = false

      console.log(
        `  ${ok ? '✓' : '✗'} ${id} (slug: ${slug}): ${ntCount}/${expected.nodeTypes} node types, ${rtCount}/${expected.relTypes} rel types`,
      )
    }

    if (result.records.length < ALL_INVESTIGATIONS.length) {
      allValid = false
      console.log(`  ✗ Expected ${ALL_INVESTIGATIONS.length} configs, found ${result.records.length}`)
    }

    return allValid
  } finally {
    await session.close()
  }
}

async function main(): Promise<void> {
  const start = Date.now()

  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Connected.\n')

  console.log(`Seeding ${ALL_INVESTIGATIONS.length} investigation configs...`)
  for (const inv of ALL_INVESTIGATIONS) {
    await seedInvestigation(inv)
  }

  const valid = await verifySeed()

  const duration = Date.now() - start
  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Seed complete in ${duration}ms`)

  if (!valid) {
    console.error('Verification FAILED - check output above')
    await closeDriver()
    process.exit(1)
  }

  console.log('All verifications passed.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Seed script failed:', error)
  closeDriver().finally(() => process.exit(1))
})
