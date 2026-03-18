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
  { id: 'ep-doc-maxwell-transcripts', title: 'Maxwell Trial Transcripts', slug: 'maxwell-trial-transcripts', doc_type: 'court_filing', source_url: 'https://www.justice.gov/usao-sdny/united-states-v-ghislaine-maxwell', summary: 'Complete trial transcripts from USA v. Maxwell (20-cr-330) in the Southern District of New York, including witness testimony and evidence presentations.' },
  { id: 'ep-doc-flight-logs', title: 'Lolita Express Flight Logs', slug: 'flight-logs', doc_type: 'flight_log', source_url: '', summary: 'Flight logs for Epstein\'s Boeing 727 (N908JE) and other aircraft released through FOIA requests and court proceedings. Document passengers and routes.' },
  { id: 'ep-doc-black-book', title: 'Epstein Address Book', slug: 'black-book', doc_type: 'court_filing', source_url: '', summary: 'Leaked address book containing names, phone numbers, and addresses of Epstein\'s contacts. Originally obtained by a former employee.' },
  { id: 'ep-doc-npa', title: '2008 Non-Prosecution Agreement', slug: 'non-prosecution-agreement', doc_type: 'court_filing', source_url: '', summary: 'Controversial agreement between US Attorney Alexander Acosta and Epstein\'s legal team granting immunity to unnamed co-conspirators.' },
  { id: 'ep-doc-giuffre-depositions', title: 'Giuffre v. Maxwell Depositions', slug: 'giuffre-depositions', doc_type: 'deposition', source_url: '', summary: 'Depositions from the Giuffre v. Maxwell defamation case, unsealed in 2024. Contain detailed allegations against numerous high-profile individuals.' },
  { id: 'ep-doc-fbi-vault', title: 'FBI Vault Releases', slug: 'fbi-vault-releases', doc_type: 'fbi', source_url: 'https://vault.fbi.gov/jeffrey-epstein', summary: 'FBI records related to Jeffrey Epstein released through the Freedom of Information Act.' },
  { id: 'ep-doc-jpmorgan-comms', title: 'JPMorgan Internal Communications', slug: 'jpmorgan-communications', doc_type: 'financial', source_url: '', summary: 'Internal JPMorgan communications revealed during Jane Doe 1 v. JPMorgan lawsuit showing the bank\'s awareness of Epstein\'s activities.' },
  { id: 'ep-doc-miami-herald', title: 'Perversion of Justice Investigation', slug: 'perversion-of-justice', doc_type: 'media_investigation', source_url: 'https://www.miamiherald.com/topics/jeffrey-epstein', summary: 'Julie K. Brown\'s groundbreaking investigative series for the Miami Herald that reignited public interest and led to Epstein\'s 2019 arrest.' },
  { id: 'ep-doc-pb-police', title: 'Palm Beach Police Report', slug: 'palm-beach-police-report', doc_type: 'police_report', source_url: '', summary: 'Original Palm Beach Police Department investigation report documenting initial complaints and evidence gathered against Epstein.' },
  { id: 'ep-doc-autopsy', title: 'Medical Examiner Report', slug: 'medical-examiner-report', doc_type: 'medical', source_url: '', summary: 'Official autopsy report by NYC Chief Medical Examiner ruling Epstein\'s death a suicide. Findings disputed by independent pathologist Dr. Michael Baden.' },
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
]

const documentedBy = [
  { eventId: 'ep-evt-miami-herald', docId: 'ep-doc-miami-herald' },
  { eventId: 'ep-evt-death', docId: 'ep-doc-autopsy' },
  { eventId: 'ep-evt-npa', docId: 'ep-doc-npa' },
  { eventId: 'ep-evt-maxwell-trial', docId: 'ep-doc-maxwell-transcripts' },
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
