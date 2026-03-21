/**
 * Caso Libra query functions.
 *
 * Delegates generic queries (graph, timeline, stats, nodes-by-type) to the
 * shared investigation query builder. Domain-specific queries for wallet
 * flows and detailed person/document lookups are implemented here with
 * generic labels + caso_slug filtering.
 *
 * All queries use parameterized Cypher — no string interpolation.
 */

import { type Node, type Record as Neo4jRecord, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import { getQueryBuilder } from '../investigations/query-builder'
import type {
  GraphData,
  InvestigationNode,
  InvestigationStats,
} from '../investigations/types'

import type { CasoLibraStats, EventType, TimelineItem } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_LIBRA_SLUG = 'caso-libra'

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

// ---------------------------------------------------------------------------
// Delegated to query builder (generic operations)
// ---------------------------------------------------------------------------

const qb = getQueryBuilder()

export function getInvestigationGraph(): Promise<GraphData> {
  return qb.getGraph(CASO_LIBRA_SLUG)
}

export async function getTimeline(): Promise<readonly TimelineItem[]> {
  const items = await qb.getTimeline(CASO_LIBRA_SLUG)
  return items.map((item) => ({
    id: typeof item.id === 'string' ? item.id : '',
    title: typeof item.title === 'string' ? item.title : '',
    description: typeof item.description === 'string' ? item.description : '',
    date: item.date,
    event_type: (item.category ?? 'political') as EventType,
    source_url: item.source_url ?? null,
    actors: item.actors ?? [],
  }))
}

export async function getActors(): Promise<readonly Record<string, unknown>[]> {
  const nodes = await qb.getNodesByType(CASO_LIBRA_SLUG, 'Person')
  return nodes.map((n) => n.properties)
}

export async function getDocuments(): Promise<readonly Record<string, unknown>[]> {
  const nodes = await qb.getNodesByType(CASO_LIBRA_SLUG, 'Document')
  return nodes.map((n) => n.properties)
}

// ---------------------------------------------------------------------------
// Stats (delegates counts, adds domain-specific fields)
// ---------------------------------------------------------------------------

export async function getStats(): Promise<CasoLibraStats> {
  const baseStats: InvestigationStats = await qb.getStats(CASO_LIBRA_SLUG)

  return {
    totalLossUsd: '$251M+',
    affectedWallets: '114,000+',
    priceDrop: '94%',
    actorCount: baseStats.nodeCountsByType['Person'] ?? 0,
    eventCount: baseStats.nodeCountsByType['Event'] ?? 0,
    documentCount: baseStats.nodeCountsByType['Document'] ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Person detail (domain-specific — complex return shape)
// ---------------------------------------------------------------------------

/**
 * Fetch a person by slug with their connections subgraph.
 */
export async function getPersonBySlug(slug: string): Promise<{
  readonly person: Record<string, unknown>
  readonly graph: GraphData
  readonly events: readonly {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly date: string
    readonly event_type: EventType
    readonly source_url: string | null
    readonly actors: readonly { readonly id: string; readonly name: string }[]
  }[]
  readonly documents: readonly {
    readonly id: string
    readonly title: string
    readonly slug: string
  }[]
} | null> {
  // Look up the person via query builder
  const personNode = await qb.getNodeBySlug(CASO_LIBRA_SLUG, 'Person', slug)
  if (!personNode) return null

  // Get connections subgraph
  const graph = await qb.getNodeConnections(CASO_LIBRA_SLUG, personNode.id)

  // Fetch events this person participated in
  const session = getDriver().session()
  try {
    const eventsResult = await session.run(
      `MATCH (p:Person { slug: $slug, caso_slug: $casoSlug })-[:PARTICIPATED_IN]->(e:Event)
       WHERE e.caso_slug = $casoSlug
       RETURN e
       ORDER BY e.date ASC`,
      { slug, casoSlug: CASO_LIBRA_SLUG },
      TX_CONFIG,
    )

    const events = eventsResult.records.map((record: Neo4jRecord) => {
      const eNode = record.get('e') as Node
      const props = eNode.properties
      return {
        id: asString(props.id),
        title: asString(props.title),
        description: asString(props.description),
        date: asString(props.date),
        event_type: asString(props.event_type) as EventType,
        source_url: props.source_url ? asString(props.source_url) : null,
        actors: [] as { id: string; name: string }[],
      }
    })

    // Fetch related documents
    const docsResult = await session.run(
      `MATCH (d:Document)-[:MENTIONS]->(p:Person { slug: $slug, caso_slug: $casoSlug })
       WHERE d.caso_slug = $casoSlug
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
      person: personNode.properties,
      graph,
      events,
      documents,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Document detail (domain-specific — mentions subquery)
// ---------------------------------------------------------------------------

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
       RETURN d, collect({
         id: entity.id,
         name: COALESCE(entity.name, entity.symbol, entity.address),
         type: labels(entity)[0]
       }) AS entities`,
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
// Wallet flow subgraph (domain-specific — crypto wallet queries)
// ---------------------------------------------------------------------------

/**
 * Fetch wallet-only subgraph: wallets and SENT relationships with tx data.
 */
export async function getWalletFlows(): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Pass 1: wallet nodes
    const nodeResult = await session.run(
      `MATCH (w:Wallet)
       WHERE w.caso_slug = $casoSlug
       RETURN w`,
      { casoSlug: CASO_LIBRA_SLUG },
      TX_CONFIG,
    )

    if (nodeResult.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const wallets = nodeResult.records.map((r: Neo4jRecord) => r.get('w') as Node)

    // Pass 2: SENT relationships between wallets
    const relResult = await session.run(
      `MATCH (w1:Wallet)-[r:SENT]->(w2:Wallet)
       WHERE w1.caso_slug = $casoSlug AND w2.caso_slug = $casoSlug
       RETURN r`,
      { casoSlug: CASO_LIBRA_SLUG },
      TX_CONFIG,
    )

    const elementIdToId = new Map<string, string>()
    const nodes: InvestigationNode[] = wallets.map((w) => {
      const props: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(w.properties)) {
        props[key] = value
      }
      const id = typeof props.id === 'string' ? props.id : w.elementId
      elementIdToId.set(w.elementId, id)
      return {
        id,
        label: w.labels[0] ?? 'Wallet',
        caso_slug: CASO_LIBRA_SLUG,
        properties: props,
        name: typeof props.name === 'string' ? props.name : undefined,
        slug: typeof props.slug === 'string' ? props.slug : undefined,
      }
    })

    const links = relResult.records
      .map((r: Neo4jRecord) => {
        const rel = r.get('r') as Relationship
        const sourceId = elementIdToId.get(rel.startNodeElementId) ?? ''
        const targetId = elementIdToId.get(rel.endNodeElementId) ?? ''
        if (!sourceId || !targetId) return null

        const relProps: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(rel.properties)) {
          relProps[key] = value
        }

        return {
          id: rel.elementId,
          type: rel.type,
          source: sourceId,
          target: targetId,
          properties: relProps,
        }
      })
      .filter((link): link is NonNullable<typeof link> => link !== null)

    return { nodes, links }
  } finally {
    await session.close()
  }
}
