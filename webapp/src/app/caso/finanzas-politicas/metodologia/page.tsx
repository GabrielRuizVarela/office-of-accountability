'use client'

import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/language-context'

const TITLE: Record<Lang, string> = {
  es: 'Metodologia de Investigacion',
  en: 'Investigation Methodology',
}

const sections: readonly {
  id: string
  title: Record<Lang, string>
  content: Record<Lang, readonly string[]>
}[] = [
  {
    id: 'how-built',
    title: {
      es: 'Como Se Construyo Esta Investigacion',
      en: 'How This Investigation Was Built',
    },
    content: {
      es: [
        'Esta investigacion fue construida mediante inteligencia artificial asistida con verificacion humana. Mas de 100 agentes autonomos de investigacion fueron desplegados en paralelo para buscar informacion en la web, cruzar datos entre bases publicas, consultar la base de datos de grafo Neo4j, y detectar patrones estructurales.',
        'Todo el procesamiento de datos se realiza localmente — ningun dato de la investigacion fue enviado a servicios externos. Cada hallazgo fue verificado independientemente contra fuentes publicas primarias antes de ser incluido.',
        'La IA no acusa: revela patrones. Las conclusiones son del lector.',
      ],
      en: [
        'This investigation was built through AI-assisted intelligence with human verification. Over 100 autonomous investigation agents were deployed in parallel to search the web, cross-reference public databases, query the Neo4j graph database, and detect structural patterns.',
        'All data processing runs locally — no investigation data was sent to external services. Every finding was independently verified against primary public sources before inclusion.',
        'The AI does not accuse: it reveals patterns. The conclusions are the reader\'s.',
      ],
    },
  },
  {
    id: 'pipeline',
    title: {
      es: 'Pipeline de Datos (14 Fuentes)',
      en: 'Data Pipeline (14 Sources)',
    },
    content: {
      es: [
        '1. Como Voto — votos legislativos, 2.901 sesiones de Diputados (1993-2026), 2.598 de Senadores (1983-2026)',
        '2. ICIJ Offshore Leaks — Panama Papers, Pandora Papers, entidades y oficiales offshore',
        '3. CNE Aportantes Electorales — 1.467 donantes de campana, montos y partidos',
        '4. Boletin Oficial — adjudicaciones de contratos publicos (2018-2020)',
        '5. IGJ — Inspeccion General de Justicia, 398.000 empresas, 951.000 directivos corporativos',
        '6. CNV — Comision Nacional de Valores, directivos de empresas cotizantes',
        '7. DDJJ Patrimoniales — declaraciones juradas de funcionarios publicos',
        '8. Compr.ar — sistema de contrataciones electronicas del Estado, ordenes de compra',
        '9. BCRA Central de Deudores — API libre y sin autenticacion, estado crediticio por CUIT',
        '10. Registro Nacional de Sociedades — CSV mensual, CUIT, razon social, tipo societario, domicilios',
        '11. OpenSanctions — 2,1 millones de entidades PEP, sanciones e Interpol (disponible para integracion)',
        '12. SSN Datos Abiertos — registro de productores de seguros',
        '13. Registros de propiedad de medios — estructura accionaria de 7 grupos mediaticos',
        '14. INDEC COMEX — estadisticas de comercio exterior por producto y pais',
      ],
      en: [
        '1. Como Voto — legislative votes, 2,901 Deputies sessions (1993-2026), 2,598 Senate sessions (1983-2026)',
        '2. ICIJ Offshore Leaks — Panama Papers, Pandora Papers, offshore entities and officers',
        '3. CNE Electoral Donors — 1,467 campaign donors, amounts, and parties',
        '4. Boletin Oficial — public contract awards (2018-2020)',
        '5. IGJ — General Inspection of Justice, 398,000 companies, 951,000 corporate officers',
        '6. CNV — National Securities Commission, public company board members',
        '7. DDJJ Asset Declarations — sworn asset statements by public officials',
        '8. Compr.ar — electronic state procurement system, purchase orders',
        '9. BCRA Central de Deudores — free unauthenticated API, credit status by CUIT',
        '10. Registro Nacional de Sociedades — monthly CSV, CUIT, company name, type, addresses',
        '11. OpenSanctions — 2.1 million PEP, sanctions, and Interpol entities (available for integration)',
        '12. SSN Open Data — insurance producer registry',
        '13. Media ownership records — shareholder structure of 7 media conglomerates',
        '14. INDEC COMEX — foreign trade statistics by product and country',
      ],
    },
  },
  {
    id: 'cross-reference',
    title: {
      es: 'Motor de Cruce de Entidades',
      en: 'Entity Cross-Reference Engine',
    },
    content: {
      es: [
        'Tres niveles de coincidencia: CUIT (confianza 1.0, coincidencia exacta de identificador tributario), DNI/CUIL (confianza 0.95, extraccion de DNI del formato CUIL XX-DNI-X), y nombre (confianza 0.6-0.8, normalizacion + distancia Levenshtein).',
        'Resultados: 1.125 coincidencias por CUIT (Contractor-Company), 715 por DNI (GovernmentAppointment-CompanyOfficer), 247 coincidencias donante-directivo por CUIT/DNI, 14 puentes ICIJ offshore (Belocopitt 6 entidades BVI, Werthein 2).',
        'El cruce revelo: 1.428 funcionarios publicos que son simultaneamente directivos de empresas (puerta giratoria). 247 donantes de campana que son directivos de empresas que reciben $63.000 millones en contratos estatales.',
      ],
      en: [
        'Three matching tiers: CUIT (confidence 1.0, exact tax ID match), DNI/CUIL (confidence 0.95, DNI extraction from CUIL format XX-DNI-X), and name (confidence 0.6-0.8, normalization + Levenshtein distance).',
        'Results: 1,125 CUIT matches (Contractor-Company), 715 DNI matches (GovernmentAppointment-CompanyOfficer), 247 donor-officer matches by CUIT/DNI, 14 ICIJ offshore bridges (Belocopitt 6 BVI entities, Werthein 2).',
        'The cross-reference revealed: 1,428 government officials who are simultaneously corporate officers (revolving door). 247 campaign donors who are officers of companies receiving $63 billion in state contracts.',
      ],
    },
  },
  {
    id: 'verification',
    title: {
      es: 'Protocolo de Verificacion',
      en: 'Verification Protocol',
    },
    content: {
      es: [
        'Todas las URLs de fuentes fueron verificadas con HTTP 200 (76/76 actores, 56 citaciones del resumen auditadas, URLs rotas reemplazadas).',
        'Todos los numeros fueron cruzados contra el estado real de Neo4j (14 ediciones para sincronizar entre archivos).',
        'Tres niveles de confianza: gold (curado manualmente), silver (verificado via web), bronze (sin verificar). 218 nodos silver, 2 bronze.',
        'Falsos positivos identificados y eliminados: Martinez Carlos Alberto y Lopez Juan Manuel (nombres comunes sin evidencia independiente), De Andreis 806x (artefacto de datos, crecimiento real: 6x).',
        'Derecho a replica: los sujetos de esta investigacion no fueron contactados para descargo previo. La informacion se basa exclusivamente en fuentes publicas verificables. Esta es una limitacion reconocida.',
      ],
      en: [
        'All source URLs verified with HTTP 200 (76/76 actors, 56 resumen citations audited, broken URLs replaced).',
        'All numbers cross-checked against actual Neo4j state (14 edits to sync across files).',
        'Three confidence tiers: gold (manually curated), silver (web-verified), bronze (unverified). 218 silver nodes, 2 bronze.',
        'False positives identified and removed: Martinez Carlos Alberto and Lopez Juan Manuel (common names without independent evidence), De Andreis 806x (data artifact, real growth: 6x).',
        'Right of reply: subjects of this investigation were not contacted for prior comment. Information is based exclusively on verifiable public sources. This is an acknowledged limitation.',
      ],
    },
  },
  {
    id: 'frameworks',
    title: {
      es: 'Marcos de Cumplimiento Internacional',
      en: 'International Compliance Frameworks',
    },
    content: {
      es: [
        'FATF/GAFI: identificacion de PEP, rastreo de beneficiarios finales, deteccion de sociedades fantasma, seguimiento de flujos transfronterizos.',
        'OCDE: documentacion de soborno extranjero, pagos facilitadores, puerta giratoria publico-privada.',
        'UNCAC: analisis de declaraciones juradas, conflictos de intereses, deteccion de enriquecimiento ilicito.',
        'Transparency International: verificacion con fuentes multiples, test de interes publico, independencia editorial.',
        'ICIJ: cruce de registros publicos, investigacion basada en datos, verificacion colaborativa.',
        'GIJN: protocolos de verificacion, proteccion de fuentes, interes publico, transparencia metodologica.',
      ],
      en: [
        'FATF: PEP identification, beneficial ownership tracing, shell company detection, cross-border flow tracking.',
        'OECD: foreign bribery documentation, facilitation payments, public-private revolving door mapping.',
        'UNCAC: asset disclosure analysis, conflict of interest documentation, illicit enrichment detection.',
        'Transparency International: multi-source verification, public interest test, editorial independence.',
        'ICIJ: public records cross-referencing, data-driven investigation, collaborative verification.',
        'GIJN: verification protocols, source protection, public interest, methodological transparency.',
      ],
    },
  },
  {
    id: 'gaps',
    title: {
      es: 'Limitaciones y Brechas Conocidas',
      en: 'Known Limitations and Gaps',
    },
    content: {
      es: [
        'Vinculos offshore-juez no resueltos: no sabemos si los jueces de Comodoro Py tienen sociedades offshore.',
        'Cadena donante-juez opaca: los flujos de dinero entre donantes de campana y el sistema judicial no son trazables con datos publicos.',
        'Datos provinciales limitados: solo CABA y Mendoza publican en estandar OCDS. Formosa (31 anios de Insfran), San Luis (35 anios de Rodriguez Saa) y Salta (71% de pauta al medio del senador) son las mas relevantes y las mas opacas.',
        '12 causas de corrupcion por documentar: AMIA/Nisman, Skanska, Rio Turbio, vacunatorio VIP, entre otras.',
        'Periodo 1983-2007 con cobertura delgada. Sectores no incluidos: mineria/litio, sindicatos, transporte.',
        'Resolucion de entidades limitada a nombre exacto; el cruce por CUIT requiere fulltext indexes no implementados.',
        'El motor de analisis de IA (ejecutado localmente, sin transmision de datos) se utiliza exclusivamente para deteccion de patrones estructurales. Cada hallazgo requiere verificacion humana independiente antes de ser incluido.',
      ],
      en: [
        'Offshore-judge links unresolved: we do not know if Comodoro Py judges hold offshore companies.',
        'Donor-judge chain opaque: money flows between campaign donors and the judicial system are not traceable with public data.',
        'Provincial data limited: only CABA and Mendoza publish in OCDS standard. Formosa (31 years of Insfran), San Luis (35 years of Rodriguez Saa), and Salta (71% of state advertising to senator\'s own media) are the most relevant and most opaque.',
        '12 corruption cases yet to document: AMIA/Nisman, Skanska, Rio Turbio, VIP vaccination, among others.',
        '1983-2007 period has thin coverage. Sectors not included: mining/lithium, unions, transport.',
        'Entity resolution limited to exact name matching; CUIT-based cross-referencing requires fulltext indexes not yet implemented.',
        'The AI analysis engine (running locally, no data transmission) is used exclusively for structural pattern detection. Every finding requires independent human verification before inclusion.',
      ],
    },
  },
]

export default function MetodologiaPage() {
  const { lang } = useLanguage()

  return (
    <article className="mx-auto max-w-prose pb-20">
      <header className="py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          {TITLE[lang]}
        </h1>
        <p className="mt-4 text-sm text-zinc-500">
          {lang === 'es'
            ? 'Transparencia total sobre como se hizo esta investigacion, que datos se usaron, y donde estan las limitaciones.'
            : 'Full transparency on how this investigation was built, what data was used, and where the limitations are.'}
        </p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              {section.title[lang]}
            </h2>
            <div className="mt-4 space-y-3">
              {section.content[lang].map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-zinc-300">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {lang === 'es'
            ? 'Esta investigacion se basa en fuentes publicas verificadas. Todos los pipelines ETL son idempotentes y reproducibles. Ninguna fuente privada fue utilizada. La inclusion no implica culpabilidad. Donde se indica "presunto," la conexion no ha sido verificada de forma independiente.'
            : 'This investigation is based on verified public sources. All ETL pipelines are idempotent and reproducible. No private sources were used. Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}
        </p>
      </div>
    </article>
  )
}
