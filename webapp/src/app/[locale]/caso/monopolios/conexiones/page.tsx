'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d'

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'
import { ACTORS, FACTCHECK_ITEMS } from '@/lib/caso-monopolios/investigation-data'

// Lazy-load ForceGraph (uses canvas, SSR-incompatible)
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

// ---------------------------------------------------------------------------
// Graph data built from investigation-data.ts
// ---------------------------------------------------------------------------

interface GNode {
  id: string
  name: string
  type: 'family' | 'sector' | 'offshore' | 'political'
  color: string
  val: number
}

interface GLink {
  source: string
  target: string
  type: string
  color: string
}

const SECTOR_COLORS: Record<string, string> = {
  telecom: '#3b82f6',
  energy: '#f59e0b',
  food: '#10b981',
  media: '#a855f7',
  banking: '#06b6d4',
  mining: '#ef4444',
  agroexport: '#84cc16',
  construction: '#f97316',
  pharma: '#ec4899',
  transport: '#6366f1',
  cross_sector: '#71717a',
  regulatory_capture: '#dc2626',
}

function buildGraph() {
  const nodes: GNode[] = []
  const links: GLink[] = []
  const nodeSet = new Set<string>()

  // Add actor nodes (families)
  for (const actor of ACTORS) {
    nodes.push({
      id: actor.id,
      name: actor.name,
      type: 'family',
      color: '#f59e0b',
      val: Math.max(actor.companies_count / 5, 3),
    })
    nodeSet.add(actor.id)

    // Add sector nodes and link actors to sectors
    for (const sector of actor.sectors) {
      if (!nodeSet.has(sector)) {
        nodes.push({
          id: sector,
          name: sector.charAt(0).toUpperCase() + sector.slice(1),
          type: 'sector',
          color: SECTOR_COLORS[sector] ?? '#71717a',
          val: 4,
        })
        nodeSet.add(sector)
      }
      links.push({
        source: actor.id,
        target: sector,
        type: 'controls',
        color: SECTOR_COLORS[sector] + '66' ?? '#71717a66',
      })
    }

    // Add offshore node if applicable
    if (actor.offshore_count > 0) {
      const offshoreId = `offshore-${actor.id}`
      nodes.push({
        id: offshoreId,
        name: `${actor.offshore_count} offshore`,
        type: 'offshore',
        color: '#ef4444',
        val: actor.offshore_count,
      })
      nodeSet.add(offshoreId)
      links.push({
        source: actor.id,
        target: offshoreId,
        type: 'offshore',
        color: '#ef444466',
      })
    }
  }

  // Cross-sector connections (actors sharing sectors)
  const sectorActors: Record<string, string[]> = {}
  for (const actor of ACTORS) {
    for (const sector of actor.sectors) {
      if (!sectorActors[sector]) sectorActors[sector] = []
      sectorActors[sector].push(actor.id)
    }
  }
  for (const [sector, actorIds] of Object.entries(sectorActors)) {
    for (let i = 0; i < actorIds.length; i++) {
      for (let j = i + 1; j < actorIds.length; j++) {
        links.push({
          source: actorIds[i],
          target: actorIds[j],
          type: 'shared_sector',
          color: '#ffffff11',
        })
      }
    }
  }

  // Add key political connections
  const politicalNodes: { id: string; name: string }[] = [
    { id: 'privatizaciones', name: 'Privatizaciones 1989-99' },
    { id: 'cuadernos', name: 'Cuadernos' },
    { id: 'cndc', name: 'CNDC / ANC' },
    { id: 'rigi', name: 'RIGI' },
  ]
  for (const pn of politicalNodes) {
    nodes.push({ id: pn.id, name: pn.name, type: 'political', color: '#dc2626', val: 3 })
    nodeSet.add(pn.id)
  }

  // Link actors to political events
  const privatizationActors = ['mindlin', 'magnetto', 'eurnekian', 'rocca', 'roggio', 'perez-companc']
  for (const a of privatizationActors) {
    if (nodeSet.has(a)) links.push({ source: a, target: 'privatizaciones', type: 'origin', color: '#dc262644' })
  }
  const cuadernosActors = ['roggio', 'rocca']
  for (const a of cuadernosActors) {
    if (nodeSet.has(a)) links.push({ source: a, target: 'cuadernos', type: 'defendant', color: '#dc262666' })
  }

  return { nodes, links }
}

// ---------------------------------------------------------------------------
// Legend
// ---------------------------------------------------------------------------

const LEGEND: { type: string; color: string; label: Record<Lang, string> }[] = [
  { type: 'family', color: '#f59e0b', label: { es: 'Familia / Grupo', en: 'Family / Group' } },
  { type: 'sector', color: '#3b82f6', label: { es: 'Sector', en: 'Sector' } },
  { type: 'offshore', color: '#ef4444', label: { es: 'Offshore', en: 'Offshore' } },
  { type: 'political', color: '#dc2626', label: { es: 'Evento politico', en: 'Political event' } },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConexionesPage() {
  const { lang } = useLanguage()
  const fgRef = useRef<ForceGraphMethods<NodeObject>>()
  const [hovered, setHovered] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  const graphData = useMemo(() => buildGraph(), [])

  useEffect(() => {
    function update() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const paintNode = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D) => {
      const n = node as NodeObject & GNode
      const r = Math.sqrt(n.val ?? 3) * 3
      const isHovered = hovered === n.id

      ctx.beginPath()
      ctx.arc(n.x!, n.y!, r, 0, 2 * Math.PI)
      ctx.fillStyle = isHovered ? '#ffffff' : (n.color ?? '#888')
      ctx.fill()

      if (n.type === 'family') {
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Label
      const label = n.name ?? ''
      const fontSize = n.type === 'family' ? 3.5 : 2.5
      ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = isHovered ? '#fff' : '#aaa'
      ctx.fillText(label, n.x!, n.y! + r + 2)
    },
    [hovered],
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="px-4 py-4">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50">
          {lang === 'es' ? 'Conexiones' : 'Connections'}
        </h1>
        <p className="text-sm text-zinc-400">
          {lang === 'es'
            ? `${ACTORS.length} familias monopolicas, ${Object.keys(SECTOR_COLORS).length} sectores, ${ACTORS.reduce((s, a) => s + a.offshore_count, 0)} entidades offshore. Grafo interactivo construido desde los datos de investigacion.`
            : `${ACTORS.length} monopoly families, ${Object.keys(SECTOR_COLORS).length} sectors, ${ACTORS.reduce((s, a) => s + a.offshore_count, 0)} offshore entities. Interactive graph built from investigation data.`}
        </p>
        {/* Legend */}
        <div className="mt-2 flex flex-wrap gap-4">
          {LEGEND.map((l) => (
            <div key={l.type} className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[11px] text-zinc-500">{l.label[lang]}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 bg-zinc-950">
        {typeof window !== 'undefined' && (
          <ForceGraph2D
            ref={fgRef as never}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node, color, ctx) => {
              const r = Math.sqrt((node as NodeObject & GNode).val ?? 3) * 3
              ctx.beginPath()
              ctx.arc(node.x!, node.y!, r + 2, 0, 2 * Math.PI)
              ctx.fillStyle = color
              ctx.fill()
            }}
            linkColor={(link: object) => (link as GLink).color ?? '#ffffff11'}
            linkWidth={0.5}
            linkDirectionalParticles={0}
            backgroundColor="#09090b"
            onNodeHover={(node) => setHovered(node ? (node as NodeObject & GNode).id : null)}
            cooldownTime={3000}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        )}
      </div>
    </div>
  )
}
