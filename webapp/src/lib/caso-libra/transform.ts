/**
 * Caso Libra transform utilities.
 *
 * Maps raw Neo4j property bags to typed domain objects.
 * All functions are pure and immutable.
 */

import type {
  Person,
  CasoLibraEvent,
  CasoLibraDocument,
  Organization,
  Token,
  WalletAddress,
  EventType,
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

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

export function toPerson(props: Record<string, unknown>): Person {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    role: asOptionalString(props.role),
    description: asOptionalString(props.description),
    photo_url: asOptionalString(props.photo_url),
    nationality: asOptionalString(props.nationality),
  }
}

export function toEvent(props: Record<string, unknown>): CasoLibraEvent {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    description: asOptionalString(props.description),
    date: asString(props.date),
    source_url: asOptionalString(props.source_url),
    event_type: (asString(props.event_type) || 'political') as EventType,
  }
}

export function toDocument(props: Record<string, unknown>): CasoLibraDocument {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    doc_type: asString(props.doc_type),
    source_url: asOptionalString(props.source_url),
    summary: asOptionalString(props.summary),
    date_published: asOptionalString(props.date_published),
  }
}

export function toOrganization(props: Record<string, unknown>): Organization {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    org_type: asOptionalString(props.org_type),
    description: asOptionalString(props.description),
    country: asOptionalString(props.country),
  }
}

export function toToken(props: Record<string, unknown>): Token {
  return {
    id: asString(props.id),
    symbol: asString(props.symbol),
    name: asString(props.name),
    contract_address: asString(props.contract_address),
    chain: 'solana',
    launch_date: asString(props.launch_date),
    peak_market_cap: asOptionalNumber(props.peak_market_cap),
  }
}

export function toWallet(props: Record<string, unknown>): WalletAddress {
  return {
    address: asString(props.address),
    label: asOptionalString(props.label),
    owner_id: asOptionalString(props.owner_id),
    chain: 'solana',
  }
}
