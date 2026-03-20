import type { GraphData } from '../neo4j/types'

export function bfsShortestPath(graph: GraphData, sourceId: string, targetId: string): string[] | null {
  if (sourceId === targetId) return [sourceId]
  const adj = new Map<string, string[]>()
  for (const node of graph.nodes) adj.set(node.id, [])
  for (const link of graph.links) {
    const src = typeof link.source === 'string' ? link.source : (link.source as unknown as {id:string}).id
    const tgt = typeof link.target === 'string' ? link.target : (link.target as unknown as {id:string}).id
    adj.get(src)?.push(tgt)
    adj.get(tgt)?.push(src)
  }
  const visited = new Set<string>([sourceId])
  const parent = new Map<string, string>()
  const queue: string[] = [sourceId]
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const neighbor of (adj.get(current) ?? [])) {
      if (visited.has(neighbor)) continue
      visited.add(neighbor)
      parent.set(neighbor, current)
      if (neighbor === targetId) {
        const path: string[] = [targetId]
        let node = targetId
        while (parent.has(node)) { node = parent.get(node)!; path.unshift(node) }
        return path
      }
      queue.push(neighbor)
    }
  }
  return null
}

export function pathLinkKeys(graph: GraphData, pathNodeIds: string[]): Set<string> {
  const keys = new Set<string>()
  for (let i = 0; i < pathNodeIds.length - 1; i++) {
    const a = pathNodeIds[i], b = pathNodeIds[i + 1]
    for (const link of graph.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as unknown as {id:string}).id
      const tgt = typeof link.target === 'string' ? link.target : (link.target as unknown as {id:string}).id
      if ((src === a && tgt === b) || (src === b && tgt === a)) {
        keys.add(`${src}:${tgt}:${link.type}`)
        break
      }
    }
  }
  return keys
}
