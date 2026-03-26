import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { readQuery, withWriteTransaction } from '@/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const bodySchema = z.object({
  name_es: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  description_es: z.string().max(1000).default(''),
  description_en: z.string().max(1000).default(''),
  tags: z.array(z.string()).default([]),
  seed_entity_id: z.string().optional(),
  node_types: z
    .array(
      z.object({
        name: z.string().min(1).regex(/^[A-Za-z][A-Za-z0-9_]*$/),
        color: z.string().default('#6b7280'),
        icon: z.string().default('circle'),
      }),
    )
    .default([]),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSlug(name: string): string {
  return (
    'caso-' +
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50)
  )
}

// ---------------------------------------------------------------------------
// Default schema definitions
// ---------------------------------------------------------------------------

const DEFAULT_NODE_TYPES = [
  { name: 'Person', color: '#6366f1', icon: 'user' },
  { name: 'Organization', color: '#f59e0b', icon: 'building' },
  { name: 'Event', color: '#ef4444', icon: 'calendar' },
  { name: 'Document', color: '#8b5cf6', icon: 'file-text' },
  { name: 'Location', color: '#14b8a6', icon: 'map-pin' },
]

const DEFAULT_REL_TYPES = [
  { name: 'ASSOCIATED_WITH', from_types: 'Person,Organization', to_types: 'Person,Organization' },
  { name: 'AFFILIATED_WITH', from_types: 'Person', to_types: 'Organization' },
  { name: 'PARTICIPATED_IN', from_types: 'Person', to_types: 'Event' },
  { name: 'MENTIONED_IN', from_types: 'Person,Organization', to_types: 'Document' },
  { name: 'DOCUMENTED_BY', from_types: 'Event', to_types: 'Document' },
]

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Parse + validate body
  let body: z.infer<typeof bodySchema>
  try {
    const raw = await request.json()
    body = bodySchema.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { success: false, error: `Invalid request body: ${message}` },
      { status: 400 },
    )
  }

  const slug = generateSlug(body.name_es)

  // 2. Check slug uniqueness
  try {
    const existing = await readQuery(
      'MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c LIMIT 1',
      { slug },
      (record) => record.get('c'),
    )

    if (existing.records.length > 0) {
      return Response.json(
        { success: false, error: `Investigation with slug "${slug}" already exists` },
        { status: 409 },
      )
    }
  } catch (error) {
    console.error('[casos/create] slug uniqueness check failed', error)
    const message = error instanceof Error ? error.message : String(error)
    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json(
      { success: false, error: 'Failed to check slug uniqueness' },
      { status: 500 },
    )
  }

  const configId = crypto.randomUUID()
  const schemaId = `${configId}:schema`

  // Merge default node types + custom ones (deduplicate by name)
  const customNames = new Set(body.node_types.map((nt) => nt.name))
  const mergedNodeTypes = [
    ...DEFAULT_NODE_TYPES.filter((nt) => !customNames.has(nt.name)),
    ...body.node_types,
  ]

  // 3–6. Create all nodes in a single write transaction
  try {
    await withWriteTransaction(async (tx) => {
      // 3. Create InvestigationConfig
      await tx.run(
        `CREATE (c:InvestigationConfig {
          id: $id,
          caso_slug: $slug,
          name: $nameEs,
          name_es: $nameEs,
          name_en: $nameEn,
          description_es: $descEs,
          description_en: $descEn,
          status: 'active',
          tags: $tags,
          created_at: datetime()
        })`,
        {
          id: configId,
          slug,
          nameEs: body.name_es,
          nameEn: body.name_en,
          descEs: body.description_es,
          descEn: body.description_en,
          tags: body.tags,
        },
      )

      // 4. Create SchemaDefinition + link
      await tx.run(
        `MATCH (c:InvestigationConfig {caso_slug: $slug})
         CREATE (s:SchemaDefinition {id: $schemaId, name: $schemaName})
         CREATE (c)-[:HAS_SCHEMA]->(s)`,
        { slug, schemaId, schemaName: `${slug}-schema` },
      )

      // 5. Create NodeTypeDefinitions (defaults + custom)
      await tx.run(
        `MATCH (s:SchemaDefinition {id: $schemaId})
         UNWIND $types AS t
         CREATE (nt:NodeTypeDefinition {
           id: $configId + ':node-type:' + toLower(t.name),
           name: t.name,
           color: t.color,
           icon: t.icon,
           properties_json: '{}'
         })
         CREATE (s)-[:DEFINES_NODE_TYPE]->(nt)`,
        { schemaId, configId, types: mergedNodeTypes },
      )

      // 6. Create RelTypeDefinitions
      await tx.run(
        `MATCH (s:SchemaDefinition {id: $schemaId})
         UNWIND $rels AS r
         CREATE (rt:RelTypeDefinition {
           id: $configId + ':rel-type:' + toLower(r.name),
           name: r.name,
           from_types: r.from_types,
           to_types: r.to_types
         })
         CREATE (s)-[:DEFINES_REL_TYPE]->(rt)`,
        { schemaId, configId, rels: DEFAULT_REL_TYPES },
      )
    })
  } catch (error) {
    console.error('[casos/create] graph creation failed', error)
    const message = error instanceof Error ? error.message : String(error)
    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json(
      { success: false, error: 'Failed to create investigation' },
      { status: 500 },
    )
  }

  // 7. Optional seed entity copy (copy just the seed node with new caso_slug)
  if (body.seed_entity_id) {
    try {
      await withWriteTransaction(async (tx) => {
        // Fetch the seed node properties
        const seedResult = await tx.run(
          `MATCH (n {id: $seedId})
           RETURN n, labels(n) AS nodeLabels
           LIMIT 1`,
          { seedId: body.seed_entity_id },
        )

        if (seedResult.records.length > 0) {
          const record = seedResult.records[0]
          const seedNode = record.get('n') as { properties: Record<string, unknown> }
          const nodeLabels = record.get('nodeLabels') as string[]
          const label = nodeLabels[0] ?? 'Person'
          const props = { ...seedNode.properties }
          const newId = `${slug}:${String(props.id ?? crypto.randomUUID())}`

          await tx.run(
            `CREATE (n:\`${label}\` $props)
             SET n.id = $newId,
                 n.caso_slug = $slug,
                 n.seeded_from = $seedId`,
            {
              props,
              newId,
              slug,
              seedId: body.seed_entity_id,
            },
          )
        }
      })
    } catch (error) {
      // Seed copy failure is non-fatal — investigation was already created
      console.warn('[casos/create] seed entity copy failed (non-fatal):', error)
    }
  }

  return Response.json(
    {
      success: true,
      data: {
        caso_slug: slug,
        investigation_config_id: configId,
      },
    },
    { status: 201 },
  )
}
