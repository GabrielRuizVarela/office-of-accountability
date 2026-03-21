'use client'

/**
 * Caso Epstein — Summary content (narrative summary).
 *
 * The story from NARRATIVE-EPSTEIN.md presented as 12 readable chapters.
 * Pure prose — no data grids, stat boxes, or factcheck badges.
 * Chapter content is in English; UI chrome is bilingual.
 */

import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Investigation summary', es: 'Resumen de la investigacion' },
  headerTitle: { en: 'Epstein Case: What 10,908 nodes reveal', es: 'Caso Epstein: Lo que revelan 10,908 nodos' },
  headerDesc: {
    en: 'An evidence-based investigation compiled from 4,153 flights, 1,044 documents, 350+ verified persons, and 31 organizations across 4 data sources.',
    es: 'Una investigacion basada en evidencia compilada a partir de 4,153 vuelos, 1,044 documentos, 350+ personas verificadas y 31 organizaciones a traves de 4 fuentes de datos.',
  },
  viewData: { en: 'View data & evidence', es: 'Ver datos y evidencia' },
  timeline: { en: 'Timeline', es: 'Cronologia' },
  sources: { en: 'Sources', es: 'Fuentes' },
  disclaimer: {
    en: 'This investigation is based on verified public sources, including court documents, flight records, parliamentary reports, knowledge graph analysis, and investigative journalism. It does not constitute legal advice. Inclusion of a person does not imply guilt. Where \u201calleged\u201d or \u201cunder investigation\u201d is indicated, the claim has not been independently confirmed.',
    es: 'Esta investigacion se basa en fuentes publicas verificadas, incluyendo documentos judiciales, registros de vuelo, informes parlamentarios, analisis de grafos de conocimiento y periodismo de investigacion. No constituye asesoramiento legal. La inclusion de una persona no implica culpabilidad. Donde se indica \u201calegado\u201d o \u201cen investigacion,\u201d la afirmacion no ha sido confirmada de forma independiente.',
  },
  navOverview: { en: '\u2190 Overview', es: '\u2190 Inicio' },
  navData: { en: 'Data & evidence \u2192', es: 'Datos y evidencia \u2192' },
} as const

// ---------------------------------------------------------------------------
// Chapters — adapted from NARRATIVE-EPSTEIN.md
// ---------------------------------------------------------------------------

