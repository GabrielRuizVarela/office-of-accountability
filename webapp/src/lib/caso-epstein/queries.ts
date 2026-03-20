/**
 * Caso Epstein query functions — Cypher queries for the Epstein
 * investigation knowledge graph.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * Results are transformed into GraphData or typed domain objects.
 */

import neo4j, { type Node, type Relationship, type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData, GraphLink, GraphNode } from '../neo4j/types'
import { transformNode, transformRelationship } from '../graph/transform'

import {
  CASO_EPSTEIN_SLUG,
  type ConfidenceTier,
  type EpsteinPerson,
  type EpsteinEvent,
  type EpsteinDocument,
  type EpsteinDocumentWithCount,
  type EpsteinLegalCase,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum query execution time in milliseconds (security: prevent graph bombs) */
const QUERY_TIMEOUT_MS = 15_000

/** Transaction config applied to all queries */
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Neo4j record → typed object helpers
// ---------------------------------------------------------------------------

function toPersonProps(node: Node): EpsteinPerson {
  const p = node.properties as Record<string, unknown>
  // `as EpsteinPerson` is required because TS infers `confidence_tier` as
  // `ConfidenceTier | undefined` from the conditional expression, which does not
  // narrow to the optional property type without a cast. Removing it causes a
  // "Type '... | undefined' is not assignable to type 'ConfidenceTier'" error.
  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: typeof p.name === 'string' ? p.name : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    role: typeof p.role === 'string' ? p.role : '',
    description: typeof p.description === 'string' ? p.description : '',
    nationality: typeof p.nationality === 'string' ? p.nationality : '',
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as EpsteinPerson
}

function toEventProps(node: Node): EpsteinEvent {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    date: typeof p.date === 'string' ? p.date : '',
    event_type: typeof p.event_type === 'string' ? p.event_type : 'legal',
    description: typeof p.description === 'string' ? p.description : '',
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as EpsteinEvent
}

function toDocumentProps(node: Node): EpsteinDocument {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    doc_type: typeof p.doc_type === 'string' ? p.doc_type : 'court_filing',
    source_url: typeof p.source_url === 'string' ? p.source_url : '',
    summary: typeof p.summary === 'string' ? p.summary : '',
    date: typeof p.date === 'string' ? p.date : '',
    key_findings: Array.isArray(p.key_findings)
      ? p.key_findings.filter((item: unknown): item is string => typeof item === 'string')
      : [],
    excerpt: typeof p.excerpt === 'string' ? p.excerpt : '',
    page_count: typeof p.page_count === 'number'
      ? p.page_count
      : p.page_count && typeof p.page_count === 'object' && 'low' in p.page_count
        ? (p.page_count as { low: number }).low
        : null,
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as EpsteinDocument
}

function toLegalCaseProps(node: Node): EpsteinLegalCase {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    case_number: typeof p.case_number === 'string' ? p.case_number : '',
    court: typeof p.court === 'string' ? p.court : '',
    status: typeof p.status === 'string' ? p.status : 'filed',
    date_filed: typeof p.date_filed === 'string' ? p.date_filed : '',
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  } as EpsteinLegalCase
}

// ---------------------------------------------------------------------------
// GraphData assembly helpers
// ---------------------------------------------------------------------------

/**
 * Build GraphData from a set of nodes and relationships,
 * resolving Neo4j elementIds to application-level IDs.
 */
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

/**
 * Fetch the full subgraph for the Epstein investigation.
 *
 * Two-pass query: first collect matching nodes, then find relationships
 * between them. Avoids O(n²) cartesian product that times out on large graphs.
 */
