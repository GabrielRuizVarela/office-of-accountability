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
    selectedNodeId,
    focusedNodeId,
    visibleLabels,
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

  // Convert to force graph format
  const fgData = toFGData(data)

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

      // Label text — smart density based on degree centrality and zoom
      const isPinned = !!(node as unknown as { fx?: number }).fx
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
    [selectedNodeId, focusedNodeId, degreeMap, importanceThreshold],
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

  // Link color based on type
  const linkColor = useCallback((link: FGLink) => getLinkColor(link.type), [])

  // Link label
  const linkLabel = useCallback((link: FGLink) => {
    const vote = link.properties.vote
    if (typeof vote === 'string') return `${link.type}: ${vote}`
    return link.type
  }, [])

  if (!ForceGraph2D) {
    return <div ref={containerRef} className="flex h-full w-full items-center justify-center text-zinc-600">Cargando grafo...</div>
  }

  return (
    <div ref={containerRef} className="h-full w-full">
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
