'use client'

/**
 * Obras Publicas — Connections page.
 *
 * Placeholder for interactive graph visualization of contractors,
 * politicians, intermediaries, and bribery cases.
 * Will be populated with graph data from the Neo4j query API.
 */

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  ACTORS,
} from '@/lib/caso-obras-publicas/investigation-data'

const SLUG = 'obras-publicas'

const t = {
  title: { en: 'Connections', es: 'Conexiones' },
  subtitle: {
    en: 'Interactive graph of contractors, politicians, intermediaries, and bribery cases. Entity resolution via CUIT connects the obras-publicas graph with the finanzas-politicas investigation. Filter by Contractor-Donor, Offshore, Debarred, Odebrecht-linked, Cuadernos-linked.',
    es: 'Grafo interactivo de contratistas, politicos, intermediarios y casos de soborno. La resolucion de entidades via CUIT conecta el grafo de obras-publicas con la investigacion de finanzas-politicas. Filtre por Contratista-Donante, Offshore, Inhabilitado, Vinculado a Odebrecht, Vinculado a Cuadernos.',
  },
  comingSoon: {
    en: 'Graph visualization will be available after Wave 8 (deep graph queries) completes.',
    es: 'La visualizacion del grafo estara disponible cuando se complete la Ola 8 (consultas profundas del grafo).',
  },
  statsTitle: { en: 'Graph Statistics', es: 'Estadisticas del Grafo' },
  actorsTitle: { en: 'Key Entities', es: 'Entidades Clave' },
  navInvestigation: { en: '\u2190 Investigation', es: '\u2190 Investigacion' },
  navMap: { en: 'Map \u2192', es: 'Mapa \u2192' },
} as const

export default function ConexionesPage() {
  const { lang } = useLanguage()

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

      {/* Graph placeholder */}
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-amber-500/30 bg-amber-500/10 p-4">
            <svg className="h-full w-full text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <p className="text-sm text-zinc-400">{t.comingSoon[lang]}</p>
        </div>
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

      {/* Key entities preview */}
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
