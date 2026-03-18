/**
 * Epstein investigation transform utilities.
 *
 * Converts Neo4j query result records into typed Epstein domain objects.
 */

import type { Node } from 'neo4j-driver-lite'

import type {
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
}
