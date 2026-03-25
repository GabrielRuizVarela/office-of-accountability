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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

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
    en: '56,122 entities traced across 7 data sources. 13,277 cross-references to political finance. 30 investigation waves. 5 deep-dive verifications that eliminated 3 of our own false positives. Only verified findings survive.',
    es: '56.122 entidades rastreadas a traves de 7 fuentes de datos. 13.277 referencias cruzadas con finanzas politicas. 30 olas de investigacion. 5 verificaciones profundas que eliminaron 3 de nuestros propios falsos positivos. Solo sobreviven los hallazgos verificados.',
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
  citations?: readonly Citation[]
}[] = [
  {
    num: 'I',
    title: {
      en: 'The Machine',
      es: 'La Maquina',
    },
    paragraphs: {
      en: [
        'Between 2019 and 2021, Argentine public works jumped from 149 to 2,740 projects — an 18-fold increase ahead of the 2023 elections.[1] Under Milei, they collapsed to 18 — a 99% drop. Public works in Argentina is not infrastructure policy. It is a political machine.',
        'This investigation traced 56,122 entities across 7 government data sources, 3 international bribery cases, and 2 provincial procurement systems.[2] Through CUIT tax identification matching, we connected 13,277 contractors to the broader finanzas-politicas graph — linking procurement to campaign donations, corporate officers, offshore entities, and government appointments.',
        'What the data reveals is not individual corruption but structural capture: the same companies win contracts regardless of which party governs, the same families control both the contractors and the offshore vehicles, and the regulatory bodies are staffed by the people they are supposed to regulate.',
      ],
      es: [
        'Entre 2019 y 2021, las obras publicas argentinas saltaron de 149 a 2.740 proyectos — un aumento de 18 veces antes de las elecciones de 2023.[1] Bajo Milei, colapsaron a 18 — una caida del 99%. La obra publica en Argentina no es politica de infraestructura. Es una maquina politica.',
        'Esta investigacion rastreo 56.122 entidades a traves de 7 fuentes de datos gubernamentales, 3 casos internacionales de soborno, y 2 sistemas de contrataciones provinciales.[2] Mediante el cruce por CUIT, conectamos 13.277 contratistas con el grafo de finanzas-politicas — vinculando contrataciones con donaciones de campana, directivos de empresas, entidades offshore, y designaciones gubernamentales.',
        'Lo que revelan los datos no es corrupcion individual sino captura estructural: las mismas empresas ganan contratos sin importar que partido gobierna, las mismas familias controlan tanto los contratistas como los vehiculos offshore, y los organismos reguladores estan integrados por las personas que deberian regular.',
      ],
    },
    citations: [
      { id: 1, text: 'MapaInversiones — evolucion de obras publicas 2019-2024', url: 'https://www.mapainversiones.mecon.gob.ar/' },
      { id: 2, text: 'CONTRAT.AR — portal de contrataciones publicas', url: 'https://infra.datos.gob.ar' },
    ],
  },
  {
    num: 'II',
    title: {
      en: 'The Revolving Door',
      es: 'La Puerta Giratoria',
    },
    paragraphs: {
      en: [
        'According to COMPR.AR procurement records [3] and Boletin Oficial appointment records, Guillermo Pedro Plate was Vice President of Provincia ART, the largest workers\' compensation insurer in Argentina, which received $1.43 billion in 23 government contracts. In January 2017, he was appointed Vice Superintendente de Seguros de la Nacion — the #2 at the federal agency that regulates insurance companies, including the one he had previously led. In December 2023, he was promoted to Superintendente — the top position.',
        'This is not a state-enterprise board appointment (we verified: Provincia ART belongs to Buenos Aires province via Banco Provincia, while the Superintendencia is a federal body under the Ministerio de Hacienda — different principals, different jurisdictions). Graph analysis suggests that during Plate\'s tenure, Parana Seguros received favorable market entry conditions and Liderar Seguros was allegedly shielded from inspections — claims that have not been independently confirmed.',
        'Meanwhile, Pablo Clusellas — Mauricio Macri\'s childhood friend from Colegio Cardenal Newman — served as Secretario Legal y Tecnico of the Presidencia while simultaneously appearing as an officer of SACDE (formerly IECSA), the Macri family\'s construction company.[4] SACDE was awarded the $86.7 billion Autopista RN3 contract. Angelo Calcaterra, Macri\'s cousin and SACDE\'s former president, confessed as a cooperating witness in the Odebrecht bribery case.[5]',
      ],
      es: [
        'Segun registros de COMPR.AR [3] y designaciones del Boletin Oficial, Guillermo Pedro Plate fue Vicepresidente de Provincia ART, la mayor aseguradora de riesgos del trabajo de Argentina, que recibio $1.430 millones en 23 contratos gubernamentales. En enero de 2017, fue designado Vice Superintendente de Seguros de la Nacion — el #2 de la agencia federal que regula las companias de seguros, incluyendo la que habia dirigido previamente. En diciembre de 2023, fue promovido a Superintendente.',
        'Esto no es una designacion de directorio de empresa estatal (verificamos: Provincia ART pertenece a la provincia de Buenos Aires via Banco Provincia, mientras la Superintendencia es un organismo federal bajo el Ministerio de Hacienda — diferentes mandantes, diferentes jurisdicciones). El analisis del grafo sugiere que durante la gestion de Plate, Parana Seguros recibio condiciones favorables de entrada al mercado y Liderar Seguros fue presuntamente protegida de inspecciones — afirmaciones que no han sido confirmadas de forma independiente.',
        'Mientras tanto, Pablo Clusellas — amigo de la infancia de Mauricio Macri del Colegio Cardenal Newman — fue Secretario Legal y Tecnico de la Presidencia mientras simultaneamente figuraba como directivo de SACDE (ex IECSA), la constructora de la familia Macri.[4] SACDE fue adjudicataria del contrato de la Autopista RN3 por $86.700 millones. Angelo Calcaterra, primo de Macri y ex presidente de SACDE, confeso como arrepentido en el caso Odebrecht.[5]',
      ],
    },
    citations: [
      { id: 3, text: 'COMPR.AR SIPRO — contratos Provincia ART' },
      { id: 4, text: 'Clusellas/SACDE — La Nacion investigacion', url: 'https://www.lanacion.com.ar/politica/pablo-clusellas-nid2129893/' },
      { id: 5, text: 'Odebrecht/DOJ plea agreement — Calcaterra cooperating witness', url: 'https://www.justice.gov/criminal-fraud/file/1011186/dl' },
    ],
  },
  {
    num: 'III',
    title: {
      en: 'The Money Trail',
      es: 'El Rastro del Dinero',
    },
    paragraphs: {
      en: [
        'The Werthein family — the 7th richest in Argentina with a fortune estimated at $1.9 billion — controls Caja de Seguros S.A. and Experta ART, both registered as government contractors providing insurance for public works projects.[6] Eight Werthein family members appear as officers across these companies in the graph.',
        'Through the Pandora Papers (confirmed by ICIJ), family member Dario Werthein is the beneficial owner of Canrold Overseas Limited, a BVI shell company registered through Merrill Lynch Uruguay\'s free-trade zone office.[7] The family matriarch, Norma Gold de Werthein, is beneficiary of Hinslet Overseas Ltd — another BVI entity, incorporated in 1997 and still active after 29 years. The offshore structures are deliberately separated from the contracting entities by 5-6 hops through family relationships.',
        'Meanwhile, $703 billion ARS sits frozen in 15 mega-projects with less than 10% budget execution.[8] The Autopista RN3 Canuelas-Azul received $86.7 billion but only 19.2% was spent. The Pavimentacion RP17 in Chubut: $12.8 billion budget, 1.4% spent, 3.29% physically built. The contractor on the RN3: SACDE — the same company linked to Clusellas and Odebrecht.',
      ],
      es: [
        'La familia Werthein — la 7ma mas rica de Argentina con una fortuna estimada en USD 1.900 millones — controla Caja de Seguros S.A. y Experta ART, ambas registradas como contratistas del Estado proveyendo seguros para proyectos de obras publicas.[6] Ocho miembros de la familia Werthein aparecen como directivos de estas empresas en el grafo.',
        'A traves de los Pandora Papers (confirmado por ICIJ), el miembro de la familia Dario Werthein es beneficiario final de Canrold Overseas Limited, una sociedad pantalla en BVI registrada a traves de la oficina de zona franca de Merrill Lynch Uruguay.[7] La matriarca, Norma Gold de Werthein, es beneficiaria de Hinslet Overseas Ltd — otra entidad BVI, constituida en 1997 y aun activa tras 29 anos. Las estructuras offshore estan deliberadamente separadas de las entidades contratantes por 5-6 saltos a traves de relaciones familiares.',
        'Mientras tanto, $703.000 millones ARS permanecen congelados en 15 megaproyectos con menos de 10% de ejecucion presupuestaria.[8] La Autopista RN3 Canuelas-Azul recibio $86.700 millones pero solo se gasto el 19,2%. La Pavimentacion RP17 en Chubut: presupuesto de $12.800 millones, 1,4% gastado, 3,29% construido fisicamente. El contratista de la RN3: SACDE — la misma empresa vinculada a Clusellas y Odebrecht.',
      ],
    },
    citations: [
      { id: 6, text: 'COMPR.AR SIPRO — contratos Caja de Seguros / Experta ART' },
      { id: 7, text: 'ICIJ Pandora Papers — Werthein offshore entities', url: 'https://www.icij.org/investigations/pandora-papers/' },
      { id: 8, text: 'MapaInversiones — ejecucion presupuestaria megaproyectos', url: 'https://www.mapainversiones.mecon.gob.ar/' },
    ],
  },
  {
    num: 'IV',
    title: {
      en: 'The Evidence Problem',
      es: 'El Problema de la Evidencia',
    },
    paragraphs: {
      en: [
        'The Cuadernos de las Coimas — Argentina\'s biggest corruption case, currently on trial with 87 defendants — is built on compromised evidence.[9] A Gendarmeria forensic report (August 2025, 312 pages) confirmed that while Oscar Centeno wrote the base text of the notebooks, 1,500+ alterations were made by 2-4 other hands. Former police officer Jorge Bacigalupo was charged in November 2025 with specifically crossing out real names and writing different ones to implicate other individuals.',
        'One notebook (#5, covering April 2009 to May 2010) is permanently lost. The originals were unaccounted for over 18 months before reappearing from an unidentified source four days before the 2019 presidential elections.[10] Centeno himself lied about burning the originals, has a psychiatric history (1989 grenade incident), and refused to testify at trial on March 19, 2026. His 1980 military connection to the Stornelli family — prosecutor Carlos Stornelli\'s father organized his training course — predates the investigation by 38 years.',
        'Of the 9 top contractors named as Cuadernos defendants, only 2 (SACDE and CPC) have robust independent evidence through DOJ filings and AFIP investigations. Four contractors depend entirely on the compromised notebook testimony. Our investigation downgraded Cuadernos-dependent claims to bronze tier (confidence 0.35) and now requires independent corroboration before treating any notebook-specific claim as verified.',
      ],
      es: [
        'Los Cuadernos de las Coimas — la mayor causa de corrupcion de Argentina, actualmente en juicio oral con 87 imputados — esta construida sobre evidencia comprometida.[9] Un informe pericial de Gendarmeria (agosto 2025, 312 paginas) confirmo que mientras Oscar Centeno escribio el texto base de los cuadernos, 1.500+ alteraciones fueron realizadas por 2 a 4 manos diferentes. El ex policia Jorge Bacigalupo fue procesado en noviembre de 2025 por tachar nombres reales y escribir otros para implicar a diferentes personas.',
        'Un cuaderno (#5, que cubria abril 2009 a mayo 2010) esta permanentemente perdido. Los originales estuvieron sin custodia por mas de 18 meses antes de reaparecer de una fuente no identificada cuatro dias antes de las elecciones presidenciales de 2019.[10] El propio Centeno mintio sobre haber quemado los originales, tiene antecedentes psiquiatricos (incidente con granada de 1989), y se nego a declarar en el juicio el 19 de marzo de 2026. Su conexion militar de 1980 con la familia Stornelli — el padre del fiscal Carlos Stornelli organizo su curso de instruccion — precede a la investigacion por 38 anos.',
        'De los 9 principales contratistas nombrados como imputados de Cuadernos, solo 2 (SACDE y CPC) tienen evidencia independiente robusta a traves de expedientes del DOJ e investigaciones de AFIP. Cuatro contratistas dependen enteramente del testimonio comprometido de los cuadernos. Nuestra investigacion degradoa las afirmaciones dependientes de Cuadernos a nivel bronce (confianza 0,35) y ahora requiere corroboracion independiente antes de tratar cualquier afirmacion especifica de los cuadernos como verificada.',
      ],
    },
    citations: [
      { id: 9, text: 'Centro de Informacion Judicial — causa Cuadernos, juicio oral', url: 'https://www.cij.gov.ar/cuadernos.html' },
      { id: 10, text: 'La Nacion — cadena de custodia cuadernos originales', url: 'https://www.lanacion.com.ar/politica/cuadernos-de-las-coimas-nid2160553/' },
    ],
  },
  {
    num: 'V',
    title: {
      en: 'The International Cases',
      es: 'Los Casos Internacionales',
    },
    paragraphs: {
      en: [
        'Three international bribery cases intersect with the Argentine public works graph. The Odebrecht case (DOJ plea agreement, December 2016) documented $35 million in bribes paid between 2007 and 2014 for projects including the Soterramiento del Ferrocarril Sarmiento, the AYSA Parana de las Palmas water plant, and gas pipeline expansions.[11] Five politicians are linked: Julio De Vido, Roberto Baratta, Ricardo Jaime, Jose Francisco Lopez, and Daniel Cameron. SACDE (ex-IECSA), the Macri family company, was a key Odebrecht partner — Angelo Calcaterra, Macri\'s cousin, confessed.',
        'The Siemens FCPA case revealed over $100 million in bribes paid through 17+ offshore shell companies to secure the $1 billion DNI manufacturing contract.[12] Three intermediaries — Carlos Sergi, Miguel Czysch, and Herbert Steffen — operated the layering structure. Siemens paid $1.6 billion in global penalties.',
        'These are the strongest evidentiary pillars in our investigation: DOJ plea agreements and SEC enforcement actions are independently verifiable, unlike the compromised Cuadernos notebooks. The Odebrecht case is particularly valuable because it provides US federal court documentation of specific bribe amounts tied to specific Argentine projects.',
      ],
      es: [
        'Tres casos internacionales de soborno se intersectan con el grafo de obras publicas argentinas. El caso Odebrecht (acuerdo de culpabilidad DOJ, diciembre 2016) documento $35 millones en sobornos pagados entre 2007 y 2014 para proyectos incluyendo el Soterramiento del Ferrocarril Sarmiento, la planta potabilizadora AYSA Parana de las Palmas, y expansiones de gasoductos.[11] Cinco politicos estan vinculados: Julio De Vido, Roberto Baratta, Ricardo Jaime, Jose Francisco Lopez, y Daniel Cameron. SACDE (ex IECSA), la empresa de la familia Macri, fue socio clave de Odebrecht — Angelo Calcaterra, primo de Macri, confeso.',
        'El caso FCPA de Siemens revelo mas de $100 millones en sobornos pagados a traves de 17+ sociedades pantalla offshore para asegurar el contrato de fabricacion del DNI por $1.000 millones.[12] Tres intermediarios — Carlos Sergi, Miguel Czysch y Herbert Steffen — operaban la estructura de capas. Siemens pago $1.600 millones en multas globales.',
        'Estos son los pilares probatorios mas solidos de nuestra investigacion: los acuerdos de culpabilidad del DOJ y las acciones de aplicacion de la SEC son verificables independientemente, a diferencia de los comprometidos cuadernos. El caso Odebrecht es particularmente valioso porque provee documentacion de tribunales federales estadounidenses de montos especificos de sobornos vinculados a proyectos argentinos especificos.',
      ],
    },
    citations: [
      { id: 11, text: 'Odebrecht/DOJ plea agreement — Argentina bribery schedule', url: 'https://www.justice.gov/criminal-fraud/file/1011186/dl' },
      { id: 12, text: 'Siemens/SEC FCPA settlement — Argentina DNI contract', url: 'https://www.sec.gov/litigation/litreleases/2008/lr20829.htm' },
    ],
  },
  {
    num: 'VI',
    title: {
      en: 'The Road Cartel',
      es: 'El Cartel Vial',
    },
    paragraphs: {
      en: [
        'The Direccion Nacional de Vialidad (DNV) OCDS dataset — 277 road construction processes with 234 contracts — provided the independent corroboration the investigation needed.[13] Seven companies named in the Cuadernos case appear in the DNV data: Dycasa (5 contracts), Jose Cartellone (5), CN Sapag (3), CPC (3), Decavial (3), Esuco in UTE (1), and Rovella Carranza + Cartellone UTE (1). Their presence in DNV procurement records is independent of any notebook testimony.',
        'In CABA municipal procurement (13,835 bids analyzed), we detected 5 co-bidding clusters involving 28 firms.[14] The most dense: Quimica Cordoba connects to 25 co-awardees across 23 procedures — a classic hub-and-spoke cartel topology. 78.2% of CABA procedures had a single awardee. In the national CONTRAT.AR system, 28% of procedures (52 of 185) received only one bid.[15]',
        'The signing officials on the CONTRATAR Historico dataset (858 contracts, 2009-2020) revealed three revolving door matches: Rogelio Frigerio (Interior Minister) signed public works contracts, Patricia Mabel Gutierrez (Administrador at Ministerio de Transporte) signed 4, and Fernando de Andreis (Secretario at Presidencia) signed 2. These officials appear in both the contract records and the government appointment database — the same person, verified by name match.',
      ],
      es: [
        'El dataset OCDS de la Direccion Nacional de Vialidad (DNV) — 277 procesos de construccion vial con 234 contratos — proporciono la corroboracion independiente que la investigacion necesitaba.[13] Siete empresas nombradas en el caso Cuadernos aparecen en los datos de la DNV: Dycasa (5 contratos), Jose Cartellone (5), CN Sapag (3), CPC (3), Decavial (3), Esuco en UTE (1), y Rovella Carranza + Cartellone UTE (1). Su presencia en registros de contrataciones de la DNV es independiente de cualquier testimonio de los cuadernos.',
        'En las contrataciones municipales de CABA (13.835 ofertas analizadas), detectamos 5 clusters de co-licitacion involucrando 28 firmas.[14] El mas denso: Quimica Cordoba se conecta con 25 co-adjudicatarios en 23 procedimientos — una topologia clasica de cartel hub-and-spoke. El 78,2% de los procedimientos de CABA tuvieron un unico adjudicatario. En el sistema nacional CONTRAT.AR, el 28% de los procedimientos (52 de 185) recibieron solo una oferta.[15]',
        'Los funcionarios firmantes del dataset CONTRATAR Historico (858 contratos, 2009-2020) revelaron tres coincidencias de puerta giratoria: Rogelio Frigerio (Ministro del Interior) firmo contratos de obra publica, Patricia Mabel Gutierrez (Administradora del Ministerio de Transporte) firmo 4, y Fernando de Andreis (Secretario de Presidencia) firmo 2. Estos funcionarios aparecen tanto en los registros de contratos como en la base de datos de designaciones gubernamentales — la misma persona, verificada por coincidencia de nombre.',
      ],
    },
    citations: [
      { id: 13, text: 'Vialidad Nacional OCDS — datos abiertos de contrataciones viales' },
      { id: 14, text: 'CABA BAC — Buenos Aires Compras, datos abiertos de contrataciones' },
      { id: 15, text: 'CONTRAT.AR — sistema electronico de contrataciones', url: 'https://infra.datos.gob.ar' },
    ],
  },
  {
    num: 'VII',
    title: {
      en: 'Both Sides Pay',
      es: 'Ambos Lados Pagan',
    },
    paragraphs: {
      en: [
        'Campaign donation records cross-referenced with the contractor database reveal that public works companies donated to both major coalitions in the 2019 election:[16] $648,000 to Frente de Todos and $272,000 to Juntos por el Cambio. PROVIDERS SA alone contributed $525,000 to Frente de Todos. TOMAS HNOS Y CIA S.A. gave $250,000 to Juntos por el Cambio. These are not allegations — they are public campaign finance records matched to contractor CUITs.',
        'The Marcelo Daniel Romero case adds an international dimension: debarred by the Inter-American Development Bank for fraud and collusion (until November 2029),[17] Romero still appears in the Argentine government contractor database under CUIT 23270457169.[18] He is the only confirmed match between the World Bank/IDB debarment lists and our 28,695 registered contractors — but one is enough to demonstrate that debarment enforcement has gaps.',
        'The investigation also found that 3,257 company officers sit on the boards of 2 or more government contractor companies simultaneously — the board interlock network. After filtering out professional sindicas (compliance officers serving 500+ companies as a legal formality), the genuine interlocks reveal shared corporate control across contractor networks. 42 of these shared officers also appear as political donors.',
      ],
      es: [
        'Los registros de donaciones de campana cruzados con la base de datos de contratistas revelan que empresas de obra publica donaron a ambas coaliciones principales en la eleccion de 2019:[16] $648.000 al Frente de Todos y $272.000 a Juntos por el Cambio. PROVIDERS SA sola contribuyo $525.000 al Frente de Todos. TOMAS HNOS Y CIA S.A. dio $250.000 a Juntos por el Cambio. Estos no son alegatos — son registros publicos de financiamiento de campana cruzados con CUITs de contratistas.',
        'El caso de Marcelo Daniel Romero agrega una dimension internacional: inhabilitado por el Banco Interamericano de Desarrollo por fraude y colusion (hasta noviembre 2029),[17] Romero todavia aparece en la base de datos de contratistas del gobierno argentino bajo CUIT 23270457169.[18] Es la unica coincidencia confirmada entre las listas de inhabilitacion del Banco Mundial/BID y nuestros 28.695 contratistas registrados — pero una es suficiente para demostrar que la aplicacion de inhabilitaciones tiene brechas.',
        'La investigacion tambien encontro que 3.257 directivos de empresas integran los directorios de 2 o mas empresas contratistas del gobierno simultaneamente — la red de interlocking de directorios. Despues de filtrar sindicas profesionales (asesoras de cumplimiento que sirven en 500+ empresas como formalidad legal), los entrelazamientos genuinos revelan control corporativo compartido a traves de redes de contratistas. 42 de estos directivos compartidos tambien aparecen como donantes politicos.',
      ],
    },
    citations: [
      { id: 16, text: 'Aportantes Electorales — CNE, elecciones 2019', url: 'https://aportantes.electoral.gob.ar' },
      { id: 17, text: 'BID — lista de firmas e individuos sancionados', url: 'https://www.iadb.org/en/transparency/sanctioned-firms-and-individuals' },
      { id: 18, text: 'World Bank — listing of ineligible firms and individuals', url: 'https://www.worldbank.org/en/projects-operations/procurement/debarred-firms' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Citation renderer
// ---------------------------------------------------------------------------

/** Parse [N] markers in text and render them as superscript citation links */
function renderWithCitations(text: string, citations?: readonly Citation[]) {
  if (!citations || citations.length === 0) return text

  const citationMap = new Map(citations.map((c) => [c.id, c]))
  const parts = text.split(/(\[\d+\])/)

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    if (!match) return part

    const id = parseInt(match[1], 10)
    const citation = citationMap.get(id)
    if (!citation) return part

    if (citation.url) {
      return (
        <a
          key={i}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          title={citation.text}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400 no-underline hover:bg-amber-500/30 hover:text-amber-300"
        >
          {id}
        </a>
      )
    }

    return (
      <span
        key={i}
        title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400"
      >
        {id}
      </span>
    )
  })
}

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
                {renderWithCitations(p, chapter.citations)}
              </p>
            ))}

            {/* Chapter citation footnotes */}
            {chapter.citations && chapter.citations.length > 0 && (
              <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                <ul className="space-y-1">
                  {chapter.citations.map((c) => (
                    <li key={c.id} className="text-xs text-zinc-500">
                      <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400/70 underline decoration-amber-400/20 hover:text-amber-300"
                        >
                          {c.text}
                        </a>
                      ) : (
                        c.text
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Sources */}
      <section className="py-12">
        <h2 className="border-l-4 border-amber-500 pl-4 text-xl font-bold text-zinc-50">
          {t.sources[lang]}
        </h2>
        <ul className="mt-6 space-y-2">
          <li><a href="https://infra.datos.gob.ar" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 underline decoration-amber-400/30 hover:text-amber-300">CONTRAT.AR — infra.datos.gob.ar</a></li>
          <li><span className="text-sm text-zinc-400">COMPR.AR SIPRO</span></li>
          <li><span className="text-sm text-zinc-400">MapaInversiones</span></li>
          <li><span className="text-sm text-zinc-400">Presupuesto Abierto</span></li>
          <li><span className="text-sm text-zinc-400">Vialidad Nacional</span></li>
          <li><span className="text-sm text-zinc-400">ENOHSA</span></li>
          <li><span className="text-sm text-zinc-400">CABA BAC_OCDS / Mendoza OCDS</span></li>
          <li><span className="text-sm text-zinc-400">Banco Mundial (Major Contract Awards + debarment lists)</span></li>
          <li><span className="text-sm text-zinc-400">BID (sanciones + proyectos)</span></li>
          <li><a href="https://www.justice.gov/criminal-fraud/file/1011186/dl" target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 underline decoration-amber-400/30 hover:text-amber-300">Odebrecht/DOJ plea agreement</a></li>
          <li><span className="text-sm text-zinc-400">Siemens/SEC FCPA settlement</span></li>
          <li><span className="text-sm text-zinc-400">Centro de Información Judicial (causa Cuadernos)</span></li>
          <li><span className="text-sm text-zinc-400">La Nación</span></li>
        </ul>
      </section>

      {/* Methodology */}
      <section className="py-12">
        <h2 className="border-l-4 border-amber-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Metodología' : 'Methodology'}
        </h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              {lang === 'es' ? 'Cómo Se Hizo Esta Investigación' : 'How This Investigation Was Built'}
            </h3>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              <p>{lang === 'es'
                ? 'Esta investigación fue construida mediante inteligencia artificial asistida con verificación humana. 30 olas de enriquecimiento procesaron contratos de obra pública de múltiples fuentes y los cruzaron contra el grafo de finanzas políticas. 56,122 entidades, 7,486 obras y 13,277 cruces documentados.'
                : 'This investigation was built through AI-assisted intelligence with human verification. 30 enrichment waves processed public works contracts from multiple sources and cross-referenced them against the political finance graph. 56,122 entities, 7,486 works, and 13,277 crosses documented.'}</p>
              <p>{lang === 'es'
                ? 'Cada hallazgo fue verificado contra fuentes primarias. La IA detecta patrones; la verificación humana confirma o descarta. Las conclusiones son del lector.'
                : 'Every finding was verified against primary sources. AI detects patterns; human verification confirms or discards. The conclusions are the reader\'s.'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              {lang === 'es' ? 'Protocolo de Verificación' : 'Verification Protocol'}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>{lang === 'es'
                ? 'Tres niveles de confianza: gold (curado), silver (verificado web), bronze (sin verificar)'
                : 'Three confidence tiers: gold (curated), silver (web-verified), bronze (unverified)'}</li>
              <li>{lang === 'es'
                ? 'Cada hallazgo enlazado a fuente pública verificable'
                : 'Every finding linked to verifiable public source'}</li>
              <li>{lang === 'es'
                ? '13,277 cruces contra el grafo de finanzas políticas verificados por motor de resolución de entidades'
                : '13,277 crosses against the political finance graph verified by entity resolution engine'}</li>
              <li>{lang === 'es'
                ? 'La inclusión no implica culpabilidad. Donde se indica "presunto", la conexión no ha sido verificada independientemente.'
                : 'Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              {lang === 'es' ? 'Fuentes de Datos (13 pipelines)' : 'Data Sources (13 pipelines)'}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span>CONTRAT.AR</span>
              <span>COMPR.AR SIPRO</span>
              <span>MapaInversiones</span>
              <span>Presupuesto Abierto</span>
              <span>Vialidad Nacional</span>
              <span>ENOHSA</span>
              <span>CABA BAC_OCDS</span>
              <span>Mendoza OCDS</span>
              <span>Banco Mundial</span>
              <span>BID</span>
              <span>Odebrecht/DOJ</span>
              <span>Siemens/SEC</span>
              <span>CIJ (Cuadernos)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
        <p className="text-sm leading-relaxed text-zinc-500">
          {t.disclaimer[lang]}
        </p>
      </section>

      {/* Closing */}
      <div className="mt-8 text-center">
        <p className="text-sm italic text-zinc-500">
          {lang === 'es'
            ? 'La investigación continúa. El grafo crece. Las preguntas permanecen.'
            : 'The investigation continues. The graph grows. The questions remain.'}
        </p>
      </div>
    </article>
  )
}
