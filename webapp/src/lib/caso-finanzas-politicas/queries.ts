/**
 * Caso Finanzas Politicas — query functions.
 *
 * Delegates to the generic InvestigationQueryBuilder for all standard queries.
 * Case-specific queries (money flows, claims) are thin wrappers around
 * getNodesByType with the appropriate label.
 */

import { getQueryBuilder } from '../investigations/query-builder'
import type {
  GraphData,
  InvestigationNode,
  InvestigationStats,
  PaginationOpts,
  TimelineItem,
} from '../investigations/types'
import { CASO_FP_SLUG } from './types'

// ---------------------------------------------------------------------------
// Re-export slug-bound standard queries
// ---------------------------------------------------------------------------

const qb = () => getQueryBuilder()

export async function getGraph(): Promise<GraphData> {
  return qb().getGraph(CASO_FP_SLUG)
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return qb().getTimeline(CASO_FP_SLUG)
}

export async function getStats(): Promise<InvestigationStats> {
  return qb().getStats(CASO_FP_SLUG)
}

export async function getNodesByType(
  nodeType: string,
  opts?: PaginationOpts,
): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, nodeType, opts)
}

export async function getNodeBySlug(
  nodeType: string,
  slug: string,
): Promise<InvestigationNode | null> {
  return qb().getNodeBySlug(CASO_FP_SLUG, nodeType, slug)
}

export async function getNodeConnections(
  nodeId: string,
  depth?: number,
): Promise<GraphData> {
  return qb().getNodeConnections(CASO_FP_SLUG, nodeId, depth)
}

// ---------------------------------------------------------------------------
// Case-specific convenience queries
// ---------------------------------------------------------------------------

export async function getActors(opts?: PaginationOpts): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, 'Person', opts)
}

export async function getClaims(opts?: PaginationOpts): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, 'Claim', opts)
}

export async function getMoneyFlows(opts?: PaginationOpts): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, 'MoneyFlow', opts)
}

export async function getShellCompanies(opts?: PaginationOpts): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, 'ShellCompany', opts)
}

export async function getGovernmentActions(opts?: PaginationOpts): Promise<InvestigationNode[]> {
  return qb().getNodesByType(CASO_FP_SLUG, 'GovernmentAction', opts)
}
