'use client'

/**
 * Obras Publicas — Geographic map page.
 *
 * Unique to this investigation: geographic visualization of public works
 * with contractor overlays, color-coded by investigation flags.
 * Will use lat/lon data from MapaInversiones and CONTRAT.AR.
 */

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'

const SLUG = 'obras-publicas'

const t = {
  title: { en: 'Map', es: 'Mapa' },
  subtitle: {
    en: 'Geographic visualization of 7,481 public works with contractor overlays, color-coded by investigation flags. Lat/lon data from MapaInversiones and CONTRAT.AR ubicacion geografica.',
    es: 'Visualizacion geografica de 7.481 obras publicas con capas de contratistas, codificadas por color segun alertas de investigacion. Datos lat/lon de MapaInversiones y CONTRAT.AR ubicacion geografica.',
  },
  comingSoon: {
    en: 'Geographic map will be available after Wave 2 (MapaInversiones ingestion) completes and lat/lon data is loaded into the graph.',
    es: 'El mapa geografico estara disponible cuando se complete la Ola 2 (ingestion de MapaInversiones) y los datos de lat/lon se carguen en el grafo.',
  },
  flagsTitle: { en: 'Flag Types', es: 'Tipos de Alerta' },
  navConnections: { en: '\u2190 Connections', es: '\u2190 Conexiones' },
  navInvestigation: { en: 'Investigation \u2192', es: 'Investigacion \u2192' },
} as const

const FLAGS = [
  { color: '#ef4444', label_en: 'Odebrecht-linked', label_es: 'Vinculado a Odebrecht' },
  { color: '#f59e0b', label_en: 'Cuadernos-linked', label_es: 'Vinculado a Cuadernos' },
  { color: '#8b5cf6', label_en: 'Contractor-Donor', label_es: 'Contratista-Donante' },
  { color: '#3b82f6', label_en: 'Debarred (active)', label_es: 'Inhabilitado (activo)' },
  { color: '#10b981', label_en: 'Budget overrun (>150%)', label_es: 'Sobrecosto (>150%)' },
  { color: '#ec4899', label_en: 'Geographic concentration', label_es: 'Concentracion geografica' },
] as const

export default function MapaPage() {
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

      {/* Map placeholder */}
      <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-amber-500/30 bg-amber-500/10 p-4">
            <svg className="h-full w-full text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-sm text-zinc-400">{t.comingSoon[lang]}</p>
        </div>
      </div>

      {/* Flag legend */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-zinc-50">{t.flagsTitle[lang]}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FLAGS.map((flag) => (
            <div
              key={flag.label_en}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: flag.color }}
              />
              <span className="text-xs text-zinc-300">
                {lang === 'en' ? flag.label_en : flag.label_es}
              </span>
            </div>
          ))}
        </div>
      </section>

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
