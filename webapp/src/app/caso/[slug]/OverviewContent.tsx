'use client'

import Link from 'next/link'
import { useState } from 'react'

import { KeyStats } from '../../../components/investigation/KeyStats'

type Lang = 'en' | 'es'

interface Stat {
  readonly label: string
  readonly value: number | string
  readonly color: string
}

interface OverviewContentProps {
  readonly slug: string
  readonly stats: readonly Stat[]
}

const STAT_LABELS: Record<string, Record<Lang, string>> = {
  Persons: { en: 'Persons', es: 'Personas' },
  Events: { en: 'Events', es: 'Eventos' },
  Documents: { en: 'Documents', es: 'Documentos' },
  'Legal Cases': { en: 'Legal Cases', es: 'Casos Legales' },
}

const t = {
  badge: {
    en: 'Open-source investigation — Office of Accountability',
    es: 'Investigacion de datos abiertos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'The Epstein Network',
    es: 'La Red Epstein',
  },
  subtitle: {
    en: 'How a single financial relationship built a trafficking empire shielded by wealth, power, and institutional failure. 7,287 connected nodes, 21,944 edges, 0 orphans, quality score 8.5/10. Built from court records, DOJ file releases, flight logs, and investigative reporting.',
    es: 'Como una sola relacion financiera construyo un imperio de trafico protegido por riqueza, poder y fracaso institucional. 7,287 nodos conectados, 21,944 aristas, 0 huerfanos, puntuacion de calidad 8.5/10. Basado en registros judiciales, archivos del DOJ, bitacoras de vuelo y periodismo de investigacion.',
  },
  readStory: {
    en: 'Read the full story',
    es: 'Leer la historia completa',
  },
  readStoryDesc: {
    en: '11 chapters tracing the network from origin to 2026 arrests — with 27 citations',
    es: '11 capitulos trazando la red desde su origen hasta los arrestos de 2026 — con 27 citas',
  },
  browseEvidence: {
    en: 'Browse the evidence',
    es: 'Ver la evidencia',
  },
  browseEvidenceDesc: {
    en: 'Court filings, depositions, FBI records, flight logs — all verified and sourced',
    es: 'Expedientes judiciales, deposiciones, registros del FBI, bitacoras de vuelo — todo verificado y con fuentes',
  },
  investigation: {
    en: 'Verified investigation',
    es: 'Investigacion verificada',
  },
  investigationDesc: {
    en: '72 factchecked claims, 7,287 connected nodes, 355 verified persons, money flows, evidence chain, and government response',
    es: '72 afirmaciones verificadas, 7,287 nodos conectados, 355 personas verificadas, flujos de dinero, cadena de evidencia y respuesta gubernamental',
  },
  networkGraph: {
    en: 'Network Graph',
    es: 'Grafo de Red',
  },
  networkGraphDesc: {
    en: 'Interactive visualization of all connections between people, organizations, locations, and events.',
    es: 'Visualizacion interactiva de todas las conexiones entre personas, organizaciones, ubicaciones y eventos.',
  },
  timeline: {
    en: 'Timeline',
    es: 'Cronologia',
  },
  timelineDesc: {
    en: 'Chronological progression from the first investigation to the 2026 file releases.',
    es: 'Progresion cronologica desde la primera investigacion hasta la publicacion de archivos de 2026.',
  },
  flights: {
    en: 'Flight Records',
    es: 'Registros de Vuelo',
  },
  flightsDesc: {
    en: 'Flight logs with passengers, routes, and connections to key locations.',
    es: 'Bitacoras de vuelo con pasajeros, rutas y conexiones a ubicaciones clave.',
  },
  proximity: {
    en: 'Proximity Analysis',
    es: 'Analisis de Proximidad',
  },
  proximityDesc: {
    en: 'Where and when timelines of key persons overlap — locations, events, documents.',
    es: 'Donde y cuando se superponen las lineas de tiempo de personas clave — ubicaciones, eventos, documentos.',
  },
  simulation: {
    en: 'AI-Powered Network Analysis',
    es: 'Analisis de Red con IA',
  },
  simulationDesc: {
    en: 'MiroFish swarm intelligence — simulate multi-agent analysis of the network using locally-hosted LLMs. Ask questions from the perspective of investigators, prosecutors, and analysts.',
    es: 'Inteligencia de enjambre MiroFish — simula analisis multi-agente de la red usando LLMs locales. Haz preguntas desde la perspectiva de investigadores, fiscales y analistas.',
  },
} as const

export function OverviewContent({ slug, stats }: OverviewContentProps) {
  const [lang, setLang] = useState<Lang>('en')
  const basePath = `/caso/${slug}`

  const localizedStats = stats.map((s) => ({
    ...s,
    label: STAT_LABELS[s.label]?.[lang] ?? s.label,
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Language toggle */}
      <div className="mb-8 flex justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
          <button
            onClick={() => setLang('en')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              lang === 'en'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('es')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              lang === 'es'
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
          {t.badge[lang]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          {t.title[lang]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {t.subtitle[lang]}
        </p>
      </section>

      {/* Key Stats */}
      <div className="mb-10">
        <KeyStats stats={localizedStats} />
      </div>

      {/* Primary CTAs */}
      <section className="mb-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`${basePath}/resumen`}
          className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center transition-colors hover:border-blue-500/50 hover:bg-blue-500/15"
        >
          <h3 className="text-lg font-bold text-blue-300">{t.readStory[lang]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.readStoryDesc[lang]}</p>
        </Link>
        <Link
          href={`${basePath}/evidencia`}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900/50 p-6 text-center transition-colors hover:border-zinc-600"
        >
          <h3 className="text-lg font-bold text-zinc-100">{t.browseEvidence[lang]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.browseEvidenceDesc[lang]}</p>
        </Link>
      </section>

      {/* Investigation CTA */}
      <section className="mb-6">
        <Link
          href={`${basePath}/investigacion`}
          className="block rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          <h3 className="text-lg font-bold text-blue-200">{t.investigation[lang]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.investigationDesc[lang]}</p>
        </Link>
      </section>

      {/* Entry Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <EntryPoint href={`${basePath}/grafo`} title={t.networkGraph[lang]} description={t.networkGraphDesc[lang]} color="#3b82f6" />
        <EntryPoint href={`${basePath}/cronologia`} title={t.timeline[lang]} description={t.timelineDesc[lang]} color="#f59e0b" />
        <EntryPoint href={`${basePath}/vuelos`} title={t.flights[lang]} description={t.flightsDesc[lang]} color="#f97316" />
        <EntryPoint href={`${basePath}/proximidad`} title={t.proximity[lang]} description={t.proximityDesc[lang]} color="#10b981" />
      </section>

      {/* Simulation CTA */}
      <section className="mt-6">
        <Link
          href={`${basePath}/simulacion`}
          className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
        >
          <h3 className="text-lg font-semibold text-zinc-100">{t.simulation[lang]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.simulationDesc[lang]}</p>
        </Link>
      </section>
    </div>
  )
}

function EntryPoint({
  href,
  title,
  description,
  color,
}: {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly color: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700"
    >
      <div className="mb-2 h-1 w-8 rounded-full" style={{ backgroundColor: color }} />
      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
