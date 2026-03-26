'use client'

import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { GraphData } from '../../lib/neo4j/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubGraphEmbedAttrs {
  readonly nodeId: string
  readonly label: string
  readonly name: string
}

// ---------------------------------------------------------------------------
// Label colors (shared with ForceGraph / GraphNodeEmbed)
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Politician: '#3b82f6',
  Party: '#8b5cf6',
  Province: '#10b981',
  LegislativeVote: '#f59e0b',
  Legislation: '#ef4444',
  Investigation: '#ec4899',
}

const DEFAULT_NODE_COLOR = '#94a3b8'

// ---------------------------------------------------------------------------
// Mini graph canvas renderer (no dependency on react-force-graph-2d)
// Uses a simple force-directed layout rendered to canvas for inline display.
// ---------------------------------------------------------------------------

interface MiniNode {
  id: string
  label: string
  name: string
  color: string
  x: number
  y: number
  vx: number
  vy: number
}

interface MiniLink {
  source: string
  target: string
  type: string
}

function getDisplayName(props: Readonly<Record<string, unknown>>): string {
  if (typeof props.name === 'string') return props.name
  if (typeof props.title === 'string') return props.title
  if (typeof props.full_name === 'string') return props.full_name
  return ''
}

function buildMiniGraph(data: GraphData, centerNodeId: string): { nodes: MiniNode[]; links: MiniLink[] } {
  const nodes: MiniNode[] = data.nodes.map((n) => {
    const nodeLabel = n.labels[0] ?? 'Unknown'
    return {
      id: n.id,
      label: nodeLabel,
      name: getDisplayName(n.properties),
      color: LABEL_COLORS[nodeLabel] ?? DEFAULT_NODE_COLOR,
      x: n.id === centerNodeId ? 0 : (Math.random() - 0.5) * 200,
      y: n.id === centerNodeId ? 0 : (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
    }
  })

  const links: MiniLink[] = data.links.map((l) => ({
    source: l.source,
    target: l.target,
    type: l.type,
  }))

  return { nodes, links }
}

function simulateForces(nodes: readonly MiniNode[], links: readonly MiniLink[], iterations: number): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (80 * alpha) / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        a.vx -= fx
        a.vy -= fy
        b.vx += fx
        b.vy += fy
      }
    }

    // Attraction along links
    for (const link of links) {
      const a = nodeMap.get(link.source)
      const b = nodeMap.get(link.target)
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const force = (dist - 30) * 0.01 * alpha
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    // Center gravity
    for (const node of nodes) {
      node.vx -= node.x * 0.005 * alpha
      node.vy -= node.y * 0.005 * alpha
    }

    // Apply velocities with damping
    for (const node of nodes) {
      node.vx *= 0.6
      node.vy *= 0.6
      node.x += node.vx
      node.y += node.vy
    }
  }
}

function renderMiniGraph(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: readonly MiniNode[],
  links: readonly MiniLink[],
  centerNodeId: string,
) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // Find bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const n of nodes) {
    if (n.x < minX) minX = n.x
    if (n.x > maxX) maxX = n.x
    if (n.y < minY) minY = n.y
    if (n.y > maxY) maxY = n.y
  }

  const rangeX = (maxX - minX) || 1
  const rangeY = (maxY - minY) || 1
  const padding = 30
  const scaleX = (width - padding * 2) / rangeX
  const scaleY = (height - padding * 2) / rangeY
  const scale = Math.min(scaleX, scaleY, 3)
  const centerX = width / 2
  const centerY = height / 2
  const offsetX = (minX + maxX) / 2
  const offsetY = (minY + maxY) / 2

  function toScreen(x: number, y: number): [number, number] {
    return [
      centerX + (x - offsetX) * scale,
      centerY + (y - offsetY) * scale,
    ]
  }

  // Clear
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, width, height)

  // Draw links
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 0.5
  for (const link of links) {
    const a = nodeMap.get(link.source)
    const b = nodeMap.get(link.target)
    if (!a || !b) continue
    const [ax, ay] = toScreen(a.x, a.y)
    const [bx, by] = toScreen(b.x, b.y)
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()
  }

  // Draw nodes
  for (const node of nodes) {
    const [sx, sy] = toScreen(node.x, node.y)
    const isCenter = node.id === centerNodeId
    const radius = isCenter ? 5 : 3

    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fillStyle = node.color
    ctx.fill()

    if (isCenter) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Labels for center node and nearby nodes
    if (isCenter || nodes.length <= 15) {
      const fontSize = isCenter ? 10 : 8
      ctx.font = `${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#e2e8f0'
      const displayName = node.name.length > 20 ? `${node.name.slice(0, 18)}…` : node.name
      ctx.fillText(displayName, sx, sy + radius + 2)
    }
  }

  // Draw node count badge
  ctx.fillStyle = '#52525b'
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${nodes.length} nodos · ${links.length} conexiones`, width - 6, height - 4)
}

// ---------------------------------------------------------------------------
// Mini graph canvas component
// ---------------------------------------------------------------------------

