'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d'

// ---------------------------------------------------------------------------
// Types for our API response
// ---------------------------------------------------------------------------

interface GraphNodeData {
  id: string
  name: string
  type: string
  color: string
  datasets: number
  val: number
  labels: string[]
  properties: Record<string, unknown>
}

interface GraphLinkData {
  source: string
  target: string
  type: string
  properties: Record<string, unknown>
}

interface GraphApiResponse {
  success: boolean
  data: {
    nodes: GraphNodeData[]
    links: GraphLinkData[]
  }
  meta: {
    nodeCount: number
    linkCount: number
    politicianCount: number
  }
  error?: string
}

// ---------------------------------------------------------------------------
// Node type legend
// ---------------------------------------------------------------------------

const NODE_TYPE_LEGEND: ReadonlyArray<{ type: string; label: string; color: string }> = [
  { type: 'Politician', label: 'Politico', color: '#3b82f6' },
  { type: 'OffshoreOfficer', label: 'Offshore Officer', color: '#ef4444' },
  { type: 'OffshoreEntity', label: 'Entidad Offshore', color: '#dc2626' },
  { type: 'Donor', label: 'Donante', color: '#22c55e' },
  { type: 'GovernmentAppointment', label: 'Nombramiento', color: '#f97316' },
  { type: 'Judge', label: 'Juez', color: '#f97316' },
  { type: 'CompanyOfficer', label: 'Directivo', color: '#a855f7' },
  { type: 'BoardMember', label: 'Directorio', color: '#a855f7' },
  { type: 'Company', label: 'Empresa', color: '#10b981' },
  { type: 'Organization', label: 'Organizacion', color: '#10b981' },
  { type: 'SAME_COALITION', label: 'Coalicion', color: '#f59e0b' },
  { type: 'SAME_PROVINCE', label: 'Provincia', color: '#6366f1' },
  { type: 'BOTH_OFFSHORE', label: 'Red Offshore', color: '#ef4444' },
  { type: 'SHARED_ORG', label: 'Org. Compartida', color: '#10b981' },
  { type: 'Contractor', label: 'Contratista', color: '#8b5cf6' },
]

// ---------------------------------------------------------------------------
// Lazy load ForceGraph2D (accesses window at import time)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph2DComponent = React.ComponentType<any>

