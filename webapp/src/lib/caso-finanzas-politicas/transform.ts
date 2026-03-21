/**
 * Caso Finanzas Politicas transform utilities.
 *
 * Maps raw Neo4j property bags to typed domain objects.
 * All functions are pure and immutable.
 */

import type {
  Person,
  Organization,
  Claim,
  ClaimStatus,
  MoneyFlow,
  FinanzasPoliticasEvent,
  InvestigationCategory,
  GovernmentAction,
  FinanzasPoliticasDocument,
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

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
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
    party: asOptionalString(props.party),
    nationality: asOptionalString(props.nationality),
    datasets: asOptionalNumber(props.datasets),
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

export function toClaim(props: Record<string, unknown>): Claim {
  return {
    id: asString(props.id),
    claim: asString(props.claim),
    status: (asString(props.status) || 'unconfirmed') as ClaimStatus,
    tier: asNumber(props.tier) || 1,
    source: asString(props.source),
    source_url: asOptionalString(props.source_url),
    detail: asOptionalString(props.detail),
  }
}

export function toMoneyFlow(props: Record<string, unknown>): MoneyFlow {
  return {
    id: asString(props.id),
    from_id: asString(props.from_id),
    to_id: asString(props.to_id),
    amount_ars: asNumber(props.amount_ars),
    description: asOptionalString(props.description),
    date: asString(props.date),
    source: asOptionalString(props.source),
    source_url: asOptionalString(props.source_url),
  }
}

export function toEvent(props: Record<string, unknown>): FinanzasPoliticasEvent {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    description: asOptionalString(props.description),
    date: asString(props.date),
    category: (asString(props.category) || 'political') as InvestigationCategory,
    source_url: asOptionalString(props.source_url),
  }
}

export function toGovernmentAction(props: Record<string, unknown>): GovernmentAction {
  return {
    id: asString(props.id),
    title: asString(props.title),
    slug: asString(props.slug),
    action_type: asString(props.action_type),
    date: asString(props.date),
    source_url: asOptionalString(props.source_url),
    summary: asOptionalString(props.summary),
  }
}

export function toDocument(props: Record<string, unknown>): FinanzasPoliticasDocument {
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
