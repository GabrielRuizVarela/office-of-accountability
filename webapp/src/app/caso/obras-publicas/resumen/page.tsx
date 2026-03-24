'use client'

/**
 * Obras Publicas — Narrative summary page.
 *
 * Multi-chapter bilingual investigative piece covering procurement corruption
 * in Argentine public works. Odebrecht, Cuadernos, Siemens, and the
 * cross-reference with finanzas-politicas.
 */

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'

const SLUG = 'obras-publicas'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Investigation summary', es: 'Resumen de la investigacion' },
  headerTitle: {
    en: 'Argentine Public Works: Contract Tracing',
    es: 'Obras Publicas Argentinas: Trazabilidad de Contratos',
  },
  headerDesc: {
    en: 'An evidence-based investigation compiled from 14 public procurement data sources, 3 international bribery cases, and cross-reference with the finanzas-politicas graph. Reproducible methodology with open data.',
    es: 'Una investigacion basada en evidencia compilada a partir de 14 fuentes de datos de contrataciones publicas, 3 casos internacionales de soborno, y cruce con el grafo de finanzas-politicas. Metodologia reproducible con datos abiertos.',
  },
  viewData: { en: 'View data & evidence', es: 'Ver datos y evidencia' },
  timeline: { en: 'Timeline', es: 'Cronologia' },
  sources: { en: 'Sources', es: 'Fuentes' },
  disclaimer: {
    en: 'This investigation is based on verified public sources, including government procurement portals, DOJ plea agreements, SEC enforcement actions, Argentine federal court records, multilateral institution databases, and investigative journalism. It does not constitute legal advice. Inclusion of a person or company does not imply guilt. Where "alleged" or "under investigation" is indicated, the claim has not been independently confirmed.',
    es: 'Esta investigacion se basa en fuentes publicas verificadas, incluyendo portales de contrataciones gubernamentales, acuerdos de culpabilidad del DOJ, acciones de aplicacion de la SEC, registros judiciales federales argentinos, bases de datos de instituciones multilaterales, y periodismo investigativo. No constituye asesoramiento legal. La inclusion de una persona o empresa no implica culpabilidad. Donde se indica "alegado" o "en investigacion," la afirmacion no ha sido confirmada de forma independiente.',
  },
  navOverview: { en: '\u2190 Overview', es: '\u2190 Inicio' },
  navData: { en: 'Data & evidence \u2192', es: 'Datos y evidencia \u2192' },
} as const

// ---------------------------------------------------------------------------
// Chapters
// ---------------------------------------------------------------------------

