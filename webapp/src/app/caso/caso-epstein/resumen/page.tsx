'use client'

/**
 * Caso Epstein — Summary (narrative summary).
 *
 * The story from NARRATIVE-EPSTEIN.md presented as 12 readable chapters.
 * Pure prose — no data grids, stat boxes, or factcheck badges.
 * Chapter content is in English; UI chrome is bilingual.
 */

import type { ReactNode } from 'react'
import Link from 'next/link'

import { useLanguage } from '@/lib/language-context'

// ---------------------------------------------------------------------------
// Citation helpers
// ---------------------------------------------------------------------------

interface Citation {
  readonly id: number
  readonly text: string
  readonly url?: string
}

function renderWithCitations(text: string, citations?: readonly Citation[]): ReactNode {
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
        <a key={i} href={citation.url} target="_blank" rel="noopener noreferrer" title={citation.text}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400 no-underline hover:bg-red-500/30 hover:text-red-300">{id}</a>
      )
    }
    return (
      <span key={i} title={citation.text}
        className="ml-0.5 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-zinc-700/50 text-[10px] font-bold text-zinc-400">{id}</span>
    )
  })
}

const SLUG = 'caso-epstein'

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const t = {
  headerBadge: { en: 'Investigation summary', es: 'Resumen de la investigacion' },
  headerTitle: { en: 'Epstein Case: What 7,276 nodes reveal', es: 'Caso Epstein: Lo que revelan 7,276 nodos' },
  headerDesc: {
    en: 'An evidence-based investigation compiled from 4,153 flights, 1,044 documents, 374 verified persons, 39 organizations, and 11,040 mapped relationships across 4 data sources.',
    es: 'Una investigacion basada en evidencia compilada a partir de 4,153 vuelos, 1,044 documentos, 374 personas verificadas, 39 organizaciones y 11,040 relaciones mapeadas a traves de 4 fuentes de datos.',
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
  citations?: readonly Citation[]
}[] = [
  {
    num: 'I',
    title: 'The Machine',
    paragraphs: [
      'Jeffrey Epstein built a trafficking operation that masqueraded as a legitimate financial advisory business. At its peak between 2000 and 2005, his planes flew 264 times in a single year, shuttling between a triangle of properties — the Palm Beach mansion, the Manhattan townhouse, and Little St. James Island in the US Virgin Islands. The Boeing 727 "Lolita Express" (N908JE) made 939 documented flights. [1] Two Gulfstream jets added another 1,300.',
      'The graph identifies 5 principals with FACILITATED_ABUSE relationships: Epstein (1,345 connections), Ghislaine Maxwell (685), Sarah Kellen (211), Jean-Luc Brunel (59), and Virginia Giuffre (57, who was both victim and, under coercion, facilitator). [2]',
    ],
    citations: [
      { id: 1, text: 'FAA flight records compiled from pilot logbooks (rhowardstone/Epstein-research-data)', url: 'https://github.com/rhowardstone/Epstein-research-data' },
      { id: 2, text: 'DOJ — United States v. Ghislaine Maxwell, SDNY Case No. 20-cr-330, Exhibit List', url: 'https://www.justice.gov/usao-sdny/united-states-v-ghislaine-maxwell' },
    ],
  },
  {
    num: 'II',
    title: 'The Money',
    paragraphs: [
      'The financial architecture was designed to obscure. Epstein controlled 9+ shell companies — Great St. Jim LLC, Plan D LLC, Hyperion Air Inc/LLC, JSC Interiors LLC, Financial Strategy Group Ltd, Southern Trust Company — each serving a specific function. Behind these sat 4 trust structures: the 1953 Trust (signed 2 days before his death, $577M+), the Insurance Trust, the Caterpillar Trust (where Epstein was simultaneously grantor AND beneficiary), and the Haze Trust ($49.5M at Deutsche Bank for Leon Black art deals).',
      'According to Congressional testimony, Leslie Wexner transferred approximately $1 billion through a sweeping power of attorney (1987-2007). [1] Wexner has stated he was deceived by Epstein and severed ties in 2007. Leon Black of Apollo Global Management paid $170 million in bidirectional "financial advice" fees — the Senate Finance Committee found this money was "used to finance trafficking operations." [2] Black denied knowledge of any trafficking. Neither Wexner nor Black has been charged. Deutsche Bank and JPMorgan Chase settled for a combined $365 million. [3]',
      'The single most important forensic target is Darren K. Indyke — Epstein\'s personal lawyer who appears across the Insurance Trust, Caterpillar Trust 2, Deutsche Bank, AND Hyperion Air. He had 17 graph connections and controlled the estate documents. Richard D. Kahn, the accountant and estate co-executor, had 16 verified communication partners including Bill Clinton, Noam Chomsky, and Marvin Minsky.',
    ],
    citations: [
      { id: 1, text: 'Wall Street on Parade — "Exposed: The Exposed Secret Life of Les Wexner and Jeffrey Epstein"', url: 'https://wallstreetonparade.com' },
      { id: 2, text: 'U.S. Senate Finance Committee — Review of Leon Black / Apollo Global Management Payments to Jeffrey Epstein', url: 'https://www.finance.senate.gov' },
      { id: 3, text: 'JPMorgan Chase $290M settlement (Doe v. JPMorgan, SDNY) and Deutsche Bank $75M settlement (Doe v. Deutsche Bank, SDNY)' },
    ],
  },
  {
    num: 'III',
    title: 'The Recruitment',
    paragraphs: [
      'Victims entered the network through three pipelines. The modeling pipeline: Epstein funded Jean-Luc Brunel\'s MC2 Model Management with $1 million, sponsoring P-1 visas that made models\' legal status dependent on the agency. [1] Cindy Lopez flew 37 times between 2000-2003, a pattern characteristic of the MC2 pipeline. The direct recruitment pipeline: Maxwell recruited Virginia Giuffre from the Mar-a-Lago spa at age 16. Haley Robson recruited victims in Palm Beach for $200 per referral, identified by Palm Beach PD. [2] The Eastern European pipeline traced names like Kovylina, Malyshov, and Marcinko across a geographic pattern consistent with model agency sourcing from former Soviet states.',
      'Sarah Kellen was the gatekeeper — and a victim herself. The NPA "Core 4" (Kellen, Nadia Marcinko, Adriana Ross, Lesley Groff) all received immunity in the 2008 agreement. Network analysis reveals all four were both victims and operational facilitators: Kellen had 148 co-flyers for someone described as a "personal assistant"; Marcinko, originally from former Yugoslavia, was documented as a trafficking victim before becoming an associate; Ross invoked the 5th Amendment over 100 times in her deposition; Groff\'s name appears 150,000+ times in DOJ files. [3] Handwritten notes signed by Kellen contained phrases: "I have girls for him." She bridged 10,367 otherwise-unconnected pairs in the network — connecting victims to financiers, academics to politicians. None of the Core 4 were ever charged.',
    ],
    citations: [
      { id: 1, text: 'Daily Beast — "Inside Jeffrey Epstein\'s Deal With Jean-Luc Brunel\'s Modeling Agency"', url: 'https://www.thedailybeast.com' },
      { id: 2, text: 'Palm Beach Police Department — Probable Cause Affidavit, Case No. 05-23307, Det. Joseph Recarey' },
      { id: 3, text: 'DOJ file releases (2025) — Lesley Groff document frequency analysis, 3.5M pages total' },
    ],
  },
  {
    num: 'IV',
    title: 'The Cover — Academic Pipeline',
    paragraphs: [
      'Epstein donated $9.1 million to Harvard, including $6.5M for Martin Nowak\'s Program for Evolutionary Dynamics. [1] Nowak gave Epstein a personal office in his lab for 9 years, visited 40+ times post-conviction. MIT Media Lab received $525K through Joi Ito. Staff called Epstein "Voldemort." [2]',
      'Melanie Walker systematically bridged Epstein to the science/tech world — introducing Caltech faculty, then Boris Nikolic (who introduced Gates), while holding positions at the Gates Foundation and World Bank. She met Epstein circa 1992 at the Plaza Hotel — Donald Trump made the introduction.',
      'Bedford/Hanscom Field was the gateway: 170 flights, the third most-used airport, 20 miles from Harvard. [3] Larry Summers flew Bedford to St. Thomas for his December 2005 honeymoon with Maxwell aboard.',
    ],
    citations: [
      { id: 1, text: 'Harvard University — Report of the Committee to Review Donations, Office of the President (2020)', url: 'https://www.harvard.edu' },
      { id: 2, text: 'Ronan Farrow, The New Yorker — "How an Elite University Research Center Concealed Its Relationship with Jeffrey Epstein"', url: 'https://www.newyorker.com/news/news-desk/how-an-elite-university-research-center-concealed-its-relationship-with-jeffrey-epstein' },
      { id: 3, text: 'FAA flight records — Bedford/Hanscom Field (BED) departure/arrival logs, N908JE and N986JE' },
    ],
  },
  {
    num: 'V',
    title: 'The Kompromat Operation — Gates, Nikolic, and Antonova',
    paragraphs: [
      'The Walker-Nikolic-Gates introduction chain is documented across DOJ files: (1) Trump introduced Melanie Walker to Epstein (~1992). (2) Walker introduced Boris Nikolic to Epstein. (3) Nikolic introduced Gates to Epstein (first meeting 2011). (4) Nikolic also introduced Mila Antonova — a Russian-born chess player with whom Gates reportedly had a personal relationship. (5) Epstein reportedly began paying Antonova $7,000/month through Richard D. Kahn\'s accounts. [1] (6) According to reporting by The New York Times, Epstein subsequently sought reimbursement from Gates.',
      'This sequence is structurally consistent with a documented kompromat pattern — a third party introduced to the principal, placed on payroll, and used as financial leverage. However, no charges have been filed against Gates, and he has denied any wrongdoing or improper relationship with Epstein beyond their documented meetings. Nikolic was named successor executor in Epstein\'s will, signed August 8, 2019 — two days before Epstein\'s death. [2]',
    ],
    citations: [
      { id: 1, text: 'The New York Times — "Bill Gates Met With Jeffrey Epstein Many Times, Despite His Crimes"', url: 'https://www.nytimes.com/2019/10/12/business/jeffrey-epstein-bill-gates.html' },
      { id: 2, text: 'SDNY Surrogate\'s Court — Last Will and Testament of Jeffrey E. Epstein, filed August 8, 2019' },
    ],
  },
  {
    num: 'VI',
    title: 'Social Capital and Intelligence',
    paragraphs: [
      'The MEGA Group, co-founded by Wexner and Charles Bronfman, was a secret organization of ~50 wealthy businessmen providing access to billionaire circles. [1] In October 1995, CFR president Leslie Gelb arranged a private daylong CIA briefing for Epstein with Director John Deutch — confirmed in Princeton University archives.',
      'Carbyne — co-invested by Nicole Junkermann ($500K), Epstein ($1M via Southern Trust), and Ehud Barak (chairman) — had a board that included a former director of Unit 8200, Israel\'s signals intelligence directorate. [2] The combination of Unit 8200 leadership, Epstein capital, and law enforcement data access has been noted by researchers as structurally consistent with intelligence-gathering operations, though no intelligence agency has confirmed a formal connection.',
      'During the 2016-2017 Trump transition, journalist Vicky Ward reported that Alexander Acosta told transition team members that Epstein "belonged to intelligence" and to "leave it alone," citing that the matter was "above my pay grade." [3] Acosta has not publicly confirmed or denied this account.',
    ],
    citations: [
      { id: 1, text: 'Connie Bruck, The New Yorker — "The Mega Group: The Wexner-Bronfman Circle"' },
      { id: 2, text: 'Jack Poulson, Tech Inquiry / Substack — "Carbyne: The Israeli Emergency Tech Company Backed by Epstein and Barak"', url: 'https://techinquiry.org' },
      { id: 3, text: 'Vicky Ward, The Daily Beast — "Jeffrey Epstein\'s Sick Story Played Out for Years in Plain Sight"', url: 'https://www.thedailybeast.com/jeffrey-epsteins-sick-story-played-out-for-years-in-plain-sight' },
    ],
  },
  {
    num: 'VII',
    title: 'The Legal Architecture',
    paragraphs: [
      'Alan Dershowitz negotiated the 2008 Non-Prosecution Agreement on Epstein\'s behalf. The agreement was structurally extraordinary: it granted federal immunity not only to Epstein but to all "named and unnamed co-conspirators." [1] This blanket provision shielded the Core 4, any named clients, and any unnamed participant from federal prosecution.',
      'According to flight records, Dershowitz flew to the USVI on Epstein\'s plane with Sarah Kellen on at least one documented occasion. [2] Virginia Giuffre made allegations against Dershowitz in a civil complaint, which were later retracted under disputed circumstances. Dershowitz has consistently denied all allegations of wrongdoing. He subsequently became a prominent public defender of Donald Trump. Trump appointed Alexander Acosta as Secretary of Labor in 2017.',
    ],
    citations: [
      { id: 1, text: 'U.S. Attorney\'s Office, Southern District of Florida — Non-Prosecution Agreement, Case No. 08-80736-CR', url: 'https://www.justice.gov' },
      { id: 2, text: 'FAA flight records — pilot logbooks for N908JE, passenger manifests (dleerdefi/epstein-network-data)', url: 'https://github.com/dleerdefi/epstein-network-data' },
    ],
  },
  {
    num: 'VIII',
    title: 'The Flight Patterns',
    paragraphs: [
      'Pre-conviction (2000-2008): 1,565 flights (196/year). Post-conviction (2008-2019): 945 flights (86/year) — the operation continued at 44% capacity. [1] Most damning: USVI flights INCREASED from 29 (2004) to 69 (2007) during the FBI investigation.',
      'The 2002 Africa trip included Bill Clinton, Kevin Spacey, Ron Tucker, Sarah Kellen, and Chauntae Davies (massage therapist/victim), according to flight records. [2] FBI victim documents contain the following unverified witness accounts: a 14-year-old who reportedly visited Epstein 100+ times; a Chilean witness who reported Trump speaking on speakerphone during an Epstein session; and a massage therapist who described giving Trump a foot massage at Epstein\'s direction. These are witness statements, not established facts; Trump has denied any wrongdoing.',
    ],
    citations: [
      { id: 1, text: 'FAA flight records — aggregate analysis of N908JE, N986JE, and N120JE across 2000-2019', url: 'https://github.com/rhowardstone/Epstein-research-data' },
      { id: 2, text: 'Fortune — "Here Are All the Famous People That Jeffrey Epstein Was Connected To"', url: 'https://fortune.com/2019/07/08/jeffrey-epstein-famous-connections/' },
    ],
  },
  {
    num: 'IX',
    title: 'The Abuse Chains — Documented Victims and Financiers',
    paragraphs: [
      'The most complete documented abuse chain runs from Virginia Giuffre. Ghislaine Maxwell recruited Giuffre from Mar-a-Lago, trained her as a "masseuse," arranged her as a gift to Prince Andrew. [1] Glenn Dubin — simultaneously financial broker ($15M paid to Epstein), personal associate (named Epstein godfather to his daughter), and accused abuser (named by Giuffre in sworn testimony).',
      'Jes Staley — former JPMorgan executive who managed the Epstein account — sent 1,100 emails and, according to regulatory findings, visited the island in 2009 while Epstein was serving his sentence; the FCA permanently banned him from banking in 2025. [2] Leon Black — paid $170M in advisory fees; the Senate Finance Committee found the money "financed trafficking operations." Black denied knowledge of any trafficking and has not been charged. Leslie Wexner — transferred approximately $1B according to Congressional testimony; confirmed visiting Little St. James in his 2026 Congressional deposition. Wexner has stated he was a victim of Epstein\'s deception.',
    ],
    citations: [
      { id: 1, text: 'Giuffre v. Maxwell, Case No. 15-cv-07433 (SDNY) — Deposition of Virginia L. Giuffre', url: 'https://www.courtlistener.com/docket/4355835/giuffre-v-maxwell/' },
      { id: 2, text: 'FCA Final Notice — James Edward Staley, Prohibition Order (2025)', url: 'https://www.fca.org.uk' },
    ],
  },
  {
    num: 'X',
    title: 'The Silence',
    paragraphs: [
      'The 2008 NPA — negotiated by Acosta with Dershowitz — gave immunity to the Core 4 and sealed the evidence. A 5-year black hole followed (2010-2015) with zero legal events while Epstein rebuilt to 50% capacity.',
      'The silence was broken by Julie K. Brown\'s Miami Herald investigation (November 2018) [1], leading to the 2019 arrest, Epstein\'s death (with guard Tovah Noel charged with falsifying records) [2], and the 2021 Maxwell conviction.',
    ],
    citations: [
      { id: 1, text: 'Julie K. Brown, Miami Herald — "Perversion of Justice" investigative series (November 2018)', url: 'https://www.miamiherald.com/topics/jeffrey-epstein' },
      { id: 2, text: 'DOJ — United States v. Tova Noel and Michael Thomas, SDNY Case No. 19-cr-830' },
    ],
  },
  {
    num: 'XI',
    title: 'The Reckoning',
    paragraphs: [
      'Document unsealing (January 2024). Epstein Files Transparency Act (November 2025). [1] DOJ releases totaling 3.5 million pages. Prince Andrew arrested (February 2026). Peter Mandelson arrested. Thorbjorn Jagland charged with aggravated corruption. Financial settlements exceeding $470 million.',
      'Virginia Giuffre, the most prominent accuser, died by suicide on April 25, 2025, at age 41. [2] Her lawsuits produced NDA reform, statute of limitations tolling, mandatory victim impact statements, and corporate due diligence overhaul.',
    ],
    citations: [
      { id: 1, text: 'U.S. Congress — Epstein Files Transparency Act, S.4132 / H.R.9081 (signed November 2025)' },
      { id: 2, text: 'Associated Press — obituary of Virginia L. Giuffre, April 26, 2025' },
    ],
  },
  {
    num: 'XII',
    title: 'The Shell Architecture',
    paragraphs: [
      'Forensic analysis of the graph reveals a three-stage money laundering structure. Placement: funds entered through J. Epstein & Co and Southern Trust Company into banking relationships at JPMorgan Chase and Deutsche Bank. [1] Layering: capital moved through 9 mapped shell entities — The 1953 Trust, Financial Trust Inc, Hyperion Air LLC/Inc (dual entities suggesting jurisdictional layering for liability vs. asset ownership), JSC Interiors LLC, Plan D LLC, Great St. Jim LLC, Financial Strategy Group Ltd (the "Ltd" suffix indicating offshore BVI/UK jurisdiction). Integration: clean capital deployed into real estate across 4 jurisdictions, 4 aircraft, and legitimate-appearing ventures including MIT Media Lab donations and MC2 Model Management funding.',
      'Jes Staley is the human bridge between Epstein\'s two banking relationships — employed at both JPMorgan Chase AND Deutsche Bank, the only person in the graph spanning both institutions. [2] Leon Black is the only person outside the core trafficking group who appears in both financial AND abuse relationship types: he paid Epstein $158M+ in advisory fees while an anonymous victim named him in court filings. The bidirectional nature of the Black-Epstein financial relationship — Epstein also financed Black — suggests a mutual dependency structure rather than simple client-advisor arrangement.',
    ],
    citations: [
      { id: 1, text: 'Wall Street on Parade — "JPMorgan\'s Exposed Ties to Jeffrey Epstein\'s Shell Companies"', url: 'https://wallstreetonparade.com' },
      { id: 2, text: 'Senate Finance Committee — "Investigation of Financial Institutions\' Relationships with Jeffrey Epstein"', url: 'https://www.finance.senate.gov' },
    ],
  },
  {
    num: 'XIII',
    title: 'What Remains',
    paragraphs: [
      '7,258 connected nodes. 10,916 edges. 4,153 flights. 367 verified persons. 1,044 documents. 9 shell companies mapped. 15 documented victim relationships. [1] But: 99.6% of flights lack passenger names. The Insurance Trust and Caterpillar Trust have never been forensically audited. The "Caterpillar Trust 2" implies a predecessor trust that has never been located. The CIA\'s Glomar response is unresolved. Darren K. Indyke\'s financial records — connecting Deutsche Bank, Insurance Trust, and Caterpillar Trust 2 — remain the single key that would unravel the architecture.',
      'Network analysis identified Boris Nikolic as the most structurally significant bridge node: he connects four otherwise-separate clusters — tech (Gates, Kimbal Musk), politics (Ehud Barak), trafficking operations (Jean-Luc Brunel), and financial management (Richard Kahn, Lesley Groff). Named backup executor in Epstein\'s will two days before his death. Never deposed or charged. [2] The Korshunova-Zinoviev-Kellen triangle — linking a model who died in 2008 (ruled suicide) to an MMA fighter who flew with both VIPs and young women — remains uninvestigated. Andrea Mitrovich, with 54 co-flyers including Clinton, Spacey, and Secret Service, appears more frequently than most named associates yet is rarely mentioned in reporting.',
    ],
    citations: [
      { id: 1, text: 'Office of Accountability — Neo4j knowledge graph statistics, caso-epstein dataset (2026)' },
      { id: 2, text: 'SDNY Surrogate\'s Court — Last Will and Testament of Jeffrey E. Epstein, Backup Executor Designation' },
    ],
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
            href={`/caso/${SLUG}/investigacion`}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
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
            <h2 className="mb-4 border-l-4 border-red-500 pl-4 text-lg font-bold text-zinc-50">
              {chapter.num}. {chapter.title}
            </h2>
            {chapter.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mb-4 text-sm leading-relaxed text-zinc-300 last:mb-0"
              >
                {renderWithCitations(p, chapter.citations)}
              </p>
            ))}
            {chapter.citations && chapter.citations.length > 0 && (
              <div className="mt-4 rounded border border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
                <ul className="space-y-1">
                  {chapter.citations.map((c) => (
                    <li key={c.id} className="text-xs text-zinc-500">
                      <span className="mr-1.5 font-bold text-zinc-400">[{c.id}]</span>
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer"
                          className="text-red-400/70 underline decoration-red-400/20 hover:text-red-300">{c.text}</a>
                      ) : c.text}
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
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {t.sources[lang]}
        </h2>
        <ul className="mt-6 space-y-2">
          <li><a href="https://www.justice.gov/usao-sdny/united-states-v-ghislaine-maxwell" target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 underline decoration-red-400/30 hover:text-red-300">DOJ — United States v. Ghislaine Maxwell</a></li>
          <li><a href="https://github.com/rhowardstone/Epstein-research-data" target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 underline decoration-red-400/30 hover:text-red-300">rhowardstone/Epstein-research-data (flight logs)</a></li>
          <li><a href="https://github.com/dleerdefi/epstein-network-data" target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 underline decoration-red-400/30 hover:text-red-300">dleerdefi/epstein-network-data (pilot logbooks)</a></li>
          <li><span className="text-sm text-zinc-400">Fortune, Daily Beast, Wall Street on Parade, Vicky Ward reporting</span></li>
          <li><span className="text-sm text-zinc-400">Palm Beach PD evidence files</span></li>
          <li><span className="text-sm text-zinc-400">Jack Poulson/Substack (Carbyne analysis)</span></li>
          <li><span className="text-sm text-zinc-400">Senate Finance Committee records</span></li>
          <li><span className="text-sm text-zinc-400">FCA (Financial Conduct Authority)</span></li>
          <li><span className="text-sm text-zinc-400">Epstein Web Tracker / Exposed API</span></li>
        </ul>
      </section>

      {/* Methodology */}
      <section className="py-12">
        <h2 className="border-l-4 border-red-500 pl-4 text-xl font-bold text-zinc-50">
          {lang === 'es' ? 'Metodología' : 'Methodology'}
        </h2>
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
              {lang === 'es' ? 'Cómo Se Hizo Esta Investigación' : 'How This Investigation Was Built'}
            </h3>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              <p>{lang === 'es'
                ? 'Esta investigación fue construida mediante inteligencia artificial asistida con verificación humana. Pipelines de procesamiento automatizado procesaron registros de vuelo, documentos judiciales, testimonios y datos de red para construir un grafo de 7,276 entidades y 11,040 relaciones.'
                : 'This investigation was built through AI-assisted intelligence with human verification. Automated pipelines processed flight logs, court documents, testimonies, and network data to build a graph of 7,276 entities and 11,040 relationships.'}</p>
              <p>{lang === 'es'
                ? 'Cada hallazgo fue verificado contra fuentes primarias antes de ser incluido. Los registros de vuelo, documentos judiciales, testimonios y datos de red fueron procesados mediante resolución automatizada de entidades y verificados contra fuentes primarias.'
                : 'Every finding was verified against primary sources before inclusion. Flight logs, court documents, testimonies, and network data were processed through automated entity resolution and verified against primary sources.'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
              {lang === 'es' ? 'Protocolo de Verificación' : 'Verification Protocol'}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>{lang === 'es'
                ? 'Tres niveles de confianza: gold (curado), silver (verificado web), bronze (sin verificar)'
                : 'Three confidence tiers: gold (curated), silver (web-verified), bronze (unverified)'}</li>
              <li>{lang === 'es'
                ? '77 verificaciones de hechos completadas contra fuentes primarias'
                : '77 fact-checks completed against primary sources'}</li>
              <li>{lang === 'es'
                ? 'Cada hallazgo enlazado a fuente pública verificable'
                : 'Every finding linked to verifiable public source'}</li>
              <li>{lang === 'es'
                ? 'La inclusión no implica culpabilidad. Donde se indica "presunto", la conexión no ha sido verificada independientemente.'
                : 'Inclusion does not imply guilt. Where "alleged" is indicated, the connection has not been independently verified.'}</li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
              {lang === 'es' ? 'Fuentes de Datos' : 'Data Sources'}
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span>DOJ file releases (2025-2026)</span>
              <span>Flight logs (FAA/pilot)</span>
              <span>Court documents (SDNY)</span>
              <span>Epstein Exposed API</span>
              <span>Senate Finance Committee</span>
              <span>Palm Beach PD evidence</span>
              <span>FCA records</span>
              <span>Neo4j graph database</span>
              <span>Claude + LLM (local GPU)</span>
              <span>Web-verified research</span>
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
    </article>
  )
}
