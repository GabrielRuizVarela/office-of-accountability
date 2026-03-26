'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'
import {
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
  MONEY_FLOWS,
  type FactcheckStatus,
  type InvestigationCategory,
  type TimelineEvent,
} from '@/lib/caso-adorni/investigation-data'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: 'hero', label_es: 'Inicio', label_en: 'Top' },
  { id: 'factcheck', label_es: 'Verificacion', label_en: 'Factcheck' },
  { id: 'timeline', label_es: 'Cronologia', label_en: 'Timeline' },
  { id: 'actors', label_es: 'Actores', label_en: 'Actors' },
  { id: 'money', label_es: 'Dinero', label_en: 'Money' },
] as const

const STATUS_COLORS: Record<FactcheckStatus, string> = {
  confirmed: '#10b981',
  alleged: '#f59e0b',
  confirmed_cleared: '#3b82f6',
  unconfirmed: '#6b7280',
}

const STATUS_LABELS: Record<FactcheckStatus, Record<Lang, string>> = {
  confirmed: { es: 'Confirmado', en: 'Confirmed' },
  alleged: { es: 'Presunto', en: 'Alleged' },
  confirmed_cleared: { es: 'Sobreseido', en: 'Cleared' },
  unconfirmed: { es: 'No confirmado', en: 'Unconfirmed' },
}

const CATEGORY_COLORS: Record<InvestigationCategory, string> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  corporate: '#a855f7',
  media: '#ec4899',
}

const CATEGORY_LABELS: Record<InvestigationCategory, Record<Lang, string>> = {
  political: { es: 'Politico', en: 'Political' },
  financial: { es: 'Financiero', en: 'Financial' },
  legal: { es: 'Legal', en: 'Legal' },
  corporate: { es: 'Corporativo', en: 'Corporate' },
  media: { es: 'Medios', en: 'Media' },
}

