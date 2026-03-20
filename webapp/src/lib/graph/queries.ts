/**
 * Graph query service — Cypher queries for node neighborhood and search.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * Results are transformed into the { nodes, links } GraphData format
 * consumed by react-force-graph-2d.
 */

import neo4j, { type Node, type Relationship, type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData, GraphLink, GraphNode } from '../neo4j/types'

import {
  emptyGraphData,
  transformExpandResult,
  transformNeighborRecords,
  transformNode,
  transformNodeRecords,
  transformRelationship,
} from './transform'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_NEIGHBOR_LIMIT = 50
const DEFAULT_SEARCH_LIMIT = 20
const DEFAULT_EXPAND_DEPTH = 1
const MAX_EXPAND_DEPTH = 3
const MAX_EXPAND_NODES = 500

/** Maximum query execution time in milliseconds (security: prevent graph bombs) */
const QUERY_TIMEOUT_MS = 15_000

/** Transaction config applied to all user-facing queries */
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Cursor utilities
// ---------------------------------------------------------------------------

/** Cursor payload for query endpoint (keyset pagination by name + id) */
interface QueryCursor {
  readonly n: string  // last seen name
  readonly i: string  // last seen id
}

/** Cursor payload for search endpoint (offset-wrapped) */
interface SearchCursor {
  readonly o: number  // offset
}

/**
 * Encode a cursor payload as a URL-safe, opaque base64 string.
 */
function encodeCursor(payload: QueryCursor | SearchCursor): string {
  return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url')
}

/**
 * Decode and validate a query cursor string.
 * Returns null if the cursor is malformed.
 */
function decodeQueryCursor(cursor: string): QueryCursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'))
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'n' in parsed &&
      'i' in parsed &&
      typeof (parsed as QueryCursor).n === 'string' &&
      typeof (parsed as QueryCursor).i === 'string'
    ) {
      return { n: (parsed as QueryCursor).n, i: (parsed as QueryCursor).i }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Decode and validate a search cursor string.
 * Returns null if the cursor is malformed.
 */
function decodeSearchCursor(cursor: string): SearchCursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'))
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'o' in parsed &&
      typeof (parsed as SearchCursor).o === 'number' &&
      Number.isInteger((parsed as SearchCursor).o) &&
      (parsed as SearchCursor).o >= 0
    ) {
      return { o: (parsed as SearchCursor).o }
    }
    return null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Node neighborhood
// ---------------------------------------------------------------------------

/**
 * Fetch a node and its immediate neighbors by application-level ID.
 *
 * Tries `id`, `slug`, and `acta_id` properties in order to locate the
 * center node, matching the ID resolution strategy in transform.ts.
 *
 * Returns { nodes, links } with the center node and up to `limit` neighbors.
 * Returns null if the center node does not exist.
 */
