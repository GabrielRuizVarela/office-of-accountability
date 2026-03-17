'use client'

import { useCallback, useEffect, useState } from 'react'

import { ForceGraph } from '../graph/ForceGraph'
import type { GraphData } from '../../lib/neo4j/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PoliticianGraphProps {
  readonly politicianId: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_GRAPH: GraphData = { nodes: [], links: [] }
const ALL_LABELS = new Set([
  'Politician',
  'Party',
  'Province',
  'LegislativeVote',
  'Legislation',
  'Investigation',
])

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PoliticianGraph({ politicianId }: PoliticianGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(politicianId)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadGraph() {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ limit: '30' })
        const response = await fetch(
          `/api/graph/node/${encodeURIComponent(politicianId)}?${params.toString()}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          setError('No se pudo cargar el grafo')
          return
        }

        const json = await response.json()
        if (json.success && json.data) {
          setGraphData(json.data as GraphData)
          setSelectedNodeId(politicianId)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError('Error al cargar el grafo')
      } finally {
        setIsLoading(false)
      }
    }

    loadGraph()

    return () => controller.abort()
  }, [politicianId])

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
  }, [])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">{error}</div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
          Cargando grafo...
        </div>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Sin conexiones disponibles
      </div>
    )
  }

  return (
    <ForceGraph
      data={graphData}
      onNodeClick={handleNodeClick}
      selectedNodeId={selectedNodeId}
      visibleLabels={ALL_LABELS}
    />
  )
}
