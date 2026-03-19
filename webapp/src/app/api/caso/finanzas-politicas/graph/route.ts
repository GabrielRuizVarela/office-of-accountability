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
const CYPHER = `
MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(t)
WITH p,
     collect(DISTINCT labels(t)[0]) AS datasets,
     collect({
       id: toString(elementId(t)),
       type: labels(t)[0],
       name: COALESCE(t.name, t.official_name, t.donor_name, t.entity_name, "desconocido"),
       props: properties(t)
     }) AS targets,
     collect({
       relId: toString(elementId(r)),
       targetId: toString(elementId(t)),
       relType: type(r),
       relProps: properties(r)
     }) AS rels
WHERE size(datasets) >= 3
RETURN p, datasets, targets, rels
ORDER BY size(datasets) DESC, size(targets) DESC
LIMIT 50
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
    const result = await readQuery(CYPHER, {}, transformRecord)

    const nodeMap = new Map<string, ApiNode>()
    const links: ApiLink[] = []

    for (const row of result.records) {
      const p = row.politician

      // Add politician node
      if (!nodeMap.has(p.id)) {
        nodeMap.set(p.id, {
          id: p.id,
          name: p.name,
          type: 'Politician',
          color: NODE_COLORS.Politician,
          datasets: p.datasets.length,
          val: p.datasets.length,
          labels: p.labels,
          properties: p.properties,
        })
      }

      // Add target nodes and links
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
          // Increment val for nodes with more connections
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
