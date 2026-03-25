'use client'

import { useCallback, useEffect, useMemo, useRef, useState, use } from 'react'

import { CategoryFilter, isNodeHiddenByCategory } from '../../../../../components/graph/CategoryFilter'
import { ForceGraph } from '../../../../../components/graph/ForceGraph'
import type { ForceGraphHandle } from '../../../../../components/graph/ForceGraph'
import { GraphToolbar } from '../../../../../components/graph/GraphToolbar'
import { NodeContextMenu } from '../../../../../components/graph/NodeContextMenu'
import { NodeDetailPanel } from '../../../../../components/graph/NodeDetailPanel'
import { PathFinder } from '../../../../../components/graph/PathFinder'
import { SearchBar } from '../../../../../components/graph/SearchBar'
import { bfsShortestPath, pathLinkKeys } from '../../../../../lib/graph/algorithms'
import { getLabelColor, getLabelDisplayName } from '../../../../../lib/graph/constants'
import { listInvestigations, saveInvestigation } from '../../../../../lib/graph/investigation'
import { mergeGraphData } from '../../../../../lib/graph/transform'
import type { GraphData, GraphNode, GraphLink } from '../../../../../lib/neo4j/types'

// ---------------------------------------------------------------------------
// Label config for the case graph
// ---------------------------------------------------------------------------

