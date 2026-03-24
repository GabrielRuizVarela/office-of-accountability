'use client'

/**
 * Obras Publicas — Connections page with interactive graph.
 *
 * Uses the generic [slug]/graph API with tier filtering to keep
 * the graph renderable in-browser (silver+gold only, ~200 nodes).
 */

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  ACTORS,
} from '@/lib/caso-obras-publicas/investigation-data'

const SLUG = 'obras-publicas'

// Lazy-load ForceGraph to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

const t = {
  title: { en: 'Connections', es: 'Conexiones' },
  subtitle: {
    en: 'Interactive graph of contractors, politicians, intermediaries, and bribery cases linked to Argentine public works.',
    es: 'Grafo interactivo de contratistas, politicos, intermediarios y casos de soborno vinculados a obras publicas argentinas.',
  },
  loading: { en: 'Loading graph...', es: 'Cargando grafo...' },
  error: { en: 'Could not load graph. Is Neo4j running?', es: 'No se pudo cargar el grafo. Esta corriendo Neo4j?' },
  nodeCount: { en: 'nodes', es: 'nodos' },
  linkCount: { en: 'connections', es: 'conexiones' },
  statsTitle: { en: 'Investigation Stats', es: 'Estadisticas de la Investigacion' },
  actorsTitle: { en: 'Key Entities', es: 'Entidades Clave' },
  navInvestigation: { en: '\u2190 Investigation', es: '\u2190 Investigacion' },
  navMap: { en: 'Map \u2192', es: 'Mapa \u2192' },
  tierFilter: { en: 'Showing gold + silver tier entities only (verified data)', es: 'Mostrando solo entidades de nivel oro + plata (datos verificados)' },
} as const

// Node type -> color mapping
const TYPE_COLORS: Record<string, string> = {
  Contractor: '#f59e0b',      // amber
  PublicWork: '#3b82f6',      // blue
  ObrasProcedure: '#6366f1',  // indigo
  PublicContract: '#10b981',  // emerald
  Bid: '#8b5cf6',             // violet
  BriberyCase: '#ef4444',     // red
  Intermediary: '#f97316',    // orange
  Politician: '#ec4899',      // pink
  Document: '#6b7280',        // gray
  Company: '#14b8a6',         // teal
}

interface GraphNode {
  id: string
  name: string
  type: string
  color: string
  val: number
}

interface GraphLink {
  source: string
  target: string
  type: string
}

export default function ConexionesPage() {
  const { lang } = useLanguage()
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGraph() {
      try {
        // Only fetch silver+gold to keep graph renderable
        const res = await fetch(`/api/caso/${SLUG}/graph?tiers=silver,gold`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Unknown error')

        // Transform API response
        const nodes = (json.data.nodes || []).map((n: any) => ({
          id: n.id,
          name: n.name || n.id,
          type: n.type || n.labels?.[0] || 'Unknown',
          color: TYPE_COLORS[n.type || n.labels?.[0]] || '#6b7280',
          val: Math.max(1, (n.datasets || n.val || 1)),
        }))

        const nodeIds = new Set(nodes.map((n: GraphNode) => n.id))
        const links = (json.data.links || [])
          .filter((l: any) => nodeIds.has(l.source) && nodeIds.has(l.target))
          .map((l: any) => ({
            source: l.source,
            target: l.target,
            type: l.type || '',
          }))

        setGraphData({ nodes, links })
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchGraph()
  }, [])

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <header className="text-center">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50 sm:text-3xl">
          {t.title[lang]}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </header>

      {/* Graph */}
      <div className="relative min-h-[500px] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
        {loading && (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-sm text-zinc-400 animate-pulse">{t.loading[lang]}</p>
          </div>
        )}
        {error && (
          <div className="flex h-[500px] items-center justify-center">
            <p className="text-sm text-red-400">{t.error[lang]}: {error}</p>
          </div>
        )}
        {graphData && (
          <>
            <div className="absolute top-3 left-3 z-10 rounded bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur">
              {graphData.nodes.length} {t.nodeCount[lang]} &middot; {graphData.links.length} {t.linkCount[lang]}
            </div>
            <div className="absolute top-3 right-3 z-10 rounded bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-500 backdrop-blur">
              {t.tierFilter[lang]}
            </div>
            {/* Legend */}
            <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded bg-zinc-900/80 px-3 py-1.5 backdrop-blur">
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {type}
                </span>
              ))}
            </div>
            <ForceGraph2D
              graphData={graphData}
              width={typeof window !== 'undefined' ? window.innerWidth - 64 : 900}
              height={500}
              backgroundColor="#09090b"
              nodeLabel={(node: any) => `${node.name} (${node.type})`}
              nodeColor={(node: any) => node.color}
              nodeRelSize={4}
              linkColor={() => 'rgba(113, 113, 122, 0.2)'}
              linkWidth={0.5}
              cooldownTicks={100}
              enableNodeDrag
              enableZoomInteraction
            />
          </>
        )}
      </div>

      {/* Stats */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-zinc-50">{t.statsTitle[lang]}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label_en}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-xl font-bold text-amber-400">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {lang === 'en' ? stat.label_en : stat.label_es}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Key entities */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-zinc-50">{t.actorsTitle[lang]}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTORS.map((actor) => (
            <div
              key={actor.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-100">{actor.name}</h3>
              <p className="mt-1 text-xs font-medium text-amber-400/80">
                {lang === 'en' ? actor.role_en : actor.role_es}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {lang === 'en' ? actor.description_en : actor.description_es}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href={`/caso/${SLUG}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navInvestigation[lang]}
        </Link>
        <Link
          href={`/caso/${SLUG}/mapa`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navMap[lang]}
        </Link>
      </nav>
    </div>
  )
}