const CHAPTERS: {
  num: string
  title: Record<'en' | 'es', string>
  paragraphs: Record<'en' | 'es', string[]>
}[] = [
  {
    num: 'I',
    title: {
      en: 'The Machine',
      es: 'La Maquina',
    },
    paragraphs: {
      en: [
        'Argentine public works procurement operates through a centralized digital system — CONTRAT.AR — that records procedures, bids, contracts, and work progress. In theory, this system ensures transparency. In practice, the data reveals structural patterns: the same contractors win repeatedly, single-bidder procedures are common, and budget overruns are systematic.',
        'The investigation maps 7,481 public works across national, provincial, and multilateral jurisdictions. Entity resolution through CUIT (tax identification) numbers connects contractors to the broader political finance ecosystem analyzed in the finanzas-politicas investigation.',
      ],
      es: [
        'Las contrataciones de obra publica argentina operan a traves de un sistema digital centralizado — CONTRAT.AR — que registra procedimientos, ofertas, contratos y avance de obras. En teoria, este sistema asegura transparencia. En la practica, los datos revelan patrones estructurales: los mismos contratistas ganan repetidamente, los procedimientos con oferente unico son comunes, y los sobrecostos son sistematicos.',
        'La investigacion mapea 7.481 obras publicas a traves de jurisdicciones nacionales, provinciales y multilaterales. La resolucion de entidades a traves de numeros CUIT conecta contratistas con el ecosistema mas amplio de financiamiento politico analizado en la investigacion de finanzas-politicas.',
      ],
    },
  },
  {
    num: 'II',
    title: {
      en: 'Odebrecht: The $35 Million Trail',
      es: 'Odebrecht: El Rastro de $35 Millones',
    },
    paragraphs: {
      en: [
        'In December 2016, Brazilian construction giant Odebrecht pleaded guilty before the US Department of Justice, revealing a global bribery scheme spanning 12 countries. In Argentina alone, $35 million in bribes were paid between 2007 and 2014, linked to public works contracts including gas pipelines, the Sarmiento railway burial project, and the Atucha II nuclear plant.',
        'Odebrecht operated in Argentina through partnerships with local firms — Electroingenieria, CPC, and others — creating a network of joint ventures that channeled both legitimate construction work and illicit payments. The DOJ plea agreement provides the documentary foundation for tracing these connections through the procurement graph.',
      ],
      es: [
        'En diciembre de 2016, el gigante brasileno de la construccion Odebrecht se declaro culpable ante el Departamento de Justicia de EE.UU., revelando un esquema global de soborno que abarcaba 12 paises. Solo en Argentina, se pagaron $35 millones en sobornos entre 2007 y 2014, vinculados a contratos de obra publica que incluian gasoductos, el soterramiento del ferrocarril Sarmiento y la central nuclear Atucha II.',
        'Odebrecht opero en Argentina a traves de asociaciones con empresas locales — Electroingenieria, CPC, y otras — creando una red de uniones transitorias que canalizaban tanto obra de construccion legitima como pagos ilicitos. El acuerdo de culpabilidad del DOJ provee la base documental para rastrear estas conexiones a traves del grafo de contrataciones.',
      ],
    },
  },
  {
    num: 'III',
    title: {
      en: 'The Notebooks: Cash Deliveries 2005-2015',
      es: 'Los Cuadernos: Entregas de Efectivo 2005-2015',
    },
    paragraphs: {
      en: [
        'In August 2018, journalist Diego Cabot published in La Nacion the photocopies of handwritten notebooks kept by Oscar Centeno, a driver for the Planning Ministry. The notebooks documented cash deliveries to public officials over a decade, triggering the largest corruption case in Argentine history.',
        'The companies named in the notebooks — Electroingenieria, Austral Construcciones, Esuco, CPC, and others — overlap significantly with the major public works contractors in the CONTRAT.AR database. This cross-reference is the investigative core: tracing the same entities across procurement records, court filings, and bribery documentation.',
      ],
      es: [
        'En agosto de 2018, el periodista Diego Cabot publico en La Nacion las fotocopias de cuadernos manuscritos del chofer Oscar Centeno, del Ministerio de Planificacion. Los cuadernos documentaban entregas de dinero en efectivo a funcionarios publicos durante una decada, desencadenando la mayor causa de corrupcion en la historia argentina.',
        'Las empresas nombradas en los cuadernos — Electroingenieria, Austral Construcciones, Esuco, CPC, y otras — se superponen significativamente con los principales contratistas de obra publica en la base de datos de CONTRAT.AR. Este cruce es el nucleo investigativo: rastrear las mismas entidades a traves de registros de contratacion, expedientes judiciales, y documentacion de sobornos.',
      ],
    },
  },
  {
    num: 'IV',
    title: {
      en: 'Siemens and the DNI: $100 Million in Bribes',
      es: 'Siemens y el DNI: $100 Millones en Sobornos',
    },
    paragraphs: {
      en: [
        'The Siemens FCPA case documented one of the largest single-contract bribery schemes in corporate history. Over $100 million in bribes were paid through intermediaries and shell companies to secure the Argentine national identity document (DNI) manufacturing contract, valued at approximately $1 billion.',
        'The SEC settlement revealed a sophisticated layering structure: payments routed through offshore entities, intermediaries with no apparent connection to the technology sector, and a web of consultancy agreements that served as bribery channels. The pattern mirrors the shell company structures identified in the finanzas-politicas investigation.',
      ],
      es: [
        'El caso FCPA de Siemens documento uno de los mayores esquemas de soborno por contrato unico en la historia corporativa. Mas de $100 millones en sobornos se pagaron a traves de intermediarios y empresas pantalla para asegurar el contrato de fabricacion del Documento Nacional de Identidad (DNI) argentino, valuado en aproximadamente $1.000 millones.',
        'El acuerdo con la SEC revelo una estructura sofisticada de capas: pagos canalizados a traves de entidades offshore, intermediarios sin conexion aparente con el sector tecnologico, y una red de acuerdos de consultoria que servian como canales de soborno. El patron refleja las estructuras de empresas fantasma identificadas en la investigacion de finanzas-politicas.',
      ],
    },
  },
  {
    num: 'V',
    title: {
      en: 'The Cross-Reference: Where Investigations Meet',
      es: 'El Cruce: Donde se Encuentran las Investigaciones',
    },
    paragraphs: {
      en: [
        'The CUIT identifier is the primary bridge between the obras-publicas and finanzas-politicas investigations. Entity resolution connects contractors who win public works contracts with campaign donors, offshore entity holders, and politically appointed officials in the broader political finance graph.',
        'The cross-reference engine operates in three tiers: CUIT matching (confidence 0.95-1.0), DNI/CUIL matching (0.9-0.95), and fuzzy name matching (0.6-0.8). Investigation flags detect patterns: contractor-donors, debarred entities still winning contracts, Odebrecht-linked firms, Cuadernos-linked firms, and entities appearing in both investigations simultaneously.',
      ],
      es: [
        'El identificador CUIT es el puente principal entre las investigaciones de obras-publicas y finanzas-politicas. La resolucion de entidades conecta contratistas que ganan contratos de obra publica con donantes de campana, titulares de entidades offshore, y funcionarios designados politicamente en el grafo mas amplio de finanzas politicas.',
        'El motor de cruce opera en tres niveles: coincidencia por CUIT (confianza 0.95-1.0), coincidencia DNI/CUIL (0.9-0.95), y coincidencia difusa por nombre (0.6-0.8). Las alertas de investigacion detectan patrones: contratistas-donantes, entidades inhabilitadas que siguen ganando contratos, firmas vinculadas a Odebrecht, firmas vinculadas a Cuadernos, y entidades que aparecen en ambas investigaciones simultaneamente.',
      ],
    },
  },
  {
    num: 'VI',
    title: {
      en: 'What Remains',
      es: 'Lo Que Queda',
    },
    paragraphs: {
      en: [
        '37,351 entities traced. 43,615 cross-references. 12,431 investigation flags detected. 7,481 public works analyzed. 28,419 contractors registered. 3 international bribery cases mapped. But the data pipeline is still running — waves of ingestion continue to add provincial data, multilateral contracts, and debarment records.',
        'The most significant structural finding is the overlap: companies that appear in Odebrecht AND Cuadernos AND as active contractors AND as campaign donors form a small but densely connected cluster at the intersection of public procurement and political finance. These bridge entities — connecting procurement to politics to international bribery — are the primary targets for continued investigation.',
      ],
      es: [
        '37.351 entidades rastreadas. 43.615 referencias cruzadas. 12.431 alertas de investigacion detectadas. 7.481 obras publicas analizadas. 28.419 contratistas registrados. 3 casos internacionales de soborno mapeados. Pero el pipeline de datos sigue corriendo — olas de ingestion continuan agregando datos provinciales, contratos multilaterales, y registros de inhabilitacion.',
        'El hallazgo estructural mas significativo es la superposicion: empresas que aparecen en Odebrecht Y Cuadernos Y como contratistas activos Y como donantes de campana forman un cluster pequeno pero densamente conectado en la interseccion de las contrataciones publicas y el financiamiento politico. Estas entidades puente — conectando contrataciones con politica y soborno internacional — son los objetivos principales para la continuacion de la investigacion.',
      ],
    },
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ResumenPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header className="mb-12 border-b border-zinc-800 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-amber-400">
          {t.headerBadge[lang]}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {t.headerTitle[lang]}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
          {t.headerDesc[lang]}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/caso/${SLUG}/investigacion`}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
          >
            {t.viewData[lang]}
          </Link>
          <Link
            href={`/caso/${SLUG}/cronologia`}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            {t.timeline[lang]}
          </Link>
        </div>
      </header>

      {/* Chapters */}
      <div className="space-y-12">
        {CHAPTERS.map((chapter) => (
          <section key={chapter.num}>
            <h2 className="mb-4 border-l-4 border-amber-500 pl-4 text-lg font-bold text-zinc-50">
              {chapter.num}. {chapter.title[lang]}
            </h2>
            {chapter.paragraphs[lang].map((p, i) => (
              <p
                key={i}
                className="mb-4 text-sm leading-relaxed text-zinc-300 last:mb-0"
              >
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      {/* Sources */}
      <section className="mt-16 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">{t.sources[lang]}</h3>
        <p className="text-xs leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Compilado a partir de: CONTRAT.AR (infra.datos.gob.ar), COMPR.AR SIPRO, MapaInversiones, Presupuesto Abierto, Vialidad Nacional, ENOHSA, CABA BAC_OCDS, Mendoza OCDS, Banco Mundial (Major Contract Awards + listas de inhabilitacion), BID (sanciones + proyectos), acuerdo de culpabilidad Odebrecht/DOJ, acuerdo FCPA Siemens/SEC, Centro de Informacion Judicial (causa Cuadernos), La Nacion. Base de datos de grafo: Neo4j. Analisis: Claude + Qwen 3.5 9B (GPU local).'
            : 'Compiled from: CONTRAT.AR (infra.datos.gob.ar), COMPR.AR SIPRO, MapaInversiones, Presupuesto Abierto, Vialidad Nacional, ENOHSA, CABA BAC_OCDS, Mendoza OCDS, World Bank (Major Contract Awards + debarment lists), IDB (sanctions + projects), Odebrecht/DOJ plea agreement, Siemens/SEC FCPA settlement, Centro de Informacion Judicial (Cuadernos case), La Nacion. Graph database: Neo4j. Analysis: Claude + Qwen 3.5 9B (local GPU).'}
        </p>
      </section>

      {/* Disclaimer */}
      <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-xs leading-relaxed text-zinc-500">
          {t.disclaimer[lang]}
        </p>
      </section>

      {/* Navigation */}
      <nav className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-8 sm:flex-row">
        <Link
          href={`/caso/${SLUG}`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navOverview[lang]}
        </Link>
        <Link
          href={`/caso/${SLUG}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navData[lang]}
        </Link>
      </nav>
    </article>
  )
}
