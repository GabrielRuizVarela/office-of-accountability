/**
 * Caso Finanzas Politicas transform utilities.
 *
 * Maps raw Neo4j property bags to typed domain objects.
 * All functions are pure and immutable.
 */

import type {
  FinPolPerson,
  FinPolEvent,
  FinPolDocument,
  FinPolOrganization,
  FinPolMoneyFlow,
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

export function toPerson(props: Record<string, unknown>): FinPolPerson {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    role_es: asOptionalString(props.role_es),
    role_en: asOptionalString(props.role_en),
    description_es: asOptionalString(props.description_es),
    description_en: asOptionalString(props.description_en),
    party: asOptionalString(props.party),
    nationality: asOptionalString(props.nationality),
    datasets: asOptionalNumber(props.datasets),
  }
}

export function toEvent(props: Record<string, unknown>): FinPolEvent {
  return {
    id: asString(props.id),
    title_es: asString(props.title_es),
    title_en: asOptionalString(props.title_en),
    date: asString(props.date),
    description_es: asOptionalString(props.description_es),
    description_en: asOptionalString(props.description_en),
    category: (asString(props.category) || 'political') as EventType,
    sources: Array.isArray(props.sources)
      ? props.sources.filter((s): s is string => typeof s === 'string')
      : undefined,
  }
}

export function toDocument(props: Record<string, unknown>): FinPolDocument {
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

export function toOrganization(props: Record<string, unknown>): FinPolOrganization {
  return {
    id: asString(props.id),
    name: asString(props.name),
    slug: asString(props.slug),
    org_type: asOptionalString(props.org_type),
    description: asOptionalString(props.description),
    country: asOptionalString(props.country),
    datasets: Array.isArray(props.datasets)
      ? props.datasets.filter((s): s is string => typeof s === 'string')
      : undefined,
  }
}

export function toMoneyFlow(props: Record<string, unknown>): FinPolMoneyFlow {
  const amountRaw = props.amount_ars
  let amount_ars = 0
  if (typeof amountRaw === 'number') {
    amount_ars = amountRaw
  } else if (amountRaw && typeof amountRaw === 'object' && 'toNumber' in amountRaw) {
    amount_ars = (amountRaw as { toNumber: () => number }).toNumber()
  }

  return {
    id: asString(props.id),
    from_label: asString(props.from_label),
    to_label: asString(props.to_label),
    amount_ars,
    description_es: asOptionalString(props.description_es),
    description_en: asOptionalString(props.description_en),
    date: asOptionalString(props.date),
    source: asOptionalString(props.source),
    source_url: asOptionalString(props.source_url),
  }
}
