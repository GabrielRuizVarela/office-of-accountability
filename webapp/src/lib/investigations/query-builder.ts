/**
 * Schema-aware generic query builder for investigations.
 *
 * Reads node/relationship type definitions from Neo4j and generates
 * Cypher dynamically. Uses the two-pass pattern for graph queries
 * to avoid O(n²) cartesian products on large graphs.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * LIMIT clauses use neo4j.int(n) since JS numbers are floats.
 */

import neo4j, {
  type Node,
  type Relationship,
  type Record as Neo4jRecord,
} from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData, GraphLink, GraphNode } from '../neo4j/types'
import { transformNode, transformRelationship } from '../graph/transform'

import type {
  InvestigationConfig,
  InvestigationNode,
  InvestigationSchema,
  InvestigationStats,
  NodeTypeDefinition,
  PaginationOpts,
  RelTypeDefinition,
  TimelineItem,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Transaction config applied to all queries */
const TX_CONFIG = { timeout: 15_000 }

/** Extended timeout for full graph queries */
const GRAPH_TX_CONFIG = { timeout: 30_000 }

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build GraphData from raw Neo4j nodes and relationships,
 * resolving elementIds to application-level IDs.
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

/** Safely extract a number from a Neo4j Integer or JS number */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber()
  }
  return 0
}

// ---------------------------------------------------------------------------
// Query builder
// ---------------------------------------------------------------------------

/**
 * Fetch the full subgraph for an investigation.
 *
 * Two-pass query: first collect matching nodes, then find relationships
 * between them. Avoids O(n²) cartesian product on large graphs.
 */
export async function getGraph(casoSlug: string): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Pass 1: collect all nodes for this investigation
    const nodeResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       RETURN n`,
      { casoSlug },
      GRAPH_TX_CONFIG,
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
       RETURN r`,
      { casoSlug },
      GRAPH_TX_CONFIG,
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

/**
 * Fetch nodes of a specific type within an investigation, with pagination.
 */
export async function getNodesByType(
  casoSlug: string,
  nodeType: string,
  opts: PaginationOpts = {},
): Promise<InvestigationNode[]> {
  const session = getDriver().session()
  const limit = opts.limit ?? 100
  const offset = opts.offset ?? 0
  const orderBy = opts.orderBy ?? 'name'
  const orderDir = opts.orderDir === 'DESC' ? 'DESC' : 'ASC'

  // Get the node type definition for color/icon
  const schemaDef = await getNodeTypeDefinition(session, casoSlug, nodeType)

  try {
    // nodeType is validated against the schema, not interpolated from user input.
    // It comes from NodeTypeDefinition nodes stored in Neo4j.
    const result = await session.run(
      `MATCH (n:\`${nodeType}\`)
       WHERE n.caso_slug = $casoSlug
       RETURN n
       ORDER BY n[\`${orderBy}\`] ${orderDir}
       SKIP $offset
       LIMIT $limit`,
      {
        casoSlug,
        offset: neo4j.int(offset),
        limit: neo4j.int(limit),
      },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('n') as Node
      const graphNode = transformNode(node)
      return {
        id: graphNode.id,
        label: nodeType,
        caso_slug: casoSlug,
        slug: typeof graphNode.properties.slug === 'string' ? graphNode.properties.slug : '',
        properties: graphNode.properties,
        color: schemaDef?.color ?? '#666666',
        icon: schemaDef?.icon ?? 'circle',
      }
    })
  } finally {
    await session.close()
  }
}

/**
 * Fetch a single node by its type and slug within an investigation.
 */
export async function getNodeBySlug(
  casoSlug: string,
  nodeType: string,
  slug: string,
): Promise<InvestigationNode | null> {
  const session = getDriver().session()

  try {
    const schemaDef = await getNodeTypeDefinition(session, casoSlug, nodeType)

    const result = await session.run(
      `MATCH (n:\`${nodeType}\` {slug: $slug})
       WHERE n.caso_slug = $casoSlug
       RETURN n
       LIMIT 1`,
      { casoSlug, slug },
      TX_CONFIG,
    )

    if (result.records.length === 0) return null

    const node = result.records[0].get('n') as Node
    const graphNode = transformNode(node)

    return {
      id: graphNode.id,
      label: nodeType,
      caso_slug: casoSlug,
      slug: typeof graphNode.properties.slug === 'string' ? graphNode.properties.slug : '',
      properties: graphNode.properties,
      color: schemaDef?.color ?? '#666666',
      icon: schemaDef?.icon ?? 'circle',
    }
  } finally {
    await session.close()
  }
}

