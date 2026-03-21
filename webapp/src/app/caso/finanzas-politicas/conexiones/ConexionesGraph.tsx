'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d'

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

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
// Graph presets — compelling pre-configured views
// ---------------------------------------------------------------------------

const GRAPH_PRESETS: ReadonlyArray<{
  id: string
  label: Record<Lang, string>
  description: Record<Lang, string>
  showTypes: string[]
}> = [
  {
    id: 'all',
    label: { en: 'Full Graph', es: 'Grafo Completo' },
    description: { en: 'All entity types', es: 'Todos los tipos' },
    showTypes: [], // empty = show all
  },
  {
    id: 'revolving-door',
    label: { en: 'Revolving Door', es: 'Puerta Giratoria' },
    description: { en: 'Politicians \u2194 Companies \u2194 Government', es: 'Politicos \u2194 Empresas \u2194 Gobierno' },
    showTypes: ['Politician', 'CompanyOfficer', 'GovernmentAppointment', 'Company'],
  },
  {
    id: 'offshore',
    label: { en: 'Offshore Network', es: 'Red Offshore' },
    description: { en: 'Politicians with offshore connections', es: 'Politicos con conexiones offshore' },
    showTypes: ['Politician', 'OffshoreOfficer', 'OffshoreEntity'],
  },
  {
    id: 'money-trail',
    label: { en: 'Money Trail', es: 'Rastro del Dinero' },
    description: { en: 'Donors \u2192 Politicians \u2192 Contractors', es: 'Donantes \u2192 Politicos \u2192 Contratistas' },
    showTypes: ['Politician', 'Donor', 'Contractor', 'Company'],
  },
  {
    id: 'power-families',
    label: { en: 'Power Families', es: 'Familias del Poder' },
    description: { en: 'Corporate board interlocks', es: 'Directorios entrelazados' },
    showTypes: ['CompanyOfficer', 'BoardMember', 'Company', 'Organization'],
  },
]

// ---------------------------------------------------------------------------
// Node type legend (bilingual)
// ---------------------------------------------------------------------------

const NODE_TYPE_LEGEND: ReadonlyArray<{ type: string; label: Record<Lang, string>; color: string }> = [
  { type: 'Politician', label: { en: 'Politician', es: 'Politico' }, color: '#3b82f6' },
  { type: 'OffshoreOfficer', label: { en: 'Offshore Officer', es: 'Offshore Officer' }, color: '#ef4444' },
  { type: 'OffshoreEntity', label: { en: 'Offshore Entity', es: 'Entidad Offshore' }, color: '#dc2626' },
  { type: 'Donor', label: { en: 'Donor', es: 'Donante' }, color: '#22c55e' },
  { type: 'GovernmentAppointment', label: { en: 'Appointment', es: 'Nombramiento' }, color: '#f97316' },
  { type: 'Judge', label: { en: 'Judge', es: 'Juez' }, color: '#f97316' },
  { type: 'CompanyOfficer', label: { en: 'Officer', es: 'Directivo' }, color: '#a855f7' },
  { type: 'BoardMember', label: { en: 'Board Member', es: 'Directorio' }, color: '#a855f7' },
  { type: 'Company', label: { en: 'Company', es: 'Empresa' }, color: '#10b981' },
  { type: 'Organization', label: { en: 'Organization', es: 'Organizacion' }, color: '#10b981' },
  { type: 'SAME_COALITION', label: { en: 'Coalition', es: 'Coalicion' }, color: '#f59e0b' },
  // Province nodes hidden by default — reference data, not investigation entities
  { type: 'BOTH_OFFSHORE', label: { en: 'Offshore Network', es: 'Red Offshore' }, color: '#ef4444' },
  { type: 'SHARED_ORG', label: { en: 'Shared Org.', es: 'Org. Compartida' }, color: '#10b981' },
  { type: 'Contractor', label: { en: 'Contractor', es: 'Contratista' }, color: '#8b5cf6' },
  { type: 'Party', label: { en: 'Party', es: 'Partido' }, color: '#8b5cf6' },
  { type: 'Legislation', label: { en: 'Legislation', es: 'Legislacion' }, color: '#f43f5e' },
  { type: 'PoliticalParty', label: { en: 'Party Fund', es: 'Fondo Partidario' }, color: '#f59e0b' },
  // Investigation-specific node types (caso_slug entities)
  { type: 'Person', label: { en: 'Person (Investigation)', es: 'Persona (Investigacion)' }, color: '#f97316' },
  { type: 'Event', label: { en: 'Event', es: 'Evento' }, color: '#8b5cf6' },
]

