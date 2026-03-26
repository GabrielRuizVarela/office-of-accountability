/**
 * Community detection algorithm - M10 Graph Algorithms (Phase 6).
 *
 * Queries Neo4j for edges within a caso_slug namespace, runs label
 * propagation in JS to detect communities, then creates hypothesis
 * Proposals for communities with 3+ members.
 *
 * Also exports a standalone detectCommunities() function for API routes.
 */

import neo4j from 'neo4j-driver-lite'

import type { AlgorithmKind } from './types'
import { readQuery } from '../../neo4j/client'
import { createProposal } from '../proposals'
import type { Algorithm, AlgorithmContext, AlgorithmResult } from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ITERATIONS = 10
const MIN_COMMUNITY_SIZE = 3

// ---------------------------------------------------------------------------
// Standalone data types
// ---------------------------------------------------------------------------

export interface Community {
  id: number
  members: Array<{ id: string; name: string; label: string }>
  size: number
}

// ---------------------------------------------------------------------------
// Standalone query function
// ---------------------------------------------------------------------------

/**
 * Detect communities in the graph using label propagation.
 *
 * Fetches up to 5000 nodes and 20000 edges, runs label propagation for
 * up to maxIterations, and returns communities with size > 1 sorted by
 * size descending.
 */
export async function detectCommunities(
  casoSlug: string,
  maxIterations = 20,
): Promise<Community[]> {
  // Fetch nodes
  const nodeResult = await readQuery<{ id: string; name: string; label: string }>(
    `MATCH (n {caso_slug: $casoSlug})
     WHERE n.id IS NOT NULL
     RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
     LIMIT $nodeLimit`,
    { casoSlug, nodeLimit: neo4j.int(5000) },
    (record) => ({
      id: record.get('id') as string,
      name: record.get('name') as string,
      label: record.get('label') as string,
    }),
  )

  const nodeMap = new Map<string, { name: string; label: string }>()
  for (const n of nodeResult.records) {
    nodeMap.set(n.id, { name: n.name, label: n.label })
  }

  if (nodeMap.size === 0) return []

  // Fetch edges
  const edgeResult = await readQuery<{ sourceId: string; targetId: string }>(
    `MATCH (a {caso_slug: $casoSlug})-[r]-(b {caso_slug: $casoSlug})
     WHERE a.id IS NOT NULL AND b.id IS NOT NULL AND id(a) < id(b)
     RETURN a.id AS sourceId, b.id AS targetId
     LIMIT $edgeLimit`,
    { casoSlug, edgeLimit: neo4j.int(20000) },
    (record) => ({
      sourceId: record.get('sourceId') as string,
      targetId: record.get('targetId') as string,
    }),
  )

  // Build adjacency list
  const adjacency = new Map<string, Set<string>>()
  for (const nodeId of nodeMap.keys()) {
    adjacency.set(nodeId, new Set())
  }
  for (const edge of edgeResult.records) {
    if (!adjacency.has(edge.sourceId) || !adjacency.has(edge.targetId)) continue
    adjacency.get(edge.sourceId)!.add(edge.targetId)
    adjacency.get(edge.targetId)!.add(edge.sourceId)
  }

  const nodeIds = [...nodeMap.keys()]

  // Label propagation - each node starts with its own label (index)
  const labels = new Map<string, number>()
  for (let i = 0; i < nodeIds.length; i++) {
    labels.set(nodeIds[i], i)
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false

    for (const nodeId of nodeIds) {
      const neighbors = adjacency.get(nodeId)
      if (!neighbors || neighbors.size === 0) continue

      const labelCounts = new Map<number, number>()
      for (const neighborId of neighbors) {
        const neighborLabel = labels.get(neighborId)!
        labelCounts.set(neighborLabel, (labelCounts.get(neighborLabel) ?? 0) + 1)
      }

      let maxCount = 0
      let bestLabel = labels.get(nodeId)!
      for (const [lbl, count] of labelCounts) {
        if (count > maxCount) {
          maxCount = count
          bestLabel = lbl
        }
      }

      if (bestLabel !== labels.get(nodeId)) {
        labels.set(nodeId, bestLabel)
        changed = true
      }
    }

    if (!changed) break
  }

  // Group nodes by community label
  const communityMap = new Map<number, Array<{ id: string; name: string; label: string }>>()
  for (const nodeId of nodeIds) {
    const communityLabel = labels.get(nodeId)!
    if (!communityMap.has(communityLabel)) communityMap.set(communityLabel, [])
    const info = nodeMap.get(nodeId) ?? { name: nodeId, label: 'Unknown' }
    communityMap.get(communityLabel)!.push({ id: nodeId, name: info.name, label: info.label })
  }

  // Build result: communities with size > 1, sorted by size desc
  let communityId = 0
  const communities: Community[] = []
  for (const members of communityMap.values()) {
    if (members.length > 1) {
      communities.push({ id: communityId++, members, size: members.length })
    }
  }
  communities.sort((a, b) => b.size - a.size)

  return communities
}

// ---------------------------------------------------------------------------
// CommunityAlgorithm
// ---------------------------------------------------------------------------

