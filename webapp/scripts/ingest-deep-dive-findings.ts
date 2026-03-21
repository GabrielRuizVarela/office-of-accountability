/**
 * Ingest deep-dive findings into Neo4j for caso-finanzas-politicas.
 *
 * Covers: Nucleoeléctrica scandal, Fundación Faro dark money, AFAGate,
 * SURELY SA / Montoto, Romero dynasty, Caputo network, Pesce revolving door,
 * Finaig/Lijo connection, Correo Argentino.
 *
 * Run with: npx tsx scripts/ingest-deep-dive-findings.ts
 * Idempotent — safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-finanzas-politicas'
const TIER = 'silver'
const SUBMITTED_BY = 'deep-dive-2026-03-21'
const NOW = new Date().toISOString()

// ---------------------------------------------------------------------------
// Persons
// ---------------------------------------------------------------------------

const PERSONS = [
  // Nucleoeléctrica scandal
  { id: 'reidel-demian', name: 'REIDEL DEMIAN', description_en: 'Former president of Nucleoeléctrica Argentina, close Milei ally. Resigned Feb 9, 2026 amid 1,066% overpricing scandal. Paid personal debts of $880M to Banco Macro in 18 days.', description_es: 'Ex presidente de Nucleoeléctrica Argentina, aliado de Milei. Renunció 9/2/2026 por sobreprecio de 1.066%. Pagó deudas personales de $880M a Banco Macro en 18 días.', source_url: 'https://www.infobae.com/politica/2026/02/09/demian-reidel-renuncio-a-la-presidencia-de-nucleoelectrica/' },

  // Fundación Faro dark money
  { id: 'laje-agustin', name: 'LAJE AGUSTIN', description_en: 'Executive Director of Fundación Faro Argentina, Milei\'s dark money vehicle. Foundation spent $1.079B on political ads without disclosing donors.', description_es: 'Director Ejecutivo de Fundación Faro Argentina, vehículo de dinero oscuro de Milei. La fundación gastó $1.079B en publicidad política sin revelar donantes.', source_url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/' },
  { id: 'bilbao-la-vieja-ignacio', name: 'BILBAO LA VIEJA IGNACIO MARIA', description_en: 'President of Fundación Faro Argentina since April 2024 board replacement.', description_es: 'Presidente de Fundación Faro Argentina desde el reemplazo de directorio de abril 2024.' },

  // AFA Gate
  { id: 'tapia-claudio', name: 'TAPIA CLAUDIO', description_en: 'AFA president, summoned by federal justice for fraud and money laundering. $19.353B in unpaid taxes. Shell company network in Florida channeled ~USD 400M.', description_es: 'Presidente de AFA, citado por justicia federal por fraude y lavado. $19.353B en impuestos impagos. Red de sociedades fantasma en Florida canalizó ~USD 400M.', source_url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/' },
  { id: 'toviggino-pablo', name: 'TOVIGGINO PABLO', description_en: 'AFA treasurer, co-accused with Tapia in AFAGate fraud case.', description_es: 'Tesorero de AFA, co-acusado con Tapia en causa AFAGate.' },
  { id: 'faroni-javier', name: 'FARONI JAVIER', description_en: 'Producer and ex-legislator, Tapia\'s close friend. Wife Erica Gillette administered TourProdEnter LLC (USD 260M+ diverted).', description_es: 'Productor y ex legislador, amigo cercano de Tapia. Su esposa Erica Gillette administró TourProdEnter LLC (USD 260M+ desviados).' },

  // SURELY SA / Montoto
  { id: 'montoto-mario', name: 'MONTOTO MARIO', description_en: 'Owner of SURELY SA, sole provider of electronic ankle bracelets. Ex-Montonero. Father of Fernanda Raverta (ex-ANSES head). Charges 4x international benchmark.', description_es: 'Dueño de SURELY SA, proveedor único de tobilleras electrónicas. Ex-Montonero. Padre de Fernanda Raverta (ex-titular ANSES). Cobra 4x precio internacional.', source_url: 'https://www.lanacion.com.ar/politica/polemica-y-denuncias-por-el-contrato-de-tobilleras-electronicas-que-se-encamina-a-ganar-montoto-por-nid27042025/' },
  { id: 'raverta-fernanda', name: 'RAVERTA FERNANDA', description_en: 'Former head of ANSES. Daughter of Mario Montoto (SURELY SA owner).', description_es: 'Ex-titular de ANSES. Hija de Mario Montoto (dueño de SURELY SA).' },

  // Romero dynasty
  { id: 'romero-roberto', name: 'ROMERO ROBERTO', description_en: 'Former governor of Salta (1980s), patriarch of Romero media dynasty. Founded El Tribuno newspaper.', description_es: 'Ex gobernador de Salta (1980s), patriarca de la dinastía mediática Romero. Fundó diario El Tribuno.' },

  // Caputo network
  { id: 'bausili-santiago', name: 'BAUSILI SANTIAGO', description_en: 'Subordinate to Caputo, met Deutsche Bank executives at least 5 times. Both claimed recusal on placements.', description_es: 'Subordinado de Caputo, se reunió con ejecutivos de Deutsche Bank al menos 5 veces. Ambos alegaron recusación en colocaciones.' },

  // Pesce revolving door
  { id: 'pesce-agustin', name: 'PESCE AGUSTIN', description_en: 'Government Director + officer of Nación Reaseguros, Red Link, Prisma Medios de Pago, Banco de Inversión y Comercio Exterior. Clear financial services revolving door.', description_es: 'Director estatal + directivo de Nación Reaseguros, Red Link, Prisma Medios de Pago, BICE. Clara puerta giratoria en servicios financieros.' },

  // Finaig/Lijo connection
  { id: 'lijo-alfredo-damian', name: 'LIJO ALFREDO DAMIAN', description_en: 'Co-founder of Finaig Consultores SA (CUIT 20-21885141-0). Brother of Judge Ariel Lijo (Supreme Court nominee).', description_es: 'Co-fundador de Finaig Consultores SA (CUIT 20-21885141-0). Hermano del juez Ariel Lijo (candidato a Corte Suprema).' },
]

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

const ORGANIZATIONS = [
  { id: 'nucleoelectrica', name: 'NUCLEOELECTRICA ARGENTINA S.A.', description_en: 'State nuclear energy company. 1,066% overpricing on SAP system (USD 7M vs USD 600K). 140% overpricing on cleaning services.', description_es: 'Empresa estatal de energía nuclear. Sobreprecio de 1.066% en sistema SAP (USD 7M vs USD 600K). 140% sobreprecio en limpieza.', source_url: 'https://ate.org.ar/260127-sobreprecio-nasa/' },
  { id: 'fundacion-faro', name: 'FUNDACION FARO ARGENTINA', description_en: 'Dark money foundation. Originally \'Fundación Valorar\' (2017). Board replaced Apr 2024, renamed Oct 2024. Launched Nov 2024 with Milei. Spent $1.079B on political ads. No donor disclosure.', description_es: 'Fundación de dinero oscuro. Originalmente \'Fundación Valorar\' (2017). Directorio reemplazado abr 2024, renombrada oct 2024. Lanzada nov 2024 con Milei. Gastó $1.079B en publicidad política. Sin declaración de donantes.', source_url: 'https://chequeado.com/investigaciones/fundacion-faro-el-think-tank-libertario-que-mas-pauta-electoral-puso-en-2025-y-que-no-declara-el-origen-de-sus-fondos/' },
  { id: 'afa', name: 'AFA (ASOCIACION DEL FUTBOL ARGENTINO)', description_en: 'Argentine Football Association. AFAGate: ~USD 400M diverted through Florida shell companies. $19.353B unpaid taxes.', description_es: 'Asociación del Fútbol Argentino. AFAGate: ~USD 400M desviados por sociedades fantasma en Florida. $19.353B impuestos impagos.', source_url: 'https://www.lanacion.com.ar/politica/investigacion-exclusiva-desde-la-cuenta-que-administra-los-fondos-de-la-afa-en-eeuu-se-desviaron-al-nid28122025/' },
  { id: 'tourprodenter', name: 'TOURPRODENTER LLC', description_en: 'Florida LLC, main conduit for AFA funds. Accumulated USD 260M+ across 4 US banks. Administered by Erica Gillette.', description_es: 'LLC de Florida, principal conducto de fondos AFA. Acumuló USD 260M+ en 4 bancos de EE.UU. Administrada por Erica Gillette.' },
  { id: 'surely-sa', name: 'SURELY SA', cuit: '30-67970230-7', description_en: 'Sole provider of electronic ankle bracelet monitoring in Argentina. Charges USD 20.25/day vs international USD 5/day (4x benchmark). Owner: Mario Montoto.', description_es: 'Proveedor único de monitoreo con tobilleras electrónicas en Argentina. Cobra USD 20.25/día vs USD 5/día internacional (4x referencia). Dueño: Mario Montoto.', source_url: 'https://www.mdzol.com/politica/2024/12/10/adjudicaron-la-empresa-surely-sa-el-servicio-de-monitoreo-de-presos-1173394.html' },
  { id: 'anker-latinoamerica', name: 'ANKER LATINOAMERICA S.A.', cuit: '30-71690088-2', description_en: 'Caputo\'s consultancy at Juncal 4440. Constituted Aug 2020, suspended Dec 1 2023 (day Caputo became Minister). Same address as Caputo\'s directorship.', description_es: 'Consultora de Caputo en Juncal 4440. Constituida ago 2020, suspendida 1/12/2023 (día que Caputo asumió como Ministro). Misma dirección que cargo directivo de Caputo.', source_url: 'https://www.ambito.com/economia/luis-caputo-cierra-su-consultora-y-suma-los-socios-su-equipo-n5889363' },
  { id: 'federal-service-srl', name: 'FEDERAL SERVICE SRL', description_en: 'Private security company. Received 31 direct contracts from Nucleoeléctrica (2011-2014) totaling $271M.', description_es: 'Empresa de seguridad privada. Recibió 31 contratos directos de Nucleoeléctrica (2011-2014) totalizando $271M.' },
  { id: 'horizontes-sa', name: 'HORIZONTES SA', description_en: 'Romero family holding that owns El Tribuno newspaper and Radio Salta AM. Basis of Senator Romero\'s $4.361B declared patrimony.', description_es: 'Holding de la familia Romero, dueño del diario El Tribuno y Radio Salta AM. Base del patrimonio declarado de $4.361B del senador Romero.' },
  { id: 'correo-argentino', name: 'CORREO ARGENTINO S.A.', description_en: 'Former postal service. Declared bankrupt July 5, 2021 after 20-year concurso. State requested extension to SOCMA/SIDECO (Macri family). Debt: $4.5B.', description_es: 'Ex-servicio postal. Declarado en quiebra 5/7/2021 después de 20 años de concurso. Estado pidió extensión a SOCMA/SIDECO (familia Macri). Deuda: $4.5B.', source_url: 'https://www.infobae.com/politica/2021/07/05/claves-para-entender-la-causa-del-correo-argentino-sa-un-proceso-en-la-justicia-comercial-que-duro-20-anos-y-termino-en-una-quiebra/' },
  { id: 'tactic-global', name: 'TACTIC GLOBAL', description_en: 'US consulting firm. SIDE contract from Feb 12, 2025 linked to Santiago Caputo.', description_es: 'Firma consultora de EE.UU. Contrato con SIDE del 12/2/2025 vinculado a Santiago Caputo.' },
  { id: 'un-ombu-sas', name: 'UN OMBU SAS', description_en: 'Sturzenegger\'s company. Established Oct 2018 with wife. Minimal $21,400 capital but linked credit of $4.4M. Broad corporate purpose.', description_es: 'Empresa de Sturzenegger. Establecida oct 2018 con su esposa. Capital mínimo $21.400 pero crédito vinculado de $4.4M. Objeto social amplio.' },
]

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const EVENTS = [
  { event_id: 'fp-nucleoelectrica-overpricing-2025', title: 'Nucleoeléctrica 1,066% overpricing scandal', date: '2025-01-27', description_en: 'ATE denounced 1,066.7% overpricing on SAP S/4HANA software: USD 7M for system replacing one that cost ~USD 600K. 140% overpricing on cleaning.', description_es: 'ATE denunció sobreprecio de 1.066,7% en software SAP S/4HANA: USD 7M por sistema que reemplazaba uno de ~USD 600K. 140% sobreprecio en limpieza.' },
  { event_id: 'fp-reidel-resignation-2026', title: 'Reidel resigns from Nucleoeléctrica', date: '2026-02-09', description_en: 'Demian Reidel resigned as president of Nucleoeléctrica amid overpricing scandal. Had paid personal debts of $880M to Banco Macro in 18 days.', description_es: 'Demian Reidel renunció como presidente de Nucleoeléctrica en medio del escándalo de sobreprecios. Había pagado deudas personales de $880M a Banco Macro en 18 días.' },
  { event_id: 'fp-fundacion-faro-launch-2024', title: 'Fundación Faro launch with Milei', date: '2024-11-13', description_en: 'Fundación Faro (ex-Fundación Valorar) launched with Javier and Karina Milei present. $25,000/plate fundraising dinners.', description_es: 'Fundación Faro (ex-Fundación Valorar) lanzada con presencia de Javier y Karina Milei. Cenas de recaudación a $25.000/plato.' },
  { event_id: 'fp-correo-quiebra-2021', title: 'Correo Argentino declared bankrupt', date: '2021-07-05', description_en: 'Correo Argentino declared bankrupt after 20-year concurso. State requested extension to SOCMA/SIDECO (Macri holdings). Debt: $4.5B.', description_es: 'Correo Argentino declarado en quiebra tras 20 años de concurso. Estado pidió extensión a SOCMA/SIDECO (holdings Macri). Deuda: $4.5B.' },
  { event_id: 'fp-anker-suspension-2023', title: 'Anker Latinoamérica suspended operations', date: '2023-12-01', description_en: 'Caputo\'s consulting firm suspended services the exact day he became Economy Minister.', description_es: 'La consultora de Caputo suspendió servicios el día exacto que asumió como Ministro de Economía.' },
  { event_id: 'fp-afagate-investigation-2025', title: 'AFAGate investigation begins', date: '2025-12-28', description_en: 'La Nación investigation reveals USD 400M diverted through Florida shell companies from AFA accounts.', description_es: 'Investigación de La Nación revela USD 400M desviados por sociedades fantasma en Florida desde cuentas de AFA.' },
  { event_id: 'fp-bachellier-embargo-2026', title: 'Bachellier SA assets frozen', date: '2026-02-10', description_en: 'Judge Casanello froze $9.669B in Bachellier SA assets. Company received $1.666B in commissions from Nación Seguros (2020-2024).', description_es: 'Juez Casanello embargó $9.669B de activos de Bachellier SA. La empresa recibió $1.666B en comisiones de Nación Seguros (2020-2024).' },
]

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

// For relationships referencing existing nodes, we use the name as stored in
// the graph. Entries prefixed with "caso-finanzas-politicas:" reference nodes
// already in the DB (matched by name + caso_slug).

interface Rel {
  from_name: string
  from_label: 'Person' | 'Organization' | 'Event'
  to_name: string
  to_label: 'Person' | 'Organization' | 'Event'
  rel_type: string
}

const RELATIONSHIPS: Rel[] = [
  // Nucleoeléctrica
  { from_name: 'REIDEL DEMIAN', from_label: 'Person', to_name: 'NUCLEOELECTRICA ARGENTINA S.A.', to_label: 'Organization', rel_type: 'PRESIDENT_OF' },
  { from_name: 'REIDEL DEMIAN', from_label: 'Person', to_name: 'fp-nucleoelectrica-overpricing-2025', to_label: 'Event', rel_type: 'INVOLVED_IN' },
  { from_name: 'REIDEL DEMIAN', from_label: 'Person', to_name: 'fp-reidel-resignation-2026', to_label: 'Event', rel_type: 'INVOLVED_IN' },
  { from_name: 'FEDERAL SERVICE SRL', from_label: 'Organization', to_name: 'NUCLEOELECTRICA ARGENTINA S.A.', to_label: 'Organization', rel_type: 'CONTRACTED_BY' },

  // Fundación Faro
  { from_name: 'LAJE AGUSTIN', from_label: 'Person', to_name: 'FUNDACION FARO ARGENTINA', to_label: 'Organization', rel_type: 'DIRECTOR_OF' },
  { from_name: 'BILBAO LA VIEJA IGNACIO MARIA', from_label: 'Person', to_name: 'FUNDACION FARO ARGENTINA', to_label: 'Organization', rel_type: 'PRESIDENT_OF' },
  { from_name: 'FUNDACION FARO ARGENTINA', from_label: 'Organization', to_name: 'fp-fundacion-faro-launch-2024', to_label: 'Event', rel_type: 'INVOLVED_IN' },

  // AFA Gate
  { from_name: 'TAPIA CLAUDIO', from_label: 'Person', to_name: 'AFA (ASOCIACION DEL FUTBOL ARGENTINO)', to_label: 'Organization', rel_type: 'PRESIDENT_OF' },
  { from_name: 'TOVIGGINO PABLO', from_label: 'Person', to_name: 'AFA (ASOCIACION DEL FUTBOL ARGENTINO)', to_label: 'Organization', rel_type: 'TREASURER_OF' },
  { from_name: 'FARONI JAVIER', from_label: 'Person', to_name: 'TOURPRODENTER LLC', to_label: 'Organization', rel_type: 'ASSOCIATED_WITH' },
  { from_name: 'TAPIA CLAUDIO', from_label: 'Person', to_name: 'fp-afagate-investigation-2025', to_label: 'Event', rel_type: 'INVOLVED_IN' },
  { from_name: 'TOURPRODENTER LLC', from_label: 'Organization', to_name: 'AFA (ASOCIACION DEL FUTBOL ARGENTINO)', to_label: 'Organization', rel_type: 'DIVERTED_FUNDS_FROM' },

  // SURELY / Montoto
  { from_name: 'MONTOTO MARIO', from_label: 'Person', to_name: 'SURELY SA', to_label: 'Organization', rel_type: 'CONTROLS' },
  { from_name: 'MONTOTO MARIO', from_label: 'Person', to_name: 'RAVERTA FERNANDA', to_label: 'Person', rel_type: 'PARENT_OF' },

  // Caputo network (existing nodes matched by name)
  { from_name: 'CAPUTO LUIS ANDRES', from_label: 'Person', to_name: 'ANKER LATINOAMERICA S.A.', to_label: 'Organization', rel_type: 'CONTROLS' },
  { from_name: 'CAPUTO LUIS ANDRES', from_label: 'Person', to_name: 'fp-anker-suspension-2023', to_label: 'Event', rel_type: 'INVOLVED_IN' },
  { from_name: 'BAUSILI SANTIAGO', from_label: 'Person', to_name: 'CAPUTO LUIS ANDRES', to_label: 'Person', rel_type: 'SUBORDINATE_OF' },
  { from_name: 'CAPUTO SANTIAGO', from_label: 'Person', to_name: 'TACTIC GLOBAL', to_label: 'Organization', rel_type: 'ASSOCIATED_WITH' },

  // Sturzenegger
  { from_name: 'STURZENEGGER FEDERICO', from_label: 'Person', to_name: 'UN OMBU SAS', to_label: 'Organization', rel_type: 'CONTROLS' },

  // Romero dynasty
  { from_name: 'ROMERO ROBERTO', from_label: 'Person', to_name: 'HORIZONTES SA', to_label: 'Organization', rel_type: 'CONTROLS' },
  { from_name: 'ROMERO ROBERTO', from_label: 'Person', to_name: 'ROMERO JUAN CARLOS', to_label: 'Person', rel_type: 'PARENT_OF' },

  // Finaig/Lijo
  { from_name: 'LIJO ALFREDO DAMIAN', from_label: 'Person', to_name: 'FINAIG CONSULTORES SA', to_label: 'Organization', rel_type: 'CO_FOUNDER_OF' },
  { from_name: 'LIJO ALFREDO DAMIAN', from_label: 'Person', to_name: 'LIJO ARIEL OSCAR', to_label: 'Person', rel_type: 'SIBLING_OF' },

  // Correo/SOCMA
  { from_name: 'CORREO ARGENTINO S.A.', from_label: 'Organization', to_name: 'SOCMA S.A.', to_label: 'Organization', rel_type: 'SUBSIDIARY_OF' },
  { from_name: 'CORREO ARGENTINO S.A.', from_label: 'Organization', to_name: 'fp-correo-quiebra-2021', to_label: 'Event', rel_type: 'INVOLVED_IN' },

  // Pesce revolving door
  { from_name: 'PESCE AGUSTIN', from_label: 'Person', to_name: 'NACION SEGUROS S.A.', to_label: 'Organization', rel_type: 'OFFICER_OF' },

  // Bachellier
  { from_name: 'BACHELLIER SA', from_label: 'Organization', to_name: 'fp-bachellier-embargo-2026', to_label: 'Event', rel_type: 'INVOLVED_IN' },
]

// ---------------------------------------------------------------------------
// Ingestion logic
// ---------------------------------------------------------------------------

async function ingestPersons(): Promise<number> {
  let total = 0

  for (const p of PERSONS) {
    const result = await executeWrite(
      `
      MERGE (n:Person {name: $name, caso_slug: $caso_slug})
      ON CREATE SET
        n.id              = 'fp-' + $id,
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.source_url      = $source_url,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.created_at      = $now
      ON MATCH SET
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.source_url      = $source_url,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.updated_at      = $now
      `,
      {
        name: p.name,
        id: p.id,
        caso_slug: CASO_SLUG,
        description_en: p.description_en,
        description_es: p.description_es,
        source_url: (p as Record<string, string>).source_url ?? null,
        tier: TIER,
        submitted_by: SUBMITTED_BY,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Person: ${p.name} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestOrganizations(): Promise<number> {
  let total = 0

  for (const o of ORGANIZATIONS) {
    const result = await executeWrite(
      `
      MERGE (n:Organization {name: $name, caso_slug: $caso_slug})
      ON CREATE SET
        n.id              = 'fp-' + $id,
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.source_url      = $source_url,
        n.cuit            = $cuit,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.created_at      = $now
      ON MATCH SET
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.source_url      = $source_url,
        n.cuit            = $cuit,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.updated_at      = $now
      `,
      {
        name: o.name,
        id: o.id,
        caso_slug: CASO_SLUG,
        description_en: o.description_en,
        description_es: o.description_es,
        source_url: (o as Record<string, string>).source_url ?? null,
        cuit: (o as Record<string, string>).cuit ?? null,
        tier: TIER,
        submitted_by: SUBMITTED_BY,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Organization: ${o.name} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestEvents(): Promise<number> {
  let total = 0

  for (const e of EVENTS) {
    const result = await executeWrite(
      `
      MERGE (n:Event {event_id: $event_id, caso_slug: $caso_slug})
      ON CREATE SET
        n.title           = $title,
        n.date            = $date,
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.created_at      = $now
      ON MATCH SET
        n.title           = $title,
        n.date            = $date,
        n.description_en  = $description_en,
        n.description_es  = $description_es,
        n.confidence_tier = $tier,
        n.submitted_by    = $submitted_by,
        n.updated_at      = $now
      `,
      {
        event_id: e.event_id,
        caso_slug: CASO_SLUG,
        title: e.title,
        date: e.date,
        description_en: e.description_en,
        description_es: e.description_es,
        tier: TIER,
        submitted_by: SUBMITTED_BY,
        now: NOW,
      },
    )
    const counters = result.summary.counters
    const created = (counters as Record<string, number>)['nodesCreated'] ?? 0
    total += created
    console.log(`  Event: ${e.event_id} ${created ? '(created)' : '(merged)'}`)
  }

  return total
}

async function ingestRelationships(): Promise<number> {
  let total = 0

  for (const r of RELATIONSHIPS) {
    try {
      // For Event targets, match by event_id instead of name
      const toMatchField = r.to_label === 'Event' ? 'event_id' : 'name'
      const fromMatchField = r.from_label === 'Event' ? 'event_id' : 'name'

      const result = await executeWrite(
        `
        MATCH (a:${r.from_label} {${fromMatchField}: $from_name, caso_slug: $caso_slug})
        MATCH (b:${r.to_label} {${toMatchField}: $to_name, caso_slug: $caso_slug})
        MERGE (a)-[rel:${r.rel_type}]->(b)
        ON CREATE SET rel.created_at = $now, rel.submitted_by = $submitted_by
        ON MATCH SET rel.updated_at = $now
        `,
        {
          from_name: r.from_name,
          to_name: r.to_name,
          caso_slug: CASO_SLUG,
          now: NOW,
          submitted_by: SUBMITTED_BY,
        },
      )
      const counters = result.summary.counters
      const created = (counters as Record<string, number>)['relationshipsCreated'] ?? 0
      total += created
      console.log(`  Rel: ${r.from_name} -[${r.rel_type}]-> ${r.to_name} ${created ? '(created)' : '(merged/no-match)'}`)
    } catch (e) {
      console.log(`  x FAILED: ${r.from_name} -[${r.rel_type}]-> ${r.to_name}: ${e instanceof Error ? e.message : e}`)
    }
  }

  return total
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Deep-Dive Findings Ingestion ===')
  console.log(`caso_slug: ${CASO_SLUG}, tier: ${TIER}, submitted_by: ${SUBMITTED_BY}\n`)

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('ERROR: Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Neo4j connected.\n')

  console.log('--- Persons ---')
  const personsCreated = await ingestPersons()

  console.log('\n--- Organizations ---')
  const orgsCreated = await ingestOrganizations()

  console.log('\n--- Events ---')
  const eventsCreated = await ingestEvents()

  console.log('\n--- Relationships ---')
  const relsCreated = await ingestRelationships()

  console.log('\n=== Summary ===')
  console.log(`Persons created:       ${personsCreated}`)
  console.log(`Organizations created: ${orgsCreated}`)
  console.log(`Events created:        ${eventsCreated}`)
  console.log(`Relationships created: ${relsCreated}`)
  console.log(`Total nodes:           ${personsCreated + orgsCreated + eventsCreated}`)

  await closeDriver()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