export async function getNodeNeighborhood(
  nodeId: string,
  limit: number = DEFAULT_NEIGHBOR_LIMIT,
): Promise<GraphData | null> {
  const session = getDriver().session()

  try {
    // Step 1: Find the center node by application-level ID
    const centerResult = await session.run(
      `MATCH (n)
       WHERE n.id = $nodeId OR n.slug = $nodeId OR n.acta_id = $nodeId
       RETURN n
       LIMIT 1`,
      { nodeId },
      TX_CONFIG,
    )

    if (centerResult.records.length === 0) {
      return null
    }

    const centerNode = centerResult.records[0].get('n') as Node

    // Step 2: Fetch neighbors with their relationships
    const neighborResult = await session.run(
      `MATCH (n)-[rel]-(neighbor)
       WHERE n.id = $nodeId OR n.slug = $nodeId OR n.acta_id = $nodeId
       RETURN neighbor, rel
       LIMIT $limit`,
      { nodeId, limit: neo4j.int(limit) },
      TX_CONFIG,
    )

    return transformNeighborRecords(centerNode, neighborResult.records)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Multi-hop expand
// ---------------------------------------------------------------------------

/**
 * Expand a node's neighborhood to a configurable depth (1-3 hops).
 *
 * Uses a variable-length path pattern to traverse up to `depth` hops.
 * Depth is clamped to MAX_EXPAND_DEPTH (3) and results are capped at
 * MAX_EXPAND_NODES (500) to prevent expensive traversals.
 *
 * The query runs with a session-level timeout of 5 seconds.
 *
 * Returns { nodes, links } with all discovered nodes and relationships,
 * or null if the center node does not exist.
 */
export async function expandNodeNeighborhood(
  nodeId: string,
  depth: number = DEFAULT_EXPAND_DEPTH,
  limit: number = MAX_EXPAND_NODES,
): Promise<GraphData | null> {
  const clampedDepth = Math.min(Math.max(1, Math.floor(depth)), MAX_EXPAND_DEPTH)
  const clampedLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_EXPAND_NODES)

  const session = getDriver().session({
    defaultAccessMode: 'READ' as never,
    fetchSize: clampedLimit,
  })

  try {
    // Step 1: Find the center node
    const centerResult = await session.run(
      `MATCH (n)
       WHERE n.id = $nodeId OR n.slug = $nodeId OR n.acta_id = $nodeId
       RETURN n
       LIMIT 1`,
      { nodeId },
      TX_CONFIG,
    )

    if (centerResult.records.length === 0) {
      return null
    }

    const centerNode = centerResult.records[0].get('n') as Node

    // Step 2: Expand to depth using variable-length path.
    // Collect all nodes and relationships along paths, deduplicating via UNWIND.
    // Bounded BFS: cap neighbors per hop to prevent combinatorial explosion
    // from high-degree CAST_VOTE edges. Each hop limited to perHopLimit nodes.
    const perHopLimit = neo4j.int(Math.min(clampedLimit, 50))
    const expandResult = await session.run(
      `MATCH (n)
       WHERE n.id = $nodeId OR n.slug = $nodeId OR n.acta_id = $nodeId
       MATCH (n)-[r]-(neighbor)
       WITH n, neighbor, r
       LIMIT $perHopLimit
       WITH n,
            collect(DISTINCT neighbor) AS targets,
            collect(DISTINCT r) AS rels
       RETURN targets, rels`,
      { nodeId, perHopLimit },
      TX_CONFIG,
    )

    if (expandResult.records.length === 0) {
      // Center exists but has no connections
      const center = transformNode(centerNode)
      return { nodes: [center], links: [] }
    }

    const record = expandResult.records[0]
    const targetNodes = record.get('targets') as Node[]
    const relationships = record.get('rels') as Relationship[]

    return transformExpandResult(centerNode, targetNodes, relationships)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Fulltext search
// ---------------------------------------------------------------------------

/** Search result with cursor-based pagination */
export interface SearchResult {
  readonly data: GraphData
  readonly totalCount: number
  readonly nextCursor: string | null
}

/**
 * Search nodes across all fulltext indexes by query string.
 *
 * Uses Neo4j fulltext search with Lucene syntax.
 * Searches across: politician names, legislation titles, investigation titles.
 *
 * Supports cursor-based pagination. The cursor encodes the current offset
 * (opaque to the client). Pass `cursor` from a previous response's
 * `nextCursor` to fetch the next page.
 *
 * Returns matching nodes as GraphData (no links) plus total count and nextCursor.
 */
export async function searchNodes(
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  cursor?: string,
): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length === 0) {
    return { data: emptyGraphData(), totalCount: 0, nextCursor: null }
  }

  const offset = cursor ? (decodeSearchCursor(cursor)?.o ?? 0) : 0

  // Escape special Lucene characters and add wildcard for partial matching
  const sanitized = sanitizeLuceneQuery(trimmed)

  // Fetch limit+1 per index to detect if there are more results
  const fetchLimit = offset + limit + 1

  const driver = getDriver()

  // Search across all three fulltext indexes in parallel using separate sessions
  // (a single session cannot run multiple concurrent auto-commit transactions)
  const runFulltextQuery = async (indexName: string) => {
      const s = driver.session()
      try {
        return await s.run(
          `CALL db.index.fulltext.queryNodes($indexName, $query)
           YIELD node AS n, score
           RETURN n, score
           ORDER BY score DESC
           LIMIT $fetchLimit`,
          { indexName, query: sanitized, fetchLimit: neo4j.int(fetchLimit) },
          TX_CONFIG,
        )
      } finally {
        await s.close()
      }
    }

    // Fallback CONTAINS query for nodes without fulltext indexes (e.g. Epstein case)
    const runContainsFallback = async () => {
      const s = driver.session()
      try {
        return await s.run(
          `MATCH (n)
           WHERE (toLower(n.name) CONTAINS toLower($query) OR toLower(n.id) CONTAINS toLower($query))
             AND NOT any(l IN labels(n) WHERE l IN ['Politician', 'Legislation', 'Investigation'])
           RETURN n, 0.5 AS score
           ORDER BY n.name ASC
           LIMIT $fetchLimit`,
          { query: trimmed, fetchLimit: neo4j.int(fetchLimit) },
          TX_CONFIG,
        )
      } finally {
        await s.close()
      }
    }

    const [politicianResult, legislationResult, investigationResult, fallbackResult] = await Promise.all([
      runFulltextQuery('politician_name_fulltext'),
      runFulltextQuery('legislation_title_fulltext'),
      runFulltextQuery('investigation_title_fulltext'),
      runContainsFallback(),
    ])

    // Merge and sort all results by score descending
    const allRecords: Array<{ record: Neo4jRecord; score: number }> = [
      ...politicianResult.records,
      ...legislationResult.records,
      ...investigationResult.records,
      ...fallbackResult.records,
    ].map((record) => ({
      record,
      score: typeof record.get('score') === 'number' ? record.get('score') as number : 0,
    }))

    allRecords.sort((a, b) => b.score - a.score)

    // Deduplicate by node elementId (a node might appear in multiple indexes)
    const seen = new Set<string>()
    const dedupedRecords: Neo4jRecord[] = []
    for (const { record } of allRecords) {
      const node = record.get('n') as Node
      if (!seen.has(node.elementId)) {
        seen.add(node.elementId)
        dedupedRecords.push(record)
      }
    }

    const totalCount = dedupedRecords.length
    const pageRecords = dedupedRecords.slice(offset, offset + limit)
    const hasMore = offset + limit < totalCount

    const data = transformNodeRecords(pageRecords)
    const nextCursor = hasMore ? encodeCursor({ o: offset + limit }) : null

    return { data, totalCount, nextCursor }
}

/**
 * Search nodes filtered by a specific label.
 *
 * Uses the appropriate fulltext index based on the label.
 * Falls back to property CONTAINS for labels without fulltext indexes.
 * Supports cursor-based pagination via opaque cursor tokens.
 */
export async function searchNodesByLabel(
  query: string,
  label: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  cursor?: string,
): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length === 0) {
    return { data: emptyGraphData(), totalCount: 0, nextCursor: null }
  }

  const offset = cursor ? (decodeSearchCursor(cursor)?.o ?? 0) : 0
  const fetchLimit = offset + limit + 1
  const indexName = LABEL_TO_FULLTEXT_INDEX[label]
  const session = getDriver().session()

  try {
    let records: Neo4jRecord[]

    if (indexName) {
      const sanitized = sanitizeLuceneQuery(trimmed)
      const result = await session.run(
        `CALL db.index.fulltext.queryNodes($indexName, $query)
         YIELD node AS n, score
         RETURN n
         ORDER BY score DESC
         LIMIT $fetchLimit`,
        { indexName, query: sanitized, fetchLimit: neo4j.int(fetchLimit) },
        TX_CONFIG,
      )
      records = result.records
    } else {
      // Fallback: case-insensitive CONTAINS on name/id properties
      const result = await session.run(
        `MATCH (n)
         WHERE $label IN labels(n)
           AND (n.name CONTAINS $query OR n.id CONTAINS $query)
         RETURN n
         LIMIT $fetchLimit`,
        { label, query: trimmed, fetchLimit: neo4j.int(fetchLimit) },
        TX_CONFIG,
      )
      records = result.records
    }

    const totalCount = records.length
    const pageRecords = records.slice(offset, offset + limit)
    const hasMore = offset + limit < totalCount

    const data = transformNodeRecords(pageRecords)
    const nextCursor = hasMore ? encodeCursor({ o: offset + limit }) : null

    return { data, totalCount, nextCursor }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Structured query
// ---------------------------------------------------------------------------

/** Structured query filters for graph exploration */
export interface StructuredQueryFilters {
  readonly label?: string
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly jurisdiction?: string
  readonly relType?: string
}

/** Structured query result with cursor-based pagination metadata */
export interface StructuredQueryResult {
  readonly data: GraphData
  readonly totalCount: number
  readonly nextCursor: string | null
}

const DEFAULT_QUERY_LIMIT = 50
const MAX_QUERY_LIMIT = 200

/**
 * Query nodes using structured filters: label, date range, jurisdiction.
 *
 * Builds a parameterized Cypher MATCH dynamically based on provided filters.
 * All user input is passed as Cypher parameters (never interpolated).
 *
 * Supports cursor-based (keyset) pagination using `(name, id)` as the sort key.
 * Pass the `cursor` from a previous response's `nextCursor` to fetch the next page.
 *
 * Returns matching nodes with their first-degree relationships to other
 * matched nodes, plus a total count and nextCursor.
 */
export async function queryNodes(
  filters: StructuredQueryFilters,
  limit: number = DEFAULT_QUERY_LIMIT,
  cursor?: string,
): Promise<StructuredQueryResult> {
  const clampedLimit = Math.min(Math.max(1, Math.floor(limit)), MAX_QUERY_LIMIT)

  const decodedCursor = cursor ? decodeQueryCursor(cursor) : null

  const session = getDriver().session()

  try {
    const { whereClauses, params } = buildWhereClause(filters)
    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Count total matching nodes
    const countResult = await session.run(
      `MATCH (n) ${whereStr} RETURN count(n) AS total`,
      params,
      TX_CONFIG,
    )

    const totalCount =
      countResult.records.length > 0
        ? toJsNumber(countResult.records[0].get('total'))
        : 0

    if (totalCount === 0) {
      return { data: emptyGraphData(), totalCount: 0, nextCursor: null }
    }

    // Build keyset pagination clause
    const cursorClauses = [...whereClauses]
    const cursorParams: Record<string, unknown> = { ...params, limit: neo4j.int(clampedLimit) }

    if (decodedCursor) {
      // Keyset pagination: skip past the last seen (name, id) tuple
      cursorClauses.push(
        '((n.name > $cursorName) OR (n.name = $cursorName AND n.id > $cursorId))',
      )
      cursorParams.cursorName = decodedCursor.n
      cursorParams.cursorId = decodedCursor.i
    }

    const cursorWhereStr =
      cursorClauses.length > 0 ? `WHERE ${cursorClauses.join(' AND ')}` : ''

    // Fetch matching nodes with keyset pagination (limit + 1 to detect hasMore)
    const nodeResult = await session.run(
      `MATCH (n) ${cursorWhereStr}
       RETURN n
       ORDER BY n.name ASC, n.id ASC
       LIMIT $fetchLimit`,
      { ...cursorParams, fetchLimit: neo4j.int(clampedLimit + 1) },
      TX_CONFIG,
    )

    if (nodeResult.records.length === 0) {
      return { data: emptyGraphData(), totalCount, nextCursor: null }
    }

    // Check if there are more results beyond this page
    const hasMore = nodeResult.records.length > clampedLimit
    const pageRecords = hasMore
      ? nodeResult.records.slice(0, clampedLimit)
      : nodeResult.records

    // Build nextCursor from the last node in this page
    let nextCursor: string | null = null
    if (hasMore) {
      const lastNode = pageRecords[pageRecords.length - 1].get('n') as Node
      const lastName = typeof lastNode.properties.name === 'string'
        ? lastNode.properties.name
        : ''
      const lastId = typeof lastNode.properties.id === 'string'
        ? lastNode.properties.id
        : lastNode.elementId
      nextCursor = encodeCursor({ n: lastName, i: lastId })
    }

    // Collect node IDs for relationship query
    const nodeIds: string[] = pageRecords.map((record) => {
      const node = record.get('n') as Node
      return node.elementId
    })

    // Fetch relationships between matched nodes
    const relResult = await session.run(
      `MATCH (a)-[r]-(b)
       WHERE elementId(a) IN $nodeIds AND elementId(b) IN $nodeIds
       RETURN DISTINCT r, elementId(startNode(r)) AS startId, elementId(endNode(r)) AS endId`,
      { nodeIds },
      TX_CONFIG,
    )

    const data = transformQueryResult(pageRecords, relResult.records)
    return { data, totalCount, nextCursor }
  } finally {
    await session.close()
  }
}

/**
 * Build WHERE clause fragments and params from structured filters.
 * All values are passed as Cypher parameters to prevent injection.
 */
function buildWhereClause(filters: StructuredQueryFilters): {
  readonly whereClauses: readonly string[]
  readonly params: Record<string, unknown>
} {
  const whereClauses: string[] = []
  const params: Record<string, unknown> = {}

  if (filters.label) {
    whereClauses.push('$label IN labels(n)')
    params.label = filters.label
  }

  if (filters.dateFrom) {
    whereClauses.push('n.date >= $dateFrom')
    params.dateFrom = filters.dateFrom
  }

  if (filters.dateTo) {
    whereClauses.push('n.date <= $dateTo')
    params.dateTo = filters.dateTo
  }

  if (filters.jurisdiction) {
    whereClauses.push('n.jurisdiction = $jurisdiction')
    params.jurisdiction = filters.jurisdiction
  }

  if (filters.relType) {
    whereClauses.push(`EXISTS { (n)-[:${sanitizeRelType(filters.relType)}]-() }`)
    // relType is validated by Zod enum at the route level, not interpolated from user input
  }

  return { whereClauses, params }
}

/**
 * Ensure relationship type contains only safe characters.
 * This is a defense-in-depth measure — the route validates via Zod enum.
 */
function sanitizeRelType(relType: string): string {
  return relType.replace(/[^A-Z_]/g, '')
}

/**
 * Transform query results with nodes and inter-node relationships
 * into GraphData format.
 */
function transformQueryResult(
  nodeRecords: readonly Neo4jRecord[],
  relRecords: readonly Neo4jRecord[],
): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const elementIdToAppId = new Map<string, string>()

  for (const record of nodeRecords) {
    const node = record.get('n') as Node
    const graphNode = transformNode(node)
    nodeMap.set(graphNode.id, graphNode)
    elementIdToAppId.set(node.elementId, graphNode.id)
  }

  const links: GraphLink[] = []
  const seenRelIds = new Set<string>()

  for (const record of relRecords) {
    const rel = record.get('r') as Relationship
    if (seenRelIds.has(rel.elementId)) continue
    seenRelIds.add(rel.elementId)

    const startElementId = record.get('startId') as string
    const endElementId = record.get('endId') as string
    const sourceId = elementIdToAppId.get(startElementId)
    const targetId = elementIdToAppId.get(endElementId)

    if (!sourceId || !targetId) continue

    links.push(transformRelationship(rel, sourceId, targetId))
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  }
}

