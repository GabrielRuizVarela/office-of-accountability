/**
 * GET /api/graph/path
 *
 * Finds shortest path(s) between two nodes using Neo4j's
 * shortestPath / allShortestPaths algorithms.
 *
 * Query params:
 *   - source (required): node ID (uuid, slug, integer, or element ID)
 *   - target (required): node ID
 *   - maxHops (optional): max path length 1-6 (default 6)
 *   - all (optional): "true" to return all shortest paths (default false)
 *
 * Responses:
 *   - 200: { success: true, data: GraphData, paths: string[][], meta }
 *   - 400: invalid parameters
 *   - 404: no path found or node not found
 *   - 503: Neo4j unreachable
 *   - 504: query timed out
 */

import { z } from 'zod/v4'
import neo4j from 'neo4j-driver-lite'
import type { Node, Relationship, Path } from 'neo4j-driver-lite'

import { getDriver } from '@/lib/neo4j'
import { nodeIdSchema } from '@/lib/graph/validation'
import { transformNode, transformRelationship } from '@/lib/graph/transform'
import type { GraphData, GraphNode, GraphLink } from '@/lib/neo4j/types'

const maxHopsSchema = z.coerce.number().int().min(1).max(6).default(6)

/** 5 second query timeout for responsive UX */
const PATH_TIMEOUT_MS = 5_000

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)

  // --- Validate source ---
  const sourceParam = url.searchParams.get('source')
  if (!sourceParam) {
    return Response.json(
      { success: false, error: 'Missing required query parameter: source' },
      { status: 400 },
    )
  }
  const sourceResult = nodeIdSchema.safeParse(sourceParam)
  if (!sourceResult.success) {
    return Response.json(
      { success: false, error: 'Invalid source ID format' },
      { status: 400 },
    )
  }

  // --- Validate target ---
  const targetParam = url.searchParams.get('target')
  if (!targetParam) {
    return Response.json(
      { success: false, error: 'Missing required query parameter: target' },
      { status: 400 },
    )
  }
  const targetResult = nodeIdSchema.safeParse(targetParam)
  if (!targetResult.success) {
    return Response.json(
      { success: false, error: 'Invalid target ID format' },
      { status: 400 },
    )
  }

  // --- Validate maxHops ---
  const maxHopsParam = url.searchParams.get('maxHops')
  const maxHopsResult = maxHopsSchema.safeParse(maxHopsParam ?? undefined)
  if (!maxHopsResult.success) {
    return Response.json(
      { success: false, error: 'Invalid maxHops parameter (must be integer 1-6)' },
      { status: 400 },
    )
  }
  const maxHops = maxHopsResult.data

  // --- Parse `all` flag ---
  const allParam = url.searchParams.get('all')
  const findAll = allParam === 'true'

  // --- Build Cypher query ---
  // Path length [*..N] does not support parameters in Cypher, so we interpolate
  // the Zod-validated integer (guaranteed 1-6).
  const pathFn = findAll ? 'allShortestPaths' : 'shortestPath'

  const cypher = [
    'MATCH (source), (target)',
    'WHERE (source.id = $sourceId OR source.slug = $sourceId OR source.acta_id = $sourceId)',
    '  AND (target.id = $targetId OR target.slug = $targetId OR target.acta_id = $targetId)',
    `MATCH path = ${pathFn}((source)-[*..${maxHops}]-(target))`,
    ...(findAll ? ['WITH path LIMIT $pathLimit'] : []),
    'RETURN path',
  ].join('\n')

  const params: Record<string, unknown> = {
    sourceId: sourceResult.data,
    targetId: targetResult.data,
  }
  if (findAll) {
    params.pathLimit = neo4j.int(5)
  }

  // --- Execute query ---
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ })

  try {
    const result = await session.run(cypher, params, { timeout: neo4j.int(PATH_TIMEOUT_MS) })

    if (result.records.length === 0) {
      return Response.json(
        { success: false, error: 'No path found between the specified nodes' },
        { status: 404 },
      )
    }

    // --- Transform path segments into GraphData ---
    const nodeMap = new Map<string, GraphNode>()
    const linkMap = new Map<string, GraphLink>()
    const elementIdToAppId = new Map<string, string>()
    const paths: string[][] = []

    for (const record of result.records) {
      const path = record.get('path') as Path
      const pathNodeIds: string[] = []

      // First pass: register all nodes so elementId → appId is available
      for (const segment of path.segments) {
        const startGraphNode = transformNode(segment.start as Node)
        nodeMap.set(startGraphNode.id, startGraphNode)
        elementIdToAppId.set((segment.start as Node).elementId, startGraphNode.id)

        const endGraphNode = transformNode(segment.end as Node)
        nodeMap.set(endGraphNode.id, endGraphNode)
        elementIdToAppId.set((segment.end as Node).elementId, endGraphNode.id)
      }

      // Second pass: transform relationships and build path ID list
      for (const segment of path.segments) {
        const rel = segment.relationship as Relationship
        const sourceId = elementIdToAppId.get(rel.startNodeElementId)!
        const targetId = elementIdToAppId.get(rel.endNodeElementId)!

        const linkKey = `${sourceId}:${targetId}:${rel.type}`
        if (!linkMap.has(linkKey)) {
          linkMap.set(linkKey, transformRelationship(rel, sourceId, targetId))
        }
      }

      // Build ordered node ID list for this path
      if (path.segments.length > 0) {
        const firstStart = transformNode(path.segments[0].start as Node)
        pathNodeIds.push(firstStart.id)
        for (const segment of path.segments) {
          const endNode = transformNode(segment.end as Node)
          pathNodeIds.push(endNode.id)
        }
      }

      paths.push(pathNodeIds)
    }

    const data: GraphData = {
      nodes: [...nodeMap.values()],
      links: [...linkMap.values()],
    }

    return Response.json({
      success: true,
      data,
      paths,
      meta: {
        pathCount: paths.length,
        nodeCount: data.nodes.length,
        linkCount: data.links.length,
        maxHops,
        algorithm: findAll ? 'allShortestPaths' : 'shortestPath',
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      const msg = error.message

      const isTimeout =
        msg.includes('transaction has been terminated') ||
        msg.includes('Transaction timed out') ||
        msg.includes('LockClient') ||
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
  } finally {
    await session.close()
  }
}
