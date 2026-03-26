'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { useLanguage } from '@/lib/language-context'
import type { GraphData } from '@/lib/neo4j/types'
import { KEY_ACTORS } from '@/lib/caso-dictadura/investigation-data'

// ---------------------------------------------------------------------------
// Label colors
// ---------------------------------------------------------------------------

const LABEL_COLORS: Record<string, string> = {
  DictaduraPersona: '#3b82f6',
  DictaduraCCD: '#ef4444',
  DictaduraUnidadMilitar: '#f97316',
  DictaduraOrganizacion: '#8b5cf6',
  DictaduraLugar: '#10b981',
  DictaduraEvento: '#f59e0b',
  DictaduraDocumento: '#ec4899',
  DictaduraCausa: '#06b6d4',
  DictaduraOperacion: '#a855f7',
  DictaduraSentencia: '#14b8a6',
}

function getNodeName(props: Record<string, unknown>): string {
  return (props.name ?? props.title ?? '') as string
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ActoresPage() {
  const { lang } = useLanguage()

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          {lang === 'es' ? 'Actores Clave' : 'Key Actors'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {lang === 'es'
            ? `${KEY_ACTORS.length} personas clave con sus conexiones en el grafo de conocimiento`
            : `${KEY_ACTORS.length} key persons with their connections in the knowledge graph`}
        </p>
      </header>

      <div className="space-y-4">
        {KEY_ACTORS.map((actor) => (
          <ActorCard key={actor.id} actor={actor} lang={lang} />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Actor card with expandable connection mini-graph
// ---------------------------------------------------------------------------

function ActorCard({ actor, lang }: {
  readonly actor: (typeof KEY_ACTORS)[number]
  readonly lang: 'en' | 'es'
}) {
  const [expanded, setExpanded] = useState(false)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(false)
  const [connections, setConnections] = useState<Array<{ label: string; name: string; relType: string }>>([])

  const slugId = `dict-${actor.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`

  const loadGraph = useCallback(async () => {
    if (graphData) { setExpanded(!expanded); return }
    setLoading(true)
    setExpanded(true)
    try {
      const res = await fetch(`/api/graph/expand/${encodeURIComponent(slugId)}?depth=1&limit=30`)
      if (!res.ok) {
        const altRes = await fetch(`/api/graph/expand/${encodeURIComponent(actor.id)}?depth=1&limit=30`)
        if (!altRes.ok) return
        const json = await altRes.json()
        if (json.success && json.data) {
          setGraphData(json.data)
          extractConnections(json.data, actor.id)
        }
        return
      }
      const json = await res.json()
      if (json.success && json.data) {
        setGraphData(json.data)
        extractConnections(json.data, slugId)
      }
    } finally {
      setLoading(false)
    }
  }, [graphData, expanded, slugId, actor.id])

  function extractConnections(data: GraphData, centerId: string) {
    const conns: Array<{ label: string; name: string; relType: string }> = []
    for (const link of data.links) {
      const src = typeof link.source === 'string' ? link.source : (link.source as unknown as { id: string }).id
      const tgt = typeof link.target === 'string' ? link.target : (link.target as unknown as { id: string }).id
      const neighborId = src === centerId ? tgt : tgt === centerId ? src : null
      if (!neighborId) continue
      const neighbor = data.nodes.find((n) => n.id === neighborId)
      if (!neighbor) continue
      conns.push({
        label: neighbor.labels[0] ?? 'Unknown',
        name: getNodeName(neighbor.properties),
        relType: link.type,
      })
    }
    setConnections(conns)
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-zinc-100">{actor.name}</h3>
            <p className="mt-1 text-xs text-stone-400">{lang === 'es' ? actor.role_es : actor.role_en}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {lang === 'es' ? actor.description_es : actor.description_en}
            </p>
            {(lang === 'es' ? actor.status_es : actor.status_en) && (
              <p className="mt-1 text-xs text-zinc-600">
                {lang === 'es' ? actor.status_es : actor.status_en}
              </p>
            )}
          </div>
          <button
            onClick={loadGraph}
            className={`ml-3 shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              expanded
                ? 'border-stone-500/30 bg-stone-500/10 text-stone-400'
                : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {loading ? '...' : expanded ? (lang === 'es' ? 'Ocultar grafo' : 'Hide graph') : (lang === 'es' ? 'Ver conexiones' : 'View connections')}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800">
          {loading && (
            <div className="flex items-center justify-center py-8 text-xs text-zinc-500">
              {lang === 'es' ? 'Cargando conexiones...' : 'Loading connections...'}
            </div>
          )}
          {graphData && !loading && (
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 border-b border-zinc-800 lg:border-b-0 lg:border-r">
                <MiniGraphCanvas data={graphData} centerNodeId={slugId} altCenterId={actor.id} />
              </div>
              <div className="w-full shrink-0 p-3 lg:w-72">
                <p className="mb-2 text-xs font-medium text-zinc-400">
                  {connections.length} {lang === 'es' ? 'conexiones' : 'connections'}
                </p>
                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {connections.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: LABEL_COLORS[c.label] ?? '#94a3b8' }}
                      />
                      <span className="flex-1 truncate text-zinc-300">{c.name}</span>
                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-500">{c.relType}</span>
                    </div>
                  ))}
                  {connections.length === 0 && (
                    <p className="text-xs text-zinc-600">
                      {lang === 'es' ? 'Sin conexiones encontradas' : 'No connections found'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {!graphData && !loading && (
            <div className="py-6 text-center text-xs text-zinc-600">
              {lang === 'es' ? 'No se encontro en el grafo' : 'Not found in graph'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline mini-graph canvas
// ---------------------------------------------------------------------------

interface MiniNode {
  id: string; label: string; name: string; color: string
  x: number; y: number; vx: number; vy: number
}

function MiniGraphCanvas({ data, centerNodeId, altCenterId }: {
  readonly data: GraphData
  readonly centerNodeId: string
  readonly altCenterId?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = container.clientWidth
    const h = 260
    canvas.width = w * 2
    canvas.height = h * 2
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(2, 2)

    const actualCenter = data.nodes.find((n) => n.id === centerNodeId)
      ? centerNodeId
      : (altCenterId && data.nodes.find((n) => n.id === altCenterId) ? altCenterId : data.nodes[0]?.id ?? '')

    const nodes: MiniNode[] = data.nodes.map((n) => ({
      id: n.id,
      label: n.labels[0] ?? 'Unknown',
      name: getNodeName(n.properties),
      color: LABEL_COLORS[n.labels[0] ?? ''] ?? '#94a3b8',
      x: n.id === actualCenter ? 0 : (Math.random() - 0.5) * 300,
      y: n.id === actualCenter ? 0 : (Math.random() - 0.5) * 300,
      vx: 0, vy: 0,
    }))

    const links = data.links.map((l) => ({
      source: typeof l.source === 'string' ? l.source : (l.source as unknown as { id: string }).id,
      target: typeof l.target === 'string' ? l.target : (l.target as unknown as { id: string }).id,
    }))

    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    for (let iter = 0; iter < 120; iter++) {
      const alpha = 1 - iter / 120
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const f = (100 * alpha) / (dist * dist)
          const fx = (dx / dist) * f, fy = (dy / dist) * f
          a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy
        }
      }
      for (const link of links) {
        const a = nodeMap.get(link.source), b = nodeMap.get(link.target)
        if (!a || !b) continue
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const f = (dist - 40) * 0.008 * alpha
        const fx = (dx / dist) * f, fy = (dy / dist) * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
      for (const n of nodes) {
        n.vx -= n.x * 0.004 * alpha; n.vy -= n.y * 0.004 * alpha
        n.vx *= 0.6; n.vy *= 0.6; n.x += n.vx; n.y += n.vy
      }
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const n of nodes) {
      if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x
      if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y
    }
    const rangeX = (maxX - minX) || 1, rangeY = (maxY - minY) || 1
    const pad = 35
    const scale = Math.min((w - pad * 2) / rangeX, (h - pad * 2) / rangeY, 3)
    const cx = w / 2, cy = h / 2
    const ox = (minX + maxX) / 2, oy = (minY + maxY) / 2
    const toS = (x: number, y: number): [number, number] => [cx + (x - ox) * scale, cy + (y - oy) * scale]

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = '#27272a'
    ctx.lineWidth = 0.5
    for (const link of links) {
      const a = nodeMap.get(link.source), b = nodeMap.get(link.target)
      if (!a || !b) continue
      const [ax, ay] = toS(a.x, a.y), [bx, by] = toS(b.x, b.y)
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
    }

    for (const node of nodes) {
      const [sx, sy] = toS(node.x, node.y)
      const isCenter = node.id === actualCenter
      const r = isCenter ? 6 : 3.5
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fillStyle = node.color; ctx.fill()
      if (isCenter) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke() }
    }

    for (const node of nodes) {
      const [sx, sy] = toS(node.x, node.y)
      const isCenter = node.id === actualCenter
      if (isCenter || nodes.length <= 20) {
        ctx.font = isCenter ? 'bold 10px system-ui' : '8px system-ui'
        ctx.textAlign = 'center'; ctx.textBaseline = 'top'
        ctx.fillStyle = isCenter ? '#f5f5f5' : '#a1a1aa'
        const name = node.name.length > 25 ? `${node.name.slice(0, 23)}...` : node.name
        ctx.fillText(name, sx, sy + (isCenter ? 8 : 5))
      }
    }

    ctx.fillStyle = '#3f3f46'; ctx.font = '9px system-ui'
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'
    ctx.fillText(`${nodes.length} nodos · ${links.length} conexiones`, w - 8, h - 4)
  }, [data, centerNodeId, altCenterId])

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full rounded-bl-lg" />
    </div>
  )
}
