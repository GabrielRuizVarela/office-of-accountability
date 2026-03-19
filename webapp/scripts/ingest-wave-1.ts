/**
 * Wave 1 Ingestion Script — rhowardstone/Epstein-research-data
 * Run with: npx tsx scripts/ingest-wave-1.ts
 *
 * Imports entities and relationships from the rhowardstone GitHub dataset
 * into Neo4j as bronze-tier nodes scoped to caso-epstein.
 *
 * Data must be pre-cloned to _ingestion_data/rhowardstone/:
 *   git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git \
 *     _ingestion_data/rhowardstone
 *
 * Source files consumed:
 *   - knowledge_graph_entities.json    (606 entities: person, organization, shell_company,
 *                                        location, property, aircraft)
 *   - knowledge_graph_relationships.json (2302 relationships)
 *
 * Entity-type → Neo4j label mapping:
 *   person         → Person
 *   organization   → Organization
 *   shell_company  → Organization  (with org_subtype: 'shell_company')
 *   location       → Location
 *   property       → Location      (with location_type: 'property')
 *   aircraft       → Location      (with location_type: 'aircraft')
 *
 * Relationship-type mapping (source → Neo4j):
 *   associated_with  → ASSOCIATED_WITH
 *   communicated_with → COMMUNICATED_WITH
 *   traveled_with    → FLEW_WITH
 *   employed_by      → EMPLOYED_BY
 *   paid_by          → FINANCED
 *   victim_of        → VICTIM_OF
 *   represented_by   → AFFILIATED_WITH
 *   recruited_by     → ASSOCIATED_WITH
 *   related_to       → ASSOCIATED_WITH
 *   owned_by         → OWNED
 *
 * Node IDs use pattern: ep-w1-{slug}
 * All nodes receive: caso_slug, ingestion_wave: 1, confidence_tier: 'bronze', source: 'rhowardstone'
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { executeWrite, verifyConnectivity, closeDriver, readQuery } from '../src/lib/neo4j/client'
import { normalizeName, toSlug, dedup } from '../src/lib/ingestion/dedup'
import { saveConflicts, printReport } from '../src/lib/ingestion/quality'
import type { ConflictRecord, WaveReport } from '../src/lib/ingestion/types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WAVE = 1
const SOURCE = 'rhowardstone' as const
const CASO_SLUG = 'caso-epstein'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'rhowardstone')
const ENTITIES_FILE = join(DATA_DIR, 'knowledge_graph_entities.json')
const RELATIONSHIPS_FILE = join(DATA_DIR, 'knowledge_graph_relationships.json')

// ---------------------------------------------------------------------------
// Source data types (rhowardstone schema)
// ---------------------------------------------------------------------------

interface RhEntity {
  id: number
  name: string
  entity_type: string
  source_id: number | null
  source_table: string | null
  aliases: string | null
  metadata: string | null
  created_at: string
}

interface RhRelationship {
  id: number
  source_entity_id: number
  target_entity_id: number
  relationship_type: string
  weight: number
  date_first: string | null
  date_last: string | null
  metadata: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Entity-type → Neo4j label
// ---------------------------------------------------------------------------

function toNeo4jLabel(entityType: string): string {
  switch (entityType) {
    case 'person':
      return 'Person'
    case 'organization':
    case 'shell_company':
      return 'Organization'
    case 'location':
    case 'property':
    case 'aircraft':
      return 'Location'
    default:
      return 'Person' // safe fallback
  }
}

// ---------------------------------------------------------------------------
// Relationship-type → Neo4j relationship type
// ---------------------------------------------------------------------------

function toNeo4jRelType(rhType: string): string {
  switch (rhType) {
    case 'associated_with':
      return 'ASSOCIATED_WITH'
    case 'communicated_with':
      return 'COMMUNICATED_WITH'
    case 'traveled_with':
      return 'FLEW_WITH'
    case 'employed_by':
      return 'EMPLOYED_BY'
    case 'paid_by':
      return 'FINANCED'
    case 'victim_of':
      return 'VICTIM_OF'
    case 'represented_by':
      return 'AFFILIATED_WITH'
    case 'recruited_by':
    case 'related_to':
      return 'ASSOCIATED_WITH'
    case 'owned_by':
      return 'OWNED'
    default:
      return 'ASSOCIATED_WITH'
  }
}

// ---------------------------------------------------------------------------
// Build Wave-1 node ID from rhowardstone entity id + slug
// ---------------------------------------------------------------------------

function toWave1Id(name: string): string {
  return `ep-w1-${toSlug(name)}`
}

// ---------------------------------------------------------------------------
// Query existing caso-epstein nodes into dedup maps
// ---------------------------------------------------------------------------

async function buildExistingMaps(): Promise<{
  nameMap: Map<string, { id: string; name: string }>
  slugMap: Map<string, { id: string; name: string }>
}> {
  const nameMap = new Map<string, { id: string; name: string }>()
  const slugMap = new Map<string, { id: string; name: string }>()

  const labels = ['Person', 'Organization', 'Location', 'Event', 'Document', 'LegalCase']
  for (const label of labels) {
    const result = await readQuery(
      `MATCH (n:${label}) WHERE n.caso_slug = $casoSlug RETURN n.id AS id, n.name AS name, n.slug AS slug`,
      { casoSlug: CASO_SLUG },
      (record) => ({
        id: record.get('id') as string,
        name: record.get('name') as string,
        slug: record.get('slug') as string | null,
      }),
    )

    for (const row of result.records) {
      if (!row.id || !row.name) continue
      const norm = normalizeName(row.name)
      nameMap.set(norm, { id: row.id, name: row.name })
      const slug = row.slug ?? toSlug(row.name)
      slugMap.set(slug, { id: row.id, name: row.name })
    }
  }

  return { nameMap, slugMap }
}

// ---------------------------------------------------------------------------
// Create a bronze node for a given label
// ---------------------------------------------------------------------------

async function createNode(
  label: string,
  id: string,
  entity: RhEntity,
  metadata: Record<string, unknown>,
): Promise<void> {
  const slug = toSlug(entity.name)

  // Shared ingestion meta properties
  const meta = {
    id,
    name: entity.name,
    slug,
    caso_slug: CASO_SLUG,
    ingestion_wave: WAVE,
    confidence_tier: 'bronze' as const,
    source: SOURCE,
    rh_entity_id: entity.id,
    rh_entity_type: entity.entity_type,
    aliases: entity.aliases ?? '',
    // Flatten useful metadata fields
    org_subtype: entity.entity_type === 'shell_company' ? 'shell_company' : null,
    location_type: ['property', 'aircraft'].includes(entity.entity_type) ? entity.entity_type : null,
    occupation: (metadata.occupation as string) ?? null,
    person_type: (metadata.person_type as string) ?? null,
    legal_status: (metadata.legal_status as string) ?? null,
    public_figure: (metadata.public_figure as boolean) ?? null,
    org_type: (metadata.org_type as string) ?? null,
    jurisdiction: (metadata.jurisdiction as string) ?? null,
    address: (metadata.address as string) ?? null,
  }

  await executeWrite(
    `MERGE (n:${label} {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.rh_entity_id = $rh_entity_id,
         n.rh_entity_type = $rh_entity_type,
         n.aliases = $aliases,
         n.org_subtype = $org_subtype,
         n.location_type = $location_type,
         n.occupation = $occupation,
         n.person_type = $person_type,
         n.legal_status = $legal_status,
         n.public_figure = $public_figure,
         n.org_type = $org_type,
         n.jurisdiction = $jurisdiction,
         n.address = $address`,
    meta,
  )
}

// ---------------------------------------------------------------------------
// Create a bronze relationship between two nodes by Neo4j ID
// ---------------------------------------------------------------------------

async function createRelationship(
  relType: string,
  sourceNeo4jId: string,
  targetNeo4jId: string,
  rel: RhRelationship,
): Promise<void> {
  await executeWrite(
    `MATCH (a {id: $sourceId}), (b {id: $targetId})
     MERGE (a)-[r:${relType}]->(b)
     SET r.confidence_tier = 'bronze',
         r.source = $source,
         r.ingestion_wave = $wave,
         r.rh_rel_id = $rhRelId,
         r.weight = $weight,
         r.date_first = $dateFirst,
         r.date_last = $dateLast,
         r.rh_rel_type = $rhRelType`,
    {
      sourceId: sourceNeo4jId,
      targetId: targetNeo4jId,
      source: SOURCE,
      wave: WAVE,
      rhRelId: rel.id,
      weight: rel.weight,
      dateFirst: rel.date_first ?? null,
      dateLast: rel.date_last ?? null,
      rhRelType: rel.relationship_type,
    },
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now()

  // ── Check data directory exists ─────────────────────────────────────────
  if (!existsSync(DATA_DIR) || !existsSync(ENTITIES_FILE) || !existsSync(RELATIONSHIPS_FILE)) {
    console.error('\n  ERROR: Data not found at', DATA_DIR)
    console.error('\n  Please clone the source repo first:')
    console.error('\n    git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git \\')
    console.error('      _ingestion_data/rhowardstone\n')
    process.exit(1)
  }

  // ── Connect ─────────────────────────────────────────────────────────────
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // ── Load source data ─────────────────────────────────────────────────────
  console.log('Loading source data...')
  const entities: RhEntity[] = JSON.parse(readFileSync(ENTITIES_FILE, 'utf-8'))
  const relationships: RhRelationship[] = JSON.parse(readFileSync(RELATIONSHIPS_FILE, 'utf-8'))
  console.log(`  Entities:      ${entities.length}`)
  console.log(`  Relationships: ${relationships.length}\n`)

  // ── Build existing node dedup maps ───────────────────────────────────────
  console.log('Building dedup maps from existing Neo4j nodes...')
  const { nameMap, slugMap } = await buildExistingMaps()
  console.log(`  Existing nodes indexed: ${nameMap.size}\n`)

  // ── Process entities ─────────────────────────────────────────────────────
  console.log('Processing entities...')

  const conflicts: ConflictRecord[] = []
  let nodesCreated = 0
  let nodesSkipped = 0

  // Map from rhowardstone numeric entity id → Neo4j node id (for relationship resolution)
  const rhIdToNeo4jId = new Map<number, string>()

  for (const entity of entities) {
    const dedupMatch = dedup(entity.name, nameMap, slugMap)

    if (dedupMatch.result === 'exact_match') {
      // Point rh id to existing node
      rhIdToNeo4jId.set(entity.id, dedupMatch.existingId!)
      nodesSkipped++
      continue
    }

    if (dedupMatch.result === 'fuzzy_match') {
      // Log conflict, but still create the bronze node (don't merge silently)
      conflicts.push({
        incomingId: toWave1Id(entity.name),
        incomingName: entity.name,
        existingId: dedupMatch.existingId!,
        existingName: dedupMatch.existingName!,
        matchType: 'fuzzy_match',
        distance: dedupMatch.distance,
        source: SOURCE,
        wave: WAVE,
      })
      // Fall through to create node
    }

    // no_match or fuzzy_match → create bronze node
    const neo4jId = toWave1Id(entity.name)
    const label = toNeo4jLabel(entity.entity_type)

    let parsedMeta: Record<string, unknown> = {}
    if (entity.metadata) {
      try {
        parsedMeta = JSON.parse(entity.metadata)
      } catch {
        // ignore malformed metadata
      }
    }

    await createNode(label, neo4jId, entity, parsedMeta)

    // Register in dedup maps so later entities don't conflict with this one
    const norm = normalizeName(entity.name)
    const slug = toSlug(entity.name)
    nameMap.set(norm, { id: neo4jId, name: entity.name })
    slugMap.set(slug, { id: neo4jId, name: entity.name })

    rhIdToNeo4jId.set(entity.id, neo4jId)
    nodesCreated++
  }

  console.log(`  Created: ${nodesCreated}  Skipped: ${nodesSkipped}  Conflicts: ${conflicts.length}\n`)

  // ── Process relationships ────────────────────────────────────────────────
  console.log('Processing relationships...')

  let edgesCreated = 0
  let edgesSkipped = 0

  for (const rel of relationships) {
    const sourceNeo4jId = rhIdToNeo4jId.get(rel.source_entity_id)
    const targetNeo4jId = rhIdToNeo4jId.get(rel.target_entity_id)

    if (!sourceNeo4jId || !targetNeo4jId) {
      // One or both endpoints unresolved — skip
      edgesSkipped++
      continue
    }

    const relType = toNeo4jRelType(rel.relationship_type)
    await createRelationship(relType, sourceNeo4jId, targetNeo4jId, rel)
    edgesCreated++
  }

  console.log(`  Created: ${edgesCreated}  Skipped: ${edgesSkipped}\n`)

  // ── Save conflicts and print report ─────────────────────────────────────
  const conflictPath = saveConflicts(WAVE, conflicts)
  console.log(`Conflicts saved to: ${conflictPath}`)

  const report: WaveReport = {
    wave: WAVE,
    source: SOURCE,
    nodesCreated,
    nodesSkipped,
    edgesCreated,
    edgesSkipped,
    conflicts,
    durationMs: Date.now() - startMs,
  }

  printReport(report)

  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 1 ingestion failed:', error)
  closeDriver().finally(() => process.exit(1))
})
