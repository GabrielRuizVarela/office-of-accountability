'use client'

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'
import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  ACTORS,
} from '@/lib/caso-obras-publicas/investigation-data'

const t = {
  badge: {
    en: 'Data-driven investigation — Office of Accountability',
    es: 'Investigacion basada en datos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Argentine Public Works',
    es: 'Obras Publicas Argentinas',
  },
  subtitle: {
    en: 'Contract tracing investigation of Argentine public works procurement. Cross-referencing 14 data sources — CONTRAT.AR, COMPR.AR, MapaInversiones, World Bank, IDB, Odebrecht plea, Cuadernos case, and Siemens FCPA settlement. Entity resolution against the finanzas-politicas graph. Reproducible methodology. Open data.',
    es: 'Investigacion de trazabilidad de contratos en la obra publica argentina. Cruce de 14 fuentes de datos — CONTRAT.AR, COMPR.AR, MapaInversiones, Banco Mundial, BID, acuerdo Odebrecht, causa Cuadernos, y acuerdo FCPA de Siemens. Resolucion de entidades contra el grafo de finanzas-politicas. Metodologia reproducible. Datos abiertos.',
  },
  executiveSummaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  executiveSummaryP1: {
    en: 'This investigation cross-references 14 public data sources — national procurement records (CONTRAT.AR, COMPR.AR), infrastructure project databases (MapaInversiones, Vialidad Nacional, ENOHSA), provincial OCDS systems (CABA, Mendoza), multilateral contract awards (World Bank, IDB), debarment lists, budget execution data (Presupuesto Abierto), and investigative case files (Odebrecht plea agreement, Cuadernos court records, Siemens FCPA settlement) — to construct a network graph of public works procurement spanning national, provincial, and international jurisdictions.',
    es: 'Esta investigacion cruza 14 fuentes de datos publicos — registros de contratacion nacional (CONTRAT.AR, COMPR.AR), bases de proyectos de infraestructura (MapaInversiones, Vialidad Nacional, ENOHSA), sistemas OCDS provinciales (CABA, Mendoza), adjudicaciones multilaterales (Banco Mundial, BID), listas de inhabilitacion, datos de ejecucion presupuestaria (Presupuesto Abierto) y expedientes de investigacion (acuerdo de culpabilidad de Odebrecht, registros judiciales de Cuadernos, acuerdo FCPA de Siemens) — para construir un grafo de red de contrataciones de obra publica que abarca jurisdicciones nacionales, provinciales e internacionales.',
  },
  executiveSummaryP2: {
    en: 'Key quantitative findings: entity resolution connected contractors across procurement, bribery, and political finance datasets. Three international corruption cases (Odebrecht $35M, Siemens $100M+, Cuadernos) map directly to public works contracts in the graph. Cross-reference with the finanzas-politicas investigation identifies contractors who are also campaign donors, companies with offshore structures, and entities sanctioned by multilateral institutions that continue to win national contracts.',
    es: 'Hallazgos cuantitativos clave: la resolucion de entidades conecto contratistas a traves de datasets de contratacion, soborno y financiamiento politico. Tres casos internacionales de corrupcion (Odebrecht $35M, Siemens $100M+, Cuadernos) se mapean directamente a contratos de obra publica en el grafo. El cruce con la investigacion de finanzas-politicas identifica contratistas que tambien son donantes de campana, empresas con estructuras offshore, y entidades sancionadas por instituciones multilaterales que continuan ganando contratos nacionales.',
  },
  claimsVerified: { en: 'claims verified', es: 'afirmaciones verificadas' },
  documentedEvents: { en: 'documented events', es: 'eventos documentados' },
  keyActors: { en: 'key actors', es: 'actores clave' },
  verifiedInvestigation: {
    en: 'Verified Investigation',
    es: 'Investigacion Verificada',
  },
  verifiedInvestigationDesc: {
    en: ' claims verified against public sources. Odebrecht plea, Cuadernos notebooks, Siemens FCPA, and procurement data cross-referenced.',
    es: ' afirmaciones verificadas contra fuentes publicas. Acuerdo Odebrecht, cuadernos de Centeno, FCPA Siemens, y datos de contratacion cruzados.',
  },
  chronologyTitle: { en: 'Chronology', es: 'Cronologia' },
  chronologyDesc: {
    en: 'From Siemens DNI contract (1998) through Odebrecht plea (2016), Cuadernos trial (2025), and ongoing cross-reference discoveries.',
    es: 'Desde el contrato Siemens-DNI (1998) pasando por el acuerdo Odebrecht (2016), el juicio Cuadernos (2025), y descubrimientos de cruce de datos en curso.',
  },
  moneyTitle: { en: 'Follow the Money', es: 'Siga el Dinero' },
  moneyDesc: {
    en: 'Odebrecht bribes ($35M USD), Siemens bribes ($100M+ USD), Cuadernos cash deliveries, and contract-level procurement spending.',
    es: 'Sobornos Odebrecht ($35M USD), sobornos Siemens ($100M+ USD), entregas de efectivo Cuadernos, y gasto de contratacion a nivel de contratos.',
  },
  connectionsTitle: { en: 'Connections', es: 'Conexiones' },
  connectionsDesc: {
    en: 'Interactive graph: contractors, politicians, intermediaries, and bribery cases. Filter by Contractor-Donor, Offshore, Debarred, Odebrecht, Cuadernos.',
    es: 'Grafo interactivo: contratistas, politicos, intermediarios, y casos de soborno. Filtre por Contratista-Donante, Offshore, Inhabilitado, Odebrecht, Cuadernos.',
  },
  mapTitle: { en: 'Map', es: 'Mapa' },
  mapDesc: {
    en: 'Geographic visualization of public works with contractor overlays, color-coded by investigation flags. Lat/lon data from MapaInversiones.',
    es: 'Visualizacion geografica de obras publicas con capas de contratistas, codificadas por color segun alertas de investigacion. Datos lat/lon de MapaInversiones.',
  },
  actorsTitle: { en: 'Key Actors', es: 'Actores Clave' },
  actorsDesc: {
    en: ' contractors, politicians, and intermediaries with cross-investigation presence.',
    es: ' contratistas, politicos e intermediarios con presencia en investigaciones cruzadas.',
  },
} as const

const BASE_PATH = '/caso/obras-publicas'

export default function ObrasPublicasPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-400">
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
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
          className="block rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
        >
          <h3 className="text-lg font-bold text-amber-200">
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
          href={`${BASE_PATH}/mapa`}
          title={t.mapTitle[lang]}
          description={t.mapDesc[lang]}
          color="#3b82f6"
        />
        <EntryPoint
          href={`${BASE_PATH}/investigacion`}
          title={t.actorsTitle[lang]}
          description={`${ACTORS.length}${t.actorsDesc[lang]}`}
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
      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
