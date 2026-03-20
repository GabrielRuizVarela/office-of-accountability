'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { ForceGraph } from '../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../components/graph/ForceGraph'
import { GraphToolbar } from '../../components/graph/GraphToolbar'
import { NodeContextMenu } from '../../components/graph/NodeContextMenu'
import { NodeDetailPanel } from '../../components/graph/NodeDetailPanel'
import { PathFinder } from '../../components/graph/PathFinder'
import { SearchBar } from '../../components/graph/SearchBar'
import { TypeFilter } from '../../components/graph/TypeFilter'
import { useGraphKeyboardNav } from '../../components/graph/useGraphKeyboardNav'
import { ZoomControls } from '../../components/graph/ZoomControls'
import { bfsShortestPath, pathLinkKeys } from '../../lib/graph/algorithms'
import { listInvestigations, saveInvestigation } from '../../lib/graph/investigation'
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
  const isFirstLoad = useRef(true)
  const [graphData, setGraphData] = useState<GraphData>(EMPTY_GRAPH)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleLabels, setVisibleLabels] = useState<ReadonlySet<string>>(
    () => new Set(ALL_NODE_TYPES),
  )
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [undoStack, setUndoStack] = useState<GraphData[]>([])
  const undoStackRef = useRef<GraphData[]>([])

  const [showPathFinder, setShowPathFinder] = useState(false)
  const [pathHighlight, setPathHighlight] = useState<{ nodeIds: Set<string>; linkKeys: Set<string> } | null>(null)
  const [pathSourceId, setPathSourceId] = useState<string | null>(null)
  const [pathTargetId, setPathTargetId] = useState<string | null>(null)

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
      if (isFirstLoad.current) {
        isFirstLoad.current = false
        setTimeout(() => graphRef.current?.zoomToFit(), 300)
      }
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

  // Save investigation handler
  const handleSave = useCallback(() => {
    const name = window.prompt('Nombre de la investigación:')
    if (!name) return
    const internalNodes = graphRef.current?.getInternalNodes() ?? []
    const pinnedPositions = [...pinnedNodeIds].map(id => {
      const n = internalNodes.find(node => node.id === id)
      return { id, x: n?.x ?? 0, y: n?.y ?? 0 }
    })
    const result = saveInvestigation({
      name,
      savedAt: new Date().toISOString(),
      nodeIds: graphDataRef.current.nodes.map(n => n.id),
      pinnedPositions,
    })
    if (!result.ok && result.warning) {
      window.alert(result.warning)
    }
  }, [pinnedNodeIds])

  // Load investigation handler
  const handleLoad = useCallback(async () => {
    const investigations = listInvestigations()
    if (investigations.length === 0) {
      window.alert('No hay investigaciones guardadas.')
      return
    }
    const names = investigations.map((inv, i) => `${i + 1}. ${inv.name} (${new Date(inv.savedAt).toLocaleDateString()})`).join('\n')
    const choice = window.prompt(`Investigaciones guardadas:\n${names}\n\nIngresa el número:`)
    if (!choice) return
    const index = parseInt(choice, 10) - 1
    if (isNaN(index) || index < 0 || index >= investigations.length) return

    const inv = investigations[index]
    setIsLoading(true)
    try {
      // Fetch nodes in parallel batches of 10
      const nodeIds = inv.nodeIds.slice(0, 50)
      const allData: GraphData[] = []
      for (let i = 0; i < nodeIds.length; i += 10) {
        const batch = nodeIds.slice(i, i + 10)
        const results = await Promise.all(
          batch.map(async (nodeId) => {
            const res = await fetch(`/api/graph/expand/${encodeURIComponent(nodeId)}?depth=0&limit=1`)
            if (!res.ok) return null
            const json = await res.json()
            return json.success && json.data ? (json.data as GraphData) : null
          }),
        )
        for (const r of results) {
          if (r) allData.push(r)
        }
      }
      if (allData.length === 0) return

      let merged = allData[0]
      for (let i = 1; i < allData.length; i++) {
        merged = mergeGraphData(merged, allData[i])
      }

      // Restore pinned positions
      const pinnedIds = new Set(inv.pinnedPositions.map(p => p.id))
      setPinnedNodeIds(pinnedIds)
      setGraphData(merged)

      // Restore pin positions after render
      setTimeout(() => {
        for (const pos of inv.pinnedPositions) {
          graphRef.current?.pinNode(pos.id)
        }
        graphRef.current?.zoomToFit()
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null)

  const handleNodeRightClick = useCallback((nodeId: string, x: number, y: number) => {
    setContextMenu({ nodeId, x, y })
    setSelectedNodeId(nodeId)
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  // Collapse node: remove exclusive neighbors (not pinned, no other connections)
  const collapseNode = useCallback((nodeId: string) => {
    undoStackRef.current = [...undoStackRef.current.slice(-9), graphDataRef.current]
    setUndoStack(undoStackRef.current)

    const currentData = graphDataRef.current
    const nodeLinks = currentData.links.filter(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as unknown as {id:string}).id
      const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as {id:string}).id
      return src === nodeId || tgt === nodeId
    })
    const neighborIds = new Set(nodeLinks.map(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as unknown as {id:string}).id
      const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as {id:string}).id
      return src === nodeId ? tgt : src
    }))

    const exclusiveIds = new Set<string>()
    for (const nId of neighborIds) {
      if (pinnedNodeIds.has(nId)) continue
      const otherLinks = currentData.links.filter(l => {
        const src = typeof l.source === 'string' ? l.source : (l.source as unknown as {id:string}).id
        const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as {id:string}).id
        return (src === nId || tgt === nId) && src !== nodeId && tgt !== nodeId
      })
      if (otherLinks.length === 0) exclusiveIds.add(nId)
    }
    if (exclusiveIds.size === 0) return

    const newNodes = currentData.nodes.filter(n => !exclusiveIds.has(n.id))
    const newLinks = currentData.links.filter(l => {
      const src = typeof l.source === 'string' ? l.source : (l.source as unknown as {id:string}).id
      const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as {id:string}).id
      return !exclusiveIds.has(src) && !exclusiveIds.has(tgt)
    })
    setGraphData({ nodes: newNodes, links: newLinks } as GraphData)
  }, [pinnedNodeIds])

  // Find shortest path between two nodes
  const findPath = useCallback(async (sourceId: string, targetId: string) => {
    // Try client-side BFS first (only works if both nodes are already in the graph)
    const clientPath = bfsShortestPath(graphDataRef.current, sourceId, targetId)
    if (clientPath) {
      const nodeIds = new Set(clientPath)
      const lKeys = pathLinkKeys(graphDataRef.current, clientPath)
      setPathHighlight({ nodeIds, linkKeys: lKeys })
      return
    }
    // Fallback to server-side shortest path
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ source: sourceId, target: targetId })
      const res = await fetch(`/api/graph/path?${params.toString()}`)
      if (!res.ok) return
      const json = await res.json()
      if (!json.success) return
      const merged = mergeGraphData(graphDataRef.current, json.data)
      setGraphData(merged)
      if (json.paths?.[0]) {
        const nodeIds = new Set(json.paths[0] as string[])
        const lKeys = pathLinkKeys(merged, json.paths[0] as string[])
        setPathHighlight({ nodeIds, linkKeys: lKeys })
      }
    } finally { setIsLoading(false) }
  }, [])

  // Search result selected — expand that node into the graph
  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      expandNode(nodeId)
    },
    [expandNode],
  )

  // Node clicked in the graph — select it (no load), clear path highlight
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId)
      if (!showPathFinder) setPathHighlight(null)
    },
    [showPathFinder],
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
      <div className="z-20 flex items-center gap-4 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-sm">
        <SearchBar onSelect={handleSearchSelect} />
      </div>

      {/* Path finder bar */}
      {showPathFinder && (
        <PathFinder
          onFindPath={findPath}
          onClose={() => { setShowPathFinder(false); setPathHighlight(null); setPathSourceId(null); setPathTargetId(null) }}
          initialSourceId={pathSourceId}
          initialTargetId={pathTargetId}
        />
      )}

      {/* Toolbar */}
      <GraphToolbar
        onFindPath={() => setShowPathFinder(true)}
        onClearGraph={clearGraph}
        onSave={handleSave}
        onLoad={handleLoad}
        onUnpinAll={unpinAll}
        onUndo={undo}
        canUndo={undoStack.length > 0}
        hasData={hasData}
      />

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
                <span className="text-zinc-400">Ctrl+Z</span> deshacer
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
              onNodeRightClick={handleNodeRightClick}
              selectedNodeId={selectedNodeId}
              focusedNodeId={focusedNodeId}
              visibleLabels={visibleLabels}
              pinnedNodeIds={pinnedNodeIds}
              pathHighlight={pathHighlight}
            />
          )}

          {/* Context menu */}
          {contextMenu && (
            <NodeContextMenu
              x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}
              actions={[
                { label: pinnedNodeIds.has(contextMenu.nodeId) ? 'Desfijar' : 'Fijar',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1a1 1 0 100-2H7a1 1 0 000 2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" /></svg>,
                  onClick: () => togglePin(contextMenu.nodeId) },
                { label: 'Expandir',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
                  onClick: () => expandNode(contextMenu.nodeId) },
                { label: 'Colapsar',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>,
                  onClick: () => collapseNode(contextMenu.nodeId) },
                { label: 'Ruta desde aqui',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>,
                  onClick: () => { setPathSourceId(contextMenu.nodeId); setShowPathFinder(true) } },
                { label: 'Ruta hasta aqui',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>,
                  onClick: () => { setPathTargetId(contextMenu.nodeId); setShowPathFinder(true) } },
              ]}
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
