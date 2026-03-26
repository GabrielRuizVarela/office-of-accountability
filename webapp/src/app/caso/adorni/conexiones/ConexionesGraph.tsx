'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

// ---------------------------------------------------------------------------
// Types
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
    personCount: number
  }
}

// Force graph node with position
interface FGNode extends GraphNodeData {
  x?: number
  y?: number
  fx?: number
  fy?: number
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

interface Preset {
  key: string
  label: { en: string; es: string }
  types: string[] | null // null = show all
}

const GRAPH_PRESETS: Preset[] = [
  { key: 'all', label: { en: 'Full Graph', es: 'Grafo Completo' }, types: null },
  {
    key: 'government',
    label: { en: 'Government Network', es: 'Red Gubernamental' },
    types: ['Person', 'GovernmentAppointment', 'Organization'],
  },
  {
    key: 'corporate',
    label: { en: 'Corporate Ties', es: 'Vinculos Corporativos' },
    types: ['Person', 'Company', 'CompanyOfficer'],
  },
  {
    key: 'media',
    label: { en: 'Media Ecosystem', es: 'Ecosistema Mediatico' },
    types: ['Person', 'MediaOutlet', 'Organization'],
  },
  {
    key: 'cross',
    label: { en: 'Cross-Investigation', es: 'Cruce Investigaciones' },
    types: ['Person', 'Contractor', 'Donor', 'OffshoreEntity'],
  },
]

// ---------------------------------------------------------------------------
// Node colours
// ---------------------------------------------------------------------------

const NODE_COLORS: Record<string, string> = {
  Person: '#3b82f6',
  Organization: '#f97316',
  Company: '#a855f7',
  MediaOutlet: '#ec4899',
  Contractor: '#22c55e',
  GovernmentAppointment: '#f97316',
  OffshoreEntity: '#ef4444',
  Donor: '#22c55e',
  Statement: '#6b7280',
}

const DEFAULT_COLOR = '#94a3b8'

function colorFor(type: string) {
  return NODE_COLORS[type] ?? DEFAULT_COLOR
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  loading: { en: 'Loading graph data...', es: 'Cargando datos del grafo...' },
  error: { en: 'Failed to load graph data.', es: 'Error al cargar datos del grafo.' },
  noData: { en: 'No data available yet.', es: 'Sin datos disponibles aun.' },
  nodes: { en: 'nodes', es: 'nodos' },
  edges: { en: 'edges', es: 'aristas' },
} as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConexionesGraph() {
  const { lang } = useLanguage()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(undefined)

  const [nodes, setNodes] = useState<FGNode[]>([])
  const [links, setLinks] = useState<GraphLinkData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState('all')
  const [hoveredNode, setHoveredNode] = useState<FGNode | null>(null)

  // Fetch data on mount
  useEffect(() => {
    let cancelled = false
    async function fetchGraph() {
      try {
        const res = await fetch('/api/caso/adorni/graph')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json: GraphApiResponse = await res.json()
        if (!cancelled && json.success) {
          setNodes(json.data.nodes as FGNode[])
          setLinks(json.data.links)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchGraph()
    return () => { cancelled = true }
  }, [])

  // Freeze nodes after initial layout converges
  useEffect(() => {
    if (nodes.length === 0) return
    const timer = setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({ ...n, fx: n.x, fy: n.y })),
      )
    }, 4000)
    return () => clearTimeout(timer)
  }, [nodes.length])

  // Filtered data based on active preset
  const filteredData = useMemo(() => {
    if (nodes.length === 0) return { nodes: [], links: [] }
    const preset = GRAPH_PRESETS.find((p) => p.key === activePreset)
    if (!preset || !preset.types) return { nodes, links }

    const allowedTypes = new Set(preset.types)
    const filteredNodes = nodes.filter((n) => allowedTypes.has(n.type))
    const nodeIds = new Set(filteredNodes.map((n) => n.id))
    const filteredLinks = links.filter(
      (l) => nodeIds.has(l.source as string) && nodeIds.has(l.target as string),
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }, [nodes, links, activePreset])

  // Canvas node renderer
  const paintNode = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = 5
      const x = (node.x ?? 0) as number
      const y = (node.y ?? 0) as number

      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = colorFor(node.type ?? '')
      ctx.fill()

      // Label when zoomed in enough
      if (globalScale > 1.5) {
        ctx.font = `${11 / globalScale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#e4e4e7'
        ctx.fillText(node.name ?? '', x, y + r + 2 / globalScale)
      }
    },
    [],
  )

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-400" />
          <span className="text-sm">{t.loading[lang]}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        <p className="text-sm">
          {t.error[lang]} ({error})
        </p>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-500">
        <p className="text-sm">{t.noData[lang]}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Preset buttons */}
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
        {GRAPH_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePreset(p.key)}
            className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
              activePreset === p.key
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {p.label[lang]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-10 rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-500">
        {filteredData.nodes.length} {t.nodes[lang]} &middot; {filteredData.links.length}{' '}
        {t.edges[lang]}
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute right-4 top-4 z-10 max-w-xs rounded-lg border border-zinc-700 bg-zinc-900/95 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: colorFor(hoveredNode.type) }}
            />
            <span className="text-sm font-semibold text-zinc-100">{hoveredNode.name}</span>
          </div>
          <span className="mt-1 block text-xs text-zinc-500">{hoveredNode.type}</span>
        </div>
      )}

      {/* Graph */}
      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        nodeId="id"
        nodeCanvasObject={paintNode}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodeHover={(node: any) => setHoveredNode(node as FGNode | null)}
        linkColor={() => '#3f3f46'}
        linkWidth={1}
        backgroundColor="#09090b"
      />
    </div>
  )
}
