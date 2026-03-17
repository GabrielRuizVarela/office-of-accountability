/**
 * Graph query service — Cypher queries for node neighborhood and search.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * Results are transformed into the { nodes, links } GraphData format
 * consumed by react-force-graph-2d.
 */

import type { Node, Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import type { GraphData } from '../neo4j/types'

import { emptyGraphData, transformNeighborRecords, transformNodeRecords } from './transform'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_NEIGHBOR_LIMIT = 50
const DEFAULT_SEARCH_LIMIT = 20

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
      { nodeId, limit },
    )

    return transformNeighborRecords(centerNode, neighborResult.records)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Fulltext search
// ---------------------------------------------------------------------------

/** Search result with relevance score */
export interface SearchResult {
  readonly data: GraphData
  readonly totalCount: number
}

/**
 * Search nodes across all fulltext indexes by query string.
 *
 * Uses Neo4j fulltext search with Lucene syntax.
 * Searches across: politician names, legislation titles, investigation titles.
 *
 * Returns matching nodes as GraphData (no links) plus total count.
 */
export async function searchNodes(
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length === 0) {
    return { data: emptyGraphData(), totalCount: 0 }
  }

  // Escape special Lucene characters and add wildcard for partial matching
  const sanitized = sanitizeLuceneQuery(trimmed)

  const session = getDriver().session()

  try {
    // Search across all three fulltext indexes in parallel
    const [politicianResult, legislationResult, investigationResult] = await Promise.all([
      session.run(
        `CALL db.index.fulltext.queryNodes('politician_name_fulltext', $query)
         YIELD node AS n, score
         RETURN n
         ORDER BY score DESC
         LIMIT $limit`,
        { query: sanitized, limit },
      ),
      session.run(
        `CALL db.index.fulltext.queryNodes('legislation_title_fulltext', $query)
         YIELD node AS n, score
         RETURN n
         ORDER BY score DESC
         LIMIT $limit`,
        { query: sanitized, limit },
      ),
      session.run(
        `CALL db.index.fulltext.queryNodes('investigation_title_fulltext', $query)
         YIELD node AS n, score
         RETURN n
         ORDER BY score DESC
         LIMIT $limit`,
        { query: sanitized, limit },
      ),
    ])

    const allRecords: Neo4jRecord[] = [
      ...politicianResult.records,
      ...legislationResult.records,
      ...investigationResult.records,
    ]

    const data = transformNodeRecords(allRecords)
    const totalCount = data.nodes.length

    return { data, totalCount }
  } finally {
    await session.close()
  }
}

/**
 * Search nodes filtered by a specific label.
 *
 * Uses the appropriate fulltext index based on the label.
 * Falls back to property CONTAINS for labels without fulltext indexes.
 */
export async function searchNodesByLabel(
  query: string,
  label: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
): Promise<SearchResult> {
  const trimmed = query.trim()

  if (trimmed.length === 0) {
    return { data: emptyGraphData(), totalCount: 0 }
  }

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
         LIMIT $limit`,
        { indexName, query: sanitized, limit },
      )
      records = result.records
    } else {
      // Fallback: case-insensitive CONTAINS on name/id properties
      const result = await session.run(
        `MATCH (n)
         WHERE $label IN labels(n)
           AND (n.name CONTAINS $query OR n.id CONTAINS $query)
         RETURN n
         LIMIT $limit`,
        { label, query: trimmed, limit },
      )
      records = result.records
    }

    const data = transformNodeRecords(records)
    return { data, totalCount: data.nodes.length }
  } finally {
    await session.close()
  }
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
