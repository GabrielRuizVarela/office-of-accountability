'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { Link } from '@/i18n/navigation'

import { KeyStats } from '@/components/investigation/KeyStats'

const t = {
  tagline: {
    en: 'Daily nuclear risk monitoring — Office of Accountability',
    es: 'Monitoreo diario de riesgo nuclear — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Global Nuclear Risk Tracker',
    es: 'Rastreador Global de Riesgo Nuclear',
  },
  desc: {
    en: 'Real-time monitoring of signals that could indicate escalation of nuclear risk. Tracking military developments, official statements, treaty status, and open-source intelligence across all nuclear-armed states.',
    es: 'Monitoreo en tiempo real de senales que podrian indicar escalada del riesgo nuclear. Seguimiento de desarrollos militares, declaraciones oficiales, estado de tratados e inteligencia de fuentes abiertas.',
  },
  theaters: { en: 'Theaters', es: 'Teatros' },
  signals: { en: 'Signals', es: 'Senales' },
  avgSeverity: { en: 'avg severity', es: 'severidad prom.' },
  graph: { en: 'Explore the graph', es: 'Explorar el grafo' },
  graphDesc: {
    en: 'Visualize connections between actors, weapons, treaties, and signals',
    es: 'Visualizar conexiones entre actores, armas, tratados y senales',
  },
  timeline: { en: 'Timeline', es: 'Cronologia' },
  timelineDesc: {
    en: 'Chronological view of nuclear escalation signals',
    es: 'Vista cronologica de senales de escalada nuclear',
  },
} as const

interface TheaterSummary {
  readonly theater: string
  readonly signalCount: number
  readonly avgSeverity: number
  readonly maxLevel: string
}

const LEVEL_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  serious: 'bg-orange-500',
  elevated: 'bg-yellow-500',
  notable: 'bg-blue-500',
  routine: 'bg-green-500',
}

const LEVEL_LABELS: Record<string, Record<Locale, string>> = {
  critical: { en: 'Critical', es: 'Critico' },
  serious: { en: 'Serious', es: 'Serio' },
  elevated: { en: 'Elevated', es: 'Elevado' },
  notable: { en: 'Notable', es: 'Notable' },
  routine: { en: 'Routine', es: 'Rutina' },
}

export function NuclearRiskLanding({
  slug,
  stats,
  theaters,
}: {
  readonly slug: string
  readonly stats: { label: string; value: string | number; color: string }[]
  readonly theaters: readonly TheaterSummary[]
}) {
  const locale = useLocale() as Locale

  return (
    <div className="space-y-8">
      {/* Hero */}
      <header className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-yellow-400 uppercase">
          {t.tagline[locale]}
        </p>
        <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">
          {t.title[locale]}
        </h1>
        <p className="max-w-3xl text-lg text-zinc-400">
          {t.desc[locale]}
        </p>
      </header>

      {/* Stats */}
      <KeyStats stats={stats} />

      {/* Theater cards */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-200">
          {t.theaters[locale]}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {theaters.map((th) => (
            <div
              key={th.theater}
              className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-zinc-200">{th.theater}</h3>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${LEVEL_COLORS[th.maxLevel] ?? 'bg-zinc-600'}`}
                >
                  {LEVEL_LABELS[th.maxLevel]?.[locale] ?? th.maxLevel}
                </span>
              </div>
              <div className="mt-2 text-sm text-zinc-400">
                {th.signalCount} {t.signals[locale].toLowerCase()} · {t.avgSeverity[locale]} {th.avgSeverity}
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-700">
                <div
                  className={`h-2 rounded-full ${LEVEL_COLORS[th.maxLevel] ?? 'bg-zinc-500'}`}
                  style={{ width: `${Math.min(100, th.avgSeverity)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Entry points */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/caso/${slug}/grafo`}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-5 transition hover:border-yellow-500/50"
        >
          <h3 className="font-semibold text-zinc-200">{t.graph[locale]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.graphDesc[locale]}</p>
        </Link>
        <Link
          href={`/caso/${slug}/cronologia`}
          className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-5 transition hover:border-yellow-500/50"
        >
          <h3 className="font-semibold text-zinc-200">{t.timeline[locale]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{t.timelineDesc[locale]}</p>
        </Link>
      </section>
    </div>
  )
}
