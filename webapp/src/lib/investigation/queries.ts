/**
 * Investigation query functions — Cypher queries for CRUD operations.
 *
 * All queries use parameterized Cypher (no string interpolation).
 * On publish, REFERENCES edges are created to embedded graph nodes.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'

import type {
  Investigation,
  InvestigationWithAuthor,
  InvestigationListItem,
  CreateInvestigationInput,
  UpdateInvestigationInput,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum query execution time in milliseconds (security: prevent graph bombs) */
const QUERY_TIMEOUT_MS = 5_000

/** Transaction config applied to all user-facing queries */
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

function asStringArray(value: unknown): readonly string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string')
  return []
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-') // collapse hyphens
    .replace(/^-|-$/g, '') // trim leading/trailing hyphens
    .slice(0, 200)
}

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `inv-${timestamp}-${random}`
}

function mapInvestigationRecord(record: Neo4jRecord): Investigation {
  const node = record.get('i')
  const props = node.properties

  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    summary: asString(props.summary),
    body: asString(props.body),
    status: asString(props.status) as Investigation['status'],
    tags: asStringArray(props.tags),
    author_id: asString(props.author_id),
    referenced_node_ids: asStringArray(props.referenced_node_ids),
    source_url: asString(props.source_url),
    submitted_by: asString(props.submitted_by),
    tier: 'bronze',
    confidence_score: asNumber(props.confidence_score),
    created_at: asString(props.created_at),
    updated_at: asString(props.updated_at),
    published_at: props.published_at ? asString(props.published_at) : null,
  }
}

function mapInvestigationWithAuthor(record: Neo4jRecord): InvestigationWithAuthor {
  const investigation = mapInvestigationRecord(record)
  const author = record.get('author')
  const authorProps = author ? author.properties : {}

  return {
    investigation,
    author: {
      id: asString(authorProps.id),
      name: authorProps.name ? asString(authorProps.name) : null,
      image: authorProps.image ? asString(authorProps.image) : null,
    },
  }
}

function mapListItem(record: Neo4jRecord): InvestigationListItem {
  const node = record.get('i')
  const props = node.properties
  const author = record.get('author')
  const authorProps = author ? author.properties : {}

  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    summary: asString(props.summary),
    status: asString(props.status) as InvestigationListItem['status'],
    tags: asStringArray(props.tags),
    author_id: asString(props.author_id),
    author_name: authorProps.name ? asString(authorProps.name) : null,
    author_image: authorProps.image ? asString(authorProps.image) : null,
    created_at: asString(props.created_at),
    updated_at: asString(props.updated_at),
    published_at: props.published_at ? asString(props.published_at) : null,
  }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

/**
 * Create a new investigation node.
 *
 * If status is 'published', also sets published_at and creates REFERENCES edges.
 * Returns the created investigation with author info.
 */
export async function createInvestigation(
  input: CreateInvestigationInput,
  authorId: string,
): Promise<InvestigationWithAuthor> {
  const now = new Date().toISOString()
  const id = generateId()
  const slug = generateSlug(input.title)
  const isPublished = input.status === 'published'

  const session = getDriver().session()

  try {
    const result = await session.executeWrite(async (tx) => {
      // Create the Investigation node
      const createResult = await tx.run(
        `MATCH (u:User {id: $authorId})
         CREATE (i:Investigation {
           id: $id,
           title: $title,
           slug: $slug,
           summary: $summary,
           body: $body,
           status: $status,
           tags: $tags,
           author_id: $authorId,
           referenced_node_ids: $referencedNodeIds,
           source_url: '',
           submitted_by: $authorId,
           tier: 'bronze',
           confidence_score: 0.5,
           created_at: $now,
           updated_at: $now,
           published_at: $publishedAt
         })
         CREATE (u)-[:AUTHORED]->(i)
         RETURN i, u AS author`,
        {
          id,
          title: input.title,
          slug,
          summary: input.summary ?? '',
          body: input.body,
          status: input.status ?? 'draft',
          tags: input.tags ?? [],
          authorId,
          referencedNodeIds: input.referenced_node_ids ?? [],
          now,
          publishedAt: isPublished ? now : null,
        },
      )

      // Create REFERENCES edges if publishing with referenced nodes
      const refs = input.referenced_node_ids ?? []
      if (isPublished && refs.length > 0) {
        await tx.run(
          `MATCH (i:Investigation {id: $id})
           UNWIND $nodeIds AS nodeId
           MATCH (n) WHERE n.id = nodeId OR n.slug = nodeId OR n.acta_id = nodeId
           MERGE (i)-[:REFERENCES]->(n)`,
          { id, nodeIds: refs },
        )
      }

      return createResult
    }, TX_CONFIG)

    return mapInvestigationWithAuthor(result.records[0])
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get an investigation by slug, with author info.
 * Returns null if not found.
 */
export async function getInvestigationBySlug(
  slug: string,
): Promise<InvestigationWithAuthor | null> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (i:Investigation {slug: $slug})
       OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
       RETURN i, author
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return null
    }

    return mapInvestigationWithAuthor(result.records[0])
  } finally {
    await session.close()
  }
}

