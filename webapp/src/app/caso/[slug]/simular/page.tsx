'use client'

import { use, useEffect, useState } from 'react'

import { useLanguage, type Lang } from '@/lib/language-context'
import type { CentralityResult } from '@/lib/engine/algorithms/centrality'
import type { Anomaly } from '@/lib/engine/algorithms/anomaly'
import type { InvestigationStats } from '@/lib/investigations/types'

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

const t = {
  title: { es: 'Analisis Hipotetico', en: 'What-If Analysis' },
  subtitle: {
    es: 'Insights sobre la red de actores clave, anomalias estadisticas y estadisticas del grafo de conocimiento.',
    en: 'Insights into the key actor network, statistical anomalies, and knowledge graph statistics.',
  },
  keyActors: { es: 'Actores Clave', en: 'Key Actors' },
  keyActorsSubtitle: {
    es: 'Los 10 nodos con mayor centralidad de grado en el grafo de investigacion.',
    en: 'Top 10 nodes by degree centrality in the investigation graph.',
  },
  connections: { es: 'conexiones', en: 'connections' },
  anomalies: { es: 'Anomalias Detectadas', en: 'Detected Anomalies' },
  anomaliesSubtitle: {
    es: 'Nodos con comportamiento estadisticamente inusual en la red.',
    en: 'Nodes with statistically unusual behavior in the network.',
  },
  graphStats: { es: 'Estadisticas del Grafo', en: 'Graph Statistics' },
  graphStatsSubtitle: {
    es: 'Conteo de nodos por tipo en el grafo de conocimiento.',
    en: 'Node counts by type in the knowledge graph.',
  },
  totalNodes: { es: 'Total nodos', en: 'Total nodes' },
  totalRels: { es: 'Total relaciones', en: 'Total relationships' },
  loading: { es: 'Cargando...', en: 'Loading...' },
  error: { es: 'Error al cargar datos', en: 'Failed to load data' },
  noData: { es: 'Sin datos disponibles', en: 'No data available' },
  highDegree: { es: 'Alta centralidad', en: 'High centrality' },
  tierMismatch: { es: 'Desajuste de tier', en: 'Tier mismatch' },
  isolatedCluster: { es: 'Cluster aislado', en: 'Isolated cluster' },
  temporalGap: { es: 'Brecha temporal', en: 'Temporal gap' },
  severityHigh: { es: 'Alto', en: 'High' },
  severityMed: { es: 'Medio', en: 'Medium' },
  severityLow: { es: 'Bajo', en: 'Low' },
} satisfies Record<string, Record<Lang, string>>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function anomalyTypeLabel(type: Anomaly['type'], lang: Lang): string {
  const map: Record<Anomaly['type'], Record<Lang, string>> = {
    high_degree: t.highDegree,
    tier_mismatch: t.tierMismatch,
    isolated_cluster: t.isolatedCluster,
    temporal_gap: t.temporalGap,
  }
  return map[type]?.[lang] ?? type
}

function severityBadgeClass(severity: number): string {
  if (severity > 0.7) return 'bg-red-500/20 text-red-400 border border-red-500/30'
  if (severity > 0.4) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
  return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/30'
}

