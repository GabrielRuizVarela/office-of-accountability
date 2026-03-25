'use client'
import { useLocale } from 'next-intl'
import type { Locale } from '@/i18n/config'

import { Link } from '@/i18n/navigation'

import {
  IMPACT_STATS,
  FACTCHECK_ITEMS,
  TIMELINE_EVENTS,
  KEY_ACTORS,
} from '@/lib/caso-dictadura/investigation-data'

const t = {
  badge: {
    en: 'Data-driven investigation — Office of Accountability',
    es: 'Investigacion basada en datos — Oficina de Rendicion de Cuentas',
  },
  title: {
    en: 'Argentine Military Dictatorship (1976-1983)',
    es: 'Dictadura Militar Argentina (1976-1983)',
  },
  subtitle: {
    en: 'Knowledge graph of the state terror apparatus. 9,415 documented victims from the RUVTE registry, 774 clandestine detention centers with GPS coordinates, 987 pages of declassified SIDE intelligence, 281 Junta meeting minutes, and accountability analysis across 25 automated ingestion waves. 12 data sources. Reproducible methodology. Open data.',
    es: 'Grafo de conocimiento del aparato de terrorismo de Estado. 9.415 victimas documentadas del registro RUVTE, 774 centros clandestinos de detencion con coordenadas GPS, 987 paginas de inteligencia desclasificada de la SIDE, 281 actas de la Junta Militar y analisis de rendicion de cuentas a traves de 25 olas automatizadas de ingestion. 12 fuentes de datos. Metodologia reproducible. Datos abiertos.',
  },
  summaryTitle: {
    en: 'Executive Summary',
    es: 'Resumen Ejecutivo',
  },
  summaryP1: {
    en: 'This investigation cross-referenced 12 public data sources — the RUVTE government victim registry (9,415 records), the presentes CCD dataset (774 sites with coordinates), SNEEP judicial census, declassified US intelligence from CIA/FBI/State Department, Plan Condor victim databases, Abuelas de Plaza de Mayo records, Junta meeting minutes, Nunca Mas testimonies, PCCH sentencing dossiers, Wikidata, military archives, and 987 pages of freshly declassified SIDE documents (released March 24, 2026) — to construct a knowledge graph of 14,512 entities and 31,607 relationships mapping the complete repressive apparatus, its victims, and the accountability gaps that persist 50 years later.',
    es: 'Esta investigacion cruzo 12 fuentes de datos publicos — el registro gubernamental RUVTE de victimas (9.415 registros), el dataset de CCD presentes (774 sitios con coordenadas), el censo judicial SNEEP, inteligencia desclasificada de EE.UU. de la CIA/FBI/Departamento de Estado, bases de datos de victimas del Plan Condor, registros de Abuelas de Plaza de Mayo, actas de reuniones de la Junta, testimonios del Nunca Mas, dossier de sentencias del PCCH, Wikidata, archivos militares, y 987 paginas de documentos de la SIDE recien desclasificados (liberados el 24 de marzo de 2026) — para construir un grafo de conocimiento de 14.512 entidades y 31.607 relaciones mapeando el aparato represivo completo, sus victimas y las brechas de rendicion de cuentas que persisten 50 anos despues.',
  },
  summaryP2: {
    en: 'Key findings: median victim age was 26 years. 334 pregnant women were detained or disappeared. 589 foreign nationals from 32 countries. Only 18.5% of identified represors have any judicial link. Zero of 98 SIDE agents were ever convicted (except 1 who also commanded a military unit). Comisaria 26a de Capital Federal processed 1,884 documented victims with zero identified perpetrators. Only 1 of 7 corporations with documented complicity has ever been convicted (Ford, 2018). The pattern: biological impunity through judicial delay.',
    es: 'Hallazgos clave: la edad mediana de las victimas era 26 anos. 334 mujeres embarazadas fueron detenidas o desaparecidas. 589 nacionales extranjeros de 32 paises. Solo el 18,5% de los represores identificados tienen algun vinculo judicial. Cero de 98 agentes de la SIDE fueron jamas condenados (excepto 1 que tambien comandaba una unidad militar). La Comisaria 26a de Capital Federal proceso 1.884 victimas documentadas con cero perpetradores identificados. Solo 1 de 7 corporaciones con complicidad documentada fue condenada (Ford, 2018). El patron: impunidad biologica por demora judicial.',
  },
  claimsVerified: { en: 'claims verified', es: 'afirmaciones verificadas' },
  documentedEvents: { en: 'documented events', es: 'eventos documentados' },
  keyActors: { en: 'key actors', es: 'actores clave' },
  accountabilityTitle: { en: 'Accountability Audit', es: 'Auditoria de Rendicion de Cuentas' },
  accountabilityDesc: {
    en: '54 accountability flags: 27 uninvestigated CCDs, 16 SIDE officials, 8 unprosecuted represors, 6 command-responsibility gaps. 81.5% of represors have no judicial link.',
    es: '54 senales de rendicion de cuentas: 27 CCD sin investigar, 16 funcionarios de la SIDE, 8 represores sin procesar, 6 brechas de responsabilidad de mando. El 81,5% de los represores no tiene vinculo judicial.',
  },
  timelineTitle: { en: 'Timeline', es: 'Cronologia' },
  timelineDesc: {
    en: 'From Operativo Independencia (1975) through the coup (1976), impunity laws (1986-87), Menem pardons (1990), constitutional annulment (2005), megacausas (2006-present), and SIDE declassification (2026).',
    es: 'Desde el Operativo Independencia (1975) pasando por el golpe (1976), leyes de impunidad (1986-87), indultos de Menem (1990), anulacion constitucional (2005), megacausas (2006-presente) y desclasificacion SIDE (2026).',
  },
  networkTitle: { en: 'Connections', es: 'Conexiones' },
  networkDesc: {
    en: 'Interactive graph: 14,512 nodes, 31,607 relationships. Chain of command, detention network, corporate complicity chains, Plan Condor intelligence flows.',
    es: 'Grafo interactivo: 14.512 nodos, 31.607 relaciones. Cadena de mando, red de detencion, cadenas de complicidad empresarial, flujos de inteligencia del Plan Condor.',
  },
  victimsTitle: { en: 'The Victims', es: 'Las Victimas' },
  victimsDesc: {
    en: '9,415 documented victims. Demographics: median age 26, 334 pregnant, 193 minors, 589 foreigners from 32 countries. Peak: March 1976 (396 disappearances).',
    es: '9.415 victimas documentadas. Demografia: edad mediana 26, 334 embarazadas, 193 menores, 589 extranjeros de 32 paises. Pico: marzo 1976 (396 desapariciones).',
  },
  evidenceTitle: { en: 'Evidence', es: 'Evidencia' },
  evidenceDesc: {
    en: '535 SIDE documents, 30 declassified US cables, 40 Nunca Mas testimonies, 281 Junta meeting minutes, 12 court verdicts.',
    es: '535 documentos de la SIDE, 30 cables desclasificados de EE.UU., 40 testimonios del Nunca Mas, 281 actas de la Junta, 12 sentencias judiciales.',
  },
  methodologyTitle: { en: 'Methodology', es: 'Metodologia' },
  methodologyDesc: {
    en: '25 automated waves. 12 data sources. Entity resolution. LLM analysis (Qwen 3.5). 88.4% verified. Quality score: 77.9%.',
    es: '25 olas automatizadas. 12 fuentes de datos. Resolucion de entidades. Analisis LLM (Qwen 3.5). 88,4% verificado. Puntaje de calidad: 77,9%.',
  },
} as const

