/**
 * Caso Libra queries — delegates to generic InvestigationQueryBuilder.
 *
 * Standard queries (graph, timeline, stats, actors, documents) delegate
 * directly to the query builder. Case-specific queries (wallet flows,
 * person detail, document detail) use parameterized Cypher with generic
 * labels + caso_slug filtering.
 */

import { type Record as Neo4jRecord, type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import { transformNode, transformRelationship } from '../graph/transform'
import type { GraphData } from '../neo4j/types'
import { getQueryBuilder } from '../investigations/query-builder'
import type {
  GraphData as InvestigationGraphData,
  InvestigationStats,
} from '../investigations/types'

import type { TimelineItem, EventType } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_LIBRA_SLUG = 'caso-libra' as const
const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

// ---------------------------------------------------------------------------
// Query builder shorthand
// ---------------------------------------------------------------------------

const qb = () => getQueryBuilder()

// ---------------------------------------------------------------------------
// Full investigation graph (delegates to query builder)
// ---------------------------------------------------------------------------

export async function getInvestigationGraph(): Promise<InvestigationGraphData> {
  return qb().getGraph(CASO_LIBRA_SLUG)
}

// ---------------------------------------------------------------------------
// Wallet flow subgraph (case-specific — uses generic Wallet label + caso_slug)
// ---------------------------------------------------------------------------

/**
 * Fetch wallet-only subgraph: wallets and SENT relationships with tx data.
 */
export async function getWalletFlows(): Promise<GraphData> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (w1:Wallet {caso_slug: $casoSlug})-[r:SENT]->(w2:Wallet {caso_slug: $casoSlug})
       RETURN collect(DISTINCT w1) + collect(DISTINCT w2) AS wallets,
              collect(r) AS txs`,
      { casoSlug: CASO_LIBRA_SLUG },
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
// Timeline (delegates to query builder, maps to caso-libra TimelineItem shape)
// ---------------------------------------------------------------------------

export async function getTimeline(): Promise<readonly TimelineItem[]> {
  const items = await qb().getTimeline(CASO_LIBRA_SLUG)
  return items.map((item) => ({
    id: item.id,
    title: typeof item.title === 'string' ? item.title : item.title.es ?? item.title.en ?? '',
    description: typeof item.description === 'string' ? item.description : item.description.es ?? item.description.en ?? '',
    date: item.date,
    event_type: (item.category ?? '') as EventType,
    source_url: item.source_url ?? null,
    actors: item.actors ?? [],
  }))
}

// ---------------------------------------------------------------------------
// Person detail (case-specific — keeps backward-compat return shape)
// ---------------------------------------------------------------------------

/**
 * Fetch a person by slug with their connections subgraph.
 * Uses generic labels with caso_slug filtering.
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
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })
       RETURN p`,
      { slug, casoSlug: CASO_LIBRA_SLUG },
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
      { slug, casoSlug: CASO_LIBRA_SLUG },
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
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[:PARTICIPATED_IN]->(e:Event {caso_slug: $casoSlug})
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug: CASO_LIBRA_SLUG },
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
      `MATCH (d:Document {caso_slug: $casoSlug})-[:MENTIONS]->(p:Person { slug: $slug, caso_slug: $casoSlug })
       RETURN d.id AS id, d.title AS title, d.slug AS slug`,
      { slug, casoSlug: CASO_LIBRA_SLUG },
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

// ---------------------------------------------------------------------------
// Actors (delegates to query builder, maps to Record shape for backward compat)
// ---------------------------------------------------------------------------

export async function getActors(): Promise<readonly Record<string, unknown>[]> {
  const nodes = await qb().getNodesByType(CASO_LIBRA_SLUG, 'Person')
  return nodes.map((n) => n.properties)
}

// ---------------------------------------------------------------------------
// Documents (delegates to query builder, maps to Record shape for backward compat)
// ---------------------------------------------------------------------------

export async function getDocuments(): Promise<readonly Record<string, unknown>[]> {
  const nodes = await qb().getNodesByType(CASO_LIBRA_SLUG, 'Document')
  return nodes.map((n) => n.properties)
}

// ---------------------------------------------------------------------------
// Document detail (case-specific — keeps backward-compat return shape)
// ---------------------------------------------------------------------------

/**
 * Fetch a document by slug with connected entities.
 * Uses generic labels with caso_slug filtering.
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
       OPTIONAL MATCH (d)-[:MENTIONS]->(entity {caso_slug: $casoSlug})
       RETURN d, collect({ id: entity.id, name: COALESCE(entity.name, entity.symbol, entity.address), type: labels(entity)[0] }) AS entities`,
      { slug, casoSlug: CASO_LIBRA_SLUG },
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
// Stats (delegates to query builder)
// ---------------------------------------------------------------------------

export async function getStats(): Promise<InvestigationStats> {
  return qb().getStats(CASO_LIBRA_SLUG)
}
