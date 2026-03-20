/**
 * GET /api/caso/finanzas-politicas/graph
 *
 * Returns a focused subgraph of the most-connected politicians in the
 * Argentine political finance investigation. Queries Neo4j for politicians
 * appearing in 3+ datasets and their cross-dataset connections.
 *
 * Response: { nodes, links } compatible with react-force-graph-2d.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

/** Color mapping by node type */
const NODE_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6', // blue-500
  OffshoreOfficer: '#ef4444', // red-500
  OffshoreEntity: '#ef4444', // red-500
  Donor: '#22c55e', // green-500
  GovernmentAppointment: '#f97316', // orange-500
  CompanyOfficer: '#a855f7', // purple-500
  BoardMember: '#a855f7', // purple-500
  AssetDeclaration: '#6b7280', // gray-500
}

const DEFAULT_COLOR = '#94a3b8' // slate-400

interface ApiNode {
  id: string
  name: string
  type: string
  color: string
  datasets: number
  val: number
  labels: string[]
  properties: Record<string, unknown>
}

interface ApiLink {
  source: string
  target: string
  type: string
  properties: Record<string, unknown>
}

/**
 * The query finds politicians connected to 3+ distinct dataset types via
 * MAYBE_SAME_AS relationships. It collects the connected entities and
 * returns a small, focused subgraph (max ~50 politicians with their targets).
 */
/**
 * Two-phase query:
 * 1. Get top politicians (3+ datasets) with their direct connections
 * 2. Find shared companies/entities that BRIDGE politicians together
 *
 * This creates a connected graph instead of isolated star clusters.
 */
const CYPHER = `
// Phase 1: Get investigation-relevant politicians
MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(t)
WITH p, collect(DISTINCT labels(t)[0]) AS datasets
WHERE size(datasets) >= 3
WITH p, datasets
ORDER BY size(datasets) DESC
LIMIT 30

// Phase 2: Get their connections (limited per politician to avoid explosion)
MATCH (p)-[r:MAYBE_SAME_AS]->(t)
WHERE t:OffshoreOfficer OR t:Donor OR t:GovernmentAppointment
  OR (t:BoardMember AND r.confidence >= 0.7)
  OR (t:CompanyOfficer AND r.confidence >= 0.7)
WITH p, datasets,
     collect({
       id: toString(elementId(t)),
       type: labels(t)[0],
       name: COALESCE(t.name, t.official_name, t.donor_name, "desconocido"),
       props: {confidence: r.confidence, match_method: r.match_method}
     })[..8] AS targets,
     collect({
       relId: toString(elementId(r)),
       targetId: toString(elementId(t)),
       relType: type(r),
       relProps: {confidence: r.confidence}
     })[..8] AS rels
RETURN p, datasets, targets, rels
`

/**
 * Second query: find shared companies that bridge politicians.
 * This creates links BETWEEN politician clusters.
 */
const BRIDGE_CYPHER = `
MATCH (p1:Politician)-[:MAYBE_SAME_AS]->(b1:BoardMember)-[:BOARD_MEMBER_OF]->(c:Company)<-[:BOARD_MEMBER_OF]-(b2:BoardMember)<-[:MAYBE_SAME_AS]-(p2:Politician)
WHERE p1.id < p2.id
WITH p1, p2, c, collect(DISTINCT labels(c)[0])[0] AS companyType
RETURN p1.id AS pid1, p1.name AS pname1,
       p2.id AS pid2, p2.name AS pname2,
       c.name AS company, toString(elementId(c)) AS companyId
LIMIT 30
`

interface RawRow {
  politician: {
    id: string
    name: string
    labels: string[]
    properties: Record<string, unknown>
    datasets: string[]
  }
  targets: Array<{
    id: string
    type: string
    name: string
    props: Record<string, unknown>
  }>
  rels: Array<{
    relId: string
    targetId: string
    relType: string
    relProps: Record<string, unknown>
  }>
}

