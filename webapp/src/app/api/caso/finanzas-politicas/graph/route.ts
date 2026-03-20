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
/**
 * Investigation-focused query. Returns ONLY high-signal connections:
 * - Politicians with offshore entities (red thread)
 * - Politicians who are donors (money thread)
 * - Politicians with government appointments (revolving door)
 * - NO generic BoardMember/CompanyOfficer matches (these are noise in the viz)
 */
const CYPHER = `
// Get politicians who are donors, have offshore, or have appointments
MATCH (p:Politician)
WHERE (p)-[:IS_DONOR]->() OR (p)-[:HAS_OFFSHORE_LINK]->() OR (p)-[:HAS_APPOINTMENT]->() OR (p)-[:AFFILIATED_WITH]->()
WITH p,
     EXISTS { (p)-[:IS_DONOR]->() } AS isDonor,
     EXISTS { (p)-[:HAS_APPOINTMENT]->() } AS isAppointee,
     EXISTS { (p)-[:AFFILIATED_WITH]->() } AS isAffiliated,
     EXISTS { (p)-[:HAS_OFFSHORE_LINK]->() } AS hasOffshore
WITH p,
     [] AS targets,
     [] AS rels,
     [x IN [
       CASE WHEN isDonor THEN "Donor" END,
       CASE WHEN isAppointee THEN "Appointment" END,
       CASE WHEN isAffiliated THEN "Organization" END,
       CASE WHEN hasOffshore THEN "Offshore" END
     ] WHERE x IS NOT NULL] AS datasets
RETURN p, datasets, targets, rels
ORDER BY size(datasets) DESC
LIMIT 80
`

/** Offshore entities — skip the OffshoreOfficer node (same person as Politician), connect politician directly to entity */
const OFFSHORE_ENTITIES_CYPHER = `
MATCH (p:Politician)-[:HAS_OFFSHORE_LINK]->(o:OffshoreOfficer)-[:OFFICER_OF]->(e:OffshoreEntity)
RETURN p.id AS pid, p.name AS pname,
       e.name AS entity, e.jurisdiction_description AS jurisdiction,
       e.status AS status, toString(elementId(e)) AS eid,
       o.source_investigation AS leak
`

/** Judges appointed by politicians in the graph */
const JUDGES_CYPHER = `
MATCH (j:Judge)-[:APPOINTED_BY]->(p:Politician)
WHERE j.name CONTAINS "LIJO" OR j.name CONTAINS "ERCOLINI" OR j.name CONTAINS "ARROYO SALGADO"
   OR j.name CONTAINS "CASANELLO" OR j.name CONTAINS "BONADIO" OR j.name CONTAINS "SERVINI"
RETURN j.name AS judge, toString(elementId(j)) AS jid,
       p.id AS appointedBy, p.name AS presidentName
`

/** Top party switchers — politicians who changed parties 3+ times */
const SWITCHERS_CYPHER = `
MATCH (p:Politician)-[:SERVED_TERM]->(t:Term)-[:TERM_PARTY]->(party:Party)
WITH p, collect(DISTINCT party) AS parties
WHERE size(parties) >= 3
UNWIND parties AS party
RETURN p.id AS pid, p.name AS pname, toString(elementId(party)) AS partyId, party.name AS partyName
ORDER BY size(parties) DESC
LIMIT 100
`

/** Key legislation — show which politicians voted on it */
const LEGISLATION_CONFLICTS_CYPHER = `
MATCH (p:Politician)-[:CAST_VOTE]->(v:LegislativeVote)-[:VOTE_ON]->(l:Legislation)
WHERE l.name IN ['Ley Bases', 'Presupuesto', 'Impuesto a las Ganancias', 'Reforma Laboral', 'Ley de Medios', 'Codigo Penal']
WITH l, p, count(v) AS votes
ORDER BY votes DESC
WITH l, collect({pid: p.id, pname: p.name, votes: votes})[..8] AS topVoters
RETURN toString(elementId(l)) AS lid, l.name AS lname, COALESCE(l.sector, '') AS sector, topVoters
`

// Cross-referenced entities removed from viz — they create duplicate identity nodes
// The underlying data (donor↔offshore, contractor↔offshore) is in the DB but
// showing "Manuel Torino" (Donor) linked to "MANUEL TORINO" (Offshore) as two
// nodes is confusing. The connection is noted in the investigation narrative instead.

