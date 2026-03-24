/**
 * Obras-publicas graph API — returns a focused investigative subgraph
 * (not the full 125K nodes, which would crash the browser).
 *
 * Returns: BriberyCases, Politicians, Intermediaries, top Contractors
 * (by contract count), and their relationships.
 */

import { type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '@/lib/neo4j/client'
import { transformNode, transformRelationship } from '@/lib/graph/transform'
import type { GraphData } from '@/lib/neo4j/types'

function buildGraphData(nodes: Node[], rels: Relationship[]): GraphData {
  const nodeMap = new Map<string, ReturnType<typeof transformNode>>()
  for (const n of nodes) {
    const transformed = transformNode(n)
    nodeMap.set(n.elementId, transformed)
  }

  const links = rels
    .filter((r) => nodeMap.has(r.startNodeElementId) && nodeMap.has(r.endNodeElementId))
    .map((r) => transformRelationship(r))

  return { nodes: [...nodeMap.values()], links }
}

export async function GET() {
  const session = getDriver().session()

  try {
    // Focused subgraph: investigative entities + top connected contractors
    const nodeResult = await session.run(
      `// Core investigative entities
       MATCH (n)
       WHERE n.caso_slug = 'obras-publicas'
         AND (n:BriberyCase OR n:Politician OR n:Intermediary OR n:Document)
       WITH collect(n) AS core

       // Top contractors by relationship count (limit 80)
       MATCH (c:Contractor)
       WHERE c.caso_slug = 'obras-publicas'
         AND (c.verification_status IS NOT NULL OR c.finding_status IS NOT NULL OR c.risk_score > 0)
       WITH core, collect(c) AS verified ORDER BY size(verified) DESC

       // Also grab contractors with bribery links
       OPTIONAL MATCH (bc:BriberyCase)-[:CASE_INVOLVES]->(bc_c:Contractor)
       WITH core, verified, collect(DISTINCT bc_c) AS bribery_contractors

       // Top contractors by contract count
       MATCH (top:Contractor)<-[:AWARDED_TO]-(pc:PublicContract)
       WHERE top.caso_slug = 'obras-publicas'
       WITH core, verified, bribery_contractors, top, count(pc) AS contracts
       ORDER BY contracts DESC LIMIT 50
       WITH core, verified, bribery_contractors, collect(top) AS top_contractors

       // Merge all into one list
       WITH core + verified + bribery_contractors + top_contractors AS all_nodes
       UNWIND all_nodes AS n
       RETURN DISTINCT n`,
      {},
      { timeout: 30_000 },
    )

    if (nodeResult.records.length === 0) {
      return Response.json({ success: true, data: { nodes: [], links: [] } })
    }

    const nodes = nodeResult.records.map((r) => r.get('n') as Node)
    const nodeElementIds = new Set(nodes.map((n) => n.elementId))

    // Find relationships between these nodes
    const relResult = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE a.caso_slug = 'obras-publicas'
         AND (a:BriberyCase OR a:Politician OR a:Intermediary OR a:Contractor OR a:Document)
         AND (b:BriberyCase OR b:Politician OR b:Intermediary OR b:Contractor OR b:PublicWork OR b:Document)
       RETURN r`,
      {},
      { timeout: 30_000 },
    )

    const rels = relResult.records
      .map((r) => r.get('r') as Relationship)
      .filter(
        (r) =>
          nodeElementIds.has(r.startNodeElementId) &&
          nodeElementIds.has(r.endNodeElementId),
      )

    const data = buildGraphData(nodes, rels)
    return Response.json({
      success: true,
      data,
      meta: {
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
        note: 'Focused investigative subgraph (not full 125K nodes)',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('connect') || message.includes('ECONNREFUSED')) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    return Response.json({ success: false, error: 'Failed to load graph data' }, { status: 500 })
  } finally {
    await session.close()
  }
}
