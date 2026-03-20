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
 * Bridge queries — connect politician clusters through shared attributes.
 */

// Politicians in same coalition who both have 3+ datasets
const COALITION_BRIDGE = `
MATCH (p1:Politician)-[r1:MAYBE_SAME_AS]->(t1)
WITH p1, collect(DISTINCT labels(t1)[0]) AS ds1
WHERE size(ds1) >= 3
MATCH (p2:Politician)-[r2:MAYBE_SAME_AS]->(t2)
WITH p1, ds1, p2, collect(DISTINCT labels(t2)[0]) AS ds2
WHERE size(ds2) >= 3 AND p1.id < p2.id AND p1.coalition = p2.coalition AND p1.coalition IS NOT NULL
RETURN p1.id AS pid1, p2.id AS pid2, p1.coalition AS bridge, "SAME_COALITION" AS bridgeType
LIMIT 40
`

// Politicians connected through PENSAR ARGENTINA or shared organizations
const ORG_BRIDGE = `
MATCH (p1:Politician)-[:AFFILIATED_WITH]->(org)<-[:AFFILIATED_WITH]-(p2:Politician)
WHERE p1.id < p2.id
RETURN p1.id AS pid1, p2.id AS pid2, org.name AS bridge, "SHARED_ORG" AS bridgeType
LIMIT 20
`

// Politicians who both have offshore connections
const OFFSHORE_BRIDGE = `
MATCH (p1:Politician)-[:MAYBE_SAME_AS]->(o1:OffshoreOfficer)
MATCH (p2:Politician)-[:MAYBE_SAME_AS]->(o2:OffshoreOfficer)
WHERE p1.id < p2.id
RETURN p1.id AS pid1, p2.id AS pid2, "Offshore Network" AS bridge, "BOTH_OFFSHORE" AS bridgeType
`

// Politicians from same province with 3+ datasets
const PROVINCE_BRIDGE = `
MATCH (p1:Politician)-[r1:MAYBE_SAME_AS]->(t1)
WITH p1, collect(DISTINCT labels(t1)[0]) AS ds1
WHERE size(ds1) >= 4
MATCH (p2:Politician)-[r2:MAYBE_SAME_AS]->(t2)
WITH p1, ds1, p2, collect(DISTINCT labels(t2)[0]) AS ds2
WHERE size(ds2) >= 4 AND p1.id < p2.id AND p1.province = p2.province AND p1.province IS NOT NULL
RETURN p1.id AS pid1, p2.id AS pid2, p1.province AS bridge, "SAME_PROVINCE" AS bridgeType
LIMIT 20
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

    // Phase 2: Run all bridge queries to connect politician clusters
    const bridgeQueries = [COALITION_BRIDGE, ORG_BRIDGE, OFFSHORE_BRIDGE, PROVINCE_BRIDGE]
    const bridgeColors: Record<string, string> = {
      SAME_COALITION: '#f59e0b', // amber
      SHARED_ORG: '#10b981', // emerald
      BOTH_OFFSHORE: '#ef4444', // red
      SAME_PROVINCE: '#6366f1', // indigo
    }

    for (const query of bridgeQueries) {
      try {
        const bridges = await readQuery(
          query,
          {},
          (record: Neo4jRecord) => ({
            pid1: record.get('pid1') as string,
            pid2: record.get('pid2') as string,
            bridge: record.get('bridge') as string,
            bridgeType: record.get('bridgeType') as string,
          }),
        )

        for (const bridge of bridges.records) {
          const p1Id = politicianElementIds.get(bridge.pid1)
          const p2Id = politicianElementIds.get(bridge.pid2)
          if (!p1Id || !p2Id) continue

          // Direct politician-to-politician link through a bridge node
          const bridgeNodeId = `bridge-${bridge.bridgeType}-${bridge.bridge}`
          if (!nodeMap.has(bridgeNodeId)) {
            nodeMap.set(bridgeNodeId, {
              id: bridgeNodeId,
              name: bridge.bridge,
              type: bridge.bridgeType,
              color: bridgeColors[bridge.bridgeType] ?? '#94a3b8',
              datasets: 0,
              val: 4,
              labels: [bridge.bridgeType],
              properties: { bridgeType: bridge.bridgeType },
            })
          } else {
            nodeMap.get(bridgeNodeId)!.val += 1
          }

          links.push({
            source: p1Id,
            target: bridgeNodeId,
            type: bridge.bridgeType,
            properties: {},
          })
          links.push({
            source: p2Id,
            target: bridgeNodeId,
            type: bridge.bridgeType,
            properties: {},
          })
        }
      } catch {
        // Individual bridge query may timeout — continue with others
      }
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
