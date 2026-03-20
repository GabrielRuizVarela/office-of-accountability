/**
 * Caso Finanzas Politicas queries — typed wrappers around the generic query builder.
 *
 * Each function delegates to the shared query builder and transforms results
 * into domain-specific types.
 */

import * as queryBuilder from '../investigations/query-builder'
import type { GraphData } from '../neo4j/types'
import type { InvestigationStats, TimelineItem } from '../investigations/types'

import { toPerson, toEvent, toMoneyFlow, toClaim, toOrganization } from './transform'
import type {
  FinanzasPerson,
  FinanzasEvent,
  FinanzasMoneyFlow,
  FinanzasClaim,
  FinanzasOrganization,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLUG = 'caso-finanzas-politicas'

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Fetch a person by slug.
 */
export async function getPersonBySlug(slug: string): Promise<FinanzasPerson | null> {
  const node = await queryBuilder.getNodeBySlug(SLUG, 'Person', slug)
  return node ? toPerson(node) : null
}

/**
 * Fetch timeline events ordered by date.
 */
export async function getTimeline(): Promise<TimelineItem[]> {
  return queryBuilder.getTimeline(SLUG)
}

/**
 * Fetch all actors (persons) in the investigation.
 */
export async function getActors(): Promise<FinanzasPerson[]> {
  const nodes = await queryBuilder.getNodesByType(SLUG, 'Person', { orderBy: 'name' })
  return nodes.map(toPerson)
}

/**
 * Fetch all factcheck claims.
 */
export async function getClaims(): Promise<FinanzasClaim[]> {
  const nodes = await queryBuilder.getNodesByType(SLUG, 'Claim', { orderBy: 'id' })
  return nodes.map(toClaim)
}

/**
 * Fetch all money flows.
 */
export async function getMoneyFlows(): Promise<FinanzasMoneyFlow[]> {
  const nodes = await queryBuilder.getNodesByType(SLUG, 'MoneyFlow', { orderBy: 'date' })
  return nodes.map(toMoneyFlow)
}

/**
 * Fetch all organizations.
 */
export async function getOrganizations(): Promise<FinanzasOrganization[]> {
  const nodes = await queryBuilder.getNodesByType(SLUG, 'Organization', { orderBy: 'name' })
  return nodes.map(toOrganization)
}

/**
 * Fetch all events.
 */
export async function getEvents(): Promise<FinanzasEvent[]> {
  const nodes = await queryBuilder.getNodesByType(SLUG, 'Event', { orderBy: 'date' })
  return nodes.map(toEvent)
}

/**
 * Fetch aggregate stats for the investigation.
 */
export async function getStats(): Promise<InvestigationStats> {
  return queryBuilder.getStats(SLUG)
}

/**
 * Fetch the full knowledge graph for the investigation.
 */
export async function getGraph(): Promise<GraphData> {
  return queryBuilder.getGraph(SLUG)
}
