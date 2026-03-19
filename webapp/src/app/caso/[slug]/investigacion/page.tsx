'use client'

/**
 * Caso Epstein — Comprehensive bilingual investigation page.
 *
 * Renders a complete, factchecked, sourced investigation of the Epstein
 * trafficking network with timeline, actor network, money flows, evidence
 * chain, government response tracking, and impact statistics.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

import {
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
  MONEY_FLOWS,
  EVIDENCE_DOCS,
  IMPACT_STATS,
  GOVERNMENT_RESPONSES,
  type FactcheckStatus,
  type InvestigationCategory,
  type InvestigationTimelineEvent,
  type VerificationStatus,
} from '@/lib/caso-epstein/investigation-data'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Lang = 'es' | 'en'

const SECTIONS = [
  { id: 'hero', label_es: 'Inicio', label_en: 'Top' },
  { id: 'resumen', label_es: 'Ejecutivo', label_en: 'Executive' },
  { id: 'factcheck', label_es: 'Verificacion', label_en: 'Factcheck' },
  { id: 'timeline', label_es: 'Cronologia', label_en: 'Timeline' },
  { id: 'actors', label_es: 'Actores', label_en: 'Actors' },
  { id: 'money', label_es: 'Dinero', label_en: 'Money' },
  { id: 'evidence', label_es: 'Evidencia', label_en: 'Evidence' },
  { id: 'government', label_es: 'Gobierno', label_en: 'Government' },
] as const

const STATUS_COLORS: Record<FactcheckStatus, string> = {
  confirmed: '#10b981',
  alleged: '#f59e0b',
  denied: '#ef4444',
  under_investigation: '#3b82f6',
}

const STATUS_LABELS: Record<FactcheckStatus, Record<Lang, string>> = {
  confirmed: { es: 'Confirmado', en: 'Confirmed' },
  alleged: { es: 'Presunto', en: 'Alleged' },
  denied: { es: 'Negado', en: 'Denied' },
  under_investigation: { es: 'En investigacion', en: 'Under investigation' },
}

const CATEGORY_COLORS: Record<InvestigationCategory, string> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  media: '#a855f7',
  coverup: '#dc2626',
}

const CATEGORY_LABELS: Record<InvestigationCategory, Record<Lang, string>> = {
  political: { es: 'Politico', en: 'Political' },
  financial: { es: 'Financiero', en: 'Financial' },
  legal: { es: 'Legal', en: 'Legal' },
  media: { es: 'Medios', en: 'Media' },
  coverup: { es: 'Encubrimiento', en: 'Coverup' },
}

const VERIFICATION_COLORS: Record<VerificationStatus, string> = {
  verified: '#10b981',
  partially_verified: '#f59e0b',
  unverified: '#ef4444',
}

const VERIFICATION_LABELS: Record<VerificationStatus, Record<Lang, string>> = {
  verified: { es: 'Verificado', en: 'Verified' },
  partially_verified: { es: 'Parcialmente verificado', en: 'Partially verified' },
  unverified: { es: 'No verificado', en: 'Unverified' },
}

const TIMELINE_CATEGORIES: InvestigationCategory[] = [
  'political',
  'financial',
  'legal',
  'media',
  'coverup',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount}`
}

function formatDate(dateStr: string, lang: Lang): string {
  // Handle date ranges like '1991-2001' or '2012-2017'
  if (/^\d{4}[–-]\d{4}$/.test(dateStr)) {
    return dateStr
  }
  // Handle plain years like '2023'
  if (/^\d{4}$/.test(dateStr)) {
    return dateStr
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
  const [lang, setLang] = useState<Lang>('en')
  const [activeSection, setActiveSection] = useState('hero')
  const [factcheckFilter, setFactcheckFilter] = useState<FactcheckStatus | null>(null)
  const [expandedFactchecks, setExpandedFactchecks] = useState<Set<string>>(new Set())
  const [timelineFilter, setTimelineFilter] = useState<InvestigationCategory | null>(null)

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

  const registerRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }, [])

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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const totalExtracted = MONEY_FLOWS.reduce((sum, f) => sum + f.amount_usd, 0)

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="relative space-y-0">
      {/* ------------------------------------------------------------------ */}
      {/* Sticky section nav                                                  */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 z-40 -mx-4 mb-8 border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
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
          <button
            type="button"
            onClick={() => setLang((l) => (l === 'es' ? 'en' : 'es'))}
            className="ml-3 shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </nav>

      {/* ================================================================== */}
      {/* 1. HERO                                                            */}
      {/* ================================================================== */}
      <section id="hero" ref={registerRef('hero')} className="pb-12">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-50 sm:text-3xl">
          {lang === 'es'
            ? 'La Red Epstein: Evidencia y Analisis'
            : 'The Epstein Network: Evidence & Analysis'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {lang === 'es'
            ? 'Una investigacion verificada y con fuentes sobre la red de trafico de Jeffrey Epstein. Cada dato esta respaldado por documentos judiciales, archivos del DOJ, informes del Congreso o reportajes periodisticos.'
            : 'A verified, sourced investigation into Jeffrey Epstein\'s trafficking network. Every claim is backed by court documents, DOJ files, congressional reports, or journalistic reporting.'}
        </p>

        {/* Impact stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.value}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-zinc-50 sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {lang === 'es' ? stat.label_es : stat.label_en}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">{stat.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2. EXECUTIVE SUMMARY                                               */}
      {/* ================================================================== */}
      <section id="resumen" ref={registerRef('resumen')} className="pb-12">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-zinc-50 mb-4">
            {lang === 'es' ? 'Resumen Ejecutivo' : 'Executive Summary'}
          </h2>

          {lang === 'es' ? (
            <>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Jeffrey Epstein construyo una de las redes de trafico sexual mas sofisticadas de la historia moderna, utilizando riqueza derivada de <strong className="text-zinc-100">Leslie Wexner</strong> — quien le transfiriio aproximadamente <strong className="text-zinc-100">$1.000 millones</strong> y le otorgo poder notarial completo en 1991. La red opero durante decadas a traves de multiples paises, protegida por conexiones con las elites financieras, politicas y legales.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                La clave de la red fue <strong className="text-zinc-100">Ghislaine Maxwell</strong>, quien mantuvo <strong className="text-zinc-100">22 conexiones independientes</strong> en la red. El analisis de grafos muestra que al eliminar a Epstein, Maxwell mantenia conectadas 11 de las 14 personas restantes — era la coarquitecta operativa, no una simple complice.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                La proteccion institucional fue sistematica: un <strong className="text-zinc-100">Acuerdo de No Procesamiento</strong> negociado en 2008 por el fiscal Alexander Acosta creo un escudo de inmunidad de 11 anos. Cuando Epstein finalmente fue arrestado en julio de 2019, fue encontrado muerto en su celda del MCC un mes despues — mientras los guardias dormian, las camaras fallaban y habia sido retirado de vigilancia antisuicidio.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Los facilitadores financieros incluyeron a <strong className="text-zinc-100">JPMorgan Chase</strong> (acuerdo de $290M), <strong className="text-zinc-100">Deutsche Bank</strong> (acuerdo de $75M), <strong className="text-zinc-100">Leon Black</strong> ($170M en pagos), y <strong className="text-zinc-100">Jes Staley</strong> (1.100 correos, prohibido permanentemente de la banca). Las victimas recibieron aproximadamente <strong className="text-zinc-100">$500 millones</strong> en acuerdos totales.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                La <strong className="text-zinc-100">Ley de Transparencia de los Archivos Epstein</strong>, promulgada en noviembre de 2025, obligo al DOJ a publicar 6 millones de paginas de evidencia. Las publicaciones por fases desencadenaron una cascada de arrestos internacionales: <strong className="text-zinc-100">Principe Andrew</strong>, <strong className="text-zinc-100">Peter Mandelson</strong> y <strong className="text-zinc-100">Thorbjorn Jagland</strong>. En marzo de 2026, el Congreso cito a la Fiscal General Bondi por presunto ocultamiento de archivos.
              </p>
              <p className="text-sm leading-relaxed text-zinc-400 italic border-l-2 border-blue-500/50 pl-4">
                Esta investigacion reune todas las pruebas verificadas de fuentes publicas: documentos judiciales, archivos del DOJ, informes del Congreso, analisis del grafo de conocimiento de la Oficina de Responsabilidad, y reportajes del <strong className="text-zinc-100">Miami Herald</strong>, <strong className="text-zinc-100">BBC</strong>, <strong className="text-zinc-100">Financial Times</strong> y otros medios internacionales.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Jeffrey Epstein built one of the most sophisticated sex trafficking networks in modern history, using wealth derived from <strong className="text-zinc-100">Leslie Wexner</strong> — who transferred approximately <strong className="text-zinc-100">$1 billion</strong> and granted him full power of attorney in 1991. The network operated for decades across multiple countries, shielded by connections to financial, political, and legal elites.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                The network&apos;s linchpin was <strong className="text-zinc-100">Ghislaine Maxwell</strong>, who maintained <strong className="text-zinc-100">22 independent connections</strong> in the network. Graph analysis shows that when Epstein is removed, Maxwell held 11 of the remaining 14 persons together as a connected network — she was the operational co-architect, not a mere accomplice.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Institutional protection was systematic: a <strong className="text-zinc-100">Non-Prosecution Agreement</strong> negotiated in 2008 by US Attorney Alexander Acosta created an 11-year immunity shield. When Epstein was finally arrested in July 2019, he was found dead in his MCC cell a month later — while guards slept, cameras malfunctioned, and he had been removed from suicide watch.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Financial enablers included <strong className="text-zinc-100">JPMorgan Chase</strong> ($290M settlement), <strong className="text-zinc-100">Deutsche Bank</strong> ($75M settlement), <strong className="text-zinc-100">Leon Black</strong> ($170M in payments), and <strong className="text-zinc-100">Jes Staley</strong> (1,100 emails, permanently banned from banking). Victims received approximately <strong className="text-zinc-100">$500 million</strong> in total settlements.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                The <strong className="text-zinc-100">Epstein Files Transparency Act</strong>, signed into law in November 2025, compelled the DOJ to release 6 million pages of evidence. The phased releases triggered a cascade of international arrests: <strong className="text-zinc-100">Prince Andrew</strong>, <strong className="text-zinc-100">Peter Mandelson</strong>, and <strong className="text-zinc-100">Thorbjorn Jagland</strong>. By March 2026, Congress subpoenaed Attorney General Bondi over alleged file concealment.
              </p>
              <p className="text-sm leading-relaxed text-zinc-400 italic border-l-2 border-blue-500/50 pl-4">
                This investigation compiles all verified evidence from public sources: court documents, DOJ files, congressional reports, the Office of Accountability knowledge graph analysis, and reporting from the <strong className="text-zinc-100">Miami Herald</strong>, <strong className="text-zinc-100">BBC</strong>, <strong className="text-zinc-100">Financial Times</strong>, and other international media.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3. FACTCHECK TABLE                                                 */}
      {/* ================================================================== */}
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
            const count = FACTCHECK_ITEMS.filter((f) => f.status === status).length
            if (count === 0) return null
            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setFactcheckFilter(factcheckFilter === status ? null : status)
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
                    style={{ backgroundColor: STATUS_COLORS[item.status] }}
                  >
                    {STATUS_LABELS[item.status][lang]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200">
                      {lang === 'es' ? item.claim_es : item.claim_en}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
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
                    </p>
                  </div>
                  {detail && (
                    <span className="mt-1 shrink-0 text-xs text-zinc-600">
                      {isExpanded ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </button>
                {isExpanded && detail && (
                  <div className="border-t border-zinc-800 px-4 py-3">
                    <p className="text-sm leading-relaxed text-zinc-400">{detail}</p>
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

      {/* ================================================================== */}
      {/* 4. TIMELINE                                                        */}
      {/* ================================================================== */}
      <section id="timeline" ref={registerRef('timeline')} className="py-12">
        <h2 className="text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Cronologia de la Investigacion' : 'Investigation Timeline'}
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
            const count = TIMELINE_EVENTS.filter((e) => e.category === cat).length
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

      {/* ================================================================== */}
      {/* 5. ACTOR NETWORK                                                   */}
      {/* ================================================================== */}
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">{actor.nationality}</span>
                  <h3 className="font-semibold text-zinc-100">{actor.name}</h3>
                </div>
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
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 6. MONEY FLOW                                                      */}
      {/* ================================================================== */}
      <section id="money" ref={registerRef('money')} className="py-12">
        <h2 className="text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Flujo de Dinero' : 'Money Flow'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {lang === 'es'
            ? 'Rastreo de fondos basado en documentos judiciales e informes del Congreso.'
            : 'Fund tracing based on court documents and congressional reports.'}
        </p>

        {/* Total tracked highlight */}
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-center">
          <p className="text-xs uppercase tracking-wider text-red-400">
            {lang === 'es' ? 'Total movido rastreado' : 'Total tracked movement'}
          </p>
          <p className="mt-1 text-3xl font-bold text-red-300">{formatUsd(totalExtracted)}</p>
        </div>

        {/* Flow list */}
        <div className="mt-6 space-y-3">
          {MONEY_FLOWS.map((flow) => (
            <div
              key={flow.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-1 items-center gap-2 text-sm">
                <span className="font-medium text-zinc-200">{flow.from_label}</span>
                <svg
                  className="h-4 w-4 shrink-0 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="font-medium text-zinc-200">{flow.to_label}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <span className="text-sm font-bold text-emerald-400">
                  {formatUsd(flow.amount_usd)}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(flow.date, lang)}</span>
              </div>
              <p className="text-xs text-zinc-600 sm:ml-2">{flow.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 7. EVIDENCE CHAIN                                                  */}
      {/* ================================================================== */}
      <section id="evidence" ref={registerRef('evidence')} className="py-12">
        <h2 className="text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Cadena de Evidencia' : 'Evidence Chain'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {lang === 'es'
            ? `${EVIDENCE_DOCS.length} documentos y fuentes de evidencia.`
            : `${EVIDENCE_DOCS.length} documents and evidence sources.`}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {EVIDENCE_DOCS.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-zinc-100">{doc.title}</h3>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{
                    backgroundColor: VERIFICATION_COLORS[doc.verification_status],
                  }}
                >
                  {VERIFICATION_LABELS[doc.verification_status][lang]}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <span>{lang === 'es' ? doc.type_es : doc.type_en}</span>
                <span>·</span>
                <span>{formatDate(doc.date, lang)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {lang === 'es' ? doc.summary_es : doc.summary_en}
              </p>
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-blue-400 hover:underline"
              >
                {lang === 'es' ? 'Ver fuente' : 'View source'} ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 8. GOVERNMENT RESPONSE                                             */}
      {/* ================================================================== */}
      <section id="government" ref={registerRef('government')} className="py-12">
        <h2 className="text-xl font-bold text-zinc-50">
          {lang === 'es'
            ? 'Respuesta del Gobierno e Instituciones'
            : 'Government & Institutional Response'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {lang === 'es'
            ? 'Cronologia de las acciones gubernamentales e institucionales en respuesta a la red Epstein.'
            : 'Timeline of government and institutional actions in response to the Epstein network.'}
        </p>

        {/* Government response timeline */}
        <div className="relative mt-6 space-y-4 pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-blue-900/50" />
          {GOVERNMENT_RESPONSES.map((gr) => (
            <div key={gr.id} className="relative">
              <div
                className="absolute -left-[17px] top-3 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
                style={{ backgroundColor: '#3b82f6' }}
              />
              <div className="rounded-lg border border-blue-900/40 bg-blue-950/10 p-4 hover:border-blue-800/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500">
                    {formatDate(gr.date, lang)}
                  </span>
                  <span className="rounded-full bg-blue-700 px-2 py-0.5 text-xs font-semibold text-white">
                    {lang === 'es' ? 'Accion oficial' : 'Official action'}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
                  {lang === 'es' ? gr.action_es : gr.action_en}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {lang === 'es' ? gr.effect_es : gr.effect_en}
                </p>
                {gr.source_url && (
                  <a
                    href={gr.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300"
                  >
                    {lang === 'es' ? 'Ver fuente' : 'View source'} ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER DISCLAIMER                                                  */}
      {/* ================================================================== */}
      <footer className="border-t border-zinc-800 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-zinc-400">
            {lang === 'es'
              ? 'Esta investigacion se basa en fuentes publicas verificadas. Los documentos judiciales provienen de CourtListener y el SDNY. Los archivos del gobierno provienen del DOJ y del Congreso. El reportaje periodistico fue contrastado con multiples medios.'
              : 'This investigation is based on verified public sources. Court documents are from CourtListener and SDNY. Government files come from the DOJ and Congress. Journalistic reporting was cross-referenced with multiple outlets.'}
          </p>
          <p className="mt-4 text-xs text-zinc-600">
            {lang === 'es' ? 'Ultima actualizacion' : 'Last updated'}:{' '}
            {formatDate('2026-03-19', lang)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-zinc-600">
            {[
              { name: 'CourtListener', url: 'https://www.courtlistener.com/' },
              { name: 'DOJ Epstein Files', url: 'https://www.justice.gov/epstein-files' },
              { name: 'Senate Finance Committee', url: 'https://finance.senate.gov/' },
              { name: 'Miami Herald', url: 'https://www.miamiherald.com/' },
              { name: 'BBC', url: 'https://www.bbc.co.uk/' },
              { name: 'UK FCA', url: 'https://www.fca.org.uk/' },
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
  )
}

// ---------------------------------------------------------------------------
// Timeline card sub-component
// ---------------------------------------------------------------------------

function TimelineCard({
  event,
  lang,
}: {
  readonly event: InvestigationTimelineEvent
  readonly lang: Lang
}) {
  const catColor = CATEGORY_COLORS[event.category] ?? '#6b7280'
  const catLabel = CATEGORY_LABELS[event.category]?.[lang] ?? event.category

  return (
    <div className="relative">
      {/* Dot */}
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
