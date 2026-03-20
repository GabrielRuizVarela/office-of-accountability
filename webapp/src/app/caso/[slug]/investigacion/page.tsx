'use client'

/**
 * Caso investigation — Comprehensive bilingual investigation page.
 *
 * Slug-aware: dispatches to the correct data source (caso-libra or
 * caso-epstein) based on the URL slug parameter.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

import {
  FACTCHECK_ITEMS as LIBRA_FACTCHECK_ITEMS,
  TIMELINE_EVENTS as LIBRA_TIMELINE_EVENTS,
  ACTORS as LIBRA_ACTORS,
  MONEY_FLOWS as LIBRA_MONEY_FLOWS,
  EVIDENCE_DOCS as LIBRA_EVIDENCE_DOCS,
  IMPACT_STATS as LIBRA_IMPACT_STATS,
  GOVERNMENT_RESPONSES as LIBRA_GOVERNMENT_RESPONSES,
  type FactcheckStatus,
  type InvestigationCategory,
  type InvestigationTimelineEvent,
  type VerificationStatus,
} from '@/lib/caso-libra/investigation-data'

import {
  FACTCHECK_ITEMS as EPSTEIN_FACTCHECK_ITEMS,
  TIMELINE_EVENTS as EPSTEIN_TIMELINE_EVENTS,
  ACTORS as EPSTEIN_ACTORS,
  MONEY_FLOWS as EPSTEIN_MONEY_FLOWS,
  EVIDENCE_DOCS as EPSTEIN_EVIDENCE_DOCS,
  IMPACT_STATS as EPSTEIN_IMPACT_STATS,
  GOVERNMENT_RESPONSES as EPSTEIN_GOVERNMENT_RESPONSES,
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
  { id: 'aportar', label_es: 'Aportar', label_en: 'Submit' },
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
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(0)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount}`
}

function formatDate(dateStr: string, lang: Lang): string {
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
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  // -- slug-aware data dispatch -----------------------------------------------
  const isEpstein = slug === 'caso-epstein'
  const FACTCHECK_ITEMS = isEpstein ? EPSTEIN_FACTCHECK_ITEMS : LIBRA_FACTCHECK_ITEMS
  const TIMELINE_EVENTS = isEpstein
    ? EPSTEIN_TIMELINE_EVENTS.map((e) => ({
        ...e,
        // Normalise Epstein string[] sources to Libra's {name, url}[] shape
        sources: (e.sources as unknown as string[]).map((s) => ({ name: s, url: '' })),
        is_new: false as const,
      }))
    : LIBRA_TIMELINE_EVENTS
  const ACTORS = isEpstein
    ? EPSTEIN_ACTORS.map((a) => ({ ...a, is_new: false as const }))
    : LIBRA_ACTORS
  const MONEY_FLOWS = isEpstein ? EPSTEIN_MONEY_FLOWS : LIBRA_MONEY_FLOWS
  const EVIDENCE_DOCS = isEpstein ? EPSTEIN_EVIDENCE_DOCS : LIBRA_EVIDENCE_DOCS
  const IMPACT_STATS = isEpstein ? EPSTEIN_IMPACT_STATS : LIBRA_IMPACT_STATS
  const GOVERNMENT_RESPONSES = isEpstein ? EPSTEIN_GOVERNMENT_RESPONSES : LIBRA_GOVERNMENT_RESPONSES

  const [lang, setLang] = useState<Lang>('es')
  const [activeSection, setActiveSection] = useState('hero')
  const [factcheckFilter, setFactcheckFilter] = useState<FactcheckStatus | null>(null)
  const [expandedFactchecks, setExpandedFactchecks] = useState<Set<string>>(new Set())
  const [timelineFilter, setTimelineFilter] = useState<InvestigationCategory | null>(null)

  // If slug is unknown, show a fallback
  if (slug !== 'caso-libra' && slug !== 'caso-epstein') {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">Investigacion no encontrada</h1>
        <p className="mt-4 text-zinc-400">No existe una investigacion con este identificador.</p>
      </div>
    )
  }

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
                    ? 'bg-purple-600/20 text-purple-400'
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
            className="ml-3 shrink-0 rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:border-purple-500 hover:text-purple-400"
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
          {lang === 'es' ? 'La Investigacion Completa' : 'The Complete Investigation'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {lang === 'es'
            ? 'Una investigacion verificada y con fuentes sobre el escandalo del token $LIBRA promovido por el presidente Milei. Cada dato esta respaldado por evidencia on-chain, documentos publicos o reportajes periodisticos.'
            : 'A verified, sourced investigation into the $LIBRA token scandal promoted by President Milei. Every claim is backed by on-chain evidence, public documents, or journalistic reporting.'}
        </p>

        {/* Impact stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                El 14 de febrero de 2025, a las 19:01, el Presidente de Argentina Javier Milei publico en X, Instagram y Facebook la direccion de contrato de un token llamado <strong className="text-zinc-100">$LIBRA</strong>, creado minutos antes en la blockchain de Solana. Con <strong className="text-zinc-100">19 millones de seguidores</strong>, el precio del token se disparo de <strong className="text-zinc-100">$0.000001</strong> a <strong className="text-zinc-100">$5.20</strong> en 40 minutos, alcanzando una capitalizacion de <strong className="text-zinc-100">$4.500 millones</strong>.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                En las siguientes 3 horas, <strong className="text-zinc-100">8 billeteras</strong> vinculadas a los organizadores extrajeron <strong className="text-zinc-100">$107 millones</strong> en liquidez. El precio colapso un <strong className="text-zinc-100">94%</strong>. Aproximadamente <strong className="text-zinc-100">114.410 billeteras</strong> sufrieron perdidas por un total de <strong className="text-zinc-100">$251 millones</strong>. Solo <strong className="text-zinc-100">36 individuos</strong> obtuvieron ganancias superiores a $1 millon.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                La investigacion revelo que no fue un accidente. Un documento encontrado en el telefono de <strong className="text-zinc-100">Mauricio Novelli</strong>, fechado el 11 de febrero — tres dias antes del lanzamiento — detallaba un acuerdo de <strong className="text-zinc-100">$5 millones</strong> para Milei a cambio de la promocion. Analisis forense del telefono de Novelli registro mas de <strong className="text-zinc-100">30 contactos telefonicos</strong> entre Milei, su hermana <strong className="text-zinc-100">Karina Milei</strong>, su asesor <strong className="text-zinc-100">Santiago Caputo</strong> y Novelli en la noche del lanzamiento. De las <strong className="text-zinc-100">16 reuniones</strong> documentadas entre el presidente y los promotores, solo <strong className="text-zinc-100">4</strong> fueron declaradas oficialmente.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Los organizadores, liderados por <strong className="text-zinc-100">Hayden Davis</strong> de <strong className="text-zinc-100">Kelsier Ventures</strong> (la misma empresa vinculada al token $MELANIA), operaron un esquema clasico de pump-and-dump con respaldo presidencial. Bubblemaps confirmo que el <strong className="text-zinc-100">82% del suministro</strong> estaba desbloqueado desde el lanzamiento, concentrado en un unico cluster de billeteras.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Un año despues, la respuesta del gobierno ha sido sistematica: disolucion de la unidad investigadora (mayo 2025), exoneracion por la Oficina Anticorrupcion (junio 2025), y un proceso judicial que al 14 de febrero de 2026 no habia citado a un solo testigo ni sospechoso. Legisladores opositores han denunciado al fiscal por obstruccion. La comision investigadora del Congreso concluyo que Milei presto &lsquo;colaboracion esencial&rsquo; al esquema y que su conducta es &lsquo;compatible con un presunto fraude&rsquo;.
              </p>
              <p className="text-sm leading-relaxed text-zinc-400 italic border-l-2 border-purple-500/50 pl-4">
                Esta investigacion reune todas las pruebas verificadas de fuentes publicas: analisis blockchain de <strong className="text-zinc-100">Nansen</strong>, <strong className="text-zinc-100">Bubblemaps</strong> y <strong className="text-zinc-100">Lookonchain</strong>; documentos judiciales; informes parlamentarios; y reportajes de <strong className="text-zinc-100">Buenos Aires Herald</strong>, <strong className="text-zinc-100">Bloomberg</strong>, <strong className="text-zinc-100">Financial Times</strong> y otros medios internacionales. Cada dato esta verificado y enlazado a su fuente.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                On February 14, 2025, at 7:01 PM, Argentine President Javier Milei posted on X, Instagram, and Facebook the contract address of a token called <strong className="text-zinc-100">$LIBRA</strong>, created minutes earlier on the Solana blockchain. With <strong className="text-zinc-100">19 million followers</strong>, the token price surged from <strong className="text-zinc-100">$0.000001</strong> to <strong className="text-zinc-100">$5.20</strong> in 40 minutes, reaching a market cap of <strong className="text-zinc-100">$4.5 billion</strong>.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                Within 3 hours, <strong className="text-zinc-100">8 wallets</strong> linked to the organizers extracted <strong className="text-zinc-100">$107 million</strong> in liquidity. The price crashed <strong className="text-zinc-100">94%</strong>. Approximately <strong className="text-zinc-100">114,410 wallets</strong> suffered losses totaling <strong className="text-zinc-100">$251 million</strong>. Only <strong className="text-zinc-100">36 individuals</strong> made profits exceeding $1 million.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                The investigation revealed this was no accident. A document found on <strong className="text-zinc-100">Mauricio Novelli&apos;s</strong> phone, dated February 11 — three days before the launch — detailed a <strong className="text-zinc-100">$5 million agreement</strong> for Milei in exchange for the promotion. Forensic analysis of Novelli&apos;s phone recorded over <strong className="text-zinc-100">30 phone contacts</strong> between Milei, his sister <strong className="text-zinc-100">Karina Milei</strong>, adviser <strong className="text-zinc-100">Santiago Caputo</strong>, and Novelli on the night of the launch. Of the <strong className="text-zinc-100">16 documented meetings</strong> between the president and promoters, only <strong className="text-zinc-100">4</strong> were officially declared.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                The organizers, led by <strong className="text-zinc-100">Hayden Davis</strong> of <strong className="text-zinc-100">Kelsier Ventures</strong> (the same company linked to the $MELANIA token), operated a classic pump-and-dump scheme with presidential backing. Bubblemaps confirmed that <strong className="text-zinc-100">82% of the supply</strong> was unlocked from launch, concentrated in a single wallet cluster.
              </p>
              <p className="text-sm leading-relaxed text-zinc-300 mb-3">
                One year later, the government&apos;s response has been systematic: dissolution of the investigation task unit (May 2025), exoneration by the Anti-Corruption Office (June 2025), and a judicial process that by February 14, 2026 had not summoned a single witness or suspect. Opposition lawmakers have filed a complaint against the prosecutor for obstruction. The congressional investigative commission concluded that Milei provided &lsquo;essential collaboration&rsquo; to the scheme and that his conduct is &lsquo;compatible with an alleged fraud.&rsquo;
              </p>
              <p className="text-sm leading-relaxed text-zinc-400 italic border-l-2 border-purple-500/50 pl-4">
                This investigation compiles all verified evidence from public sources: blockchain analysis from <strong className="text-zinc-100">Nansen</strong>, <strong className="text-zinc-100">Bubblemaps</strong>, and <strong className="text-zinc-100">Lookonchain</strong>; court documents; parliamentary reports; and reporting from <strong className="text-zinc-100">Buenos Aires Herald</strong>, <strong className="text-zinc-100">Bloomberg</strong>, <strong className="text-zinc-100">Financial Times</strong> and other international media. Every data point is verified and linked to its source.
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
                ? 'bg-purple-600 text-white'
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
                        className="text-purple-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.source}
                      </a>
                    </p>
                  </div>
                  {detail && (
                    <span className="mt-1 shrink-0 text-xs text-zinc-600">
                      {isExpanded ? '▲' : '▼'}
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
                ? 'bg-purple-600 text-white'
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
                  <span className="text-lg">{actor.nationality}</span>
                  <h3 className="font-semibold text-zinc-100">{actor.name}</h3>
                </div>
                {actor.is_new && (
                  <span className="shrink-0 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                    NEW
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-purple-400">
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
            ? 'Rastreo de fondos basado en analisis on-chain.'
            : 'Fund tracing based on on-chain analysis.'}
        </p>

        {/* Total extracted highlight */}
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
                className="mt-3 inline-block text-xs text-purple-400 hover:underline"
              >
                {lang === 'es' ? 'Ver fuente' : 'View source'} ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 8. GOVERNMENT RESPONSE / COVERUP TIMELINE                          */}
      {/* ================================================================== */}
      <section id="government" ref={registerRef('government')} className="py-12">
        <h2 className="text-xl font-bold text-zinc-50">
          {lang === 'es'
            ? 'Respuesta del Gobierno y Obstruccion'
            : 'Government Response and Obstruction'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {lang === 'es'
            ? 'Cronologia de las acciones gubernamentales para minimizar, desviar o bloquear la investigacion.'
            : 'Timeline of government actions to minimize, deflect, or block the investigation.'}
        </p>

        {/* Red-tinted coverup timeline */}
        <div className="relative mt-6 space-y-4 pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-red-900/50" />
          {GOVERNMENT_RESPONSES.map((gr) => (
            <div key={gr.id} className="relative">
              <div
                className="absolute -left-[17px] top-3 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
                style={{ backgroundColor: '#dc2626' }}
              />
              <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-4 hover:border-red-800/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-zinc-500">
                    {formatDate(gr.date, lang)}
                  </span>
                  <span className="rounded-full bg-red-700 px-2 py-0.5 text-xs font-semibold text-white">
                    {lang === 'es' ? 'Encubrimiento' : 'Coverup'}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-zinc-100">
                  {lang === 'es' ? gr.action_es : gr.action_en}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {lang === 'es' ? gr.effect_es : gr.effect_en}
                </p>
                <a
                  href={gr.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-red-400 hover:text-red-300"
                >
                  {('source' in gr ? gr.source : lang === 'es' ? 'Fuente' : 'Source')} ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* 9. SUBMIT EVIDENCE FORM                                            */}
      {/* ================================================================== */}
      <section id="aportar" ref={(el) => { if (el) registerRef('aportar')(el) }} className="scroll-mt-28 pt-10">
        <h2 className="text-lg font-bold text-zinc-50">
          {lang === 'es' ? 'Aportar pruebas' : 'Submit evidence'}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {lang === 'es'
            ? 'Tenes informacion verificable sobre el caso $LIBRA? Envia datos, documentos o conexiones. Todo se revisa antes de publicarse.'
            : 'Do you have verifiable information about the $LIBRA case? Submit data, documents, or connections. Everything is reviewed before publishing.'}
        </p>
        <SubmitEvidenceForm lang={lang} />
      </section>

      {/* ================================================================== */}
      {/* 10. FOOTER DISCLAIMER                                              */}
      {/* ================================================================== */}
      <footer className="border-t border-zinc-800 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-zinc-400">
            {lang === 'es'
              ? 'Esta investigacion se basa en fuentes publicas verificadas. Los datos on-chain provienen de Nansen, Bubblemaps y Chainalysis. Los documentos judiciales son del Centro de Informacion Judicial (CIJ). El reportaje periodistico fue contrastado con multiples medios.'
              : 'This investigation is based on verified public sources. On-chain data comes from Nansen, Bubblemaps, and Chainalysis. Court documents are from the Centro de Informacion Judicial (CIJ). Journalistic reporting was cross-referenced with multiple outlets.'}
          </p>
          <p className="mt-4 text-xs text-zinc-600">
            {lang === 'es' ? 'Ultima actualizacion' : 'Last updated'}:{' '}
            {formatDate('2026-03-18', lang)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-zinc-600">
            {[
              { name: 'Nansen', url: 'https://www.nansen.ai/' },
              { name: 'Bubblemaps', url: 'https://bubblemaps.io/' },
              { name: 'Chainalysis', url: 'https://www.chainalysis.com/' },
              { name: 'CIJ', url: 'https://www.cij.gov.ar/' },
              { name: 'Infobae', url: 'https://www.infobae.com/' },
              { name: 'Coffeezilla', url: 'https://www.youtube.com/coffeezilla' },
            ].map((src) => (
              <a
                key={src.name}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-purple-400 hover:underline"
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
  tint,
}: {
  readonly event: InvestigationTimelineEvent
  readonly lang: Lang
  readonly tint?: 'red'
}) {
  const catColor = CATEGORY_COLORS[event.category] ?? '#6b7280'
  const catLabel = CATEGORY_LABELS[event.category]?.[lang] ?? event.category
  const dotColor = tint === 'red' ? '#dc2626' : catColor
  const borderClass = tint === 'red'
    ? 'border-red-900/40 hover:border-red-800/60'
    : 'border-zinc-800 hover:border-zinc-700'
  const bgClass = tint === 'red' ? 'bg-red-950/20' : 'bg-zinc-900/50'

  return (
    <div className="relative">
      {/* Dot */}
      <div
        className="absolute -left-[17px] top-3 h-3.5 w-3.5 rounded-full border-2 border-zinc-950"
        style={{ backgroundColor: dotColor }}
      />
      <div className={`rounded-lg border ${borderClass} ${bgClass} p-4`}>
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
          {event.is_new && (
            <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              NEW
            </span>
          )}
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
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:underline"
              >
                {src.name} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Submit Evidence form sub-component
// ---------------------------------------------------------------------------

const ENTITY_TYPES = [
  { value: 'factcheck', label_es: 'Hecho verificado', label_en: 'Verified fact' },
  { value: 'event', label_es: 'Evento en la cronologia', label_en: 'Timeline event' },
  { value: 'actor', label_es: 'Persona u organizacion', label_en: 'Person or organization' },
  { value: 'money_flow', label_es: 'Flujo de dinero', label_en: 'Money flow' },
  { value: 'evidence', label_es: 'Documento fuente', label_en: 'Source document' },
  { value: 'government_response', label_es: 'Accion del gobierno', label_en: 'Government action' },
] as const

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

function SubmitEvidenceForm({ lang }: { readonly lang: 'es' | 'en' }) {
  const [entityType, setEntityType] = useState('factcheck')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const fields = useMemo(() => {
    const common = [
      { key: 'source_url', label_es: 'URL de la fuente', label_en: 'Source URL', type: 'url', required: true },
    ]
    switch (entityType) {
      case 'factcheck':
        return [
          { key: 'claim_es', label_es: 'Afirmacion (espanol)', label_en: 'Claim (Spanish)', type: 'textarea', required: true },
          { key: 'claim_en', label_es: 'Afirmacion (ingles)', label_en: 'Claim (English)', type: 'textarea', required: true },
          { key: 'status', label_es: 'Estado', label_en: 'Status', type: 'select', required: true,
            options: [
              { value: 'confirmed', label: lang === 'es' ? 'Confirmado' : 'Confirmed' },
              { value: 'alleged', label: lang === 'es' ? 'Presunto' : 'Alleged' },
              { value: 'denied', label: lang === 'es' ? 'Negado' : 'Denied' },
              { value: 'under_investigation', label: lang === 'es' ? 'En investigacion' : 'Under investigation' },
            ] },
          { key: 'source', label_es: 'Nombre de la fuente', label_en: 'Source name', type: 'text', required: true },
          ...common,
        ]
      case 'event':
        return [
          { key: 'date', label_es: 'Fecha (YYYY-MM-DD)', label_en: 'Date (YYYY-MM-DD)', type: 'date', required: true },
          { key: 'title_es', label_es: 'Titulo (espanol)', label_en: 'Title (Spanish)', type: 'text', required: true },
          { key: 'title_en', label_es: 'Titulo (ingles)', label_en: 'Title (English)', type: 'text', required: true },
          { key: 'description_es', label_es: 'Descripcion (espanol)', label_en: 'Description (Spanish)', type: 'textarea', required: true },
          { key: 'description_en', label_es: 'Descripcion (ingles)', label_en: 'Description (English)', type: 'textarea', required: true },
          { key: 'category', label_es: 'Categoria', label_en: 'Category', type: 'select', required: true,
            options: [
              { value: 'political', label: lang === 'es' ? 'Politico' : 'Political' },
              { value: 'financial', label: lang === 'es' ? 'Financiero' : 'Financial' },
              { value: 'legal', label: 'Legal' },
              { value: 'media', label: lang === 'es' ? 'Medios' : 'Media' },
              { value: 'coverup', label: lang === 'es' ? 'Encubrimiento' : 'Coverup' },
            ] },
          { key: 'source_name', label_es: 'Nombre de la fuente', label_en: 'Source name', type: 'text', required: true },
          ...common,
        ]
      case 'actor':
        return [
          { key: 'name', label_es: 'Nombre completo', label_en: 'Full name', type: 'text', required: true },
          { key: 'role_es', label_es: 'Rol (espanol)', label_en: 'Role (Spanish)', type: 'text', required: true },
          { key: 'role_en', label_es: 'Rol (ingles)', label_en: 'Role (English)', type: 'text', required: true },
          { key: 'description_es', label_es: 'Descripcion (espanol)', label_en: 'Description (Spanish)', type: 'textarea', required: true },
          { key: 'description_en', label_es: 'Descripcion (ingles)', label_en: 'Description (English)', type: 'textarea', required: true },
          { key: 'nationality', label_es: 'Nacionalidad', label_en: 'Nationality', type: 'text', required: true },
          ...common,
        ]
      case 'money_flow':
        return [
          { key: 'from_label', label_es: 'Origen', label_en: 'From', type: 'text', required: true },
          { key: 'to_label', label_es: 'Destino', label_en: 'To', type: 'text', required: true },
          { key: 'amount_usd', label_es: 'Monto (USD)', label_en: 'Amount (USD)', type: 'number', required: true },
          { key: 'date', label_es: 'Fecha (YYYY-MM-DD)', label_en: 'Date (YYYY-MM-DD)', type: 'date', required: true },
          { key: 'source', label_es: 'Fuente', label_en: 'Source', type: 'text', required: true },
        ]
      case 'evidence':
        return [
          { key: 'title', label_es: 'Titulo del documento', label_en: 'Document title', type: 'text', required: true },
          { key: 'type_es', label_es: 'Tipo (espanol)', label_en: 'Type (Spanish)', type: 'text', required: true },
          { key: 'type_en', label_es: 'Tipo (ingles)', label_en: 'Type (English)', type: 'text', required: true },
          { key: 'date', label_es: 'Fecha (YYYY-MM-DD)', label_en: 'Date (YYYY-MM-DD)', type: 'date', required: true },
          { key: 'summary_es', label_es: 'Resumen (espanol)', label_en: 'Summary (Spanish)', type: 'textarea', required: true },
          { key: 'summary_en', label_es: 'Resumen (ingles)', label_en: 'Summary (English)', type: 'textarea', required: true },
          ...common,
          { key: 'verification_status', label_es: 'Estado de verificacion', label_en: 'Verification status', type: 'select', required: true,
            options: [
              { value: 'verified', label: lang === 'es' ? 'Verificado' : 'Verified' },
              { value: 'partially_verified', label: lang === 'es' ? 'Parcialmente verificado' : 'Partially verified' },
              { value: 'unverified', label: lang === 'es' ? 'Sin verificar' : 'Unverified' },
            ] },
        ]
      case 'government_response':
        return [
          { key: 'date', label_es: 'Fecha (YYYY-MM-DD)', label_en: 'Date (YYYY-MM-DD)', type: 'date', required: true },
          { key: 'action_es', label_es: 'Accion (espanol)', label_en: 'Action (Spanish)', type: 'textarea', required: true },
          { key: 'action_en', label_es: 'Accion (ingles)', label_en: 'Action (English)', type: 'textarea', required: true },
          { key: 'effect_es', label_es: 'Efecto (espanol)', label_en: 'Effect (Spanish)', type: 'textarea', required: true },
          { key: 'effect_en', label_es: 'Efecto (ingles)', label_en: 'Effect (English)', type: 'textarea', required: true },
          { key: 'source', label_es: 'Fuente', label_en: 'Source', type: 'text', required: true },
          ...common,
        ]
      default:
        return common
    }
  }, [entityType, lang])

  function handleChange(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    // Build the data payload from form fields
    const data: Record<string, unknown> = {}
    for (const field of fields) {
      const val = formData[field.key]
      if (field.required && (!val || val.trim() === '')) {
        setStatus('error')
        setErrorMsg(lang === 'es' ? `Campo requerido: ${field.label_es}` : `Required field: ${field.label_en}`)
        return
      }
      if (val) {
        data[field.key] = field.type === 'number' ? Number(val) : val
      }
    }

    // For events, wrap the source into the sources array format
    if (entityType === 'event') {
      data.sources = [{ name: data.source_name as string || 'Source', url: data.source_url as string || '' }]
      delete data.source_name
      delete data.source_url
    }

    try {
      const response = await fetch('/api/caso-libra/investigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: entityType, data }),
      })

      if (!response.ok) {
        const err = await response.json()
        setStatus('error')
        setErrorMsg(err.details?.[0]?.message || err.error || 'Submission failed')
        return
      }

      setStatus('success')
      setFormData({})
    } catch {
      setStatus('error')
      setErrorMsg(lang === 'es' ? 'Error de conexion' : 'Connection error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-6 text-center">
        <p className="text-sm font-medium text-green-400">
          {lang === 'es'
            ? 'Gracias. Tu aporte fue enviado y sera revisado antes de publicarse.'
            : 'Thank you. Your submission was sent and will be reviewed before publishing.'}
        </p>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setFormData({}) }}
          className="mt-3 text-xs text-green-400 underline hover:text-green-300"
        >
          {lang === 'es' ? 'Enviar otro' : 'Submit another'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
      {/* Entity type selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">
          {lang === 'es' ? 'Tipo de aporte' : 'Submission type'}
        </label>
        <div className="flex flex-wrap gap-2">
          {ENTITY_TYPES.map((et) => (
            <button
              key={et.value}
              type="button"
              onClick={() => { setEntityType(et.value); setFormData({}) }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                entityType === et.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {lang === 'es' ? et.label_es : et.label_en}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic fields */}
      {fields.map((field) => (
        <div key={field.key}>
          <label htmlFor={`inv-${field.key}`} className="mb-1 block text-xs font-medium text-zinc-400">
            {lang === 'es' ? field.label_es : field.label_en}
            {field.required && <span className="ml-1 text-red-400">*</span>}
          </label>
          {'options' in field && field.options ? (
            <select
              id={`inv-${field.key}`}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="">{lang === 'es' ? 'Seleccionar...' : 'Select...'}</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={`inv-${field.key}`}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
            />
          ) : (
            <input
              id={`inv-${field.key}`}
              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
            />
          )}
        </div>
      ))}

      {/* Error */}
      {status === 'error' && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
      >
        {status === 'submitting'
          ? (lang === 'es' ? 'Enviando...' : 'Submitting...')
          : (lang === 'es' ? 'Enviar aporte' : 'Submit evidence')}
      </button>

      <p className="text-xs text-zinc-600">
        {lang === 'es'
          ? 'Todos los aportes son revisados por el equipo antes de publicarse. Se requiere una fuente verificable.'
          : 'All submissions are reviewed by the team before publishing. A verifiable source is required.'}
      </p>
    </form>
  )
}
