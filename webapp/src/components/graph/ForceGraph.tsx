'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d'

import type { GraphData, GraphNode } from '../../lib/neo4j/types'

// ---------------------------------------------------------------------------
// Label → color mapping
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6', // blue-500
  Party: '#8b5cf6', // violet-500
  Province: '#10b981', // emerald-500
  LegislativeVote: '#f59e0b', // amber-500
  Legislation: '#ef4444', // red-500
  Investigation: '#ec4899', // pink-500
  User: '#6b7280', // gray-500
}

const DEFAULT_NODE_COLOR = '#94a3b8' // slate-400

function getNodeColor(node: GraphNode): string {
  const label = node.labels[0]
  return label ? (LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR) : DEFAULT_NODE_COLOR
}

// ---------------------------------------------------------------------------
// Label → display name
// ---------------------------------------------------------------------------

function getNodeLabel(node: GraphNode): string {
  const props = node.properties
  if (typeof props.name === 'string') return props.name
  if (typeof props.title === 'string') return props.title
  if (typeof props.full_name === 'string') return props.full_name
  return node.id
}

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

export interface ForceGraphProps {
  readonly data: GraphData
  readonly onNodeClick?: (nodeId: string) => void
  readonly selectedNodeId?: string | null
  readonly visibleLabels?: ReadonlySet<string> | null
  readonly width?: number
  readonly height?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ForceGraph({
  data,
  onNodeClick,
  selectedNodeId,
  visibleLabels,
  width,
  height,
}: ForceGraphProps) {
  const graphRef = useRef<ForceGraphMethods<FGNode, FGLink> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: width ?? 800, height: height ?? 600 })

  // Responsive sizing
  useEffect(() => {
    if (width && height) return

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: width ?? entry.contentRect.width,
          height: height ?? entry.contentRect.height,
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [width, height])

  // Convert to force graph format
  const fgData = toFGData(data)

  // Zoom to fit on data change
  useEffect(() => {
    const fg = graphRef.current
    if (fg && data.nodes.length > 0) {
      setTimeout(() => fg.zoomToFit(400, 40), 300)
    }
  }, [data.nodes.length])

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
      const radius = isSelected ? 6 : 4

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

      // Label text (only show when zoomed in enough)
      if (globalScale > 1.5 || isSelected) {
        const fontSize = Math.max(12 / globalScale, 2)
        ctx.font = `${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#e2e8f0' // slate-200
        ctx.fillText(fgNode._label, x, y + radius + 2)
      }
    },
    [selectedNodeId],
  )

  // Pointer area for custom-rendered nodes
  const paintPointerArea = useCallback(
    (node: NodeObject<FGNode>, color: string, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0
      const y = node.y ?? 0
      const fgNode = node as FGNode
      const isSelected = selectedNodeId === fgNode.id
      const radius = isSelected ? 8 : 6

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    },
    [selectedNodeId],
  )

  // Link color based on type
  const linkColor = useCallback((link: FGLink) => {
    switch (link.type) {
      case 'CAST_VOTE':
        return '#475569' // slate-600
      case 'MEMBER_OF':
        return '#7c3aed' // violet-600
      case 'REPRESENTS':
        return '#059669' // emerald-600
      case 'REFERENCES':
        return '#dc2626' // red-600
      default:
        return '#334155' // slate-700
    }
  }, [])

  // Link label
  const linkLabel = useCallback((link: FGLink) => {
    const vote = link.properties.vote
    if (typeof vote === 'string') return `${link.type}: ${vote}`
    return link.type
  }, [])

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
        onNodeClick={handleNodeClick}
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
}
