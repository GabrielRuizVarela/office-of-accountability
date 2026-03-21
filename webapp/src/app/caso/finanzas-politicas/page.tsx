'use client'

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
} from '@/lib/caso-finanzas-politicas/investigation-data'

const t = {
  badge: {
    en: 'Open-source investigation — Office of Accountability',
    es: 'Investigacion de datos abiertos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Argentine Political Finance',
    es: 'Finanzas Politicas Argentinas',
  },
  subtitle: {
    en: 'Investigation into the connections between political power and money. Cross-referencing nine public data sources to identify politicians with undeclared offshore entities, contractors who illegally donated to campaigns, and money flows between public funds and opaque structures.',
    es: 'Investigacion sobre conexiones entre poder politico y dinero. Cruce de nueve fuentes de datos publicos para identificar politicos con entidades offshore no declaradas, contratistas que donaron ilegalmente a campanas, y flujos de dinero entre fondos publicos y estructuras opacas.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This investigation cross-referenced NINE public data sources — legislative voting records (Como Voto), offshore leaks (ICIJ Panama Papers and Pandora Papers), campaign contribution declarations (CNE), Boletin Oficial appointments and contracts, the IGJ corporate registry, company directors (CNV/IGJ), sworn asset declarations (DDJJ), insurance sector filings, and a cross-enrichment process — to identify the revolving door between government and the financial sector, the Nacion Seguros insurance monopoly, judicial auxiliary patterns at Comodoro Py, SIDE intelligence fund growth, and the oligarchic family networks controlling Argentina.',
    es: 'Esta investigacion cruzo NUEVE fuentes de datos publicos — registros de votacion legislativa (Como Voto), filtraciones offshore (ICIJ Panama Papers y Pandora Papers), declaraciones de aportes de campana (CNE), nombramientos y contratos del Boletin Oficial, el registro societario de la IGJ, directores de empresas (CNV/IGJ), declaraciones juradas patrimoniales (DDJJ), registros del sector de seguros, y un proceso de enriquecimiento cruzado — para identificar la puerta giratoria entre gobierno y el sector financiero, el monopolio de seguros de Nacion Seguros, los patrones de auxiliares judiciales en Comodoro Py, el crecimiento de los fondos de inteligencia de la SIDE, y las redes familiares oligarquicas que controlan Argentina.',
  },
  executiveSummaryP2: {
    en: 'The most serious findings: the $28.5B Nacion Seguros insurance monopoly with $3.5B in broker commissions (active prosecution), 22 critical persons identified across financial, judicial, and intelligence sectors, 12 oligarchic families controlling 500+ companies, a 2% corruption conviction rate, and the $LIBRA crypto scandal with $107M insider cashout.',
    es: 'Los hallazgos mas graves: el monopolio de seguros de Nacion Seguros de $28.5B con $3.5B en comisiones de brokers (procesamiento activo), 22 personas criticas identificadas en los sectores financiero, judicial y de inteligencia, 12 familias oligarquicas que controlan mas de 500 empresas, una tasa de condena por corrupcion del 2%, y el escandalo cripto $LIBRA con $107M en cashout de insiders.',
  },
  fiveDatasetsSimultaneously: {
    en: 'five datasets simultaneously',
    es: 'cinco datasets simultaneamente',
  },
  claimsVerified: { en: 'claims verified', es: 'afirmaciones verificadas' },
  documentedEvents: { en: 'documented events', es: 'eventos documentados' },
  keyActors: { en: 'key actors', es: 'actores clave' },
  verifiedInvestigation: {
    en: 'Verified Investigation',
    es: 'Investigacion verificada',
  },
  verifiedInvestigationDesc: {
    en: ' claims verified against public sources, organized by severity. Offshore, contractors, and money flows.',
    es: ' afirmaciones verificadas contra fuentes publicas, organizadas por severidad. Offshore, contratistas, y flujos de dinero.',
  },
  chronologyTitle: { en: 'Chronology', es: 'Cronologia' },
  chronologyDesc: {
    en: 'Timeline from SOCMA (1976) through $LIBRA crash (Feb 2025), BCRA gold shipment to London, Capital Humano food crisis, and Causa Cuadernos trial (Nov 2025).',
    es: 'Linea de tiempo desde SOCMA (1976) pasando por el colapso de $LIBRA (feb 2025), el envio de oro del BCRA a Londres, la crisis alimentaria de Capital Humano, y el juicio de la Causa Cuadernos (nov 2025).',
  },
  moneyTitle: { en: 'The Money', es: 'El Dinero' },
  moneyDesc: {
    en: '$674B ARS in procurement tracked. Nacion Seguros monopoly, $3.5B broker commissions, PAMI 16x drug overpricing, SIDE ~2,000% secret fund growth, $LIBRA $107M insider cashout.',
    es: '$674 mil millones ARS en contrataciones rastreadas. Monopolio de Nacion Seguros, $3.5B en comisiones de brokers, sobreprecio PAMI 16x, crecimiento de fondos reservados SIDE ~2.000%, cashout $LIBRA $107M.',
  },
  connectionsTitle: { en: 'Connections', es: 'Conexiones' },
  connectionsDesc: {
    en: 'Interactive graph: 263 investigation nodes, 2,221 relationships (incl. 1,839 legislation votes). Filter by Revolving Door, Offshore, Money Trail, Power Families.',
    es: 'Grafo interactivo: 263 nodos de investigacion, 2.221 relaciones (incl. 1.839 votos legislativos). Filtre por Puerta Giratoria, Offshore, Rastro del Dinero, Familias del Poder.',
  },
  keyActorsTitle: { en: 'Key Actors', es: 'Actores Clave' },
  keyActorsDesc: {
    en: ` individuals and organizations with presence across multiple datasets.`,
    es: ` personas y organizaciones con presencia en multiples datasets.`,
  },
} as const

const BASE_PATH = '/caso/finanzas-politicas'

export default function FinanzasPoliticasPage() {
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          href={`${BASE_PATH}/investigacion`}
          title={t.keyActorsTitle[lang]}
          description={`${ACTORS.length}${t.keyActorsDesc[lang]}`}
          color="#ef4444"
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
