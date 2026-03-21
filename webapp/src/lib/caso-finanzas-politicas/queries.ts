/**
 * Caso Finanzas Politicas query functions.
 *
 * Delegates generic queries (graph, timeline, stats, nodes-by-type) to the
 * shared investigation query builder. Domain-specific queries for Claims,
 * MoneyFlows, and ShellCompanies are implemented here.
 *
 * All queries use parameterized Cypher — no string interpolation.
 */

import { type Node, type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'
import { getQueryBuilder } from '../investigations/query-builder'
import type { GraphData, InvestigationNode, TimelineItem, InvestigationStats } from '../investigations/types'

import { CASO_FINPOL_SLUG, type FinPolClaim, type FinPolMoneyFlow, type FinPolShellCompany } from './types'
import { toClaim, toMoneyFlow, toShellCompany } from './transform'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUERY_TIMEOUT_MS = 15_000
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Delegated to query builder (generic operations)
// ---------------------------------------------------------------------------

const qb = getQueryBuilder()

export function getGraph(): Promise<GraphData> {
  return qb.getGraph(CASO_FINPOL_SLUG)
}

export function getTimeline(): Promise<TimelineItem[]> {
  return qb.getTimeline(CASO_FINPOL_SLUG)
}

export function getStats(): Promise<InvestigationStats> {
  return qb.getStats(CASO_FINPOL_SLUG)
}

export function getActors(): Promise<InvestigationNode[]> {
  return qb.getNodesByType(CASO_FINPOL_SLUG, 'Person')
}

export function getPersonBySlug(slug: string): Promise<InvestigationNode | null> {
  return qb.getNodeBySlug(CASO_FINPOL_SLUG, 'Person', slug)
}

export function getPersonConnections(nodeId: string): Promise<GraphData> {
  return qb.getNodeConnections(CASO_FINPOL_SLUG, nodeId)
}

export function getOrganizations(): Promise<InvestigationNode[]> {
  return qb.getNodesByType(CASO_FINPOL_SLUG, 'Organization')
}

export function getEvents(): Promise<InvestigationNode[]> {
  return qb.getNodesByType(CASO_FINPOL_SLUG, 'Event')
}

// ---------------------------------------------------------------------------
// Domain-specific: Claims
// ---------------------------------------------------------------------------

/**
 * Fetch all Claim nodes, ordered by tier (most severe first).
 */
export async function getClaims(): Promise<FinPolClaim[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (c:Claim)
       WHERE c.caso_slug = $casoSlug
       RETURN c
       ORDER BY c.tier ASC, c.status ASC`,
      { casoSlug: CASO_FINPOL_SLUG },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => {
      const node = r.get('c') as Node
      return toClaim(node.properties as Record<string, unknown>)
    })
  } finally {
    await session.close()
  }
}

/**
 * Fetch a single Claim by id with its connected persons and organizations.
 */
export async function getClaimById(claimId: string): Promise<{
  claim: FinPolClaim
  subjects: InvestigationNode[]
} | null> {
  const session = getDriver().session()

  try {
    const claimResult = await session.run(
      `MATCH (c:Claim {id: $claimId, caso_slug: $casoSlug})
       RETURN c
       LIMIT 1`,
      { claimId, casoSlug: CASO_FINPOL_SLUG },
      TX_CONFIG,
    )

    if (claimResult.records.length === 0) return null

    const claimNode = claimResult.records[0].get('c') as Node
    const claim = toClaim(claimNode.properties as Record<string, unknown>)

    // Get subjects (persons/orgs linked to this claim)
    const subjectsResult = await session.run(
      `MATCH (c:Claim {id: $claimId, caso_slug: $casoSlug})<-[:SUBJECT_OF]-(n)
       WHERE n.caso_slug = $casoSlug
       RETURN n
       ORDER BY n.name ASC`,
      { claimId, casoSlug: CASO_FINPOL_SLUG },
      TX_CONFIG,
    )

    const subjects = subjectsResult.records.map((r: Neo4jRecord) => {
      const node = r.get('n') as Node
      return {
        id: typeof node.properties.id === 'string' ? node.properties.id : node.elementId,
        label: node.labels[0] ?? 'Unknown',
        caso_slug: CASO_FINPOL_SLUG,
        properties: node.properties as Record<string, unknown>,
        name: typeof node.properties.name === 'string' ? node.properties.name : undefined,
        slug: typeof node.properties.slug === 'string' ? node.properties.slug : undefined,
      } satisfies InvestigationNode
    })

    return { claim, subjects }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Domain-specific: Money Flows
// ---------------------------------------------------------------------------

/**
 * Fetch all MoneyFlow nodes, ordered by date descending.
 */
export async function getMoneyFlows(): Promise<FinPolMoneyFlow[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (mf:MoneyFlow)
       WHERE mf.caso_slug = $casoSlug
       RETURN mf
       ORDER BY mf.date DESC`,
      { casoSlug: CASO_FINPOL_SLUG },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => {
      const node = r.get('mf') as Node
      return toMoneyFlow(node.properties as Record<string, unknown>)
    })
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Domain-specific: Shell Companies
// ---------------------------------------------------------------------------

/**
 * Fetch all ShellCompany nodes with their linked persons.
 */
export async function getShellCompanies(): Promise<FinPolShellCompany[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (sc:ShellCompany)
       WHERE sc.caso_slug = $casoSlug
       RETURN sc
       ORDER BY sc.name ASC`,
      { casoSlug: CASO_FINPOL_SLUG },
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => {
      const node = r.get('sc') as Node
      return toShellCompany(node.properties as Record<string, unknown>)
    })
  } finally {
    await session.close()
  }
}

/**
 * Fetch the full investigation graph. Delegates to query builder.
 * Use this for the money flow / connections visualization.
 */
export function getMoneyFlowGraph(): Promise<GraphData> {
  return qb.getGraph(CASO_FINPOL_SLUG)
}