/** PENSAR ARGENTINA + affiliated orgs — include politicians who are IS_DONOR or HAS_APPOINTMENT to bridge clusters */
const PENSAR_CYPHER = `
MATCH (p:Politician)-[:AFFILIATED_WITH]->(org)
OPTIONAL MATCH (p)-[:IS_DONOR]->(:Donor)-[:DONATED_TO]->(pf:PoliticalPartyFinance)
RETURN p.id AS pid, p.name AS pname, org.name AS org, toString(elementId(org)) AS orgId,
       COALESCE(pf.name, "") AS partyDonated
LIMIT 30
`

/** Politician-donors: show politician directly donating to party (merge identity) */
const POLITICIAN_DONORS_CYPHER = `
MATCH (p:Politician)-[:IS_DONOR]->(d:Donor)-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
WHERE dt.amount > 0
RETURN p.id AS pid, p.name AS pname,
       toString(elementId(pf)) AS pfid, COALESCE(pf.name, pf.party_name, "partido") AS pfname,
       dt.amount AS amount
ORDER BY dt.amount DESC
`

/** Top corporate/non-politician donors by amount */
const TOP_DONORS_CYPHER = `
MATCH (d:Donor)-[dt:DONATED_TO]->(pf:PoliticalPartyFinance)
WHERE dt.amount > 1000000 AND NOT (d)<-[:IS_DONOR]-(:Politician)
WITH d, pf, dt.amount AS amount
RETURN toString(elementId(d)) AS did, d.name AS dname,
       toString(elementId(pf)) AS pfid, COALESCE(pf.name, pf.party_name, "partido") AS pfname,
       amount
ORDER BY amount DESC
LIMIT 15
`

/** Key investigation companies — only show if connected to a politician in the graph */
const KEY_COMPANIES_CYPHER = `
MATCH (p:Politician)-[:MAYBE_SAME_AS]->(b:BoardMember)-[:BOARD_MEMBER_OF]->(c:Company)
WHERE c.name IN ["SOCMA AMERICANA", "CORREO ARGENTINO", "AUTOPISTAS DEL SOL",
  "MINERA GEOMETALES", "BELLOTA", "LCG", "LCG INVERSORA"]
WITH c, collect(DISTINCT {pid: p.id, pname: p.name}) AS politicians
WHERE size(politicians) > 0
RETURN toString(elementId(c)) AS cid, c.name AS cname, politicians
`

