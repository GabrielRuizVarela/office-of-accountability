/**
 * Caso Libra Cypher queries — graph, timeline, actor, and document queries.
 *
 * Generic queries delegate to the shared query builder.
 * Domain-specific queries use parameterized Cypher with caso_slug namespace.
 * Never interpolate user input into the cypher string.
 */

import { type Record as Neo4jRecord, type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import { getQueryBuilder } from '../investigations/query-builder'
import type { GraphData } from '../investigations/types'
import { transformNode, transformRelationship } from '../graph/transform'

import type { TimelineItem, CasoLibraStats, EventType } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-libra'
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
// Full investigation graph (delegated to query builder)
// ---------------------------------------------------------------------------

/**
 * Fetch the full knowledge graph for the Caso Libra investigation.
 * Returns all nodes and relationships namespaced by caso_slug.
 */
export async function getInvestigationGraph(): Promise<GraphData> {
  return getQueryBuilder().getGraph(CASO_SLUG)
}

// ---------------------------------------------------------------------------
// Wallet flow subgraph
// ---------------------------------------------------------------------------

/**
 * Fetch wallet-only subgraph: wallets and SENT relationships with tx data.
 */
export async function getWalletFlows(): Promise<{
  readonly nodes: readonly ReturnType<typeof transformNode>[]
  readonly links: readonly ReturnType<typeof transformRelationship>[]
}> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (w1:Wallet)-[r:SENT]->(w2:Wallet)
       WHERE w1.caso_slug = $casoSlug AND w2.caso_slug = $casoSlug
       RETURN collect(DISTINCT w1) + collect(DISTINCT w2) AS wallets,
              collect(r) AS txs`,
      { casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const record = result.records[0]
    const rawWallets = record.get('wallets') as Node[]
    const rawTxs = record.get('txs') as Relationship[]

    const nodeMap = new Map<string, ReturnType<typeof transformNode>>()
    const elementIdToAppId = new Map<string, string>()

    for (const wallet of rawWallets) {
      const graphNode = transformNode(wallet)
      nodeMap.set(graphNode.id, graphNode)
      elementIdToAppId.set(wallet.elementId, graphNode.id)
    }

    const links = rawTxs
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
// Timeline (raw Cypher — CasoLibra TimelineItem has event_type, not category)
// ---------------------------------------------------------------------------

/**
 * Fetch events ordered by date, with linked actors.
 */
export async function getTimeline(): Promise<readonly TimelineItem[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:Event)
       WHERE e.caso_slug = $casoSlug
       OPTIONAL MATCH (p:Person)-[:PARTICIPATED_IN]->(e)
       WHERE p.caso_slug = $casoSlug
       WITH e, collect({ id: p.id, name: p.name }) AS actors
       RETURN e, actors
       ORDER BY e.date ASC`,
      { casoSlug: CASO_SLUG },
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
        title: asString(props.title),
        description: asString(props.description),
        date: asString(props.date),
        event_type: asString(props.event_type) as EventType,
        source_url: props.source_url ? asString(props.source_url) : null,
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
export async function getPersonBySlug(slug: string): Promise<{
  readonly person: Record<string, unknown>
  readonly graph: {
    readonly nodes: readonly ReturnType<typeof transformNode>[]
    readonly links: readonly ReturnType<typeof transformRelationship>[]
  }
  readonly events: readonly TimelineItem[]
  readonly documents: readonly {
    readonly id: string
    readonly title: string
    readonly slug: string
  }[]
} | null> {
  const session = getDriver().session()

  try {
    // Fetch the person node
    const personResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })
       RETURN p`,
      { slug, casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) return null

    const personNode = personResult.records[0].get('p') as Node
    const personGraphNode = transformNode(personNode)

    // Fetch connections
    const connectionsResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[r]-(neighbor)
       WHERE neighbor.caso_slug = $casoSlug
       RETURN neighbor, r
       LIMIT 100`,
      { slug, casoSlug: CASO_SLUG },
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

    // Fetch events
    const eventsResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[:PARTICIPATED_IN]->(e:Event)
       WHERE e.caso_slug = $casoSlug
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    const events: TimelineItem[] = eventsResult.records.map((record: Neo4jRecord) => {
      const eNode = record.get('e') as Node
      const props = eNode.properties
      return {
        id: asString(props.id),
        title: asString(props.title),
        description: asString(props.description),
        date: asString(props.date),
        event_type: asString(props.event_type) as EventType,
        source_url: props.source_url ? asString(props.source_url) : null,
        actors: [],
      }
    })

    // Fetch related documents
    const docsResult = await session.run(
      `MATCH (d:Document)-[:MENTIONS]->(p:Person { slug: $slug, caso_slug: $casoSlug })
       WHERE d.caso_slug = $casoSlug
       RETURN d.id AS id, d.title AS title, d.slug AS slug`,
      { slug, casoSlug: CASO_SLUG },
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
export async function getActors(): Promise<readonly Record<string, unknown>[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE p.caso_slug = $casoSlug
       RETURN p
       ORDER BY p.name ASC`,
      { casoSlug: CASO_SLUG },
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
export async function getDocuments(): Promise<readonly Record<string, unknown>[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document)
       WHERE d.caso_slug = $casoSlug
       RETURN d
       ORDER BY d.date_published DESC`,
      { casoSlug: CASO_SLUG },
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

/**
 * Fetch a document by slug with connected entities.
 */
export async function getDocumentBySlug(slug: string): Promise<{
  readonly document: Record<string, unknown>
  readonly mentionedEntities: readonly {
    readonly id: string
    readonly name: string
    readonly type: string
  }[]
} | null> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (d:Document { slug: $slug, caso_slug: $casoSlug })
       OPTIONAL MATCH (d)-[:MENTIONS]->(entity)
       WHERE entity.caso_slug = $casoSlug
       RETURN d, collect({ id: entity.id, name: COALESCE(entity.name, entity.symbol, entity.address), type: labels(entity)[0] }) AS entities`,
      { slug, casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    if (result.records.length === 0) return null

    const record = result.records[0]
    const node = record.get('d') as Node
    const props: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(node.properties)) {
      props[key] = value
    }

    const entities = (
      record.get('entities') as readonly { id: unknown; name: unknown; type: unknown }[]
    )
      .filter((e) => typeof e.id === 'string')
      .map((e) => ({
        id: asString(e.id),
        name: asString(e.name),
        type: asString(e.type),
      }))

    return { document: props, mentionedEntities: entities }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Stats (raw Cypher — CasoLibraStats shape incompatible with InvestigationStats)
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate stats for the investigation landing page.
 */
export async function getStats(): Promise<CasoLibraStats> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE p.caso_slug = $casoSlug
       WITH count(p) AS actorCount
       MATCH (e:Event)
       WHERE e.caso_slug = $casoSlug
       WITH actorCount, count(e) AS eventCount
       MATCH (d:Document)
       WHERE d.caso_slug = $casoSlug
       WITH actorCount, eventCount, count(d) AS documentCount
       RETURN actorCount, eventCount, documentCount`,
      { casoSlug: CASO_SLUG },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return {
        totalLossUsd: '$251M+',
        affectedWallets: '114,000+',
        priceDrop: '94%',
        actorCount: 0,
        eventCount: 0,
        documentCount: 0,
      }
    }

    const record = result.records[0]
    return {
      totalLossUsd: '$251M+',
      affectedWallets: '114,000+',
      priceDrop: '94%',
      actorCount: asNumber(record.get('actorCount')),
      eventCount: asNumber(record.get('eventCount')),
      documentCount: asNumber(record.get('documentCount')),
    }
  } finally {
    await session.close()
  }
}
