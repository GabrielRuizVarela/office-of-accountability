'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { Link } from '@/i18n/navigation'

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
    en: 'Network analysis of institutional relationships between government, corporate, judicial, financial, and media entities in Argentina. Graph database built from 14 public data sources covering 40 years of democratic governance. Reproducible methodology. Open data.',
    es: 'Analisis de redes de relaciones institucionales entre entidades gubernamentales, corporativas, judiciales, financieras y mediaticas en Argentina. Base de datos de grafo construida a partir de 14 fuentes de datos publicos que cubren 40 anos de gobernanza democratica. Metodologia reproducible. Datos abiertos.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This study cross-referenced 14 public data sources — legislative voting records, offshore entity registries, campaign contribution filings, corporate ownership databases, sworn asset declarations, government procurement records, central bank debtor data, international sanctions lists, and media ownership filings — to construct a network graph of 294 entities and 2,391 relationships across 40 years of Argentine democratic governance. The analysis identifies structural patterns of institutional overlap between government decision-making, corporate ownership, campaign financing, and judicial outcomes.',
    es: 'Este estudio cruzo 14 fuentes de datos publicos — registros de votacion legislativa, registros de entidades offshore, declaraciones de aportes de campaña, bases de datos de propiedad corporativa, declaraciones juradas patrimoniales, registros de contrataciones publicas, datos de deudores del banco central, listas de sanciones internacionales, y registros de propiedad de medios — para construir un grafo de redes de 294 entidades y 2.391 relaciones a lo largo de 40 anos de gobernanza democratica argentina. El analisis identifica patrones estructurales de superposicion institucional entre la toma de decisiones gubernamentales, la propiedad corporativa, el financiamiento de campañas y los resultados judiciales.',
  },
  executiveSummaryP2: {
    en: 'Key quantitative findings: entity resolution connected 247 campaign donors to officers of government contractor companies, linking $207 million in declared donations to $63 billion in state procurement. The INDEC international investment position shows $483 billion in Argentine-held external assets. Judicial statistics indicate a 2% conviction rate for corruption cases (Consejo de la Magistratura audit, 1996-2016). Media ownership analysis reveals significant cross-sector concentration between media, energy, insurance, and telecommunications.',
    es: 'Hallazgos cuantitativos clave: la resolucion de entidades conecto 247 donantes de campana con directivos de empresas contratistas del Estado, vinculando $207 millones en donaciones declaradas con $63.000 millones en contrataciones publicas. La posicion de inversion internacional del INDEC muestra $483.000 millones en activos externos de residentes argentinos. Las estadisticas judiciales indican una tasa de condena del 2% en causas de corrupcion (auditoria del Consejo de la Magistratura, 1996-2016). El analisis de propiedad mediatica revela una concentracion intersectorial significativa entre medios, energia, seguros y telecomunicaciones.',
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
  const locale = useLocale() as Locale

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
          {t.badge[locale]}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          {t.title[locale]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {t.subtitle[locale]}
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
              {locale === 'en' ? stat.label_en : stat.label_es}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">{stat.source}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-50">
          {t.executiveSummaryTitle[locale]}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.executiveSummaryP1[locale]}
        </p>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.executiveSummaryP2[locale]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>{FACTCHECK_ITEMS.length} {t.claimsVerified[locale]}</span>
          <span>&middot;</span>
          <span>{TIMELINE_EVENTS.length} {t.documentedEvents[locale]}</span>
          <span>&middot;</span>
          <span>{ACTORS.length} {t.keyActors[locale]}</span>
        </div>
      </section>

      {/* CTAs */}
      <section className="mb-6">
        <Link
          href={`${BASE_PATH}/investigacion`}
          className="block rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          <h3 className="text-lg font-bold text-blue-200">
            {t.verifiedInvestigation[locale]}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {FACTCHECK_ITEMS.length}{t.verifiedInvestigationDesc[locale]}
          </p>
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <EntryPoint
          href={`${BASE_PATH}/cronologia`}
          title={t.chronologyTitle[locale]}
          description={t.chronologyDesc[locale]}
          color="#f59e0b"
        />
        <EntryPoint
          href={`${BASE_PATH}/dinero`}
          title={t.moneyTitle[locale]}
          description={t.moneyDesc[locale]}
          color="#10b981"
        />
        <EntryPoint
          href={`${BASE_PATH}/conexiones`}
          title={t.connectionsTitle[locale]}
          description={t.connectionsDesc[locale]}
          color="#8b5cf6"
        />
        <EntryPoint
          href={`${BASE_PATH}/investigacion`}
          title={t.keyActorsTitle[locale]}
          description={`${ACTORS.length}${t.keyActorsDesc[locale]}`}
          color="#ef4444"
        />
        <EntryPoint
          href={`${BASE_PATH}/metodologia`}
          title={locale === 'es' ? 'Metodologia' : 'Methodology'}
          description={locale === 'es'
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
