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
  type EpsteinPerson,
  type EpsteinEvent,
  type EpsteinDocument,
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
  return {
    id: typeof p.id === 'string' ? p.id : '',
    name: typeof p.name === 'string' ? p.name : '',
    slug: typeof p.slug === 'string' ? p.slug : '',
    role: typeof p.role === 'string' ? p.role : '',
    description: typeof p.description === 'string' ? p.description : '',
    nationality: typeof p.nationality === 'string' ? p.nationality : '',
  }
}

function toEventProps(node: Node): EpsteinEvent {
  const p = node.properties as Record<string, unknown>
  return {
    id: typeof p.id === 'string' ? p.id : '',
    title: typeof p.title === 'string' ? p.title : '',
    date: typeof p.date === 'string' ? p.date : '',
    event_type: typeof p.event_type === 'string' ? p.event_type : 'legal',
    description: typeof p.description === 'string' ? p.description : '',
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
 * Matches all nodes with `caso_slug` matching the given slug,
 * then collects all relationships between them.
 */
export async function getInvestigationGraph(casoSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       WITH collect(n) AS nodes
       UNWIND nodes AS a
       UNWIND nodes AS b
       WITH nodes, a, b
       WHERE elementId(a) < elementId(b)
       OPTIONAL MATCH (a)-[r]-(b)
       WITH nodes, collect(DISTINCT r) AS rels
       RETURN nodes, rels`,
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
// 2. Timeline
// ---------------------------------------------------------------------------

/**
 * Fetch all Event nodes for the investigation, ordered by date ascending.
 */
export async function getTimeline(casoSlug: string): Promise<EpsteinEvent[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:Event)
       WHERE e.caso_slug = $casoSlug
       RETURN e
       ORDER BY e.date ASC`,
      { casoSlug },
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
      `MATCH (p:Person {slug: $slug})
       RETURN p
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) {
      return null
    }

    const personNode = personResult.records[0].get('p') as Node
    const person = toPersonProps(personNode)

    // Fetch neighbors and relationships
    const neighborResult = await session.run(
      `MATCH (p:Person {slug: $slug})-[r]-(neighbor)
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
export async function getActors(casoSlug: string): Promise<EpsteinPerson[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE p.caso_slug = $casoSlug
       RETURN p
       ORDER BY p.name ASC`,
      { casoSlug },
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
 * Fetch all Document nodes in the investigation.
 */
export async function getDocuments(casoSlug: string): Promise<EpsteinDocument[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document)
       WHERE d.caso_slug = $casoSlug
       RETURN d
       ORDER BY d.title ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => toDocumentProps(record.get('d') as Node))
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