// ---------------------------------------------------------------------------
// Edge type legend (bilingual)
// ---------------------------------------------------------------------------

const EDGE_TYPE_LEGEND: ReadonlyArray<{ type: string; label: Record<Lang, string>; color: string }> = [
  { type: 'MAYBE_SAME_AS', label: { en: 'Maybe Same As', es: 'Posible Mismo' }, color: '#475569' },
  { type: 'SAME_ENTITY', label: { en: 'Same Entity', es: 'Misma Entidad' }, color: '#475569' },
  { type: 'IS_DONOR', label: { en: 'Is Donor', es: 'Es Donante' }, color: '#22c55e' },
  { type: 'DONATED_TO', label: { en: 'Donated To', es: 'Dono A' }, color: '#22c55e' },
  { type: 'HAS_OFFSHORE_LINK', label: { en: 'Offshore Link', es: 'Vinculo Offshore' }, color: '#ef4444' },
  { type: 'HAS_OFFSHORE', label: { en: 'Has Offshore', es: 'Tiene Offshore' }, color: '#ef4444' },
  { type: 'HAS_APPOINTMENT', label: { en: 'Appointment', es: 'Nombramiento' }, color: '#f97316' },
  { type: 'APPOINTED', label: { en: 'Appointed', es: 'Nombrado' }, color: '#f97316' },
  { type: 'ON_BOARD', label: { en: 'On Board', es: 'En Directorio' }, color: '#10b981' },
  { type: 'MEMBER_OF', label: { en: 'Member Of', es: 'Miembro De' }, color: '#10b981' },
  { type: 'OFFICER_OF_COMPANY', label: { en: 'Officer Of', es: 'Directivo De' }, color: '#a855f7' },
  { type: 'AWARDED_TO', label: { en: 'Awarded To', es: 'Adjudicado A' }, color: '#8b5cf6' },
  { type: 'CROSS_REFERENCED', label: { en: 'Cross Ref.', es: 'Ref. Cruzada' }, color: '#f59e0b' },
  { type: 'SHARES_BOARD', label: { en: 'Shares Board', es: 'Directorio Compartido' }, color: '#8b5cf6' },
  { type: 'SAME_COALITION', label: { en: 'Same Coalition', es: 'Misma Coalicion' }, color: '#f59e0b' },
  { type: 'SAME_PROVINCE', label: { en: 'Same Province', es: 'Misma Provincia' }, color: '#6366f1' },
  { type: 'BOTH_OFFSHORE', label: { en: 'Both Offshore', es: 'Ambos Offshore' }, color: '#ef4444' },
  { type: 'SHARED_ORG', label: { en: 'Shared Org', es: 'Org. Compartida' }, color: '#10b981' },
]

// ---------------------------------------------------------------------------
// UI text (bilingual)
// ---------------------------------------------------------------------------

