/**
 * Graph data transform utilities.
 *
 * Converts Neo4j query result records into the { nodes, links } format
 * consumed by react-force-graph-2d. All functions are pure and immutable.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'
import type { Node, Relationship, Integer } from 'neo4j-driver-lite'

import type { GraphData, GraphLink, GraphNode } from '../neo4j/types'

// ---------------------------------------------------------------------------
// Neo4j value helpers
// ---------------------------------------------------------------------------

/** Safely convert a Neo4j Integer to a JS number */
function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as Integer).toNumber()
  }
  return 0
}

/** Convert a Neo4j node's elementId to a stable string ID */
function nodeId(node: Node): string {
  // Prefer the application-level `id` or `acta_id` property over elementId
  const props = node.properties
  if (typeof props.id === 'string') return props.id
  if (typeof props.slug === 'string') return props.slug
  if (typeof props.acta_id === 'string') return props.acta_id
  return node.elementId
}

// ---------------------------------------------------------------------------
// Node transform
// ---------------------------------------------------------------------------

/** Convert a Neo4j Node to a GraphNode for react-force-graph-2d */
export function transformNode(node: Node): GraphNode {
  const properties: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(node.properties)) {
    properties[key] = isInteger(value) ? toNumber(value) : value
  }

  return {
    id: nodeId(node),
    labels: [...node.labels],
    properties,
  }
}

/** Check if a value looks like a Neo4j Integer */
function isInteger(value: unknown): boolean {
  return value !== null && typeof value === 'object' && 'toNumber' in (value as object)
}

// ---------------------------------------------------------------------------
// Link transform
// ---------------------------------------------------------------------------

/** Convert a Neo4j Relationship to a GraphLink for react-force-graph-2d */
export function transformRelationship(
  rel: Relationship,
  startNodeId: string,
  endNodeId: string,
): GraphLink {
  const properties: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(rel.properties)) {
    properties[key] = isInteger(value) ? toNumber(value) : value
  }

  return {
    source: startNodeId,
    target: endNodeId,
    type: rel.type,
    properties,
  }
}

// ---------------------------------------------------------------------------
// Record → GraphData transforms
// ---------------------------------------------------------------------------

/**
 * Transform records that return (node)-[rel]->(neighbor) triples
 * into deduplicated GraphData.
 *
 * Expected Cypher RETURN columns: `node`, `rel`, `neighbor`
 */
export function transformNeighborRecords(
  centerNode: Node,
  records: readonly Neo4jRecord[],
): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const links: GraphLink[] = []

  // Always include the center node
  const center = transformNode(centerNode)
  nodeMap.set(center.id, center)

  for (const record of records) {
    const neighbor = record.get('neighbor') as Node
    const rel = record.get('rel') as Relationship

    const neighborGraphNode = transformNode(neighbor)
    nodeMap.set(neighborGraphNode.id, neighborGraphNode)

    // Determine direction: rel may go center→neighbor or neighbor→center
    const relStartElementId = rel.startNodeElementId
    const sourceId = relStartElementId === centerNode.elementId ? center.id : neighborGraphNode.id
    const targetId = relStartElementId === centerNode.elementId ? neighborGraphNode.id : center.id

    links.push(transformRelationship(rel, sourceId, targetId))
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  }
}

/**
 * Transform records from a path-based query that returns full paths.
 *
 * Expected Cypher RETURN columns: `n` (node), or `path` (full path)
 * Also handles simple node-only results (search results).
 */
export function transformNodeRecords(records: readonly Neo4jRecord[]): GraphData {
  const nodeMap = new Map<string, GraphNode>()

  for (const record of records) {
    const node = record.get('n') as Node
    const graphNode = transformNode(node)
    nodeMap.set(graphNode.id, graphNode)
  }

  return {
    nodes: [...nodeMap.values()],
    links: [],
  }
}

/**
 * Transform the result of a multi-hop expand query.
 *
 * Takes the center node, all discovered target nodes, and all relationships
 * along the paths. Builds an elementId → appId lookup to correctly resolve
 * relationship endpoints.
 */
export function transformExpandResult(
  centerNode: Node,
  targetNodes: readonly Node[],
  relationships: readonly Relationship[],
): GraphData {
  // Build elementId → app-level ID lookup for relationship resolution
  const elementIdToAppId = new Map<string, string>()
  const nodeMap = new Map<string, GraphNode>()

  // Always include the center node
  const center = transformNode(centerNode)
  nodeMap.set(center.id, center)
  elementIdToAppId.set(centerNode.elementId, center.id)

  // Add all target nodes
  for (const target of targetNodes) {
    const graphNode = transformNode(target)
    nodeMap.set(graphNode.id, graphNode)
    elementIdToAppId.set(target.elementId, graphNode.id)
  }

  // Transform relationships, resolving elementIds to app-level IDs
  const links: GraphLink[] = []
  const seenRelIds = new Set<string>()

  for (const rel of relationships) {
    if (seenRelIds.has(rel.elementId)) continue
    seenRelIds.add(rel.elementId)

    const sourceId = elementIdToAppId.get(rel.startNodeElementId)
    const targetId = elementIdToAppId.get(rel.endNodeElementId)

    // Skip relationships where either endpoint is not in our result set
    if (!sourceId || !targetId) continue

    links.push(transformRelationship(rel, sourceId, targetId))
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  }
}

/**
 * Merge multiple GraphData objects into one, deduplicating nodes by id.
 */
export function mergeGraphData(...graphs: readonly GraphData[]): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const allLinks: GraphLink[] = []

  for (const graph of graphs) {
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node)
    }
    allLinks.push(...graph.links)
  }

  return {
    nodes: [...nodeMap.values()],
    links: allLinks,
  }
}

/**
 * Create an empty GraphData object.
 */
export function emptyGraphData(): GraphData {
  return { nodes: [], links: [] }
}