function transformRecord(record: Neo4jRecord): RawRow {
  const pNode = record.get('p')
  const datasets: string[] = record.get('datasets')
  const targets = record.get('targets') as RawRow['targets']
  const rels = record.get('rels') as RawRow['rels']

  return {
    politician: {
      id: pNode.elementId ?? String(pNode.identity),
      name:
        pNode.properties.name ??
        pNode.properties.full_name ??
        pNode.properties.official_name ??
        'desconocido',
      labels: Array.from(pNode.labels),
      properties: { ...pNode.properties },
      datasets,
    },
    targets,
    rels,
  }
}

export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  try {
    // Phase 1: Politician star patterns
    const result = await readQuery(CYPHER, {}, transformRecord)

    const nodeMap = new Map<string, ApiNode>()
    const links: ApiLink[] = []
    const politicianElementIds = new Map<string, string>() // slug → elementId

    for (const row of result.records) {
      const p = row.politician

      if (!nodeMap.has(p.id)) {
        nodeMap.set(p.id, {
          id: p.id,
          name: p.name,
          type: 'Politician',
          color: NODE_COLORS.Politician,
          datasets: p.datasets.length,
          val: p.datasets.length * 2,
          labels: p.labels,
          properties: { ...p.properties, datasets: p.datasets },
        })
        // Map slug to elementId for bridge matching
        if (p.properties.id) {
          politicianElementIds.set(p.properties.id as string, p.id)
        }
      }

      for (let i = 0; i < row.targets.length; i++) {
        const t = row.targets[i]
        const rel = row.rels[i]

        if (!nodeMap.has(t.id)) {
          nodeMap.set(t.id, {
            id: t.id,
            name: t.name,
            type: t.type,
            color: NODE_COLORS[t.type] ?? DEFAULT_COLOR,
            datasets: 1,
            val: 2,
            labels: [t.type],
            properties: t.props,
          })
        } else {
          const existing = nodeMap.get(t.id)!
          existing.val += 1
        }

        links.push({
          source: p.id,
          target: t.id,
          type: rel.relType,
          properties: rel.relProps,
        })
      }
    }

    // Phase 2: Bridges between politicians via shared companies
    try {
      const bridges = await readQuery(
        BRIDGE_CYPHER,
        {},
        (record: Neo4jRecord) => ({
          pid1: record.get('pid1') as string,
          pname1: record.get('pname1') as string,
          pid2: record.get('pid2') as string,
          pname2: record.get('pname2') as string,
          company: record.get('company') as string,
          companyId: record.get('companyId') as string,
        }),
      )

      for (const bridge of bridges.records) {
        const p1Id = politicianElementIds.get(bridge.pid1)
        const p2Id = politicianElementIds.get(bridge.pid2)
        if (!p1Id || !p2Id) continue

        // Add company node as bridge
        const companyNodeId = `company-${bridge.companyId}`
        if (!nodeMap.has(companyNodeId)) {
          nodeMap.set(companyNodeId, {
            id: companyNodeId,
            name: bridge.company,
            type: 'Company',
            color: '#10b981', // emerald
            datasets: 0,
            val: 3,
            labels: ['Company'],
            properties: {},
          })
        }

        // Link both politicians to the shared company
        links.push({
          source: p1Id,
          target: companyNodeId,
          type: 'SHARES_BOARD',
          properties: {},
        })
        links.push({
          source: p2Id,
          target: companyNodeId,
          type: 'SHARES_BOARD',
          properties: {},
        })
      }
    } catch {
      // Bridge query may timeout on large graphs — degrade gracefully
    }

    const nodes = Array.from(nodeMap.values())

    return Response.json({
      success: true,
      data: { nodes, links },
      meta: {
        nodeCount: nodes.length,
        linkCount: links.length,
        politicianCount: nodes.filter((n) => n.type === 'Politician').length,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message

      const isTimeout =
        msg.includes('transaction has been terminated') ||
        msg.includes('Transaction timed out') ||
        msg.includes('TransactionTimedOut')

      if (isTimeout) {
        return Response.json(
          { success: false, error: 'Query timed out' },
          { status: 504 },
        )
      }

      const isConnectionError =
        msg.includes('connect') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('ServiceUnavailable') ||
        msg.includes('SessionExpired')

      if (isConnectionError) {
        return Response.json(
          { success: false, error: 'Database unavailable' },
          { status: 503 },
        )
      }
    }

    throw error
  }
}
