/**
 * Caso Dictadura query functions — Cypher queries for the Argentine
 * military dictatorship investigation knowledge graph.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * Results are transformed into GraphData or typed domain objects.
 */

import neo4j, { type Node, type Relationship, type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData, GraphLink, GraphNode } from '../neo4j/types'
import { transformNode, transformRelationship } from '../graph/transform'

import {
  CASO_DICTADURA_SLUG,
  type ConfidenceTier,
  type DictaduraPersona,
  type DictaduraEvento,
  type DictaduraCCD,
  type DictaduraCausa,
  type DictaduraDocumento,
  type PersonaCategory,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Neo4j record → typed object helpers
// ---------------------------------------------------------------------------

function toPersonaProps(node: Node): DictaduraPersona {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: typeof p.name === 'string' ? p.name : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    category: typeof p.category === 'string' ? p.category : 'victima',
    description: typeof p.description === 'string' ? p.description : undefined,
    ruvte_id: typeof p.ruvte_id === 'string' ? p.ruvte_id : undefined,
    dni: typeof p.dni === 'string' ? p.dni : undefined,
    rank: typeof p.rank === 'string' ? p.rank : undefined,
    unit: typeof p.unit === 'string' ? p.unit : undefined,
    detention_date: typeof p.detention_date === 'string' ? p.detention_date : undefined,
    detention_location: typeof p.detention_location === 'string' ? p.detention_location : undefined,
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as DictaduraPersona
}

function toEventoProps(node: Node): DictaduraEvento {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    date: typeof p.date === 'string' ? p.date : '',
    event_type: typeof p.event_type === 'string' ? p.event_type : 'politico',
    description: typeof p.description === 'string' ? p.description : '',
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as DictaduraEvento
}

function toCCDProps(node: Node): DictaduraCCD {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: typeof p.name === 'string' ? p.name : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    province: typeof p.province === 'string' ? p.province : undefined,
    lat: typeof p.lat === 'number' ? p.lat : undefined,
    lon: typeof p.lon === 'number' ? p.lon : undefined,
    military_branch: typeof p.military_branch === 'string' ? p.military_branch : undefined,
    operating_period: typeof p.operating_period === 'string' ? p.operating_period : undefined,
    is_memory_space: typeof p.is_memory_space === 'boolean' ? p.is_memory_space : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as DictaduraCCD
}

function toCausaProps(node: Node): DictaduraCausa {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: typeof p.name === 'string' ? p.name : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    case_number: typeof p.case_number === 'string' ? p.case_number : undefined,
    status: typeof p.status === 'string' ? p.status : 'en_instruccion',
    tribunal: typeof p.tribunal === 'string' ? p.tribunal : undefined,
    description: typeof p.description === 'string' ? p.description : undefined,
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as DictaduraCausa
}

// ---------------------------------------------------------------------------
// GraphData assembly helpers
// ---------------------------------------------------------------------------

function buildGraphData(nodes: readonly Node[], rels: readonly Relationship[]): GraphData {
  const elementIdToAppId = new Map<string, string>()
  const nodeMap = new Map<string, GraphNode>()

  for (const node of nodes) {
    const graphNode = transformNode(node)
    nodeMap.set(graphNode.id, graphNode)
    elementIdToAppId.set(node.elementId, graphNode.id)
  }

  const links: GraphLink[] = []
  const seenRelIds = new Set<string>()

  for (const rel of rels) {
    if (!rel) continue
    if (seenRelIds.has(rel.elementId)) continue
    seenRelIds.add(rel.elementId)

    const sourceId = elementIdToAppId.get(rel.startNodeElementId)
    const targetId = elementIdToAppId.get(rel.endNodeElementId)
    if (!sourceId || !targetId) continue

    links.push(transformRelationship(rel, sourceId, targetId))
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  }
}

// ---------------------------------------------------------------------------
// 1. Full investigation graph
// ---------------------------------------------------------------------------

export async function getInvestigationGraph(casoSlug: string, tiers?: ConfidenceTier[], labels?: string[]): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Build label filter clause if labels are specified
    const labelClause = labels && labels.length > 0
      ? `AND any(lbl IN labels(n) WHERE lbl IN $labels)`
      : ''

    const nodeResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR n.confidence_tier IN $tiers)
         ${labelClause}
       RETURN n`,
      { casoSlug, tiers: tiers ?? [], labels: labels ?? [] },
      { timeout: 30_000 },
    )

    if (nodeResult.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const nodes = nodeResult.records.map((r) => r.get('n') as Node)
    const nodeElementIds = new Set(nodes.map((n) => n.elementId))

    const relResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR a.confidence_tier IN $tiers)
         AND (size($tiers) = 0 OR b.confidence_tier IN $tiers)
       RETURN r`,
      { casoSlug, tiers: tiers ?? [] },
      { timeout: 30_000 },
    )

    const rels = relResult.records
      .map((r) => r.get('r') as Relationship)
      .filter((r) =>
        nodeElementIds.has(r.startNodeElementId) &&
        nodeElementIds.has(r.endNodeElementId),
      )

    return buildGraphData(nodes, rels)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 2. Timeline
