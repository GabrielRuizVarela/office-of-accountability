/**
 * Shared validation schemas for graph API routes.
 *
 * Node IDs are validated against known formats before being used
 * in Cypher queries. This prevents garbage strings from reaching
 * the database and provides better error messages to API consumers.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// ID format patterns
// ---------------------------------------------------------------------------

/** UUID v4: 8-4-4-4-12 hex digits with hyphens */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Plain integer (Neo4j internal IDs, acta_ids) */
const INTEGER_RE = /^[0-9]{1,19}$/

/** URL slug: lowercase alphanumeric with hyphens, 1-200 chars */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Neo4j 5 element ID format: "N:dbname:number" where N is a digit */
const NEO4J_ELEMENT_ID_RE = /^[0-9]+:[a-zA-Z0-9_-]+:[0-9]+$/

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/**
 * Validates that a string matches one of the accepted node ID formats:
 * - UUID (e.g. "550e8400-e29b-41d4-a716-446655440000")
 * - Integer (e.g. "12345")
 * - Slug (e.g. "cristina-fernandez-de-kirchner")
 * - Neo4j element ID (e.g. "4:neo4j:123")
 */
/**
 * Validates politician slugs: lowercase alphanumeric with hyphens only.
 * Rejects traversal attempts (../), encoded slashes, underscores, dots.
 */
export const politicianSlugSchema = z
  .string()
  .min(1, 'Slug must not be empty')
  .max(200, 'Slug must not exceed 200 characters')
  .regex(SLUG_RE, 'Slug must contain only lowercase alphanumeric characters and hyphens')

export const nodeIdSchema = z
  .string()
  .min(1, 'Node ID must not be empty')
  .max(200, 'Node ID must not exceed 200 characters')
  .refine(
    (id) =>
      UUID_RE.test(id) ||
      INTEGER_RE.test(id) ||
      SLUG_RE.test(id) ||
      NEO4J_ELEMENT_ID_RE.test(id),
    'Node ID must be a valid UUID, integer, slug, or Neo4j element ID',
  )
