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
}[] = [
  {
    num: 'I',
    title: {
      en: 'The Machine',
      es: 'La Maquina',
    },
    paragraphs: {
      en: [
        'Between 2019 and 2021, Argentine public works jumped from 149 to 2,740 projects — an 18-fold increase ahead of the 2023 elections. Under Milei, they collapsed to 18 — a 99% drop. Public works in Argentina is not infrastructure policy. It is a political machine.',
        'This investigation traced 56,122 entities across 7 government data sources, 3 international bribery cases, and 2 provincial procurement systems. Through CUIT tax identification matching, we connected 13,277 contractors to the broader finanzas-politicas graph — linking procurement to campaign donations, corporate officers, offshore entities, and government appointments.',
        'What the data reveals is not individual corruption but structural capture: the same companies win contracts regardless of which party governs, the same families control both the contractors and the offshore vehicles, and the regulatory bodies are staffed by the people they are supposed to regulate.',
      ],
      es: [
        'Entre 2019 y 2021, las obras publicas argentinas saltaron de 149 a 2.740 proyectos — un aumento de 18 veces antes de las elecciones de 2023. Bajo Milei, colapsaron a 18 — una caida del 99%. La obra publica en Argentina no es politica de infraestructura. Es una maquina politica.',
        'Esta investigacion rastreo 56.122 entidades a traves de 7 fuentes de datos gubernamentales, 3 casos internacionales de soborno, y 2 sistemas de contrataciones provinciales. Mediante el cruce por CUIT, conectamos 13.277 contratistas con el grafo de finanzas-politicas — vinculando contrataciones con donaciones de campana, directivos de empresas, entidades offshore, y designaciones gubernamentales.',
        'Lo que revelan los datos no es corrupcion individual sino captura estructural: las mismas empresas ganan contratos sin importar que partido gobierna, las mismas familias controlan tanto los contratistas como los vehiculos offshore, y los organismos reguladores estan integrados por las personas que deberian regular.',
      ],
    },
  },
  {
    num: 'II',
    title: {
      en: 'The Revolving Door',
      es: 'La Puerta Giratoria',
    },
    paragraphs: {
      en: [
        'Guillermo Pedro Plate was Vice President of Provincia ART — Argentina\'s largest workers\' compensation insurer, which received $1.43 billion in 23 government contracts. In January 2017, he became Vice Superintendente de Seguros de la Nacion — the #2 at the federal agency that regulates insurance companies, including the one he had just led. In December 2023, he was promoted to Superintendente — the top position. The regulator became the regulated\'s former boss.',
        'This is not a state-enterprise board appointment (we verified: Provincia ART belongs to Buenos Aires province via Banco Provincia, while the Superintendencia is a federal body under the Ministerio de Hacienda — different principals, different jurisdictions). Graph data shows that during Plate\'s tenure, Parana Seguros received favorable market entry and Liderar Seguros was allegedly shielded from inspections.',
        'Meanwhile, Pablo Clusellas — Mauricio Macri\'s childhood friend from Colegio Cardenal Newman — served as Secretario Legal y Tecnico of the Presidencia while simultaneously appearing as an officer of SACDE (formerly IECSA), the Macri family\'s construction company. SACDE was awarded the $86.7 billion Autopista RN3 contract. Angelo Calcaterra, Macri\'s cousin and SACDE\'s former president, confessed as a cooperating witness in the Odebrecht bribery case.',
      ],
      es: [
        'Guillermo Pedro Plate fue Vicepresidente de Provincia ART — la mayor aseguradora de riesgos del trabajo de Argentina, que recibio $1.430 millones en 23 contratos gubernamentales. En enero de 2017, se convirtio en Vice Superintendente de Seguros de la Nacion — el #2 de la agencia federal que regula las companias de seguros, incluyendo la que acababa de dirigir. En diciembre de 2023, fue promovido a Superintendente. El regulador se convirtio en el ex-jefe del regulado.',
        'Esto no es una designacion de directorio de empresa estatal (verificamos: Provincia ART pertenece a la provincia de Buenos Aires via Banco Provincia, mientras la Superintendencia es un organismo federal bajo el Ministerio de Hacienda — diferentes mandantes, diferentes jurisdicciones). Los datos del grafo muestran que durante la gestion de Plate, Parana Seguros recibio entrada favorable al mercado y Liderar Seguros fue presuntamente protegida de inspecciones.',
        'Mientras tanto, Pablo Clusellas — amigo de la infancia de Mauricio Macri del Colegio Cardenal Newman — fue Secretario Legal y Tecnico de la Presidencia mientras simultaneamente figuraba como directivo de SACDE (ex IECSA), la constructora de la familia Macri. SACDE fue adjudicataria del contrato de la Autopista RN3 por $86.700 millones. Angelo Calcaterra, primo de Macri y ex presidente de SACDE, confeso como arrepentido en el caso Odebrecht.',
      ],
    },
  },
  {
    num: 'III',
    title: {
      en: 'The Money Trail',
      es: 'El Rastro del Dinero',
    },
    paragraphs: {
      en: [
        'The Werthein family — the 7th richest in Argentina with a fortune estimated at $1.9 billion — controls Caja de Seguros S.A. and Experta ART, both registered as government contractors providing insurance for public works projects. Eight Werthein family members appear as officers across these companies in the graph.',
        'Through the Pandora Papers (confirmed by ICIJ), family member Dario Werthein is the beneficial owner of Canrold Overseas Limited, a BVI shell company registered through Merrill Lynch Uruguay\'s free-trade zone office. The family matriarch, Norma Gold de Werthein, is beneficiary of Hinslet Overseas Ltd — another BVI entity, incorporated in 1997 and still active after 29 years. The offshore structures are deliberately separated from the contracting entities by 5-6 hops through family relationships.',
        'Meanwhile, $703 billion ARS sits frozen in 15 mega-projects with less than 10% budget execution. The Autopista RN3 Canuelas-Azul received $86.7 billion but only 19.2% was spent. The Pavimentacion RP17 in Chubut: $12.8 billion budget, 1.4% spent, 3.29% physically built. The contractor on the RN3: SACDE — the same company linked to Clusellas and Odebrecht.',
      ],
      es: [
        'La familia Werthein — la 7ma mas rica de Argentina con una fortuna estimada en USD 1.900 millones — controla Caja de Seguros S.A. y Experta ART, ambas registradas como contratistas del Estado proveyendo seguros para proyectos de obras publicas. Ocho miembros de la familia Werthein aparecen como directivos de estas empresas en el grafo.',
        'A traves de los Pandora Papers (confirmado por ICIJ), el miembro de la familia Dario Werthein es beneficiario final de Canrold Overseas Limited, una sociedad pantalla en BVI registrada a traves de la oficina de zona franca de Merrill Lynch Uruguay. La matriarca, Norma Gold de Werthein, es beneficiaria de Hinslet Overseas Ltd — otra entidad BVI, constituida en 1997 y aun activa tras 29 anos. Las estructuras offshore estan deliberadamente separadas de las entidades contratantes por 5-6 saltos a traves de relaciones familiares.',
        'Mientras tanto, $703.000 millones ARS permanecen congelados en 15 megaproyectos con menos de 10% de ejecucion presupuestaria. La Autopista RN3 Canuelas-Azul recibio $86.700 millones pero solo se gasto el 19,2%. La Pavimentacion RP17 en Chubut: presupuesto de $12.800 millones, 1,4% gastado, 3,29% construido fisicamente. El contratista de la RN3: SACDE — la misma empresa vinculada a Clusellas y Odebrecht.',
      ],
    },
  },
  {
    num: 'IV',
    title: {
      en: 'The Evidence Problem',
      es: 'El Problema de la Evidencia',
    },
    paragraphs: {
      en: [
        'The Cuadernos de las Coimas — Argentina\'s biggest corruption case, currently on trial with 87 defendants — is built on compromised evidence. A Gendarmeria forensic report (August 2025, 312 pages) confirmed that while Oscar Centeno wrote the base text of the notebooks, 1,500+ alterations were made by 2-4 other hands. Former police officer Jorge Bacigalupo was charged in November 2025 with specifically crossing out real names and writing different ones to implicate other individuals.',
        'One notebook (#5, covering April 2009 to May 2010) is permanently lost. The originals were unaccounted for over 18 months before reappearing from an unidentified source four days before the 2019 presidential elections. Centeno himself lied about burning the originals, has a psychiatric history (1989 grenade incident), and refused to testify at trial on March 19, 2026. His 1980 military connection to the Stornelli family — prosecutor Carlos Stornelli\'s father organized his training course — predates the investigation by 38 years.',
        'Of the 9 top contractors named as Cuadernos defendants, only 2 (SACDE and CPC) have robust independent evidence through DOJ filings and AFIP investigations. Four contractors depend entirely on the compromised notebook testimony. Our investigation downgraded Cuadernos-dependent claims to bronze tier (confidence 0.35) and now requires independent corroboration before treating any notebook-specific claim as verified.',
      ],
      es: [
        'Los Cuadernos de las Coimas — la mayor causa de corrupcion de Argentina, actualmente en juicio oral con 87 imputados — esta construida sobre evidencia comprometida. Un informe pericial de Gendarmeria (agosto 2025, 312 paginas) confirmo que mientras Oscar Centeno escribio el texto base de los cuadernos, 1.500+ alteraciones fueron realizadas por 2 a 4 manos diferentes. El ex policia Jorge Bacigalupo fue procesado en noviembre de 2025 por tachar nombres reales y escribir otros para implicar a diferentes personas.',
        'Un cuaderno (#5, que cubria abril 2009 a mayo 2010) esta permanentemente perdido. Los originales estuvieron sin custodia por mas de 18 meses antes de reaparecer de una fuente no identificada cuatro dias antes de las elecciones presidenciales de 2019. El propio Centeno mintio sobre haber quemado los originales, tiene antecedentes psiquiatricos (incidente con granada de 1989), y se nego a declarar en el juicio el 19 de marzo de 2026. Su conexion militar de 1980 con la familia Stornelli — el padre del fiscal Carlos Stornelli organizo su curso de instruccion — precede a la investigacion por 38 anos.',
        'De los 9 principales contratistas nombrados como imputados de Cuadernos, solo 2 (SACDE y CPC) tienen evidencia independiente robusta a traves de expedientes del DOJ e investigaciones de AFIP. Cuatro contratistas dependen enteramente del testimonio comprometido de los cuadernos. Nuestra investigacion degradoa las afirmaciones dependientes de Cuadernos a nivel bronce (confianza 0,35) y ahora requiere corroboracion independiente antes de tratar cualquier afirmacion especifica de los cuadernos como verificada.',
      ],
    },
  },
  {
    num: 'V',
    title: {
      en: 'What the Data Shows',
      es: 'Lo Que Muestran los Datos',
    },
    paragraphs: {
      en: [
        '56,122 entities. 48,415 relationships. 13,277 cross-references linking public works to political finance. 30 investigation waves. 5 deep-dive verifications that eliminated 3 false positives from our own findings. This is what systematic accountability looks like — not accusations, but traceable connections.',
        'The verified findings form a clear picture: contractors who donate to both major political coalitions ($648,000 to Frente de Todos, $272,000 to Juntos por el Cambio in the 2019 election alone). A federal insurance regulator who previously ran the company he now regulates. A president\'s childhood friend on the board of the family construction company receiving billion-peso highway contracts. An offshore shell network in the British Virgin Islands connected to government insurance contractors through 5-6 layers of family relationships.',
        'What this investigation cannot do is prove intent. What it can do — and what the data does — is make the connections visible, traceable, and verifiable. Every CUIT match, every officer overlap, every offshore hop is documented in a graph database that anyone can query. The evidence is the structure itself.',
      ],
      es: [
        '56.122 entidades. 48.415 relaciones. 13.277 referencias cruzadas vinculando obras publicas con finanzas politicas. 30 olas de investigacion. 5 verificaciones profundas que eliminaron 3 falsos positivos de nuestros propios hallazgos. Esto es lo que parece la rendicion de cuentas sistematica — no acusaciones, sino conexiones rastreables.',
        'Los hallazgos verificados forman un cuadro claro: contratistas que donan a ambas coaliciones politicas principales ($648.000 al Frente de Todos, $272.000 a Juntos por el Cambio solo en la eleccion de 2019). Un regulador federal de seguros que antes dirigia la empresa que ahora regula. El amigo de la infancia de un presidente en el directorio de la constructora familiar que recibe contratos de autopistas por miles de millones. Una red de sociedades pantalla offshore en las Islas Virgenes Britanicas conectada a contratistas de seguros del gobierno a traves de 5-6 capas de relaciones familiares.',
        'Lo que esta investigacion no puede hacer es probar intencion. Lo que si puede hacer — y lo que hacen los datos — es hacer las conexiones visibles, rastreables y verificables. Cada coincidencia de CUIT, cada superposicion de directivos, cada salto offshore esta documentado en una base de datos de grafos que cualquiera puede consultar. La evidencia es la estructura misma.',
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
