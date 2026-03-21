/**
 * Caso Finanzas Politicas transform utilities.
 *
 * Converts Neo4j query result records into typed FP domain objects.
 * All functions are pure — no database access.
 */

import type { Node } from 'neo4j-driver-lite'

import type {
  Person,
  Organization,
  FPEvent,
  MoneyFlow,
  Claim,
  FactcheckStatus,
  InvestigationCategory,
  OrgType,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/** Safely extract a nullable number property */
function numOrNull(props: Record<string, unknown>, key: string): number | null {
  const v = props[key]
  if (typeof v === 'number') return v
  // Neo4j integers come as { low, high } objects
  if (v && typeof v === 'object' && 'low' in v) return (v as { low: number }).low
  return null
}

/** Safely extract a string array property from a Neo4j node */
function strArray(props: Record<string, unknown>, key: string): string[] {
  const v = props[key]
  return Array.isArray(v) ? v.filter((item): item is string => typeof item === 'string') : []
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

/** Convert a Neo4j Node to a Person */
export function toPerson(node: Node): Person {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    role_es: strOrNull(p, 'role_es') ?? undefined,
    role_en: strOrNull(p, 'role_en') ?? undefined,
    description_es: strOrNull(p, 'description_es') ?? undefined,
    description_en: strOrNull(p, 'description_en') ?? undefined,
    party: strOrNull(p, 'party') ?? undefined,
    datasets: numOrNull(p, 'datasets') ?? undefined,
    status_es: strOrNull(p, 'status_es') ?? undefined,
    status_en: strOrNull(p, 'status_en') ?? undefined,
  }
}

/** Convert a Neo4j Node to an Organization */
export function toOrganization(node: Node): Organization {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    org_type: (strOrNull(p, 'org_type') as OrgType) ?? undefined,
    description_es: strOrNull(p, 'description_es') ?? undefined,
    description_en: strOrNull(p, 'description_en') ?? undefined,
    country: strOrNull(p, 'country') ?? undefined,
  }
}

/** Convert a Neo4j Node to an FPEvent */
export function toEvent(node: Node): FPEvent {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title_es: str(p, 'title_es'),
    title_en: strOrNull(p, 'title_en') ?? undefined,
    description_es: strOrNull(p, 'description_es') ?? undefined,
    description_en: strOrNull(p, 'description_en') ?? undefined,
    date: str(p, 'date'),
    category: str(p, 'category', 'political') as InvestigationCategory,
    sources: strArray(p, 'sources').length > 0 ? strArray(p, 'sources') : undefined,
  }
}

/** Convert a Neo4j Node to a MoneyFlow */
export function toMoneyFlow(node: Node): MoneyFlow {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    from_label: str(p, 'from_label'),
    to_label: str(p, 'to_label'),
    amount_ars: numOrNull(p, 'amount_ars') ?? 0,
    description_es: strOrNull(p, 'description_es') ?? undefined,
    description_en: strOrNull(p, 'description_en') ?? undefined,
    date: str(p, 'date'),
    source: strOrNull(p, 'source') ?? undefined,
    source_url: strOrNull(p, 'source_url') ?? undefined,
  }
}

/** Convert a Neo4j Node to a Claim */
export function toClaim(node: Node): Claim {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    claim_es: str(p, 'claim_es'),
    claim_en: strOrNull(p, 'claim_en') ?? undefined,
    status: str(p, 'status', 'unconfirmed') as FactcheckStatus,
    tier: numOrNull(p, 'tier') ?? 1,
    source: strOrNull(p, 'source') ?? undefined,
    source_url: strOrNull(p, 'source_url') ?? undefined,
    detail_es: strOrNull(p, 'detail_es') ?? undefined,
    detail_en: strOrNull(p, 'detail_en') ?? undefined,
  }
}