export async function getInvestigationGraph(casoSlug: string, tiers?: ConfidenceTier[]): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Pass 1: collect all matching nodes
    const nodeResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR n.confidence_tier IN $tiers)
       RETURN n`,
      { casoSlug, tiers: tiers ?? [] },
      { timeout: 30_000 },
    )

    if (nodeResult.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const nodes = nodeResult.records.map((r) => r.get('n') as Node)
    const nodeElementIds = new Set(nodes.map((n) => n.elementId))

    // Pass 2: find relationships between matching nodes
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

/**
 * Fetch all Event nodes for the investigation, ordered by date ascending.
 */
export async function getTimeline(casoSlug: string, tiers?: ConfidenceTier[]): Promise<EpsteinEvent[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:Event)
       WHERE e.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR e.confidence_tier IN $tiers)
       RETURN e
       ORDER BY e.date ASC`,
      { casoSlug, tiers: tiers ?? [] },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => toEventProps(record.get('e') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 3. Person by slug
// ---------------------------------------------------------------------------

/**
 * Fetch a person and all their connections (neighbors).
 * Returns null if the person does not exist.
 */
export async function getPersonBySlug(
  slug: string,
): Promise<{ person: EpsteinPerson; connections: GraphData } | null> {
  const session = getDriver().session()

  try {
    // Find the person node
    const personResult = await session.run(
      `MATCH (p:Person {slug: $slug, caso_slug: $casoSlug})
       RETURN p
       LIMIT 1`,
      { slug, casoSlug: CASO_EPSTEIN_SLUG },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) {
      return null
    }

    const personNode = personResult.records[0].get('p') as Node
    const person = toPersonProps(personNode)

    // Fetch neighbors and relationships
    const neighborResult = await session.run(
      `MATCH (p:Person {slug: $slug, caso_slug: $casoSlug})-[r]-(neighbor)
       RETURN neighbor, r`,
      { slug, casoSlug: CASO_EPSTEIN_SLUG },
      TX_CONFIG,
    )

    const allNodes: Node[] = [personNode]
    const allRels: Relationship[] = []

    for (const record of neighborResult.records) {
      allNodes.push(record.get('neighbor') as Node)
      allRels.push(record.get('r') as Relationship)
    }

    const connections = buildGraphData(allNodes, allRels)

    return { person, connections }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 4. Flight log
// ---------------------------------------------------------------------------

/**
 * Fetch all Flight nodes and their relationships to Person and Location nodes.
 */
export async function getFlightLog(casoSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (f:Flight)
       WHERE f.caso_slug = $casoSlug
       OPTIONAL MATCH (f)-[r]-(connected)
       WHERE connected:Person OR connected:Location
       RETURN collect(DISTINCT f) + collect(DISTINCT connected) AS nodes,
              collect(DISTINCT r) AS rels`,
      { casoSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return { nodes: [], links: [] }
    }

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
// 5. Actors (all persons)
// ---------------------------------------------------------------------------

/**
 * Fetch all Person nodes in the investigation, ordered by name.
 */
export async function getActors(casoSlug: string, tiers?: ConfidenceTier[]): Promise<EpsteinPerson[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE p.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR p.confidence_tier IN $tiers)
       RETURN p
       ORDER BY p.name ASC`,
      { casoSlug, tiers: tiers ?? [] },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => toPersonProps(record.get('p') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 6. Documents
// ---------------------------------------------------------------------------

/**
 * Fetch all Document nodes in the investigation, with mention counts.
 */
export async function getDocuments(casoSlug: string, tiers?: ConfidenceTier[]): Promise<EpsteinDocumentWithCount[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document)
       WHERE d.caso_slug = $casoSlug
         AND (size($tiers) = 0 OR d.confidence_tier IN $tiers)
       OPTIONAL MATCH (p:Person)-[:MENTIONED_IN]->(d)
       RETURN d, count(p) AS personCount
       ORDER BY d.title ASC`,
      { casoSlug, tiers: tiers ?? [] },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => ({
      ...toDocumentProps(record.get('d') as Node),
      mentionedPersonCount: (record.get('personCount') as { low: number }).low ?? 0,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 7. Legal cases
// ---------------------------------------------------------------------------

/**
 * Fetch all LegalCase nodes in the investigation.
 */
export async function getLegalCases(casoSlug: string): Promise<EpsteinLegalCase[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (lc:LegalCase)
       WHERE lc.caso_slug = $casoSlug
       RETURN lc
       ORDER BY lc.date_filed ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => toLegalCaseProps(record.get('lc') as Node))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 8. Location network
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Document by slug (with graph connections)
// ---------------------------------------------------------------------------

export interface DocumentDetail {
  document: EpsteinDocument
  mentionedPersons: EpsteinPerson[]
  legalCases: EpsteinLegalCase[]
  relatedEvents: EpsteinEvent[]
  relatedDocuments: EpsteinDocument[]
}

export async function getDocumentBySlug(
  casoSlug: string,
  slug: string,
): Promise<DocumentDetail | null> {
  const session = getDriver().session()

  try {
    // 1. Get the document
    const docResult = await session.run(
      `MATCH (d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN d
       LIMIT 1`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    if (docResult.records.length === 0) return null

    const docNode = docResult.records[0].get('d') as Node
    const document = toDocumentProps(docNode)

    // 2. Get mentioned persons
    const personsResult = await session.run(
      `MATCH (p:Person)-[:MENTIONED_IN]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN p
       ORDER BY p.name ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const mentionedPersons = personsResult.records.map(
      (r: Neo4jRecord) => toPersonProps(r.get('p') as Node),
    )

    // 3. Get legal cases
    const casesResult = await session.run(
      `MATCH (d:Document {slug: $slug, caso_slug: $casoSlug})-[:FILED_IN]->(lc:LegalCase)
       RETURN lc
       ORDER BY lc.date_filed ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const legalCases = casesResult.records.map(
      (r: Neo4jRecord) => toLegalCaseProps(r.get('lc') as Node),
    )

    // 4. Get related events
    const eventsResult = await session.run(
      `MATCH (e:Event)-[:DOCUMENTED_BY]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const relatedEvents = eventsResult.records.map(
      (r: Neo4jRecord) => toEventProps(r.get('e') as Node),
    )

    // 5. Get cross-referenced documents (share at least one person)
    const crossRefResult = await session.run(
      `MATCH (p:Person)-[:MENTIONED_IN]->(d:Document {slug: $slug, caso_slug: $casoSlug})
       WITH collect(p) AS persons
       UNWIND persons AS person
       MATCH (person)-[:MENTIONED_IN]->(other:Document {caso_slug: $casoSlug})
       WHERE other.slug <> $slug
       RETURN DISTINCT other
       ORDER BY other.title ASC
       LIMIT 10`,
      { slug, casoSlug },
      TX_CONFIG,
    )
    const relatedDocuments = crossRefResult.records.map(
      (r: Neo4jRecord) => toDocumentProps(r.get('other') as Node),
    )

    return { document, mentionedPersons, legalCases, relatedEvents, relatedDocuments }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 8. Location network
// ---------------------------------------------------------------------------

/**
 * Fetch Location nodes with VISITED/OWNED relationships and connected Person nodes.
 */
export async function getLocationNetwork(casoSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (loc:Location)
       WHERE loc.caso_slug = $casoSlug
       OPTIONAL MATCH (loc)-[r:VISITED|OWNED]-(p:Person)
       RETURN collect(DISTINCT loc) + collect(DISTINCT p) AS nodes,
              collect(DISTINCT r) AS rels`,
      { casoSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return { nodes: [], links: [] }
    }

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
