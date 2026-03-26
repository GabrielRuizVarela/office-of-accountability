'use client'

import { useLanguage, type Lang } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Section {
  id: string
  title: { en: string; es: string }
  content: { en: string; es: string }
}

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  pageTitle: { en: 'Methodology', es: 'Metodologia' },
  pageSubtitle: {
    en: 'How this investigation was built, verified, and maintained.',
    es: 'Como se construyo, verifico y mantiene esta investigacion.',
  },
} as const

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

const sections: Section[] = [
  {
    id: 'how-built',
    title: {
      en: 'How This Investigation Was Built',
      es: 'Como Se Construyo Esta Investigacion',
    },
    content: {
      en: `This investigation was built using an AI-assisted 13-wave methodology. Each wave targets a specific data layer - from open-source intelligence seeds to cross-referenced entity networks. All AI-generated analysis is verified locally, ensuring no investigation data leaves the local machine. The system combines automated data ingestion with human editorial review at every verification gate.`,
      es: `Esta investigacion fue construida usando una metodologia de 13 olas asistida por IA. Cada ola apunta a una capa de datos especifica - desde semillas de inteligencia de fuentes abiertas hasta redes de entidades cruzadas. Todo el analisis generado por IA es verificado localmente, asegurando que ningun dato de investigacion salga de la maquina local. El sistema combina ingesta automatizada de datos con revision editorial humana en cada punto de verificacion.`,
    },
  },
  {
    id: 'pipeline',
    title: {
      en: 'Data Pipeline (13 Waves)',
      es: 'Pipeline de Datos (13 Olas)',
    },
    content: {
      en: `Wave 1: OSINT Seed - initial open-source intelligence gathering from public records.
Wave 2: Government Records - appointment decrees, official gazette entries, legislative records.
Wave 3: Corporate Registry - company filings, officer appointments, shareholder structures.
Wave 4: Media Mapping - press conference transcripts, media outlet ownership, pauta oficial records.
Wave 5: Financial Disclosures - sworn asset declarations, income statements.
Wave 6: Judicial Records - court filings, judicial appointments, ongoing proceedings.
Wave 7: Procurement Data - government contracts, direct awards, purchase orders.
Wave 8: Property Records - real estate registrations, property transfers.
Wave 9: International Links - offshore entities, foreign company ties, cross-border connections.
Wave 10: Social Network - organizational affiliations, board memberships, political ties.
Wave 11: Cross-Reference - entity resolution across all prior waves using CUIT/DNI matching.
Wave 12: Anomaly Detection - pattern analysis, timeline inconsistencies, wealth evolution flags.
Wave 13: Synthesis - narrative construction, confidence scoring, editorial review.`,
      es: `Ola 1: Semilla OSINT - recopilacion inicial de inteligencia de fuentes abiertas a partir de registros publicos.
Ola 2: Registros Gubernamentales - decretos de nombramiento, entradas del boletin oficial, registros legislativos.
Ola 3: Registro Corporativo - presentaciones societarias, nombramientos de directivos, estructuras accionarias.
Ola 4: Mapeo Mediatico - transcripciones de conferencias de prensa, propiedad de medios, registros de pauta oficial.
Ola 5: Declaraciones Patrimoniales - declaraciones juradas de bienes, estados de ingresos.
Ola 6: Registros Judiciales - presentaciones judiciales, nombramientos judiciales, procesos en curso.
Ola 7: Datos de Contrataciones - contratos gubernamentales, adjudicaciones directas, ordenes de compra.
Ola 8: Registros de Propiedad - registraciones inmobiliarias, transferencias de propiedad.
Ola 9: Vinculos Internacionales - entidades offshore, vinculos societarios extranjeros, conexiones transfronterizas.
Ola 10: Red Social - afiliaciones organizacionales, membresías en directorios, vinculos politicos.
Ola 11: Cruce de Datos - resolucion de entidades a traves de todas las olas previas usando CUIT/DNI.
Ola 12: Deteccion de Anomalias - analisis de patrones, inconsistencias temporales, alertas de evolucion patrimonial.
Ola 13: Sintesis - construccion narrativa, puntaje de confianza, revision editorial.`,
    },
  },
  {
    id: 'cross-reference',
    title: {
      en: 'Entity Cross-Reference Engine',
      es: 'Motor de Cruce de Entidades',
    },
    content: {
      en: `The cross-reference engine resolves entities across data sources using CUIT (tax ID), DNI (national ID), and fuzzy name matching (Levenshtein distance, capped at 10K targets). The same engine is used across all investigation cases, ensuring consistency. Matches are scored and tiered: exact CUIT/DNI matches produce gold-tier links, verified name matches produce silver, and unverified fuzzy matches produce bronze links pending manual review. The engine uses in-memory Map joins rather than Cypher cartesian joins to avoid timeout on large datasets.`,
      es: `El motor de cruce resuelve entidades entre fuentes de datos usando CUIT (clave fiscal), DNI (documento nacional de identidad), y coincidencia difusa de nombres (distancia de Levenshtein, limitada a 10K objetivos). El mismo motor se usa en todos los casos de investigacion, asegurando consistencia. Las coincidencias se puntuan y clasifican por nivel: coincidencias exactas de CUIT/DNI producen enlaces de nivel oro, coincidencias de nombre verificadas producen nivel plata, y coincidencias difusas no verificadas producen enlaces de nivel bronce pendientes de revision manual. El motor usa joins Map en memoria en lugar de joins cartesianos Cypher para evitar timeout en conjuntos de datos grandes.`,
    },
  },
  {
    id: 'verification',
    title: {
      en: 'Verification Protocol',
      es: 'Protocolo de Verificacion',
    },
    content: {
      en: `Every data point in the investigation carries a confidence tier:

Gold (Curated): Manually verified against primary source documents. Source URL validated and archived. Human editorial sign-off.

Silver (Web-Verified): Cross-referenced against at least two independent public sources. AI-assisted verification with local language model. Source URLs validated.

Bronze (Raw Ingested): Single-source data pending verification. Flagged for review. Not used in published narratives without upgrade.

All AI verification runs locally - no investigation data is sent to external services or cloud APIs.`,
      es: `Cada dato en la investigacion lleva un nivel de confianza:

Oro (Curado): Verificado manualmente contra documentos fuente primarios. URL de fuente validada y archivada. Aprobacion editorial humana.

Plata (Verificado Web): Cruzado contra al menos dos fuentes publicas independientes. Verificacion asistida por IA con modelo de lenguaje local. URLs de fuente validadas.

Bronce (Ingesta Cruda): Datos de fuente unica pendientes de verificacion. Marcados para revision. No se usan en narrativas publicadas sin actualizacion de nivel.

Toda la verificacion por IA se ejecuta localmente - no se envian datos de investigacion a servicios externos ni APIs en la nube.`,
    },
  },
  {
    id: 'frameworks',
    title: {
      en: 'International Compliance Frameworks',
      es: 'Marcos de Cumplimiento Internacional',
    },
    content: {
      en: `This investigation aligns its methodology with recognized international standards:

FATF (Financial Action Task Force): Anti-money laundering and beneficial ownership standards guide our corporate structure analysis.

OECD Anti-Bribery Convention: Framework for identifying foreign bribery indicators in procurement and government contracting.

UNCAC (United Nations Convention Against Corruption): Reference standard for conflicts of interest, asset declarations, and public procurement integrity.

Transparency International: Civil society methodology for corruption perception and institutional integrity assessment.

ICIJ (International Consortium of Investigative Journalists): Data journalism standards for cross-border investigation and source protection.

GIJN (Global Investigative Journalism Network): Open-source investigation methodology and peer verification protocols.`,
      es: `Esta investigacion alinea su metodologia con estandares internacionales reconocidos:

GAFI (Grupo de Accion Financiera Internacional): Los estandares anti-lavado de dinero y de beneficiario final guian nuestro analisis de estructuras corporativas.

Convencion Anti-Soborno de la OCDE: Marco para identificar indicadores de soborno extranjero en contrataciones y licitaciones gubernamentales.

CNUCC (Convencion de las Naciones Unidas contra la Corrupcion): Estandar de referencia para conflictos de interes, declaraciones patrimoniales e integridad en compras publicas.

Transparencia Internacional: Metodologia de sociedad civil para percepcion de corrupcion y evaluacion de integridad institucional.

ICIJ (Consorcio Internacional de Periodistas de Investigacion): Estandares de periodismo de datos para investigacion transfronteriza y proteccion de fuentes.

GIJN (Red Global de Periodismo de Investigacion): Metodologia de investigacion de fuentes abiertas y protocolos de verificacion entre pares.`,
    },
  },
  {
    id: 'gaps',
    title: {
      en: 'Limitations & Known Gaps',
      es: 'Limitaciones y Brechas Conocidas',
    },
    content: {
      en: `This investigation acknowledges the following limitations specific to the spokesperson role:

Press Conference Transcripts: Official transcripts are not always published in full. Where available, we use video recordings as primary source; otherwise, media reports serve as secondary sources with silver-tier confidence.

Pauta Oficial Opacity: Government advertising spending (pauta oficial) data is published with significant delays and inconsistent granularity. Media outlet revenue attribution is estimated where exact figures are unavailable.

No Right of Reply: As of the current publication date, no formal right-of-reply request has been sent to the subjects of this investigation. This investigation is based entirely on publicly available records and will be updated if subjects provide documented responses.

Spokesperson vs. Principal: Distinguishing statements made in an official spokesperson capacity from personal positions requires contextual analysis that carries inherent uncertainty.`,
      es: `Esta investigacion reconoce las siguientes limitaciones especificas al rol de vocero:

Transcripciones de Conferencias de Prensa: Las transcripciones oficiales no siempre se publican completas. Cuando estan disponibles, usamos grabaciones de video como fuente primaria; de lo contrario, los reportes mediaticos sirven como fuentes secundarias con confianza nivel plata.

Opacidad de Pauta Oficial: Los datos de gasto en publicidad oficial (pauta oficial) se publican con retrasos significativos y granularidad inconsistente. La atribucion de ingresos a medios se estima cuando las cifras exactas no estan disponibles.

Sin Derecho a Replica: A la fecha de publicacion actual, no se ha enviado solicitud formal de derecho a replica a los sujetos de esta investigacion. Esta investigacion se basa enteramente en registros publicamente disponibles y sera actualizada si los sujetos proveen respuestas documentadas.

Vocero vs. Principal: Distinguir declaraciones hechas en capacidad oficial de vocero de posiciones personales requiere analisis contextual que conlleva incertidumbre inherente.`,
    },
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MetodologiaPage() {
  const { lang } = useLanguage()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-50">{t.pageTitle[lang]}</h1>
      <p className="mb-8 text-sm text-zinc-400">{t.pageSubtitle[lang]}</p>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6"
          >
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-blue-400">
              {section.title[lang]}
            </h2>
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
              {section.content[lang]}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