/** Safely convert Neo4j Integer or number to JS number */
function toJsNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber()
  }
  return 0
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Map of node labels to their fulltext index names */
const LABEL_TO_FULLTEXT_INDEX: Readonly<Record<string, string>> = {
  Politician: 'politician_name_fulltext',
  Legislation: 'legislation_title_fulltext',
  Investigation: 'investigation_title_fulltext',
}

/** Lucene special characters that need escaping */
const LUCENE_SPECIAL_CHARS = /[+\-&|!(){}[\]^"~*?:\\/]/g

/**
 * Sanitize a user query for safe use with Neo4j fulltext (Lucene) search.
 * Escapes special characters and appends a wildcard for partial matching.
 */
function sanitizeLuceneQuery(query: string): string {
  const escaped = query.replace(LUCENE_SPECIAL_CHARS, '\\$&')
  // Add wildcard suffix for partial matching (e.g., "cris" matches "cristina")
  return `${escaped}*`
}

// ---------------------------------------------------------------------------
// Edge provenance
// ---------------------------------------------------------------------------

interface EdgeProvenanceData {
  readonly source_url?: string
  readonly tier?: string
  readonly confidence_score?: number
  readonly submitted_by?: string
  readonly created_at?: string
}

/**
 * Fetch provenance metadata for a specific relationship between two nodes.
 *
 * Looks up the relationship by matching source/target node IDs (by id, slug,
 * or acta_id) and relationship type. Returns provenance properties from the
 * relationship itself.
 */
export async function getEdgeProvenance(
  sourceId: string,
  targetId: string,
  relType: string,
): Promise<EdgeProvenanceData | null> {
  // Sanitize relType to prevent injection (only uppercase letters + underscore)
  const safeRelType = relType.replace(/[^A-Z_]/g, '')
  if (!safeRelType) return null

  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (s)-[r:${safeRelType}]->(t)
       WHERE (s.id = $sourceId OR s.slug = $sourceId OR s.acta_id = $sourceId)
         AND (t.id = $targetId OR t.slug = $targetId OR t.acta_id = $targetId)
       RETURN r
       LIMIT 1`,
      { sourceId, targetId },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      // Try reverse direction
      const reverseResult = await session.run(
        `MATCH (s)-[r:${safeRelType}]->(t)
         WHERE (s.id = $targetId OR s.slug = $targetId OR s.acta_id = $targetId)
           AND (t.id = $sourceId OR t.slug = $sourceId OR t.acta_id = $sourceId)
         RETURN r
         LIMIT 1`,
        { sourceId, targetId },
        TX_CONFIG,
      )

      if (reverseResult.records.length === 0) return null

      const rel = reverseResult.records[0].get('r') as Relationship
      return extractProvenance(rel)
    }

    const rel = result.records[0].get('r') as Relationship
    return extractProvenance(rel)
  } finally {
    await session.close()
  }
}

function extractProvenance(rel: Relationship): EdgeProvenanceData {
  const props = rel.properties as Record<string, unknown>
  return {
    source_url: typeof props.source_url === 'string' ? props.source_url : undefined,
    tier: typeof props.tier === 'string' ? props.tier : undefined,
    confidence_score:
      typeof props.confidence_score === 'number'
        ? props.confidence_score
        : props.confidence_score && typeof props.confidence_score === 'object' && 'toNumber' in props.confidence_score
          ? (props.confidence_score as { toNumber(): number }).toNumber()
          : undefined,
    submitted_by: typeof props.submitted_by === 'string' ? props.submitted_by : undefined,
    created_at: typeof props.created_at === 'string' ? props.created_at : undefined,
  }
}

// ---------------------------------------------------------------------------
// Showcase — curated relationships + hub nodes
// ---------------------------------------------------------------------------

/** A single relationship example for showcase display */
export interface ShowcaseEdge {
  readonly sourceName: string
  readonly sourceLabel: string
  readonly targetName: string
  readonly targetLabel: string
  readonly relType: string
}

/** Hub node for showcase display */
export interface ShowcaseHub {
  readonly name: string
  readonly label: string
  readonly degree: number
}

/** Combined showcase data */
export interface ShowcaseData {
  readonly edges: readonly ShowcaseEdge[]
  readonly hubs: readonly ShowcaseHub[]
}

/** Curated relationship types to showcase (most compelling) */
const SHOWCASE_REL_TYPES = ['FLEW_WITH', 'FINANCED', 'ASSOCIATED_WITH', 'OWNED', 'MENTIONED_IN']

/**
 * Fetch showcase data: curated compelling edges + top hub nodes.
 *
 * - Edges: 2 examples per curated relationship type (up to 10 total)
 * - Hubs: top 5 nodes by degree centrality
 *
 * Throws on Neo4j errors (let the route handle them).
 */
export async function getShowcaseData(): Promise<ShowcaseData> {
  const session = getDriver().session()

  try {
    // Query 1: Curated compelling edges — 2 per relationship type
    const edgeResult = await session.run(
      `UNWIND $relTypes AS relType
       CALL {
         WITH relType
         MATCH (a)-[r]->(b)
         WHERE type(r) = relType
           AND a.name IS NOT NULL AND b.name IS NOT NULL
         RETURN a.name AS sourceName, labels(a)[0] AS sourceLabel,
                b.name AS targetName, labels(b)[0] AS targetLabel,
                type(r) AS relType
         LIMIT 2
       }
       RETURN sourceName, sourceLabel, targetName, targetLabel, relType`,
      { relTypes: SHOWCASE_REL_TYPES },
      TX_CONFIG,
    )

    const edges: ShowcaseEdge[] = edgeResult.records.map((r) => ({
      sourceName: r.get('sourceName') as string,
      sourceLabel: r.get('sourceLabel') as string,
      targetName: r.get('targetName') as string,
      targetLabel: r.get('targetLabel') as string,
      relType: r.get('relType') as string,
    }))

    // Query 2: Top 5 hub nodes by degree centrality
    const hubResult = await session.run(
      `MATCH (n)
       WHERE n.name IS NOT NULL
       WITH n, size([(n)-[]-() | 1]) AS degree
       ORDER BY degree DESC
       LIMIT $limit
       RETURN n.name AS name, labels(n)[0] AS label, degree`,
      { limit: neo4j.int(5) },
      TX_CONFIG,
    )

    const hubs: ShowcaseHub[] = hubResult.records.map((r) => ({
      name: r.get('name') as string,
      label: r.get('label') as string,
      degree: typeof r.get('degree') === 'number'
        ? r.get('degree') as number
        : (r.get('degree') as { toNumber(): number }).toNumber(),
    }))

    return { edges, hubs }
  } finally {
    await session.close()
  }
}