/**
 * Fetch a node and its connections up to a given depth.
 */
export async function getNodeConnections(
  casoSlug: string,
  nodeId: string,
  depth: number = 1,
): Promise<GraphData> {
  const session = getDriver().session()

  try {
    // Find the center node
    const centerResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug AND (n.id = $nodeId OR n.slug = $nodeId)
       RETURN n
       LIMIT 1`,
      { casoSlug, nodeId },
      TX_CONFIG,
    )

    if (centerResult.records.length === 0) {
      return { nodes: [], links: [] }
    }

    const centerNode = centerResult.records[0].get('n') as Node

    // Fetch neighbors within depth
    const neighborResult = await session.run(
      `MATCH (center)
       WHERE center.caso_slug = $casoSlug AND (center.id = $nodeId OR center.slug = $nodeId)
       MATCH (center)-[r*1..${Math.min(depth, 3)}]-(neighbor)
       WHERE neighbor.caso_slug = $casoSlug
       UNWIND r AS rel
       WITH center, collect(DISTINCT neighbor) AS neighbors, collect(DISTINCT rel) AS rels
       RETURN center, neighbors, rels`,
      { casoSlug, nodeId },
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
}

/**
 * Fetch timeline events for an investigation, ordered by date.
 */
export async function getTimeline(casoSlug: string): Promise<TimelineItem[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (e:Event)
       WHERE e.caso_slug = $casoSlug
       OPTIONAL MATCH (e)-[:INVOLVES|PARTICIPATED_IN]-(p:Person)
       WHERE p.caso_slug = $casoSlug
       WITH e, collect(DISTINCT {id: coalesce(p.id, p.slug, ''), name: coalesce(p.name, '')}) AS actors
       RETURN e, actors
       ORDER BY e.date ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const node = record.get('e') as Node
      const p = node.properties as Record<string, unknown>
      const actors = record.get('actors') as Array<{ id: string; name: string }>

      return {
        id: typeof p.id === 'string' ? p.id : (typeof p.slug === 'string' ? p.slug : ''),
        title: typeof p.title === 'string' ? p.title : '',
        description: typeof p.description === 'string' ? p.description : '',
        date: typeof p.date === 'string' ? p.date : '',
        event_type: typeof p.event_type === 'string' ? p.event_type : '',
        source_url: typeof p.source_url === 'string' ? p.source_url : null,
        actors: actors.filter((a) => a.id !== '' || a.name !== ''),
      }
    })
  } finally {
    await session.close()
  }
}

/**
 * Fetch aggregate statistics for an investigation.
 */
export async function getStats(casoSlug: string): Promise<InvestigationStats> {
  const session = getDriver().session()

  try {
    // Get per-label counts
    const countResult = await session.run(
      `MATCH (n)
       WHERE n.caso_slug = $casoSlug
       UNWIND labels(n) AS label
       RETURN label, count(*) AS cnt`,
      { casoSlug },
      TX_CONFIG,
    )

    const nodeCounts: Record<string, number> = {}
    let nodeCount = 0

    for (const record of countResult.records) {
      const label = record.get('label') as string
      const cnt = toNumber(record.get('cnt'))
      nodeCounts[label] = cnt
      nodeCount += cnt
    }

    // Get relationship count
    const relResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
       RETURN count(r) AS relCount`,
      { casoSlug },
      TX_CONFIG,
    )

    const relationshipCount = relResult.records.length > 0
      ? toNumber(relResult.records[0].get('relCount'))
      : 0

    return { nodeCounts, relationshipCount, nodeCount }
  } finally {
    await session.close()
  }
}

/**
 * Fetch the InvestigationConfig node for a caso.
 */
