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
    en: 'Data-driven investigation — Office of Accountability',
    es: 'Investigacion basada en datos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Argentine Political Finance',
    es: 'Finanzas Politicas Argentinas',
  },
  subtitle: {
    en: 'How six families acquired state assets through privatizations, fund every political campaign regardless of party, and control the media that shapes the narrative — mapped across 40 years of democracy using 14 public data sources and graph technology.',
    es: 'Como seis familias adquirieron activos del Estado mediante privatizaciones, financian todas las campanas politicas sin importar el partido, y controlan los medios que moldean la narrativa — mapeado a lo largo de 40 anos de democracia con 14 fuentes de datos publicos y tecnologia de grafos.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This investigation cross-referenced 14 public data sources — legislative votes, offshore leaks, campaign donations, corporate registries, asset declarations, procurement contracts, debtor records, sanctions databases, and media ownership filings — to build a graph of 294 nodes and 2,391 edges spanning 40 years of Argentine democracy. The structural finding: the same six families that acquired state assets under Menem\'s privatizations (1989-1999) still control those concessions, fund campaigns across all parties, own the major media groups, and maintain access to every government.',
    es: 'Esta investigacion cruzo 14 fuentes de datos publicos — votos legislativos, filtraciones offshore, donaciones de campana, registros corporativos, declaraciones juradas, contratos de compras, registros de deudores, bases de sanciones, y registros de propiedad de medios — para construir un grafo de 294 nodos y 2.391 aristas que abarca 40 anos de democracia argentina. El hallazgo estructural: las mismas seis familias que adquirieron activos del Estado bajo las privatizaciones de Menem (1989-1999) siguen controlando esas concesiones, financian campanas de todos los partidos, son duenas de los principales grupos mediaticos, y mantienen acceso a todos los gobiernos.',
  },
  executiveSummaryP2: {
    en: 'The money trail connects campaign donors to state contractors through shared corporate officers — 247 donors linked to $63 billion in government contracts. The graph reveals that $483 billion (equal to GDP) sits offshore, the judiciary convicts only 2% of corruption defendants, and media concentration means the same families who benefit from the system own the outlets that should investigate it.',
    es: 'La ruta del dinero conecta donantes de campana con contratistas del Estado a traves de directivos corporativos compartidos — 247 donantes vinculados a $63.000 millones en contratos estatales. El grafo revela que $483.000 millones (equivalente al PBI) estan en el exterior, la justicia condena solo al 2% de los acusados de corrupcion, y la concentracion mediatica significa que las mismas familias que se benefician del sistema son duenas de los medios que deberian investigarlo.',
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
    en: '40 years of documented events — from Menem privatizations (1989) through Cuadernos trial (2025), AMIA cover-up, $LIBRA scandal, and BCRA gold shipment to London.',
    es: '40 anos de eventos documentados — desde las privatizaciones de Menem (1989) pasando por el juicio Cuadernos (2025), el encubrimiento de AMIA, el escandalo $LIBRA, y el envio de oro del BCRA a Londres.',
  },
  moneyTitle: { en: 'Follow the Money', es: 'Siga el Dinero' },
  moneyDesc: {
    en: '7 money trails traced: campaign donors to contractors ($63B), offshore structures ($483B), procurement overpricing ($80B over 13 years), crypto capital flight ($91B/year).',
    es: '7 rutas del dinero trazadas: donantes a contratistas ($63.000M), estructuras offshore ($483.000M), sobreprecios en compras ($80.000M en 13 anos), fuga cripto ($91.000M/ano).',
  },
  connectionsTitle: { en: 'Connections', es: 'Conexiones' },
  connectionsDesc: {
    en: 'Interactive graph: 294 investigation nodes, 2,391 relationships (incl. 1,839 legislation votes). Filter by Revolving Door, Offshore, Money Trail, Power Families.',
    es: 'Grafo interactivo: 294 nodos de investigacion, 2.391 relaciones (incl. 1.839 votos legislativos). Filtre por Puerta Giratoria, Offshore, Rastro del Dinero, Familias del Poder.',
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

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
        <EntryPoint
          href={`${BASE_PATH}/metodologia`}
          title={lang === 'es' ? 'Metodologia' : 'Methodology'}
          description={lang === 'es'
            ? 'Como se construyo esta investigacion. 14 fuentes, verificacion, marcos de cumplimiento, limitaciones.'
            : 'How this investigation was built. 14 sources, verification, compliance frameworks, limitations.'}
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
