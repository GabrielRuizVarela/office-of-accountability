/**
 * Caso Finanzas Politicas query wrappers.
 *
 * Thin delegation layer over the generic query builder for standard queries.
 * Domain-specific queries (claims, money flows) use raw parameterized Cypher.
 */

import { type Node } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import { getQueryBuilder } from '../investigations/query-builder'
import type {
  GraphData,
  InvestigationNode,
  InvestigationStats,
  PaginationOpts,
  TimelineItem,
} from '../investigations/types'

import { CASO_FINANZAS_POLITICAS_SLUG } from './types'
import type { Claim, ClaimStatus, MoneyFlow } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }
const SLUG = CASO_FINANZAS_POLITICAS_SLUG

// ---------------------------------------------------------------------------
// Generic query builder delegates
// ---------------------------------------------------------------------------

export async function getGraph(): Promise<GraphData> {
  return getQueryBuilder().getGraph(SLUG)
}

export async function getTimeline(): Promise<TimelineItem[]> {
  return getQueryBuilder().getTimeline(SLUG)
}

export async function getStats(): Promise<InvestigationStats> {
  return getQueryBuilder().getStats(SLUG)
}

export async function getNodesByType(
  nodeType: string,
  opts?: PaginationOpts,
): Promise<InvestigationNode[]> {
  return getQueryBuilder().getNodesByType(SLUG, nodeType, opts)
}

export async function getNodeBySlug(
  nodeType: string,
  slug: string,
): Promise<InvestigationNode | null> {
  return getQueryBuilder().getNodeBySlug(SLUG, nodeType, slug)
}

export async function getNodeConnections(
  nodeId: string,
  depth?: number,
): Promise<GraphData> {
  return getQueryBuilder().getNodeConnections(SLUG, nodeId, depth)
}

// ---------------------------------------------------------------------------
// Domain-specific: Claims
// ---------------------------------------------------------------------------

/**
 * Fetch all Claim nodes for this investigation, optionally filtered by status.
 */
export async function getClaimsByStatus(status?: ClaimStatus): Promise<Claim[]> {
  const session = getDriver().session()
  try {
    const cypher = status
      ? `MATCH (c:Claim)
         WHERE c.caso_slug = $casoSlug AND c.status = $status
         RETURN c
         ORDER BY c.tier ASC, c.claim ASC`
      : `MATCH (c:Claim)
         WHERE c.caso_slug = $casoSlug
         RETURN c
         ORDER BY c.tier ASC, c.claim ASC`

    const params: Record<string, unknown> = { casoSlug: SLUG }
    if (status) params.status = status

    const result = await session.run(cypher, params, TX_CONFIG)

    return result.records.map((r) => {
      const props = (r.get('c') as Node).properties as Record<string, unknown>
      return {
        id: String(props.id ?? ''),
        claim: String(props.claim ?? ''),
        status: String(props.status ?? 'unconfirmed') as ClaimStatus,
        tier: toNumber(props.tier),
        source: String(props.source ?? ''),
        source_url: typeof props.source_url === 'string' ? props.source_url : undefined,
        detail: typeof props.detail === 'string' ? props.detail : undefined,
      } satisfies Claim
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Domain-specific: Money Flows
// ---------------------------------------------------------------------------

/**
 * Fetch all MoneyFlow nodes for this investigation, ordered by amount descending.
 */
export async function getMoneyFlows(): Promise<MoneyFlow[]> {
  const session = getDriver().session()
  try {
    const result = await session.run(
      `MATCH (m:MoneyFlow)
       WHERE m.caso_slug = $casoSlug
       RETURN m
       ORDER BY m.amount_ars DESC`,
      { casoSlug: SLUG },
      TX_CONFIG,
    )

    return result.records.map((r) => {
      const props = (r.get('m') as Node).properties as Record<string, unknown>
      return {
        id: String(props.id ?? ''),
        from_id: String(props.from_id ?? ''),
        to_id: String(props.to_id ?? ''),
        amount_ars: toNumber(props.amount_ars),
        description: typeof props.description === 'string' ? props.description : undefined,
        date: String(props.date ?? ''),
        source: typeof props.source === 'string' ? props.source : undefined,
        source_url: typeof props.source_url === 'string' ? props.source_url : undefined,
      } satisfies MoneyFlow
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber()
  }
  return 0
}