// ---------------------------------------------------------------------------

export async function getTimeline(casoSlug: string, tiers?: ConfidenceTier[]): Promise<DictaduraEvento[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:DictaduraEvento)
       WHERE e.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR e.confidence_tier IN $tiers)
       RETURN e
       ORDER BY e.date ASC`,
      { casoSlug, tiers: tiers ?? [] },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => toEventoProps(record.get('e') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 3. Victim by slug
// ---------------------------------------------------------------------------

export async function getVictimBySlug(
  slug: string,
): Promise<{ persona: DictaduraPersona; connections: GraphData } | null> {
  const session = getDriver().session()

  try {
    const personResult = await session.run(
      `MATCH (p:DictaduraPersona {slug: $slug})
       RETURN p
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) return null

    const personNode = personResult.records[0].get('p') as Node
    const persona = toPersonaProps(personNode)

    const neighborResult = await session.run(
      `MATCH (p:DictaduraPersona {slug: $slug})-[r]-(neighbor)
       RETURN neighbor, r`,
      { slug },
      TX_CONFIG,
    )

    const allNodes: Node[] = [personNode]
    const allRels: Relationship[] = []

    for (const record of neighborResult.records) {
      allNodes.push(record.get('neighbor') as Node)
      allRels.push(record.get('r') as Relationship)
    }

    return { persona, connections: buildGraphData(allNodes, allRels) }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 4. Perpetrator by slug
// ---------------------------------------------------------------------------

export async function getPerpetratorBySlug(
  slug: string,
): Promise<{ persona: DictaduraPersona; connections: GraphData } | null> {
  return getVictimBySlug(slug) // same query pattern, different semantic
}

// ---------------------------------------------------------------------------
// 5. CCD by slug
// ---------------------------------------------------------------------------

