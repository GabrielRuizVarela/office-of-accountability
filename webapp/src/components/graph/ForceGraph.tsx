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
  const [dimensions, setDimensions] = useState({ width: width ?? 800, height: height ?? 600 })
  const [ForceGraph2D, setForceGraph2D] = useState<ForceGraph2DComponent | null>(null)

  // Dynamically import ForceGraph2D on mount (client-only)
  useEffect(() => {
    getForceGraph2D().then((Component) => setForceGraph2D(() => Component))
  }, [])

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
      const fg = graphRef.current
      if (!fg) return
      // Access internal graph data via the untyped kapsule method
      const internalGraphData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
      const node = internalGraphData.nodes.find((n) => n.id === nodeId)
      if (node && typeof node.x === 'number' && typeof node.y === 'number') {
        fg.centerAt(node.x, node.y, 300)
      }
    },
    pinNode(nodeId: string) {
      const fg = graphRef.current
      if (!fg) return
      const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
      const node = internalData.nodes.find((n) => n.id === nodeId)
      if (node) { node.fx = node.x; node.fy = node.y }
    },
    unpinNode(nodeId: string) {
      const fg = graphRef.current
      if (!fg) return
      const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
      const node = internalData.nodes.find((n) => n.id === nodeId)
      if (node) { node.fx = undefined; node.fy = undefined }
    },
    unpinAll() {
      const fg = graphRef.current
      if (!fg) return
      const internalData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
      for (const node of internalData.nodes) { node.fx = undefined; node.fy = undefined }
    },
    getInternalNodes() {
      const fg = graphRef.current
      if (!fg) return []
      const internalGraphData = (fg as unknown as { graphData(): { nodes: NodeObject<FGNode>[] } }).graphData()
      return internalGraphData?.nodes ?? []
    },
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

  const labelStateRef = useRef({ showAll: false, showImportant: false })

  const updateLabelState = useCallback((zoom: number) => {
    const state = labelStateRef.current
    state.showAll = state.showAll ? zoom > 1.8 : zoom > 2.0
    state.showImportant = state.showImportant ? zoom > 0.8 : zoom > 1.0
  }, [])

  // Node click handler
  const handleNodeClick = useCallback(
    (node: NodeObject<FGNode>) => {
      if (onNodeClick && typeof node.id === 'string') {
        onNodeClick(node.id)
      }
    },
    [onNodeClick],
  )

  // Node visibility filter
  const nodeVisibility = useCallback(
    (node: NodeObject<FGNode>) => {
      if (!visibleLabels) return true
      const fgNode = node as FGNode
      return fgNode.labels.some((label) => visibleLabels.has(label))
    },
    [visibleLabels],
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

      const shouldShowLabel =
        isSelected || isFocused || isPinned ||
        labelStateRef.current.showAll ||
        (isImportant && labelStateRef.current.showImportant)

      if (shouldShowLabel) {
        const fontSize = Math.max(12 / globalScale, 2)
        const fontWeight = (isSelected || isPinned) ? 'bold' : 'normal'
        ctx.font = `${fontWeight} ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#e2e8f0'
        ctx.fillText(fgNode._label, x, y + radius + 2)
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

  // Right-click context menu — uses React onContextMenu for reliable preventDefault
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!onNodeRightClick) return
      e.preventDefault()
      const fg = graphRef.current
      if (!fg) return
      const container = containerRef.current
      if (!container) return
      const canvas = container.querySelector('canvas')
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const graphCoords = (fg as unknown as { screen2GraphCoords(x: number, y: number): { x: number; y: number } })
        .screen2GraphCoords(e.clientX - rect.left, e.clientY - rect.top)
      const internalData = (fg as unknown as { graphData(): { nodes: Array<{ id: string; x?: number; y?: number }> } }).graphData()

      let closest: { id: string; dist: number } | null = null
      for (const node of internalData.nodes) {
        if (typeof node.x !== 'number' || typeof node.y !== 'number') continue
        const dx = graphCoords.x - node.x
        const dy = graphCoords.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 15 && (!closest || dist < closest.dist)) {
          closest = { id: node.id as string, dist }
        }
      }
      if (closest) onNodeRightClick(closest.id, e.clientX, e.clientY)
    },
    [onNodeRightClick],
  )

  // Long-press for mobile context menu
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!onNodeRightClick) return
      const touch = e.touches[0]
      if (!touch) return
      longPressTimerRef.current = setTimeout(() => {
        handleContextMenu({
          preventDefault: () => {},
          clientX: touch.clientX,
          clientY: touch.clientY,
        } as unknown as React.MouseEvent)
      }, 500)
    },
    [onNodeRightClick, handleContextMenu],
  )
  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  if (!ForceGraph2D) {
    return <div ref={containerRef} className="flex h-full w-full items-center justify-center text-zinc-600">Cargando grafo...</div>
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
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
        nodeLabel={nodeTooltip as (node: object) => string}
        onNodeClick={handleNodeClick}
        onZoom={(transform: { k: number }) => updateLabelState(transform.k)}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        minZoom={0.5}
        maxZoom={20}
      />
    </div>
  )
})