let ForceGraph2DPromise: Promise<ForceGraph2DComponent> | null = null
function getForceGraph2D(): Promise<ForceGraph2DComponent> {
  if (!ForceGraph2DPromise) {
    ForceGraph2DPromise = import('react-force-graph-2d').then((m) => m.default)
  }
  return ForceGraph2DPromise
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConexionesGraph() {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ForceGraph2D, setForceGraph2D] = useState<ForceGraph2DComponent | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [graphData, setGraphData] = useState<{ nodes: GraphNodeData[]; links: GraphLinkData[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null)
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set())

  const toggleType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  // Filter graph data based on hidden types
  const filteredData = graphData
    ? {
        nodes: graphData.nodes.filter((n) => !hiddenTypes.has(n.type)),
        links: graphData.links.filter((l) => {
          const sourceId = typeof l.source === 'string' ? l.source : (l.source as any)?.id
          const targetId = typeof l.target === 'string' ? l.target : (l.target as any)?.id
          const sourceNode = graphData.nodes.find((n) => n.id === sourceId)
          const targetNode = graphData.nodes.find((n) => n.id === targetId)
          return sourceNode && targetNode && !hiddenTypes.has(sourceNode.type) && !hiddenTypes.has(targetNode.type)
        }),
      }
    : null

  // Load ForceGraph2D dynamically
  useEffect(() => {
    getForceGraph2D().then((Component) => setForceGraph2D(() => Component))
  }, [])

  // Fetch graph data
  useEffect(() => {
    let cancelled = false

    async function fetchGraph() {
      try {
        const res = await fetch('/api/caso/finanzas-politicas/graph')
        const json: GraphApiResponse = await res.json()

        if (cancelled) return

        if (!json.success) {
          setError(json.error ?? 'Error al cargar el grafo')
          return
        }

        setGraphData(json.data)
      } catch {
        if (!cancelled) {
          setError('No se pudo conectar con el servidor')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchGraph()
    return () => { cancelled = true }
  }, [])

  // Responsive sizing
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Zoom to fit on data load
  useEffect(() => {
    const fg = graphRef.current
    if (fg && graphData && graphData.nodes.length > 0) {
      setTimeout(() => fg.zoomToFit(400, 40), 500)
    }
  }, [graphData])

  // Node click handler
  const handleNodeClick = useCallback(
    (node: NodeObject<GraphNodeData>) => {
      const gNode = node as GraphNodeData
      setSelectedNode(gNode)

      const fg = graphRef.current
      if (fg && typeof node.x === 'number' && typeof node.y === 'number') {
        fg.centerAt(node.x, node.y, 300)
      }
    },
    [],
  )

  // Custom node painting
  const paintNode = useCallback(
    (node: NodeObject<GraphNodeData>, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNodeData
      const x = node.x ?? 0
      const y = node.y ?? 0
      const isSelected = selectedNode?.id === gNode.id
      const baseRadius = Math.max(3, Math.min(gNode.val * 1.5, 12))
      const radius = isSelected ? baseRadius + 2 : baseRadius

      // Node circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = gNode.color
      ctx.globalAlpha = isSelected ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1

      // Selected ring
      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(x, y, radius + 2, 0, 2 * Math.PI)
        ctx.strokeStyle = gNode.color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Label (show when zoomed in or for selected/politician nodes at medium zoom)
      const showLabel = globalScale > 2 || isSelected || (gNode.type === 'Politician' && globalScale > 1)
      if (showLabel) {
        const fontSize = Math.max(12 / globalScale, 2)
        ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0'
        ctx.fillText(gNode.name, x, y + radius + 2)
      }
    },
    [selectedNode],
  )

  // Pointer area for hover detection
  const paintPointerArea = useCallback(
    (node: NodeObject<GraphNodeData>, color: string, ctx: CanvasRenderingContext2D) => {
      const gNode = node as GraphNodeData
      const x = node.x ?? 0
      const y = node.y ?? 0
      const radius = Math.max(5, gNode.val * 1.5 + 2)

      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    },
    [],
  )

  // Link color
  const linkColor = useCallback(() => '#334155', [])

  // Link label
  const linkLabel = useCallback((link: GraphLinkData) => link.type.replace(/_/g, ' '), [])

  // Close detail panel
  const closeDetail = useCallback(() => setSelectedNode(null), [])

  // Zoom controls
  const zoomIn = useCallback(() => {
    const fg = graphRef.current
    if (fg) fg.zoom(fg.zoom() * 1.5, 300)
  }, [])

  const zoomOut = useCallback(() => {
    const fg = graphRef.current
    if (fg) fg.zoom(fg.zoom() / 1.5, 300)
  }, [])

  const zoomToFit = useCallback(() => {
    const fg = graphRef.current
    if (fg) fg.zoomToFit(400, 40)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Top bar with legend and stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3">
        <div className="flex flex-wrap gap-3">
          {NODE_TYPE_LEGEND.map((item) => {
            const isHidden = hiddenTypes.has(item.type)
            const count = graphData?.nodes.filter((n) => n.type === item.type).length ?? 0
            if (count === 0) return null
            return (
              <button
                key={item.type}
                onClick={() => toggleType(item.type)}
                className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                  isHidden ? 'opacity-30' : 'opacity-100'
                } hover:bg-zinc-800`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-zinc-400">
                  {item.label} ({count})
                </span>
              </button>
            )
          })}
        </div>
        {graphData && (
          <span className="text-xs text-zinc-500">
            {filteredData ? filteredData.nodes.length : graphData.nodes.length} nodos &middot;{' '}
            {filteredData ? filteredData.links.length : graphData.links.length} conexiones
            {hiddenTypes.size > 0 && (
              <button
                onClick={() => setHiddenTypes(new Set())}
                className="ml-2 text-blue-400 hover:underline"
              >
                mostrar todos
              </button>
            )}
          </span>
        )}
      </div>

      {/* Graph area */}
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                <p className="text-sm text-zinc-500">Cargando grafo desde Neo4j...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md rounded-lg border border-red-900/50 bg-red-950/20 px-6 py-4 text-center">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && !error && graphData && ForceGraph2D && (
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredData ?? graphData}
              width={dimensions.width}
              height={dimensions.height}
              backgroundColor="#09090b"
              nodeCanvasObject={paintNode}
              nodeCanvasObjectMode={() => 'replace'}
              nodePointerAreaPaint={paintPointerArea}
              linkColor={linkColor as (link: object) => string}
              linkLabel={linkLabel as (link: object) => string}
              linkWidth={0.5}
              linkDirectionalArrowLength={0}
              linkCurvature={0.1}
              onNodeClick={handleNodeClick}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              enableNodeDrag={true}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              minZoom={0.3}
              maxZoom={20}
            />
          )}

          {!loading && !error && graphData && !ForceGraph2D && (
            <div className="flex h-full items-center justify-center text-zinc-600">
              Cargando visualizacion...
            </div>
          )}
        </div>

        {/* Zoom controls */}
        {graphData && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label="Acercar"
            >
              +
            </button>
            <button
              onClick={zoomOut}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label="Alejar"
            >
              −
            </button>
            <button
              onClick={zoomToFit}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label="Ver todo"
            >
              ⊞
            </button>
          </div>
        )}

        {/* Node detail panel */}
        {selectedNode && (
          <div className="absolute left-4 top-4 w-72 rounded-lg border border-zinc-700 bg-zinc-900/95 shadow-xl backdrop-blur-sm">
            <div className="flex items-start justify-between border-b border-zinc-800 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <span className="text-xs font-medium text-zinc-400">
                    {getTypeLabel(selectedNode.type)}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-sm font-semibold text-zinc-100">
                  {selectedNode.name}
                </h3>
              </div>
              <button
                onClick={closeDetail}
                className="ml-2 flex-shrink-0 text-zinc-500 hover:text-zinc-300"
                aria-label="Cerrar detalle"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto px-4 py-3">
              {selectedNode.type === 'Politician' && (
                <div className="mb-2 text-xs text-zinc-400">
                  Presente en <span className="font-semibold text-blue-400">{selectedNode.datasets}</span> fuentes de datos
                </div>
              )}
              <dl className="space-y-1.5">
                {Object.entries(selectedNode.properties)
                  .filter(([key]) => !key.startsWith('_') && key !== 'embedding')
                  .slice(0, 10)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="text-xs text-zinc-300">
                        {formatValue(value)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    Politician: 'Politico',
    OffshoreOfficer: 'Oficial Offshore',
    OffshoreEntity: 'Entidad Offshore',
    Donor: 'Donante',
    GovernmentAppointment: 'Nombramiento',
    CompanyOfficer: 'Directivo',
    BoardMember: 'Miembro del Directorio',
    AssetDeclaration: 'Declaracion Jurada',
  }
  return labels[type] ?? type
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Si' : 'No'
  if (typeof value === 'number') return value.toLocaleString('es-AR')
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
