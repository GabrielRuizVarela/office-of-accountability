/**
 * Seed script — creates the Caso Epstein investigation graph.
 * Run with: npx tsx scripts/seed-caso-epstein.ts
 *
 * Creates Person, Location, Event, Document, Organization, and LegalCase
 * nodes along with their relationships. All nodes are scoped with
 * caso_slug: 'caso-epstein'. Uses MERGE for idempotency — safe to re-run.
 *
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-epstein'

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const persons = [
  { id: 'ep-jeffrey-epstein', name: 'Jeffrey Epstein', slug: 'jeffrey-epstein', role: 'Financier, convicted sex offender', description: 'American financier and convicted sex offender who ran an extensive trafficking network. Found dead in his cell at Metropolitan Correctional Center in August 2019.', nationality: 'American' },
  { id: 'ep-ghislaine-maxwell', name: 'Ghislaine Maxwell', slug: 'ghislaine-maxwell', role: 'Socialite, convicted sex trafficker', description: 'British socialite convicted in December 2021 on five federal charges of sex trafficking. Sentenced to 20 years in prison.', nationality: 'British' },
  { id: 'ep-leslie-wexner', name: 'Leslie Wexner', slug: 'leslie-wexner', role: 'CEO, L Brands', description: 'Billionaire businessman, founder of L Brands. Epstein\'s largest known client who granted him sweeping power over his finances.', nationality: 'American' },
  { id: 'ep-alan-dershowitz', name: 'Alan Dershowitz', slug: 'alan-dershowitz', role: 'Attorney', description: 'Harvard Law professor and attorney named in depositions. Represented Epstein during the 2008 plea deal negotiations.', nationality: 'American' },
  { id: 'ep-prince-andrew', name: 'Prince Andrew', slug: 'prince-andrew', role: 'Duke of York', description: 'Member of British royal family named in Virginia Giuffre lawsuit. Settled civil case in February 2022.', nationality: 'British' },
  { id: 'ep-bill-clinton', name: 'Bill Clinton', slug: 'bill-clinton', role: 'Former US President', description: '42nd President of the United States. Appeared on Epstein flight logs multiple times.', nationality: 'American' },
  { id: 'ep-jean-luc-brunel', name: 'Jean-Luc Brunel', slug: 'jean-luc-brunel', role: 'Modeling agent', description: 'French modeling agent who ran MC2 Model Management. Found dead in his Paris prison cell in February 2022 while awaiting trial.', nationality: 'French' },
  { id: 'ep-sarah-kellen', name: 'Sarah Kellen', slug: 'sarah-kellen', role: 'Epstein assistant', description: 'Personal assistant to Jeffrey Epstein, named as a potential co-conspirator in the 2008 non-prosecution agreement.', nationality: 'American' },
  { id: 'ep-nadia-marcinko', name: 'Nadia Marcinko', slug: 'nadia-marcinko', role: 'Alleged victim turned associate', description: 'Originally from the former Yugoslavia, identified as both a victim and later an associate of Epstein.', nationality: 'Yugoslav' },
  { id: 'ep-virginia-giuffre', name: 'Virginia Giuffre', slug: 'virginia-giuffre', role: 'Key accuser', description: 'Primary accuser who filed multiple civil lawsuits against Epstein associates. Her depositions and testimony were central to multiple cases.', nationality: 'American' },
  { id: 'ep-larry-visoski', name: 'Larry Visoski', slug: 'larry-visoski', role: 'Chief pilot', description: 'Epstein\'s chief pilot who flew the Boeing 727 ("Lolita Express"). Testified at the Maxwell trial.', nationality: 'American' },
  { id: 'ep-david-copperfield', name: 'David Copperfield', slug: 'david-copperfield', role: 'Entertainer', description: 'Illusionist named in Epstein flight logs and address book.', nationality: 'American' },
  { id: 'ep-jes-staley', name: 'Jes Staley', slug: 'jes-staley', role: 'JPMorgan executive', description: 'Former CEO of Barclays and senior JPMorgan executive who maintained a close relationship with Epstein over many years.', nationality: 'American' },
  { id: 'ep-leon-black', name: 'Leon Black', slug: 'leon-black', role: 'Apollo Global co-founder', description: 'Co-founder of Apollo Global Management who paid Epstein approximately $158 million for financial advice and tax services.', nationality: 'American' },
  { id: 'ep-donald-trump', name: 'Donald Trump', slug: 'donald-trump', role: 'Real estate developer, politician', description: 'Real estate developer and later 45th US President. Named in early social connections with Epstein in Palm Beach.', nationality: 'American' },
]

const locations = [
  { id: 'ep-little-st-james', name: 'Little St. James Island', slug: 'little-st-james', location_type: 'island', address: 'Little St. James, U.S. Virgin Islands', coordinates: '18.2969,-64.8256' },
  { id: 'ep-zorro-ranch', name: 'Zorro Ranch', slug: 'zorro-ranch', location_type: 'ranch', address: 'Stanley, New Mexico', coordinates: '35.1469,-105.9628' },
  { id: 'ep-nyc-townhouse', name: '9 East 71st Street Townhouse', slug: 'nyc-townhouse', location_type: 'property', address: '9 East 71st Street, New York, NY', coordinates: '40.7713,-73.9654' },
  { id: 'ep-palm-beach-mansion', name: 'Palm Beach Mansion', slug: 'palm-beach-mansion', location_type: 'property', address: '358 El Brillo Way, Palm Beach, FL', coordinates: '26.7056,-80.0364' },
  { id: 'ep-paris-apartment', name: 'Paris Apartment', slug: 'paris-apartment', location_type: 'apartment', address: 'Avenue Foch, Paris, France', coordinates: '48.8738,2.2870' },
  { id: 'ep-columbus-oh', name: 'Columbus, Ohio', slug: 'columbus-oh', location_type: 'office', address: 'Columbus, OH (Wexner connection)', coordinates: '39.9612,-82.9988' },
]

const events = [
  { id: 'ep-evt-pb-investigation', title: 'Palm Beach Police investigation begins', date: '2005-03-01', event_type: 'legal', description: 'Palm Beach Police Department begins investigation into Jeffrey Epstein following complaints from parents of teenage girls.' },
  { id: 'ep-evt-fbi-investigation', title: 'FBI investigation launched', date: '2006-05-01', event_type: 'legal', description: 'Federal Bureau of Investigation launches investigation into Epstein\'s activities across multiple states.' },
  { id: 'ep-evt-grand-jury', title: 'Grand jury indictment (Florida)', date: '2007-06-01', event_type: 'legal', description: 'Florida grand jury returns indictment, but federal prosecutors negotiate plea deal instead of pursuing federal charges.' },
  { id: 'ep-evt-npa', title: 'Non-prosecution agreement signed', date: '2008-06-30', event_type: 'legal', description: 'US Attorney Alexander Acosta signs controversial non-prosecution agreement granting immunity to Epstein\'s co-conspirators.' },
  { id: 'ep-evt-guilty-plea', title: 'Epstein pleads guilty to state charges', date: '2008-06-30', event_type: 'legal', description: 'Epstein pleads guilty to Florida state charges of soliciting prostitution from a minor. Sentenced to 18 months, served 13 months with work release.' },
  { id: 'ep-evt-sex-offender', title: 'Epstein registers as sex offender', date: '2010-01-01', event_type: 'legal', description: 'After release, Epstein registers as a Level 3 (high risk) sex offender in New York and as a sex offender in the US Virgin Islands.' },
  { id: 'ep-evt-giuffre-v-maxwell', title: 'Giuffre v. Maxwell filed', date: '2015-01-01', event_type: 'legal', description: 'Virginia Giuffre files defamation lawsuit against Ghislaine Maxwell in the Southern District of New York.' },
  { id: 'ep-evt-miami-herald', title: 'Miami Herald "Perversion of Justice" published', date: '2018-11-28', event_type: 'media', description: 'Julie K. Brown publishes groundbreaking investigation in the Miami Herald, exposing the 2008 plea deal and identifying over 80 victims.' },
  { id: 'ep-evt-arrest', title: 'Epstein arrested at Teterboro Airport', date: '2019-07-06', event_type: 'arrest', description: 'Jeffrey Epstein arrested by FBI-NYPD Crimes Against Children Task Force upon landing at Teterboro Airport, New Jersey.' },
  { id: 'ep-evt-indictment', title: 'SDNY indictment unsealed', date: '2019-07-08', event_type: 'legal', description: 'Federal indictment unsealed in the Southern District of New York charging Epstein with sex trafficking of minors and conspiracy.' },
  { id: 'ep-evt-death', title: 'Epstein found dead in MCC cell', date: '2019-08-10', event_type: 'death', description: 'Jeffrey Epstein found unresponsive in his cell at the Metropolitan Correctional Center in Manhattan. Pronounced dead at New York Presbyterian-Lower Manhattan Hospital.' },
  { id: 'ep-evt-autopsy', title: 'Medical examiner rules suicide', date: '2019-08-16', event_type: 'death', description: 'New York City Chief Medical Examiner Barbara Sampson rules Epstein\'s death a suicide by hanging. Finding disputed by Epstein\'s attorneys and independent forensic pathologist Dr. Michael Baden.' },
  { id: 'ep-evt-maxwell-arrest', title: 'Ghislaine Maxwell arrested', date: '2020-07-02', event_type: 'arrest', description: 'Ghislaine Maxwell arrested by FBI at her home in Bradford, New Hampshire, on charges of conspiracy and enticement of minors.' },
  { id: 'ep-evt-maxwell-trial', title: 'Maxwell trial begins', date: '2021-11-29', event_type: 'legal', description: 'Federal trial of Ghislaine Maxwell begins in the Southern District of New York before Judge Alison J. Nathan.' },
  { id: 'ep-evt-maxwell-verdict', title: 'Maxwell found guilty on 5 counts', date: '2021-12-29', event_type: 'legal', description: 'Jury finds Ghislaine Maxwell guilty on five of six counts, including sex trafficking of a minor.' },
  { id: 'ep-evt-maxwell-sentence', title: 'Maxwell sentenced to 20 years', date: '2022-06-28', event_type: 'legal', description: 'Judge Nathan sentences Ghislaine Maxwell to 20 years in federal prison.' },
  { id: 'ep-evt-jpmorgan-settlement', title: 'JPMorgan settles for $290M', date: '2023-06-12', event_type: 'financial', description: 'JPMorgan Chase agrees to pay $290 million to settle a class action lawsuit brought by Epstein\'s victims alleging the bank facilitated his trafficking.' },
  { id: 'ep-evt-deutsche-settlement', title: 'Deutsche Bank settles for $75M', date: '2023-05-17', event_type: 'financial', description: 'Deutsche Bank agrees to pay $75 million to settle claims it facilitated Epstein\'s sex trafficking through its banking services.' },
  { id: 'ep-evt-document-release', title: 'Epstein documents unsealed', date: '2024-01-03', event_type: 'legal', description: 'Court orders release of previously sealed documents from Giuffre v. Maxwell case, revealing names of numerous associates and details of Epstein\'s network.' },
]

const documents = [
  // ─── Original 10 documents (updated with new fields) ───────────────────
  {
    id: 'ep-doc-maxwell-transcripts',
    title: 'Maxwell Trial Transcripts',
    slug: 'maxwell-trial-transcripts',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/17318513/united-states-v-maxwell/',
    summary: 'Complete trial transcripts from USA v. Maxwell (20-cr-330) in the Southern District of New York, including witness testimony and evidence presentations.',
    date: '2021-12-29',
    key_findings: [
      'Four accusers testified about recruitment and abuse spanning 1994–2004',
      'Pilot Larry Visoski confirmed flight log procedures and passenger names',
      'Maxwell personally participated in grooming and abuse of minors',
      'Jury convicted on 5 of 6 counts including sex trafficking of a minor',
    ],
    excerpt: 'The defendant, Ghislaine Maxwell, personally participated in the sexual exploitation and abuse of minor girls, serving as the central co-conspirator in Jeffrey Epstein\'s scheme.',
    page_count: 2847,
  },
  {
    id: 'ep-doc-flight-logs',
    title: 'Lolita Express Flight Logs',
    slug: 'flight-logs',
    doc_type: 'flight_log',
    source_url: 'https://www.justice.gov/epstein-files/phase1',
    summary: 'Flight logs for Epstein\'s Boeing 727 (N908JE) and other aircraft released through FOIA requests and court proceedings. Document passengers and routes.',
    date: '2015-01-01',
    key_findings: [
      'Documented hundreds of flights between 1995 and 2013',
      'Named passengers include Bill Clinton, Prince Andrew, Alan Dershowitz, and others',
      'Frequent routes between Teterboro, Palm Beach, St. Thomas, and international destinations',
      'Multiple entries list passengers identified only by first name or initials',
    ],
    excerpt: 'Passenger manifest for N908JE departing Teterboro, NJ — destination St. Thomas, USVI.',
    page_count: 73,
  },
  {
    id: 'ep-doc-black-book',
    title: 'Epstein Address Book',
    slug: 'black-book',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Leaked address book containing names, phone numbers, and addresses of Epstein\'s contacts. Originally obtained by a former employee.',
    date: '2009-01-01',
    key_findings: [
      'Contains over 1,500 names of Epstein\'s contacts worldwide',
      'Entries circled by former butler Alfredo Rodriguez to mark persons of interest',
      'Includes heads of state, celebrities, scientists, and business leaders',
      'Multiple entries for private residences and direct phone lines',
    ],
    excerpt: 'The contact book, sometimes called the "black book," contained personal phone numbers and addresses for hundreds of prominent individuals across politics, business, and entertainment.',
    page_count: 97,
  },
  {
    id: 'ep-doc-npa',
    title: '2008 Non-Prosecution Agreement',
    slug: 'non-prosecution-agreement',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/4355449/doe-v-united-states/',
    summary: 'Controversial agreement between US Attorney Alexander Acosta and Epstein\'s legal team granting immunity to unnamed co-conspirators.',
    date: '2008-06-30',
    key_findings: [
      'Granted immunity to all named and unnamed co-conspirators',
      'Victims were not notified, violating the Crime Victims\' Rights Act',
      'Reduced federal sex trafficking charges to state solicitation charges',
      'Epstein served only 13 months with daily work release privileges',
      'Later voided by SDNY prosecutors in 2019 as applying only to Southern District of Florida',
    ],
    excerpt: 'The United States agrees that it will not institute any criminal charges against any potential co-conspirators of Epstein, including but not limited to Sarah Kellen, Adriana Ross, Lesley Groff, or Nadia Marcinkova.',
    page_count: 18,
  },
  {
    id: 'ep-doc-giuffre-depositions',
    title: 'Giuffre v. Maxwell Depositions',
    slug: 'giuffre-depositions',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Depositions from the Giuffre v. Maxwell defamation case, unsealed in 2024. Contain detailed allegations against numerous high-profile individuals.',
    date: '2016-04-22',
    key_findings: [
      'Virginia Giuffre described recruitment at Mar-a-Lago at age 16',
      'Named Prince Andrew, Alan Dershowitz, and others as participants',
      'Maxwell denied all allegations under oath',
      'Details of abuse at multiple Epstein properties across jurisdictions',
    ],
    excerpt: 'I was recruited by Ghislaine Maxwell at Mar-a-Lago when I was working there as a locker room attendant. I was 16 years old.',
    page_count: 418,
  },
  {
    id: 'ep-doc-fbi-vault',
    title: 'FBI Vault Releases',
    slug: 'fbi-vault-releases',
    doc_type: 'fbi',
    source_url: 'https://vault.fbi.gov/jeffrey-epstein',
    summary: 'FBI records related to Jeffrey Epstein released through the Freedom of Information Act.',
    date: '2020-08-01',
    key_findings: [
      'Contains partially redacted FBI 302 interview summaries',
      'Documents FBI surveillance and investigation activities',
      'Reveals extent of inter-agency coordination on the case',
      'Many pages heavily redacted citing ongoing investigations',
    ],
    excerpt: 'FBI records pertaining to Jeffrey Edward Epstein, released in response to Freedom of Information/Privacy Acts requests.',
    page_count: 287,
  },
  {
    id: 'ep-doc-jpmorgan-comms',
    title: 'JPMorgan Internal Communications',
    slug: 'jpmorgan-communications',
    doc_type: 'financial',
    source_url: 'https://www.courtlistener.com/docket/66478587/giuffre-v-jpmorgan-chase-bank-na/',
    summary: 'Internal JPMorgan communications revealed during Jane Doe 1 v. JPMorgan lawsuit showing the bank\'s awareness of Epstein\'s activities.',
    date: '2023-04-01',
    key_findings: [
      'Bank compliance officers flagged suspicious transactions as early as 2006',
      'Jes Staley personally vouched for Epstein to override compliance concerns',
      'Epstein maintained accounts processing millions annually through 2013',
      'Internal emails show awareness of Epstein\'s 2008 conviction',
      'Bank continued relationship despite sex offender registration',
    ],
    excerpt: 'Multiple compliance alerts were generated regarding the Epstein accounts, but were overridden at the direction of senior management.',
    page_count: null,
  },
  {
    id: 'ep-doc-miami-herald',
    title: 'Perversion of Justice Investigation',
    slug: 'perversion-of-justice',
    doc_type: 'media_investigation',
    source_url: 'https://www.miamiherald.com/news/local/article220097825.html',
    summary: 'Julie K. Brown\'s groundbreaking investigative series for the Miami Herald that reignited public interest and led to Epstein\'s 2019 arrest.',
    date: '2018-11-28',
    key_findings: [
      'Identified nearly 80 victims of Epstein\'s trafficking operation',
      'Exposed the mechanics of the 2008 plea deal negotiated by Alexander Acosta',
      'Documented how victims were systematically denied their rights under the CVRA',
      'Broke a decade-long silence by making silence more costly than speech',
    ],
    excerpt: 'Even as Acosta was negotiating the deal, federal agents had identified 36 girls who said they had been molested by Epstein.',
    page_count: null,
  },
  {
    id: 'ep-doc-pb-police',
    title: 'Palm Beach Police Report',
    slug: 'palm-beach-police-report',
    doc_type: 'police_report',
    source_url: 'https://www.miamiherald.com/news/local/article221957830.html',
    summary: 'Original Palm Beach Police Department investigation report documenting initial complaints and evidence gathered against Epstein.',
    date: '2005-03-15',
    key_findings: [
      'Investigation began from a single complaint by a parent of a 14-year-old',
      'Traced a victim referral chain revealing systematic recruitment',
      'Documented evidence from Epstein\'s Palm Beach mansion',
      'Identified multiple underage victims and a pattern of cash payments',
    ],
    excerpt: 'Investigation revealed a pattern of behavior in which young females were recruited to provide "massages" at the El Brillo Way residence.',
    page_count: 42,
  },
  {
    id: 'ep-doc-autopsy',
    title: 'Medical Examiner Report',
    slug: 'medical-examiner-report',
    doc_type: 'medical',
    source_url: 'https://www.justice.gov/oig/press-release/file/1203871/download',
    summary: 'Official autopsy report by NYC Chief Medical Examiner ruling Epstein\'s death a suicide. Findings disputed by independent pathologist Dr. Michael Baden.',
    date: '2019-08-16',
    key_findings: [
      'Chief Medical Examiner Barbara Sampson ruled death suicide by hanging',
      'Dr. Michael Baden, hired by Epstein\'s family, disputed the finding',
      'Baden noted fractures in hyoid bone more consistent with homicidal strangulation',
      'Cameras outside cell malfunctioned; guards were sleeping during death',
    ],
    excerpt: 'The cause of death is hanging. The manner of death is suicide. — Barbara Sampson, M.D., Chief Medical Examiner, City of New York',
    page_count: 6,
  },

  // ─── Court Filings (7 new) ─────────────────────────────────────────────
  {
    id: 'ep-doc-sdny-indictment',
    title: 'SDNY Federal Indictment (USA v. Epstein)',
    slug: 'sdny-indictment',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/17318376/united-states-v-epstein/',
    summary: 'Federal indictment unsealed in the Southern District of New York charging Epstein with sex trafficking of minors and conspiracy to commit sex trafficking.',
    date: '2019-07-08',
    key_findings: [
      'Charged Epstein with sex trafficking of minors in New York and Florida',
      'Described a network of employees and associates who facilitated trafficking',
      'Detailed abuse at the NYC townhouse and Palm Beach mansion',
      'Listed dozens of victims spanning 2002–2005',
    ],
    excerpt: 'The defendant, Jeffrey Epstein, sexually exploited and abused dozens of minor girls at his homes in Manhattan and Palm Beach, among other locations.',
    page_count: 14,
  },
  {
    id: 'ep-doc-maxwell-superseding',
    title: 'Maxwell Superseding Indictment',
    slug: 'maxwell-superseding-indictment',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/17318513/united-states-v-maxwell/',
    summary: 'Superseding indictment adding sex trafficking charge against Ghislaine Maxwell, expanding the original six-count indictment.',
    date: '2021-03-29',
    key_findings: [
      'Added sex trafficking of a minor charge carrying life imprisonment',
      'Extended the conspiracy period to 1994–2004',
      'Identified a fourth victim known as "Minor Victim-4"',
      'Detailed Maxwell\'s role in grooming and transporting victims',
    ],
    excerpt: 'Maxwell enticed and recruited minor girls, both directly and through others, for Epstein to sexually abuse.',
    page_count: 22,
  },
  {
    id: 'ep-doc-giuffre-v-andrew',
    title: 'Giuffre v. Prince Andrew Complaint',
    slug: 'giuffre-v-prince-andrew',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/60535736/giuffre-v-prince-andrew/',
    summary: 'Civil complaint filed by Virginia Giuffre against Prince Andrew alleging sexual assault at Epstein\'s properties when she was 17 years old.',
    date: '2021-08-09',
    key_findings: [
      'Alleged sexual assault at Maxwell\'s London residence, Epstein\'s NYC townhouse, and Little St. James',
      'Invoked the New York Child Victims Act to file outside normal statute of limitations',
      'Prince Andrew denied ever meeting Giuffre despite photographic evidence',
      'Settled for approximately $12 million in February 2022',
    ],
    excerpt: 'Prince Andrew committed sexual assault and battery upon Plaintiff Virginia Giuffre when Plaintiff was under the age of eighteen.',
    page_count: 16,
  },
  {
    id: 'ep-doc-cvra-challenge',
    title: 'CVRA Challenge (Doe v. United States)',
    slug: 'cvra-challenge',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/4355449/doe-v-united-states/',
    summary: 'Crime Victims\' Rights Act challenge to the 2008 NPA, arguing prosecutors violated victims\' rights by failing to notify or consult them before the plea deal.',
    date: '2008-12-01',
    key_findings: [
      'Judge ruled prosecutors violated the CVRA by not consulting victims',
      'Established precedent for victim notification in federal plea agreements',
      'Ultimately contributed to the political pressure that led to Acosta\'s resignation',
      'Case filed by attorney Paul Cassell on behalf of two victims',
    ],
    excerpt: 'The Government concedes that it did not confer with the victims before entering into the Non-Prosecution Agreement.',
    page_count: 34,
  },
  {
    id: 'ep-doc-2024-unsealed',
    title: '2024 Unsealed Giuffre v. Maxwell Documents',
    slug: '2024-unsealed-documents',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Previously sealed documents from the Giuffre v. Maxwell civil case ordered released by the court in January 2024, revealing names of over 150 associates.',
    date: '2024-01-03',
    key_findings: [
      'Named over 150 associates of Epstein previously redacted from filings',
      'Contained deposition excerpts from Maxwell and other witnesses',
      'Revealed operational details of the trafficking network',
      'Triggered renewed media and law enforcement interest',
    ],
    excerpt: 'The Court concludes that the public interest in disclosure outweighs any countervailing privacy interest of the individuals named.',
    page_count: 943,
  },
  {
    id: 'ep-doc-doe-v-jpmorgan',
    title: 'Jane Doe 1 v. JPMorgan Chase Complaint',
    slug: 'doe-v-jpmorgan-complaint',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/66478587/giuffre-v-jpmorgan-chase-bank-na/',
    summary: 'Class action complaint alleging JPMorgan Chase knowingly facilitated Epstein\'s sex trafficking through its banking services from 1998 to 2013.',
    date: '2022-11-24',
    key_findings: [
      'Alleged JPMorgan processed suspicious transactions for Epstein for 15 years',
      'Cited Jes Staley\'s personal relationship with Epstein as enabling the banking relationship',
      'Claimed the bank ignored compliance red flags and SARs',
      'Resulted in $290 million settlement in June 2023',
    ],
    excerpt: 'JPMorgan was well aware of Epstein\'s sex trafficking and continued to bank him because he was a lucrative client and source of referrals.',
    page_count: 55,
  },
  {
    id: 'ep-doc-doe-v-deutsche',
    title: 'Doe v. Deutsche Bank Complaint',
    slug: 'doe-v-deutsche-bank',
    doc_type: 'court_filing',
    source_url: 'https://www.courtlistener.com/docket/66541489/doe-v-deutsche-bank-ag/',
    summary: 'Class action complaint alleging Deutsche Bank facilitated Epstein\'s sex trafficking through its banking services from 2013 to 2018.',
    date: '2022-11-24',
    key_findings: [
      'Deutsche Bank on-boarded Epstein after JPMorgan dropped him in 2013',
      'Bank processed over $7 million in suspicious transactions',
      'Compliance officers raised concerns that were overridden by management',
      'Resulted in $75 million settlement in May 2023',
    ],
    excerpt: 'Deutsche Bank chose profits over safety, turning a blind eye as Epstein used his accounts to fund sex trafficking.',
    page_count: 48,
  },

  // ─── Depositions (5 new) ───────────────────────────────────────────────
  {
    id: 'ep-doc-maxwell-deposition',
    title: 'Ghislaine Maxwell 2016 Deposition',
    slug: 'maxwell-2016-deposition',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Maxwell\'s sworn deposition in the Giuffre v. Maxwell defamation case, portions of which were unsealed in 2024. Maxwell denied all allegations.',
    date: '2016-04-22',
    key_findings: [
      'Maxwell denied under oath that she recruited underage girls for Epstein',
      'Claimed she had a romantic relationship with Epstein in the 1990s that ended',
      'Stated she had no knowledge of Epstein\'s sexual activities with minors',
      'Several answers were later contradicted by trial testimony and evidence',
    ],
    excerpt: 'Q: Did you ever participate in Jeffrey Epstein\'s sexual activities? A: No. Absolutely not.',
    page_count: 456,
  },
  {
    id: 'ep-doc-giuffre-depo-2016',
    title: 'Virginia Giuffre 2016 Deposition',
    slug: 'giuffre-2016-deposition',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Giuffre\'s sworn deposition in the defamation case against Maxwell, detailing her recruitment, abuse, and trafficking to powerful individuals.',
    date: '2016-05-03',
    key_findings: [
      'Described recruitment at Mar-a-Lago at age 16 while working as a locker room attendant',
      'Named specific individuals she was directed to have sexual encounters with',
      'Detailed abuse at Epstein\'s properties in New York, Palm Beach, USVI, and New Mexico',
      'Described Maxwell\'s direct role in grooming and scheduling abuse',
    ],
    excerpt: 'I was 16 years old. I was working at Mar-a-Lago. Ghislaine approached me and asked if I would be interested in a job.',
    page_count: 334,
  },
  {
    id: 'ep-doc-alessi-testimony',
    title: 'Juan Alessi Testimony (Maxwell Trial)',
    slug: 'alessi-testimony',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/17318513/united-states-v-maxwell/',
    summary: 'Testimony of Juan Alessi, former house manager at Epstein\'s Palm Beach mansion, describing daily operations and the stream of young girls visiting the property.',
    date: '2021-12-02',
    key_findings: [
      'Described a steady stream of young women visiting Epstein\'s Palm Beach residence',
      'Testified about finding sex toys on massage tables after visits',
      'Identified Ghislaine Maxwell as directing household operations',
      'Revealed an employee manual instructing staff to "see nothing, hear nothing, say nothing"',
    ],
    excerpt: 'There was a stream of females coming to the house. Young females. Very, very young females.',
    page_count: null,
  },
  {
    id: 'ep-doc-visoski-testimony',
    title: 'Larry Visoski Testimony (Maxwell Trial)',
    slug: 'visoski-testimony',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/17318513/united-states-v-maxwell/',
    summary: 'Testimony of Epstein\'s chief pilot Larry Visoski at the Maxwell trial about flight operations, passengers, and what he observed during decades of service.',
    date: '2021-11-30',
    key_findings: [
      'Flew Epstein\'s aircraft for approximately 25 years beginning in 1991',
      'Confirmed passenger names on flight logs including prominent individuals',
      'Stated he never witnessed sexual activity on flights',
      'Described Maxwell as the "number two" in Epstein\'s household hierarchy',
    ],
    excerpt: 'Ms. Maxwell was the lady of the house. She was the number two.',
    page_count: null,
  },
  {
    id: 'ep-doc-rodriguez-depo',
    title: 'Alfredo Rodriguez Sealed Deposition',
    slug: 'rodriguez-deposition',
    doc_type: 'deposition',
    source_url: 'https://www.courtlistener.com/docket/4355449/doe-v-united-states/',
    summary: 'Deposition and proffer of Alfredo Rodriguez, Epstein\'s former butler who attempted to sell the "black book" and was later convicted of obstruction.',
    date: '2009-06-01',
    key_findings: [
      'Rodriguez circled names in Epstein\'s address book to identify persons of interest',
      'Described the daily routine at the Palm Beach mansion including massage appointments',
      'Attempted to sell the address book to attorneys for $50,000',
      'Convicted of obstruction and sentenced to 18 months; died of mesothelioma in 2015',
    ],
    excerpt: 'Rodriguez identified 67 names in the contact book as being connected to Epstein\'s sexual activities.',
    page_count: 112,
  },

  // ─── FBI Records (3 new) ──────────────────────────────────────────────
  {
    id: 'ep-doc-fbi-302s',
    title: 'FBI 302 Interview Reports',
    slug: 'fbi-302-reports',
    doc_type: 'fbi',
    source_url: 'https://vault.fbi.gov/jeffrey-epstein',
    summary: 'FBI Form 302 interview summaries from victim interviews and witness statements during the 2006–2008 federal investigation.',
    date: '2007-05-01',
    key_findings: [
      'Documented statements from over 30 identified victims',
      'Interviews corroborated the victim referral chain identified by Palm Beach PD',
      'Witnesses described cash payments of $200–$300 per "massage" session',
      'Several interviews referenced Ghislaine Maxwell\'s direct involvement',
    ],
    excerpt: 'The victim stated she was recruited by another female student who told her she could make $200 for giving a massage at a house in Palm Beach.',
    page_count: 156,
  },
  {
    id: 'ep-doc-fbi-evidence-collection',
    title: 'FBI Evidence Collection Report (NYC Townhouse)',
    slug: 'fbi-evidence-collection',
    doc_type: 'fbi',
    source_url: 'https://www.courtlistener.com/docket/17318376/united-states-v-epstein/',
    summary: 'FBI evidence collection report from the July 2019 search of Epstein\'s NYC townhouse at 9 East 71st Street, documenting safe contents and electronic media.',
    date: '2019-07-08',
    key_findings: [
      'Safe contained CDs labeled with names of young women and a man',
      'Hard drives and electronic media recovered alongside diamonds and cash',
      'Foreign passport with Epstein\'s photo but a different name was found',
      'CDs and hard drives temporarily went missing between warrant executions',
    ],
    excerpt: 'Agents observed a locked safe which, when opened, revealed compact discs, hard drives, loose diamonds, a large quantity of cash, and a foreign passport.',
    page_count: 28,
  },
  {
    id: 'ep-doc-fbi-vault-part2',
    title: 'FBI Vault Release Part 2',
    slug: 'fbi-vault-release-part2',
    doc_type: 'fbi',
    source_url: 'https://vault.fbi.gov/jeffrey-epstein',
    summary: 'Second batch of FBI records released under FOIA including additional 302 reports, internal memoranda, and inter-agency communications.',
    date: '2021-03-15',
    key_findings: [
      'Revealed FBI had identified over 40 victims by 2007',
      'Documented pressure from Epstein\'s legal team to limit the investigation scope',
      'Included correspondence between FBI and US Attorney\'s office regarding the NPA',
      'Heavily redacted sections citing "law enforcement sensitive" information',
    ],
    excerpt: 'FOIA/PA: Jeffrey Edward Epstein. This release consists of material responsive to your request.',
    page_count: 344,
  },

  // ─── Flight Logs (3 new) ──────────────────────────────────────────────
  {
    id: 'ep-doc-727-logs',
    title: 'Boeing 727 Flight Logs (N908JE)',
    slug: 'boeing-727-logs',
    doc_type: 'flight_log',
    source_url: 'https://www.courtlistener.com/docket/4355449/giuffre-v-maxwell/',
    summary: 'Detailed flight logs for Epstein\'s Boeing 727, tail number N908JE, known as the "Lolita Express," covering flights from 1995 to 2013.',
    date: '2015-01-01',
    key_findings: [
      'Documented over 700 flights between 1995 and 2013',
      'Bill Clinton listed on 26 flights according to log entries',
      'Prince Andrew, Alan Dershowitz, and numerous celebrities identified as passengers',
      'Many entries list young women identified only by first name',
    ],
    excerpt: 'Flight manifest: N908JE, departing KTEB [Teterboro] to TIST [St. Thomas]. Passengers: [names redacted in part].',
    page_count: 73,
  },
  {
    id: 'ep-doc-gulfstream-logs',
    title: 'Gulfstream II Flight Records',
    slug: 'gulfstream-flight-records',
    doc_type: 'flight_log',
    source_url: 'https://www.justice.gov/epstein-files/phase1',
    summary: 'Flight records for Epstein\'s Gulfstream II jet used for shorter domestic flights and Caribbean island transfers.',
    date: '2025-12-19',
    key_findings: [
      'Covered flights between 2000 and 2016',
      'Frequently shuttled between Palm Beach and St. Thomas',
      'Passenger lists showed names not appearing on 727 logs',
      'Released as part of DOJ Phase 1 file release',
    ],
    excerpt: 'Gulfstream II — N986JE. Route: KPBI [Palm Beach] to TIST [St. Thomas]. Crew: Visoski, Capt.',
    page_count: 41,
  },
  {
    id: 'ep-doc-doj-phase1-logs',
    title: 'DOJ Phase 1 Flight Log Release',
    slug: 'doj-phase1-flight-logs',
    doc_type: 'flight_log',
    source_url: 'https://www.justice.gov/epstein-files/phase1',
    summary: 'First wave of Epstein Files Transparency Act compliance including flight logs, redacted contact book, and masseuse list.',
    date: '2025-12-19',
    key_findings: [
      'Confirmed Donald Trump flew on Epstein\'s plane at least 8 times in the 1990s',
      'Released redacted version of Epstein\'s contact book',
      'Included a previously unknown "masseuse list" with names and phone numbers',
      'Drew bipartisan criticism for extensive redactions of certain names',
    ],
    excerpt: 'In compliance with the Epstein Files Transparency Act, the Department of Justice releases Phase 1 materials.',
    page_count: 312,
  },

  // ─── Police Reports (3 new) ───────────────────────────────────────────
  {
    id: 'ep-doc-probable-cause',
    title: 'Probable Cause Affidavit (Palm Beach)',
    slug: 'probable-cause-affidavit',
    doc_type: 'police_report',
    source_url: 'https://www.miamiherald.com/news/local/article221957830.html',
    summary: 'Detective Joseph Recarey\'s probable cause affidavit establishing grounds for the Epstein investigation based on victim interviews and physical evidence.',
    date: '2005-05-01',
    key_findings: [
      'Detailed statements from multiple underage victims',
      'Established a pattern of recruitment through local high schools',
      'Described the massage table setup in Epstein\'s master bathroom',
      'Recommended charges of lewd and lascivious molestation of a child',
    ],
    excerpt: 'Through investigation, your affiant has determined that Jeffrey Epstein did unlawfully and lasciviously commit a lewd and lascivious act upon the person or in the presence of [victim name redacted], a child under 16 years of age.',
    page_count: 19,
  },
  {
    id: 'ep-doc-pb-supplemental',
    title: 'Palm Beach PD Supplemental Report',
    slug: 'palm-beach-supplemental',
    doc_type: 'police_report',
    source_url: 'https://www.miamiherald.com/news/local/article221957830.html',
    summary: 'Supplemental police report documenting additional victim interviews and evidence gathered during the expanded Palm Beach investigation.',
    date: '2006-01-15',
    key_findings: [
      'Expanded victim count from initial complaint to over 20 identified victims',
      'Documented the cash payment system used to compensate victims',
      'Described the role of intermediary recruiters, often former victims themselves',
      'Included surveillance records of young women entering the El Brillo Way residence',
    ],
    excerpt: 'Additional victims were identified through the referral chain. Each victim described a substantially similar pattern of conduct.',
    page_count: 67,
  },
  {
    id: 'ep-doc-victim-interviews',
    title: 'PBPD Victim Interview Summaries',
    slug: 'victim-interview-summaries',
    doc_type: 'police_report',
    source_url: 'https://www.miamiherald.com/news/local/article220097825.html',
    summary: 'Summaries of victim interviews conducted by Palm Beach Police Department as part of the initial investigation into Epstein.',
    date: '2005-06-01',
    key_findings: [
      'Victims described being paid $200–$300 in cash after each visit',
      'Multiple victims reported being recruited by other young women at school',
      'Several victims described escalation from massage to sexual contact',
      'Victims identified Sarah Kellen as the person who scheduled appointments',
    ],
    excerpt: 'The victim stated that she was 14 years old when she first went to the house on El Brillo Way. She was told she could make $200 for a massage.',
    page_count: 89,
  },

  // ─── Financial Records (5 new) ────────────────────────────────────────
  {
    id: 'ep-doc-jpmorgan-sars',
    title: 'JPMorgan Suspicious Activity Reports',
    slug: 'jpmorgan-sars',
    doc_type: 'financial',
    source_url: 'https://www.courtlistener.com/docket/66478587/giuffre-v-jpmorgan-chase-bank-na/',
    summary: 'Suspicious Activity Reports filed by JPMorgan Chase regarding Epstein\'s accounts, many filed years after suspicious activity was first detected.',
    date: '2019-08-01',
    key_findings: [
      'Bank filed SARs only after Epstein\'s 2019 arrest despite years of flagged activity',
      'Documented over $30 million in suspicious cash withdrawals',
      'Identified wire transfers to co-conspirators and victims',
      'Revealed the bank had flagged transactions as early as 2006 without filing SARs',
    ],
    excerpt: 'The filing institution identified suspicious patterns of activity including large cash withdrawals, wire transfers to individuals associated with massage services, and payments to young women.',
    page_count: null,
  },
  {
    id: 'ep-doc-deutsche-compliance',
    title: 'Deutsche Bank Compliance Failures Report',
    slug: 'deutsche-bank-compliance',
    doc_type: 'financial',
    source_url: 'https://www.courtlistener.com/docket/66541489/doe-v-deutsche-bank-ag/',
    summary: 'NY DFS consent order documenting Deutsche Bank\'s compliance failures in managing Epstein\'s accounts from 2013 to 2018.',
    date: '2020-07-07',
    key_findings: [
      'Deutsche Bank paid $150 million fine to NY DFS for compliance failures',
      'Processed $7 million in suspicious transactions for Epstein',
      'Failed to adequately monitor or report suspicious activity',
      'On-boarded Epstein as a client despite his sex offender conviction',
    ],
    excerpt: 'Deutsche Bank failed to properly monitor account activity conducted on behalf of the Jeffrey Epstein-related entities despite ample information raising concerns.',
    page_count: 24,
  },
  {
    id: 'ep-doc-wexner-poa',
    title: 'Wexner Power of Attorney Documents',
    slug: 'wexner-power-of-attorney',
    doc_type: 'financial',
    source_url: 'https://finance.senate.gov/hearings/wexner-deposition-2026',
    summary: 'Documents related to the sweeping power of attorney Leslie Wexner granted Jeffrey Epstein over his finances from 1991 to 2001.',
    date: '1991-01-01',
    key_findings: [
      'Granted Epstein full authority to manage Wexner\'s finances',
      'Approximately $1 billion transferred to Epstein during the 11-year period',
      'NYC townhouse at 9 East 71st Street transferred to Epstein for nominal consideration',
      'Wexner claimed in 2026 deposition he was "duped by a world-class con man"',
    ],
    excerpt: 'The power of attorney granted to Jeffrey E. Epstein authorizes and empowers him to act on behalf of Leslie H. Wexner in all matters financial.',
    page_count: 8,
  },
  {
    id: 'ep-doc-leon-black-records',
    title: 'Leon Black Financial Records (Senate Report)',
    slug: 'leon-black-financial-records',
    doc_type: 'financial',
    source_url: 'https://finance.senate.gov/chairmans-news/epstein-black-report-2025',
    summary: 'Senate Finance Committee report on Leon Black\'s payments to Epstein totaling approximately $170 million between 2012 and 2017.',
    date: '2025-03-15',
    key_findings: [
      'Corrected total payments from initially reported $158M to $170M',
      'Found evidence money "used to finance Epstein\'s sex trafficking operations"',
      'Black characterized payments as being for financial and tax advice',
      'Committee questioned whether services rendered justified the amounts paid',
    ],
    excerpt: 'The Committee finds that the $170 million paid by Leon Black to Jeffrey Epstein was used, at least in part, to finance Epstein\'s sex trafficking operations.',
    page_count: 87,
  },
  {
    id: 'ep-doc-fca-staley',
    title: 'FCA Final Notice — Jes Staley',
    slug: 'fca-staley-notice',
    doc_type: 'financial',
    source_url: 'https://www.fca.org.uk/news/press-releases/fca-bans-jes-staley-2025',
    summary: 'UK Financial Conduct Authority final notice permanently banning Jes Staley from the banking industry over his relationship with Epstein.',
    date: '2025-06-15',
    key_findings: [
      'Documented 1,100 emails between Staley and Epstein from 2008 to 2012',
      'Staley called Epstein "one of my most cherished friends" in correspondence',
      'Staley visited Little St. James Island in 2009 while Epstein was incarcerated',
      'FCA concluded Staley lacked fitness and propriety to work in banking',
    ],
    excerpt: 'Mr. Staley was not candid with the FCA regarding the nature and extent of his relationship with Mr. Epstein.',
    page_count: 42,
  },

  // ─── Investigative Journalism (6 new) ─────────────────────────────────
  {
    id: 'ep-doc-vanity-fair-2003',
    title: 'Vanity Fair 2003 Profile of Epstein',
    slug: 'vanity-fair-2003',
    doc_type: 'media_investigation',
    source_url: 'https://www.vanityfair.com/news/2003/03/jeffrey-epstein-200303',
    summary: 'Vicky Ward\'s early Vanity Fair profile of Epstein, notable for the removal of sexual abuse allegations before publication at editor\'s request.',
    date: '2003-03-01',
    key_findings: [
      'One of the earliest major media profiles of Epstein',
      'Sexual abuse allegations from two sisters were removed before publication',
      'Editor Graydon Carter reportedly cut the allegations under legal pressure',
      'Ward later revealed the cut allegations after Epstein\'s 2019 arrest',
    ],
    excerpt: 'Jeffrey Epstein is a man who loves nothing more than to dangle the notion of endless wealth in the face of those who need it.',
    page_count: null,
  },
  {
    id: 'ep-doc-nyt-2019',
    title: 'NY Times Epstein Investigation Coverage',
    slug: 'nyt-2019-investigation',
    doc_type: 'media_investigation',
    source_url: 'https://www.nytimes.com/2019/07/08/nyregion/jeffrey-epstein-charges.html',
    summary: 'New York Times reporting on the 2019 federal arrest and indictment of Jeffrey Epstein, documenting the network of enablers and institutional failures.',
    date: '2019-07-08',
    key_findings: [
      'Detailed the SDNY indictment and evidence from the townhouse search',
      'Reported on the safe contents including CDs and foreign passport',
      'Examined Epstein\'s connections to academic and scientific institutions',
      'Documented MIT Media Lab donations funneled through intermediaries',
    ],
    excerpt: 'The indictment painted a picture of a man who, over the course of years, created a vast network of underage girls to sexually exploit.',
    page_count: null,
  },
  {
    id: 'ep-doc-netflix-doc',
    title: 'Netflix Documentary: Jeffrey Epstein: Filthy Rich',
    slug: 'netflix-filthy-rich',
    doc_type: 'media_investigation',
    source_url: 'https://www.netflix.com/title/80224905',
    summary: 'Four-part Netflix documentary featuring survivor testimony, investigative journalism, and analysis of the systemic failures that enabled Epstein\'s crimes.',
    date: '2020-05-27',
    key_findings: [
      'Featured first-person testimony from multiple survivors',
      'Documented the chain of institutional failures from Palm Beach PD to federal prosecutors',
      'Included interviews with Julie K. Brown and law enforcement officials',
      'Reached over 25 million viewers in its first month of release',
    ],
    excerpt: 'The survivors speak for the first time on camera about the abuse they endured and the system that protected their abuser.',
    page_count: null,
  },
  {
    id: 'ep-doc-jkb-book',
    title: 'Perversion of Justice (Julie K. Brown book)',
    slug: 'perversion-of-justice-book',
    doc_type: 'media_investigation',
    source_url: 'https://www.harpercollins.com/products/perversion-of-justice-julie-k-brown',
    summary: 'Julie K. Brown\'s book expanding on her Miami Herald investigation, detailing the decade-long effort to bring Epstein to justice.',
    date: '2021-07-20',
    key_findings: [
      'Expanded on the Miami Herald series with new details about the 2008 plea deal',
      'Documented how federal prosecutors actively worked to conceal the NPA from victims',
      'Revealed internal DOJ communications about the case',
      'Detailed the threats and intimidation faced by investigators pursuing Epstein',
    ],
    excerpt: 'For years, Epstein\'s victims were dismissed, discredited, and denied justice by the very system that was supposed to protect them.',
    page_count: 368,
  },
  {
    id: 'ep-doc-giuffre-memoir',
    title: 'Nobody\'s Girl: A Memoir (Virginia Giuffre)',
    slug: 'giuffre-memoir',
    doc_type: 'media_investigation',
    source_url: 'https://www.penguinrandomhouse.com/books/nobodys-girl-giuffre/',
    summary: 'Posthumous memoir by Virginia Giuffre, co-written with Amy Wallace, containing new allegations including against an unnamed "well-known Prime Minister."',
    date: '2025-10-21',
    key_findings: [
      'Published posthumously after Giuffre\'s death in April 2025',
      'Contained new allegations against an unnamed "well-known Prime Minister"',
      'Detailed her recruitment, abuse, and decades-long fight for justice',
      'Co-written with Amy Wallace and published by Alfred A. Knopf',
    ],
    excerpt: 'I was nobody\'s girl. I belonged to no one, and I was passed around like property to the richest and most powerful men in the world.',
    page_count: 416,
  },
  {
    id: 'ep-doc-doj-phase2-reporting',
    title: 'DOJ Phase 2 File Release Reporting',
    slug: 'doj-phase2-reporting',
    doc_type: 'media_investigation',
    source_url: 'https://www.justice.gov/epstein-files/phase2',
    summary: 'Comprehensive reporting on the DOJ Phase 2 release of 3 million pages, 2,000 videos, and 180,000 images that triggered a cascade of arrests.',
    date: '2026-01-30',
    key_findings: [
      'Release contained 3 million pages, 2,000 videos, and 180,000 images',
      'Confirmed Donald Trump flew on Epstein\'s plane at least 8 times in the 1990s',
      'Triggered arrests of Prince Andrew, Peter Mandelson, and Thorbjorn Jagland',
      'Led to 9+ corporate and institutional leader resignations',
    ],
    excerpt: 'The Phase 2 release represents the largest single disclosure of evidence in the history of the Epstein investigation.',
    page_count: null,
  },

  // ─── Medical Records (3 new) ──────────────────────────────────────────
  {
    id: 'ep-doc-baden-review',
    title: 'Dr. Michael Baden Independent Autopsy Review',
    slug: 'baden-autopsy-review',
    doc_type: 'medical',
    source_url: 'https://www.nytimes.com/2019/10/30/nyregion/jeffrey-epstein-autopsy-michael-baden.html',
    summary: 'Independent forensic pathologist Dr. Michael Baden\'s review of Epstein\'s autopsy findings, disputing the official suicide ruling.',
    date: '2019-10-30',
    key_findings: [
      'Identified fractures in the hyoid bone and thyroid cartilage',
      'Stated injuries were more consistent with homicidal strangulation than hanging',
      'Noted the noose created from torn bedsheet was inconsistent with the injuries',
      'Called for further investigation into the circumstances of death',
    ],
    excerpt: 'The three fractures in the hyoid bone and thyroid cartilage are extremely unusual in suicidal hangings and are more commonly seen in homicidal strangulation.',
    page_count: 12,
  },
  {
    id: 'ep-doc-mcc-medical',
    title: 'MCC Medical Records (Epstein)',
    slug: 'mcc-medical-records',
    doc_type: 'medical',
    source_url: 'https://www.justice.gov/oig/press-release/file/1203871/download',
    summary: 'Metropolitan Correctional Center medical records documenting Epstein\'s health assessments, psychological evaluations, and suicide watch protocols.',
    date: '2019-08-10',
    key_findings: [
      'Epstein was placed on suicide watch on July 23, 2019 after an apparent suicide attempt',
      'Removed from suicide watch on July 29, 2019 — just 12 days before his death',
      'Psychological assessment deemed him not at imminent risk of self-harm',
      'Cellmate was transferred out, leaving Epstein alone, hours before his death',
    ],
    excerpt: 'The inmate was removed from suicide watch and returned to the Special Housing Unit on July 29, 2019.',
    page_count: 34,
  },
  {
    id: 'ep-doc-suicide-attempt',
    title: 'Epstein First Suicide Attempt Report',
    slug: 'first-suicide-attempt',
    doc_type: 'medical',
    source_url: 'https://www.courtlistener.com/docket/17318376/united-states-v-epstein/',
    summary: 'Report on the July 23, 2019 incident in which Epstein was found semi-conscious on the floor of his cell with marks on his neck.',
    date: '2019-07-23',
    key_findings: [
      'Found semi-conscious on cell floor with marks on his neck',
      'Cellmate Nicholas Tartaglione (former police officer) was present',
      'Tartaglione denied involvement; investigators could not determine cause',
      'Led to placement on suicide watch, from which he was removed 6 days later',
    ],
    excerpt: 'The inmate was found on the floor of his cell in a semi-conscious state with injuries to his neck. The circumstances of the incident remain unclear.',
    page_count: 8,
  },
]

const organizations = [
  { id: 'ep-org-epstein-co', name: 'J. Epstein & Co', slug: 'j-epstein-co', org_type: 'company', description: 'Financial management firm founded by Jeffrey Epstein. Claimed to serve only billionaire clients.' },
  { id: 'ep-org-southern-trust', name: 'Southern Trust Company', slug: 'southern-trust', org_type: 'company', description: 'Financial entity registered in the US Virgin Islands and associated with Epstein\'s business operations.' },
  { id: 'ep-org-jpmorgan', name: 'JPMorgan Chase', slug: 'jpmorgan-chase', org_type: 'bank', description: 'Major US bank that maintained a banking relationship with Epstein from 1998 to 2013. Settled victim lawsuit for $290M in 2023.' },
  { id: 'ep-org-deutsche', name: 'Deutsche Bank', slug: 'deutsche-bank', org_type: 'bank', description: 'German bank that provided banking services to Epstein from 2013 to 2018. Settled victim lawsuit for $75M in 2023.' },
  { id: 'ep-org-l-brands', name: 'L Brands / The Limited', slug: 'l-brands', org_type: 'company', description: 'Retail conglomerate founded by Leslie Wexner. Epstein managed Wexner\'s finances and had power of attorney over his affairs.' },
  { id: 'ep-org-apollo', name: 'Apollo Global Management', slug: 'apollo-global', org_type: 'company', description: 'Private equity firm co-founded by Leon Black, who paid Epstein approximately $158 million for financial and tax advice.' },
  { id: 'ep-org-mc2', name: 'MC2 Model Management', slug: 'mc2-model-management', org_type: 'modeling_agency', description: 'Modeling agency founded by Jean-Luc Brunel with funding from Epstein. Used as a vehicle for recruiting victims.' },
  { id: 'ep-org-vi-foundation', name: 'Jeffrey Epstein VI Foundation', slug: 'epstein-foundation', org_type: 'foundation', description: 'Charitable foundation based in the US Virgin Islands used by Epstein to cultivate relationships with scientists and academics.' },
  { id: 'ep-org-mcc', name: 'Metropolitan Correctional Center', slug: 'mcc', org_type: 'prison', description: 'Federal detention facility in Manhattan where Epstein was held and where he was found dead on August 10, 2019.' },
]

const legalCases = [
  { id: 'ep-case-florida', title: 'State of Florida v. Epstein', slug: 'florida-v-epstein', case_number: '2008-CF-009182', court: 'Palm Beach County Circuit Court', status: 'closed', date_filed: '2008-06-30' },
  { id: 'ep-case-sdny', title: 'USA v. Epstein', slug: 'usa-v-epstein', case_number: '19-cr-490', court: 'Southern District of New York', status: 'closed', date_filed: '2019-07-08' },
  { id: 'ep-case-maxwell', title: 'USA v. Maxwell', slug: 'usa-v-maxwell', case_number: '20-cr-330', court: 'Southern District of New York', status: 'closed', date_filed: '2020-07-02' },
  { id: 'ep-case-giuffre-maxwell', title: 'Giuffre v. Maxwell', slug: 'giuffre-v-maxwell', case_number: '15-cv-7433', court: 'Southern District of New York', status: 'settled', date_filed: '2015-01-01' },
  { id: 'ep-case-giuffre-andrew', title: 'Giuffre v. Prince Andrew', slug: 'giuffre-v-prince-andrew', case_number: '21-cv-6702', court: 'Southern District of New York', status: 'settled', date_filed: '2021-08-09' },
  { id: 'ep-case-jpmorgan', title: 'Jane Doe 1 v. JPMorgan Chase', slug: 'doe-v-jpmorgan', case_number: '22-cv-10019', court: 'Southern District of New York', status: 'settled', date_filed: '2022-11-24' },
]

// ---------------------------------------------------------------------------
// Relationship data
// ---------------------------------------------------------------------------

const associatedWith = [
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-ghislaine-maxwell', relType: 'co_conspirator', description: 'Longtime associate and convicted co-conspirator' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-leslie-wexner', relType: 'client', description: 'Largest known financial client' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-alan-dershowitz', relType: 'attorney', description: 'Legal representative during 2008 plea deal' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-prince-andrew', relType: 'associate', description: 'Social associate named in lawsuits' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-bill-clinton', relType: 'associate', description: 'Appeared on flight logs' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-jean-luc-brunel', relType: 'associate', description: 'Modeling agent and associate' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-sarah-kellen', relType: 'employee', description: 'Personal assistant named as co-conspirator' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-nadia-marcinko', relType: 'victim', description: 'Initially identified as victim' },
  { fromId: 'ep-jeffrey-epstein', toId: 'ep-donald-trump', relType: 'associate', description: 'Early social connections in Palm Beach' },
  { fromId: 'ep-virginia-giuffre', toId: 'ep-jeffrey-epstein', relType: 'accuser', description: 'Key accuser in multiple lawsuits' },
  { fromId: 'ep-virginia-giuffre', toId: 'ep-ghislaine-maxwell', relType: 'accuser', description: 'Filed defamation lawsuit' },
  { fromId: 'ep-virginia-giuffre', toId: 'ep-prince-andrew', relType: 'accuser', description: 'Filed civil lawsuit, settled 2022' },
  { fromId: 'ep-ghislaine-maxwell', toId: 'ep-jean-luc-brunel', relType: 'associate', description: 'Connected through modeling industry' },
  { fromId: 'ep-larry-visoski', toId: 'ep-jeffrey-epstein', relType: 'pilot', description: 'Chief pilot for private aircraft' },
]

const employedBy = [
  { personId: 'ep-jeffrey-epstein', orgId: 'ep-org-epstein-co' },
  { personId: 'ep-leslie-wexner', orgId: 'ep-org-l-brands' },
  { personId: 'ep-leon-black', orgId: 'ep-org-apollo' },
  { personId: 'ep-jean-luc-brunel', orgId: 'ep-org-mc2' },
  { personId: 'ep-jes-staley', orgId: 'ep-org-jpmorgan' },
]

const affiliatedWith = [
  { personId: 'ep-jeffrey-epstein', orgId: 'ep-org-vi-foundation' },
  { personId: 'ep-jeffrey-epstein', orgId: 'ep-org-jpmorgan' },
  { personId: 'ep-jeffrey-epstein', orgId: 'ep-org-deutsche' },
]

const owned = [
  { ownerId: 'ep-jeffrey-epstein', ownerLabel: 'Person', locationId: 'ep-little-st-james' },
  { ownerId: 'ep-jeffrey-epstein', ownerLabel: 'Person', locationId: 'ep-zorro-ranch' },
  { ownerId: 'ep-jeffrey-epstein', ownerLabel: 'Person', locationId: 'ep-nyc-townhouse' },
  { ownerId: 'ep-jeffrey-epstein', ownerLabel: 'Person', locationId: 'ep-palm-beach-mansion' },
  { ownerId: 'ep-jeffrey-epstein', ownerLabel: 'Person', locationId: 'ep-paris-apartment' },
  { ownerId: 'ep-leslie-wexner', ownerLabel: 'Person', locationId: 'ep-columbus-oh' },
  { ownerId: 'ep-leslie-wexner', ownerLabel: 'Person', locationId: 'ep-nyc-townhouse' },
]

const participatedIn = [
  // Epstein events
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-pb-investigation' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-fbi-investigation' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-grand-jury' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-npa' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-guilty-plea' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-sex-offender' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-arrest' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-indictment' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-death' },
  { personId: 'ep-jeffrey-epstein', eventId: 'ep-evt-autopsy' },
  // Maxwell events
  { personId: 'ep-ghislaine-maxwell', eventId: 'ep-evt-maxwell-arrest' },
  { personId: 'ep-ghislaine-maxwell', eventId: 'ep-evt-maxwell-trial' },
  { personId: 'ep-ghislaine-maxwell', eventId: 'ep-evt-maxwell-verdict' },
  { personId: 'ep-ghislaine-maxwell', eventId: 'ep-evt-maxwell-sentence' },
  // Giuffre events
  { personId: 'ep-virginia-giuffre', eventId: 'ep-evt-giuffre-v-maxwell' },
]

const filedIn = [
  { docId: 'ep-doc-maxwell-transcripts', caseId: 'ep-case-maxwell' },
  { docId: 'ep-doc-npa', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-giuffre-depositions', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-jpmorgan-comms', caseId: 'ep-case-jpmorgan' },
  { docId: 'ep-doc-pb-police', caseId: 'ep-case-florida' },
  // New filings
  { docId: 'ep-doc-sdny-indictment', caseId: 'ep-case-sdny' },
  { docId: 'ep-doc-maxwell-superseding', caseId: 'ep-case-maxwell' },
  { docId: 'ep-doc-giuffre-v-andrew', caseId: 'ep-case-giuffre-andrew' },
  { docId: 'ep-doc-cvra-challenge', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-2024-unsealed', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-doe-v-jpmorgan', caseId: 'ep-case-jpmorgan' },
  { docId: 'ep-doc-maxwell-deposition', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-giuffre-depo-2016', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-alessi-testimony', caseId: 'ep-case-maxwell' },
  { docId: 'ep-doc-visoski-testimony', caseId: 'ep-case-maxwell' },
  { docId: 'ep-doc-rodriguez-depo', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-fbi-evidence-collection', caseId: 'ep-case-sdny' },
  { docId: 'ep-doc-727-logs', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-black-book', caseId: 'ep-case-giuffre-maxwell' },
  { docId: 'ep-doc-probable-cause', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-pb-supplemental', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-victim-interviews', caseId: 'ep-case-florida' },
  { docId: 'ep-doc-jpmorgan-sars', caseId: 'ep-case-jpmorgan' },
  { docId: 'ep-doc-doe-v-deutsche', caseId: 'ep-case-jpmorgan' },
  { docId: 'ep-doc-deutsche-compliance', caseId: 'ep-case-jpmorgan' },
  { docId: 'ep-doc-suicide-attempt', caseId: 'ep-case-sdny' },
]

const documentedBy = [
  { eventId: 'ep-evt-miami-herald', docId: 'ep-doc-miami-herald' },
  { eventId: 'ep-evt-death', docId: 'ep-doc-autopsy' },
  { eventId: 'ep-evt-npa', docId: 'ep-doc-npa' },
  { eventId: 'ep-evt-maxwell-trial', docId: 'ep-doc-maxwell-transcripts' },
  // New documented-by relationships
  { eventId: 'ep-evt-indictment', docId: 'ep-doc-sdny-indictment' },
  { eventId: 'ep-evt-arrest', docId: 'ep-doc-fbi-evidence-collection' },
  { eventId: 'ep-evt-maxwell-arrest', docId: 'ep-doc-maxwell-superseding' },
  { eventId: 'ep-evt-maxwell-verdict', docId: 'ep-doc-maxwell-transcripts' },
  { eventId: 'ep-evt-giuffre-v-maxwell', docId: 'ep-doc-giuffre-depositions' },
  { eventId: 'ep-evt-document-release', docId: 'ep-doc-2024-unsealed' },
  { eventId: 'ep-evt-pb-investigation', docId: 'ep-doc-probable-cause' },
  { eventId: 'ep-evt-pb-investigation', docId: 'ep-doc-pb-supplemental' },
  { eventId: 'ep-evt-fbi-investigation', docId: 'ep-doc-fbi-302s' },
  { eventId: 'ep-evt-death', docId: 'ep-doc-baden-review' },
  { eventId: 'ep-evt-death', docId: 'ep-doc-mcc-medical' },
  { eventId: 'ep-evt-autopsy', docId: 'ep-doc-baden-review' },
  { eventId: 'ep-evt-jpmorgan-settlement', docId: 'ep-doc-doe-v-jpmorgan' },
  { eventId: 'ep-evt-deutsche-settlement', docId: 'ep-doc-doe-v-deutsche' },
  { eventId: 'ep-evt-guilty-plea', docId: 'ep-doc-cvra-challenge' },
]

const mentionedIn = [
  // Jeffrey Epstein mentioned in all documents
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-maxwell-transcripts' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-flight-logs' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-black-book' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-npa' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-giuffre-depositions' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-fbi-vault' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-jpmorgan-comms' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-miami-herald' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-pb-police' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-autopsy' },
  // Ghislaine Maxwell
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-maxwell-transcripts' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-flight-logs' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-black-book' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-giuffre-depositions' },
  // Virginia Giuffre
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-giuffre-depositions' },
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-maxwell-transcripts' },
  // Prince Andrew
  { personId: 'ep-prince-andrew', docId: 'ep-doc-giuffre-depositions' },
  // Bill Clinton
  { personId: 'ep-bill-clinton', docId: 'ep-doc-flight-logs' },
  // Alan Dershowitz
  { personId: 'ep-alan-dershowitz', docId: 'ep-doc-giuffre-depositions' },
  // Leon Black
  { personId: 'ep-leon-black', docId: 'ep-doc-jpmorgan-comms' },
  { personId: 'ep-leon-black', docId: 'ep-doc-leon-black-records' },

  // ─── New documents — MENTIONED_IN ──────────────────────────────────────
  // SDNY Indictment
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-sdny-indictment' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-sdny-indictment' },
  { personId: 'ep-sarah-kellen', docId: 'ep-doc-sdny-indictment' },
  // Maxwell Superseding Indictment
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-maxwell-superseding' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-maxwell-superseding' },
  // Giuffre v. Prince Andrew
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-giuffre-v-andrew' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-giuffre-v-andrew' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-giuffre-v-andrew' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-giuffre-v-andrew' },
  // CVRA Challenge
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-cvra-challenge' },
  { personId: 'ep-alan-dershowitz', docId: 'ep-doc-cvra-challenge' },
  // 2024 Unsealed Documents
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-2024-unsealed' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-2024-unsealed' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-2024-unsealed' },
  { personId: 'ep-bill-clinton', docId: 'ep-doc-2024-unsealed' },
  { personId: 'ep-alan-dershowitz', docId: 'ep-doc-2024-unsealed' },
  { personId: 'ep-david-copperfield', docId: 'ep-doc-2024-unsealed' },
  // Doe v. JPMorgan
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-doe-v-jpmorgan' },
  { personId: 'ep-jes-staley', docId: 'ep-doc-doe-v-jpmorgan' },
  // Doe v. Deutsche Bank
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-doe-v-deutsche' },
  // Maxwell 2016 Deposition
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-maxwell-deposition' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-maxwell-deposition' },
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-maxwell-deposition' },
  // Giuffre 2016 Deposition
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-giuffre-depo-2016' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-giuffre-depo-2016' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-giuffre-depo-2016' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-giuffre-depo-2016' },
  { personId: 'ep-alan-dershowitz', docId: 'ep-doc-giuffre-depo-2016' },
  // Alessi Testimony
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-alessi-testimony' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-alessi-testimony' },
  // Visoski Testimony
  { personId: 'ep-larry-visoski', docId: 'ep-doc-visoski-testimony' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-visoski-testimony' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-visoski-testimony' },
  // Rodriguez Deposition
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-rodriguez-depo' },
  { personId: 'ep-sarah-kellen', docId: 'ep-doc-rodriguez-depo' },
  // FBI 302 Reports
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-fbi-302s' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-fbi-302s' },
  { personId: 'ep-sarah-kellen', docId: 'ep-doc-fbi-302s' },
  // FBI Evidence Collection
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-fbi-evidence-collection' },
  // FBI Vault Part 2
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-fbi-vault-part2' },
  // 727 Flight Logs
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-727-logs' },
  { personId: 'ep-bill-clinton', docId: 'ep-doc-727-logs' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-727-logs' },
  { personId: 'ep-alan-dershowitz', docId: 'ep-doc-727-logs' },
  { personId: 'ep-larry-visoski', docId: 'ep-doc-727-logs' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-727-logs' },
  // Gulfstream Logs
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-gulfstream-logs' },
  { personId: 'ep-larry-visoski', docId: 'ep-doc-gulfstream-logs' },
  // DOJ Phase 1 Logs
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-doj-phase1-logs' },
  { personId: 'ep-donald-trump', docId: 'ep-doc-doj-phase1-logs' },
  // Probable Cause Affidavit
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-probable-cause' },
  // PB Supplemental
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-pb-supplemental' },
  // Victim Interviews
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-victim-interviews' },
  { personId: 'ep-sarah-kellen', docId: 'ep-doc-victim-interviews' },
  // JPMorgan SARs
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-jpmorgan-sars' },
  { personId: 'ep-jes-staley', docId: 'ep-doc-jpmorgan-sars' },
  // Deutsche Compliance
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-deutsche-compliance' },
  // Wexner POA
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-wexner-poa' },
  { personId: 'ep-leslie-wexner', docId: 'ep-doc-wexner-poa' },
  // Leon Black Records
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-leon-black-records' },
  // FCA Staley
  { personId: 'ep-jes-staley', docId: 'ep-doc-fca-staley' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-fca-staley' },
  // Vanity Fair 2003
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-vanity-fair-2003' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-vanity-fair-2003' },
  // NYT 2019
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-nyt-2019' },
  // Netflix doc
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-netflix-doc' },
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-netflix-doc' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-netflix-doc' },
  // JKB Book
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-jkb-book' },
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-jkb-book' },
  // Giuffre Memoir
  { personId: 'ep-virginia-giuffre', docId: 'ep-doc-giuffre-memoir' },
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-giuffre-memoir' },
  { personId: 'ep-ghislaine-maxwell', docId: 'ep-doc-giuffre-memoir' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-giuffre-memoir' },
  // DOJ Phase 2 Reporting
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-doj-phase2-reporting' },
  { personId: 'ep-donald-trump', docId: 'ep-doc-doj-phase2-reporting' },
  { personId: 'ep-prince-andrew', docId: 'ep-doc-doj-phase2-reporting' },
  // Baden Review
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-baden-review' },
  // MCC Medical
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-mcc-medical' },
  // Suicide Attempt
  { personId: 'ep-jeffrey-epstein', docId: 'ep-doc-suicide-attempt' },
]

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedPersons(): Promise<void> {
  console.log(`\nSeeding ${persons.length} persons...`)
  for (const person of persons) {
    await executeWrite(
      `MERGE (p:Person {id: $id})
       SET p.name = $name,
           p.slug = $slug,
           p.role = $role,
           p.description = $description,
           p.nationality = $nationality,
           p.caso_slug = $casoSlug`,
      { ...person, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${person.name}`)
  }
}

async function seedLocations(): Promise<void> {
  console.log(`\nSeeding ${locations.length} locations...`)
  for (const location of locations) {
    await executeWrite(
      `MERGE (l:Location {id: $id})
       SET l.name = $name,
           l.slug = $slug,
           l.location_type = $location_type,
           l.address = $address,
           l.coordinates = $coordinates,
           l.caso_slug = $casoSlug`,
      { ...location, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${location.name}`)
  }
}

async function seedEvents(): Promise<void> {
  console.log(`\nSeeding ${events.length} events...`)
  for (const event of events) {
    await executeWrite(
      `MERGE (e:Event {id: $id})
       SET e.title = $title,
           e.date = $date,
           e.event_type = $event_type,
           e.description = $description,
           e.caso_slug = $casoSlug`,
      { ...event, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${event.title}`)
  }
}

async function seedDocuments(): Promise<void> {
  console.log(`\nSeeding ${documents.length} documents...`)
  for (const doc of documents) {
    await executeWrite(
      `MERGE (d:Document {id: $id})
       SET d.title = $title,
           d.slug = $slug,
           d.doc_type = $doc_type,
           d.source_url = $source_url,
           d.summary = $summary,
           d.date = $date,
           d.key_findings = $key_findings,
           d.excerpt = $excerpt,
           d.page_count = $page_count,
           d.caso_slug = $casoSlug`,
      { ...doc, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${doc.title}`)
  }
}

async function seedOrganizations(): Promise<void> {
  console.log(`\nSeeding ${organizations.length} organizations...`)
  for (const org of organizations) {
    await executeWrite(
      `MERGE (o:Organization {id: $id})
       SET o.name = $name,
           o.slug = $slug,
           o.org_type = $org_type,
           o.description = $description,
           o.caso_slug = $casoSlug`,
      { ...org, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${org.name}`)
  }
}

async function seedLegalCases(): Promise<void> {
  console.log(`\nSeeding ${legalCases.length} legal cases...`)
  for (const lc of legalCases) {
    await executeWrite(
      `MERGE (c:LegalCase {id: $id})
       SET c.title = $title,
           c.slug = $slug,
           c.case_number = $case_number,
           c.court = $court,
           c.status = $status,
           c.date_filed = $date_filed,
           c.caso_slug = $casoSlug`,
      { ...lc, casoSlug: CASO_SLUG },
    )
    console.log(`  ✓ ${lc.title}`)
  }
}

async function seedRelationships(): Promise<void> {
  console.log('\nSeeding relationships...')

  // ASSOCIATED_WITH (Person → Person)
  console.log('  ASSOCIATED_WITH...')
  for (const rel of associatedWith) {
    await executeWrite(
      `MATCH (a:Person {id: $fromId}), (b:Person {id: $toId})
       MERGE (a)-[r:ASSOCIATED_WITH]->(b)
       SET r.relationship_type = $relType, r.description = $description`,
      rel,
    )
  }
  console.log(`    ✓ ${associatedWith.length} relationships`)

  // EMPLOYED_BY (Person → Organization)
  console.log('  EMPLOYED_BY...')
  for (const rel of employedBy) {
    await executeWrite(
      `MATCH (p:Person {id: $personId}), (o:Organization {id: $orgId})
       MERGE (p)-[r:EMPLOYED_BY]->(o)`,
      rel,
    )
  }
  console.log(`    ✓ ${employedBy.length} relationships`)

  // AFFILIATED_WITH (Person → Organization)
  console.log('  AFFILIATED_WITH...')
  for (const rel of affiliatedWith) {
    await executeWrite(
      `MATCH (p:Person {id: $personId}), (o:Organization {id: $orgId})
       MERGE (p)-[r:AFFILIATED_WITH]->(o)`,
      rel,
    )
  }
  console.log(`    ✓ ${affiliatedWith.length} relationships`)

  // OWNED (Person → Location)
  console.log('  OWNED...')
  for (const rel of owned) {
    await executeWrite(
      `MATCH (p:Person {id: $ownerId}), (l:Location {id: $locationId})
       MERGE (p)-[r:OWNED]->(l)`,
      { ownerId: rel.ownerId, locationId: rel.locationId },
    )
  }
  console.log(`    ✓ ${owned.length} relationships`)

  // PARTICIPATED_IN (Person → Event)
  console.log('  PARTICIPATED_IN...')
  for (const rel of participatedIn) {
    await executeWrite(
      `MATCH (p:Person {id: $personId}), (e:Event {id: $eventId})
       MERGE (p)-[r:PARTICIPATED_IN]->(e)`,
      rel,
    )
  }
  console.log(`    ✓ ${participatedIn.length} relationships`)

  // FILED_IN (Document → LegalCase)
  console.log('  FILED_IN...')
  for (const rel of filedIn) {
    await executeWrite(
      `MATCH (d:Document {id: $docId}), (c:LegalCase {id: $caseId})
       MERGE (d)-[r:FILED_IN]->(c)`,
      rel,
    )
  }
  console.log(`    ✓ ${filedIn.length} relationships`)

  // DOCUMENTED_BY (Event → Document)
  console.log('  DOCUMENTED_BY...')
  for (const rel of documentedBy) {
    await executeWrite(
      `MATCH (e:Event {id: $eventId}), (d:Document {id: $docId})
       MERGE (e)-[r:DOCUMENTED_BY]->(d)`,
      rel,
    )
  }
  console.log(`    ✓ ${documentedBy.length} relationships`)

  // MENTIONED_IN (Person → Document)
  console.log('  MENTIONED_IN...')
  for (const rel of mentionedIn) {
    await executeWrite(
      `MATCH (p:Person {id: $personId}), (d:Document {id: $docId})
       MERGE (p)-[r:MENTIONED_IN]->(d)`,
      rel,
    )
  }
  console.log(`    ✓ ${mentionedIn.length} relationships`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const start = Date.now()

  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Connected.')

  await seedPersons()
  await seedLocations()
  await seedEvents()
  await seedDocuments()
  await seedOrganizations()
  await seedLegalCases()
  await seedRelationships()

  const duration = Date.now() - start
  console.log(`\n${'─'.repeat(50)}`)
  console.log('Seed summary:')
  console.log(`  Persons:       ${persons.length}`)
  console.log(`  Locations:     ${locations.length}`)
  console.log(`  Events:        ${events.length}`)
  console.log(`  Documents:     ${documents.length}`)
  console.log(`  Organizations: ${organizations.length}`)
  console.log(`  Legal Cases:   ${legalCases.length}`)
  console.log(`  Relationships: ${associatedWith.length + employedBy.length + affiliatedWith.length + owned.length + participatedIn.length + filedIn.length + documentedBy.length + mentionedIn.length}`)
  console.log(`\nCompleted in ${duration}ms`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Seed script failed:', error)
  closeDriver().finally(() => process.exit(1))
})
