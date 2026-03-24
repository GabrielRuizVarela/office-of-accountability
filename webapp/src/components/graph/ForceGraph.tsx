'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d'

import type { GraphData, GraphNode } from '../../lib/neo4j/types'
import { getNodeColor, getNodeLabel, getLinkColor, getLabelDisplayName } from '../../lib/graph/constants'

// ---------------------------------------------------------------------------
// Graph data conversion — our GraphData → react-force-graph format
// ---------------------------------------------------------------------------

interface FGNode {
  readonly id: string
  readonly labels: readonly string[]
  readonly properties: Readonly<Record<string, unknown>>
  readonly _color: string
  readonly _label: string
}

interface FGLink {
  readonly source: string
  readonly target: string
  readonly type: string
  readonly properties: Readonly<Record<string, unknown>>
}

interface FGGraphData {
  readonly nodes: FGNode[]
  readonly links: FGLink[]
}

function toFGData(data: GraphData): FGGraphData {
  const nodes = data.nodes.map((n) => ({
    ...n,
    _color: getNodeColor(n),
    _label: getNodeLabel(n),
  }))
  const links = data.links.map((l) => ({ ...l }))
  return { nodes, links }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ForceGraphHandle {
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  centerOnNode: (nodeId: string) => void
  pinNode: (nodeId: string) => void
  unpinNode: (nodeId: string) => void
  unpinAll: () => void
  /** Access internal force graph node state (positions, velocities) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInternalNodes: () => Array<{ id: any; x?: number; y?: number; vx?: number; vy?: number }>
}

export interface ForceGraphProps {
  readonly data: GraphData
  readonly onNodeClick?: (nodeId: string) => void
  readonly selectedNodeId?: string | null
  readonly focusedNodeId?: string | null
  readonly visibleLabels?: ReadonlySet<string> | null
  readonly pinnedNodeIds?: ReadonlySet<string>
  readonly onNodeRightClick?: (nodeId: string, screenX: number, screenY: number) => void
  readonly pathHighlight?: { nodeIds: ReadonlySet<string>; linkKeys: ReadonlySet<string> } | null
  readonly width?: number
  readonly height?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Lazy-loaded ForceGraph2D — the library accesses `window` at import time,
// so it cannot be imported during SSR.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph2DComponent = React.ComponentType<any>

let ForceGraph2DPromise: Promise<ForceGraph2DComponent> | null = null
function getForceGraph2D(): Promise<ForceGraph2DComponent> {
  if (!ForceGraph2DPromise) {
    ForceGraph2DPromise = import('react-force-graph-2d').then((m) => m.default)
  }
  return ForceGraph2DPromise
}

export const ForceGraph = forwardRef<ForceGraphHandle, ForceGraphProps>(function ForceGraph(
  {
    data,
    onNodeClick,
    onNodeRightClick,
    selectedNodeId,
    focusedNodeId,
    visibleLabels,
    pinnedNodeIds,
    pathHighlight,
    width,
    height,
  },
  ref,
) {
  const graphRef = useRef<ForceGraphMethods<FGNode, FGLink> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const frozenRef = useRef(false)
  const [dimensions, setDimensions] = useState({ width: width ?? 800, height: height ?? 600 })
  const [ForceGraph2D, setForceGraph2D] = useState<ForceGraph2DComponent | null>(null)

  // Dynamically import ForceGraph2D on mount (client-only)
  useEffect(() => {
    getForceGraph2D().then((Component) => setForceGraph2D(() => Component))
  }, [])

  // Access internal force simulation nodes via d3Force
  // graphData() is NOT exposed on the ref — use d3Force('link').links() for links
  // and traverse the simulation's nodes array for node state (x, y, fx, fy)
  function getInternalNodes(): NodeObject<FGNode>[] {
    const fg = graphRef.current
    if (!fg) return []
    // The d3 simulation nodes are accessible through the force engine
    try {
      const sim = (fg as unknown as { d3Force: (name: string) => unknown }).d3Force('charge')
      // The simulation object itself has .nodes() but we can't access it directly.
      // Instead, use the fact that fgData.nodes are mutated in-place by the simulation
      // with x, y, vx, vy, fx, fy properties added at runtime.
      return fgData.nodes as unknown as NodeObject<FGNode>[]
    } catch {
      return []
    }
  }

  function findInternalNode(nodeId: string): NodeObject<FGNode> | undefined {
    return getInternalNodes().find((n) => n.id === nodeId)
  }

  // Expose zoom controls to parent
  const ZOOM_STEP = 1.5
  useImperativeHandle(ref, () => ({
    zoomIn() {
      const fg = graphRef.current
      if (!fg) return
      const currentZoom = fg.zoom()
      fg.zoom(currentZoom * ZOOM_STEP, 300)
    },
    zoomOut() {
      const fg = graphRef.current
      if (!fg) return
      const currentZoom = fg.zoom()
      fg.zoom(currentZoom / ZOOM_STEP, 300)
    },
    zoomToFit() {
      const fg = graphRef.current
      if (!fg) return
      fg.zoomToFit(400, 40)
    },
    centerOnNode(nodeId: string) {
      const node = findInternalNode(nodeId)
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        graphRef.current?.centerAt(node.x, node.y, 300)
      }
    },
    pinNode(nodeId: string) {
      const node = findInternalNode(nodeId)
      if (node) { node.fx = node.x; node.fy = node.y }
    },
    unpinNode(nodeId: string) {
      const node = findInternalNode(nodeId)
      if (node) { node.fx = undefined; node.fy = undefined }
    },
    unpinAll() {
      for (const node of getInternalNodes()) { node.fx = undefined; node.fy = undefined }
    },
    getInternalNodes,
  }))

  // Responsive sizing — ignore tiny heights that occur before flex layout settles
  useEffect(() => {
    if (width && height) return

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const w = width ?? entry.contentRect.width
        const h = height ?? entry.contentRect.height
        // Skip bogus measurements before flex layout has computed the real size
        if (h < 100) return
        setDimensions({ width: w, height: h })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [width, height])

  // Convert to force graph format — memoize to avoid restarting simulation on re-renders
  const fgData = useMemo(() => toFGData(data), [data])

  // Reset frozen state when data changes so new layouts can converge
  useEffect(() => {
    frozenRef.current = false
  }, [data])

  // Track whether we've done the initial zoomToFit
  const hasAutoZoomed = useRef(false)

  // Freeze all nodes after layout converges — fx/fy pins make d3-force skip force calcs
  const handleEngineStop = useCallback(() => {
    if (frozenRef.current) return
    const fg = graphRef.current
    if (!fg) return
    const nodes = fgData.nodes as unknown as NodeObject<FGNode>[]
    for (const node of nodes) {
      if (typeof node.x === 'number') node.fx = node.x
      if (typeof node.y === 'number') node.fy = node.y
    }
    frozenRef.current = true
    // Only auto-zoomToFit on the very first convergence, not on subsequent data merges
    if (!hasAutoZoomed.current) {
      hasAutoZoomed.current = true
      fg.zoomToFit(0, 40)
    }
  }, [fgData.nodes])

  // Configure d3 forces (runs once on mount / data change)
  useEffect(() => {
    const fg = graphRef.current
    if (!fg) return
    const fgAny = fg as unknown as {
      d3Force: (name: string, force?: unknown) => unknown
    }
    try {
      const n = data.nodes.length
      // Cap charge strength to avoid numerical overflow on large graphs
      const chargeStrength = n > 2000 ? -300 : -Math.max(80, n * 2.5)
      const linkDistance = n > 2000 ? 30 : Math.max(50, n * 1.5)

      const charge = fgAny.d3Force('charge')
      if (charge && typeof (charge as { strength: (v: number) => void }).strength === 'function') {
        (charge as { strength: (v: number) => void }).strength(chargeStrength)
      }
      const link = fgAny.d3Force('link')
      if (link && typeof (link as { distance: (v: number) => void }).distance === 'function') {
        (link as { distance: (v: number) => void }).distance(linkDistance)
      }
    } catch { /* */ }
  }, [data.nodes.length])

  const { degreeMap, importanceThreshold } = useMemo(() => {
    const dm = new Map<string, number>()
    for (const node of data.nodes) {
      dm.set(node.id, 0)
    }
    for (const link of data.links) {
      dm.set(link.source as string, (dm.get(link.source as string) ?? 0) + 1)
      dm.set(link.target as string, (dm.get(link.target as string) ?? 0) + 1)
    }
    const degrees = [...dm.values()].sort((a, b) => b - a)
    const topIndex = Math.max(1, Math.floor(degrees.length * 0.2))
    const threshold = degrees[topIndex - 1] ?? 1
    return { degreeMap: dm, importanceThreshold: threshold }
  }, [data.nodes, data.links])

  const labelStateRef = useRef({ showAll: true, showImportant: true })
  const hoveredNodeRef = useRef<string | null>(null)

  const updateLabelState = useCallback((zoom: number) => {
    const state = labelStateRef.current
    state.showAll = zoom > 0.8
    state.showImportant = zoom > 0.4
  }, [])

  // Node click handler — use ref so the callback identity never changes
  // (ForceGraph2D kapsule may not update callbacks reliably on re-renders)
  const onNodeClickRef = useRef(onNodeClick)
  onNodeClickRef.current = onNodeClick
  const handleNodeClick = useCallback(
    (node: NodeObject<FGNode>) => {
      if (onNodeClickRef.current && typeof node.id === 'string') {
        onNodeClickRef.current(node.id)
      }
    },
    [],
  )

  // Node visibility filter — hide isolated (degree-0) nodes
  const nodeVisibility = useCallback(
    (node: NodeObject<FGNode>) => {
      const fgNode = node as FGNode
      if ((degreeMap.get(fgNode.id) ?? 0) === 0) return false
      if (!visibleLabels) return true
      return fgNode.labels.some((label) => visibleLabels.has(label))
    },
    [visibleLabels, degreeMap],
  )

  // Custom node canvas render — colored circle + label text
  const paintNode = useCallback(
    (node: NodeObject<FGNode>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const fgNode = node as FGNode
      const x = node.x ?? 0
      const y = node.y ?? 0
      const isSelected = selectedNodeId === fgNode.id
      const isFocused = focusedNodeId === fgNode.id
      const degree = degreeMap.get(fgNode.id) ?? 0
      const baseRadius = Math.min(4 + degree * 0.5, 12)
      const radius = isSelected ? baseRadius + 2 : baseRadius
      const isBronze = (fgNode as unknown as { properties?: { confidence_tier?: string } }).properties?.confidence_tier === 'bronze'

      ctx.globalAlpha = isBronze ? 0.5 : 1.0

      if (pathHighlight && !pathHighlight.nodeIds.has(fgNode.id) && !isSelected) {
        ctx.globalAlpha = 0.15
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = fgNode._color
      ctx.fill()

      // Selected highlight ring
      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, radius + 2, 0, 2 * Math.PI)
        ctx.strokeStyle = fgNode._color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Keyboard focus ring (dashed)
      if (isFocused && !isSelected) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radius + 3, 0, 2 * Math.PI)
        ctx.setLineDash([3 / globalScale, 2 / globalScale])
        ctx.strokeStyle = '#facc15' // yellow-400
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()
      }

      // Pin indicator
      const isPinned = pinnedNodeIds?.has(fgNode.id) ?? false
      if (isPinned) {
        ctx.beginPath()
        ctx.arc(x, y - radius - 3, 2, 0, 2 * Math.PI)
        ctx.fillStyle = '#facc15'
        ctx.fill()
      }
      const isImportant = degree >= importanceThreshold
      const isHovered = hoveredNodeRef.current === fgNode.id

      // Hover glow
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = fgNode._color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = isBronze ? 0.5 : 1.0
      }

      const shouldShowLabel =
        isSelected || isFocused || isPinned || isHovered ||
        isImportant ||
        labelStateRef.current.showAll

      if (shouldShowLabel) {
        const fontSize = Math.max(12 / globalScale, 2)
        const fontWeight = (isSelected || isPinned || isHovered) ? 'bold' : 'normal'
        ctx.font = `${fontWeight} ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = isHovered ? '#ffffff' : '#e2e8f0'
        ctx.fillText(fgNode._label, x, y + radius + 2)

        // Node type tag below name
        if ((isHovered || isSelected || globalScale > 1.2) && fgNode.labels[0]) {
          const tagText = getLabelDisplayName(fgNode.labels[0])
          const tagFontSize = Math.max(9 / globalScale, 1.5)
          ctx.font = `${tagFontSize}px sans-serif`
          ctx.fillStyle = fgNode._color
          ctx.globalAlpha = 0.7
          ctx.fillText(tagText, x, y + radius + 2 + fontSize + 1)
          ctx.globalAlpha = 1.0
        }
      }

      ctx.globalAlpha = 1.0
    },
    [selectedNodeId, focusedNodeId, degreeMap, importanceThreshold, pinnedNodeIds, pathHighlight],
  )

  // Pointer area for custom-rendered nodes
  const paintPointerArea = useCallback(
    (node: NodeObject<FGNode>, color: string, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const fgNode = node as FGNode
      const degree = degreeMap.get(fgNode.id) ?? 0
      const baseRadius = Math.min(4 + degree * 0.5, 12)
      const radius = (selectedNodeId === fgNode.id ? baseRadius + 4 : baseRadius + 2)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    },
    [selectedNodeId, degreeMap],
  )

  // Hover tooltip
  const nodeTooltip = useCallback((node: NodeObject<FGNode>) => {
    const fgNode = node as FGNode
    const label = fgNode.labels[0] ?? ''
    return `${fgNode._label} (${getLabelDisplayName(label)})`
  }, [])

  // Link color based on type — highlight path links when active
  const linkColor = useCallback((link: FGLink) => {
    if (pathHighlight) {
      const src = typeof link.source === 'string' ? link.source : (link.source as unknown as {id:string}).id
      const tgt = typeof link.target === 'string' ? link.target : (link.target as unknown as {id:string}).id
      const key = `${src}:${tgt}:${link.type}`
      const reverseKey = `${tgt}:${src}:${link.type}`
      if (pathHighlight.linkKeys.has(key) || pathHighlight.linkKeys.has(reverseKey)) {
        return '#60a5fa' // bright blue
      }
      return '#1a1a2e' // very dim
    }
    return getLinkColor(link.type)
  }, [pathHighlight])

  // Link label
  const linkLabel = useCallback((link: FGLink) => {
    const vote = link.properties.vote
    if (typeof vote === 'string') return `${link.type}: ${vote}`
    return link.type
  }, [])

  // Right-click handler — use ref for stable callback + library's built-in onNodeRightClick
  const onNodeRightClickRef = useRef(onNodeRightClick)
  onNodeRightClickRef.current = onNodeRightClick

  const handleNodeRightClick = useCallback(
    (node: NodeObject<FGNode>, event: MouseEvent) => {
      if (onNodeRightClickRef.current && typeof node.id === 'string') {
        event.preventDefault()
        onNodeRightClickRef.current(node.id, event.clientX, event.clientY)
      }
    },
    [],
  )

  // Prevent browser context menu on the graph area when right-click handler is set
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (onNodeRightClickRef.current) e.preventDefault()
  }, [])


  if (!ForceGraph2D) {
    return <div ref={containerRef} className="flex h-full w-full items-center justify-center text-zinc-600">Cargando grafo...</div>
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      onContextMenu={handleContextMenu}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={fgData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#09090b"
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        nodePointerAreaPaint={paintPointerArea}
        nodeVisibility={nodeVisibility}
        linkColor={linkColor as (link: object) => string}
        linkLabel={linkLabel as (link: object) => string}
        linkWidth={1}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.1}
        nodeLabel=""
        onNodeClick={(node: NodeObject<FGNode>) => {
          handleNodeClick(node)
        }}
        onNodeRightClick={handleNodeRightClick}
        onNodeHover={(node: NodeObject<FGNode> | null) => {
          hoveredNodeRef.current = node ? (node as FGNode).id : null
          const canvas = containerRef.current?.querySelector('canvas')
          if (canvas) canvas.style.cursor = node ? 'pointer' : 'default'
        }}
        onZoom={(transform: { k: number }) => updateLabelState(transform.k)}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={false}
        warmupTicks={300}
        cooldownTicks={0}
        cooldownTime={0}
        d3AlphaDecay={0.0228}
        d3VelocityDecay={0.4}
        onEngineStop={handleEngineStop}
        minZoom={0.01}
        maxZoom={20}
      />
    </div>
  )
})
