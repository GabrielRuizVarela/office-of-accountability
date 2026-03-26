/**
 * Schema-aware generic query builder for investigations.
 *
 * Generates Cypher queries dynamically using `caso_slug` namespace isolation.
 * All queries are parameterized - no user input is interpolated into Cypher.
 *
 * Two-pass pattern for graph queries avoids O(n²) cartesian products.
 */

import neo4j, { type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'

import type {
  GraphData,
  InvestigationConfig,
  InvestigationNode,
  InvestigationQueryBuilder,
  InvestigationRelationship,
  InvestigationSchema,
  InvestigationStats,
  NodeTypeDefinition,
  PaginationOpts,
  RelTypeDefinition,
  TimelineItem,
} from './types'
import {
  getInvestigationConfig,
  getInvestigationSchema,
  getNodeTypeDefinitions,
  getRelTypeDefinitions,
} from './config'
import { isValidCasoSlug } from './utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1000
const MAX_DEPTH = 3

// ---------------------------------------------------------------------------
// Neo4j Node → InvestigationNode
// ---------------------------------------------------------------------------

function toInvestigationNode(node: Node): InvestigationNode {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node.properties)) {
    props[key] = isNeo4jInteger(value) ? toNumber(value) : isNeo4jTemporal(value) ? temporalToString(value) : value
  }

  return {
    id: typeof props.id === 'string' ? props.id : node.elementId,
    label: node.labels[0] ?? 'Unknown',
    labels: [...node.labels],
    caso_slug: typeof props.caso_slug === 'string' ? props.caso_slug : '',
    properties: props,
    name: typeof props.name === 'string' ? props.name : undefined,
    slug: typeof props.slug === 'string' ? props.slug : undefined,
    description: typeof props.description === 'string' ? props.description : undefined,
  }
}

function isNeo4jInteger(value: unknown): boolean {
  return value !== null && typeof value === 'object' && 'toNumber' in (value as object)
}

function isNeo4jTemporal(value: unknown): boolean {
  return value !== null && typeof value === 'object' && 'year' in (value as object) && 'month' in (value as object) && 'day' in (value as object)
}

function temporalToString(value: unknown): string {
  const t = value as { year: { toNumber?: () => number }; month: { toNumber?: () => number }; day: { toNumber?: () => number } }
  const y = typeof t.year === 'object' && t.year?.toNumber ? t.year.toNumber() : t.year
  const m = typeof t.month === 'object' && t.month?.toNumber ? t.month.toNumber() : t.month
  const d = typeof t.day === 'object' && t.day?.toNumber ? t.day.toNumber() : t.day
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber()
  }
  return 0
}

// ---------------------------------------------------------------------------
// Neo4j Relationship → InvestigationRelationship
// ---------------------------------------------------------------------------

function toInvestigationRelationship(
  rel: Relationship,
  sourceId: string,
  targetId: string,
): InvestigationRelationship {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rel.properties)) {
    props[key] = isNeo4jInteger(value) ? toNumber(value) : value
  }

  return {
    id: rel.elementId,
    type: rel.type,
    source: sourceId,
    target: targetId,
    properties: props,
  }
}

// ---------------------------------------------------------------------------
// Internal: build GraphData from raw Neo4j nodes + rels
// ---------------------------------------------------------------------------

function buildGraphData(
  nodes: readonly Node[],
  rels: readonly Relationship[],
): GraphData {
  const elementIdToAppId = new Map<string, string>()
  const nodeMap = new Map<string, InvestigationNode>()

  for (const node of nodes) {
    const invNode = toInvestigationNode(node)
    nodeMap.set(invNode.id, invNode)
    elementIdToAppId.set(node.elementId, invNode.id)
  }

  const links: InvestigationRelationship[] = []
  const seenRelIds = new Set<string>()

  for (const rel of rels) {
    if (!rel) continue
    if (seenRelIds.has(rel.elementId)) continue
    seenRelIds.add(rel.elementId)

    const sourceId = elementIdToAppId.get(rel.startNodeElementId)
    const targetId = elementIdToAppId.get(rel.endNodeElementId)
    if (!sourceId || !targetId) continue

    links.push(toInvestigationRelationship(rel, sourceId, targetId))
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  }
}

