'use client'

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
} from '@/lib/caso-monopolios/investigation-data'

const t = {
  badge: {
    en: 'Data-driven investigation — Office of Accountability',
    es: 'Investigacion basada en datos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Monopolized Markets in Argentina',
    es: 'Mercados Monopolizados en Argentina',
  },
  subtitle: {
    en: 'Investigation into market concentration across 18 sectors: telecom, energy, food, media, banking, mining, agro-export, construction, pharma, transport, aluminium, dairy, insurance, digital, infrastructure concessions. 44 research files cross-referenced against 2.45M-node graph. Factchecked.',
    es: 'Investigacion sobre concentracion de mercado en 18 sectores: telecomunicaciones, energia, alimentos, medios, banca, mineria, agroexportacion, construccion, farma, transporte, aluminio, lacteos, seguros, digital, concesiones de infraestructura. 44 archivos de investigacion cruzados contra grafo de 2,45M nodos. Verificado.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummary: {
    en: 'This investigation traced monopoly power across 18 Argentine market sectors through a multi-phase research cycle. Cross-referencing the Neo4j knowledge graph (2.45M nodes, 4.69M relationships) with web research, ICIJ offshore leaks, IGJ corporate registry, CompraR procurement, CNE campaign finance, and the obras-publicas investigation (37K nodes) produced 829+ unique findings. 75 claims were factchecked: 55% verified, 29% corrected, 1% debunked. The annual consumer cost of monopolization is estimated at USD 22.5B (3.3% of GDP), with the poorest quintile losing 15% of income to monopoly pricing.',
    es: 'Esta investigacion trazo el poder monopólico en 18 sectores del mercado argentino a traves de un ciclo de investigacion en multiples fases. El cruce del grafo de conocimiento Neo4j (2,45M nodos, 4,69M relaciones) con investigacion web, filtraciones offshore ICIJ, registro corporativo IGJ, CompraR, finanzas de campaña CNE y la investigacion de obras publicas (37K nodos) produjo 829+ hallazgos unicos. 75 afirmaciones fueron verificadas: 55% confirmadas, 29% corregidas, 1% desmentida. El costo anual al consumidor por monopolizacion se estima en USD 22.500M (3,3% del PIB), con el quintil mas pobre perdiendo 15% de sus ingresos por precios monopólicos.',
  },
  statsTitle: { en: 'Key Numbers', es: 'Numeros Clave' },
  factcheckTitle: { en: 'Verified Findings', es: 'Hallazgos Verificados' },
  factcheckDesc: {
    en: ' factchecked claims across offshore entities, market shares, political connections, and judicial cases.',
    es: ' afirmaciones verificadas sobre entidades offshore, cuotas de mercado, conexiones politicas y causas judiciales.',
  },
  timelineTitle: { en: 'Timeline', es: 'Cronologia' },
  timelineDesc: {
    en: 'From the 1989 privatizations that created the monopolies to the 2025 Telefe sale and Milei-era deregulation.',
    es: 'Desde las privatizaciones de 1989 que crearon los monopolios hasta la venta de Telefe en 2025 y la desregulacion de la era Milei.',
  },
  actorsTitle: { en: 'Key Actors', es: 'Actores Clave' },
  actorsDesc: {
    en: ' monopoly families and groups profiled with company counts, offshore entities, and sector control.',
    es: ' familias y grupos monopolicos perfilados con cantidad de empresas, entidades offshore y control sectorial.',
  },
  tier1: { en: 'Critical', es: 'Critico' },
  tier2: { en: 'High', es: 'Alto' },
  tier3: { en: 'Notable', es: 'Notable' },
  confirmed: { en: 'Confirmed', es: 'Confirmado' },
  alleged: { en: 'Alleged', es: 'Alegado' },
} as const

const TIER_COLORS: Record<number, string> = {
  1: 'bg-red-500/20 text-red-400 border-red-500/30',
  2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  3: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  alleged: 'bg-amber-500/20 text-amber-400',
  unconfirmed: 'bg-zinc-500/20 text-zinc-400',
  confirmed_cleared: 'bg-zinc-500/20 text-zinc-400',
}

export default function MonopoliosPage() {
  const { lang } = useLanguage()

  return (
    <div className="space-y-12">
      {/* Hero */}
      <header className="space-y-4">
        <p className="text-sm font-medium tracking-wider text-zinc-500 uppercase">
          {t.badge[lang]}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
          {t.title[lang]}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-zinc-400">
          {t.subtitle[lang]}
        </p>
      </header>

      {/* Impact Stats */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-200">{t.statsTitle[lang]}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <div
              key={stat.label_en}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {lang === 'es' ? stat.label_es : stat.label_en}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive Summary */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-200">
          {t.executiveSummaryTitle[lang]}
        </h2>
        <p className="text-sm leading-relaxed text-zinc-400">
          {t.executiveSummary[lang]}
        </p>
      </section>

      {/* Factcheck Items */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-zinc-200">
          {t.factcheckTitle[lang]}
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          {FACTCHECK_ITEMS.length}{t.factcheckDesc[lang]}
        </p>
        <div className="space-y-3">
          {FACTCHECK_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_COLORS[item.tier] ?? TIER_COLORS[3]}`}
                >
                  {item.tier === 1 ? t.tier1[lang] : item.tier === 2 ? t.tier2[lang] : t.tier3[lang]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? STATUS_COLORS.unconfirmed}`}
                >
                  {item.status === 'confirmed' ? t.confirmed[lang] : t.alleged[lang]}
                </span>
                <span className="text-[10px] text-zinc-600">{item.sector}</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">
                {lang === 'es' ? item.claim_es : item.claim_en}
              </p>
              {((lang === 'es' ? item.detail_es : item.detail_en)) && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {lang === 'es' ? item.detail_es : item.detail_en}
                </p>
              )}
              <p className="mt-2 text-[10px] text-zinc-600">
                {item.source} — <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-400">source</a>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-zinc-200">
          {t.timelineTitle[lang]}
        </h2>
        <p className="mb-4 text-sm text-zinc-500">{t.timelineDesc[lang]}</p>
        <div className="space-y-3">
          {TIMELINE_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <div className="min-w-[90px] text-xs font-mono text-zinc-500">
                {event.date}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {lang === 'es' ? event.title_es : event.title_en}
                </h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {lang === 'es' ? event.description_es : event.description_en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Actors */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-zinc-200">
          {t.actorsTitle[lang]}
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          {ACTORS.length}{t.actorsDesc[lang]}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {ACTORS.map((actor) => (
            <div
              key={actor.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-200">{actor.name}</h3>
              <p className="text-xs font-medium text-zinc-500">
                {lang === 'es' ? actor.role_es : actor.role_en}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                {lang === 'es' ? actor.description_es : actor.description_en}
              </p>
              <div className="mt-2 flex gap-3 text-[10px] text-zinc-600">
                <span>{actor.companies_count} empresas</span>
                {actor.offshore_count > 0 && (
                  <span className="text-red-400">{actor.offshore_count} offshore</span>
                )}
                <span>{actor.sectors.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
