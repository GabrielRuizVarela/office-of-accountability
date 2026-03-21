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
    en: 'Investigation into the connections between political power and money. Cross-referencing eight public data sources to identify politicians with undeclared offshore entities, contractors who illegally donated to campaigns, and money flows between public funds and opaque structures.',
    es: 'Investigacion sobre conexiones entre poder politico y dinero. Cruce de ocho fuentes de datos publicos para identificar politicos con entidades offshore no declaradas, contratistas que donaron ilegalmente a campanas, y flujos de dinero entre fondos publicos y estructuras opacas.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This investigation cross-referenced eight public data sources — legislative voting records (Como Voto), offshore leaks (ICIJ Panama Papers and Pandora Papers), campaign contribution declarations (CNE), Boletin Oficial appointments and contracts, the IGJ corporate registry, company directors (CNV/IGJ), sworn asset declarations (DDJJ), and a cross-enrichment process — to identify patterns of financial opacity in Argentine politics.',
    es: 'Esta investigacion cruzo ocho fuentes de datos publicos — registros de votacion legislativa (Como Voto), filtraciones offshore (ICIJ Panama Papers y Pandora Papers), declaraciones de aportes de campana (CNE), nombramientos y contratos del Boletin Oficial, el registro societario de la IGJ, directores de empresas (CNV/IGJ), declaraciones juradas patrimoniales (DDJJ), y un proceso de enriquecimiento cruzado — para identificar patrones de opacidad financiera en la politica argentina.',
  },
  executiveSummaryP2: {
    en: 'The most serious findings involve sitting legislators with undeclared active offshore entities, government contractors who illegally donated to electoral campaigns, and the Macri case appearing in ',
    es: 'Los hallazgos mas graves involucran a legisladores en ejercicio con entidades offshore activas no declaradas, contratistas del Estado que donaron ilegalmente a campanas electorales, y el caso Macri que aparece en ',
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
    en: 'Timeline from the founding of SOCMA (1976) to the criminal complaint by Mariano Macri (2024).',
    es: 'Linea de tiempo desde la fundacion de SOCMA (1976) hasta la denuncia penal de Mariano Macri (2024).',
  },
  moneyTitle: { en: 'The Money', es: 'El Dinero' },
  moneyDesc: {
    en: 'Tracking financial flows: Correo debt, SOCMA amnesty, transfers to Switzerland, campaign donations.',
    es: 'Rastreo de flujos financieros: deuda del Correo, blanqueo SOCMA, transferencias a Suiza, donaciones de campana.',
  },
  connectionsTitle: { en: 'Connections', es: 'Conexiones' },
  connectionsDesc: {
    en: 'Interactive graph of relationships between politicians, companies, offshore entities and contracts (coming soon).',
    es: 'Grafo interactivo de relaciones entre politicos, empresas, entidades offshore y contratos (proximo).',
  },
  keyActorsTitle: { en: 'Key Actors', es: 'Actores Clave' },
  keyActorsDesc: {
    en: ' individuals and organizations with presence across multiple datasets.',
    es: ' personas y organizaciones con presencia en multiples datasets.',
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
          <strong className="text-zinc-100">{t.fiveDatasetsSimultaneously[lang]}</strong>.
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