const BASE_PATH = '/caso/caso-dictadura'

export default function CasoDictaduraPage() {
  const locale = useLocale() as Locale

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-400">
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
        {IMPACT_STATS.slice(0, 8).map((stat) => (
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

      {/* Executive Summary */}
      <section className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-zinc-50">
          {t.summaryTitle[locale]}
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.summaryP1[locale]}
        </p>
        <p className="mb-3 text-sm leading-relaxed text-zinc-300">
          {t.summaryP2[locale]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>{FACTCHECK_ITEMS.length} {t.claimsVerified[locale]}</span>
          <span>&middot;</span>
          <span>{TIMELINE_EVENTS.length} {t.documentedEvents[locale]}</span>
          <span>&middot;</span>
          <span>{KEY_ACTORS.length} {t.keyActors[locale]}</span>
        </div>
      </section>

      {/* Primary CTA — Accountability */}
      <section className="mb-6">
        <Link
          href={`${BASE_PATH}/resumen#chapter-viii`}
          className="block rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
        >
          <h3 className="text-lg font-bold text-amber-200">
            {t.accountabilityTitle[locale]}
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            {t.accountabilityDesc[locale]}
          </p>
        </Link>
      </section>

      {/* Entry Points */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <EntryPoint
          href={`${BASE_PATH}/resumen`}
          title={locale === 'es' ? 'Resumen Completo' : 'Full Summary'}
          description={locale === 'es'
            ? '9 capitulos: El Aparato, Las Victimas, La Red de Detencion, La Justicia, La Dimension Internacional, La Complicidad Empresarial, La SIDE, La Brecha, Metodologia.'
            : '9 chapters: The Apparatus, The Victims, The Detention Network, The Justice, The International Dimension, Corporate Complicity, The SIDE, The Gap, Methodology.'}
          color="#f59e0b"
        />
        <EntryPoint
          href={`${BASE_PATH}/cronologia`}
          title={t.timelineTitle[locale]}
          description={t.timelineDesc[locale]}
          color="#ef4444"
        />
        <EntryPoint
          href={`${BASE_PATH}/grafo`}
          title={t.networkTitle[locale]}
          description={t.networkDesc[locale]}
          color="#8b5cf6"
        />
        <EntryPoint
          href={`${BASE_PATH}/resumen#chapter-ii`}
          title={t.victimsTitle[locale]}
          description={t.victimsDesc[locale]}
          color="#ec4899"
        />
        <EntryPoint
          href={`${BASE_PATH}/evidencia`}
          title={t.evidenceTitle[locale]}
          description={t.evidenceDesc[locale]}
          color="#10b981"
        />
        <EntryPoint
          href={`${BASE_PATH}/resumen#chapter-ix`}
          title={t.methodologyTitle[locale]}
          description={t.methodologyDesc[locale]}
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
      <h3 className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
        {title}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
    </Link>
  )
}
