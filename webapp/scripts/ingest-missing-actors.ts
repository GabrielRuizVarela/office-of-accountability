/**
 * Ingest missing key actors into the finanzas-politicas investigation graph.
 *
 * Adds: Néstor Kirchner, Cristina Fernández de Kirchner, Ricardo Jaime,
 *        Roberto Baratta, Oscar Centeno, and updates Nicolás Caputo.
 * Connects them to existing nodes (Báez, De Vido, Máximo, Alberto Fernández, etc.)
 *
 * Run with: NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j npx tsx scripts/ingest-missing-actors.ts
 * Idempotent — safe to re-run (uses MERGE, not CREATE).
 */

import neo4j from 'neo4j-driver-lite'

const CASO_SLUG = 'caso-finanzas-politicas'
const TIER = 'silver'
const SUBMITTED_BY = 'missing-actors-2026-03-21'
const NOW = new Date().toISOString()

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || '')
)

async function run(cypher: string, params: Record<string, unknown> = {}) {
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE })
  try {
    const result = await session.run(cypher, params, { timeout: 60000 })
    return result
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// 1. New Person nodes
// ---------------------------------------------------------------------------

const PERSONS = [
  {
    id: 'fp-kirchner-nestor-carlos',
    name: 'KIRCHNER NESTOR CARLOS',
    description_en:
      'President of Argentina 2003-2007. Governor of Santa Cruz 1991-2003. ' +
      'Deposited USD 630M in provincial oil royalties at Credit Suisse; only USD 9,000 remained by 2021. ' +
      'Patron of Lázaro Báez, whose Austral Construcciones received 80% of Santa Cruz road contracts. ' +
      'Kirchner couple patrimony grew from ARS 7M to ARS 89M during presidency. ' +
      'Died 27 Oct 2010.',
    description_es:
      'Presidente de Argentina 2003-2007. Gobernador de Santa Cruz 1991-2003. ' +
      'Depositó USD 630M en regalías petroleras provinciales en Credit Suisse; para 2021 solo quedaban USD 9.000. ' +
      'Padrino de Lázaro Báez, cuya Austral Construcciones recibió 80% de contratos viales de Santa Cruz. ' +
      'Patrimonio del matrimonio creció de $7M a $89M durante la presidencia. ' +
      'Fallecido 27 oct 2010.',
  },
  {
    id: 'fp-fernandez-de-kirchner-cristina',
    name: 'FERNANDEZ DE KIRCHNER CRISTINA ELISABET',
    description_en:
      'President of Argentina 2007-2015, Vice President 2019-2023. ' +
      'Convicted Dec 2022 in Vialidad case (6yr sentence, fraud in public works). ' +
      'Confirmed by Casación Jun 2025; ordered to return ARS 85B. ' +
      'Declared patrimony of ARS 250M (2023) including USD 170M in NYSE stocks (Mercado Libre, Apple, Microsoft). ' +
      'Co-owned Hotesur SA (Alto Calafate hotel) and Los Sauces SA with family.',
    description_es:
      'Presidenta de Argentina 2007-2015, Vicepresidenta 2019-2023. ' +
      'Condenada dic 2022 en causa Vialidad (6 años, defraudación en obra pública). ' +
      'Confirmada por Casación jun 2025; ordenó devolver $85.000M. ' +
      'Patrimonio declarado de $250M (2023) incluyendo USD 170M en acciones NYSE (Mercado Libre, Apple, Microsoft). ' +
      'Co-propietaria de Hotesur SA (hotel Alto Calafate) y Los Sauces SA con familia.',
  },
  {
    id: 'fp-jaime-ricardo',
    name: 'JAIME RICARDO',
    description_en:
      'Secretary of Transport 2003-2009 under De Vido. ' +
      'Convicted to 8 years for illicit enrichment — acquired LearJet 31A (USD 4M), yacht (USD 1M+), ' +
      'ARS 12M+ in unexplained assets. Fine of ARS 15M. Perpetual disqualification from office. ' +
      '6 total convictions for corruption. Also convicted alongside De Vido for Once tragedy negligence.',
    description_es:
      'Secretario de Transporte 2003-2009 bajo De Vido. ' +
      'Condenado a 8 años por enriquecimiento ilícito — adquirió LearJet 31A (USD 4M), yate (USD 1M+), ' +
      '$12M+ en bienes inexplicados. Multa de $15M. Inhabilitación perpetua para cargos públicos. ' +
      '6 condenas por corrupción. También condenado junto a De Vido por negligencia en tragedia de Once.',
  },
  {
    id: 'fp-baratta-roberto',
    name: 'BARATTA ROBERTO',
    description_en:
      'Subsecretario de Coordinación, Ministry of Federal Planning under De Vido. ' +
      'Central figure in Cuadernos case as the bribe collector ("cajero"). ' +
      'Accused of coordinating payments from state contractors to kirchnerist officials. ' +
      'Convicted in GNL (liquefied natural gas) case Sep 2025. ' +
      'Cuadernos trial ongoing before TOF 7 (2025-2026).',
    description_es:
      'Subsecretario de Coordinación, Ministerio de Planificación Federal bajo De Vido. ' +
      'Figura central de causa Cuadernos como recaudador ("cajero"). ' +
      'Acusado de coordinar pagos de contratistas del estado a funcionarios kirchneristas. ' +
      'Condenado en causa GNL sep 2025. ' +
      'Juicio Cuadernos en curso ante TOF 7 (2025-2026).',
  },
  {
    id: 'fp-centeno-oscar',
    name: 'CENTENO OSCAR',
    description_en:
      'Driver for Roberto Baratta at the Ministry of Planning. ' +
      'Author of the "Cuadernos de las coimas" (bribe notebooks) — 8 notebooks documenting ' +
      'cash deliveries from businessmen to officials 2005-2015. ' +
      'Became cooperating witness (arrepentido) 2018, under protected witness regime. ' +
      'Notebooks digitized by journalist Diego Cabot, published by La Nación Aug 2018.',
    description_es:
      'Chofer de Roberto Baratta en el Ministerio de Planificación. ' +
      'Autor de los "Cuadernos de las coimas" — 8 cuadernos documentando entregas de ' +
      'dinero de empresarios a funcionarios 2005-2015. ' +
      'Se convirtió en arrepentido 2018, bajo régimen de testigo protegido. ' +
      'Cuadernos digitalizados por periodista Diego Cabot, publicados por La Nación ago 2018.',
  },
]

// ---------------------------------------------------------------------------
// 2. New Organization nodes
// ---------------------------------------------------------------------------

const ORGANIZATIONS = [
  {
    id: 'fp-austral-construcciones',
    name: 'AUSTRAL CONSTRUCCIONES S.A.',
    jurisdiction: 'Argentina',
    description_en:
      'Construction company owned by Lázaro Báez. Created 8 May 2003, two weeks before Kirchner presidency. ' +
      'Received 80% of Santa Cruz road public works 2003-2015. Vehicle for illicit enrichment per court ruling.',
    description_es:
      'Constructora de Lázaro Báez. Creada 8 may 2003, dos semanas antes de la presidencia de Kirchner. ' +
      'Recibió 80% de obra pública vial de Santa Cruz 2003-2015. Vehículo de enriquecimiento ilícito según sentencia.',
  },
  {
    id: 'fp-hotesur-sa',
    name: 'HOTESUR S.A.',
    jurisdiction: 'Argentina',
    description_en: 'Kirchner family company operating Alto Calafate hotel. Money laundering case (Los Sauces/Hotesur).',
    description_es: 'Empresa familiar Kirchner que operaba hotel Alto Calafate. Causa lavado de dinero (Los Sauces/Hotesur).',
  },
  {
    id: 'fp-los-sauces-sa',
    name: 'LOS SAUCES S.A.',
    jurisdiction: 'Argentina',
    description_en: 'Kirchner family real estate company. Rented properties to Báez-linked firms at inflated rates.',
    description_es: 'Inmobiliaria familiar Kirchner. Alquiló propiedades a empresas vinculadas a Báez a precios inflados.',
  },
  {
    id: 'fp-caputo-sa',
    name: 'CAPUTO S.A.',
    jurisdiction: 'Argentina',
    description_en:
      'Construction company controlled by Nicolás Caputo. Obtained ARS 1.023B in Buenos Aires public works 2008-2015.',
    description_es:
      'Constructora controlada por Nicolás Caputo. Obtuvo $1.023M en obra pública de Buenos Aires 2008-2015.',
  },
  {
    id: 'fp-ses-sa',
    name: 'SES S.A.',
    jurisdiction: 'Argentina',
    description_en: 'Company controlled by Nicolás Caputo. Major Buenos Aires city public works contractor under Macri.',
    description_es: 'Empresa controlada por Nicolás Caputo. Principal contratista de obra pública de CABA bajo Macri.',
  },
  {
    id: 'fp-iecsa-sa',
    name: 'IECSA S.A.',
    jurisdiction: 'Argentina',
    description_en:
      'Construction company transferred from Franco Macri to Angelo Calcaterra in 2007. ' +
      'Implicated in Cuadernos and Soterramiento del Sarmiento/Odebrecht cases.',
    description_es:
      'Constructora transferida de Franco Macri a Angelo Calcaterra en 2007. ' +
      'Implicada en causas Cuadernos y Soterramiento del Sarmiento/Odebrecht.',
  },
]

// ---------------------------------------------------------------------------
// 3. New Event nodes
// ---------------------------------------------------------------------------

const EVENTS = [
  {
    id: 'fp-vialidad-conviction-2022',
    title: 'Cristina Kirchner convicted — Vialidad case',
    date: '2022-12-06',
    description_en: 'TOF 2 convicted Cristina Kirchner to 6 years for fraud in Santa Cruz public works. Also convicted Báez (6yr), De Vido, and others.',
    description_es: 'TOF 2 condenó a Cristina Kirchner a 6 años por defraudación en obra pública de Santa Cruz. También condenó a Báez (6 años), De Vido y otros.',
  },
  {
    id: 'fp-casacion-confirmation-2025',
    title: 'Casación confirms Vialidad conviction',
    date: '2025-06-11',
    description_en: 'Casación confirmed Cristina Kirchner conviction. Ordered return of ARS 85B. Sentence now firm.',
    description_es: 'Casación confirmó condena a Cristina Kirchner. Ordenó devolución de $85.000M. Sentencia firme.',
  },
  {
    id: 'fp-cuadernos-trial-2025',
    title: 'Cuadernos trial begins — TOF 7',
    date: '2025-09-09',
    description_en: 'Oral trial for Cuadernos case begins before TOF 7. Defendants include Cristina Kirchner, De Vido, Baratta, and dozens of businessmen.',
    description_es: 'Juicio oral por causa Cuadernos comienza ante TOF 7. Imputados incluyen Cristina Kirchner, De Vido, Baratta y decenas de empresarios.',
  },
  {
    id: 'fp-once-tragedy-2012',
    title: 'Once railway tragedy — 52 dead',
    date: '2012-02-22',
    description_en: 'Sarmiento line train crash at Once station killed 52 people. Jaime and De Vido later convicted for negligent homicide related to transport subsidy diversion.',
    description_es: 'Choque de tren línea Sarmiento en estación Once mató 52 personas. Jaime y De Vido luego condenados por homicidio culposo por desvío de subsidios de transporte.',
  },
  {
    id: 'fp-jaime-enrichment-conviction',
    title: 'Ricardo Jaime convicted — illicit enrichment',
    date: '2021-12-17',
    description_en: 'TOF 6 convicted Ricardo Jaime to 8 years for illicit enrichment. LearJet, yacht, ARS 12M unexplained assets.',
    description_es: 'TOF 6 condenó a Ricardo Jaime a 8 años por enriquecimiento ilícito. LearJet, yate, $12M en bienes inexplicados.',
  },
  {
    id: 'fp-baratta-gnl-conviction-2025',
    title: 'Roberto Baratta convicted — GNL case',
    date: '2025-09-15',
    description_en: 'Baratta convicted in GNL (liquefied natural gas) import fraud case.',
    description_es: 'Baratta condenado en causa GNL (fraude en importación de gas natural licuado).',
  },
  {
    id: 'fp-cuadernos-published-2018',
    title: 'Cuadernos de las coimas published',
    date: '2018-08-01',
    description_en: 'La Nación journalist Diego Cabot published digitized Centeno notebooks revealing systematic bribery circuit 2005-2015.',
    description_es: 'Periodista de La Nación Diego Cabot publicó cuadernos digitalizados de Centeno revelando circuito sistemático de coimas 2005-2015.',
  },
]

// ---------------------------------------------------------------------------
// Execution helpers
// ---------------------------------------------------------------------------

async function ingestPersons() {
  console.log(`\n--- Ingesting ${PERSONS.length} persons ---`)
  for (const p of PERSONS) {
    await run(
      `MERGE (n:Person {id: $id})
       ON CREATE SET
         n.name = $name,
         n.caso_slug = $caso,
         n.confidence_tier = $tier,
         n.description = $desc_en,
         n.description_en = $desc_en,
         n.description_es = $desc_es,
         n.submitted_by = $submitted,
         n.created_at = $now,
         n.updated_at = $now
       ON MATCH SET
         n.description = $desc_en,
         n.description_en = $desc_en,
         n.description_es = $desc_es,
         n.updated_at = $now`,
      {
        id: p.id,
        name: p.name,
        caso: CASO_SLUG,
        tier: TIER,
        desc_en: p.description_en,
        desc_es: p.description_es,
        submitted: SUBMITTED_BY,
        now: NOW,
      }
    )
    console.log(`  + ${p.name}`)
  }
}

async function ingestOrganizations() {
  console.log(`\n--- Ingesting ${ORGANIZATIONS.length} organizations ---`)
  for (const o of ORGANIZATIONS) {
    await run(
      `MERGE (n:Organization {id: $id})
       ON CREATE SET
         n.name = $name,
         n.caso_slug = $caso,
         n.confidence_tier = $tier,
         n.jurisdiction = $jurisdiction,
         n.description = $desc_en,
         n.description_en = $desc_en,
         n.description_es = $desc_es,
         n.submitted_by = $submitted,
         n.created_at = $now,
         n.updated_at = $now
       ON MATCH SET
         n.updated_at = $now`,
      {
        id: o.id,
        name: o.name,
        caso: CASO_SLUG,
        tier: TIER,
        jurisdiction: o.jurisdiction,
        desc_en: o.description_en,
        desc_es: o.description_es,
        submitted: SUBMITTED_BY,
        now: NOW,
      }
    )
    console.log(`  + ${o.name}`)
  }
}

async function ingestEvents() {
  console.log(`\n--- Ingesting ${EVENTS.length} events ---`)
  for (const e of EVENTS) {
    await run(
      `MERGE (n:Event {event_id: $id})
       ON CREATE SET
         n.name = $title,
         n.title = $title,
         n.caso_slug = $caso,
         n.confidence_tier = $tier,
         n.date = $date,
         n.description_en = $desc_en,
         n.description_es = $desc_es,
         n.submitted_by = $submitted,
         n.created_at = $now,
         n.updated_at = $now
       ON MATCH SET
         n.name = coalesce(n.name, $title),
         n.updated_at = $now`,
      {
        id: e.id,
        title: e.title,
        caso: CASO_SLUG,
        tier: TIER,
        date: e.date,
        desc_en: e.description_en,
        desc_es: e.description_es,
        submitted: SUBMITTED_BY,
        now: NOW,
      }
    )
    console.log(`  + ${e.title} (${e.date})`)
  }
}

async function ingestRelationships() {
  // We define relationships as tuples to keep it compact
  // Each: [matchCypher, mergeRel, params, label]
  const rels: Array<[string, string, Record<string, unknown>, string]> = [
    // ---------------------------------------------------------------
    // Kirchner Néstor connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {name: 'BAEZ LAZARO', caso_slug: $caso})`,
      `MERGE (a)-[r:PATRON_OF]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Báez was Kirchner bank employee turned construction magnate. Austral got 80% Santa Cruz road works.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[PATRON_OF]-> Baez Lazaro',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {name: 'DE VIDO JULIO', caso_slug: $caso})`,
      `MERGE (a)-[r:APPOINTED]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Appointed De Vido as Minister of Federal Planning 2003-2015.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[APPOINTED]-> De Vido',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {id: 'fp-kirchner-maximo-carlos'})`,
      `MERGE (a)-[r:PARENT_OF]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Father of Máximo Kirchner.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[PARENT_OF]-> Kirchner Maximo',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {id: 'fp-fernandez-alberto'})`,
      `MERGE (a)-[r:APPOINTED]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Appointed Alberto Fernández as Chief of Cabinet 2003-2008.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[APPOINTED]-> Fernandez Alberto',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {id: 'fp-fernandez-de-kirchner-cristina'})`,
      `MERGE (a)-[r:MARRIED_TO]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Married. Political partnership governing Argentina 2003-2015.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[MARRIED_TO]-> Cristina',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Organization {id: 'fp-hotesur-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Co-owner of Hotesur SA (Alto Calafate hotel).', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[CONTROLS]-> Hotesur',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Organization {id: 'fp-los-sauces-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Co-owner of Los Sauces SA real estate company.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[CONTROLS]-> Los Sauces',
    ],

    // ---------------------------------------------------------------
    // Cristina Kirchner connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Person {id: 'fp-kirchner-maximo-carlos'})`,
      `MERGE (a)-[r:PARENT_OF]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Mother of Máximo Kirchner.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[PARENT_OF]-> Kirchner Maximo',
    ],
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Organization {id: 'fp-hotesur-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Co-owner and beneficiary of Hotesur SA.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[CONTROLS]-> Hotesur',
    ],
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Organization {id: 'fp-los-sauces-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Co-owner of Los Sauces SA.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[CONTROLS]-> Los Sauces',
    ],
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Event {event_id: 'fp-vialidad-conviction-2022'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Convicted to 6 years for fraud.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[INVOLVED_IN]-> Vialidad conviction',
    ],
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Event {event_id: 'fp-casacion-confirmation-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Conviction confirmed, ARS 85B return ordered.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[INVOLVED_IN]-> Casacion confirmation',
    ],
    [
      `MATCH (a:Person {id: 'fp-fernandez-de-kirchner-cristina'}), (b:Event {event_id: 'fp-cuadernos-trial-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Defendant in Cuadernos case.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Cristina -[INVOLVED_IN]-> Cuadernos trial',
    ],
    [
      `MATCH (a:Person {name: 'BAEZ LAZARO', caso_slug: $caso}), (b:Event {event_id: 'fp-vialidad-conviction-2022'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Convicted to 6 years for fraud.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Baez -[INVOLVED_IN]-> Vialidad conviction',
    ],

    // ---------------------------------------------------------------
    // Báez -> Austral
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {name: 'BAEZ LAZARO', caso_slug: $caso}), (b:Organization {id: 'fp-austral-construcciones'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Owner of Austral Construcciones.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Baez -[CONTROLS]-> Austral Construcciones',
    ],

    // ---------------------------------------------------------------
    // Jaime connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fp-jaime-ricardo'}), (b:Person {name: 'DE VIDO JULIO', caso_slug: $caso})`,
      `MERGE (a)-[r:SUBORDINATE_OF]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Secretary of Transport under Minister De Vido 2003-2009.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Jaime -[SUBORDINATE_OF]-> De Vido',
    ],
    [
      `MATCH (a:Person {id: 'fp-jaime-ricardo'}), (b:Event {event_id: 'fp-once-tragedy-2012'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Convicted for negligent homicide — transport subsidy diversion.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Jaime -[INVOLVED_IN]-> Once tragedy',
    ],
    [
      `MATCH (a:Person {name: 'DE VIDO JULIO', caso_slug: $caso}), (b:Event {event_id: 'fp-once-tragedy-2012'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Convicted for negligent homicide alongside Jaime.', caso_slug: CASO_SLUG, created_at: NOW } },
      'De Vido -[INVOLVED_IN]-> Once tragedy',
    ],
    [
      `MATCH (a:Person {id: 'fp-jaime-ricardo'}), (b:Event {event_id: 'fp-jaime-enrichment-conviction'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: '8 years, illicit enrichment.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Jaime -[INVOLVED_IN]-> enrichment conviction',
    ],
    [
      `MATCH (a:Person {id: 'fp-kirchner-nestor-carlos'}), (b:Person {id: 'fp-jaime-ricardo'})`,
      `MERGE (a)-[r:APPOINTED]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Appointed Jaime as Secretary of Transport 2003.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Kirchner Nestor -[APPOINTED]-> Jaime',
    ],

    // ---------------------------------------------------------------
    // Baratta connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fp-baratta-roberto'}), (b:Person {name: 'DE VIDO JULIO', caso_slug: $caso})`,
      `MERGE (a)-[r:SUBORDINATE_OF]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Subsecretario de Coordinación under Minister De Vido.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Baratta -[SUBORDINATE_OF]-> De Vido',
    ],
    [
      `MATCH (a:Person {id: 'fp-baratta-roberto'}), (b:Event {event_id: 'fp-cuadernos-trial-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Key defendant — the bribe collector.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Baratta -[INVOLVED_IN]-> Cuadernos trial',
    ],
    [
      `MATCH (a:Person {id: 'fp-baratta-roberto'}), (b:Event {event_id: 'fp-baratta-gnl-conviction-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Convicted in GNL fraud case.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Baratta -[INVOLVED_IN]-> GNL conviction',
    ],
    [
      `MATCH (a:Person {name: 'DE VIDO JULIO', caso_slug: $caso}), (b:Event {event_id: 'fp-cuadernos-trial-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Co-defendant in Cuadernos case.', caso_slug: CASO_SLUG, created_at: NOW } },
      'De Vido -[INVOLVED_IN]-> Cuadernos trial',
    ],

    // ---------------------------------------------------------------
    // Centeno connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fp-centeno-oscar'}), (b:Person {id: 'fp-baratta-roberto'})`,
      `MERGE (a)-[r:DROVE_FOR]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Ministry of Planning driver. Wrote the bribe notebooks documenting Baratta collections.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Centeno -[DROVE_FOR]-> Baratta',
    ],
    [
      `MATCH (a:Person {id: 'fp-centeno-oscar'}), (b:Event {event_id: 'fp-cuadernos-published-2018'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Author of the notebooks.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Centeno -[INVOLVED_IN]-> Cuadernos published',
    ],
    [
      `MATCH (a:Person {id: 'fp-centeno-oscar'}), (b:Event {event_id: 'fp-cuadernos-trial-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Cooperating witness (arrepentido). Refused to testify Mar 2026.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Centeno -[INVOLVED_IN]-> Cuadernos trial',
    ],

    // ---------------------------------------------------------------
    // Caputo Nicolás — update existing node and add connections
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {id: 'fn-caputo-nicolas'}), (b:Person {id: 'fp-macri-mauricio'})`,
      `MERGE (a)-[r:ALLIED_WITH]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Lifelong friend and ally. Schoolmates at Cardenal Newman. First VP of PRO. Called "hermano del alma" by Macri.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Caputo Nicolas -[ALLIED_WITH]-> Macri Mauricio',
    ],
    [
      `MATCH (a:Person {id: 'fn-caputo-nicolas'}), (b:Organization {id: 'fp-caputo-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Head of Caputo SA construction company.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Caputo Nicolas -[CONTROLS]-> Caputo SA',
    ],
    [
      `MATCH (a:Person {id: 'fn-caputo-nicolas'}), (b:Organization {id: 'fp-ses-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { props: { context: 'Controls SES SA. ARS 1.023B in CABA public works 2008-2015.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Caputo Nicolas -[CONTROLS]-> SES SA',
    ],

    // ---------------------------------------------------------------
    // Calcaterra Angelo — connect existing node
    // ---------------------------------------------------------------
    [
      `MATCH (a:Person {name: 'CALCATERRA ANGELO', caso_slug: $caso}), (b:Organization {id: 'fp-iecsa-sa'})`,
      `MERGE (a)-[r:CONTROLS]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Acquired IECSA from Franco Macri 2007. Cousin of Mauricio Macri.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Calcaterra -[CONTROLS]-> IECSA',
    ],
    [
      `MATCH (a:Person {name: 'CALCATERRA ANGELO', caso_slug: $caso}), (b:Person {id: 'fp-baratta-roberto'})`,
      `MERGE (a)-[r:PAID_BRIBES_TO]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Admitted payments to Baratta in Cuadernos case. Became arrepentido 2018.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Calcaterra -[PAID_BRIBES_TO]-> Baratta',
    ],
    [
      `MATCH (a:Person {name: 'CALCATERRA ANGELO', caso_slug: $caso}), (b:Person {id: 'fp-macri-mauricio'})`,
      `MERGE (a)-[r:FAMILY_OF]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Cousin. Son of María Pía Macri (Franco Macri sister).', caso_slug: CASO_SLUG, created_at: NOW } },
      'Calcaterra -[FAMILY_OF]-> Macri Mauricio',
    ],
    [
      `MATCH (a:Person {name: 'CALCATERRA ANGELO', caso_slug: $caso}), (b:Event {event_id: 'fp-cuadernos-trial-2025'})`,
      `MERGE (a)-[r:INVOLVED_IN]->(b) ON CREATE SET r += $props`,
      { caso: CASO_SLUG, props: { context: 'Arrepentido. Payments judged as possible bribes.', caso_slug: CASO_SLUG, created_at: NOW } },
      'Calcaterra -[INVOLVED_IN]-> Cuadernos trial',
    ],
  ]

  console.log(`\n--- Ingesting ${rels.length} relationships ---`)
  for (const [matchCypher, mergeCypher, params, label] of rels) {
    const cypher = `${matchCypher}\n${mergeCypher}`
    await run(cypher, params)
    console.log(`  + ${label}`)
  }
}

async function updateCaputoNicolas() {
  console.log('\n--- Updating Caputo Nicolas description ---')
  await run(
    `MATCH (n:Person {id: 'fn-caputo-nicolas'})
     SET n.description_en = $desc_en,
         n.description_es = $desc_es,
         n.description = $desc_en,
         n.updated_at = $now`,
    {
      desc_en:
        'Argentine businessman. Head of Caputo Group (construction, AC, energy). Fortune USD 340M (Forbes #34 Argentina). ' +
        'Lifelong friend of Macri — schoolmates at Cardenal Newman, first VP of PRO. ' +
        'Controls Caputo SA, SES SA, Mirgor, Sadesa via holding Il Tevere. ' +
        'SES obtained ARS 1.023B in CABA public works under Macri 2008-2015. ' +
        'Pandora Papers: opened secret Swiss account, controlled offshore, later whitened under Macri blanqueo.',
      desc_es:
        'Empresario argentino. Cabeza del Grupo Caputo (construcción, AA, energía). Fortuna USD 340M (Forbes #34 Argentina). ' +
        'Amigo de toda la vida de Macri — compañeros en Cardenal Newman, primer VP de PRO. ' +
        'Controla Caputo SA, SES SA, Mirgor, Sadesa vía holding Il Tevere. ' +
        'SES obtuvo $1.023M en obra pública CABA bajo Macri 2008-2015. ' +
        'Pandora Papers: abrió cuenta secreta en Suiza, controló offshore, luego blanqueó bajo blanqueo macrista.',
      now: NOW,
    }
  )
  console.log('  + Updated fn-caputo-nicolas description')
}

async function reportCounts() {
  const session = driver.session({ defaultAccessMode: neo4j.session.READ })
  try {
    const nr = await session.run("MATCH (n {caso_slug: 'caso-finanzas-politicas'}) RETURN count(n) AS c")
    const er = await session.run("MATCH (a {caso_slug: 'caso-finanzas-politicas'})-[r]->(b) RETURN count(r) AS c")
    console.log(`\n=== Final counts ===`)
    console.log(`Nodes: ${nr.records[0].get('c').toNumber()}`)
    console.log(`Edges: ${er.records[0].get('c').toNumber()}`)
  } finally {
    await session.close()
  }
}

async function main() {
  console.log('=== Missing Actors Ingestion ===')
  console.log(`Caso: ${CASO_SLUG}`)
  console.log(`Tier: ${TIER}`)

  await ingestPersons()
  await ingestOrganizations()
  await ingestEvents()
  await ingestRelationships()
  await updateCaputoNicolas()
  await reportCounts()

  await driver.close()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
