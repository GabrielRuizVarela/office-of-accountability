'use client'

/**
 * Expandable target card — shows actor info, mini force-graph of their
 * 1-hop graph neighborhood, and a textual relationship list.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import type { GraphData } from '@/lib/neo4j/types'
import type { Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TargetCardProps {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly description: string
  readonly nationality: string
  readonly status?: string
  readonly party?: string
  readonly datasets?: number
  readonly sourceUrl?: string
  readonly actorSlug: string
  readonly investigationSlug: string
  readonly lang: Lang
}

// ---------------------------------------------------------------------------
// Label colors (shared with graph components)
// ---------------------------------------------------------------------------

const LABEL_COLORS: Readonly<Record<string, string>> = {
  Person: '#3b82f6',
  CasoLibraPerson: '#3b82f6',
  Politician: '#3b82f6',
  Document: '#ef4444',
  Event: '#f59e0b',
  Location: '#10b981',
  Organization: '#8b5cf6',
  Flight: '#06b6d4',
  LegalCase: '#ec4899',
  Token: '#f97316',
  WalletAddress: '#14b8a6',
  Party: '#8b5cf6',
  Province: '#10b981',
  Investigation: '#ec4899',
}

const DEFAULT_COLOR = '#94a3b8'

// ---------------------------------------------------------------------------
// Mini graph types & renderer
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

function buildMiniGraph(
  data: GraphData,
  centerNodeId: string,
): { nodes: MiniNode[]; links: MiniLink[] } {
  const nodes: MiniNode[] = data.nodes.map((n) => {
    const nodeLabel = n.labels[0] ?? 'Unknown'
    return {
      id: n.id,
      label: nodeLabel,
      name: getDisplayName(n.properties),
      color: LABEL_COLORS[nodeLabel] ?? DEFAULT_COLOR,
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

function simulateForces(
  nodes: readonly MiniNode[],
  links: readonly MiniLink[],
  iterations: number,
  centerNodeId: string,
): void {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const n = nodes.length
  // Scale repulsion with node count so large graphs spread out
  const repulsion = Math.max(120, n * 3)
  // Ideal link length grows with density
  const idealDist = Math.max(40, Math.sqrt(n) * 8)

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations

    // Repulsion between all pairs
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (repulsion * alpha) / (dist * dist)
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
      const force = (dist - idealDist) * 0.008 * alpha
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      a.vx += fx
      a.vy += fy
      b.vx -= fx
      b.vy -= fy
    }

    // Gentle center gravity (stronger for center node)
    for (const node of nodes) {
      const gravity = node.id === centerNodeId ? 0.01 : 0.003
      node.vx -= node.x * gravity * alpha
      node.vy -= node.y * gravity * alpha
    }

    // Apply velocities with damping
    for (const node of nodes) {
      node.vx *= 0.55
      node.vy *= 0.55
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

  // Compute degree for each node (used for sizing and label visibility)
  const degree = new Map<string, number>()
  for (const link of links) {
    degree.set(link.source, (degree.get(link.source) ?? 0) + 1)
    degree.set(link.target, (degree.get(link.target) ?? 0) + 1)
  }

  // Bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const n of nodes) {
    if (n.x < minX) minX = n.x
    if (n.x > maxX) maxX = n.x
    if (n.y < minY) minY = n.y
    if (n.y > maxY) maxY = n.y
  }

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const padding = 20
  const scaleX = (width - padding * 2) / rangeX
  const scaleY = (height - padding * 2) / rangeY
  const scale = Math.min(scaleX, scaleY, 3)
  const cx = width / 2
  const cy = height / 2
  const ox = (minX + maxX) / 2
  const oy = (minY + maxY) / 2

  function toScreen(x: number, y: number): [number, number] {
    return [cx + (x - ox) * scale, cy + (y - oy) * scale]
  }

  // Background
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, width, height)

  // Links — thin, semi-transparent
  ctx.strokeStyle = '#27272a'
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

  // Determine which nodes get labels: center + top N by degree
  const isLarge = nodes.length > 15
  const labelBudget = isLarge ? Math.min(8, Math.ceil(nodes.length * 0.15)) : nodes.length
  const sortedByDegree = [...nodes]
    .filter((n) => n.id !== centerNodeId)
    .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0))
  const labelSet = new Set<string>([centerNodeId])
  for (let i = 0; i < labelBudget - 1 && i < sortedByDegree.length; i++) {
    labelSet.add(sortedByDegree[i].id)
  }

  // Nodes — size by degree
  for (const node of nodes) {
    const [sx, sy] = toScreen(node.x, node.y)
    const isCenter = node.id === centerNodeId
    const deg = degree.get(node.id) ?? 0
    const radius = isCenter ? 7 : Math.min(2.5 + deg * 0.4, 6)

    ctx.beginPath()
    ctx.arc(sx, sy, radius, 0, Math.PI * 2)
    ctx.fillStyle = node.color
    ctx.globalAlpha = isCenter || labelSet.has(node.id) ? 1.0 : 0.7
    ctx.fill()
    ctx.globalAlpha = 1.0

    if (isCenter) {
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  // Labels — only for center + high-degree nodes, with collision avoidance
  const placedLabels: { x: number; y: number; w: number; h: number }[] = []

  function labelFits(lx: number, ly: number, lw: number, lh: number): boolean {
    for (const p of placedLabels) {
      if (lx < p.x + p.w && lx + lw > p.x && ly < p.y + p.h && ly + lh > p.y) {
        return false
      }
    }
    return true
  }

  // Draw center label first (always shown)
  const centerNode = nodeMap.get(centerNodeId)
  if (centerNode) {
    const [sx, sy] = toScreen(centerNode.x, centerNode.y)
    ctx.font = 'bold 10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#ffffff'
    const name = centerNode.name.length > 22 ? `${centerNode.name.slice(0, 20)}...` : centerNode.name
    const tw = ctx.measureText(name).width
    const lx = sx - tw / 2
    const ly = sy + 9
    ctx.fillText(name, sx, ly)
    placedLabels.push({ x: lx, y: ly, w: tw, h: 12 })
  }

  // Draw labels for high-degree nodes (skip if they'd overlap)
  for (const node of sortedByDegree) {
    if (!labelSet.has(node.id)) continue
    const [sx, sy] = toScreen(node.x, node.y)
    const deg = degree.get(node.id) ?? 0
    const radius = Math.min(2.5 + deg * 0.4, 6)
    ctx.font = '8px sans-serif'
    const name = node.name.length > 18 ? `${node.name.slice(0, 16)}...` : node.name
    const tw = ctx.measureText(name).width
    const lx = sx - tw / 2
    const ly = sy + radius + 3
    if (labelFits(lx, ly, tw, 10)) {
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#a1a1aa'
      ctx.fillText(name, sx, ly)
      placedLabels.push({ x: lx, y: ly, w: tw, h: 10 })
    }
  }

  // Badge
  ctx.fillStyle = '#52525b'
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${nodes.length} nodes · ${links.length} links`, width - 6, height - 4)
}

// ---------------------------------------------------------------------------
// Mini graph canvas component
// ---------------------------------------------------------------------------

function MiniGraphCanvas({
  data,
  centerNodeId,
}: {
  readonly data: GraphData
  readonly centerNodeId: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const width = container.clientWidth
    const nodeCount = data.nodes.length
    const height = nodeCount > 30 ? 320 : nodeCount > 15 ? 260 : 220
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const { nodes, links } = buildMiniGraph(data, centerNodeId)
    simulateForces(nodes, links, 120, centerNodeId)
    renderMiniGraph(ctx, width, height, nodes, links, centerNodeId)
  }, [data, centerNodeId])

  useEffect(() => {
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [draw])

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="rounded" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Relationship list
// ---------------------------------------------------------------------------

function RelationshipList({
  data,
  centerNodeId,
}: {
  readonly data: GraphData
  readonly centerNodeId: string
}) {
  const relationships = data.links.map((link) => {
    const otherNodeId =
      link.source === centerNodeId ? link.target : link.source
    const otherNode = data.nodes.find((n) => n.id === otherNodeId)
    const otherName = otherNode ? getDisplayName(otherNode.properties) : '?'
    const otherLabel = otherNode?.labels[0] ?? 'Unknown'
    const color = LABEL_COLORS[otherLabel] ?? DEFAULT_COLOR
    return {
      type: link.type.replace(/_/g, ' '),
      name: otherName,
      color,
      label: otherLabel,
    }
  })

  if (relationships.length === 0) return null

  return (
    <div className="space-y-1.5">
      {relationships.slice(0, 12).map((rel, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
            {rel.type}
          </span>
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: rel.color }}
          />
          <span className="truncate text-zinc-300">{rel.name}</span>
          <span className="text-[10px] text-zinc-600">{rel.label}</span>
        </div>
      ))}
      {relationships.length > 12 && (
        <p className="text-[10px] text-zinc-600">
          +{relationships.length - 12} more
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TargetCard
// ---------------------------------------------------------------------------

export function TargetCard({
  id,
  name,
  role,
  description,
  nationality,
  status,
  party,
  datasets,
  sourceUrl,
  actorSlug,
  investigationSlug,
  lang,
}: TargetCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [graphNodeId, setGraphNodeId] = useState<string | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphError, setGraphError] = useState(false)
  const fetchedRef = useRef(false)

  // Fetch graph data when expanded
  useEffect(() => {
    if (!expanded || fetchedRef.current) return
    fetchedRef.current = true
    setGraphLoading(true)

    const controller = new AbortController()
    const signal = controller.signal

    async function doFetch(url: string): Promise<Response | null> {
      try {
        return await fetch(url, { signal })
      } catch {
        return null
      }
    }

    // Match "RECALDE, Héctor Pedro" to "Hector Recalde",
    // "PETCOFF NAIDENOFF, Luis Carlos" to "Luis Naidenoff", etc.
    function namesMatch(a: string, b: string): boolean {
      const norm = (s: string) =>
        s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim()
      const ap = new Set(norm(a).split(/\s+/).filter(Boolean))
      const bp = new Set(norm(b).split(/\s+/).filter(Boolean))
      // Count how many words from the shorter set appear in the longer set
      const shorter = ap.size <= bp.size ? ap : bp
      const longer = ap.size <= bp.size ? bp : ap
      let hits = 0
      for (const word of shorter) {
        for (const lw of longer) {
          if (lw === word || lw.startsWith(word) || word.startsWith(lw)) {
            hits++
            break
          }
        }
      }
      // Require at least 2 matching words and 75% of shorter name
      return hits >= 2 && hits >= shorter.size * 0.75
    }

    ;(async () => {
      try {
        let graph: GraphData | null = null
        let centerId: string | null = null

        // 1. Try caso-libra person API
        const personRes = await doFetch(
          `/api/caso-libra/person/${encodeURIComponent(actorSlug)}`,
        )
        if (personRes?.ok) {
          try {
            const json = await personRes.json()
            const g = (json.graph ?? json.connections) as GraphData | undefined
            if (g && g.nodes?.length > 0) {
              const center = g.nodes.find(
                (n: { properties: Record<string, unknown> }) =>
                  getDisplayName(n.properties).toLowerCase() === name.toLowerCase(),
              )
              graph = g
              centerId = center?.id ?? g.nodes[0].id
            }
          } catch { /* parse failed */ }
        }

        if (signal.aborted) return

        // 2. Fallback: graph search + expand
        if (!graph) {
          const searchRes = await doFetch(
            `/api/graph/search?q=${encodeURIComponent(name)}&limit=5`,
          )
          if (searchRes?.ok) {
            try {
              const sj = await searchRes.json()
              const candidates = sj.success ? (sj.data?.nodes ?? []) : []
              const match = candidates.find(
                (n: { properties: Record<string, unknown> }) =>
                  namesMatch(getDisplayName(n.properties), name),
              )
              if (match && !signal.aborted) {
                const expandRes = await doFetch(
                  `/api/graph/expand/${encodeURIComponent(match.id)}?depth=1&limit=50`,
                )
                if (expandRes?.ok) {
                  const ej = await expandRes.json()
                  if (ej.success && ej.data) {
                    graph = ej.data as GraphData
                    centerId = match.id as string
                  }
                }
              }
            } catch { /* search failed */ }
          }
        }

        if (signal.aborted) return

        if (graph && centerId) {
          setGraphNodeId(centerId)
          setGraphData(graph)
        } else {
          setGraphError(true)
        }
      } catch {
        if (!signal.aborted) setGraphError(true)
      } finally {
        if (!signal.aborted) setGraphLoading(false)
      }
    })()

    return () => {
      controller.abort()
      // Reset so React strict mode remount can retry
      fetchedRef.current = false
      setGraphLoading(false)
    }
  }, [expanded, actorSlug, name])

  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-lg font-bold text-blue-400">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-zinc-100">
              {name}
            </h3>
            {party && (
              <span className="shrink-0 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                {party}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-400">{role}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
              {nationality}
            </span>
            {datasets !== undefined && (
              <span className="text-[10px] text-zinc-600">
                {datasets} datasets
              </span>
            )}
          </div>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-3">
          {/* Description */}
          <p className="text-sm leading-relaxed text-zinc-400">{description}</p>

          {/* Status */}
          {status && (
            <div className="rounded-md bg-zinc-800/50 px-3 py-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Status
              </span>
              <p className="mt-0.5 text-xs text-zinc-300">{status}</p>
            </div>
          )}

          {/* Mini force-graph */}
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
              <span className="text-xs font-medium text-zinc-400">
                {lang === 'es' ? 'Red de conexiones' : 'Connection network'}
              </span>
              <Link
                href={`/caso/${investigationSlug}/actor/${actorSlug}`}
                className="text-[10px] text-purple-400 hover:text-purple-300"
              >
                {lang === 'es' ? 'Ver perfil completo' : 'Full profile'} →
              </Link>
            </div>
            <div
              className="flex items-center justify-center"
              style={{ minHeight: 240 }}
            >
              {graphLoading && (
                <span className="text-xs text-zinc-500">
                  {lang === 'es' ? 'Cargando grafo...' : 'Loading graph...'}
                </span>
              )}
              {graphError && !graphLoading && (
                <span className="text-xs text-zinc-600">
                  {lang === 'es'
                    ? 'Grafo no disponible'
                    : 'Graph not available'}
                </span>
              )}
              {graphData && graphNodeId && !graphLoading && (
                <MiniGraphCanvas data={graphData} centerNodeId={graphNodeId} />
              )}
            </div>
          </div>

          {/* Relationship list */}
          {graphData && graphNodeId && (
            <div>
              <h4 className="mb-2 text-xs font-medium text-zinc-400">
                {lang === 'es' ? 'Relaciones' : 'Relationships'}
              </h4>
              <RelationshipList data={graphData} centerNodeId={graphNodeId} />
            </div>
          )}

          {/* Source link */}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[10px] text-zinc-600 underline hover:text-zinc-400"
            >
              {lang === 'es' ? 'Fuente' : 'Source'} →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
