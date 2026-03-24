/**
 * SIDE Desclasificados Ingestion
 *
 * Ingests the pre-extracted knowledge graph from declassified SIDE
 * (Secretaria de Inteligencia del Estado) documents into Neo4j.
 *
 * Source: property_graph_store.json (3,752 nodes, 4,056 relationships)
 *
 * Node mapping:
 *   PERSONA      -> DictaduraPersona (category: represor/complice_civil)
 *   DEPENDENCIA  -> DictaduraUnidadMilitar (SIDE departments)
 *   UNIDAD_MILITAR -> DictaduraUnidadMilitar
 *   DOCUMENTO    -> DictaduraDocumento
 *   ORGANIZACION -> DictaduraOrganizacion
 *   LUGAR        -> DictaduraLugar
 *   OPERACION    -> DictaduraOperacion
 *   EVENTO       -> DictaduraEvento
 *   POSICION/CODIGO/CLASIFICACION/text_chunk -> skipped
 *
 * Confidence tier: bronze
 * Ingestion wave: 25
 * Source: side-desclasificados
 *
 * Run with: npx tsx scripts/ingest-dictadura-side-desclasificados.ts
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CASO_SLUG = 'caso-dictadura'
const WAVE = 25
const SOURCE = 'side-desclasificados'
const BATCH_SIZE = 200

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawNode {
  label: string
  name: string
  properties: Record<string, string>
  embedding?: number[]
}

interface RawRelation {
  label: string
  source_id: string
  target_id: string
  properties: Record<string, string>
}

interface PropertyGraphStore {
  nodes: Record<string, RawNode>
  relations: Record<string, RawRelation>
  triplets: [string, string, string][]
}

// ---------------------------------------------------------------------------
// Label and relationship mapping
// ---------------------------------------------------------------------------

/** Maps source node labels to Neo4j labels. null = skip. */
const NODE_LABEL_MAP: Record<string, string | null> = {
  PERSONA: 'DictaduraPersona',
  DEPENDENCIA: 'DictaduraUnidadMilitar',
  UNIDAD_MILITAR: 'DictaduraUnidadMilitar',
  DOCUMENTO: 'DictaduraDocumento',
  ORGANIZACION: 'DictaduraOrganizacion',
  LUGAR: 'DictaduraLugar',
  OPERACION: 'DictaduraOperacion',
  EVENTO: 'DictaduraEvento',
  POSICION: null,
  CODIGO: null,
  CLASIFICACION: null,
  text_chunk: null,
}

/** Maps source relationship types to Neo4j types. null = skip. */
const REL_TYPE_MAP: Record<string, string | null> = {
  PERTENECE_A: 'PERTENECE_A',
  DEPENDE_DE: 'DEPENDIA_DE',
  MENCIONA: 'MENCIONA',
  UBICADO_EN: 'UBICADO_EN',
  REPORTA_A: 'REPORTA_A',
  AUTOR_DE: 'EMITIDO_POR', // reversed direction
  PARTICIPO_EN: 'PARTICIPO_EN',
  INCLUYE: 'INCLUYE',
  ORDENA: 'ORDENA',
  RELACIONADO_CON: 'RELACIONADO_CON',
  CALIFICADO_COMO: null,
  IDENTIFICADO_CON: null,
  TIENE: null,
  FECHA: null,
  ES: null,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  if (!text) return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

/** Split an array into batches of the given size */
function batch<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size))
  }
  return batches
}

/** Extract an integer from a Neo4j result value (handles Integer objects) */
function toNum(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val)
}

// ---------------------------------------------------------------------------
// Data loading & preparation
// ---------------------------------------------------------------------------

interface PreparedNode {
  id: string
  neo4jLabel: string
  name: string
  slug: string
  rank?: string          // resolved POSICION for PERSONA nodes
  sourceFile?: string
}

interface PreparedRel {
  sourceSlug: string
  targetSlug: string
  sourceLabel: string
  targetLabel: string
  relType: string
  reversed: boolean       // true for AUTOR_DE -> EMITIDO_POR (swap direction)
  sourceFile?: string
}