interface EdgeRow {
  sourceId: string
  sourceName: string
  targetId: string
  targetName: string
}

export class CommunityAlgorithm implements Algorithm {
  kind: AlgorithmKind = 'community'

  async run(context: AlgorithmContext): Promise<AlgorithmResult> {
    const errors: string[] = []
    let hypothesesCreated = 0
    let nodesAnalyzed = 0

    // Step 1: Query all edges within caso_slug namespace
    let edges: readonly EdgeRow[] = []
    try {
      const result = await readQuery<EdgeRow>(
        `MATCH (a {caso_slug: $casoSlug})-[r]-(b {caso_slug: $casoSlug})
         RETURN a.id AS sourceId, a.name AS sourceName, b.id AS targetId, b.name AS targetName`,
        { casoSlug: context.casoSlug },
        (record) => ({
          sourceId: record.get('sourceId') as string,
          sourceName: record.get('sourceName') as string,
          targetId: record.get('targetId') as string,
          targetName: record.get('targetName') as string,
        }),
      )
      edges = result.records
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`Community edge query: ${message}`)
    }

    if (edges.length === 0) {
      return { hypotheses_created: 0, nodes_analyzed: nodesAnalyzed, errors }
    }

    // Step 2: Build adjacency list and collect node names
    const adjacency = new Map<string, Set<string>>()
    const nodeNames = new Map<string, string>()

    for (const edge of edges) {
      if (!adjacency.has(edge.sourceId)) adjacency.set(edge.sourceId, new Set())
      if (!adjacency.has(edge.targetId)) adjacency.set(edge.targetId, new Set())
      adjacency.get(edge.sourceId)!.add(edge.targetId)
      adjacency.get(edge.targetId)!.add(edge.sourceId)
      nodeNames.set(edge.sourceId, edge.sourceName)
      nodeNames.set(edge.targetId, edge.targetName)
    }

    const nodeIds = [...adjacency.keys()]
    nodesAnalyzed = nodeIds.length

    // Step 3: Label propagation - each node starts with its own label
    const labels = new Map<string, number>()
    for (let i = 0; i < nodeIds.length; i++) {
      labels.set(nodeIds[i], i)
    }

    for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
      let changed = false

      for (const nodeId of nodeIds) {
        const neighbors = adjacency.get(nodeId)
        if (!neighbors || neighbors.size === 0) continue

        // Count neighbor labels
        const labelCounts = new Map<number, number>()
        for (const neighborId of neighbors) {
          const neighborLabel = labels.get(neighborId)!
          labelCounts.set(neighborLabel, (labelCounts.get(neighborLabel) ?? 0) + 1)
        }

        // Adopt the most common neighbor label
        let maxCount = 0
        let bestLabel = labels.get(nodeId)!
        for (const [label, count] of labelCounts) {
          if (count > maxCount) {
            maxCount = count
            bestLabel = label
          }
        }

        if (bestLabel !== labels.get(nodeId)) {
          labels.set(nodeId, bestLabel)
          changed = true
        }
      }

      if (!changed) break
    }

    // Step 4: Group nodes by community label
    const communities = new Map<number, Array<{ nodeId: string; name: string }>>()
    for (const nodeId of nodeIds) {
      const label = labels.get(nodeId)!
      if (!communities.has(label)) communities.set(label, [])
      communities.get(label)!.push({ nodeId, name: nodeNames.get(nodeId) ?? nodeId })
    }

    // Step 5: Create hypothesis Proposals for communities with 3+ members
    let communityIndex = 0
    for (const [, members] of communities) {
      if (members.length < MIN_COMMUNITY_SIZE) continue

      // Compute cohesion: internal edges / total possible edges
      const memberIds = new Set(members.map((m) => m.nodeId))
      let internalEdges = 0
      for (const member of members) {
        const neighbors = adjacency.get(member.nodeId)
        if (!neighbors) continue
        for (const neighborId of neighbors) {
          if (memberIds.has(neighborId)) internalEdges++
        }
      }
      // Each edge counted twice (undirected), divide by 2
      internalEdges = Math.floor(internalEdges / 2)
      const possibleEdges = (members.length * (members.length - 1)) / 2
      const cohesion = possibleEdges > 0 ? internalEdges / possibleEdges : 0

      // Scale confidence 0.4–0.6 based on community cohesion
      const confidence = 0.4 + 0.2 * cohesion

      const names = members.map((m) => m.name).join(', ')

      try {
        await createProposal({
          pipeline_state_id: context.pipelineStateId,
          stage_id: context.stageId,
          type: 'hypothesis',
          payload: {
            algorithm: 'community_detection',
            community_id: communityIndex,
            members: members.map((m) => ({ nodeId: m.nodeId, name: m.name })),
            size: members.length,
          },
          confidence,
          reasoning: `Detected community of ${members.length} entities: ${names}. These entities are densely connected.`,
        })
        hypothesesCreated++
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        errors.push(`Proposal for community ${communityIndex}: ${message}`)
      }

      communityIndex++
    }

    return {
      hypotheses_created: hypothesesCreated,
      nodes_analyzed: nodesAnalyzed,
      errors,
    }
  }
}
