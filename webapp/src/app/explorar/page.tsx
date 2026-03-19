'use client'

import Link from 'next/link'
import { useCallback, useMemo, useRef, useState } from 'react'

import { ForceGraph } from '../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../components/graph/ForceGraph'
import { NodeDetailPanel } from '../../components/graph/NodeDetailPanel'
import { SearchBar } from '../../components/graph/SearchBar'
import { TypeFilter } from '../../components/graph/TypeFilter'
import { useGraphKeyboardNav } from '../../components/graph/useGraphKeyboardNav'
import { ZoomControls } from '../../components/graph/ZoomControls'
import { mergeGraphData } from '../../lib/graph/transform'
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
// Component
// ---------------------------------------------------------------------------

export default function ExplorarPage() {
  const graphRef = useRef<ForceGraphHandle>(null)
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleLabels, setVisibleLabels] = useState<ReadonlySet<string>>(
    () => new Set(ALL_NODE_TYPES),
  )
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [undoStack, setUndoStack] = useState<GraphData[]>([])
  const undoStackRef = useRef<GraphData[]>([])

  // Ref to avoid stale closures over graphData
  const graphDataRef = useRef(graphData)
  graphDataRef.current = graphData

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

  // Expand a node: fetch its neighbors and merge into the current graph
  const expandNode = useCallback(async (nodeId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/graph/expand/${encodeURIComponent(nodeId)}?depth=1&limit=50`,
      )
      if (!response.ok) return

      const json = await response.json()
      if (!json.success || !json.data) return

      const newData = json.data as GraphData

      // Save current graph state to undo stack (max 10 entries)
      undoStackRef.current = [...undoStackRef.current.slice(-9), graphDataRef.current]
      setUndoStack(undoStackRef.current)

      // Get current node positions from the force graph internal state
      const positionMap = new Map<string, { x: number; y: number; vx: number; vy: number }>()
      let expandedX = 0
      let expandedY = 0

      const internalNodes = graphRef.current?.getInternalNodes() ?? []
      for (const n of internalNodes) {
        if (typeof n.x === 'number' && typeof n.y === 'number') {
          positionMap.set(n.id as string, {
            x: n.x,
            y: n.y,
            vx: n.vx ?? 0,
            vy: n.vy ?? 0,
          })
        }
      }
      const expandedPos = positionMap.get(nodeId)
      if (expandedPos) {
        expandedX = expandedPos.x
        expandedY = expandedPos.y
      }

      // Merge new data into existing graph
      const merged = mergeGraphData(graphDataRef.current, newData)

      // Set positions: existing nodes keep their positions, new nodes appear near the expanded node
      const positioned = {
        nodes: merged.nodes.map((node) => {
          const existing = positionMap.get(node.id)
          if (existing) {
            return { ...node, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy }
          }
          // New node: place near the expanded node with a small random offset
          return {
            ...node,
            x: expandedX + (Math.random() - 0.5) * 40,
            y: expandedY + (Math.random() - 0.5) * 40,
          }
        }),
        links: merged.links,
      }

      setGraphData(positioned as GraphData)
      setSelectedNodeId(nodeId)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      // Silently handle — graph stays as-is
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Undo: pop last state from stack
  const undo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const last = stack[stack.length - 1]
    undoStackRef.current = stack.slice(0, -1)
    setUndoStack(undoStackRef.current)
    setGraphData(last)
  }, [])

  // Toggle pin on a node
  const togglePin = useCallback((nodeId: string) => {
    setPinnedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
        graphRef.current?.unpinNode(nodeId)
      } else {
        next.add(nodeId)
        graphRef.current?.pinNode(nodeId)
      }
      return next
    })
  }, [])

  // Unpin all nodes
  const unpinAll = useCallback(() => {
    setPinnedNodeIds(new Set())
    graphRef.current?.unpinAll()
  }, [])

  // Clear graph: reset to empty state
  const clearGraph = useCallback(() => {
    setGraphData(EMPTY_GRAPH)
    undoStackRef.current = []
    setUndoStack([])
    setSelectedNodeId(null)
  }, [])

  // Search result selected — expand that node into the graph
  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      expandNode(nodeId)
    },
    [expandNode],
  )

  // Node clicked in the graph — select it (no load)
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId)
    },
    [],
  )

  // Navigate from detail panel — expand the target node
  const handleNavigate = useCallback(
    (nodeId: string) => {
      expandNode(nodeId)
    },
    [expandNode],
  )

  // Close detail panel
  const handleClosePanel = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Type filter changed
  const handleTypeFilterChange = useCallback((types: ReadonlySet<string>) => {
    setVisibleLabels(types)
  }, [])

  // Zoom controls
  const handleZoomIn = useCallback(() => graphRef.current?.zoomIn(), [])
  const handleZoomOut = useCallback(() => graphRef.current?.zoomOut(), [])
  const handleZoomToFit = useCallback(() => graphRef.current?.zoomToFit(), [])

  // Center on node (for keyboard nav)
  const handleCenterOnNode = useCallback(
    (nodeId: string) => graphRef.current?.centerOnNode(nodeId),
    [],
  )

  // Keyboard navigation
  const { focusedNodeId } = useGraphKeyboardNav({
    nodes: graphData.nodes,
    visibleLabels,
    selectedNodeId,
    onExpand: expandNode,
    onDeselect: handleClosePanel,
    onCenterOnNode: handleCenterOnNode,
    onUndo: undo,
  })

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

          {/* Keyboard nav hint */}
          {hasData && focusedNodeId && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-2 text-xs text-zinc-500 backdrop-blur-sm">
                <span className="text-zinc-400">Tab</span> navegar
                {' · '}
                <span className="text-zinc-400">Enter</span> expandir
                {' · '}
                <span className="text-zinc-400">Esc</span> cerrar
              </div>
            </div>
          )}

          {/* Screen reader live region */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {focusedNodeId
              ? `Nodo enfocado: ${graphData.nodes.find((n) => n.id === focusedNodeId)?.properties.name ?? focusedNodeId}`
              : ''}
          </div>

          {/* Zoom controls overlay */}
          {hasData && (
            <div className="absolute bottom-4 right-4 z-10">
              <ZoomControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomToFit={handleZoomToFit}
              />
            </div>
          )}

          {/* Force graph */}
          {hasData && (
            <ForceGraph
              ref={graphRef}
              data={graphData}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNodeId}
              focusedNodeId={focusedNodeId}
              visibleLabels={visibleLabels}
              pinnedNodeIds={pinnedNodeIds}
            />
          )}
        </div>

        {/* Detail panel */}
        {selectedNodeId && (
          <NodeDetailPanel
            nodeId={selectedNodeId}
            onClose={handleClosePanel}
            onNavigate={handleNavigate}
            onExpand={expandNode}
            onTogglePin={togglePin}
            isPinned={selectedNodeId ? pinnedNodeIds.has(selectedNodeId) : false}
          />
        )}
      </div>
    </div>
  )
}
