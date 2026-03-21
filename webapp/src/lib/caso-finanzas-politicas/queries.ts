/**
 * Caso Finanzas Politicas Cypher queries — graph, timeline, actor,
 * document, and money flow queries.
 *
 * All queries use parameterized Cypher via getDriver from lib/neo4j/client.
 * Never interpolate user input into the cypher string.
 *
 * Generic labels (Person, Event, Document, etc.) with caso_slug namespace
 * isolation — same pattern as caso-libra/queries.ts.
 */

import { type Record as Neo4jRecord, type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData } from '../neo4j/types'
import { transformNode, transformRelationship } from '../graph/transform'

import type { TimelineItem, FinPolStats, EventType } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}

// ---------------------------------------------------------------------------
// Full investigation graph
// ---------------------------------------------------------------------------

/**
 * Fetch the full knowledge graph for the finanzas-politicas investigation.
 * Returns all nodes (Person, Event, Document, Organization, MoneyFlow)
 * and all relationships between them, filtered by caso_slug.
 *
 * Uses the two-pass pattern to avoid O(n^2) cartesian products.
 */
export async function getInvestigationGraph(casoSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Pass 1: all nodes in this investigation
    const nodeResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
         AND (n:Person OR n:Event OR n:Document
              OR n:Organization OR n:MoneyFlow)
       RETURN collect(n) AS allNodes`,
      { casoSlug },
      TX_CONFIG,
    )

    if (nodeResult.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const rawNodes = nodeResult.records[0].get('allNodes') as Node[]
    if (rawNodes.length === 0) {
      return { nodes: [], links: [] }
    }

    const nodeMap = new Map<string, ReturnType<typeof transformNode>>()
    const elementIdToAppId = new Map<string, string>()

    for (const node of rawNodes) {
      const graphNode = transformNode(node)
      nodeMap.set(graphNode.id, graphNode)
      elementIdToAppId.set(node.elementId, graphNode.id)
    }

    // Pass 2: relationships between matching nodes
    const relResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
       RETURN collect(r) AS allRels`,
      { casoSlug },
      TX_CONFIG,
    )

    const rawRels = (
      relResult.records.length > 0
        ? (relResult.records[0].get('allRels') as (Relationship | null)[])
        : []
    ).filter((r): r is Relationship => r !== null)

    const seenRelIds = new Set<string>()
    const links = rawRels
      .filter((rel) => {
        if (seenRelIds.has(rel.elementId)) return false
        seenRelIds.add(rel.elementId)
        return (
          elementIdToAppId.has(rel.startNodeElementId) &&
          elementIdToAppId.has(rel.endNodeElementId)
        )
      })
      .map((rel) => {
        const sourceId = elementIdToAppId.get(rel.startNodeElementId) ?? ''
        const targetId = elementIdToAppId.get(rel.endNodeElementId) ?? ''
        return transformRelationship(rel, sourceId, targetId)
      })
      .filter((link) => link.source && link.target)

    return {
      nodes: [...nodeMap.values()],
      links,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

/**
 * Fetch events ordered by date, with linked actors.
 */
export async function getTimeline(casoSlug: string): Promise<readonly TimelineItem[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:Event {caso_slug: $casoSlug})
       OPTIONAL MATCH (p:Person {caso_slug: $casoSlug})-[:PARTICIPATED_IN]->(e)
       WITH e, collect({ id: p.id, name: p.name }) AS actors
       RETURN e, actors
       ORDER BY e.date ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('e') as Node
      const props = node.properties
      const actors = (record.get('actors') as readonly { id: unknown; name: unknown }[])
        .filter((a) => typeof a.id === 'string')
        .map((a) => ({ id: asString(a.id), name: asString(a.name) }))

      return {
        id: asString(props.id),
        title: asString(props.title_es),
        description: asString(props.description_es),
        date: asString(props.date),
        event_type: asString(props.category) as EventType,
        source_url: Array.isArray(props.sources) && props.sources.length > 0
          ? asString(props.sources[0])
          : null,
        actors,
      }
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Person queries
// ---------------------------------------------------------------------------

/**
 * Fetch a person by slug with their connections subgraph.
 */
export async function getPersonBySlug(casoSlug: string, slug: string): Promise<{
  readonly person: Record<string, unknown>
  readonly graph: GraphData
  readonly events: readonly TimelineItem[]
  readonly documents: readonly {
    readonly id: string
    readonly title: string
    readonly slug: string
  }[]
} | null> {
  const session = getDriver().session()

  try {
    const personResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })
       RETURN p`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) return null

    const personNode = personResult.records[0].get('p') as Node
    const personGraphNode = transformNode(personNode)

    const connectionsResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[r]-(neighbor)
       WHERE neighbor.caso_slug = $casoSlug
       RETURN neighbor, r
       LIMIT 100`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    const nodeMap = new Map<string, ReturnType<typeof transformNode>>()
    const elementIdToAppId = new Map<string, string>()
    nodeMap.set(personGraphNode.id, personGraphNode)
    elementIdToAppId.set(personNode.elementId, personGraphNode.id)

    const links = connectionsResult.records
      .map((record: Neo4jRecord) => {
        const neighbor = record.get('neighbor') as Node
        const rel = record.get('r') as Relationship
        const neighborNode = transformNode(neighbor)
        nodeMap.set(neighborNode.id, neighborNode)
        elementIdToAppId.set(neighbor.elementId, neighborNode.id)

        const sourceId = elementIdToAppId.get(rel.startNodeElementId) ?? ''
        const targetId = elementIdToAppId.get(rel.endNodeElementId) ?? ''
        return transformRelationship(rel, sourceId, targetId)
      })
      .filter((link) => link.source && link.target)

    const eventsResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[:PARTICIPATED_IN]->(e:Event {caso_slug: $casoSlug})
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    const events: TimelineItem[] = eventsResult.records.map((record: Neo4jRecord) => {
      const eNode = record.get('e') as Node
      const props = eNode.properties
      return {
        id: asString(props.id),
        title: asString(props.title_es),
        description: asString(props.description_es),
        date: asString(props.date),
        event_type: asString(props.category) as EventType,
        source_url: Array.isArray(props.sources) && props.sources.length > 0
          ? asString(props.sources[0])
          : null,
        actors: [],
      }
    })

    const docsResult = await session.run(
      `MATCH (d:Document {caso_slug: $casoSlug})-[:MENTIONS]->(p:Person { slug: $slug, caso_slug: $casoSlug })
       RETURN d.id AS id, d.title AS title, d.slug AS slug`,
      { slug, casoSlug },
      TX_CONFIG,
    )

    const documents = docsResult.records.map((record: Neo4jRecord) => ({
      id: asString(record.get('id')),
      title: asString(record.get('title')),
      slug: asString(record.get('slug')),
    }))

    return {
      person: personGraphNode.properties,
      graph: { nodes: [...nodeMap.values()], links },
      events,
      documents,
    }
  } finally {
    await session.close()
  }
}