const LABEL_CONFIGS: Record<string, ReadonlyArray<{ label: string; color: string; name: string }>> = {
  default: [
    { label: 'Person', color: '#3b82f6', name: 'People' },
    { label: 'Organization', color: '#8b5cf6', name: 'Organizations' },
    { label: 'Location', color: '#10b981', name: 'Locations' },
    { label: 'Event', color: '#f59e0b', name: 'Events' },
    { label: 'Document', color: '#ef4444', name: 'Documents' },
    { label: 'LegalCase', color: '#ec4899', name: 'Legal Cases' },
    { label: 'Flight', color: '#f97316', name: 'Flights' },
  ],
  'caso-dictadura': [
    { label: 'DictaduraCCD', color: '#ef4444', name: 'CCDs' },
    { label: 'DictaduraUnidadMilitar', color: '#f97316', name: 'Unidades' },
    { label: 'DictaduraOrganizacion', color: '#8b5cf6', name: 'Organizaciones' },
    { label: 'DictaduraCausa', color: '#06b6d4', name: 'Causas' },
    { label: 'DictaduraEvento', color: '#f59e0b', name: 'Eventos' },
    { label: 'DictaduraOperacion', color: '#a855f7', name: 'Operaciones' },
    { label: 'DictaduraPersona', color: '#3b82f6', name: 'Personas' },
    { label: 'DictaduraLugar', color: '#10b981', name: 'Lugares' },
    { label: 'DictaduraDocumento', color: '#ec4899', name: 'Documentos' },
    { label: 'DictaduraActa', color: '#64748b', name: 'Actas' },
  ],
  'riesgo-nuclear': [
    { label: 'NuclearSignal', color: '#eab308', name: 'Signals' },
    { label: 'NuclearActor', color: '#ef4444', name: 'Actors' },
    { label: 'WeaponSystem', color: '#f97316', name: 'Weapons' },
    { label: 'Treaty', color: '#3b82f6', name: 'Treaties' },
    { label: 'NuclearFacility', color: '#10b981', name: 'Facilities' },
    { label: 'RiskBriefing', color: '#a855f7', name: 'Briefings' },
  ],
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrafoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const LABEL_CONFIG = LABEL_CONFIGS[slug] ?? LABEL_CONFIGS.default
  const graphRef = useRef<ForceGraphHandle>(null)

  // For dictadura: structural + personas ON by default, high-volume detail OFF
  const DICTADURA_DEFAULT_ON = new Set([
    'DictaduraPersona', 'DictaduraCCD', 'DictaduraUnidadMilitar',
    'DictaduraOrganizacion', 'DictaduraCausa', 'DictaduraEvento',
    'DictaduraOperacion',
  ])

  // Graph data & UI state
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [visibleLabels, setVisibleLabels] = useState<Set<string> | null>(
    slug === 'caso-dictadura' ? DICTADURA_DEFAULT_ON : null,
  )
  const [tierFilter, setTierFilter] = useState<string>(slug === 'caso-dictadura' ? 'verified' : 'all')
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set())
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set())

  // Undo stack
  const [undoStack, setUndoStack] = useState<GraphData[]>([])
  const undoStackRef = useRef<GraphData[]>([])
  const graphDataRef = useRef(graphData)
  graphDataRef.current = graphData

  // Path finding
  const [showPathFinder, setShowPathFinder] = useState(false)
  const [pathHighlight, setPathHighlight] = useState<{ nodeIds: Set<string>; linkKeys: Set<string> } | null>(null)
  const [pathSourceId, setPathSourceId] = useState<string | null>(null)
  const [pathTargetId, setPathTargetId] = useState<string | null>(null)

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null)

  // First-load zoom
  const isFirstLoad = useRef(true)

  // ---------------------------------------------------------------------------
  // Load initial graph data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function fetchGraph() {
      try {
        // For dictadura: load only structural labels + gold/silver to keep graph manageable
        const params = new URLSearchParams()
        if (slug === 'caso-dictadura') {
          params.set('tiers', 'gold,silver')
          params.set('labels', 'DictaduraPersona,DictaduraCCD,DictaduraUnidadMilitar,DictaduraOrganizacion,DictaduraCausa,DictaduraEvento,DictaduraOperacion')
        }
        const qs = params.toString() ? `?${params.toString()}` : ''
        const res = await fetch(`/api/caso/${slug}/graph${qs}`)
        if (!res.ok) throw new Error('Failed to load graph data')
        const json = await res.json()
        const data = json.data ?? json
        console.log('[grafo] fetched', data?.nodes?.length, 'nodes', data?.links?.length, 'links')
        if (!data?.nodes?.length) {
          console.warn('[grafo] No graph data returned', json)
          setError('No graph data found')
          return
        }
        setGraphData(data)
      } catch (err) {
        console.error('[grafo] fetch error', err)
        setError(err instanceof Error ? err.message : 'Failed to load graph')
      } finally {
        setIsInitialLoading(false)
      }
    }
    fetchGraph()
  }, [slug])

  // Zoom to fit after initial load
  useEffect(() => {
    if (!isInitialLoading && graphData.nodes.length > 0 && isFirstLoad.current) {
      isFirstLoad.current = false
      setTimeout(() => graphRef.current?.zoomToFit(), 300)
    }
  }, [isInitialLoading, graphData.nodes.length])

  // ---------------------------------------------------------------------------
  // Tier filtering (client-side)
  // ---------------------------------------------------------------------------

  const filteredData = useMemo<GraphData>(() => {
    let nodes: GraphNode[] = [...graphData.nodes]

    // Tier filter
    if (tierFilter === 'verified') {
      nodes = nodes.filter(
        (n) => (n.properties as Record<string, unknown>).confidence_tier !== 'bronze',
      )
    } else if (tierFilter === 'gold') {
      nodes = nodes.filter((n) => {
        const tier = (n.properties as Record<string, unknown>).confidence_tier
        return !tier || tier === 'gold'
      })
    }

    // Category filter
    if (hiddenCategories.size > 0) {
      nodes = nodes.filter((n) => !isNodeHiddenByCategory(n, hiddenCategories))
    }

    if (nodes.length === graphData.nodes.length) return graphData

    const nodeIds = new Set(nodes.map((n) => n.id))
    const links: GraphLink[] = graphData.links.filter(
      (l) => {
        const src = typeof l.source === 'string' ? l.source : (l.source as unknown as { id: string }).id
        const tgt = typeof l.target === 'string' ? l.target : (l.target as unknown as { id: string }).id
        return nodeIds.has(src) && nodeIds.has(tgt)
      },
    )
    return { nodes, links }
  }, [graphData, tierFilter, hiddenCategories])

  // ---------------------------------------------------------------------------
  // Expand-in-place
  // ---------------------------------------------------------------------------

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

      // Save to undo stack
      undoStackRef.current = [...undoStackRef.current.slice(-9), graphDataRef.current]
      setUndoStack(undoStackRef.current)

      // Get current positions
      const positionMap = new Map<string, { x: number; y: number; vx: number; vy: number }>()
      const internalNodes = graphRef.current?.getInternalNodes() ?? []
      for (const n of internalNodes) {
        if (typeof n.x === 'number' && typeof n.y === 'number') {
          positionMap.set(n.id as string, { x: n.x, y: n.y, vx: n.vx ?? 0, vy: n.vy ?? 0 })
        }
      }
      const expandedPos = positionMap.get(nodeId) ?? { x: 0, y: 0 }

      const merged = mergeGraphData(graphDataRef.current, newData)
      const positioned = {
        nodes: merged.nodes.map((node) => {
          const existing = positionMap.get(node.id)
          if (existing) return { ...node, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy }
          return { ...node, x: expandedPos.x + (Math.random() - 0.5) * 40, y: expandedPos.y + (Math.random() - 0.5) * 40 }
        }),
        links: merged.links,
      }

      setGraphData(positioned as GraphData)
      setSelectedNodeId(nodeId)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Undo / Clear / Pin
  // ---------------------------------------------------------------------------

  const undo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    const last = stack[stack.length - 1]
    undoStackRef.current = stack.slice(0, -1)
    setUndoStack(undoStackRef.current)
    setGraphData(last)
  }, [])

  const clearGraph = useCallback(() => {
    setGraphData({ nodes: [], links: [] })
    undoStackRef.current = []
    setUndoStack([])
    setSelectedNodeId(null)
    setPinnedNodeIds(new Set())
  }, [])

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

  const unpinAll = useCallback(() => {
    setPinnedNodeIds(new Set())
    graphRef.current?.unpinAll()
  }, [])

  // ---------------------------------------------------------------------------
  // Collapse
  // ---------------------------------------------------------------------------

  const collapseNode = useCallback((nodeId: string) => {
    undoStackRef.current = [...undoStackRef.current.slice(-9), graphDataRef.current]
    setUndoStack(undoStackRef.current)

    const currentData = graphDataRef.current
    const resolveId = (val: string | unknown) =>
      typeof val === 'string' ? val : (val as { id: string }).id

    const nodeLinks = currentData.links.filter(l =>
      resolveId(l.source) === nodeId || resolveId(l.target) === nodeId)
    const neighborIds = new Set(nodeLinks.map(l =>
      resolveId(l.source) === nodeId ? resolveId(l.target) : resolveId(l.source)))

    const exclusiveIds = new Set<string>()
    for (const nId of neighborIds) {
      if (pinnedNodeIds.has(nId)) continue
      const otherLinks = currentData.links.filter(l => {
        const src = resolveId(l.source)
        const tgt = resolveId(l.target)
        return (src === nId || tgt === nId) && src !== nodeId && tgt !== nodeId
      })
      if (otherLinks.length === 0) exclusiveIds.add(nId)
    }
    if (exclusiveIds.size === 0) return

    setGraphData({
      nodes: currentData.nodes.filter(n => !exclusiveIds.has(n.id)),
      links: currentData.links.filter(l => !exclusiveIds.has(resolveId(l.source)) && !exclusiveIds.has(resolveId(l.target))),
    } as GraphData)
  }, [pinnedNodeIds])

  // ---------------------------------------------------------------------------
  // Path finding
  // ---------------------------------------------------------------------------

  const findPath = useCallback(async (sourceId: string, targetId: string) => {
    const clientPath = bfsShortestPath(graphDataRef.current, sourceId, targetId)
    if (clientPath) {
      setPathHighlight({ nodeIds: new Set(clientPath), linkKeys: pathLinkKeys(graphDataRef.current, clientPath) })
      return
    }
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
        setPathHighlight({ nodeIds: new Set(json.paths[0] as string[]), linkKeys: pathLinkKeys(merged, json.paths[0] as string[]) })
      }
    } finally { setIsLoading(false) }
  }, [])

  // ---------------------------------------------------------------------------
  // Save / Load
  // ---------------------------------------------------------------------------

  const handleSave = useCallback(() => {
    const name = window.prompt('Investigation name:')
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
    if (!result.ok && result.warning) window.alert(result.warning)
  }, [pinnedNodeIds])

  const handleLoad = useCallback(async () => {
    const investigations = listInvestigations()
    if (investigations.length === 0) { window.alert('No saved investigations.'); return }
    const names = investigations.map((inv, i) => `${i + 1}. ${inv.name} (${new Date(inv.savedAt).toLocaleDateString()})`).join('\n')
    const choice = window.prompt(`Saved investigations:\n${names}\n\nEnter number:`)
    if (!choice) return
    const index = parseInt(choice, 10) - 1
    if (isNaN(index) || index < 0 || index >= investigations.length) return

    const inv = investigations[index]
    setIsLoading(true)
    try {
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
        for (const r of results) { if (r) allData.push(r) }
      }
      if (allData.length === 0) return
      let merged = allData[0]
      for (let i = 1; i < allData.length; i++) merged = mergeGraphData(merged, allData[i])
      setPinnedNodeIds(new Set(inv.pinnedPositions.map(p => p.id)))
      setGraphData(merged)
      setTimeout(() => {
        for (const pos of inv.pinnedPositions) graphRef.current?.pinNode(pos.id)
        graphRef.current?.zoomToFit()
      }, 500)
    } finally { setIsLoading(false) }
  }, [])

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    if (!showPathFinder) setPathHighlight(null)
  }, [showPathFinder])

  const handleNavigate = useCallback((nodeId: string) => {
    expandNode(nodeId)
  }, [expandNode])

  const handleSearchSelect = useCallback((nodeId: string) => {
    expandNode(nodeId)
  }, [expandNode])

  const handleNodeRightClick = useCallback((nodeId: string, x: number, y: number) => {
    setContextMenu({ nodeId, x, y })
    setSelectedNodeId(nodeId)
  }, [])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const toggleLabel = async (label: string) => {
    let newVisible: Set<string> | null = null

    setVisibleLabels((prev) => {
      if (!prev) {
        const allLabels = new Set(LABEL_CONFIG.map((l) => l.label))
        allLabels.delete(label)
        newVisible = allLabels
        return allLabels
      }
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      if (next.size === LABEL_CONFIG.length) { newVisible = null; return null }
      newVisible = next
      return next
    })

    // For dictadura: when activating a label, fetch its nodes from server and merge
    if (slug === 'caso-dictadura' && newVisible?.has(label)) {
      const labelsInGraph = new Set(graphData.nodes.map((n) => n.label))
      if (!labelsInGraph.has(label)) {
        setIsLoading(true)
        try {
          const params = new URLSearchParams({ tiers: 'gold,silver', labels: label })
          const res = await fetch(`/api/caso/${slug}/graph?${params.toString()}`)
          if (res.ok) {
            const json = await res.json()
            if (json.data) {
              setGraphData((prev) => mergeGraphData(prev, json.data))
            }
          }
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  const hasData = filteredData.nodes.length > 0

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isInitialLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-zinc-500">
        Loading network graph...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Filter controls */}
      <div className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        {/* Primary row: Search + Label filters + Tier */}
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-64 shrink-0">
            <SearchBar onSelect={handleSearchSelect} placeholder="Search nodes..." />
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {LABEL_CONFIG.map(({ label, color, name }) => {
              const isActive = !visibleLabels || visibleLabels.has(label)
              return (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'bg-zinc-900/50 text-zinc-600 hover:bg-zinc-900 hover:text-zinc-500'
                  }`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full transition-colors"
                    style={{ backgroundColor: isActive ? color : '#3f3f46' }}
                  />
                  {name}
                </button>
              )
            })}
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="shrink-0 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
          >
            <option value="all">All data</option>
            <option value="verified">Verified only</option>
            <option value="gold">Gold only</option>
          </select>
        </div>

        {/* Secondary row: Subcategory filters (collapses when no data) */}
        {graphData.nodes.length > 0 && (
          <div className="border-t border-zinc-800/50 px-4 py-1.5">
            <CategoryFilter
              data={graphData}
              hiddenCategories={hiddenCategories}
              onChange={setHiddenCategories}
              visibleLabels={visibleLabels}
            />
          </div>
        )}
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

      {/* Graph + Detail Panel */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="relative min-h-0 flex-1">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-zinc-900/90 px-4 py-2 text-sm text-zinc-400 shadow-lg backdrop-blur-sm">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                Loading...
              </div>
            </div>
          )}

          {hasData && (
            <ForceGraph
              ref={graphRef}
              data={filteredData}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              onNodeRightClick={handleNodeRightClick}
              visibleLabels={visibleLabels}
              pinnedNodeIds={pinnedNodeIds}
              pathHighlight={pathHighlight}
            />
          )}

          {/* Zoom controls */}
          {hasData && (
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
              <button
                onClick={() => graphRef.current?.zoomIn()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-lg text-zinc-300 shadow-lg backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={() => graphRef.current?.zoomOut()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-lg text-zinc-300 shadow-lg backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white"
                title="Zoom out"
              >
                &minus;
              </button>
              <button
                onClick={() => graphRef.current?.zoomToFit()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-zinc-300 shadow-lg backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white"
                title="Fit to screen"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
          )}

          {/* Context menu */}
          {contextMenu && (
            <NodeContextMenu
              x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu}
              actions={[
                { label: pinnedNodeIds.has(contextMenu.nodeId) ? 'Unpin' : 'Pin',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12V4h1a1 1 0 100-2H7a1 1 0 000 2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2l-2-2z" /></svg>,
                  onClick: () => togglePin(contextMenu.nodeId) },
                { label: 'Expand',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
                  onClick: () => expandNode(contextMenu.nodeId) },
                { label: 'Collapse',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>,
                  onClick: () => collapseNode(contextMenu.nodeId) },
                { label: 'Path from here',
                  icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>,
                  onClick: () => { setPathSourceId(contextMenu.nodeId); setShowPathFinder(true) } },
                { label: 'Path to here',
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
            onClose={() => setSelectedNodeId(null)}
            onNavigate={handleNavigate}
            onExpand={expandNode}
            onTogglePin={togglePin}
            isPinned={pinnedNodeIds.has(selectedNodeId)}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="border-t border-zinc-800 px-4 py-1.5 text-xs text-zinc-500">
        {filteredData.nodes.length} nodes · {filteredData.links.length} connections
        {(tierFilter !== 'all' || hiddenCategories.size > 0) && (
          <span className="ml-2 text-amber-400">
            (filtered{tierFilter !== 'all' ? ` · ${tierFilter === 'verified' ? 'verified' : 'gold'}` : ''}
            {hiddenCategories.size > 0 ? ` · ${hiddenCategories.size} categories hidden` : ''})
          </span>
        )}
        {pinnedNodeIds.size > 0 && (
          <span className="ml-2">{pinnedNodeIds.size} pinned</span>
        )}
      </div>
    </div>
  )
}
