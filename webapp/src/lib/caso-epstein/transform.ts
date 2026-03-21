/**
 * Epstein investigation transform utilities.
 *
 * Maps raw Neo4j property bags to typed domain objects.
 * All functions are pure and immutable.
 */

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return undefined
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

export function toPerson(props: Record<string, unknown>): EpsteinPerson {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    role: asString(props.role),
    description: asString(props.description),
    nationality: asString(props.nationality),
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toFlight(props: Record<string, unknown>): EpsteinFlight {
  return {
    id: asString(props.id),
    flight_number: asString(props.flight_number),
    date: asString(props.date),
    origin: asString(props.origin),
    destination: asString(props.destination),
    aircraft: asString(props.aircraft),
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toLocation(props: Record<string, unknown>): EpsteinLocation {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    location_type: asString(props.location_type) as EpsteinLocation['location_type'],
    address: asString(props.address),
    coordinates: asOptionalString(props.coordinates) ?? null,
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toDocument(props: Record<string, unknown>): EpsteinDocument {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    doc_type: asString(props.doc_type) as EpsteinDocument['doc_type'],
    source_url: asString(props.source_url),
    summary: asString(props.summary),
    date: asString(props.date),
    key_findings: asStringArray(props.key_findings),
    excerpt: asString(props.excerpt),
    page_count: asOptionalNumber(props.page_count) ?? null,
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toEvent(props: Record<string, unknown>): EpsteinEvent {
  return {
    id: asString(props.id),
    title: asString(props.title),
    date: asString(props.date),
    event_type: asString(props.event_type) as EpsteinEvent['event_type'],
    description: asString(props.description),
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toOrganization(props: Record<string, unknown>): EpsteinOrganization {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    org_type: asString(props.org_type) as EpsteinOrganization['org_type'],
    description: asString(props.description),
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}

export function toLegalCase(props: Record<string, unknown>): EpsteinLegalCase {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    case_number: asString(props.case_number),
    court: asString(props.court),
    status: asString(props.status) as EpsteinLegalCase['status'],
    date_filed: asString(props.date_filed),
    confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined,
    source: asOptionalString(props.source),
    ingestion_wave: asOptionalNumber(props.ingestion_wave),
  }
}