const ui = {
  nodes: { en: 'nodes', es: 'nodos' },
  connections: { en: 'connections', es: 'conexiones' },
  showAll: { en: 'show all', es: 'mostrar todos' },
  loadingGraph: { en: 'Loading graph from Neo4j...', es: 'Cargando grafo desde Neo4j...' },
  loadingVisualization: { en: 'Loading visualization...', es: 'Cargando visualizacion...' },
  errorLoading: { en: 'Failed to load graph', es: 'Error al cargar el grafo' },
  connectionError: { en: 'Could not connect to server', es: 'No se pudo conectar con el servidor' },
  retry: { en: 'Retry', es: 'Reintentar' },
  zoomIn: { en: 'Zoom in', es: 'Acercar' },
  zoomOut: { en: 'Zoom out', es: 'Alejar' },
  viewAll: { en: 'View all', es: 'Ver todo' },
  closeDetail: { en: 'Close detail', es: 'Cerrar detalle' },
  presentIn: { en: 'Present in', es: 'Presente en' },
  dataSources: { en: 'data sources', es: 'fuentes de datos' },
  yes: { en: 'Yes', es: 'Si' },
  no: { en: 'No', es: 'No' },
  searchPlaceholder: { en: 'Search nodes...', es: 'Buscar nodos...' },
  edgeTypes: { en: 'Relationship Types', es: 'Tipos de Relacion' },
  connectedTo: { en: 'Connected to', es: 'Conectado a' },
  connectionCount: { en: 'connections', es: 'conexiones' },
  linkBreakdown: { en: 'Link types', es: 'Tipos de enlace' },
  presets: { en: 'Presets', es: 'Vistas' },
} as const

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
  const { lang } = useLanguage()
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const frozenRef = useRef(false)
  const [ForceGraph2D, setForceGraph2D] = useState<ForceGraph2DComponent | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [graphData, setGraphData] = useState<{ nodes: GraphNodeData[]; links: GraphLinkData[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null)
  // Hide reference/jurisdiction nodes by default — Province, Party, etc. are not investigation entities
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set(['Province', 'SAME_PROVINCE', 'Party', 'PoliticalParty']))
  const [hiddenEdgeTypes, setHiddenEdgeTypes] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activePreset, setActivePreset] = useState('all')
  const [edgeFilterOpen, setEdgeFilterOpen] = useState(false)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const toggleType = useCallback((type: string) => {
    setActivePreset('') // clear preset when manually toggling
    setHiddenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleEdgeType = useCallback((type: string) => {
    setHiddenEdgeTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  // Apply a preset filter
  const applyPreset = useCallback((preset: typeof GRAPH_PRESETS[number]) => {
    setActivePreset(preset.id)
    if (preset.showTypes.length === 0) {
      // "all" preset — clear all hidden types
      setHiddenTypes(new Set())
    } else {
      // Hide all types NOT in the preset's showTypes
      const allTypes = NODE_TYPE_LEGEND.map((t) => t.type)
      const toHide = allTypes.filter((t) => !preset.showTypes.includes(t))
      setHiddenTypes(new Set(toHide))
    }
  }, [])

  // Search matching node IDs
  const searchMatchIds = useMemo(() => {
    if (!searchQuery.trim() || !graphData) return null
    const q = searchQuery.toLowerCase()
    const matching = new Set<string>()
    for (const node of graphData.nodes) {
      if (node.name.toLowerCase().includes(q)) {
        matching.add(node.id)
      }
    }
    return matching
  }, [searchQuery, graphData])

  // Compute edge type counts from raw data
  const edgeTypeCounts = useMemo(() => {
    if (!graphData) return new Map<string, number>()
    const counts = new Map<string, number>()
    for (const link of graphData.links) {
      counts.set(link.type, (counts.get(link.type) ?? 0) + 1)
    }
    return counts
  }, [graphData])

  // Compute selected node's connection info
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNode || !graphData) return null

    const connectedNodes: GraphNodeData[] = []
    const linkTypeCounts = new Map<string, number>()
    const seen = new Set<string>()

    for (const link of graphData.links) {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any)?.id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any)?.id

      let neighborId: string | null = null
      if (sourceId === selectedNode.id) neighborId = targetId
      else if (targetId === selectedNode.id) neighborId = sourceId
      if (!neighborId) continue

      linkTypeCounts.set(link.type, (linkTypeCounts.get(link.type) ?? 0) + 1)

      if (!seen.has(neighborId)) {
        seen.add(neighborId)
        const neighborNode = graphData.nodes.find((n) => n.id === neighborId)
        if (neighborNode) connectedNodes.push(neighborNode)
      }
    }

    return {
      totalConnections: Array.from(linkTypeCounts.values()).reduce((a, b) => a + b, 0),
      connectedNodes,
      linkTypeCounts,
    }
  }, [selectedNode, graphData])

  // Filter graph data based on hidden node types and hidden edge types, then strip isolated nodes
  const filteredData = useMemo(() => {
    if (!graphData) return null
    const visibleNodes = graphData.nodes.filter((n) => !hiddenTypes.has(n.type))
    const visibleLinks = graphData.links.filter((l) => {
      if (hiddenEdgeTypes.has(l.type)) return false
      const sourceId = typeof l.source === 'string' ? l.source : (l.source as any)?.id
      const targetId = typeof l.target === 'string' ? l.target : (l.target as any)?.id
      const sourceNode = graphData.nodes.find((n) => n.id === sourceId)
      const targetNode = graphData.nodes.find((n) => n.id === targetId)
      return sourceNode && targetNode && !hiddenTypes.has(sourceNode.type) && !hiddenTypes.has(targetNode.type)
    })
    // Remove isolated nodes (degree-0 after filtering)
    const connectedIds = new Set<string>()
    for (const l of visibleLinks) {
      const sid = typeof l.source === 'string' ? l.source : (l.source as any)?.id
      const tid = typeof l.target === 'string' ? l.target : (l.target as any)?.id
      if (sid) connectedIds.add(sid)
      if (tid) connectedIds.add(tid)
    }
    return {
      nodes: visibleNodes.filter((n) => connectedIds.has(n.id)),
      links: visibleLinks,
    }
  }, [graphData, hiddenTypes, hiddenEdgeTypes])

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
          setError(json.error ?? ui.errorLoading[lang])
          return
        }

        setGraphData(json.data)
      } catch {
        if (!cancelled) {
          setError(ui.connectionError[lang])
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

  // Reset frozen state when filtered data changes so new layouts can converge
  useEffect(() => {
    frozenRef.current = false
  }, [filteredData])

  // Freeze all nodes after layout converges — fx/fy pins make d3-force skip force calcs
  const handleEngineStop = useCallback(() => {
    if (frozenRef.current) return
    const fg = graphRef.current
    if (!fg) return
    const nodes = (filteredData ?? graphData)?.nodes as unknown as NodeObject<GraphNodeData>[] | undefined
    if (!nodes) return
    for (const node of nodes) {
      if (typeof node.x === 'number') node.fx = node.x
      if (typeof node.y === 'number') node.fy = node.y
    }
    frozenRef.current = true
    fg.zoomToFit(0, 40) // instant, no animation
  }, [filteredData, graphData])

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
      const isSearchMatch = searchMatchIds ? searchMatchIds.has(gNode.id) : false
      const isSearchActive = searchMatchIds !== null
      const isOrgNode = gNode.type === 'Organization' || gNode.type === 'Company'
      const isKeyNode = gNode.type === 'OffshoreEntity' || isOrgNode || (gNode.datasets ?? 0) >= 4
      const baseRadius = isOrgNode
        ? Math.max(4, Math.min(gNode.val * 1.2, 10))
        : isKeyNode
          ? Math.max(5, Math.min(gNode.val * 1.5, 12))
          : Math.max(2.5, Math.min(gNode.val * 1, 8))
      const radius = isSelected ? baseRadius + 2 : baseRadius

      // Dim non-matching nodes when search is active
      const dimmed = isSearchActive && !isSearchMatch && !isSelected

      // Node circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = gNode.color
      ctx.globalAlpha = dimmed ? 0.15 : isSelected ? 1 : 0.85
      ctx.fill()
      ctx.globalAlpha = 1

      // Search match glow ring
      if (isSearchMatch && isSearchActive) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = '#facc15' // bright yellow
        ctx.lineWidth = 2.5
        ctx.shadowColor = '#facc15'
        ctx.shadowBlur = 12
        ctx.globalAlpha = 0.9
        ctx.stroke()
        ctx.restore()
      }

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

      const isHovered = hoveredNode === gNode.id
      // Labels: progressive visibility by type and zoom
      const showLabel = isSelected || isSearchMatch || isHovered ||
        (gNode.type === 'Politician' && globalScale > 0.6) ||
        (gNode.type === 'Person' && globalScale > 0.6) ||
        (isOrgNode && globalScale > 0.8) ||
        (gNode.type === 'OffshoreEntity' && globalScale > 0.5) ||
        (gNode.type === 'Event' && globalScale > 1.5) ||
        globalScale > 2
      if (showLabel && !dimmed) {
        // Org labels slightly smaller than person labels to reduce clutter
        const baseFontSize = (isSelected || isHovered) ? 12
          : isOrgNode ? 7
          : (gNode.type === 'Person' || gNode.type === 'Politician') ? 9
          : 7
        const fontSize = Math.max(baseFontSize / globalScale, 1.5)
        ctx.font = `${isSelected || isSearchMatch || isHovered ? 'bold ' : ''}${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'

        // Text background for readability
        const maxLen = globalScale > 1.5 ? 25 : 18
        const label = gNode.name.length > maxLen ? gNode.name.slice(0, maxLen - 1) + '\u2026' : gNode.name
        const textWidth = ctx.measureText(label).width
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(x - textWidth / 2 - 1, y + radius + 1, textWidth + 2, fontSize + 2)

        ctx.fillStyle = isSearchMatch ? '#facc15' : isSelected ? '#ffffff' : isKeyNode ? '#f1f5f9' : '#cbd5e1'
        ctx.fillText(label, x, y + radius + 2)
      }
    },
    [selectedNode, searchMatchIds, hoveredNode],
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

  // Link color by relationship type
  const LINK_COLORS: Record<string, string> = {
    'MAYBE_SAME_AS': '#475569',
    'IS_DONOR': '#22c55e',
    'HAS_OFFSHORE_LINK': '#ef4444',
    'HAS_OFFSHORE': '#ef4444',
    'HAS_APPOINTMENT': '#f97316',
    'DONATED_TO': '#22c55e',
    'APPOINTED': '#f97316',
    'ON_BOARD': '#10b981',
    'MEMBER_OF': '#10b981',
    'CROSS_REFERENCED': '#f59e0b',
    'SHARES_BOARD': '#8b5cf6',
    'SAME_COALITION': '#f59e0b',
    'SAME_PROVINCE': '#6366f1',
    'BOTH_OFFSHORE': '#ef4444',
    'SHARED_ORG': '#10b981',
  }
  const linkColor = useCallback((link: GraphLinkData) => LINK_COLORS[link.type] ?? '#334155', [])

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
      {/* Preset filter buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 py-2">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {ui.presets[lang]}
        </span>
        {GRAPH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            title={preset.description[lang]}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              activePreset === preset.id
                ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {preset.label[lang]}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 px-4 py-2">
        <svg className="h-4 w-4 flex-shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={ui.searchPlaceholder[lang]}
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
        />
        {searchQuery && (
          <>
            {searchMatchIds && (
              <span className="text-xs text-zinc-500">
                {searchMatchIds.size} {searchMatchIds.size === 1 ? 'match' : 'matches'}
              </span>
            )}
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Top bar with node type legend and stats */}
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
                  {item.label[lang]} ({count})
                </span>
              </button>
            )
          })}
        </div>
        {graphData && (
          <span className="text-xs text-zinc-500">
            {filteredData ? filteredData.nodes.length : graphData.nodes.length} {ui.nodes[lang]} &middot;{' '}
            {filteredData ? filteredData.links.length : graphData.links.length} {ui.connections[lang]}
            {hiddenTypes.size > 0 && (
              <button
                onClick={() => { setHiddenTypes(new Set()); setActivePreset('all') }}
                className="ml-2 text-blue-400 hover:underline"
              >
                {ui.showAll[lang]}
              </button>
            )}
          </span>
        )}
      </div>

      {/* Edge type filter (collapsible) */}
      {graphData && (
        <div className="border-b border-zinc-800 bg-zinc-950/80">
          <button
            onClick={() => setEdgeFilterOpen(!edgeFilterOpen)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-zinc-500 hover:text-zinc-300"
          >
            <svg
              className={`h-3 w-3 transition-transform ${edgeFilterOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold uppercase tracking-wider">{ui.edgeTypes[lang]}</span>
            {hiddenEdgeTypes.size > 0 && (
              <span className="text-zinc-600">
                ({hiddenEdgeTypes.size} hidden)
              </span>
            )}
          </button>
          {edgeFilterOpen && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {EDGE_TYPE_LEGEND.map((item) => {
                const count = edgeTypeCounts.get(item.type) ?? 0
                if (count === 0) return null
                const isHidden = hiddenEdgeTypes.has(item.type)
                return (
                  <button
                    key={item.type}
                    onClick={() => toggleEdgeType(item.type)}
                    className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                      isHidden ? 'opacity-30' : 'opacity-100'
                    } hover:bg-zinc-800`}
                  >
                    <span
                      className="inline-block h-0.5 w-4"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-zinc-400">
                      {item.label[lang]} ({count})
                    </span>
                  </button>
                )
              })}
              {hiddenEdgeTypes.size > 0 && (
                <button
                  onClick={() => setHiddenEdgeTypes(new Set())}
                  className="ml-1 text-xs text-blue-400 hover:underline"
                >
                  {ui.showAll[lang]}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Graph area */}
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                <p className="text-sm text-zinc-500">{ui.loadingGraph[lang]}</p>
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
                  {ui.retry[lang]}
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
              onNodeHover={(node: NodeObject<GraphNodeData> | null) => setHoveredNode(node ? (node as GraphNodeData).id : null)}
              linkColor={linkColor as (link: object) => string}
              linkLabel={linkLabel as (link: object) => string}
              linkWidth={(link: object) => {
                const l = link as GraphLinkData
                return l.type === 'HAS_OFFSHORE' || l.type === 'DONATED_TO' ? 1.5 : 0.5
              }}
              linkDirectionalArrowLength={3}
              linkDirectionalArrowRelPos={0.9}
              linkCurvature={0.15}
              onNodeClick={handleNodeClick}
              enableZoomInteraction={true}
              enablePanInteraction={true}
              enableNodeDrag={false}
              warmupTicks={300}
              cooldownTicks={0}
              cooldownTime={0}
              d3AlphaDecay={0.0228}
              d3VelocityDecay={0.4}
              minZoom={0.2}
              maxZoom={25}
              onEngineStop={handleEngineStop}
            />
          )}

          {!loading && !error && graphData && !ForceGraph2D && (
            <div className="flex h-full items-center justify-center text-zinc-600">
              {ui.loadingVisualization[lang]}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        {graphData && (
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button
              onClick={zoomIn}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label={ui.zoomIn[lang]}
            >
              +
            </button>
            <button
              onClick={zoomOut}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label={ui.zoomOut[lang]}
            >
              −
            </button>
            <button
              onClick={zoomToFit}
              className="rounded border border-zinc-700 bg-zinc-900/90 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white"
              aria-label={ui.viewAll[lang]}
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
                    {getTypeLabel(selectedNode.type, lang)}
                  </span>
                </div>
                <h3 className="mt-1 truncate text-sm font-semibold text-zinc-100">
                  {selectedNode.name}
                </h3>
              </div>
              <button
                onClick={closeDetail}
                className="ml-2 flex-shrink-0 text-zinc-500 hover:text-zinc-300"
                aria-label={ui.closeDetail[lang]}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto px-4 py-3">
              {/* Connection count */}
              {selectedNodeConnections && (
                <div className="mb-3 rounded bg-zinc-800/60 px-3 py-2">
                  <div className="text-xs font-semibold text-zinc-200">
                    {selectedNodeConnections.totalConnections} {ui.connectionCount[lang]}
                  </div>

                  {/* Link type breakdown */}
                  {selectedNodeConnections.linkTypeCounts.size > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {Array.from(selectedNodeConnections.linkTypeCounts.entries())
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400">{type.replace(/_/g, ' ')}</span>
                            <span className="font-mono text-zinc-500">{count}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === 'Politician' && (
                <div className="mb-2 text-xs text-zinc-400">
                  {ui.presentIn[lang]} <span className="font-semibold text-blue-400">{selectedNode.datasets}</span> {ui.dataSources[lang]}
                </div>
              )}

              {/* Connected node names */}
              {selectedNodeConnections && selectedNodeConnections.connectedNodes.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    {ui.connectedTo[lang]}
                  </div>
                  <div className="space-y-0.5">
                    {selectedNodeConnections.connectedNodes.slice(0, 10).map((n) => (
                      <div key={n.id} className="flex items-center gap-1.5 text-xs">
                        <span
                          className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: n.color }}
                        />
                        <span className="truncate text-zinc-300">{n.name}</span>
                      </div>
                    ))}
                    {selectedNodeConnections.connectedNodes.length > 10 && (
                      <div className="text-[10px] text-zinc-600">
                        +{selectedNodeConnections.connectedNodes.length - 10} more
                      </div>
                    )}
                  </div>
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
                        {formatValue(value, lang)}
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

function getTypeLabel(type: string, lang: Lang): string {
  const labels: Record<string, Record<Lang, string>> = {
    Politician: { en: 'Politician', es: 'Politico' },
    OffshoreOfficer: { en: 'Offshore Officer', es: 'Oficial Offshore' },
    OffshoreEntity: { en: 'Offshore Entity', es: 'Entidad Offshore' },
    Donor: { en: 'Donor', es: 'Donante' },
    GovernmentAppointment: { en: 'Appointment', es: 'Nombramiento' },
    CompanyOfficer: { en: 'Company Officer', es: 'Directivo' },
    BoardMember: { en: 'Board Member', es: 'Miembro del Directorio' },
    AssetDeclaration: { en: 'Asset Declaration', es: 'Declaracion Jurada' },
  }
  return labels[type]?.[lang] ?? type
}

function formatValue(value: unknown, lang: Lang): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? (lang === 'en' ? 'Yes' : 'Si') : 'No'
  if (typeof value === 'number') return value.toLocaleString(lang === 'es' ? 'es-AR' : 'en-US')
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}