export async function getConfig(casoSlug: string): Promise<InvestigationConfig> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (n:InvestigationConfig {caso_slug: $casoSlug})
       RETURN n
       LIMIT 1`,
      { casoSlug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return {
        id: casoSlug,
        name: casoSlug,
        description: '',
        caso_slug: casoSlug,
        status: 'draft',
        created_at: '',
        tags: [],
      }
    }

    const p = (result.records[0].get('n') as Node).properties as Record<string, unknown>
    return {
      id: typeof p.id === 'string' ? p.id : '',
      name: typeof p.name === 'string' ? p.name : '',
      description: typeof p.description === 'string' ? p.description : '',
      caso_slug: typeof p.caso_slug === 'string' ? p.caso_slug : '',
      status: typeof p.status === 'string' && ['active', 'draft', 'archived'].includes(p.status)
        ? (p.status as InvestigationConfig['status'])
        : 'draft',
      created_at: typeof p.created_at === 'string' ? p.created_at : '',
      tags: Array.isArray(p.tags)
        ? p.tags.filter((t: unknown): t is string => typeof t === 'string')
        : [],
    }
  } finally {
    await session.close()
  }
}

/**
 * Fetch the full schema (node types + relationship types) for an investigation.
 */
export async function getSchema(casoSlug: string): Promise<InvestigationSchema> {
  const [nodeTypes, relTypes] = await Promise.all([
    getNodeTypes(casoSlug),
    getRelTypes(casoSlug),
  ])

  return { nodeTypes, relTypes }
}

/**
 * Fetch node type definitions for an investigation.
 */
export async function getNodeTypes(casoSlug: string): Promise<NodeTypeDefinition[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (nt:NodeTypeDefinition)
       WHERE nt.caso_slug = $casoSlug
       RETURN nt
       ORDER BY nt.name ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const p = (record.get('nt') as Node).properties as Record<string, unknown>
      return {
        name: typeof p.name === 'string' ? p.name : '',
        properties_json: typeof p.properties_json === 'string' ? p.properties_json : '{}',
        color: typeof p.color === 'string' ? p.color : '#666666',
        icon: typeof p.icon === 'string' ? p.icon : 'circle',
      }
    })
  } finally {
    await session.close()
  }
}

/**
 * Fetch relationship type definitions for an investigation.
 */
export async function getRelTypes(casoSlug: string): Promise<RelTypeDefinition[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (rt:RelTypeDefinition)
       WHERE rt.caso_slug = $casoSlug
       RETURN rt
       ORDER BY rt.name ASC`,
      { casoSlug },
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord) => {
      const p = (record.get('rt') as Node).properties as Record<string, unknown>
      return {
        name: typeof p.name === 'string' ? p.name : '',
        from_types: Array.isArray(p.from_types)
          ? p.from_types.filter((t: unknown): t is string => typeof t === 'string')
          : [],
        to_types: Array.isArray(p.to_types)
          ? p.to_types.filter((t: unknown): t is string => typeof t === 'string')
          : [],
        properties_json: typeof p.properties_json === 'string' ? p.properties_json : '{}',
      }
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Internal: schema lookup helper
// ---------------------------------------------------------------------------

/**
 * Look up a single NodeTypeDefinition by name within a session.
 * Returns null if not found (caller should use fallback defaults).
 */
async function getNodeTypeDefinition(
  session: ReturnType<ReturnType<typeof getDriver>['session']>,
  casoSlug: string,
  nodeType: string,
): Promise<NodeTypeDefinition | null> {
  const result = await session.run(
    `MATCH (nt:NodeTypeDefinition {name: $nodeType})
     WHERE nt.caso_slug = $casoSlug
     RETURN nt
     LIMIT 1`,
    { casoSlug, nodeType },
    TX_CONFIG,
  )

  if (result.records.length === 0) return null

  const p = (result.records[0].get('nt') as Node).properties as Record<string, unknown>
  return {
    name: typeof p.name === 'string' ? p.name : '',
    properties_json: typeof p.properties_json === 'string' ? p.properties_json : '{}',
    color: typeof p.color === 'string' ? p.color : '#666666',
    icon: typeof p.icon === 'string' ? p.icon : 'circle',
  }
}
