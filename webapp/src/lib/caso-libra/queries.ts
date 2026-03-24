/**
 * Caso Libra Cypher queries — graph, timeline, actor, and document queries.
 *
 * All queries use parameterized Cypher via readQuery from lib/neo4j/client.
 * Never interpolate user input into the cypher string.
 */

import { type Record as Neo4jRecord, type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData } from '../neo4j/types'
import { transformNode, transformRelationship } from '../graph/transform'

import type { TimelineItem, CasoLibraStats, EventType } from './types'

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
 * Fetch the full knowledge graph for the Caso Libra investigation.
 * Returns all nodes (Person, Event, Document, WalletAddress, Organization, Token)
 * and all relationships between them.
 */
export async function getInvestigationGraph(): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (n)
       WHERE n:CasoLibraPerson OR n:CasoLibraEvent OR n:CasoLibraDocument
          OR n:CasoLibraWallet OR n:CasoLibraOrganization OR n:CasoLibraToken
       WITH collect(n) AS nodes
       UNWIND nodes AS a
       OPTIONAL MATCH (a)-[r]-(b)
       WHERE b IN nodes
       RETURN collect(DISTINCT a) AS allNodes,
              collect(DISTINCT r) AS allRels`,
      {},
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const record = result.records[0]
    const rawNodes = record.get('allNodes') as Node[]
    const rawRels = (record.get('allRels') as (Relationship | null)[]).filter(
      (r): r is Relationship => r !== null,
    )

    const nodeMap = new Map<string, ReturnType<typeof transformNode>>()
    const elementIdToAppId = new Map<string, string>()

    for (const node of rawNodes) {
      const graphNode = transformNode(node)
      nodeMap.set(graphNode.id, graphNode)
      elementIdToAppId.set(node.elementId, graphNode.id)
    }

    const seenRelIds = new Set<string>()
    const links = rawRels
      .filter((rel) => {
        if (seenRelIds.has(rel.elementId)) return false
        seenRelIds.add(rel.elementId)
        return true
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
// Wallet flow subgraph
// ---------------------------------------------------------------------------

/**
 * Fetch wallet-only subgraph: wallets and SENT relationships with tx data.
 */
export async function getWalletFlows(): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (w1:CasoLibraWallet)-[r:SENT]->(w2:CasoLibraWallet)
       RETURN collect(DISTINCT w1) + collect(DISTINCT w2) AS wallets,
              collect(r) AS txs`,
      {},
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
// Timeline
// ---------------------------------------------------------------------------

/**
 * Fetch events ordered by date, with linked actors.
 */
export async function getTimeline(): Promise<readonly TimelineItem[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:CasoLibraEvent)
       OPTIONAL MATCH (p:CasoLibraPerson)-[:PARTICIPATED_IN]->(e)
       WITH e, collect({ id: p.id, name: p.name }) AS actors
       RETURN e, actors
       ORDER BY e.date ASC`,
      {},
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
    // Fetch the person node
    const personResult = await session.run(
      `MATCH (p:CasoLibraPerson { slug: $slug })
       RETURN p`,
      { slug },
      TX_CONFIG,
    )

    if (personResult.records.length === 0) return null

    const personNode = personResult.records[0].get('p') as Node
    const personGraphNode = transformNode(personNode)

    // Fetch 1-hop connections
    const connectionsResult = await session.run(
      `MATCH (p:CasoLibraPerson { slug: $slug })-[r]-(neighbor)
       RETURN neighbor, r
       LIMIT 100`,
      { slug },
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

    // Fetch cross-links between neighbors (makes the graph richer than a star)
    if (nodeMap.size > 1) {
      const neighborIds = [...nodeMap.keys()].filter((id) => id !== personGraphNode.id)
      const crossResult = await session.run(
        `MATCH (a)-[r]-(b)
         WHERE a.id IN $ids AND b.id IN $ids AND a.id < b.id
         RETURN a, b, r
         LIMIT 200`,
        { ids: neighborIds },
        TX_CONFIG,
      )
      for (const record of crossResult.records) {
        const a = record.get('a') as Node
        const b = record.get('b') as Node
        const rel = record.get('r') as Relationship
        const aNode = transformNode(a)
        const bNode = transformNode(b)
        elementIdToAppId.set(a.elementId, aNode.id)
        elementIdToAppId.set(b.elementId, bNode.id)
        const sourceId = elementIdToAppId.get(rel.startNodeElementId) ?? ''
        const targetId = elementIdToAppId.get(rel.endNodeElementId) ?? ''
        const link = transformRelationship(rel, sourceId, targetId)
        if (link.source && link.target) links.push(link)
      }
    }

    // Fetch events
    const eventsResult = await session.run(
      `MATCH (p:CasoLibraPerson { slug: $slug })-[:PARTICIPATED_IN]->(e:CasoLibraEvent)
       RETURN e
       ORDER BY e.date ASC`,
      { slug },
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
      `MATCH (d:CasoLibraDocument)-[:MENTIONS]->(p:CasoLibraPerson { slug: $slug })
       RETURN d.id AS id, d.title AS title, d.slug AS slug`,
      { slug },
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
      `MATCH (p:CasoLibraPerson)
       RETURN p
       ORDER BY p.name ASC`,
      {},
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
      `MATCH (d:CasoLibraDocument)
       RETURN d
       ORDER BY d.date_published DESC`,
      {},
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
      `MATCH (d:CasoLibraDocument { slug: $slug })
       OPTIONAL MATCH (d)-[:MENTIONS]->(entity)
       RETURN d, collect({ id: entity.id, name: COALESCE(entity.name, entity.symbol, entity.address), type: labels(entity)[0] }) AS entities`,
      { slug },
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
// Stats
// ---------------------------------------------------------------------------

/**
 * Fetch aggregate stats for the investigation landing page.
 */
export async function getStats(): Promise<CasoLibraStats> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:CasoLibraPerson) WITH count(p) AS actorCount
       MATCH (e:CasoLibraEvent) WITH actorCount, count(e) AS eventCount
       MATCH (d:CasoLibraDocument) WITH actorCount, eventCount, count(d) AS documentCount
       RETURN actorCount, eventCount, documentCount`,
      {},
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
