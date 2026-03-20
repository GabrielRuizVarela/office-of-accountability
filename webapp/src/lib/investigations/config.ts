/**
 * Read InvestigationConfig nodes from Neo4j.
 *
 * All queries use parameterized Cypher (no string interpolation).
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '../neo4j/client'
import type { InvestigationConfig } from './types'

// ---------------------------------------------------------------------------
// Record → typed object helper
// ---------------------------------------------------------------------------

function toInvestigationConfig(record: Neo4jRecord): InvestigationConfig {
  const n = record.get('n')
  const p = n.properties as Record<string, unknown>

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
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a single InvestigationConfig by caso_slug.
 * Returns null if no matching node exists.
 */
export async function getConfig(casoSlug: string): Promise<InvestigationConfig | null> {
  const result = await readQuery<InvestigationConfig>(
    `MATCH (n:InvestigationConfig {caso_slug: $casoSlug})
     RETURN n
     LIMIT 1`,
    { casoSlug },
    toInvestigationConfig,
  )

  return result.records[0] ?? null
}

/**
 * Fetch all InvestigationConfig nodes, ordered by name.
 */
export async function getAllConfigs(): Promise<InvestigationConfig[]> {
  const result = await readQuery<InvestigationConfig>(
    `MATCH (n:InvestigationConfig)
     RETURN n
     ORDER BY n.name ASC`,
    {},
    toInvestigationConfig,
  )

  return [...result.records]
}
