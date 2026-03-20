/**
 * Caso Finanzas Politicas transform utilities.
 *
 * Maps generic InvestigationNode property bags to typed domain objects.
 * All functions are pure and immutable.
 */

import type { InvestigationNode } from '../investigations/types'
import type {
  FinanzasPerson,
  FinanzasEvent,
  FinanzasMoneyFlow,
  FinanzasClaim,
  FinanzasOrganization,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}

function asSources(
  value: unknown,
): ReadonlyArray<{ readonly name: string; readonly url: string }> {
  if (!Array.isArray(value)) return []
  return value
    .filter(
      (item): item is { name: unknown; url: unknown } =>
        item !== null && typeof item === 'object',
    )
    .map((item) => ({
      name: asString(item.name),
      url: asString(item.url),
    }))
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

export function toPerson(node: InvestigationNode): FinanzasPerson {
  const p = node.properties
  return {
    id: asString(p.id) || node.id,
    name: asString(p.name),
    slug: asString(p.slug) || node.slug,
    role_es: asString(p.role_es),
    role_en: asString(p.role_en),
    description_es: asString(p.description_es),
    description_en: asString(p.description_en),
    party: asString(p.party),
    datasets: asNumber(p.datasets),
  }
}

export function toEvent(node: InvestigationNode): FinanzasEvent {
  const p = node.properties
  return {
    id: asString(p.id) || node.id,
    date: asString(p.date),
    title_es: asString(p.title_es),
    title_en: asString(p.title_en),
    description_es: asString(p.description_es),
    description_en: asString(p.description_en),
    category: asString(p.category),
    sources: asSources(p.sources),
  }
}

export function toMoneyFlow(node: InvestigationNode): FinanzasMoneyFlow {
  const p = node.properties
  return {
    id: asString(p.id) || node.id,
    from_label: asString(p.from_label),
    to_label: asString(p.to_label),
    amount_ars: asString(p.amount_ars),
    description_es: asString(p.description_es),
    description_en: asString(p.description_en),
    date: asString(p.date),
    source: asString(p.source),
    source_url: asString(p.source_url),
  }
}

export function toClaim(node: InvestigationNode): FinanzasClaim {
  const p = node.properties
  return {
    id: asString(p.id) || node.id,
    claim_es: asString(p.claim_es),
    claim_en: asString(p.claim_en),
    status: asString(p.status),
    tier: asNumber(p.tier),
    source: asString(p.source),
    source_url: asString(p.source_url),
    detail_es: asString(p.detail_es),
    detail_en: asString(p.detail_en),
  }
}

export function toOrganization(node: InvestigationNode): FinanzasOrganization {
  const p = node.properties
  return {
    id: asString(p.id) || node.id,
    name: asString(p.name),
    slug: asString(p.slug) || node.slug,
    type: asString(p.type),
    jurisdiction: asString(p.jurisdiction),
    incorporation_date: asString(p.incorporation_date),
  }
}
