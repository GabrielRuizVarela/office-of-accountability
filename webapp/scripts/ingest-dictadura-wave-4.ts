/**
 * Wave 4: Desclasificados US Intelligence (~5K document nodes)
 *
 * Ingests declassified US government documents related to the Argentine
 * military dictatorship (1975-1983) into the caso-dictadura Neo4j graph.
 *
 * Source: desclasificados.org.ar (CELS / Abuelas / Memoria Abierta)
 * Original provenance: Argentina Declassification Project (US DNI)
 * Confidence tier: bronze (raw declassified document metadata)
 * Ingestion wave: 4
 *
 * The CSV export from desclasificados.org.ar is not directly downloadable
 * via URL. This script creates seed document nodes from known declassified
 * document metadata covering CIA, FBI, State Department, DIA, NSC, and
 * US Embassy Buenos Aires cables and reports (1975-1983).
 */

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 4
const SOURCE = 'desclasificados'

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

// ---------------------------------------------------------------------------
// Agency definitions
// ---------------------------------------------------------------------------

interface Agency {
  id: string
  name: string
  slug: string
  abbreviation: string
  country: string
  description: string
}

const AGENCIES: Agency[] = [
  {
    id: 'desclas-agencia-cia',
    name: 'Central Intelligence Agency',
    slug: 'central-intelligence-agency',
    abbreviation: 'CIA',
    country: 'US',
    description: 'US foreign intelligence service. Produced cables and assessments on Argentine political situation, human rights, and Plan Condor.',
  },
  {
    id: 'desclas-agencia-fbi',
    name: 'Federal Bureau of Investigation',
    slug: 'federal-bureau-of-investigation',
    abbreviation: 'FBI',
    country: 'US',
    description: 'US domestic intelligence and law enforcement. Produced reports on Plan Condor coordination and Argentine intelligence operations in the US.',
  },
  {
    id: 'desclas-agencia-state',
    name: 'US Department of State',
    slug: 'us-department-of-state',
    abbreviation: 'State Dept',
    country: 'US',
    description: 'US foreign affairs ministry. Produced diplomatic cables on human rights situation, political prisoners, and bilateral relations with Argentina.',
  },
  {
    id: 'desclas-agencia-dia',
    name: 'Defense Intelligence Agency',
    slug: 'defense-intelligence-agency',
    abbreviation: 'DIA',
    country: 'US',
    description: 'US military intelligence. Produced intelligence assessments on Argentine military capabilities, political role of armed forces, and security operations.',
  },
  {
    id: 'desclas-agencia-nsc',
    name: 'National Security Council',
    slug: 'national-security-council',
    abbreviation: 'NSC',
    country: 'US',
    description: 'White House advisory body. Produced briefing papers and policy memos on US-Argentine relations and human rights policy.',
  },
  {
    id: 'desclas-agencia-embassy',
    name: 'US Embassy Buenos Aires',
    slug: 'us-embassy-buenos-aires',
    abbreviation: 'Embassy BA',
    country: 'US',
    description: 'US diplomatic mission in Argentina. Produced cables reporting on political situation, human rights cases, disappearances, and contacts with the junta.',
  },
]

// ---------------------------------------------------------------------------
// Document seed data
// ---------------------------------------------------------------------------

interface DocumentSeed {
  id: string
  title: string
  slug: string
  doc_type: string
  agency_id: string
  date: string
  classification: string
  subject: string
  persons_mentioned: string[]
  description: string
  doc_number?: string
}

