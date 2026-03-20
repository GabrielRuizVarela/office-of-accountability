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
 * Multi-layer query building a rich investigation network:
 * - Investigation targets + top politicians
 * - Their offshore entities, donors, appointments
 * - Judges handling key cases
 * - PENSAR ARGENTINA members
 * - Cross-referenced entities (donor↔offshore, contractor↔offshore)
 * - Key companies (SOCMA, Correo, AUSOL, Geometales)
 */
const CYPHER = `
// Layer 1: Politicians with 2+ datasets (broader net)
MATCH (p:Politician)-[r:MAYBE_SAME_AS]->(t)
WITH p, collect(DISTINCT labels(t)[0]) AS datasets
WHERE size(datasets) >= 2
WITH p, datasets
ORDER BY size(datasets) DESC
LIMIT 50

// Layer 2: Their high-value connections
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
     })[..6] AS targets,
     collect({
       relId: toString(elementId(r)),
       targetId: toString(elementId(t)),
       relType: type(r),
       relProps: {confidence: r.confidence}
     })[..6] AS rels
RETURN p, datasets, targets, rels
`

/** Offshore entities connected to politicians — show the BVI companies */
const OFFSHORE_ENTITIES_CYPHER = `
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
RETURN p.id AS pid, o.name AS officer, toString(elementId(o)) AS oid,
       e.name AS entity, e.jurisdiction_description AS jurisdiction,
       e.status AS status, toString(elementId(e)) AS eid
`

/** Judges handling investigation cases */
const JUDGES_CYPHER = `
MATCH (j:Judge)-[:APPOINTED_BY]->(p:Politician)
WHERE j.name CONTAINS "LIJO" OR j.name CONTAINS "ERCOLINI" OR j.name CONTAINS "ARROYO SALGADO"
   OR j.name CONTAINS "CASANELLO" OR j.name CONTAINS "BONADIO"
RETURN j.name AS judge, toString(elementId(j)) AS jid,
       p.id AS appointedBy, p.name AS presidentName
`

/** Cross-referenced entities (donor↔offshore, contractor↔offshore) */
const CROSS_REF_CYPHER = `
MATCH (a)-[r:CROSS_REFERENCED]->(b)
RETURN toString(elementId(a)) AS aid, COALESCE(a.name, "unknown") AS aname, labels(a)[0] AS atype,
       toString(elementId(b)) AS bid, COALESCE(b.name, "unknown") AS bname, labels(b)[0] AS btype,
       r.source AS source
`