/**
 * Fetch all actors in the investigation.
 */
export async function getActors(casoSlug: string): Promise<readonly Record<string, unknown>[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person {caso_slug: $casoSlug})
       RETURN p
       ORDER BY p.name ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('p') as Node
      const props: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(node.properties)) {
        props[key] = value
      }
      return props
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Document queries
// ---------------------------------------------------------------------------

/**
 * Fetch all documents in the investigation.
 */
export async function getDocuments(casoSlug: string): Promise<readonly Record<string, unknown>[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document {caso_slug: $casoSlug})
       RETURN d
       ORDER BY d.date_published DESC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('d') as Node
      const props: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(node.properties)) {
        props[key] = value
      }
      return props
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Money flow queries
// ---------------------------------------------------------------------------

/**
 * Fetch all money flow nodes with their from/to relationships.
 */
export async function getMoneyFlows(casoSlug: string): Promise<readonly Record<string, unknown>[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (mf:MoneyFlow {caso_slug: $casoSlug})
       RETURN mf
       ORDER BY mf.date DESC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('mf') as Node
      const props: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(node.properties)) {
        props[key] = value
      }
      return props
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate stats for the investigation landing page.
 * The hardcoded display strings are caso-finanzas-politicas-specific.
 */
export async function getStats(casoSlug: string): Promise<FinPolStats> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person {caso_slug: $casoSlug}) WITH count(p) AS actorCount
       MATCH (e:Event {caso_slug: $casoSlug}) WITH actorCount, count(e) AS eventCount
       MATCH (d:Document {caso_slug: $casoSlug}) WITH actorCount, eventCount, count(d) AS documentCount
       RETURN actorCount, eventCount, documentCount`,
      { casoSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return {
        crossDatasetMatches: '10,150+',
        politiciansMultiDataset: '847',
        totalGraphNodes: '50,000+',
        actorCount: 0,
        eventCount: 0,
        documentCount: 0,
      }
    }

    const record = result.records[0]
    return {
      crossDatasetMatches: '10,150+',
      politiciansMultiDataset: '847',
      totalGraphNodes: '50,000+',
      actorCount: asNumber(record.get('actorCount')),
      eventCount: asNumber(record.get('eventCount')),
      documentCount: asNumber(record.get('documentCount')),
    }
  } finally {
    await session.close()
  }
}