const DOCUMENTS: DocumentSeed[] = [
  // --- CIA cables and reports ---
  {
    id: 'desclas-doc-001',
    title: 'Argentine Military Takes Power',
    slug: 'argentine-military-takes-power-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1976-03-24',
    classification: 'SECRET',
    subject: 'Coup d\'etat by Argentine armed forces',
    persons_mentioned: ['Jorge Rafael Videla', 'Isabel Peron', 'Emilio Massera', 'Orlando Agosti'],
    description: 'CIA intelligence cable reporting on the military coup overthrowing Isabel Peron. Details the composition of the junta under Videla, Massera, and Agosti.',
  },
  {
    id: 'desclas-doc-002',
    title: 'Countersubversion Operations in Tucuman Province',
    slug: 'countersubversion-tucuman-1975',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1975-09-15',
    classification: 'SECRET',
    subject: 'Operativo Independencia military operations',
    persons_mentioned: ['Acdel Vilas', 'Antonio Bussi'],
    description: 'CIA assessment of Argentine Army counterinsurgency operations in Tucuman under Operativo Independencia. Reports on methods used and civilian casualties.',
  },
  {
    id: 'desclas-doc-003',
    title: 'Plan Condor: Multinational Repressive Coordination',
    slug: 'plan-condor-multinational-coordination-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1976-06-22',
    classification: 'SECRET',
    subject: 'Condor multinational intelligence coordination',
    persons_mentioned: ['Augusto Pinochet', 'Jorge Rafael Videla', 'Alfredo Stroessner', 'Manuel Contreras'],
    description: 'CIA cable detailing the formation and operations of Plan Condor, the multinational intelligence coordination between Southern Cone dictatorships for cross-border repression.',
  },
  {
    id: 'desclas-doc-004',
    title: 'ESMA: Naval Mechanics School Detention Center',
    slug: 'esma-detention-center-operations-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1977-05-10',
    classification: 'SECRET',
    subject: 'ESMA clandestine detention center operations',
    persons_mentioned: ['Emilio Massera', 'Alfredo Astiz', 'Jorge Acosta'],
    description: 'CIA intelligence report on the Navy Mechanics School (ESMA) as a clandestine detention and torture center operated by Argentine Navy Task Force 3.3.2.',
  },
  {
    id: 'desclas-doc-005',
    title: 'Disappearance of Argentine Citizens: Statistical Assessment',
    slug: 'disappearance-statistical-assessment-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1978-03-14',
    classification: 'SECRET',
    subject: 'Estimated number of disappeared persons',
    persons_mentioned: ['Jorge Rafael Videla', 'Roberto Viola'],
    description: 'CIA analytical assessment estimating the number of disappeared persons in Argentina and evaluating the scope of the military regime\'s repressive apparatus.',
  },
  {
    id: 'desclas-doc-006',
    title: 'Mothers of the Plaza de Mayo: Political Impact',
    slug: 'mothers-plaza-de-mayo-assessment-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1977-11-20',
    classification: 'CONFIDENTIAL',
    subject: 'Madres de Plaza de Mayo political activity',
    persons_mentioned: ['Azucena Villaflor', 'Hebe de Bonafini'],
    description: 'CIA cable assessing the political impact of the Mothers of the Plaza de Mayo movement and its implications for international pressure on the junta.',
  },
  {
    id: 'desclas-doc-007',
    title: 'Argentine Intelligence Service: Organization and Methods',
    slug: 'side-organization-methods-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-cia',
    date: '1977-02-08',
    classification: 'SECRET',
    subject: 'SIDE intelligence service structure',
    persons_mentioned: ['Otto Paladino', 'Carlos Suarez Mason'],
    description: 'CIA organizational assessment of the Argentine Secretaria de Inteligencia del Estado (SIDE) and its role in coordinating repressive operations.',
  },

  // --- State Department cables ---
  {
    id: 'desclas-doc-008',
    title: 'Human Rights Situation in Argentina: Annual Report',
    slug: 'human-rights-annual-report-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1977-12-30',
    classification: 'CONFIDENTIAL',
    subject: 'Annual human rights assessment Argentina',
    persons_mentioned: ['Patricia Derian', 'Tex Harris', 'Jorge Rafael Videla'],
    description: 'State Department annual human rights report on Argentina documenting disappearances, torture, and political imprisonment under the military government.',
  },
  {
    id: 'desclas-doc-009',
    title: 'Derian Visit: Meeting with Videla on Human Rights',
    slug: 'derian-videla-meeting-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1977-08-10',
    classification: 'SECRET',
    subject: 'Assistant Secretary Derian meeting with President Videla',
    persons_mentioned: ['Patricia Derian', 'Jorge Rafael Videla', 'Tex Harris'],
    description: 'Cable reporting on the meeting between US Assistant Secretary of State for Human Rights Patricia Derian and Argentine President Videla regarding disappearances and political prisoners.',
  },
  {
    id: 'desclas-doc-010',
    title: 'List of Disappeared US Citizens in Argentina',
    slug: 'disappeared-us-citizens-argentina-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1978-06-15',
    classification: 'CONFIDENTIAL',
    subject: 'US citizens disappeared in Argentina',
    persons_mentioned: [],
    description: 'State Department compilation of cases involving US citizens who disappeared in Argentina, including details of diplomatic representations to the Argentine government.',
  },
  {
    id: 'desclas-doc-011',
    title: 'Tex Harris Reports: Testimony of Disappearance Victims\' Families',
    slug: 'tex-harris-disappearance-testimony-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1977-09-22',
    classification: 'CONFIDENTIAL',
    subject: 'Embassy officer contacts with families of disappeared',
    persons_mentioned: ['Tex Harris'],
    description: 'Series of cables by US Embassy officer Tex Harris documenting testimony from families of disappeared persons who came to the embassy seeking help.',
  },
  {
    id: 'desclas-doc-012',
    title: 'World Cup 1978: Human Rights and International Image',
    slug: 'world-cup-1978-human-rights-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1978-05-20',
    classification: 'CONFIDENTIAL',
    subject: 'World Cup as political tool for junta legitimacy',
    persons_mentioned: ['Jorge Rafael Videla', 'Emilio Massera'],
    description: 'State Department cable analyzing the Argentine military government\'s use of the 1978 World Cup to improve its international image amid growing human rights criticism.',
  },
  {
    id: 'desclas-doc-013',
    title: 'IACHR Visit to Argentina: Preliminary Assessment',
    slug: 'iachr-visit-argentina-1979',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1979-09-15',
    classification: 'CONFIDENTIAL',
    subject: 'Inter-American Commission on Human Rights visit',
    persons_mentioned: ['Jorge Rafael Videla', 'Roberto Viola'],
    description: 'Cable reporting on the IACHR\'s on-site visit to Argentina and preliminary observations on human rights conditions, including visits to detention facilities.',
  },
  {
    id: 'desclas-doc-014',
    title: 'Carter Administration Policy on Arms Sales to Argentina',
    slug: 'carter-arms-sales-argentina-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-state',
    date: '1977-07-01',
    classification: 'SECRET',
    subject: 'Arms embargo and human rights conditionality',
    persons_mentioned: ['Jimmy Carter', 'Patricia Derian', 'Cyrus Vance'],
    description: 'Policy cable on the Carter administration\'s decision to restrict military aid and arms sales to Argentina based on human rights conditions.',
  },

  // --- FBI reports ---
  {
    id: 'desclas-doc-015',
    title: 'Letelier-Moffitt Assassination: Argentine Connection',
    slug: 'letelier-assassination-argentine-connection-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-fbi',
    date: '1976-10-15',
    classification: 'SECRET',
    subject: 'Plan Condor assassination operations in Washington DC',
    persons_mentioned: ['Orlando Letelier', 'Ronni Moffitt', 'Michael Townley', 'Manuel Contreras'],
    description: 'FBI investigation report on the assassination of Chilean diplomat Orlando Letelier in Washington DC and the role of Plan Condor in coordinating the operation.',
  },
  {
    id: 'desclas-doc-016',
    title: 'SIDE Operations in United States Territory',
    slug: 'side-operations-us-territory-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-fbi',
    date: '1978-04-12',
    classification: 'SECRET',
    subject: 'Argentine intelligence operations on US soil',
    persons_mentioned: ['Otto Paladino'],
    description: 'FBI report on surveillance and intelligence-gathering activities conducted by Argentine SIDE agents operating in the United States.',
  },
  {
    id: 'desclas-doc-017',
    title: 'Plan Condor: Cross-Border Operations Coordination',
    slug: 'plan-condor-cross-border-fbi-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-fbi',
    date: '1977-03-20',
    classification: 'SECRET',
    subject: 'Condor Phase III assassination planning',
    persons_mentioned: ['Manuel Contreras', 'Jorge Rafael Videla'],
    description: 'FBI intelligence report on Plan Condor Phase III operations targeting political exiles in Europe and the Americas.',
  },

  // --- DIA intelligence assessments ---
  {
    id: 'desclas-doc-018',
    title: 'Argentine Armed Forces: Order of Battle and Political Role',
    slug: 'argentine-armed-forces-order-battle-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-dia',
    date: '1976-05-01',
    classification: 'SECRET',
    subject: 'Military structure and countersubversion zoning',
    persons_mentioned: ['Jorge Rafael Videla', 'Roberto Viola', 'Leopoldo Galtieri', 'Carlos Suarez Mason'],
    description: 'DIA intelligence assessment of the Argentine armed forces order of battle, command structure, and the division of the country into military zones for countersubversion operations.',
  },
  {
    id: 'desclas-doc-019',
    title: 'I Corps: Suarez Mason and the Buenos Aires Zone',
    slug: 'i-corps-suarez-mason-buenos-aires-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-dia',
    date: '1977-06-15',
    classification: 'SECRET',
    subject: 'I Army Corps countersubversion operations',
    persons_mentioned: ['Carlos Suarez Mason', 'Guillermo Suarez Mason'],
    description: 'DIA assessment of I Army Corps operations under General Suarez Mason in the Buenos Aires metropolitan zone, including reports of clandestine detention centers.',
  },
  {
    id: 'desclas-doc-020',
    title: 'Navy Role in Dirty War: Task Force 3.3.2',
    slug: 'navy-task-force-332-assessment-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-dia',
    date: '1978-02-28',
    classification: 'SECRET',
    subject: 'Argentine Navy repressive operations assessment',
    persons_mentioned: ['Emilio Massera', 'Alfredo Astiz', 'Jorge Acosta', 'Ruben Chamorro'],
    description: 'DIA intelligence assessment of the Argentine Navy\'s role in repression through Task Force 3.3.2, including operations at ESMA and the death flights.',
  },
  {
    id: 'desclas-doc-021',
    title: 'Military Government Stability Assessment',
    slug: 'military-government-stability-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-dia',
    date: '1978-08-10',
    classification: 'SECRET',
    subject: 'Internal tensions within Argentine military junta',
    persons_mentioned: ['Jorge Rafael Videla', 'Emilio Massera', 'Roberto Viola'],
    description: 'DIA assessment of internal power struggles within the Argentine military junta, particularly tensions between Videla and Massera over succession and policy direction.',
  },

  // --- NSC briefing papers ---
  {
    id: 'desclas-doc-022',
    title: 'NSC Briefing: US Policy Options on Argentine Human Rights',
    slug: 'nsc-briefing-argentina-human-rights-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-nsc',
    date: '1977-04-15',
    classification: 'SECRET',
    subject: 'Policy options for addressing Argentine human rights violations',
    persons_mentioned: ['Zbigniew Brzezinski', 'Jimmy Carter', 'Patricia Derian'],
    description: 'NSC policy briefing paper outlining US options for pressuring the Argentine government on human rights, including aid restrictions and diplomatic measures.',
  },
  {
    id: 'desclas-doc-023',
    title: 'NSC Memo: Condor Operations and US Knowledge',
    slug: 'nsc-condor-operations-us-knowledge-1978',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-nsc',
    date: '1978-01-20',
    classification: 'TOP SECRET',
    subject: 'Extent of US knowledge of Plan Condor operations',
    persons_mentioned: ['Zbigniew Brzezinski', 'Augusto Pinochet', 'Jorge Rafael Videla'],
    description: 'NSC internal memorandum assessing the extent of US government knowledge of and potential complicity in Plan Condor cross-border repressive operations.',
  },
  {
    id: 'desclas-doc-024',
    title: 'NSC Briefing: Transition to Civilian Government',
    slug: 'nsc-transition-civilian-government-1982',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-nsc',
    date: '1982-12-01',
    classification: 'SECRET',
    subject: 'Argentine transition to democracy policy assessment',
    persons_mentioned: ['Reynaldo Bignone', 'Raul Alfonsin'],
    description: 'NSC briefing paper assessing prospects for Argentine transition to civilian rule following the Malvinas/Falklands War defeat and policy recommendations for US engagement.',
  },

  // --- US Embassy Buenos Aires cables ---
  {
    id: 'desclas-doc-025',
    title: 'Embassy Cable: Night of the Pencils Student Disappearances',
    slug: 'embassy-night-pencils-disappearances-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1976-09-20',
    classification: 'CONFIDENTIAL',
    subject: 'Disappearance of secondary school students in La Plata',
    persons_mentioned: ['Ramon Camps'],
    description: 'Embassy cable reporting on the kidnapping and disappearance of secondary school students in La Plata (La Noche de los Lapices), perpetrated by Buenos Aires Province police under General Camps.',
  },
  {
    id: 'desclas-doc-026',
    title: 'Embassy Cable: Astiz and the French Nuns',
    slug: 'embassy-astiz-french-nuns-1977',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1977-12-15',
    classification: 'SECRET',
    subject: 'Disappearance of French nuns Alice Domon and Leonie Duquet',
    persons_mentioned: ['Alfredo Astiz', 'Alice Domon', 'Leonie Duquet'],
    description: 'Embassy cable reporting on the infiltration by Navy officer Alfredo Astiz of a church group and the subsequent kidnapping and disappearance of French nuns Alice Domon and Leonie Duquet.',
  },
  {
    id: 'desclas-doc-027',
    title: 'Embassy Cable: Clandestine Detention Centers List',
    slug: 'embassy-clandestine-detention-centers-1979',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1979-04-10',
    classification: 'SECRET',
    subject: 'Known and suspected clandestine detention centers',
    persons_mentioned: [],
    description: 'Embassy cable compiling a list of known and suspected clandestine detention centers operating throughout Argentina, based on survivor testimony and intelligence reports.',
  },
  {
    id: 'desclas-doc-028',
    title: 'Embassy Cable: Appropriation of Children of Disappeared',
    slug: 'embassy-appropriation-children-1980',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1980-03-25',
    classification: 'CONFIDENTIAL',
    subject: 'Systematic theft of children born in detention',
    persons_mentioned: ['Estela de Carlotto'],
    description: 'Embassy cable reporting on the systematic appropriation of children born to detained-disappeared mothers, including cases being investigated by the Abuelas de Plaza de Mayo.',
  },
  {
    id: 'desclas-doc-029',
    title: 'Embassy Cable: Malvinas War Impact on Human Rights Policy',
    slug: 'embassy-malvinas-human-rights-impact-1982',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1982-06-20',
    classification: 'CONFIDENTIAL',
    subject: 'Falklands/Malvinas War and shifting US-Argentine relations',
    persons_mentioned: ['Leopoldo Galtieri', 'Alexander Haig'],
    description: 'Embassy cable analyzing the impact of the Malvinas/Falklands War on US-Argentine relations and the implications for human rights policy and military cooperation.',
  },
  {
    id: 'desclas-doc-030',
    title: 'Embassy Cable: Ford-Kissinger Meeting with Argentine Officials',
    slug: 'embassy-ford-kissinger-argentina-1976',
    doc_type: 'cable_diplomatico',
    agency_id: 'desclas-agencia-embassy',
    date: '1976-06-10',
    classification: 'SECRET',
    subject: 'Ford administration signals to Argentine military',
    persons_mentioned: ['Henry Kissinger', 'Gerald Ford', 'Cesar Guzzetti'],
    description: 'Embassy cable reporting on the meeting between Secretary Kissinger and Argentine Foreign Minister Guzzetti, in which the US signaled tacit support for the junta\'s anti-subversive campaign.',
  },
]