function loadAndPrepare(): {
  nodes: PreparedNode[]
  rels: PreparedRel[]
  skippedNodes: Record<string, number>
  skippedRels: Record<string, number>
} {
  const filePath = resolve(
    __dirname,
    '../_ingestion_data/dictadura/side-desclasificados/storage/property_graph_store.json',
  )
  console.log(`Reading ${filePath}...`)
  const raw: PropertyGraphStore = JSON.parse(readFileSync(filePath, 'utf-8'))

  // Build a map of node key -> resolved info for relationship resolution
  const nodeKeyToSlug = new Map<string, string>()
  const nodeKeyToLabel = new Map<string, string>()

  // --- Step 1: Resolve POSICION for PERSONA nodes via ES relationships ---
  const personaPositions = new Map<string, string[]>() // persona key -> position names
  for (const rel of Object.values(raw.relations)) {
    if (rel.label !== 'ES') continue
    const sourceNode = raw.nodes[rel.source_id]
    const targetNode = raw.nodes[rel.target_id]
    if (!sourceNode || !targetNode) continue
    if (sourceNode.label === 'PERSONA' && targetNode.label === 'POSICION') {
      const existing = personaPositions.get(rel.source_id) ?? []
      existing.push(targetNode.name)
      personaPositions.set(rel.source_id, existing)
    }
  }
  console.log(`  Resolved ${personaPositions.size} PERSONA->POSICION mappings via ES relationships`)

  // --- Step 2: Extract FECHA dates for DOCUMENTO nodes ---
  const documentDates = new Map<string, string>() // doc key -> date string
  for (const rel of Object.values(raw.relations)) {
    if (rel.label !== 'FECHA') continue
    const sourceNode = raw.nodes[rel.source_id]
    const targetNode = raw.nodes[rel.target_id]
    if (!sourceNode || !targetNode) continue
    if (sourceNode.label === 'DOCUMENTO') {
      // Use the target node's name as date string
      documentDates.set(rel.source_id, targetNode.name)
    }
  }
  console.log(`  Resolved ${documentDates.size} DOCUMENTO->FECHA date mappings`)

  // --- Step 3: Process all nodes ---
  const skippedNodes: Record<string, number> = {}
  const nodes: PreparedNode[] = []

  for (const [key, node] of Object.entries(raw.nodes)) {
    const neo4jLabel = NODE_LABEL_MAP[node.label]
    if (neo4jLabel === null || neo4jLabel === undefined) {
      skippedNodes[node.label] = (skippedNodes[node.label] ?? 0) + 1
      // Still record slug mapping so relationships can reference them later
      // (they will be filtered at rel creation time)
      nodeKeyToSlug.set(key, `side-${slugify(node.name)}`)
      nodeKeyToLabel.set(key, node.label)
      continue
    }

    const slug = `side-${slugify(node.name)}`
    nodeKeyToSlug.set(key, slug)
    nodeKeyToLabel.set(key, node.label)

    const prepared: PreparedNode = {
      id: slug,
      neo4jLabel,
      name: node.name,
      slug,
      sourceFile: node.properties?.file_name,
    }

    // Attach rank for PERSONA nodes
    if (node.label === 'PERSONA') {
      const positions = personaPositions.get(key)
      if (positions && positions.length > 0) {
        prepared.rank = positions.join('; ')
      }
    }

    nodes.push(prepared)
  }

  // --- Step 4: Process relationships ---
  const skippedRels: Record<string, number> = {}
  const rels: PreparedRel[] = []

  for (const rel of Object.values(raw.relations)) {
    const neo4jType = REL_TYPE_MAP[rel.label]
    if (neo4jType === null || neo4jType === undefined) {
      skippedRels[rel.label] = (skippedRels[rel.label] ?? 0) + 1
      continue
    }

    const sourceSlug = nodeKeyToSlug.get(rel.source_id)
    const targetSlug = nodeKeyToSlug.get(rel.target_id)
    const sourceLabel = nodeKeyToLabel.get(rel.source_id)
    const targetLabel = nodeKeyToLabel.get(rel.target_id)

    if (!sourceSlug || !targetSlug || !sourceLabel || !targetLabel) continue

    // Skip relationships where either endpoint is a skipped label
    const sourceMapped = NODE_LABEL_MAP[sourceLabel]
    const targetMapped = NODE_LABEL_MAP[targetLabel]
    if (!sourceMapped || !targetMapped) {
      skippedRels[rel.label] = (skippedRels[rel.label] ?? 0) + 1
      continue
    }

    const reversed = rel.label === 'AUTOR_DE'

    rels.push({
      sourceSlug: reversed ? targetSlug : sourceSlug,
      targetSlug: reversed ? sourceSlug : targetSlug,
      sourceLabel: reversed ? targetMapped : sourceMapped,
      targetLabel: reversed ? sourceMapped : targetMapped,
      relType: neo4jType,
      reversed,
      sourceFile: rel.properties?.file_name,
    })
  }

  return { nodes, rels, skippedNodes, skippedRels }
}