const TIMELINE_CATEGORIES: InvestigationCategory[] = [
  'political',
  'financial',
  'legal',
  'corporate',
  'media',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatArs(amount: number): string {
  if (amount === 0) return 'Monto desconocido'
  if (amount >= 1_000_000_000) {
    return `ARS ${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `ARS ${(amount / 1_000_000).toFixed(0)}M`
  }
  if (amount >= 1_000) {
    return `ARS ${(amount / 1_000).toFixed(0)}K`
  }
  return `ARS ${amount.toLocaleString()}`
}

function formatDate(dateStr: string, lang: Lang): string {
  if (/^\d{4}[–-]\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + '-01T00:00:00')
    return d.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', {
      year: 'numeric',
      month: 'short',
    })
  }
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function InvestigacionPage() {
  const { lang } = useLanguage()
  const [activeSection, setActiveSection] = useState('hero')
  const [factcheckFilter, setFactcheckFilter] =
    useState<FactcheckStatus | null>(null)
  const [expandedFactchecks, setExpandedFactchecks] = useState<Set<string>>(
    new Set(),
  )
  const [timelineFilter, setTimelineFilter] =
    useState<InvestigationCategory | null>(null)

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // -- scroll spy -----------------------------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    )

    const currentRefs = sectionRefs.current
    for (const section of SECTIONS) {
      const el = currentRefs[section.id]
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      sectionRefs.current[id] = el
    },
    [],
  )

  // -- filtered data --------------------------------------------------------
  const filteredFactchecks = useMemo(
    () =>
      factcheckFilter
        ? FACTCHECK_ITEMS.filter((f) => f.status === factcheckFilter)
        : FACTCHECK_ITEMS,
    [factcheckFilter],
  )

  const filteredTimeline = useMemo(
    () =>
      timelineFilter
        ? TIMELINE_EVENTS.filter((e) => e.category === timelineFilter)
        : TIMELINE_EVENTS,
    [timelineFilter],
  )

  const toggleFactcheck = useCallback((id: string) => {
    setExpandedFactchecks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const scrollTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="relative space-y-0">
        {/* Sticky section nav */}
        <nav className="sticky top-0 z-40 -mx-4 mb-8 border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-sm">
          <div className="scrollbar-none flex gap-1 overflow-x-auto py-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`whitespace-nowrap rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {lang === 'es' ? s.label_es : s.label_en}
              </button>
            ))}
          </div>
        </nav>

        {/* 1. HERO */}
        <section id="hero" ref={registerRef('hero')} className="pb-12">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
            {lang === 'es'
              ? 'Caso Adorni: Evidencia y Analisis'
              : 'The Adorni Case: Evidence & Analysis'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {lang === 'es'
              ? 'Investigacion verificada sobre el vocero presidencial Manuel Adorni. Verificacion de declaraciones oficiales, rastreo de pauta oficial, contratos mediaticos, y cruce con la investigacion de finanzas politicas. Cada afirmacion tiene fuente verificada.'
              : 'Verified investigation into presidential spokesperson Manuel Adorni. Official statement verification, advertising spend tracking, media contracts, and cross-investigation with political finance case. Every claim has a verified source.'}
          </p>
        </section>

        {/* 2. FACTCHECK TABLE */}
        <section id="factcheck" ref={registerRef('factcheck')} className="py-12">
          <h2 className="text-xl font-bold text-zinc-50">
            {lang === 'es' ? 'Verificacion de Hechos' : 'Factcheck'}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lang === 'es'
              ? `${FACTCHECK_ITEMS.length} afirmaciones verificadas contra fuentes publicas.`
              : `${FACTCHECK_ITEMS.length} claims verified against public sources.`}
          </p>

          {/* Status filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFactcheckFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                factcheckFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {lang === 'es' ? 'Todos' : 'All'} ({FACTCHECK_ITEMS.length})
            </button>
            {(Object.keys(STATUS_COLORS) as FactcheckStatus[]).map((status) => {
              const count = FACTCHECK_ITEMS.filter(
                (f) => f.status === status,
              ).length
              if (count === 0) return null
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setFactcheckFilter(
                      factcheckFilter === status ? null : status,
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    factcheckFilter === status
                      ? 'text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  style={
                    factcheckFilter === status
                      ? { backgroundColor: STATUS_COLORS[status] }
                      : undefined
                  }
                >
                  {STATUS_LABELS[status][lang]} ({count})
                </button>
              )
            })}
          </div>

          {/* Factcheck list */}
          <div className="mt-4 space-y-2">
            {filteredFactchecks.map((item) => {
              const isExpanded = expandedFactchecks.has(item.id)
              const detail = lang === 'es' ? item.detail_es : item.detail_en
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
                >
                  <button
                    type="button"
                    onClick={() => toggleFactcheck(item.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className="mt-1 inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                      style={{
                        backgroundColor: STATUS_COLORS[item.status],
                      }}
                    >
                      {STATUS_LABELS[item.status][lang]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200">
                        {lang === 'es' ? item.claim_es : item.claim_en}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs">
                          Tier {item.tier}
                        </span>
                        <span>
                          {lang === 'es' ? 'Fuente' : 'Source'}:{' '}
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.source}
                          </a>
                        </span>
                      </div>
                    </div>
                    {detail && (
                      <span className="mt-1 shrink-0 text-xs text-zinc-600">
                        {isExpanded ? '\u25B2' : '\u25BC'}
                      </span>
                    )}
                  </button>
                  {isExpanded && detail && (
                    <div className="border-t border-zinc-800 px-4 py-3">
                      <p className="text-sm leading-relaxed text-zinc-400">
                        {detail}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
            {filteredFactchecks.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">
                {lang === 'es'
                  ? 'No hay afirmaciones para este filtro.'
                  : 'No claims for this filter.'}
              </p>
            )}
          </div>
        </section>

        {/* 3. TIMELINE */}
        <section id="timeline" ref={registerRef('timeline')} className="py-12">
          <h2 className="text-xl font-bold text-zinc-50">
            {lang === 'es'
              ? 'Cronologia de la Investigacion'
              : 'Investigation Timeline'}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lang === 'es'
              ? `${TIMELINE_EVENTS.length} eventos documentados.`
              : `${TIMELINE_EVENTS.length} documented events.`}
          </p>

          {/* Category filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTimelineFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                timelineFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {lang === 'es' ? 'Todos' : 'All'} ({TIMELINE_EVENTS.length})
            </button>
            {TIMELINE_CATEGORIES.map((cat) => {
              const count = TIMELINE_EVENTS.filter(
                (e) => e.category === cat,
              ).length
              if (count === 0) return null
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setTimelineFilter(timelineFilter === cat ? null : cat)
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    timelineFilter === cat
                      ? 'text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                  style={
                    timelineFilter === cat
                      ? { backgroundColor: CATEGORY_COLORS[cat] ?? '#6b7280' }
                      : undefined
                  }
                >
                  {CATEGORY_LABELS[cat]?.[lang] ?? cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Vertical timeline */}
          <div className="relative mt-6 space-y-4 pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-800" />
            {filteredTimeline.map((event) => (
              <TimelineCard key={event.id} event={event} lang={lang} />
            ))}
            {filteredTimeline.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">
                {lang === 'es'
                  ? 'No hay eventos para este filtro.'
                  : 'No events for this filter.'}
              </p>
            )}
          </div>
        </section>

        {/* 4. ACTOR NETWORK */}
        <section id="actors" ref={registerRef('actors')} className="py-12">
          <h2 className="text-xl font-bold text-zinc-50">
            {lang === 'es' ? 'Actores Clave' : 'Key Actors'}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lang === 'es'
              ? `${ACTORS.length} personas y organizaciones involucradas.`
              : `${ACTORS.length} individuals and organizations involved.`}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTORS.map((actor) => (
              <div
                key={actor.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-zinc-100">
                      {actor.name}
                    </h3>
                    <p className="text-xs text-zinc-500">{actor.party}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-600/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                    {actor.datasets} datasets
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-blue-400">
                  {lang === 'es' ? actor.role_es : actor.role_en}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {lang === 'es' ? actor.description_es : actor.description_en}
                </p>
                {(actor.status_es || actor.status_en) && (
                  <p className="mt-3 border-t border-zinc-800 pt-2 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-400">
                      {lang === 'es' ? 'Estado' : 'Status'}:
                    </span>{' '}
                    {lang === 'es' ? actor.status_es : actor.status_en}
                  </p>
                )}
                {actor.source_url && (
                  <a
                    href={actor.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {lang === 'es' ? 'Fuente' : 'Source'} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 5. MONEY FLOW */}
        <section id="money" ref={registerRef('money')} className="py-12">
          <h2 className="text-xl font-bold text-zinc-50">
            {lang === 'es' ? 'Flujo de Dinero' : 'Money Flow'}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {lang === 'es'
              ? 'Rastreo de fondos basado en fuentes publicas verificadas.'
              : 'Fund tracing based on verified public sources.'}
          </p>

          {/* Flow list */}
          <div className="mt-6 space-y-3">
            {MONEY_FLOWS.map((flow) => (
              <div
                key={flow.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-200">
                      {flow.from_label}
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span className="font-medium text-zinc-200">
                      {flow.to_label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-sm font-bold text-emerald-400">
                      {formatArs(flow.amount_ars)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(flow.date, lang)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {lang === 'es' ? flow.description_es : flow.description_en}
                </p>
                <a
                  href={flow.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-400 hover:underline"
                >
                  {flow.source} ↗
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-zinc-800 py-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm leading-relaxed text-zinc-400">
              {lang === 'es'
                ? 'Esta investigacion se basa en fuentes publicas verificadas: conferencias de prensa, pauta oficial (GCBA/Nacion), DDJJ, Boletin Oficial, Compr.ar, y verificaciones periodisticas de Chequeado, AFP Factual y medios independientes.'
                : 'This investigation is based on verified public sources: press conferences, official advertising data (GCBA/Nacion), asset declarations, Boletin Oficial, Compr.ar, and fact-checks from Chequeado, AFP Factual and independent media.'}
            </p>
            <p className="mt-4 text-xs text-zinc-600">
              {lang === 'es' ? 'Ultima actualizacion' : 'Last updated'}:{' '}
              {formatDate('2026-03-26', lang)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-zinc-600">
              {[
                {
                  name: 'Chequeado',
                  url: 'https://chequeado.com',
                },
                {
                  name: 'AFP Factual',
                  url: 'https://factual.afp.com',
                },
                { name: 'datos.gob.ar', url: 'https://datos.gob.ar' },
                { name: 'Compr.ar', url: 'https://comprar.gob.ar' },
              ].map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-blue-400 hover:underline"
                >
                  {src.name}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Timeline card sub-component
// ---------------------------------------------------------------------------

function TimelineCard({
  event,
  lang,
}: {
  readonly event: TimelineEvent
  readonly lang: Lang
}) {
  const catColor = CATEGORY_COLORS[event.category] ?? '#6b7280'
  const catLabel = CATEGORY_LABELS[event.category]?.[lang] ?? event.category

  return (
    <div className="relative">
      <div
        className="absolute -left-[17px] top-3 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
        style={{ backgroundColor: catColor }}
      />
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">
            {formatDate(event.date, lang)}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: catColor }}
          >
            {catLabel}
          </span>
        </div>
        <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
          {lang === 'es' ? event.title_es : event.title_en}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {lang === 'es' ? event.description_es : event.description_en}
        </p>
        {event.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {event.sources.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                {lang === 'es' ? 'Fuente' : 'Source'} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