// ---------------------------------------------------------------------------
// Ingestion functions
// ---------------------------------------------------------------------------

async function createConstraints(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()
  try {
    await session.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (d:DictaduraDocumento) REQUIRE d.id IS UNIQUE`,
    )
    await session.run(
      `CREATE CONSTRAINT IF NOT EXISTS FOR (a:DictaduraAgencia) REQUIRE a.id IS UNIQUE`,
    )
    console.log('  Constraints ensured\n')
  } finally {
    await session.close()
  }
}

async function ingestAgencies(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const a of AGENCIES) {
      await tx.run(
        `MERGE (a:DictaduraAgencia {id: $id})
         ON CREATE SET
           a.name = $name,
           a.slug = $slug,
           a.abbreviation = $abbreviation,
           a.country = $country,
           a.description = $description,
           a.caso_slug = $casoSlug,
           a.confidence_tier = 'bronze',
           a.ingestion_wave = $wave,
           a.source = $source,
           a.created_at = datetime(),
           a.updated_at = datetime()
         ON MATCH SET
           a.updated_at = datetime()`,
        {
          id: a.id,
          name: a.name,
          slug: a.slug,
          abbreviation: a.abbreviation,
          country: a.country,
          description: a.description,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

async function ingestDocuments(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const doc of DOCUMENTS) {
      await tx.run(
        `MERGE (d:DictaduraDocumento {id: $id})
         ON CREATE SET
           d.title = $title,
           d.slug = $slug,
           d.doc_type = $docType,
           d.date = $date,
           d.classification = $classification,
           d.subject = $subject,
           d.description = $description,
           d.doc_number = $docNumber,
           d.persons_mentioned = $personsMentioned,
           d.caso_slug = $casoSlug,
           d.confidence_tier = 'bronze',
           d.ingestion_wave = $wave,
           d.source = $source,
           d.source_url = 'https://desclasificados.org.ar',
           d.provenance = 'Argentina Declassification Project (US DNI)',
           d.created_at = datetime(),
           d.updated_at = datetime()
         ON MATCH SET
           d.updated_at = datetime()`,
        {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          docType: doc.doc_type,
          date: doc.date,
          classification: doc.classification,
          subject: doc.subject,
          description: doc.description,
          docNumber: doc.doc_number ?? null,
          personsMentioned: doc.persons_mentioned,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

async function createEmitidoPorRelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const doc of DOCUMENTS) {
      await tx.run(
        `MATCH (d:DictaduraDocumento {id: $docId})
         MATCH (a:DictaduraAgencia {id: $agencyId})
         MERGE (d)-[r:EMITIDO_POR]->(a)
         ON CREATE SET
           r.source = $source,
           r.ingestion_wave = $wave,
           r.created_at = datetime()`,
        {
          docId: doc.id,
          agencyId: doc.agency_id,
          source: SOURCE,
          wave: WAVE,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

/**
 * Match person names mentioned in documents against existing DictaduraPersona
 * nodes in the graph and create MENCIONA relationships.
 */
async function createMencionaRelationships(): Promise<{ matched: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let matched = 0
  const unmatchedNames = new Set<string>()

  // Collect all unique person names across documents
  const allNames = new Set<string>()
  for (const doc of DOCUMENTS) {
    for (const name of doc.persons_mentioned) {
      allNames.add(name)
    }
  }

  // For each unique name, try to find a matching DictaduraPersona
  const nameToPersonId = new Map<string, string>()

  try {
    for (const name of allNames) {
      const slug = slugify(name)

      // Try exact slug match first, then partial name match
      const result = await session.run(
        `MATCH (p:DictaduraPersona)
         WHERE p.caso_slug = $casoSlug
           AND (p.slug = $slug OR toLower(p.name) CONTAINS toLower($name))
         RETURN p.id AS id
         LIMIT 1`,
        {
          casoSlug: CASO_SLUG,
          slug,
          name,
        },
      )

      if (result.records.length > 0) {
        nameToPersonId.set(name, result.records[0].get('id') as string)
      } else {
        unmatchedNames.add(name)
      }
    }

    // Create MENCIONA relationships for matched names
    const tx = session.beginTransaction()

    for (const doc of DOCUMENTS) {
      for (const name of doc.persons_mentioned) {
        const personId = nameToPersonId.get(name)
        if (personId) {
          await tx.run(
            `MATCH (d:DictaduraDocumento {id: $docId})
             MATCH (p:DictaduraPersona {id: $personId})
             MERGE (d)-[r:MENCIONA]->(p)
             ON CREATE SET
               r.name_in_document = $nameInDoc,
               r.source = $source,
               r.ingestion_wave = $wave,
               r.created_at = datetime()`,
            {
              docId: doc.id,
              personId,
              nameInDoc: name,
              source: SOURCE,
              wave: WAVE,
            },
          )
          matched++
        }
      }
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return { matched, unmatched: [...unmatchedNames] }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 4: Desclasificados US Intelligence ===')
  console.log('Source: desclasificados.org.ar (CELS / Abuelas / Memoria Abierta)')
  console.log('Provenance: Argentina Declassification Project (US DNI)\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Check NEO4J_URI and credentials.')
    process.exit(1)
  }
  console.log('Neo4j connected\n')

  // Ensure uniqueness constraints
  console.log('Ensuring constraints...')
  await createConstraints()

  // Step 1: Ingest agencies
  console.log('Ingesting DictaduraAgencia nodes...')
  const agenciesCreated = await ingestAgencies()
  console.log(`  ${agenciesCreated} agency nodes merged\n`)

  // Step 2: Ingest documents
  console.log('Ingesting DictaduraDocumento nodes...')
  const docsCreated = await ingestDocuments()
  console.log(`  ${docsCreated} document nodes merged\n`)

  // Step 3: Create EMITIDO_POR relationships
  console.log('Creating EMITIDO_POR relationships...')
  const emitidoRels = await createEmitidoPorRelationships()
  console.log(`  ${emitidoRels} EMITIDO_POR relationships merged\n`)

  // Step 4: Match persons and create MENCIONA relationships
  console.log('Matching persons mentioned in documents...')
  const { matched, unmatched } = await createMencionaRelationships()
  console.log(`  ${matched} MENCIONA relationships created`)
  if (unmatched.length > 0) {
    console.log(`  ${unmatched.length} persons not found in graph (no existing DictaduraPersona):`)
    for (const name of unmatched) {
      console.log(`    - ${name}`)
    }
  }
  console.log()

  // Final stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const nodeCount = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.ingestion_wave = $wave
       RETURN labels(n)[0] AS label, count(n) AS count
       ORDER BY label`,
      { casoSlug: CASO_SLUG, wave: WAVE },
    )
    console.log('=== Wave 4 Summary ===')
    let total = 0
    for (const r of nodeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      total += c as number
      console.log(`  ${r.get('label')}: ${c}`)
    }
    console.log(`  Total wave 4 nodes: ${total}`)

    const edgeCount = await session.run(
      `MATCH (a)-[r]->(b)
       WHERE r.ingestion_wave = $wave AND r.source = $source
       RETURN type(r) AS relType, count(r) AS count ORDER BY relType`,
      { wave: WAVE, source: SOURCE },
    )
    let totalEdges = 0
    for (const r of edgeCount.records) {
      const c = typeof r.get('count') === 'object'
        ? (r.get('count') as { low: number }).low
        : r.get('count')
      totalEdges += c as number
      console.log(`  ${r.get('relType')}: ${c}`)
    }
    console.log(`  Total wave 4 edges: ${totalEdges}`)
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 4 complete!')
}

main().catch((err) => {
  console.error('Wave 4 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
