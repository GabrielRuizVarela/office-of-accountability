'use client'

/**
 * Obras Publicas — Geographic map page.
 *
 * Real Argentina GeoJSON outline + Neo4j lat/lon project markers.
 * Proper Mercator projection shared by outline and data points.
 */

import Link from 'next/link'
import { useEffect, useState, useMemo } from 'react'

import { useLanguage } from '@/lib/language-context'

const SLUG = 'obras-publicas'

const t = {
  title: { en: 'Geographic Map', es: 'Mapa Geografico' },
  subtitle: {
    en: '7,455 public works across 24 provinces. 194 with GPS coordinates. Hover for details.',
    es: '7.455 obras publicas en 24 provincias. 194 con coordenadas GPS. Pase el cursor para detalles.',
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

const STATUS_COLORS: Record<string, string> = {
  completed: '#10b981',
  in_progress: '#3b82f6',
  suspended: '#f59e0b',
  cancelled: '#ef4444',
  planned: '#6b7280',
  Adjudicado: '#3b82f6',
}

const SECTOR_LABELS: Record<string, string> = {
  water: 'Agua', road: 'Vial', housing: 'Vivienda',
  energy: 'Energia', transport: 'Transporte', other: 'Otros',
}

function formatBudget(n: number | null): string {
  if (!n || n === 0) return '-'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}

// --- Mercator projection fitting Argentina into SVG viewBox ---
// Argentina bounds: lat [-55.5, -21.5], lon [-73.5, -53.5]
const SVG_W = 500
const SVG_H = 700
const LON_MIN = -73.5
const LON_MAX = -53.5
const LAT_MIN = -55.5
const LAT_MAX = -21.5

function mercatorY(lat: number): number {
  const radLat = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + radLat / 2))
}

const Y_MIN = mercatorY(LAT_MIN)
const Y_MAX = mercatorY(LAT_MAX)
const PADDING = 30

function project(lon: number, lat: number): [number, number] {
  const x = PADDING + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (SVG_W - 2 * PADDING)
  const my = mercatorY(lat)
  const y = PADDING + ((Y_MAX - my) / (Y_MAX - Y_MIN)) * (SVG_H - 2 * PADDING)
  return [x, y]
}

/** Convert GeoJSON polygon ring to SVG path string */
function ringToPath(coords: number[][]): string {
  return coords
    .map((c, i) => {
      const [x, y] = project(c[0], c[1])
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ') + ' Z'
}

export default function MapaPage() {
  const { lang } = useLanguage()
  const [provinces, setProvinces] = useState<ProvinceData[]>([])
  const [points, setPoints] = useState<PointData[]>([])
  const [geoPath, setGeoPath] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<PointData | null>(null)

  // Load GeoJSON outline
  useEffect(() => {
    fetch('/argentina.geo.json')
      .then((r) => r.json())
      .then((geojson) => {
        const feature = geojson.features?.[0] || geojson
        const geometry = feature.geometry
        const paths: string[] = []

        if (geometry.type === 'Polygon') {
          for (const ring of geometry.coordinates) {
            paths.push(ringToPath(ring))
          }
        } else if (geometry.type === 'MultiPolygon') {
          for (const polygon of geometry.coordinates) {
            for (const ring of polygon) {
              paths.push(ringToPath(ring))
            }
          }
        }
        setGeoPath(paths.join(' '))
      })
      .catch(() => {})
  }, [])

  // Load map data from Neo4j
  useEffect(() => {
    async function fetchMap() {
      try {
        const res = await fetch(`/api/caso/${SLUG}/map`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        setProvinces(json.data.provinces)
        setPoints(
          json.data.points.filter(
            (p: PointData) =>
              p.lat && p.lon &&
              p.lat > -56 && p.lat < -20 &&
              p.lon > -75 && p.lon < -52,
          ),
        )
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchMap()
  }, [])

  const maxWorks = Math.max(...provinces.map((p) => p.works), 1)

  // Projected points
  const projectedPoints = useMemo(
    () => points.map((p) => ({ ...p, xy: project(p.lon, p.lat) })),
    [points],
  )

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
          {/* Map */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-zinc-50">{t.pointsTitle[lang]}</h2>
            <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 p-2">
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="mx-auto w-full max-w-lg"
                style={{ height: 'auto', maxHeight: '70vh' }}
              >
                {/* Argentina outline from GeoJSON */}
                {geoPath && (
                  <path
                    d={geoPath}
                    fill="#27272a"
                    fillOpacity={0.2}
                    stroke="#52525b"
                    strokeOpacity={0.4}
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {projectedPoints.map((p, i) => {
                  const color = STATUS_COLORS[p.status] || '#6b7280'
                  const isHovered = hoveredPoint === p
                  return (
                    <circle
                      key={i}
                      cx={p.xy[0]}
                      cy={p.xy[1]}
                      r={isHovered ? 7 : 4}
                      fill={color}
                      fillOpacity={isHovered ? 1 : 0.85}
                      stroke={isHovered ? '#fff' : '#000'}
                      strokeWidth={isHovered ? 2 : 0.5}
                      strokeOpacity={isHovered ? 1 : 0.3}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  )
                })}
              </svg>

              {/* Tooltip */}
              {hoveredPoint && (
                <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 backdrop-blur sm:left-auto sm:right-3 sm:w-80">
                  <p className="text-sm font-semibold text-zinc-100">{hoveredPoint.name}</p>
                  <p className="text-xs text-zinc-400">
                    {hoveredPoint.province} &middot;{' '}
                    {SECTOR_LABELS[hoveredPoint.sector] || hoveredPoint.sector} &middot;{' '}
                    {hoveredPoint.status}
                  </p>
                  {hoveredPoint.contractor && (
                    <p className="mt-1 text-xs text-amber-400">
                      Contratista: {hoveredPoint.contractor}
                    </p>
                  )}
                  {hoveredPoint.budget > 0 && (
                    <p className="text-xs text-zinc-500">
                      Presupuesto: {formatBudget(hoveredPoint.budget)} &middot; Ejecucion:{' '}
                      {hoveredPoint.execution || 0}%
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-zinc-600">
                    {hoveredPoint.lat.toFixed(4)}, {hoveredPoint.lon.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'Adjudicado').map(([status, color]) => (
                  <span key={status} className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
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
                    <th className="px-4 py-3 font-medium text-zinc-300" />
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
                            <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${intensity}%` }} />
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
        <Link href={`/caso/${SLUG}/conexiones`} className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500">
          {t.navConnections[lang]}
        </Link>
        <Link href={`/caso/${SLUG}/investigacion`} className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500">
          {t.navInvestigation[lang]}
        </Link>
      </nav>
    </div>
  )
}
