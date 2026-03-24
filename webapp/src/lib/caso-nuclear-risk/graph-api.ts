/**
 * Nuclear Risk graph API — queries Neo4j and transforms into GraphData format.
 */

import { getDriver } from '../neo4j/client'
import neo4j from 'neo4j-driver-lite'
import type { GraphData, GraphNode, GraphLink } from '../neo4j/types'

const LABEL_COLORS: Record<string, string> = {
  NuclearSignal: '#eab308',
  NuclearActor: '#ef4444',
  WeaponSystem: '#f97316',
  Treaty: '#3b82f6',
  NuclearFacility: '#10b981',
  RiskBriefing: '#a855f7',
  SignalSource: '#6b7280',
}

function nodeFromRecord(record: Record<string, unknown>, label: string): GraphNode {
  const props = { ...record } as Record<string, unknown>
  const id = String(props.id ?? props.name ?? '')

  return {
    id: `${label}:${id}`,
    labels: [label],
    properties: { ...props, _color: LABEL_COLORS[label] ?? '#6b7280' },
  }
}

function makeLink(source: string, target: string, type: string): GraphLink {
  return { source, target, type, properties: {} }
}

/**
 * Fetch the nuclear risk investigation graph from Neo4j.
 */
export async function getNuclearRiskGraph(
  tiers?: ('gold' | 'silver' | 'bronze')[],
): Promise<GraphData> {
  const driver = getDriver()
  const session = driver.session({ defaultAccessMode: 'READ' })

  try {
    const tierClause = tiers && tiers.length > 0
      ? `AND s.tier IN $tiers`
      : ''

    const result = await session.run(
      `// Get signals and all their relationships
       MATCH (s:NuclearSignal)
       WHERE s.severity IS NOT NULL ${tierClause}
       WITH s ORDER BY s.severity DESC LIMIT $limit
       OPTIONAL MATCH (s)-[r1:INVOLVES]->(a:NuclearActor)
       OPTIONAL MATCH (s)-[r2:REFERENCES_TREATY]->(t:Treaty)
       OPTIONAL MATCH (s)-[r3:LOCATED_AT]->(f:NuclearFacility)
       OPTIONAL MATCH (s)-[r4:ESCALATES]->(s2:NuclearSignal)
       RETURN s, collect(DISTINCT a) AS actors, collect(DISTINCT t) AS treaties,
              collect(DISTINCT f) AS facilities, collect(DISTINCT s2) AS escalated_to`,
      {
        limit: neo4j.int(200),
        ...(tiers ? { tiers } : {}),
      },
    )

    const nodes = new Map<string, GraphNode>()
    const links: GraphLink[] = []

    // Also add actors with their weapons and treaties
    const actorResult = await session.run(
      `MATCH (a:NuclearActor)
       OPTIONAL MATCH (a)-[:POSSESSES]->(w:WeaponSystem)
       OPTIONAL MATCH (a)-[:PARTY_TO]->(t:Treaty)
       OPTIONAL MATCH (a)-[:OPERATES]->(f:NuclearFacility)
       RETURN a, collect(DISTINCT w) AS weapons, collect(DISTINCT t) AS treaties,
              collect(DISTINCT f) AS facilities`,
    )

    // Process actors + their connections
    for (const record of actorResult.records) {
      const actorProps = record.get('a').properties
      const actorNode = nodeFromRecord(actorProps, 'NuclearActor')
      nodes.set(actorNode.id, actorNode)

      for (const w of record.get('weapons')) {
        const wNode = nodeFromRecord(w.properties, 'WeaponSystem')
        nodes.set(wNode.id, wNode)
        links.push(makeLink(actorNode.id, wNode.id, 'POSSESSES'))
      }
      for (const t of record.get('treaties')) {
        const tNode = nodeFromRecord(t.properties, 'Treaty')
        nodes.set(tNode.id, tNode)
        links.push(makeLink(actorNode.id, tNode.id, 'PARTY_TO'))
      }
      for (const f of record.get('facilities')) {
        const fNode = nodeFromRecord(f.properties, 'NuclearFacility')
        nodes.set(fNode.id, fNode)
        links.push(makeLink(actorNode.id, fNode.id, 'OPERATES'))
      }
    }

    // Process signals + their connections
    for (const record of result.records) {
      const signalProps = record.get('s').properties
      const signalNode = nodeFromRecord(signalProps, 'NuclearSignal')
      nodes.set(signalNode.id, signalNode)

      for (const a of record.get('actors')) {
        if (!a) continue
        const actorNode = nodeFromRecord(a.properties, 'NuclearActor')
        nodes.set(actorNode.id, actorNode)
        links.push(makeLink(signalNode.id, actorNode.id, 'INVOLVES'))
      }
      for (const t of record.get('treaties')) {
        if (!t) continue
        const tNode = nodeFromRecord(t.properties, 'Treaty')
        nodes.set(tNode.id, tNode)
        links.push(makeLink(signalNode.id, tNode.id, 'REFERENCES_TREATY'))
      }
      for (const f of record.get('facilities')) {
        if (!f) continue
        const fNode = nodeFromRecord(f.properties, 'NuclearFacility')
        nodes.set(fNode.id, fNode)
        links.push(makeLink(signalNode.id, fNode.id, 'LOCATED_AT'))
      }
      for (const s2 of record.get('escalated_to')) {
        if (!s2) continue
        const s2Node = nodeFromRecord(s2.properties, 'NuclearSignal')
        nodes.set(s2Node.id, s2Node)
        links.push(makeLink(signalNode.id, s2Node.id, 'ESCALATES'))
      }
    }

    // Deduplicate links
    const linkKeys = new Set<string>()
    const dedupedLinks = links.filter((l) => {
      const key = `${l.source}-${l.type}-${l.target}`
      if (linkKeys.has(key)) return false
      linkKeys.add(key)
      return true
    })

    return {
      nodes: Array.from(nodes.values()),
      links: dedupedLinks,
    }
  } finally {
    await session.close()
  }
}
