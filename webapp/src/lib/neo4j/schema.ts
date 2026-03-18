/**
 * Neo4j schema initialization — constraints and indexes for the
 * Office of Accountability graph model.
 *
 * Constraints and indexes are idempotent (IF NOT EXISTS).
 * Safe to run on every deployment or container startup.
 */

import { executeWrite } from './client'

/** Unique constraints ensure no duplicate core entities */
const UNIQUE_CONSTRAINTS = [
  {
    name: 'politician_id_unique',
    label: 'Politician',
    property: 'id',
  },
  {
    name: 'legislation_expediente_unique',
    label: 'Legislation',
    property: 'expediente_id',
  },
  {
    name: 'legislative_vote_acta_unique',
    label: 'LegislativeVote',
    property: 'acta_id',
  },
  {
    name: 'party_id_unique',
    label: 'Party',
    property: 'id',
  },
  {
    name: 'province_id_unique',
    label: 'Province',
    property: 'id',
  },
  {
    name: 'investigation_id_unique',
    label: 'Investigation',
    property: 'id',
  },
  {
    name: 'user_id_unique',
    label: 'User',
    property: 'id',
  },
  {
    name: 'user_email_unique',
    label: 'User',
    property: 'email',
  },
  {
    name: 'epstein_person_id_unique',
    label: 'Person',
    property: 'id',
  },
  {
    name: 'epstein_flight_id_unique',
    label: 'Flight',
    property: 'id',
  },
  {
    name: 'epstein_location_id_unique',
    label: 'Location',
    property: 'id',
  },
  {
    name: 'epstein_document_id_unique',
    label: 'Document',
    property: 'id',
  },
  {
    name: 'epstein_event_id_unique',
    label: 'Event',
    property: 'id',
  },
  {
    name: 'epstein_organization_id_unique',
    label: 'Organization',
    property: 'id',
  },
  {
    name: 'epstein_legal_case_id_unique',
    label: 'LegalCase',
    property: 'id',
  },
] as const

/** Full-text indexes for search across text fields */
const FULLTEXT_INDEXES = [
  {
    name: 'politician_name_fulltext',
    labels: ['Politician'],
    properties: ['name', 'full_name'],
  },
  {
    name: 'legislation_title_fulltext',
    labels: ['Legislation'],
    properties: ['title', 'summary'],
  },
  {
    name: 'investigation_title_fulltext',
    labels: ['Investigation'],
    properties: ['title', 'summary'],
  },
  {
    name: 'epstein_person_name_fulltext',
    labels: ['Person'],
    properties: ['name', 'role', 'description'],
  },
  {
    name: 'epstein_document_title_fulltext',
    labels: ['Document'],
    properties: ['title', 'summary'],
  },
  {
    name: 'epstein_event_title_fulltext',
    labels: ['Event'],
    properties: ['title', 'description'],
  },
] as const

/** Standard B-tree indexes for common lookup patterns */
const BTREE_INDEXES = [
  {
    name: 'politician_slug_index',
    label: 'Politician',
    property: 'slug',
  },
  {
    name: 'politician_chamber_index',
    label: 'Politician',
    property: 'chamber',
  },
  {
    name: 'legislation_status_index',
    label: 'Legislation',
    property: 'status',
  },
  {
    name: 'legislative_vote_date_index',
    label: 'LegislativeVote',
    property: 'date',
  },
  {
    name: 'user_verification_tier_index',
    label: 'User',
    property: 'verification_tier',
  },
  {
    name: 'person_slug_index',
    label: 'Person',
    property: 'slug',
  },
  {
    name: 'person_caso_slug_index',
    label: 'Person',
    property: 'caso_slug',
  },
  {
    name: 'location_slug_index',
    label: 'Location',
    property: 'slug',
  },
  {
    name: 'document_slug_index',
    label: 'Document',
    property: 'slug',
  },
  {
    name: 'event_date_index',
    label: 'Event',
    property: 'date',
  },
  {
    name: 'flight_date_index',
    label: 'Flight',
    property: 'date',
  },
  {
    name: 'organization_slug_index',
    label: 'Organization',
    property: 'slug',
  },
  {
    name: 'legal_case_slug_index',
    label: 'LegalCase',
    property: 'slug',
  },
] as const

/**
 * Build Cypher for a unique node property constraint.
 * Uses IF NOT EXISTS for idempotent execution.
 */
function uniqueConstraintCypher(name: string, label: string, property: string): string {
  return `CREATE CONSTRAINT ${name} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${property} IS UNIQUE`
}

/**
 * Build Cypher for a full-text index across one or more labels/properties.
 * Uses IF NOT EXISTS for idempotent execution.
 */
function fulltextIndexCypher(
  name: string,
  labels: readonly string[],
  properties: readonly string[],
): string {
  const labelList = labels.map((l) => `${l}`).join('|')
  const propList = properties.map((p) => `n.${p}`).join(', ')
  return `CREATE FULLTEXT INDEX ${name} IF NOT EXISTS FOR (n:${labelList}) ON EACH [${propList}]`
}

/**
 * Build Cypher for a standard range index on a single property.
 * Uses IF NOT EXISTS for idempotent execution.
 */
function rangeIndexCypher(name: string, label: string, property: string): string {
  return `CREATE INDEX ${name} IF NOT EXISTS FOR (n:${label}) ON (n.${property})`
}

export interface SchemaInitResult {
  readonly constraintsCreated: number
  readonly fulltextIndexesCreated: number
  readonly rangeIndexesCreated: number
  readonly errors: readonly string[]
}

/**
 * Initialize the Neo4j schema with all constraints and indexes.
 * Idempotent — safe to call on every startup.
 *
 * Each statement runs in its own implicit transaction because
 * Neo4j does not allow schema commands inside explicit transactions
 * alongside other schema commands in Community Edition.
 */
export async function initializeSchema(): Promise<SchemaInitResult> {
  const errors: string[] = []
  let constraintsCreated = 0
  let fulltextIndexesCreated = 0
  let rangeIndexesCreated = 0

  // Create unique constraints
  for (const c of UNIQUE_CONSTRAINTS) {
    try {
      await executeWrite(uniqueConstraintCypher(c.name, c.label, c.property))
      constraintsCreated += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Constraint ${c.name}: ${message}`)
    }
  }

  // Create full-text indexes
  for (const idx of FULLTEXT_INDEXES) {
    try {
      await executeWrite(fulltextIndexCypher(idx.name, idx.labels, idx.properties))
      fulltextIndexesCreated += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Fulltext index ${idx.name}: ${message}`)
    }
  }

  // Create range indexes
  for (const idx of BTREE_INDEXES) {
    try {
      await executeWrite(rangeIndexCypher(idx.name, idx.label, idx.property))
      rangeIndexesCreated += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Range index ${idx.name}: ${message}`)
    }
  }

  return {
    constraintsCreated,
    fulltextIndexesCreated,
    rangeIndexesCreated,
    errors,
  }
}
