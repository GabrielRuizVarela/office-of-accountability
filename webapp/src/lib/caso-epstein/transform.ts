/**
 * Epstein investigation transform utilities.
 *
 * Converts Neo4j query result records into typed Epstein domain objects.
 */

import type { Node } from 'neo4j-driver-lite'

import type { InvestigationNode } from '../investigations/types'

import type {
  ConfidenceTier,
  EpsteinPerson,
  EpsteinFlight,
  EpsteinLocation,
  EpsteinDocument,
  EpsteinEvent,
  EpsteinOrganization,
  EpsteinLegalCase,
} from './types'

/** Safely extract a string property from a Neo4j node */
function str(props: Record<string, unknown>, key: string, fallback = ''): string {
  const v = props[key]
  return typeof v === 'string' ? v : fallback
}

/** Safely extract a nullable string property */
function strOrNull(props: Record<string, unknown>, key: string): string | null {
  const v = props[key]
  return typeof v === 'string' ? v : null
}

/** Safely extract a string array property from a Neo4j node */
function strArray(props: Record<string, unknown>, key: string): string[] {
  const v = props[key]
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : []
}

/** Safely extract a nullable number property */
function numOrNull(props: Record<string, unknown>, key: string): number | null {
  const v = props[key]
  if (typeof v === 'number') return v
  // Neo4j integers come as { low, high } objects
  if (v && typeof v === 'object' && 'low' in v) return (v as { low: number }).low
  return null
}

/** Extract optional confidence/ingestion metadata fields */
function confidenceFields(p: Record<string, unknown>): {
  confidence_tier?: ConfidenceTier
  source?: string
  ingestion_wave?: number
} {
  return {
    confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier as ConfidenceTier : undefined,
    source: typeof p.source === 'string' ? p.source : undefined,
    ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
  }
}

// ---------------------------------------------------------------------------
// Generic InvestigationNode transform
// ---------------------------------------------------------------------------

/** Convert any Neo4j Node to a generic InvestigationNode */
export function toInvestigationNode(node: Node): InvestigationNode {
  const props: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node.properties)) {
    // Neo4j integers have a toNumber() method
    props[key] = value !== null && typeof value === 'object' && 'toNumber' in (value as object)
      ? (value as { toNumber(): number }).toNumber()
      : value
  }

  return {
    id: typeof props.id === 'string' ? props.id : node.elementId,
    label: node.labels[0] ?? 'Unknown',
    caso_slug: typeof props.caso_slug === 'string' ? props.caso_slug : '',
    properties: props,
    name: typeof props.name === 'string' ? props.name : undefined,
    slug: typeof props.slug === 'string' ? props.slug : undefined,
    description: typeof props.description === 'string' ? props.description : undefined,
  }
}

// ---------------------------------------------------------------------------
// Per-type transforms
// ---------------------------------------------------------------------------

/** Convert a Neo4j Node to an EpsteinPerson */
export function toPerson(node: Node): EpsteinPerson {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    role: str(p, 'role'),
    description: str(p, 'description'),
    nationality: str(p, 'nationality'),
    ...confidenceFields(p),
  } as EpsteinPerson
}

/** Convert a Neo4j Node to an EpsteinFlight */
export function toFlight(node: Node): EpsteinFlight {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    flight_number: str(p, 'flight_number'),
    date: str(p, 'date'),
    origin: str(p, 'origin'),
    destination: str(p, 'destination'),
    aircraft: str(p, 'aircraft'),
    ...confidenceFields(p),
  } as EpsteinFlight
}

/** Convert a Neo4j Node to an EpsteinLocation */
export function toLocation(node: Node): EpsteinLocation {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    location_type: str(p, 'location_type') as EpsteinLocation['location_type'],
    address: str(p, 'address'),
    coordinates: strOrNull(p, 'coordinates'),
    ...confidenceFields(p),
  } as EpsteinLocation
}

/** Convert a Neo4j Node to an EpsteinDocument */
export function toDocument(node: Node): EpsteinDocument {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    doc_type: str(p, 'doc_type') as EpsteinDocument['doc_type'],
    source_url: str(p, 'source_url'),
    summary: str(p, 'summary'),
    date: str(p, 'date'),
    key_findings: strArray(p, 'key_findings'),
    excerpt: str(p, 'excerpt'),
    page_count: numOrNull(p, 'page_count'),
    ...confidenceFields(p),
  } as EpsteinDocument
}

/** Convert a Neo4j Node to an EpsteinEvent */
export function toEvent(node: Node): EpsteinEvent {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    date: str(p, 'date'),
    event_type: str(p, 'event_type') as EpsteinEvent['event_type'],
    description: str(p, 'description'),
    ...confidenceFields(p),
  } as EpsteinEvent
}

/** Convert a Neo4j Node to an EpsteinOrganization */
export function toOrganization(node: Node): EpsteinOrganization {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    org_type: str(p, 'org_type') as EpsteinOrganization['org_type'],
    description: str(p, 'description'),
    ...confidenceFields(p),
  } as EpsteinOrganization
}

/** Convert a Neo4j Node to an EpsteinLegalCase */
export function toLegalCase(node: Node): EpsteinLegalCase {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    case_number: str(p, 'case_number'),
    court: str(p, 'court'),
    status: str(p, 'status') as EpsteinLegalCase['status'],
    date_filed: str(p, 'date_filed'),
    ...confidenceFields(p),
  } as EpsteinLegalCase
}
