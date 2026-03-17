'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'

import { ForceGraph } from '../../components/graph/ForceGraph'
import { NodeDetailPanel } from '../../components/graph/NodeDetailPanel'
import { SearchBar } from '../../components/graph/SearchBar'
import { TypeFilter } from '../../components/graph/TypeFilter'
import type { GraphData } from '../../lib/neo4j/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMPTY_GRAPH: GraphData = { nodes: [], links: [] }

const ALL_NODE_TYPES: readonly string[] = [
  'Politician',
  'Party',
  'Province',
  'LegislativeVote',
  'Legislation',
  'Investigation',
]

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchNodeNeighborhood(
  nodeId: string,
  signal?: AbortSignal,
): Promise<GraphData | null> {
  const params = new URLSearchParams({ limit: '50' })
  const response = await fetch(
    `/api/graph/node/${encodeURIComponent(nodeId)}?${params.toString()}`,
    { signal },
  )

  if (!response.ok) return null

  const json = await response.json()
  if (!json.success || !json.data) return null

  return json.data as GraphData
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExplorarPage() {
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleLabels, setVisibleLabels] = useState<ReadonlySet<string>>(
    () => new Set(ALL_NODE_TYPES),
  )
  const [isLoading, setIsLoading] = useState(false)

  // Derive available types from current graph data
  const availableTypes = useMemo(() => {
    const typeSet = new Set<string>()
    for (const node of graphData.nodes) {
      for (const label of node.labels) {
        typeSet.add(label)
      }
    }
    // Always include all known types so filters don't disappear
    for (const t of ALL_NODE_TYPES) {
      typeSet.add(t)
    }
    return Array.from(typeSet).sort()
  }, [graphData.nodes])

  // Load a node's neighborhood into the graph
  const loadNode = useCallback(async (nodeId: string) => {
    setIsLoading(true)
    try {
      const data = await fetchNodeNeighborhood(nodeId)
      if (data) {
        setGraphData(data)
        setSelectedNodeId(nodeId)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      // Silently handle — graph stays as-is
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Search result selected — load that node's neighborhood
  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      loadNode(nodeId)
    },
    [loadNode],
  )

  // Node clicked in the graph — select it and load its neighborhood
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      loadNode(nodeId)
    },
    [loadNode],
  )

  // Navigate from detail panel — same as clicking a node
  const handleNavigate = useCallback(
    (nodeId: string) => {
      loadNode(nodeId)
    },
    [loadNode],
  )

  // Close detail panel
  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Type filter changed
  const handleTypeFilterChange = useCallback((types: ReadonlySet<string>) => {
    setVisibleLabels(types)
  }, [])

  const hasData = graphData.nodes.length > 0

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Top bar */}
      <header className="z-20 flex items-center gap-4 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="flex-shrink-0 text-sm font-semibold text-zinc-100 transition-colors hover:text-zinc-300"
        >
          ORC
        </Link>
        <SearchBar onSelect={handleSearchSelect} />
      </header>

      {/* Main area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Graph canvas */}
        <div className="relative flex-1">
          {/* Type filter overlay */}
          {hasData && (
            <div className="absolute left-4 top-4 z-10">
              <TypeFilter
                availableTypes={availableTypes}
                visibleTypes={visibleLabels}
                onChange={handleTypeFilterChange}
              />
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-2 text-sm text-zinc-400 shadow-lg backdrop-blur-sm">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                Cargando...
              </div>
            </div>
          )}

          {/* Empty state */}
          {!hasData && !isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-zinc-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h2 className="mb-2 text-lg font-medium text-zinc-300">Explorar el grafo</h2>
                <p className="text-sm text-zinc-500">
                  Busca un politico, ley o votacion para comenzar a explorar las conexiones.
                </p>
              </div>
            </div>
          )}

          {/* Force graph */}
          {hasData && (
            <ForceGraph
              data={graphData}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
              visibleLabels={visibleLabels}
            />
          )}
        </div>

        {/* Detail panel */}
        {selectedNodeId && (
          <NodeDetailPanel
            nodeId={selectedNodeId}
            onClose={handleClosePanel}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  )
}