export async function getCCDBySlug(
  slug: string,
): Promise<{ ccd: DictaduraCCD; connections: GraphData } | null> {
  const session = getDriver().session()

  try {
    const ccdResult = await session.run(
      `MATCH (c:DictaduraCCD {slug: $slug})
       RETURN c
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (ccdResult.records.length === 0) return null

    const ccdNode = ccdResult.records[0].get('c') as Node
    const ccd = toCCDProps(ccdNode)

    const neighborResult = await session.run(
      `MATCH (c:DictaduraCCD {slug: $slug})-[r]-(neighbor)
       RETURN neighbor, r`,
      { slug },
      TX_CONFIG,
    )

    const allNodes: Node[] = [ccdNode]
    const allRels: Relationship[] = []

    for (const record of neighborResult.records) {
      allNodes.push(record.get('neighbor') as Node)
      allRels.push(record.get('r') as Relationship)
    }

    return { ccd, connections: buildGraphData(allNodes, allRels) }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 6. CCD network (all CCDs with coordinates)
// ---------------------------------------------------------------------------

export async function getCCDNetwork(casoSlug: string): Promise<DictaduraCCD[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       RETURN c
       ORDER BY c.name ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => toCCDProps(r.get('c') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 7. Causa by slug
// ---------------------------------------------------------------------------

export async function getCausaBySlug(
  slug: string,
): Promise<{ causa: DictaduraCausa; connections: GraphData } | null> {
  const session = getDriver().session()

  try {
    const causaResult = await session.run(
      `MATCH (c:DictaduraCausa {slug: $slug})
       RETURN c
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (causaResult.records.length === 0) return null

    const causaNode = causaResult.records[0].get('c') as Node
    const causa = toCausaProps(causaNode)

    const neighborResult = await session.run(
      `MATCH (c:DictaduraCausa {slug: $slug})-[r]-(neighbor)
       RETURN neighbor, r`,
      { slug },
      TX_CONFIG,
    )

    const allNodes: Node[] = [causaNode]
    const allRels: Relationship[] = []

    for (const record of neighborResult.records) {
      allNodes.push(record.get('neighbor') as Node)
      allRels.push(record.get('r') as Relationship)
    }

    return { causa, connections: buildGraphData(allNodes, allRels) }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 8. Chain of command
// ---------------------------------------------------------------------------

export async function getChainOfCommand(unitSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH path = (u:DictaduraUnidadMilitar {slug: $unitSlug})-[:DEPENDIA_DE*0..5]->(parent)
       WITH nodes(path) AS pathNodes, relationships(path) AS pathRels
       UNWIND pathNodes AS n
       WITH collect(DISTINCT n) AS allNodes, pathRels
       UNWIND pathRels AS r
       RETURN allNodes AS nodes, collect(DISTINCT r) AS rels`,
      { unitSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) return { nodes: [], links: [] }

    const record = result.records[0]
    const nodes = record.get('nodes') as Node[]
    const rels = (record.get('rels') as (Relationship | null)[]).filter(
      (r): r is Relationship => r !== null,
    )

    return buildGraphData(nodes, rels)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 9. Search personas (full-text)
// ---------------------------------------------------------------------------

export async function searchPersonas(
  query: string,
  category?: PersonaCategory,
): Promise<DictaduraPersona[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `CALL db.index.fulltext.queryNodes('dictadura_persona_name_fulltext', $query)
       YIELD node, score
       WHERE node.caso_slug = 'caso-dictadura'
         AND ($category IS NULL OR node.category = $category)
       RETURN node
       ORDER BY score DESC
       LIMIT ${neo4j.int(50)}`,
      { query, category: category ?? null },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => toPersonaProps(r.get('node') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 10. Actors (personas by category)
// ---------------------------------------------------------------------------

export async function getActors(
  casoSlug: string,
  category?: PersonaCategory,
  tiers?: ConfidenceTier[],
): Promise<DictaduraPersona[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR p.confidence_tier IN $tiers)
         AND ($category IS NULL OR p.category = $category)
       RETURN p
       ORDER BY p.name ASC`,
      { casoSlug, tiers: tiers ?? [], category: category ?? null },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => toPersonaProps(r.get('p') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 11. Documents
// ---------------------------------------------------------------------------

export async function getDocuments(casoSlug: string, source?: string): Promise<DictaduraDocumento[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:DictaduraDocumento)
       WHERE d.caso_slug = $casoSlug
         AND ($source IS NULL OR d.source = $source)
       RETURN d
       ORDER BY d.title ASC`,
      { casoSlug, source: source ?? null },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => {
      const p = (r.get('d') as Node).properties as Record<string, unknown>
      return {
        id: typeof p.id === 'string' ? p.id : '',
        title: typeof p.title === 'string' ? p.title : '',
        slug: typeof p.slug === 'string' ? p.slug : '',
        doc_type: typeof p.doc_type === 'string' ? p.doc_type : 'informe',
        source_url: typeof p.source_url === 'string' ? p.source_url : undefined,
        summary: typeof p.summary === 'string' ? p.summary : undefined,
        date: typeof p.date === 'string' ? p.date : undefined,
        confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
        source: typeof p.source === 'string' ? p.source : undefined,
        ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
      } as DictaduraDocumento
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 12. Disappearance route
// ---------------------------------------------------------------------------

export async function getDisappearanceRoute(personSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona {slug: $slug})
       OPTIONAL MATCH (p)-[r1:SECUESTRADO_EN]->(l1)
       OPTIONAL MATCH (p)-[r2:DETENIDO_EN]->(c)
       OPTIONAL MATCH (p)-[r3:TRASLADADO_A]->(c2)
       OPTIONAL MATCH (p)-[r4:ASESINADO_EN]->(l2)
       WITH p, collect(DISTINCT l1) + collect(DISTINCT c) + collect(DISTINCT c2) + collect(DISTINCT l2) AS places,
            collect(DISTINCT r1) + collect(DISTINCT r2) + collect(DISTINCT r3) + collect(DISTINCT r4) AS rels
       RETURN [p] + places AS nodes, rels`,
      { slug: personSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) return { nodes: [], links: [] }

    const record = result.records[0]
    const nodes = (record.get('nodes') as (Node | null)[]).filter((n): n is Node => n !== null)
    const rels = (record.get('rels') as (Relationship | null)[]).filter(
      (r): r is Relationship => r !== null,
    )

    return buildGraphData(nodes, rels)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 13. Provincial stats (for heatmap)
// ---------------------------------------------------------------------------

export async function getProvincialStats(casoSlug: string): Promise<Array<{ province: string; count: number }>> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug AND c.province IS NOT NULL
       RETURN c.province AS province, count(c) AS count
       ORDER BY count DESC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => ({
      province: r.get('province') as string,
      count: (r.get('count') as { low: number }).low,
    }))
  } finally {
    await session.close()
  }
}