function MiniGraphCanvas({
  data,
  centerNodeId,
  width,
  height,
}: {
  readonly data: GraphData
  readonly centerNodeId: string
  readonly width: number
  readonly height: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { nodes, links } = buildMiniGraph(data, centerNodeId)
    simulateForces(nodes, links, 80)
    renderMiniGraph(ctx, width, height, nodes, links, centerNodeId)
  }, [data, centerNodeId, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded"
      style={{ width, height }}
    />
  )
}

// ---------------------------------------------------------------------------
// Sub-graph embed view (editor mode - with delete)
// ---------------------------------------------------------------------------

function SubGraphEmbedEditorView(props: {
  readonly node: { attrs: SubGraphEmbedAttrs }
  readonly deleteNode: () => void
  readonly selected: boolean
}) {
  const { nodeId, label, name } = props.node.attrs
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const color = LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR

  useEffect(() => {
    let cancelled = false

    async function fetchGraph() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/graph/expand/${encodeURIComponent(nodeId)}?depth=1`)
        if (!res.ok) {
          setError(`Error ${res.status}`)
          return
        }
        const json = await res.json()
        if (!cancelled && json.success && json.data) {
          setGraphData(json.data as GraphData)
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el grafo')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchGraph()
    return () => { cancelled = true }
  }, [nodeId])

  return (
    <NodeViewWrapper className="my-4">
      <div
        className={`relative overflow-hidden rounded-lg border ${
          props.selected ? 'border-blue-500' : 'border-zinc-700'
        } bg-zinc-900`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-3 py-1.5">
          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-zinc-300">Sub-grafo:</span>
            <span className="font-medium text-zinc-100">{name}</span>
            <span className="text-xs text-zinc-500">({label})</span>
          </div>
          <button
            type="button"
            className="text-sm text-zinc-500 hover:text-zinc-300"
            onClick={props.deleteNode}
            aria-label={`Eliminar sub-grafo de ${name}`}
          >
            ✕
          </button>
        </div>

        {/* Graph area */}
        <div className="flex items-center justify-center" style={{ height: 220 }}>
          {isLoading && (
            <span className="text-xs text-zinc-500">Cargando sub-grafo…</span>
          )}
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          {graphData && !isLoading && (
            <MiniGraphCanvas
              data={graphData}
              centerNodeId={nodeId}
              width={560}
              height={220}
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// Sub-graph embed view (read-only - clickable link to explorer)
// ---------------------------------------------------------------------------

function SubGraphEmbedReadView(props: {
  readonly node: { attrs: SubGraphEmbedAttrs }
}) {
  const { nodeId, label, name } = props.node.attrs
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const color = LABEL_COLORS[label] ?? DEFAULT_NODE_COLOR

  useEffect(() => {
    let cancelled = false

    async function fetchGraph() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/graph/expand/${encodeURIComponent(nodeId)}?depth=1`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled && json.success && json.data) {
          setGraphData(json.data as GraphData)
        }
      } catch {
        // Silently fail - empty state is fine
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchGraph()
    return () => { cancelled = true }
  }, [nodeId])

  return (
    <NodeViewWrapper className="my-4">
      <a
        href={`/explorar?node=${encodeURIComponent(nodeId)}`}
        className="block overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 no-underline transition-colors hover:border-zinc-600"
        title={`Explorar sub-grafo de ${name}`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-1.5 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-zinc-300">Sub-grafo:</span>
          <span className="font-medium text-zinc-100">{name}</span>
          <span className="text-xs text-zinc-500">({label})</span>
          <span className="ml-auto text-xs text-zinc-500">Clic para explorar →</span>
        </div>

        {/* Graph area */}
        <div className="flex items-center justify-center" style={{ height: 220 }}>
          {isLoading && (
            <span className="text-xs text-zinc-500">Cargando sub-grafo…</span>
          )}
          {graphData && !isLoading && (
            <MiniGraphCanvas
              data={graphData}
              centerNodeId={nodeId}
              width={560}
              height={220}
            />
          )}
          {!graphData && !isLoading && (
            <span className="text-xs text-zinc-500">Sub-grafo no disponible</span>
          )}
        </div>
      </a>
    </NodeViewWrapper>
  )
}

// ---------------------------------------------------------------------------
// TipTap extension (editor mode)
// ---------------------------------------------------------------------------

export const SubGraphEmbedExtension = Node.create({
  name: 'subGraphEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      nodeId: { default: '' },
      label: { default: '' },
      name: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-sub-graph-embed]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-sub-graph-embed': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SubGraphEmbedEditorView as React.ComponentType<unknown>)
  },
})

// ---------------------------------------------------------------------------
// TipTap extension (read-only mode)
// ---------------------------------------------------------------------------

export const SubGraphEmbedReadExtension = Node.create({
  name: 'subGraphEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      nodeId: { default: '' },
      label: { default: '' },
      name: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-sub-graph-embed]' }]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-sub-graph-embed': '' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SubGraphEmbedReadView as React.ComponentType<unknown>)
  },
})