/** Legislation sectors with most conflicts */
const LEGISLATION_CYPHER = `
MATCH (l:Legislation)
WHERE l.sector IN ["finance", "energy", "mining"]
WITH l.sector AS sector, count(l) AS cnt
RETURN sector, cnt
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
MATCH (p1:Politician)-[:HAS_OFFSHORE_LINK]->(o1:OffshoreOfficer)
MATCH (p2:Politician)-[:HAS_OFFSHORE_LINK]->(o2:OffshoreOfficer)
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
        '',
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

    // Phase 2: Add offshore entities — politician directly to entity (no officer node)
    try {
      const offshore = await readQuery(OFFSHORE_ENTITIES_CYPHER, {}, (r: Neo4jRecord) => ({
        pid: r.get('pid') as string, pname: r.get('pname') as string,
        entity: r.get('entity') as string, jurisdiction: r.get('jurisdiction') as string,
        status: r.get('status') as string, eid: r.get('eid') as string,
        leak: r.get('leak') as string,
      }))
      for (const o of offshore.records) {
        const pId = politicianElementIds.get(o.pid)
        if (!pId) continue
        // Mark politician as having offshore
        const polNode = nodeMap.get(pId)
        if (polNode) polNode.properties.hasOffshore = true
        // Add offshore entity node
        if (!nodeMap.has(o.eid)) {
          nodeMap.set(o.eid, {
            id: o.eid, name: o.entity + ' (' + (o.jurisdiction || 'offshore') + ')',
            type: 'OffshoreEntity', color: '#dc2626', datasets: 0, val: 6,
            labels: ['OffshoreEntity'], properties: { jurisdiction: o.jurisdiction, status: o.status, leak: o.leak },
          })
        }
        links.push({ source: pId, target: o.eid, type: 'OFFSHORE_ENTITY', properties: { leak: o.leak } })
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

    // Phase 4a: Party switchers — show politicians who changed parties with their party nodes
    try {
      const switchers = await readQuery(SWITCHERS_CYPHER, {}, (r: Neo4jRecord) => ({
        pid: r.get('pid') as string, pname: r.get('pname') as string,
        partyId: r.get('partyId') as string, partyName: r.get('partyName') as string,
      }))
      for (const s of switchers.records) {
        let pId = politicianElementIds.get(s.pid)
        if (!pId) {
          // Add the politician
          pId = 'switcher-' + s.pid
          if (!nodeMap.has(pId)) {
            nodeMap.set(pId, {
              id: pId, name: s.pname, type: 'Politician', color: NODE_COLORS.Politician,
              datasets: 1, val: 3, labels: ['Politician'], properties: { id: s.pid },
            })
            politicianElementIds.set(s.pid, pId)
          }
        }
        if (!nodeMap.has(s.partyId)) {
          nodeMap.set(s.partyId, {
            id: s.partyId, name: s.partyName, type: 'Party', color: '#8b5cf6',
            datasets: 0, val: 3, labels: ['Party'], properties: {},
          })
        }
        links.push({ source: pId, target: s.partyId, type: 'MEMBER_OF', properties: {} })
      }
    } catch { /* timeout ok */ }

    // Phase 4b: Key legislation with top voters linked
    try {
      const laws = await readQuery(LEGISLATION_CONFLICTS_CYPHER, {}, (r: Neo4jRecord) => ({
        lid: r.get('lid') as string, lname: r.get('lname') as string,
        sector: r.get('sector') as string,
        topVoters: r.get('topVoters') as Array<{ pid: string; pname: string; votes: number }>,
      }))
      // Group legislation by name (e.g., multiple "Presupuesto" per year → one node)
      const lawByName = new Map<string, string>()
      for (const l of laws.records) {
        let lawNodeId = lawByName.get(l.lname)
        if (!lawNodeId) {
          lawNodeId = 'law-' + l.lname.toLowerCase().replace(/\s+/g, '-')
          lawByName.set(l.lname, lawNodeId)
          nodeMap.set(lawNodeId, {
            id: lawNodeId, name: l.lname, type: 'Legislation',
            color: '#f43f5e',
            datasets: 0, val: 6,
            labels: ['Legislation'], properties: { sector: l.sector },
          })
        }
        for (const voter of l.topVoters) {
          const pId = politicianElementIds.get(voter.pid)
          if (pId) {
            // Avoid duplicate links
            const linkKey = pId + '->' + lawNodeId
            if (!links.some(lk => (typeof lk.source === 'string' ? lk.source : '') + '->' + (typeof lk.target === 'string' ? lk.target : '') === linkKey)) {
              links.push({ source: pId, target: lawNodeId!, type: 'VOTED_ON', properties: {} })
            }
          }
        }
      }
    } catch { /* timeout ok */ }

    // Phase 4: Cross-referenced entities removed — they create duplicate identity nodes

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

    // Phase 5b: Politician-donors — show politician donating directly to party (merged identity)
    try {
      const polDonors = await readQuery(POLITICIAN_DONORS_CYPHER, {}, (r: Neo4jRecord) => ({
        pid: r.get('pid') as string, pname: r.get('pname') as string,
        pfid: r.get('pfid') as string, pfname: r.get('pfname') as string,
        amount: r.get('amount') as number,
      }))
      for (const pd of polDonors.records) {
        const pId = politicianElementIds.get(pd.pid)
        if (!pId) continue
        // Mark politician as donor
        const polNode = nodeMap.get(pId)
        if (polNode) polNode.properties.isDonor = true
        // Add party node
        if (!nodeMap.has(pd.pfid)) {
          nodeMap.set(pd.pfid, {
            id: pd.pfid, name: pd.pfname, type: 'PoliticalParty', color: '#f59e0b',
            datasets: 0, val: 5, labels: ['PoliticalPartyFinance'], properties: {},
          })
        }
        links.push({ source: pId, target: pd.pfid, type: 'DONATED_TO', properties: { amount: pd.amount } })
      }
    } catch { /* timeout ok */ }

    // Phase 6: Top corporate/non-politician donors (big money nodes)
    try {
      const donors = await readQuery(TOP_DONORS_CYPHER, {}, (r: Neo4jRecord) => ({
        did: r.get('did') as string, dname: r.get('dname') as string,
        pfid: r.get('pfid') as string, pfname: r.get('pfname') as string,
        amount: r.get('amount') as number,
      }))
      for (const d of donors.records) {
        if (!nodeMap.has(d.did)) {
          nodeMap.set(d.did, {
            id: d.did, name: d.dname, type: 'Donor', color: '#22c55e',
            datasets: 0, val: Math.min(Math.log10(d.amount || 1), 6),
            labels: ['Donor'], properties: { amount: d.amount },
          })
        }
        if (!nodeMap.has(d.pfid)) {
          nodeMap.set(d.pfid, {
            id: d.pfid, name: d.pfname, type: 'PoliticalParty', color: '#f59e0b',
            datasets: 0, val: 5, labels: ['PoliticalPartyFinance'], properties: {},
          })
        }
        links.push({ source: d.did, target: d.pfid, type: 'DONATED_TO', properties: { amount: d.amount } })
      }
    } catch { /* timeout ok */ }

    // Phase 7: Key investigation companies
    try {
      const companies = await readQuery(KEY_COMPANIES_CYPHER, {}, (r: Neo4jRecord) => ({
        cid: r.get('cid') as string, cname: r.get('cname') as string,
        politicians: r.get('politicians') as Array<{ pid: string | null; pname: string | null }>,
      }))
      for (const c of companies.records) {
        if (!nodeMap.has(c.cid)) {
          nodeMap.set(c.cid, {
            id: c.cid, name: c.cname, type: 'Company', color: '#10b981',
            datasets: 0, val: 5, labels: ['Company'], properties: {},
          })
        }
        for (const pol of c.politicians) {
          if (!pol.pid) continue
          const pId = politicianElementIds.get(pol.pid)
          if (pId) {
            links.push({ source: pId, target: c.cid, type: 'ON_BOARD', properties: {} })
          }
        }
      }
    } catch { /* timeout ok */ }

    // Phase 8: Run all bridge queries to connect politician clusters
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

          // Check if a node with the same name already exists (e.g., PENSAR ARGENTINA from Phase 5)
          let bridgeNodeId: string | undefined
          for (const [id, node] of nodeMap.entries()) {
            if (node.name === bridge.bridge) {
              bridgeNodeId = id
              node.val += 1
              break
            }
          }

          if (!bridgeNodeId) {
            bridgeNodeId = `bridge-${bridge.bridgeType}-${bridge.bridge}`
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

    // Post-processing: connect key clusters manually where DB relationships are missing
    // Macri → PENSAR ARGENTINA (he's the party leader but not in AFFILIATED_WITH)
    const macriId = politicianElementIds.get('macri-mauricio')
    if (macriId) {
      for (const [id, node] of nodeMap) {
        if (node.name.includes('PENSAR')) {
          links.push({ source: macriId, target: id, type: 'LEADS', properties: {} })
          break
        }
      }
    }
    // Camaño → connect to any existing component via Consenso Federal donation
    const camanoId = politicianElementIds.get('camano-graciela')
    if (camanoId) {
      for (const [id, node] of nodeMap) {
        if (node.name.includes('CONSENSO FEDERAL')) {
          links.push({ source: camanoId, target: id, type: 'DONATED_TO', properties: {} })
          break
        }
      }
    }

    // Post-processing: remove small components (< 4 nodes) — they clutter the viz
    const adj = new Map<string, Set<string>>()
    for (const link of links) {
      const s = typeof link.source === 'string' ? link.source : (link.source as any)?.id
      const t = typeof link.target === 'string' ? link.target : (link.target as any)?.id
      if (!s || !t) continue
      if (!adj.has(s)) adj.set(s, new Set())
      if (!adj.has(t)) adj.set(t, new Set())
      adj.get(s)!.add(t)
      adj.get(t)!.add(s)
    }

    // BFS to find connected components
    const visited = new Set<string>()
    const keepIds = new Set<string>()
    for (const [nodeId] of nodeMap) {
      if (visited.has(nodeId)) continue
      const queue = [nodeId]
      const component = new Set<string>()
      while (queue.length > 0) {
        const n = queue.pop()!
        if (visited.has(n)) continue
        visited.add(n)
        component.add(n)
        for (const nb of adj.get(n) ?? []) {
          if (!visited.has(nb)) queue.push(nb)
        }
      }
      // Keep components with 3+ nodes
      if (component.size >= 3) {
        for (const id of component) keepIds.add(id)
      }
    }

    const nodes = Array.from(nodeMap.values()).filter((n) => keepIds.has(n.id))

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
