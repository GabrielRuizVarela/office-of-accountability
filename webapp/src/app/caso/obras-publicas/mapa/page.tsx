'use client'

/**
 * Obras Publicas — Geographic map page.
 *
 * Province-level stats table + individual lat/lon project markers.
 * Uses data from Neo4j via /api/caso/obras-publicas/map.
 */

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useLanguage } from '@/lib/language-context'

const SLUG = 'obras-publicas'

const t = {
  title: { en: 'Geographic Map', es: 'Mapa Geografico' },
  subtitle: {
    en: '7,455 public works mapped across 24 Argentine provinces. 194 projects with exact GPS coordinates. Color intensity by number of works.',
    es: '7.455 obras publicas mapeadas en 24 provincias argentinas. 194 proyectos con coordenadas GPS exactas. Intensidad de color por cantidad de obras.',
  },
  loading: { en: 'Loading map data...', es: 'Cargando datos del mapa...' },
  error: { en: 'Could not load map data', es: 'No se pudieron cargar los datos del mapa' },
  province: { en: 'Province', es: 'Provincia' },
  works: { en: 'Works', es: 'Obras' },
  budget: { en: 'Budget (ARS)', es: 'Presupuesto (ARS)' },
  avgExec: { en: 'Avg. Execution', es: 'Ejecucion Prom.' },
  ghostProjects: { en: 'Ghost Projects', es: 'Obras Fantasma' },
  pointsTitle: { en: 'Geolocated Projects', es: 'Proyectos Geolocalizados' },
  navConnections: { en: '\u2190 Connections', es: '\u2190 Conexiones' },
  navInvestigation: { en: 'Investigation \u2192', es: 'Investigacion \u2192' },
} as const

interface ProvinceData {
  name: string
  works: number
  totalBudget: number
  avgExecution: number
  ghostProjects: number
}

interface PointData {
  name: string
  lat: number
  lon: number
  province: string
  status: string
  sector: string
  budget: number
  execution: number
  contractor: string | null
}

// Status colors
const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  in_progress: '#3b82f6',
  suspended: '#f59e0b',
  cancelled: '#ef4444',
  planned: '#6b7280',
}

// Sector labels
const SECTOR_LABELS: Record<string, string> = {
  water: 'Agua/Saneamiento',
  road: 'Vial',
  housing: 'Vivienda',
  energy: 'Energia',
  transport: 'Transporte',
  other: 'Otros',
}

function formatBudget(n: number | null): string {
  if (!n || n === 0) return '-'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

// Simple Argentina-shaped SVG point projection (Mercator-like)
function projectPoint(lat: number, lon: number): { x: number; y: number } {
  // Argentina bounds approx: lat -55 to -22, lon -74 to -53
  const x = ((lon + 74) / 21) * 400 + 50
  const y = ((lat + 22) / -33) * 600 + 30
  return { x, y }
}

export default function MapaPage() {
  const { lang } = useLanguage()
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [points, setPoints] = useState<PointData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<PointData | null>(null)

  useEffect(() => {
    async function fetchMap() {
      try {
        const res = await fetch(`/api/caso/${SLUG}/map`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        setProvinces(json.data.provinces)
        setPoints(json.data.points.filter((p: PointData) => p.lat && p.lon && Math.abs(p.lat) > 1))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchMap()
  }, [])

  const maxWorks = Math.max(...provinces.map((p) => p.works), 1)

  return (
    <div className="space-y-12 pb-16">
      <header className="text-center">
        <h1 className="mb-1 text-2xl font-bold text-zinc-50 sm:text-3xl">{t.title[lang]}</h1>
        <p className="mx-auto max-w-2xl text-sm text-zinc-400">{t.subtitle[lang]}</p>
      </header>

      {loading && (
        <div className="flex h-[300px] items-center justify-center">
          <p className="animate-pulse text-sm text-zinc-400">{t.loading[lang]}</p>
        </div>
      )}

      {error && (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-red-400">{t.error[lang]}: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Point map */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-zinc-50">{t.pointsTitle[lang]}</h2>
            <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 p-4">
              <svg viewBox="0 0 500 650" className="mx-auto h-[500px] w-full max-w-md">
                {/* Points */}
                {points.map((p, i) => {
                  const { x, y } = projectPoint(p.lat, p.lon)
                  const color = STATUS_COLORS[p.status] || '#6b7280'
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={hoveredPoint === p ? 6 : 3.5}
                      fill={color}
                      fillOpacity={0.8}
                      stroke={hoveredPoint === p ? '#fff' : 'none'}
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredPoint && (
                <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 backdrop-blur">
                  <p className="text-sm font-semibold text-zinc-100">{hoveredPoint.name}</p>
                  <p className="text-xs text-zinc-400">
                    {hoveredPoint.province} &middot; {SECTOR_LABELS[hoveredPoint.sector] || hoveredPoint.sector} &middot; {hoveredPoint.status}
                  </p>
                  {hoveredPoint.contractor && (
                    <p className="mt-1 text-xs text-amber-400">Contratista: {hoveredPoint.contractor}</p>
                  )}
                  {hoveredPoint.budget > 0 && (
                    <p className="text-xs text-zinc-500">
                      Presupuesto: {formatBudget(hoveredPoint.budget)} &middot; Ejecucion: {hoveredPoint.execution || 0}%
                    </p>
                  )}
                </div>
              )}

              {/* Legend */}
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <span key={status} className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    {status}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Province table */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-zinc-50">
              {lang === 'en' ? 'Province Breakdown' : 'Desglose por Provincia'}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-4 py-3 font-medium text-zinc-300">{t.province[lang]}</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-300">{t.works[lang]}</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-300">{t.budget[lang]}</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-300">{t.avgExec[lang]}</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-300">{t.ghostProjects[lang]}</th>
                    <th className="px-4 py-3 font-medium text-zinc-300"></th>
                  </tr>
                </thead>
                <tbody>
                  {provinces.map((p) => {
                    const intensity = Math.round((p.works / maxWorks) * 100)
                    return (
                      <tr key={p.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/30">
                        <td className="px-4 py-2.5 font-medium text-zinc-200">{p.name}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-300">{p.works.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-zinc-400">{formatBudget(p.totalBudget)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={p.avgExecution < 50 ? 'text-red-400' : p.avgExecution < 80 ? 'text-amber-400' : 'text-emerald-400'}>
                            {p.avgExecution ? `${p.avgExecution.toFixed(1)}%` : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {p.ghostProjects > 0 ? (
                            <span className="text-red-400">{p.ghostProjects}</span>
                          ) : (
                            <span className="text-zinc-600">0</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-amber-500/70"
                              style={{ width: `${intensity}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href={`/caso/${SLUG}/conexiones`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navConnections[lang]}
        </Link>
        <Link
          href={`/caso/${SLUG}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navInvestigation[lang]}
        </Link>
      </nav>
    </div>
  )
}