/**
 * Get an investigation by ID, with author info.
 * Returns null if not found.
 */
export async function getInvestigationById(id: string): Promise<InvestigationWithAuthor | null> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (i:Investigation {id: $id})
       OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
       RETURN i, author
       LIMIT 1`,
      { id },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return null
    }

    return mapInvestigationWithAuthor(result.records[0])
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

/**
 * Update an investigation. Only the provided fields are updated.
 *
 * If status transitions to 'published', sets published_at and syncs REFERENCES edges.
 * Returns the updated investigation with author info, or null if not found.
 */
export async function updateInvestigation(
  id: string,
  input: UpdateInvestigationInput,
  authorId: string,
): Promise<InvestigationWithAuthor | null> {
  const now = new Date().toISOString()
  const session = getDriver().session()

  try {
    const result = await session.executeWrite(async (tx) => {
      // Verify ownership
      const verifyResult = await tx.run(
        `MATCH (i:Investigation {id: $id})
         RETURN i.author_id AS authorId`,
        { id },
      )

      if (verifyResult.records.length === 0) {
        return null
      }

      if (asString(verifyResult.records[0].get('authorId')) !== authorId) {
        throw new Error('Unauthorized: not the investigation author')
      }

      // Build dynamic SET clause from provided fields
      const setClauses: string[] = ['i.updated_at = $now']
      const params: Record<string, unknown> = { id, now, authorId }

      if (input.title !== undefined) {
        setClauses.push('i.title = $title')
        setClauses.push('i.slug = $slug')
        params.title = input.title
        params.slug = generateSlug(input.title)
      }
      if (input.summary !== undefined) {
        setClauses.push('i.summary = $summary')
        params.summary = input.summary
      }
      if (input.body !== undefined) {
        setClauses.push('i.body = $body')
        params.body = input.body
      }
      if (input.tags !== undefined) {
        setClauses.push('i.tags = $tags')
        params.tags = input.tags
      }
      if (input.status !== undefined) {
        setClauses.push('i.status = $status')
        params.status = input.status

        if (input.status === 'published') {
          setClauses.push('i.published_at = COALESCE(i.published_at, $now)')
        }
      }
      if (input.referenced_node_ids !== undefined) {
        setClauses.push('i.referenced_node_ids = $referencedNodeIds')
        params.referencedNodeIds = input.referenced_node_ids
      }

      const updateResult = await tx.run(
        `MATCH (i:Investigation {id: $id})
         OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
         SET ${setClauses.join(', ')}
         RETURN i, author`,
        params,
      )

      // Sync REFERENCES edges when publishing or updating referenced nodes
      const isPublishing = input.status === 'published'
      const hasNewRefs = input.referenced_node_ids !== undefined

      if (isPublishing || hasNewRefs) {
        // Remove old REFERENCES edges
        await tx.run(
          `MATCH (i:Investigation {id: $id})-[r:REFERENCES]->()
           DELETE r`,
          { id },
        )

        // Get the current referenced_node_ids (from input or existing node)
        const refIds =
          input.referenced_node_ids ??
          asStringArray(updateResult.records[0]?.get('i')?.properties?.referenced_node_ids)

        if (refIds.length > 0) {
          // Only create REFERENCES if investigation is published
          const statusResult = await tx.run(
            `MATCH (i:Investigation {id: $id}) RETURN i.status AS status`,
            { id },
          )
          const currentStatus = asString(statusResult.records[0]?.get('status'))

          if (currentStatus === 'published') {
            await tx.run(
              `MATCH (i:Investigation {id: $id})
               UNWIND $nodeIds AS nodeId
               MATCH (n) WHERE n.id = nodeId OR n.slug = nodeId OR n.acta_id = nodeId
               MERGE (i)-[:REFERENCES]->(n)`,
              { id, nodeIds: refIds },
            )
          }
        }
      }

      return updateResult
    }, TX_CONFIG)

    if (!result || result.records.length === 0) {
      return null
    }

    return mapInvestigationWithAuthor(result.records[0])
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete an investigation and all its relationships.
 *
 * Only the author can delete their investigation.
 * Returns true if deleted, false if not found.
 * Throws if unauthorized.
 */
export async function deleteInvestigation(id: string, authorId: string): Promise<boolean> {
  const session = getDriver().session()

  try {
    return await session.executeWrite(async (tx) => {
      const verifyResult = await tx.run(
        `MATCH (i:Investigation {id: $id})
         RETURN i.author_id AS authorId`,
        { id },
      )

      if (verifyResult.records.length === 0) {
        return false
      }

      if (asString(verifyResult.records[0].get('authorId')) !== authorId) {
        throw new Error('Unauthorized: not the investigation author')
      }

      await tx.run(
        `MATCH (i:Investigation {id: $id})
         DETACH DELETE i`,
        { id },
      )

      return true
    }, TX_CONFIG)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

/** Paginated investigation list result */
export interface InvestigationListResult {
  readonly items: readonly InvestigationListItem[]
  readonly totalCount: number
  readonly page: number
  readonly limit: number
  readonly hasMore: boolean
}

/**
 * List published investigations with optional tag filter.
 * Returns paginated results sorted by published_at descending.
 */
export async function listInvestigations(
  page: number = 1,
  limit: number = 12,
  tag?: string,
): Promise<InvestigationListResult> {
  const skip = (page - 1) * limit
  const session = getDriver().session()

  try {
    const tagFilter = tag ? 'AND $tag IN i.tags' : ''
    const params: Record<string, unknown> = { skip, limit }
    if (tag) {
      params.tag = tag
    }

    const [countResult, pageResult] = await Promise.all([
      session.run(
        `MATCH (i:Investigation {status: 'published'})
         WHERE true ${tagFilter}
         RETURN count(i) AS total`,
        params,
        TX_CONFIG,
      ),
      session.run(
        `MATCH (i:Investigation {status: 'published'})
         WHERE true ${tagFilter}
         OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
         RETURN i, author
         ORDER BY i.published_at DESC
         SKIP $skip
         LIMIT $limit`,
        params,
        TX_CONFIG,
      ),
    ])

    const totalCount = asNumber(countResult.records[0]?.get('total'))
    const items = pageResult.records.map(mapListItem)

    return {
      items,
      totalCount,
      page,
      limit,
      hasMore: skip + items.length < totalCount,
    }
  } finally {
    await session.close()
  }
}

/**
 * List investigations by a specific author (all statuses).
 * Returns paginated results sorted by updated_at descending.
 */
export async function listMyInvestigations(
  authorId: string,
  page: number = 1,
  limit: number = 12,
): Promise<InvestigationListResult> {
  const skip = (page - 1) * limit
  const session = getDriver().session()

  try {
    const [countResult, pageResult] = await Promise.all([
      session.run(
        `MATCH (i:Investigation {author_id: $authorId})
         RETURN count(i) AS total`,
        { authorId },
        TX_CONFIG,
      ),
      session.run(
        `MATCH (i:Investigation {author_id: $authorId})
         OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
         RETURN i, author
         ORDER BY i.updated_at DESC
         SKIP $skip
         LIMIT $limit`,
        { authorId, skip, limit },
        TX_CONFIG,
      ),
    ])

    const totalCount = asNumber(countResult.records[0]?.get('total'))
    const items = pageResult.records.map(mapListItem)

    return {
      items,
      totalCount,
      page,
      limit,
      hasMore: skip + items.length < totalCount,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

/**
 * Get investigations that reference a specific node.
 * Useful for showing related investigations on politician profiles.
 */
export async function getInvestigationsReferencingNode(
  nodeId: string,
  limit: number = 10,
): Promise<readonly InvestigationListItem[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (i:Investigation {status: 'published'})-[:REFERENCES]->(n)
       WHERE n.id = $nodeId OR n.slug = $nodeId OR n.acta_id = $nodeId
       OPTIONAL MATCH (author:User)-[:AUTHORED]->(i)
       RETURN i, author
       ORDER BY i.published_at DESC
       LIMIT $limit`,
      { nodeId, limit },
      TX_CONFIG,
    )

    return result.records.map(mapListItem)
  } finally {
    await session.close()
  }
}

/**
 * Get all unique tags from published investigations.
 * Useful for tag filter dropdowns.
 */
export async function getAllTags(): Promise<readonly string[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (i:Investigation {status: 'published'})
       UNWIND i.tags AS tag
       RETURN DISTINCT tag
       ORDER BY tag`,
      {},
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => r.get('tag') as string)
  } finally {
    await session.close()
  }
}
