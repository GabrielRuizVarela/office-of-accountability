/**
 * GET /api/caso/adorni/graph
 *
 * Returns the Adorni investigation subgraph for the conexiones visualization.
 * Queries Neo4j for all caso-adorni entities and their relationships.
 *
 * Response: { nodes, links } compatible with react-force-graph-2d.
 */

import type { Record as Neo4jRecord } from 'neo4j-driver-lite'

import { readQuery } from '@/lib/neo4j/client'

export const dynamic = 'force-dynamic'

/** Color mapping by node type */
const NODE_COLORS: Readonly<Record<string, string>> = {
  Person: '#3b82f6',
  Organization: '#f97316',
  Company: '#a855f7',
  MediaOutlet: '#ec4899',
  Contractor: '#22c55e',
  GovernmentAppointment: '#f97316',
  OffshoreEntity: '#ef4444',
  Donor: '#22c55e',
  Statement: '#6b7280',
  LegalCase: '#ef4444',
  Video: '#06b6d4',
}

const DEFAULT_COLOR = '#94a3b8'

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
 * Two-pass query to avoid O(n^2) cartesian products:
 * Pass 1: Get all caso-adorni nodes
 * Pass 2: Get relationships between them
 */
const NODES_CYPHER = `
  MATCH (n)
  WHERE n.caso_slug = 'caso-adorni'
  RETURN n, labels(n) AS lbls, toString(elementId(n)) AS eid
  LIMIT 500
`

const RELS_CYPHER = `
  MATCH (a)-[r]->(b)
  WHERE a.caso_slug = 'caso-adorni' AND b.caso_slug = 'caso-adorni'
  RETURN toString(elementId(a)) AS source,
         toString(elementId(b)) AS target,
         type(r) AS relType,
         properties(r) AS relProps
  LIMIT 2000
`

/** Cross-investigation relationships (entities shared with other cases) */
const CROSS_REL_CYPHER = `
  MATCH (a {caso_slug: 'caso-adorni'})-[r:SAME_ENTITY|MAYBE_SAME_AS]->(b)
  WHERE b.caso_slug <> 'caso-adorni'
  RETURN toString(elementId(a)) AS source,
         toString(elementId(b)) AS target,
         type(r) AS relType,
         properties(r) AS relProps,
         b.name AS targetName,
         labels(b) AS targetLabels,
         b.caso_slug AS targetCase
  LIMIT 200
`

interface NodeRow {
  n: { properties: Record<string, unknown> }
  lbls: string[]
  eid: string
}

interface RelRow {
  source: string
  target: string
  relType: string
  relProps: Record<string, unknown>
}

interface CrossRow extends RelRow {
  targetName: string
  targetLabels: string[]
  targetCase: string
}

function transformNode(record: Neo4jRecord): NodeRow {
  return {
    n: record.get('n'),
    lbls: record.get('lbls'),
    eid: record.get('eid'),
  }
}

function transformRel(record: Neo4jRecord): RelRow {
  return {
    source: record.get('source'),
    target: record.get('target'),
    relType: record.get('relType'),
    relProps: record.get('relProps') ?? {},
  }
}

function transformCross(record: Neo4jRecord): CrossRow {
  return {
    source: record.get('source'),
    target: record.get('target'),
    relType: record.get('relType'),
    relProps: record.get('relProps') ?? {},
    targetName: record.get('targetName'),
    targetLabels: record.get('targetLabels'),
    targetCase: record.get('targetCase'),
  }
}

export async function GET() {
  try {
    const [nodeResult, relResult, crossResult] = await Promise.all([
      readQuery(NODES_CYPHER, {}, transformNode),
      readQuery(RELS_CYPHER, {}, transformRel),
      readQuery(CROSS_REL_CYPHER, {}, transformCross).catch(() => ({
        records: [] as CrossRow[],
        summary: { counters: {}, resultAvailableAfter: 0 },
      })),
    ])

    const nodeMap = new Map<string, ApiNode>()

    for (const row of nodeResult.records) {
      const props = row.n.properties
      const primaryType = row.lbls[0] ?? 'Unknown'

      nodeMap.set(row.eid, {
        id: row.eid,
        name: String(props.name ?? props.claim_es ?? props.title ?? row.eid),
        type: primaryType,
        color: NODE_COLORS[primaryType] ?? DEFAULT_COLOR,
        datasets: 1,
        val: 3,
        labels: row.lbls,
        properties: props,
      })
    }

    const links: ApiLink[] = []

    for (const row of relResult.records) {
      if (nodeMap.has(row.source) && nodeMap.has(row.target)) {
        links.push({
          source: row.source,
          target: row.target,
          type: row.relType,
          properties: row.relProps,
        })
      }
    }

    // Add cross-investigation nodes and links
    for (const row of crossResult.records) {
      if (!nodeMap.has(row.target)) {
        const primaryType = row.targetLabels[0] ?? 'Unknown'
        nodeMap.set(row.target, {
          id: row.target,
          name: row.targetName,
          type: primaryType,
          color: NODE_COLORS[primaryType] ?? DEFAULT_COLOR,
          datasets: 1,
          val: 2,
          labels: row.targetLabels,
          properties: { caso_slug: row.targetCase },
        })
      }
      links.push({
        source: row.source,
        target: row.target,
        type: row.relType,
        properties: row.relProps,
      })
    }

    const nodes = Array.from(nodeMap.values())

    return Response.json({
      success: true,
      data: { nodes, links },
      meta: {
        nodeCount: nodes.length,
        linkCount: links.length,
        personCount: nodes.filter((n) => n.type === 'Person').length,
      },
    })
  } catch (error) {
    console.error('[adorni/graph] Error:', error)
    return Response.json(
      {
        success: false,
        data: { nodes: [], links: [] },
        meta: { nodeCount: 0, linkCount: 0, personCount: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
