'use client'

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
} from '@/lib/caso-adorni/investigation-data'

const t = {
  badge: {
    en: 'Data-driven investigation — Office of Accountability',
    es: 'Investigacion basada en datos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Manuel Adorni Investigation',
    es: 'Investigacion Manuel Adorni',
  },
  subtitle: {
    en: 'Comprehensive investigation of Argentina\'s Presidential Spokesperson: public statements vs. verified facts, asset declarations, corporate connections, government advertising distribution, and cross-references with existing political finance, public works, and monopoly investigations.',
    es: 'Investigacion integral del Vocero Presidencial de Argentina: declaraciones publicas vs. hechos verificados, declaraciones juradas, conexiones corporativas, distribucion de pauta oficial, y cruces con las investigaciones existentes de finanzas politicas, obras publicas y monopolios.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This investigation applies the same cross-referencing methodology used in the Argentine Political Finance case to Manuel Adorni, Presidential Spokesperson under Javier Milei. Thirteen investigation waves — each verified by local AI analysis (MiroFish/Qwen) — systematically build a network graph from public records, YouTube transcripts, court filings, corporate registries, and asset declarations.',
    es: 'Esta investigacion aplica la misma metodologia de cruce de datos utilizada en el caso de Finanzas Politicas Argentinas a Manuel Adorni, Vocero Presidencial bajo Javier Milei. Trece olas de investigacion — cada una verificada por analisis de IA local (MiroFish/Qwen) — construyen sistematicamente un grafo de redes a partir de registros publicos, transcripciones de YouTube, expedientes judiciales, registros corporativos y declaraciones juradas.',
  },
  executiveSummaryP2: {
    en: 'The investigation cross-references findings with existing cases (finanzas-politicas, obras-publicas, monopolios, libra) using CUIT/DNI entity resolution to detect shared entities, revolving door patterns, and contractor-donor overlaps across the full accountability database.',
    es: 'La investigacion cruza hallazgos con casos existentes (finanzas-politicas, obras-publicas, monopolios, libra) usando resolucion de entidades por CUIT/DNI para detectar entidades compartidas, patrones de puerta giratoria y superposiciones contratista-donante en toda la base de datos de rendicion de cuentas.',
  },
  claimsVerified: { en: 'claims verified', es: 'afirmaciones verificadas' },
  documentedEvents: { en: 'documented events', es: 'eventos documentados' },
  keyActors: { en: 'key actors', es: 'actores clave' },
  verifiedInvestigation: {
    en: 'Verified Investigation',
    es: 'Investigacion Verificada',
  },
  verifiedInvestigationDesc: {
    en: ' claims verified against public sources. Statements, contracts, asset declarations, and corporate connections.',
    es: ' afirmaciones verificadas contra fuentes publicas. Declaraciones, contratos, patrimonio y conexiones corporativas.',
  },
  chronologyTitle: { en: 'Chronology', es: 'Cronologia' },
  chronologyDesc: {
    en: 'Timeline from Adorni\'s appointment as spokesperson through corruption allegations, press conferences, and judicial proceedings.',
    es: 'Linea de tiempo desde el nombramiento de Adorni como vocero, pasando por las denuncias de corrupcion, conferencias de prensa y procedimientos judiciales.',
  },
  moneyTitle: { en: 'Follow the Money', es: 'Siga el Dinero' },
  moneyDesc: {
    en: 'Money trails: government advertising (pauta oficial), contracts to network entities, asset declaration changes, campaign donations.',
    es: 'Rutas del dinero: pauta oficial, contratos a entidades de la red, cambios en declaraciones juradas, donaciones de campana.',
  },
  connectionsTitle: { en: 'Connections', es: 'Conexiones' },
  connectionsDesc: {
    en: 'Interactive graph: Adorni network entities, government ties, corporate structures, cross-investigation matches.',
    es: 'Grafo interactivo: entidades de la red Adorni, vinculos gubernamentales, estructuras corporativas, cruces con otras investigaciones.',
  },
  statementsTitle: { en: 'Statements', es: 'Declaraciones' },
  statementsDesc: {
    en: 'Public statements vs. verified facts. Press conference claims cross-checked against INDEC, BCRA, and public records.',
    es: 'Declaraciones publicas vs. hechos verificados. Afirmaciones de conferencias de prensa cruzadas contra INDEC, BCRA y registros publicos.',
  },
} as const

const BASE_PATH = '/caso/adorni'

export default function AdorniPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
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
      {IMPACT_STATS.length > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.value}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center"
            >
              <p className="text-2xl font-bold text-zinc-50 sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {lang === 'en' ? stat.label_en : stat.label_es}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">{stat.source}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-50">
          {t.executiveSummaryTitle[lang]}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.executiveSummaryP1[lang]}
        </p>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.executiveSummaryP2[lang]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>{FACTCHECK_ITEMS.length} {t.claimsVerified[lang]}</span>
          <span>&middot;</span>
          <span>{TIMELINE_EVENTS.length} {t.documentedEvents[lang]}</span>
          <span>&middot;</span>
          <span>{ACTORS.length} {t.keyActors[lang]}</span>
        </div>
      </section>

      {/* CTAs */}
      <section className="mb-6">
        <Link
          href={`${BASE_PATH}/investigacion`}
          className="block rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          <h3 className="text-lg font-bold text-blue-200">
            {t.verifiedInvestigation[lang]}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {FACTCHECK_ITEMS.length}{t.verifiedInvestigationDesc[lang]}
          </p>
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <EntryPoint
          href={`${BASE_PATH}/declaraciones`}
          title={t.statementsTitle[lang]}
          description={t.statementsDesc[lang]}
          color="#f43f5e"
        />
        <EntryPoint
          href={`${BASE_PATH}/cronologia`}
          title={t.chronologyTitle[lang]}
          description={t.chronologyDesc[lang]}
          color="#f59e0b"
        />
        <EntryPoint
          href={`${BASE_PATH}/dinero`}
          title={t.moneyTitle[lang]}
          description={t.moneyDesc[lang]}
          color="#10b981"
        />
        <EntryPoint
          href={`${BASE_PATH}/conexiones`}
          title={t.connectionsTitle[lang]}
          description={t.connectionsDesc[lang]}
          color="#8b5cf6"
        />
        <EntryPoint
          href={`${BASE_PATH}/metodologia`}
          title={lang === 'es' ? 'Metodologia' : 'Methodology'}
          description={lang === 'es'
            ? 'Como se construyo esta investigacion. 13 olas, verificacion con IA local, cruces con otras investigaciones.'
            : 'How this investigation was built. 13 waves, local AI verification, cross-investigation matching.'}
          color="#06b6d4"
        />
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
      <div
        className="mb-2 h-1 w-8 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-blue-400">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
