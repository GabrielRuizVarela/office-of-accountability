/**
 * Obras-publicas graph API — returns a focused investigative subgraph
 * with node names and types as top-level fields for react-force-graph-2d.
 */

import neo4j, { type Node, type Relationship } from 'neo4j-driver-lite'

import { getDriver } from '@/lib/neo4j/client'

function nodeId(n: Node): string {
  const p = n.properties
  if (typeof p.id === 'string' && p.id) return p.id
  if (typeof p.contractor_id === 'string' && p.contractor_id) return p.contractor_id
  if (typeof p.case_id === 'string' && p.case_id) return p.case_id
  if (typeof p.intermediary_id === 'string' && p.intermediary_id) return p.intermediary_id
  if (typeof p.work_id === 'string' && p.work_id) return p.work_id
  if (typeof p.procedure_id === 'string' && p.procedure_id) return p.procedure_id
  if (typeof p.contract_id === 'string' && p.contract_id) return p.contract_id
  return n.elementId
}

function nodeName(n: Node): string {
  const p = n.properties
  return (typeof p.name === 'string' && p.name) ||
    (typeof p.full_name === 'string' && p.full_name) ||
    (typeof p.nombre === 'string' && p.nombre) ||
    n.labels[0] || '?'
}

export async function GET() {
  const session = getDriver().session()

  try {
    // Get investigative core + their immediate neighbors for a connected graph
    const nodeResult = await session.run(
      `// All nodes in the obras-publicas case
       MATCH (n)
       WHERE n.caso_slug = 'obras-publicas'
       RETURN DISTINCT n`,
      {},
      { timeout: 30_000 },
    )

    // Build node map with elementId -> appId lookup
    const elementToApp = new Map<string, string>()
    const nodeMap = new Map<string, any>()

    for (const r of nodeResult.records) {
      const n = r.get('n') as Node
      const id = nodeId(n)
      elementToApp.set(n.elementId, id)
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          name: nodeName(n),
          type: n.labels[0] || 'Unknown',
          labels: [...n.labels],
          val: 1,
        })
      }
    }

    // Get ALL relationships between our collected nodes (any direction)
    const nodeElementIds = [...elementToApp.keys()]
    const relResult = await session.run(
      `MATCH (a)-[r]-(b)
       WHERE elementId(a) IN $ids AND elementId(b) IN $ids
         AND elementId(a) <> elementId(b)
       RETURN r, elementId(startNode(r)) AS startEid, elementId(endNode(r)) AS endEid`,
      { ids: nodeElementIds },
      { timeout: 30_000 },
    )

    const links: any[] = []
    const seenLinks = new Set<string>()

    for (const r of relResult.records) {
      const rel = r.get('r') as Relationship
      const startEid = r.get('startEid') as string
      const endEid = r.get('endEid') as string
      const sourceId = elementToApp.get(startEid)
      const targetId = elementToApp.get(endEid)
      if (!sourceId || !targetId) continue
      const key = `${sourceId}:${targetId}:${rel.type}`
      if (seenLinks.has(key)) continue
      seenLinks.add(key)
      links.push({ source: sourceId, target: targetId, type: rel.type })
    }

    const nodes = [...nodeMap.values()]

    return Response.json({
      success: true,
      data: { nodes, links },
      meta: { nodeCount: nodes.length, linkCount: links.length },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes('connect') || message.includes('ECONNREFUSED')) {
      return Response.json({ success: false, error: 'Database unavailable' }, { status: 503 })
    }
    console.error('Graph API error:', message)
    return Response.json({ success: false, error: 'Failed to load graph' }, { status: 500 })
  } finally {
    await session.close()
  }
}
