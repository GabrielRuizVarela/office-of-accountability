/**
 * Caso Finanzas Politicas — transform utilities.
 *
 * Converts Neo4j query result nodes into typed FP domain objects.
 */

import type { Node } from 'neo4j-driver-lite'

import type {
  FPPerson,
  FPOrganization,
  FPShellCompany,
  FPEvent,
  FPClaim,
  FPMoneyFlow,
  FPGovernmentAction,
} from './types'

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

function str(props: Record<string, unknown>, key: string, fallback = ''): string {
  const v = props[key]
  return typeof v === 'string' ? v : fallback
}

function numOrNull(props: Record<string, unknown>, key: string): number | null {
  const v = props[key]
  if (typeof v === 'number') return v
  if (v && typeof v === 'object' && 'low' in v) return (v as { low: number }).low
  return null
}

function num(props: Record<string, unknown>, key: string, fallback = 0): number {
  return numOrNull(props, key) ?? fallback
}

// ---------------------------------------------------------------------------
// Transform functions
// ---------------------------------------------------------------------------

export function toPerson(node: Node): FPPerson {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    role: str(p, 'role'),
    description: str(p, 'description'),
    party: str(p, 'party'),
    datasets: num(p, 'datasets'),
    nationality: str(p, 'nationality'),
  }
}

export function toOrganization(node: Node): FPOrganization {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    org_type: str(p, 'org_type') as FPOrganization['org_type'],
    description: str(p, 'description'),
    country: str(p, 'country'),
  }
}

export function toShellCompany(node: Node): FPShellCompany {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    name: str(p, 'name'),
    slug: str(p, 'slug'),
    jurisdiction: str(p, 'jurisdiction'),
    incorporation_date: str(p, 'incorporation_date'),
    intermediary: str(p, 'intermediary'),
    status: str(p, 'status'),
  }
}

export function toEvent(node: Node): FPEvent {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    date: str(p, 'date'),
    event_type: str(p, 'event_type') as FPEvent['event_type'],
    description: str(p, 'description'),
  }
}

export function toClaim(node: Node): FPClaim {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    claim_es: str(p, 'claim_es'),
    claim_en: str(p, 'claim_en'),
    status: str(p, 'status') as FPClaim['status'],
    tier: num(p, 'tier', 1),
    source: str(p, 'source'),
    source_url: str(p, 'source_url'),
    detail_es: str(p, 'detail_es'),
    detail_en: str(p, 'detail_en'),
  }
}

export function toMoneyFlow(node: Node): FPMoneyFlow {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    from_label: str(p, 'from_label'),
    to_label: str(p, 'to_label'),
    amount_ars: num(p, 'amount_ars'),
    description: str(p, 'description'),
    date: str(p, 'date'),
    source: str(p, 'source'),
    source_url: str(p, 'source_url'),
  }
}

export function toGovernmentAction(node: Node): FPGovernmentAction {
  const p = node.properties as Record<string, unknown>
  return {
    id: str(p, 'id'),
    title: str(p, 'title'),
    slug: str(p, 'slug'),
    action_type: str(p, 'action_type') as FPGovernmentAction['action_type'],
    description: str(p, 'description'),
    date: str(p, 'date'),
    authority: str(p, 'authority'),
  }
}