// ---------------------------------------------------------------------------
// Clamp helpers
// ---------------------------------------------------------------------------

function clampLimit(opts?: PaginationOpts): number {
  const raw = opts?.limit ?? DEFAULT_LIMIT
  return Math.max(1, Math.min(raw, MAX_LIMIT))
}

function clampOffset(opts?: PaginationOpts): number {
  return Math.max(0, opts?.offset ?? 0)
}

// ---------------------------------------------------------------------------
// Query builder implementation
// ---------------------------------------------------------------------------

/**
 * Create a schema-aware query builder.
 *
 * All methods filter by `caso_slug` for namespace isolation.
 * Graph queries use the two-pass pattern (nodes first, then relationships)
 * to avoid O(n²) cartesian products on large subgraphs.
 */
export function createQueryBuilder(): InvestigationQueryBuilder {
  return {
    // ----- Full subgraph -----

    async getGraph(casoSlug: string): Promise<GraphData> {
      if (!isValidCasoSlug(casoSlug)) return { nodes: [], links: [] }

      const session = getDriver().session()
      try {
        // Count nodes first to decide strategy
        const countResult = await session.run(
          `MATCH (n) WHERE n.caso_slug = $casoSlug RETURN count(n) AS cnt`,
          { casoSlug },
          { timeout: 10_000 },
        )
        const totalNodes = countResult.records[0]?.get('cnt')
        const count = totalNodes && typeof totalNodes === 'object' && 'toNumber' in totalNodes
          ? (totalNodes as { toNumber(): number }).toNumber()
          : Number(totalNodes ?? 0)

        // For large graphs (>500 nodes), return only most-connected nodes
        const isLarge = count > 500
        const nodeQuery = isLarge
          ? `MATCH (n)
             WHERE n.caso_slug = $casoSlug
             WITH n
             OPTIONAL MATCH (n)-[r]-()
             WITH n, count(r) AS degree
             ORDER BY degree DESC
             LIMIT $graphLimit
             RETURN n`
          : `MATCH (n)
             WHERE n.caso_slug = $casoSlug
             RETURN n`

        // Pass 1: nodes
        const nodeResult = await session.run(
          nodeQuery,
          isLarge ? { casoSlug, graphLimit: neo4j.int(500) } : { casoSlug },
          { timeout: 30_000 },
        )

        if (nodeResult.records.length === 0) {
          return { nodes: [], links: [] }
        }

        const nodes = nodeResult.records.map((r) => r.get('n') as Node)
        const nodeElementIds = new Set(nodes.map((n) => n.elementId))

        // Pass 2: relationships between matching nodes
        const relResult = await session.run(
          `MATCH (a)-[r]->(b)
           WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
             AND elementId(a) IN $elementIds AND elementId(b) IN $elementIds
           RETURN r`,
          { casoSlug, elementIds: [...nodeElementIds] },
          { timeout: 30_000 },
        )

        const rels = relResult.records
          .map((r) => r.get('r') as Relationship)
          .filter(
            (r) =>
              nodeElementIds.has(r.startNodeElementId) &&
              nodeElementIds.has(r.endNodeElementId),
          )

        return buildGraphData(nodes, rels)
      } finally {
        await session.close()
      }
    },

    // ----- Nodes by type -----

    async getNodesByType(
      casoSlug: string,
      nodeType: string,
      opts?: PaginationOpts,
    ): Promise<InvestigationNode[]> {
      if (!isValidCasoSlug(casoSlug)) return []

      const limit = clampLimit(opts)
      const offset = clampOffset(opts)

      const session = getDriver().session()
      try {
        const result = await session.run(
          `MATCH (n:\`${sanitizeLabel(nodeType)}\`)
           WHERE n.caso_slug = $casoSlug
           RETURN n
           ORDER BY n.name ASC, n.id ASC
           SKIP $offset
           LIMIT $limit`,
          { casoSlug, offset: neo4j.int(offset), limit: neo4j.int(limit) },
          TX_CONFIG,
        )

        return result.records.map((r) => toInvestigationNode(r.get('n') as Node))
      } finally {
        await session.close()
      }
    },

    // ----- Single node by slug -----

    async getNodeBySlug(
      casoSlug: string,
      nodeType: string,
      slug: string,
    ): Promise<InvestigationNode | null> {
      if (!isValidCasoSlug(casoSlug)) return null

      const session = getDriver().session()
      try {
        const result = await session.run(
          `MATCH (n:\`${sanitizeLabel(nodeType)}\` {slug: $slug, caso_slug: $casoSlug})
           RETURN n
           LIMIT 1`,
          { slug, casoSlug },
          TX_CONFIG,
        )

        if (result.records.length === 0) return null
        return toInvestigationNode(result.records[0].get('n') as Node)
      } finally {
        await session.close()
      }
    },

    // ----- Node connections (1-hop neighborhood) -----

    async getNodeConnections(
      casoSlug: string,
      nodeId: string,
      depth?: number,
    ): Promise<GraphData> {
      if (!isValidCasoSlug(casoSlug)) return { nodes: [], links: [] }

      const clampedDepth = Math.max(1, Math.min(depth ?? 1, MAX_DEPTH))

      const session = getDriver().session()
      try {
        // Find the center node
        const centerResult = await session.run(
          `MATCH (n {id: $nodeId, caso_slug: $casoSlug})
           RETURN n
           LIMIT 1`,
          { nodeId, casoSlug },
          TX_CONFIG,
        )

        if (centerResult.records.length === 0) {
          return { nodes: [], links: [] }
        }

        const centerNode = centerResult.records[0].get('n') as Node

        // Variable-length path for neighbors within the investigation
        const neighborResult = await session.run(
          `MATCH (center {id: $nodeId, caso_slug: $casoSlug})-[r*1..${clampedDepth}]-(neighbor)
           WHERE neighbor.caso_slug = $casoSlug
           UNWIND r AS rel
           WITH collect(DISTINCT neighbor) AS neighbors, collect(DISTINCT rel) AS rels
           RETURN neighbors, rels`,
          { nodeId, casoSlug },
          TX_CONFIG,
        )

        if (neighborResult.records.length === 0) {
          return buildGraphData([centerNode], [])
        }

        const record = neighborResult.records[0]
        const neighbors = record.get('neighbors') as Node[]
        const rels = (record.get('rels') as (Relationship | null)[]).filter(
          (r): r is Relationship => r !== null,
        )

        return buildGraphData([centerNode, ...neighbors], rels)
      } finally {
        await session.close()
      }
    },

    // ----- Timeline -----

    async getTimeline(casoSlug: string): Promise<TimelineItem[]> {
      if (!isValidCasoSlug(casoSlug)) return []

      const session = getDriver().session()
      try {
        // Fetch Events ordered by date, with connected actors
        const result = await session.run(
          `MATCH (e:Event)
           WHERE e.caso_slug = $casoSlug AND e.date IS NOT NULL
           OPTIONAL MATCH (p:Person)-[]->(e)
           WHERE p.caso_slug = $casoSlug
           WITH e, collect(DISTINCT {id: p.id, name: p.name}) AS actors
           RETURN e, actors
           ORDER BY e.date ASC`,
          { casoSlug },
          TX_CONFIG,
        )

        return result.records.map((r) => {
          const props = (r.get('e') as Node).properties as Record<string, unknown>
          const actors = (r.get('actors') as Array<{ id: unknown; name: unknown }>)
            .filter((a) => a.id !== null && a.name !== null)
            .map((a) => ({
              id: String(a.id),
              name: String(a.name),
            }))

          const rawEventType = typeof props.event_type === 'string' ? props.event_type : undefined
          const validEventTypes = ['political', 'financial', 'legal', 'media', 'corporate'] as const
          type ValidEventType = (typeof validEventTypes)[number]
          const eventType: ValidEventType | undefined = (validEventTypes as readonly string[]).includes(rawEventType ?? '')
            ? (rawEventType as ValidEventType)
            : undefined

          return {
            id: typeof props.id === 'string' ? props.id : '',
            title: typeof props.title === 'string' ? props.title : (props.title as string),
            description: typeof props.description === 'string' ? props.description : '',
            date: typeof props.date === 'string' ? props.date : '',
            event_type: eventType,
            category: rawEventType,
            source_url: typeof props.source_url === 'string' ? props.source_url : undefined,
            actors: actors.length > 0 ? actors : undefined,
          } satisfies TimelineItem
        })
      } finally {
        await session.close()
      }
    },

    // ----- Stats -----

    async getStats(casoSlug: string): Promise<InvestigationStats> {
      if (!isValidCasoSlug(casoSlug)) {
        return { totalNodes: 0, totalRelationships: 0, nodeCountsByType: {} }
      }

      const session = getDriver().session()
      try {
        const result = await session.run(
          `MATCH (n)
           WHERE n.caso_slug = $casoSlug
           WITH labels(n) AS lbls, count(n) AS cnt
           RETURN lbls, cnt`,
          { casoSlug },
          TX_CONFIG,
        )

        const nodeCountsByType: Record<string, number> = {}
        let totalNodes = 0

        for (const record of result.records) {
          const labels = record.get('lbls') as string[]
          const count = toNumber(record.get('cnt'))
          const label = labels[0] ?? 'Unknown'
          nodeCountsByType[label] = (nodeCountsByType[label] ?? 0) + count
          totalNodes += count
        }

        // Count relationships
        const relResult = await session.run(
          `MATCH (a {caso_slug: $casoSlug})-[r]->(b {caso_slug: $casoSlug})
           RETURN count(r) AS total`,
          { casoSlug },
          TX_CONFIG,
        )

        const totalRelationships =
          relResult.records.length > 0
            ? toNumber(relResult.records[0].get('total'))
            : 0

        return { totalNodes, totalRelationships, nodeCountsByType }
      } finally {
        await session.close()
      }
    },

    // ----- Delegated to config.ts -----

    async getConfig(casoSlug: string): Promise<InvestigationConfig> {
      const config = await getInvestigationConfig(casoSlug)
      if (!config) {
        throw new Error(`Unknown investigation: ${casoSlug}`)
      }
      return config
    },

    async getSchema(casoSlug: string): Promise<InvestigationSchema> {
      const schema = await getInvestigationSchema(casoSlug)
      if (!schema) {
        throw new Error(`No schema found for investigation: ${casoSlug}`)
      }
      return schema
    },

    async getNodeTypes(casoSlug: string): Promise<NodeTypeDefinition[]> {
      return getNodeTypeDefinitions(casoSlug)
    },

    async getRelTypes(casoSlug: string): Promise<RelTypeDefinition[]> {
      return getRelTypeDefinitions(casoSlug)
    },
  }
}

// ---------------------------------------------------------------------------
// Label sanitization (Cypher injection prevention)
// ---------------------------------------------------------------------------

/**
 * Sanitize a Neo4j label name to prevent Cypher injection.
 * Only allows alphanumeric characters and underscores.
 * Backtick-escaping in the Cypher template handles the rest.
 */
function sanitizeLabel(label: string): string {
  const sanitized = label.replace(/[^a-zA-Z0-9_]/g, '')
  if (sanitized.length === 0) {
    throw new Error(`Invalid label: ${label}`)
  }
  return sanitized
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _queryBuilder: InvestigationQueryBuilder | null = null

/**
 * Get the singleton query builder instance.
 */
export function getQueryBuilder(): InvestigationQueryBuilder {
  if (!_queryBuilder) {
    _queryBuilder = createQueryBuilder()
  }
  return _queryBuilder
}