function severityLabel(severity: number, lang: Lang): string {
  if (severity > 0.7) return t.severityHigh[lang]
  if (severity > 0.4) return t.severityMed[lang]
  return t.severityLow[lang]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimularPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { lang } = useLanguage()

  // Centrality data
  const [centrality, setCentrality] = useState<CentralityResult[] | null>(null)
  const [centralityError, setCentralityError] = useState<string | null>(null)
  const [centralityLoading, setCentralityLoading] = useState(true)

  // Anomaly data
  const [anomalies, setAnomalies] = useState<Anomaly[] | null>(null)
  const [anomalyError, setAnomalyError] = useState<string | null>(null)
  const [anomalyLoading, setAnomalyLoading] = useState(true)

  // Graph stats
  const [stats, setStats] = useState<InvestigationStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch centrality
  useEffect(() => {
    async function fetchCentrality() {
      try {
        const res = await fetch(`/api/casos/${slug}/engine/analyze/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'centrality' }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Unknown error')
        setCentrality((json.data?.results as CentralityResult[]) ?? [])
      } catch (err) {
        setCentralityError(err instanceof Error ? err.message : String(err))
      } finally {
        setCentralityLoading(false)
      }
    }
    fetchCentrality()
  }, [slug])

  // Fetch anomalies
  useEffect(() => {
    async function fetchAnomalies() {
      try {
        const res = await fetch(`/api/casos/${slug}/engine/analyze/run`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'anomaly' }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Unknown error')
        setAnomalies((json.data?.anomalies as Anomaly[]) ?? [])
      } catch (err) {
        setAnomalyError(err instanceof Error ? err.message : String(err))
      } finally {
        setAnomalyLoading(false)
      }
    }
    fetchAnomalies()
  }, [slug])

  // Fetch graph stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/caso/${slug}/stats`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error ?? 'Unknown error')
        setStats(json.data as InvestigationStats)
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : String(err))
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [slug])

  // Max degree for bar chart scaling
  const maxDegree = centrality && centrality.length > 0 ? centrality[0].degree : 1

  return (
    <div className="space-y-8 pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-50 sm:text-3xl">{t.title[lang]}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Key Actors (centrality)                                             */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200">{t.keyActors[lang]}</h2>
        <p className="mt-1 text-xs text-zinc-500">{t.keyActorsSubtitle[lang]}</p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          {centralityLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {t.loading[lang]}
            </div>
          )}
          {!centralityLoading && centralityError && (
            <div className="flex items-center justify-center py-12 text-sm text-red-400">
              {t.error[lang]}: {centralityError}
            </div>
          )}
          {!centralityLoading && !centralityError && (!centrality || centrality.length === 0) && (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-500">
              {t.noData[lang]}
            </div>
          )}
          {!centralityLoading && !centralityError && centrality && centrality.length > 0 && (
            <ol className="divide-y divide-zinc-800/60">
              {centrality.slice(0, 10).map((actor, i) => (
                <li key={actor.id ?? i} className="flex items-center gap-4 px-5 py-3">
                  {/* Rank */}
                  <span className="w-6 shrink-0 text-right text-xs font-bold text-zinc-500">
                    #{i + 1}
                  </span>

                  {/* Name + label */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {actor.name ?? actor.id}
                    </p>
                    <p className="text-xs text-zinc-500">{actor.label}</p>
                  </div>

                  {/* Bar chart */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.round((actor.degree / maxDegree) * 100)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs text-zinc-400">
                      {actor.degree} {t.connections[lang]}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Anomalies                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200">{t.anomalies[lang]}</h2>
        <p className="mt-1 text-xs text-zinc-500">{t.anomaliesSubtitle[lang]}</p>

        <div className="mt-4">
          {anomalyLoading && (
            <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-sm text-zinc-500">
              {t.loading[lang]}
            </div>
          )}
          {!anomalyLoading && anomalyError && (
            <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-sm text-red-400">
              {t.error[lang]}: {anomalyError}
            </div>
          )}
          {!anomalyLoading && !anomalyError && (!anomalies || anomalies.length === 0) && (
            <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 py-12 text-sm text-zinc-500">
              {t.noData[lang]}
            </div>
          )}
          {!anomalyLoading && !anomalyError && anomalies && anomalies.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {anomalies.map((anomaly, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-snug text-zinc-200">{anomaly.description}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${severityBadgeClass(anomaly.severity)}`}
                    >
                      {severityLabel(anomaly.severity, lang)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-xs text-zinc-400">
                      {anomalyTypeLabel(anomaly.type, lang)}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {(anomaly.severity * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Graph Stats                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <h2 className="text-base font-semibold text-zinc-200">{t.graphStats[lang]}</h2>
        <p className="mt-1 text-xs text-zinc-500">{t.graphStatsSubtitle[lang]}</p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          {statsLoading && (
            <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
              {t.loading[lang]}
            </div>
          )}
          {!statsLoading && statsError && (
            <div className="flex items-center justify-center py-8 text-sm text-red-400">
              {t.error[lang]}: {statsError}
            </div>
          )}
          {!statsLoading && !statsError && !stats && (
            <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
              {t.noData[lang]}
            </div>
          )}
          {!statsLoading && !statsError && stats && (
            <>
              {/* Totals row */}
              <div className="flex gap-8 border-b border-zinc-800 pb-4 mb-4">
                <div>
                  <p className="text-2xl font-bold text-zinc-50">{stats.totalNodes.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">{t.totalNodes[lang]}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-50">{stats.totalRelationships.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">{t.totalRels[lang]}</p>
                </div>
              </div>

              {/* By type */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(stats.nodeCountsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-2"
                    >
                      <p className="text-lg font-semibold text-zinc-100">{count.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">{type}</p>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