// ---------------------------------------------------------------------------
// Neo4j ingestion
// ---------------------------------------------------------------------------

async function createConstraints(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const labels = [
      'DictaduraPersona',
      'DictaduraUnidadMilitar',
      'DictaduraDocumento',
      'DictaduraOrganizacion',
      'DictaduraLugar',
      'DictaduraOperacion',
      'DictaduraEvento',
    ]
    for (const label of labels) {
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`,
      )
    }
    console.log('  Uniqueness constraints ensured\n')
  } finally {
    await session.close()
  }
}

async function ingestNodes(nodes: PreparedNode[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  const driver = getDriver()

  // Group nodes by Neo4j label for efficient batch Cypher
  const byLabel = new Map<string, PreparedNode[]>()
  for (const node of nodes) {
    const existing = byLabel.get(node.neo4jLabel) ?? []
    existing.push(node)
    byLabel.set(node.neo4jLabel, existing)
  }

  for (const [label, labelNodes] of byLabel) {
    const batches = batch(labelNodes, BATCH_SIZE)
    let labelCount = 0

    for (const batchItems of batches) {
      const session = driver.session()
      try {
        const tx = session.beginTransaction()

        if (label === 'DictaduraPersona') {
          // PERSONA nodes get category and optional rank
          for (const node of batchItems) {
            await tx.run(
              `MERGE (n:DictaduraPersona {id: $id})
               ON CREATE SET
                 n.name = $name,
                 n.slug = $slug,
                 n.category = $category,
                 n.rank = $rank,
                 n.caso_slug = $casoSlug,
                 n.confidence_tier = 'bronze',
                 n.ingestion_wave = $wave,
                 n.source = $source,
                 n.source_file = $sourceFile,
                 n.provenance = 'Documentos desclasificados SIDE',
                 n.created_at = datetime(),
                 n.updated_at = datetime()
               ON MATCH SET
                 n.updated_at = datetime()`,
              {
                id: node.id,
                name: node.name,
                slug: node.slug,
                category: 'represor',
                rank: node.rank ?? null,
                casoSlug: CASO_SLUG,
                wave: WAVE,
                source: SOURCE,
                sourceFile: node.sourceFile ?? null,
              },
            )
          }
        } else if (label === 'DictaduraDocumento') {
          for (const node of batchItems) {
            await tx.run(
              `MERGE (n:DictaduraDocumento {id: $id})
               ON CREATE SET
                 n.name = $name,
                 n.title = $name,
                 n.slug = $slug,
                 n.doc_type = 'documento_side',
                 n.classification = 'SECRETO',
                 n.caso_slug = $casoSlug,
                 n.confidence_tier = 'bronze',
                 n.ingestion_wave = $wave,
                 n.source = $source,
                 n.source_file = $sourceFile,
                 n.provenance = 'Documentos desclasificados SIDE',
                 n.created_at = datetime(),
                 n.updated_at = datetime()
               ON MATCH SET
                 n.updated_at = datetime()`,
              {
                id: node.id,
                name: node.name,
                slug: node.slug,
                casoSlug: CASO_SLUG,
                wave: WAVE,
                source: SOURCE,
                sourceFile: node.sourceFile ?? null,
              },
            )
          }
        } else {
          // Generic pattern for all other labels
          for (const node of batchItems) {
            await tx.run(
              `MERGE (n:${label} {id: $id})
               ON CREATE SET
                 n.name = $name,
                 n.slug = $slug,
                 n.caso_slug = $casoSlug,
                 n.confidence_tier = 'bronze',
                 n.ingestion_wave = $wave,
                 n.source = $source,
                 n.source_file = $sourceFile,
                 n.provenance = 'Documentos desclasificados SIDE',
                 n.created_at = datetime(),
                 n.updated_at = datetime()
               ON MATCH SET
                 n.updated_at = datetime()`,
              {
                id: node.id,
                name: node.name,
                slug: node.slug,
                casoSlug: CASO_SLUG,
                wave: WAVE,
                source: SOURCE,
                sourceFile: node.sourceFile ?? null,
              },
            )
          }
        }

        await tx.commit()
        labelCount += batchItems.length
      } finally {
        await session.close()
      }
    }

    counts[label] = labelCount
    console.log(`  ${label}: ${labelCount} nodes merged`)
  }

  return counts
}

async function ingestRelationships(rels: PreparedRel[]): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  const driver = getDriver()

  // Group by relationship type for logging
  const byType = new Map<string, PreparedRel[]>()
  for (const rel of rels) {
    const existing = byType.get(rel.relType) ?? []
    existing.push(rel)
    byType.set(rel.relType, existing)
  }

  for (const [relType, typeRels] of byType) {
    const batches = batch(typeRels, BATCH_SIZE)
    let typeCount = 0

    for (const rel of typeRels) {
      const session = driver.session()
      try {
        await session.run(
          `MATCH (a {id: $sourceId, caso_slug: $casoSlug})
           MATCH (b {id: $targetId, caso_slug: $casoSlug})
           MERGE (a)-[r:${relType}]->(b)
           ON CREATE SET
             r.source = $source,
             r.ingestion_wave = $wave,
             r.source_file = $sourceFile,
             r.created_at = datetime()`,
          {
            sourceId: rel.sourceSlug,
            targetId: rel.targetSlug,
            casoSlug: CASO_SLUG,
            source: SOURCE,
            wave: WAVE,
            sourceFile: rel.sourceFile ?? null,
          },
        )
        typeCount++
      } catch (e: unknown) {
        // Skip deadlock/transient errors on individual rels
      } finally {
        await session.close()
      }
    }

    counts[relType] = typeCount
    console.log(`  ${relType}: ${typeCount} relationships merged`)
  }

  return counts
}

// ---------------------------------------------------------------------------
// Cross-reference phases
// ---------------------------------------------------------------------------

/**
 * Cross-reference PERSONA names against existing DictaduraPersona nodes.
 * If a SIDE person matches an existing represor, link them with MISMO_QUE.
 */
async function crossReferencePersonas(nodes: PreparedNode[]): Promise<{
  matched: number
  unmatched: number
}> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  let unmatched = 0

  const personaNodes = nodes.filter((n) => n.neo4jLabel === 'DictaduraPersona')

  try {
    for (const persona of personaNodes) {
      const nameSlug = slugify(persona.name)

      // Look for existing DictaduraPersona with similar name but different source
      const result = await session.run(
        `MATCH (p:DictaduraPersona)
         WHERE p.caso_slug = $casoSlug
           AND p.source <> $source
           AND (p.slug CONTAINS $nameSlug OR toLower(p.name) CONTAINS toLower($name))
         RETURN p.id AS id
         LIMIT 1`,
        {
          casoSlug: CASO_SLUG,
          source: SOURCE,
          nameSlug,
          name: persona.name,
        },
      )

      if (result.records.length > 0) {
        const existingId = result.records[0].get('id') as string
        await session.run(
          `MATCH (a:DictaduraPersona {id: $sideId})
           MATCH (b:DictaduraPersona {id: $existingId})
           MERGE (a)-[r:MISMO_QUE]->(b)
           ON CREATE SET
             r.source = $source,
             r.ingestion_wave = $wave,
             r.match_type = 'name_slug',
             r.created_at = datetime()`,
          {
            sideId: persona.id,
            existingId,
            source: SOURCE,
            wave: WAVE,
          },
        )
        matched++
      } else {
        unmatched++
      }
    }
  } finally {
    await session.close()
  }

  return { matched, unmatched }
}

/**
 * Cross-reference ORGANIZACION names against existing DictaduraOrganizacion nodes.
 * Link matches with MISMO_QUE.
 */
async function crossReferenceOrganizaciones(nodes: PreparedNode[]): Promise<{
  matched: number
  unmatched: number
}> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  let unmatched = 0

  const orgNodes = nodes.filter((n) => n.neo4jLabel === 'DictaduraOrganizacion')

  try {
    for (const org of orgNodes) {
      const nameSlug = slugify(org.name)

      const result = await session.run(
        `MATCH (o:DictaduraOrganizacion)
         WHERE o.caso_slug = $casoSlug
           AND o.source <> $source
           AND (o.slug CONTAINS $nameSlug OR toLower(o.name) CONTAINS toLower($name))
         RETURN o.id AS id
         LIMIT 1`,
        {
          casoSlug: CASO_SLUG,
          source: SOURCE,
          nameSlug,
          name: org.name,
        },
      )

      if (result.records.length > 0) {
        const existingId = result.records[0].get('id') as string
        await session.run(
          `MATCH (a:DictaduraOrganizacion {id: $sideId})
           MATCH (b:DictaduraOrganizacion {id: $existingId})
           MERGE (a)-[r:MISMO_QUE]->(b)
           ON CREATE SET
             r.source = $source,
             r.ingestion_wave = $wave,
             r.match_type = 'name_slug',
             r.created_at = datetime()`,
          {
            sideId: org.id,
            existingId,
            source: SOURCE,
            wave: WAVE,
          },
        )
        matched++
      } else {
        unmatched++
      }
    }
  } finally {
    await session.close()
  }

  return { matched, unmatched }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== SIDE Desclasificados Ingestion (Wave 25) ===')
  console.log('Source: Declassified SIDE intelligence documents\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Check NEO4J_URI and credentials.')
    process.exit(1)
  }
  console.log('Neo4j connected\n')

  // Load and prepare data
  console.log('Loading property graph store...')
  const { nodes, rels, skippedNodes, skippedRels } = loadAndPrepare()
  console.log(`  ${nodes.length} nodes to ingest (${Object.values(skippedNodes).reduce((a, b) => a + b, 0)} skipped)`)
  console.log(`  ${rels.length} relationships to ingest (${Object.values(skippedRels).reduce((a, b) => a + b, 0)} skipped)`)
  console.log('  Skipped node labels:', JSON.stringify(skippedNodes))
  console.log('  Skipped rel types:', JSON.stringify(skippedRels))
  console.log()

  // Ensure constraints
  console.log('Ensuring uniqueness constraints...')
  await createConstraints()

  // Deduplicate nodes by id (slug) — multiple raw nodes can map to the same slug
  const uniqueNodes = new Map<string, PreparedNode>()
  for (const node of nodes) {
    if (!uniqueNodes.has(node.id)) {
      uniqueNodes.set(node.id, node)
    } else {
      // If duplicate, keep the one with more info (e.g., rank)
      const existing = uniqueNodes.get(node.id)!
      if (!existing.rank && node.rank) {
        uniqueNodes.set(node.id, node)
      }
    }
  }
  const deduped = [...uniqueNodes.values()]
  console.log(`  Deduplicated: ${nodes.length} raw -> ${deduped.length} unique nodes\n`)

  // Step 1: Ingest nodes
  console.log('Ingesting nodes...')
  const nodeCounts = await ingestNodes(deduped)
  const totalNodes = Object.values(nodeCounts).reduce((a, b) => a + b, 0)
  console.log(`  Total: ${totalNodes} nodes merged\n`)

  // Step 2: Ingest relationships
  console.log('Ingesting relationships...')
  const relCounts = await ingestRelationships(rels)
  const totalRels = Object.values(relCounts).reduce((a, b) => a + b, 0)
  console.log(`  Total: ${totalRels} relationships merged\n`)

  // Step 3: Cross-reference PERSONA
  console.log('Cross-referencing PERSONA against existing graph...')
  const personaXref = await crossReferencePersonas(deduped)
  console.log(`  Matched: ${personaXref.matched}`)
  console.log(`  Unmatched (new SIDE-only): ${personaXref.unmatched}\n`)

  // Step 4: Cross-reference ORGANIZACION
  console.log('Cross-referencing ORGANIZACION against existing graph...')
  const orgXref = await crossReferenceOrganizaciones(deduped)
  console.log(`  Matched: ${orgXref.matched}`)
  console.log(`  Unmatched (new SIDE-only): ${orgXref.unmatched}\n`)

  // Final summary
  console.log('=== Summary ===')
  console.log('Nodes by type:')
  for (const [label, count] of Object.entries(nodeCounts).sort()) {
    console.log(`  ${label}: ${count}`)
  }
  console.log(`  TOTAL: ${totalNodes}`)
  console.log()
  console.log('Relationships by type:')
  for (const [type, count] of Object.entries(relCounts).sort()) {
    console.log(`  ${type}: ${count}`)
  }
  console.log(`  TOTAL: ${totalRels}`)
  console.log()
  console.log('Cross-references:')
  console.log(`  DictaduraPersona MISMO_QUE: ${personaXref.matched}`)
  console.log(`  DictaduraOrganizacion MISMO_QUE: ${orgXref.matched}`)

  await closeDriver()
  console.log('\nSIDE Desclasificados ingestion complete!')
}

main().catch((err) => {
  console.error('SIDE Desclasificados ingestion failed:', err)
  closeDriver().finally(() => process.exit(1))
})