const CHAPTERS: {
  num: string
  title: string
  paragraphs: string[]
}[] = [
  {
    num: 'I',
    title: 'The Machine',
    paragraphs: [
      'Jeffrey Epstein built a trafficking operation that masqueraded as a legitimate financial advisory business. At its peak between 2000 and 2005, his planes flew 264 times in a single year, shuttling between a triangle of properties — the Palm Beach mansion, the Manhattan townhouse, and Little St. James Island in the US Virgin Islands. The Boeing 727 "Lolita Express" (N908JE) made 939 documented flights. Two Gulfstream jets added another 1,300.',
      'The operation was not a one-man show. The graph identifies 5 principals with FACILITATED_ABUSE relationships: Epstein (1,345 connections), Ghislaine Maxwell (685), Sarah Kellen (211), Jean-Luc Brunel (59), and Virginia Giuffre (57, who was both victim and, under coercion, facilitator). Below them, a staff of pilots, schedulers, and property managers kept the infrastructure running.',
    ],
  },
  {
    num: 'II',
    title: 'The Money',
    paragraphs: [
      'The financial architecture was designed to obscure. Epstein controlled 9+ shell companies — Great St. Jim LLC, Plan D LLC, Hyperion Air Inc/LLC, JSC Interiors LLC, Financial Strategy Group Ltd, Southern Trust Company — each serving a specific function. Behind these sat 4 trust firewalls: the 1953 Trust (signed 2 days before his death, $577M+), the Insurance Trust, the Caterpillar Trust (where Epstein was simultaneously grantor AND beneficiary), and the Haze Trust ($49.5M at Deutsche Bank for Leon Black art deals).',
      'Leslie Wexner transferred approximately $1 billion through a sweeping power of attorney (1987-2007). Leon Black of Apollo Global Management paid $170 million in bidirectional "financial advice" fees — the Senate found this money was "used to finance trafficking operations." Deutsche Bank and JPMorgan Chase settled for a combined $365 million.',
      'The single most important forensic target is Darren K. Indyke — Epstein\'s personal lawyer who appears across the Insurance Trust, Caterpillar Trust 2, Deutsche Bank, AND Hyperion Air. He had 17 graph connections and controlled the estate documents. Richard D. Kahn, the accountant and estate co-executor, had 16 verified communication partners including Bill Clinton, Noam Chomsky, and Marvin Minsky.',
    ],
  },
  {
    num: 'III',
    title: 'The Recruitment',
    paragraphs: [
      'Victims entered the network through three pipelines. The modeling pipeline: Epstein funded Jean-Luc Brunel\'s MC2 Model Management with $1 million, sponsoring P-1 visas that made models\' legal status dependent on the agency. The direct recruitment pipeline: Maxwell recruited Virginia Giuffre from the Mar-a-Lago spa at age 16. The Eastern European pipeline traced names like Kovylina, Malyshov, and Marcinko across a geographic pattern.',
      'Sarah Kellen was the gatekeeper. Handwritten notes signed by Kellen, recovered from the Palm Beach residence, contained phrases: "I have girls for him" and "I have 2 girls for him." Graph betweenness analysis shows she bridged 10,367 otherwise-unconnected pairs in the network — 3x more than anyone below Epstein and Maxwell. She connects 3 victims to 4 financiers AND 4 academics to 7 politicians. She was never charged.',
    ],
  },
  {
    num: 'IV',
    title: 'The Cover — Academic Pipeline',
    paragraphs: [
      'Epstein donated $9.1 million to Harvard, including $6.5M for Martin Nowak\'s Program for Evolutionary Dynamics. Nowak gave Epstein a personal office in his lab for 9 years, visited 40+ times post-conviction. MIT Media Lab received $525K through Joi Ito. Staff called Epstein "Voldemort."',
      'Melanie Walker systematically bridged Epstein to the science/tech world — introducing Caltech faculty, then Boris Nikolic (who introduced Gates), while holding positions at the Gates Foundation and World Bank. She met Epstein circa 1992 at the Plaza Hotel — Donald Trump made the introduction.',
      'Bedford/Hanscom Field was the gateway: 170 flights, the third most-used airport, 20 miles from Harvard. Larry Summers flew Bedford to St. Thomas for his December 2005 honeymoon with Maxwell aboard.',
    ],
  },
  {
    num: 'V',
    title: 'The Kompromat Operation — Gates, Nikolic, and Antonova',
    paragraphs: [
      'The Walker-Nikolic-Gates introduction chain is documented across DOJ files: (1) Trump introduced Melanie Walker to Epstein (~1992). (2) Walker introduced Boris Nikolic to Epstein. (3) Nikolic introduced Gates to Epstein (first meeting 2011). (4) Nikolic also introduced Mila Antonova — a Russian-born chess player with whom Gates was having an extramarital affair. (5) Epstein began paying Antonova $7,000/month through Richard D. Kahn\'s accounts. (6) Epstein demanded reimbursement from Gates — leveraging knowledge of a private affair as financial leverage.',
      'This constitutes a documented kompromat operation: a third party introduced to the principal, quietly placed on payroll, and used to extract money and potentially compliance. Nikolic was named successor executor in Epstein\'s will, signed August 8, 2019 — two days before Epstein\'s death.',
    ],
  },
  {
    num: 'VI',
    title: 'Social Capital and Intelligence',
    paragraphs: [
      'The MEGA Group, co-founded by Wexner and Charles Bronfman, was a secret organization of ~50 wealthy businessmen providing access to billionaire circles. In October 1995, CFR president Leslie Gelb arranged a private daylong CIA briefing for Epstein with Director John Deutch — confirmed in Princeton University archives.',
      'Carbyne — co-invested by Nicole Junkermann ($500K), Epstein ($1M via Southern Trust), and Ehud Barak (chairman) — had a board that included a former director of Unit 8200, Israel\'s signals intelligence directorate. The combination of Unit 8200 leadership, Epstein capital, and law enforcement data access is structurally consistent with a surveillance and intelligence-gathering operation.',
      'During the 2016-2017 Trump transition, Alexander Acosta reportedly told transition team members that Epstein "belonged to intelligence" and to "leave it alone," citing that the matter was "above my pay grade."',
    ],
  },
  {
    num: 'VII',
    title: 'The Legal Architecture',
    paragraphs: [
      'Alan Dershowitz negotiated the 2008 Non-Prosecution Agreement on Epstein\'s behalf. The agreement was structurally extraordinary: it granted federal immunity not only to Epstein but to all "named and unnamed co-conspirators." This blanket provision shielded the Core 4, any named clients, and any unnamed participant from federal prosecution.',
      'Dershowitz flew to the USVI on Epstein\'s plane with Sarah Kellen on at least one documented occasion. Virginia Giuffre alleged Dershowitz in a civil complaint (later retracted under disputed circumstances). He subsequently became a prominent public defender of Donald Trump. Trump appointed Alexander Acosta as Secretary of Labor in 2017.',
    ],
  },
  {
    num: 'VIII',
    title: 'The Flight Patterns',
    paragraphs: [
      'Pre-conviction (2000-2008): 1,565 flights (196/year). Post-conviction (2008-2019): 945 flights (86/year) — the operation continued at 44% capacity. Most damning: USVI flights INCREASED from 29 (2004) to 69 (2007) during the FBI investigation.',
      'The 2002 Africa trip included Bill Clinton, Kevin Spacey, Ron Tucker, Sarah Kellen, and Chauntae Davies (massage therapist/victim). FBI victim documents describe: a 14-year-old who visited Epstein 100+ times; a Chilean witness who reported Trump speaking on speakerphone during an Epstein session; and a massage therapist who described giving Trump a foot massage at Epstein\'s direction.',
    ],
  },
  {
    num: 'IX',
    title: 'The Abuse Chains — Documented Victims and Financiers',
    paragraphs: [
      'The most complete documented abuse chain runs from Virginia Giuffre. Ghislaine Maxwell recruited Giuffre from Mar-a-Lago, trained her as a "masseuse," arranged her as a gift to Prince Andrew. Glenn Dubin — triple-layer node: paid Epstein $15M as a financial broker, named Epstein godfather to his daughter, and Giuffre named him in sworn testimony as an abuser.',
      'Jes Staley — JPMorgan executive who managed the Epstein account, sent 1,100 emails, visited the island in 2009 while Epstein was serving his sentence; FCA permanently banned from banking in 2025. Leon Black — paid $170M; Senate found the money "financed trafficking operations." Leslie Wexner — transferred ~$1B; confirmed visiting Little St. James in his 2026 Congressional deposition.',
    ],
  },
  {
    num: 'X',
    title: 'The Silence',
    paragraphs: [
      'The 2008 NPA — negotiated by Acosta with Dershowitz — gave immunity to the Core 4 and sealed the evidence. A 5-year black hole followed (2010-2015) with zero legal events while Epstein rebuilt to 50% capacity.',
      'The silence was broken by Julie K. Brown\'s Miami Herald investigation (November 2018), leading to the 2019 arrest, Epstein\'s death (with guard Tovah Noel charged with falsifying records), and the 2021 Maxwell conviction.',
    ],
  },
  {
    num: 'XI',
    title: 'The Reckoning',
    paragraphs: [
      'Document unsealing (January 2024). Epstein Files Transparency Act (November 2025). DOJ releases totaling 3.5 million pages. Prince Andrew arrested (February 2026). Peter Mandelson arrested. Thorbjorn Jagland charged with aggravated corruption. Financial settlements exceeding $470 million.',
      'Virginia Giuffre, the most prominent accuser, died by suicide on April 25, 2025, at age 41. She had achieved more systemic change than the entire justice system combined: NDA reform, statute of limitations tolling, mandatory victim impact statements, and corporate due diligence overhaul.',
    ],
  },
  {
    num: 'XII',
    title: 'What Remains',
    paragraphs: [
      '7,287 connected nodes. 21,944 edges. 4,153 flights. 350+ verified persons. 1,044 documents. But: 99.6% of flights lack passenger names. The Insurance Trust and Caterpillar Trust have never been forensically audited. The CIA\'s Glomar response is unresolved. 20+ high-profile persons need relationship enrichment. Darren K. Indyke\'s financial records are the single key that would unravel the architecture.',
      'Boris Nikolic remains the most significant uncharged architect: named executor, kompromat chain intermediary, Gates bridge, and biotech investor across post-Epstein ventures. He has never been deposed or charged. The investigation continues.',
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EpsteinResumenContent({ slug }: { readonly slug: string }) {
  const { lang } = useLanguage()
  const basePath = `/caso/${slug}`

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header className="mb-12 border-b border-zinc-800 pb-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-red-400">
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
            href={`${basePath}/investigacion`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            {t.viewData[lang]}
          </Link>
          <Link
            href={`${basePath}/cronologia`}
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
            <h2 className="mb-4 border-l-4 border-red-500 pl-4 text-lg font-bold text-zinc-50">
              {chapter.num}. {chapter.title}
            </h2>
            {chapter.paragraphs.map((p, i) => (
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
          Compiled from: rhowardstone/Epstein-research-data (DOJ flight logs), Epstein
          Exposed API, dleerdefi/epstein-network-data (handwritten pilot logbooks), manual
          curation, and web-verified research. Sources include DOJ file releases
          (2025-2026), Fortune, Daily Beast, Wall Street on Parade, Vicky Ward reporting,
          Palm Beach PD evidence, Jack Poulson/Substack (Carbyne), Epstein Web Tracker,
          Senate Finance Committee, FCA. Graph database: Neo4j. Analysis: Claude + Qwen
          3.5 9B (local GPU).
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
          href={basePath}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navOverview[lang]}
        </Link>
        <Link
          href={`${basePath}/investigacion`}
          className="flex-1 rounded-lg border border-zinc-700 p-4 text-center text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {t.navData[lang]}
        </Link>
      </nav>
    </article>
  )
}