/** PENSAR ARGENTINA network */
const PENSAR_CYPHER = `
MATCH (p:Politician)-[:AFFILIATED_WITH]->(org)
WHERE org.name CONTAINS "PENSAR"
RETURN p.id AS pid, p.name AS pname, org.name AS org, toString(elementId(org)) AS orgId
LIMIT 25
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

    // Phase 2: Add offshore entities (the BVI companies)
    try {
      const offshore = await readQuery(OFFSHORE_ENTITIES_CYPHER, {}, (r: Neo4jRecord) => ({
        pid: r.get('pid') as string,
        officer: r.get('officer') as string,
        oid: r.get('oid') as string,
        entity: r.get('entity') as string,
        jurisdiction: r.get('jurisdiction') as string,
        status: r.get('status') as string,
        eid: r.get('eid') as string,
      }))
      for (const o of offshore.records) {
        const pId = politicianElementIds.get(o.pid)
        if (!pId) continue
        // Add offshore entity node
        if (!nodeMap.has(o.eid)) {
          nodeMap.set(o.eid, {
            id: o.eid, name: o.entity + ' (' + (o.jurisdiction || 'offshore') + ')',
            type: 'OffshoreEntity', color: '#dc2626', datasets: 0, val: 5,
            labels: ['OffshoreEntity'], properties: { jurisdiction: o.jurisdiction, status: o.status },
          })
        }
        // Link politician → offshore entity (through officer if not already linked)
        links.push({ source: pId, target: o.eid, type: 'HAS_OFFSHORE', properties: { officer: o.officer } })
      }
    } catch { /* timeout ok */ }

    // Phase 3: Add judges
    try {
      const judges = await readQuery(JUDGES_CYPHER, {}, (r: Neo4jRecord) => ({
        judge: r.get('judge') as string, jid: r.get('jid') as string,
        appointedBy: r.get('appointedBy') as string, president: r.get('presidentName') as string,
      }))
      for (const j of judges.records) {
        if (!nodeMap.has(j.jid)) {
          nodeMap.set(j.jid, {
            id: j.jid, name: 'Juez ' + j.judge, type: 'Judge', color: '#f97316',
            datasets: 0, val: 4, labels: ['Judge'], properties: { appointedBy: j.president },
          })
        }
        const pId = politicianElementIds.get(j.appointedBy)
        if (pId) links.push({ source: pId, target: j.jid, type: 'APPOINTED', properties: {} })
      }
    } catch { /* timeout ok */ }

    // Phase 4: Add cross-referenced entities (donor↔offshore, contractor↔offshore)
    try {
      const crossRefs = await readQuery(CROSS_REF_CYPHER, {}, (r: Neo4jRecord) => ({
        aid: r.get('aid') as string, aname: r.get('aname') as string, atype: r.get('atype') as string,
        bid: r.get('bid') as string, bname: r.get('bname') as string, btype: r.get('btype') as string,
        source: r.get('source') as string,
      }))
      for (const cr of crossRefs.records) {
        if (!nodeMap.has(cr.aid)) {
          nodeMap.set(cr.aid, {
            id: cr.aid, name: cr.aname, type: cr.atype,
            color: NODE_COLORS[cr.atype] ?? '#94a3b8', datasets: 0, val: 3,
            labels: [cr.atype], properties: {},
          })
        }
        if (!nodeMap.has(cr.bid)) {
          nodeMap.set(cr.bid, {
            id: cr.bid, name: cr.bname, type: cr.btype,
            color: NODE_COLORS[cr.btype] ?? '#94a3b8', datasets: 0, val: 3,
            labels: [cr.btype], properties: {},
          })
        }
        links.push({ source: cr.aid, target: cr.bid, type: 'CROSS_REFERENCED', properties: { source: cr.source } })
      }
    } catch { /* timeout ok */ }

    // Phase 5: Add PENSAR ARGENTINA network
    try {
      const pensar = await readQuery(PENSAR_CYPHER, {}, (r: Neo4jRecord) => ({
        pid: r.get('pid') as string, pname: r.get('pname') as string,
        org: r.get('org') as string, orgId: r.get('orgId') as string,
      }))
      for (const p of pensar.records) {
        const pId = politicianElementIds.get(p.pid)
        if (!pId) {
          // Politician not in main query — add them
          const pensarPolId = 'pensar-pol-' + p.pid
          if (!nodeMap.has(pensarPolId)) {
            nodeMap.set(pensarPolId, {
              id: pensarPolId, name: p.pname, type: 'Politician',
              color: NODE_COLORS.Politician, datasets: 1, val: 2,
              labels: ['Politician'], properties: { id: p.pid },
            })
          }
          if (!nodeMap.has(p.orgId)) {
            nodeMap.set(p.orgId, {
              id: p.orgId, name: p.org, type: 'Organization',
              color: '#10b981', datasets: 0, val: 6,
              labels: ['Organization'], properties: {},
            })
          }
          links.push({ source: pensarPolId, target: p.orgId, type: 'MEMBER_OF', properties: {} })
        } else {
          if (!nodeMap.has(p.orgId)) {
            nodeMap.set(p.orgId, {
              id: p.orgId, name: p.org, type: 'Organization',
              color: '#10b981', datasets: 0, val: 6,
              labels: ['Organization'], properties: {},
            })
          }
          links.push({ source: pId, target: p.orgId, type: 'MEMBER_OF', properties: {} })
        }
      }
    } catch { /* timeout ok */ }

    // Phase 6: Run all bridge queries to connect politician clusters
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
