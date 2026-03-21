/**
 * Caso Finanzas Politicas transform utilities.
 *
 * Maps raw Neo4j property bags to typed domain objects.
 * All functions are pure and immutable.
 */

import type {
  FinPolPerson,
  FinPolOrganization,
  FinPolEvent,
  FinPolClaim,
  FinPolMoneyFlow,
  FinPolShellCompany,
  FinPolGovernmentAction,
  ClaimStatus,
  InvestigationCategory,
  MoneyFlowDirection,
  GovernmentActionType,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function str(props: Record<string, unknown>, key: string, fallback = ''): string {
  const v = props[key]
  return typeof v === 'string' ? v : fallback
}

function strOrUndef(props: Record<string, unknown>, key: string): string | undefined {
  const v = props[key]
  return typeof v === 'string' ? v : undefined
}

function numOrUndef(props: Record<string, unknown>, key: string): number | undefined {
  const v = props[key]
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'toNumber' in v) {
    return (v as { toNumber(): number }).toNumber()
  }
  return undefined
}

function num(props: Record<string, unknown>, key: string, fallback = 0): number {
  return numOrUndef(props, key) ?? fallback
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

export function toPerson(props: Record<string, unknown>): FinPolPerson {
  return {
    id: str(props, 'id'),
    name: str(props, 'name'),
    slug: str(props, 'slug'),
    role: strOrUndef(props, 'role'),
    description: strOrUndef(props, 'description'),
    party: strOrUndef(props, 'party'),
    nationality: strOrUndef(props, 'nationality'),
    datasets: numOrUndef(props, 'datasets'),
  }
}

export function toOrganization(props: Record<string, unknown>): FinPolOrganization {
  return {
    id: str(props, 'id'),
    name: str(props, 'name'),
    slug: str(props, 'slug'),
    org_type: strOrUndef(props, 'org_type'),
    description: strOrUndef(props, 'description'),
    country: strOrUndef(props, 'country'),
    jurisdiction: strOrUndef(props, 'jurisdiction'),
  }
}

export function toEvent(props: Record<string, unknown>): FinPolEvent {
  return {
    id: str(props, 'id'),
    title: str(props, 'title'),
    slug: str(props, 'slug'),
    date: str(props, 'date'),
    event_type: strOrUndef(props, 'event_type'),
    description: strOrUndef(props, 'description'),
    category: strOrUndef(props, 'category') as InvestigationCategory | undefined,
    source_url: strOrUndef(props, 'source_url'),
  }
}

export function toClaim(props: Record<string, unknown>): FinPolClaim {
  return {
    id: str(props, 'id'),
    claim_es: str(props, 'claim_es'),
    claim_en: str(props, 'claim_en'),
    status: (str(props, 'status') || 'unconfirmed') as ClaimStatus,
    tier: num(props, 'tier', 3),
    source: str(props, 'source'),
    source_url: str(props, 'source_url'),
    detail_es: strOrUndef(props, 'detail_es'),
    detail_en: strOrUndef(props, 'detail_en'),
  }
}

export function toMoneyFlow(props: Record<string, unknown>): FinPolMoneyFlow {
  return {
    id: str(props, 'id'),
    from_label: str(props, 'from_label'),
    to_label: str(props, 'to_label'),
    amount_ars: num(props, 'amount_ars'),
    description_es: str(props, 'description_es'),
    description_en: str(props, 'description_en'),
    date: str(props, 'date'),
    source: str(props, 'source'),
    source_url: str(props, 'source_url'),
    direction: strOrUndef(props, 'direction') as MoneyFlowDirection | undefined,
  }
}

export function toShellCompany(props: Record<string, unknown>): FinPolShellCompany {
  return {
    id: str(props, 'id'),
    name: str(props, 'name'),
    slug: str(props, 'slug'),
    jurisdiction: str(props, 'jurisdiction'),
    incorporation_date: strOrUndef(props, 'incorporation_date'),
    source: str(props, 'source'),
    source_url: strOrUndef(props, 'source_url'),
    status: strOrUndef(props, 'status'),
  }
}

export function toGovernmentAction(props: Record<string, unknown>): FinPolGovernmentAction {
  return {
    id: str(props, 'id'),
    title: str(props, 'title'),
    slug: str(props, 'slug'),
    action_type: (str(props, 'action_type') || 'decree') as GovernmentActionType,
    date: str(props, 'date'),
    description: strOrUndef(props, 'description'),
    source_url: strOrUndef(props, 'source_url'),
  }
}
