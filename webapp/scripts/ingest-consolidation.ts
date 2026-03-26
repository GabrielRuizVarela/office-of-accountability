/**
 * Consolidation ingestion: fills gaps found during integration audit.
 *
 * Adds missing persons, organizations, events, and relationships
 * discovered by deep-dive research but not yet in the graph.
 *
 * Run with: npx tsx scripts/ingest-consolidation.ts
 * Idempotent - safe to re-run (uses MERGE, not CREATE).
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-finanzas-politicas'
const TIER = 'silver'
const SUBMITTED_BY = 'consolidation-2026-03-21'
const NOW = new Date().toISOString()

// ---------------------------------------------------------------------------
// Persons
// ---------------------------------------------------------------------------

const PERSONS = [
  {
    id: 'kovalivker-jonathan',
    name: 'KOVALIVKER JONATHAN',
    description_en: 'President of Suizo Argentina S.A. USD 2M donor to Milei campaign. Key early financial backer.',
    description_es: 'Presidente de Suizo Argentina S.A. Donante de USD 2M a campaña de Milei. Financista clave temprano.',
  },
  {
    id: 'mahiques-carlos',
    name: 'MAHIQUES CARLOS',
    description_en: 'Casación judge. Participated in Lago Escondido trip with Macri-era judges and media moguls.',
    description_es: 'Juez de Casación. Participó en viaje a Lago Escondido con jueces macristas y magnates de medios.',
  },
  {
    id: 'macri-alejandra',
    name: 'MACRI ALEJANDRA',
    description_en: 'Unrecognized daughter of Franco Macri. Filed lawsuit claiming inheritance rights over 398 companies.',
    description_es: 'Hija no reconocida de Franco Macri. Presentó demanda reclamando derechos sucesorios sobre 398 empresas.',
  },
  {
    id: 'macri-mariano',
    name: 'MACRI MARIANO',
    description_en: 'Dissident brother of Mauricio Macri. Filed fraud complaint against family members over SOCMA holdings.',
    description_es: 'Hermano disidente de Mauricio Macri. Presentó denuncia por fraude contra familiares por holdings SOCMA.',
  },
  {
    id: 'macri-mauricio',
    name: 'MACRI MAURICIO',
    description_en: 'Former president of Argentina (2015-2019). Central figure in Macri family offshore network and SOCMA holdings.',
    description_es: 'Ex presidente de Argentina (2015-2019). Figura central en red offshore familiar Macri y holdings SOCMA.',
  },
]

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

const ORGANIZATIONS = [
  {
    id: 'lares-corporation',
    name: 'LARES CORPORATION',
    jurisdiction: 'Luxembourg',
    description_en: 'Luxembourg entity controlled by Gianfranco Macri. Wind farm holding company.',
    description_es: 'Entidad luxemburguesa controlada por Gianfranco Macri. Holding de parques eólicos.',
  },
  {
    id: 'bf-corporation-sa',
    name: 'BF CORPORATION S.A.',
    jurisdiction: 'Panama',
    description_en: 'Panama entity linked to Gianfranco and Mariano Macri.',
    description_es: 'Entidad panameña vinculada a Gianfranco y Mariano Macri.',
  },
  {
    id: 'fleg-trading-ltd',
    name: 'FLEG TRADING LTD',
    jurisdiction: 'Bahamas',
    description_en: 'Bahamas entity linked to Franco, Mauricio, and Mariano Macri. Offshore vehicle in Panama Papers.',
    description_es: 'Entidad bahameña vinculada a Franco, Mauricio y Mariano Macri. Vehículo offshore en Panama Papers.',
  },
  {
    id: 'coc-global-enterprise',
    name: 'COC GLOBAL ENTERPRISE',
    jurisdiction: 'USA',
    description_en: 'US fund used by Scatturice as acquisition vehicle for Flybondi airline purchase.',
    description_es: 'Fondo estadounidense usado por Scatturice como vehículo de adquisición para compra de Flybondi.',
  },
  {
    id: 'drogueria-profarma',
    name: 'DROGUERIA PROFARMA',
    jurisdiction: 'Argentina',
    description_en: 'Received 93% of ANDIS restricted procurement awards. Key beneficiary of disability agency spending.',
    description_es: 'Recibió 93% de adjudicaciones restringidas de ANDIS. Beneficiario clave del gasto de agencia de discapacidad.',
  },
  {
    id: 'drogueria-genesis',
    name: 'DROGUERIA GENESIS',
    jurisdiction: 'Argentina',
    description_en: 'ANDIS procurement partner alongside Profarma.',
    description_es: 'Socio de adjudicaciones ANDIS junto con Profarma.',
  },
  {
    id: 'oca-sa',
    name: 'OCA S.A.',
    jurisdiction: 'Argentina',
    description_en: 'Courier company acquired by Leonardo Scatturice. Previously major Argentine delivery service.',
    description_es: 'Empresa de correo adquirida por Leonardo Scatturice. Anteriormente servicio de envío principal argentino.',
  },
  {
    id: 'cndc',
    name: 'CNDC (COMISION NACIONAL DE DEFENSA DE LA COMPETENCIA)',
    jurisdiction: 'Argentina',
    description_en: 'National competition defense commission. Issued cartel charges Dec 2024.',
    description_es: 'Comisión Nacional de Defensa de la Competencia. Emitió cargos por cartel dic 2024.',
  },
  {
    id: 'bcra',
    name: 'BCRA (BANCO CENTRAL DE LA REPUBLICA ARGENTINA)',
    jurisdiction: 'Argentina',
    description_en: 'Argentine central bank. Managed USD 3B repo operation Jan 2026.',
    description_es: 'Banco central argentino. Gestionó operación repo de USD 3B ene 2026.',
  },
]

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const EVENTS = [
  {
    id: 'cndc-cartel-charge-2024',
    title: 'CNDC cartel charge',
    date: '2024-12-12',
    description_en: 'CNDC issued formal cartel charges against major market players.',
    description_es: 'CNDC emitió cargos formales de cartel contra actores principales del mercado.',
  },
  {
    id: 'mariano-macri-fraud-complaint-2024',
    title: 'Mariano Macri fraud complaint',
    date: '2024-08-07',
    description_en: 'Mariano Macri filed fraud complaint against family members over SOCMA holdings and offshore structures.',
    description_es: 'Mariano Macri presentó denuncia por fraude contra familiares por holdings SOCMA y estructuras offshore.',
  },
  {
    id: 'alejandra-macri-398-lawsuit-2025',
    title: 'Alejandra Macri 398 companies lawsuit',
    date: '2025-01-15',
    description_en: 'Alejandra Macri filed lawsuit claiming inheritance rights over 398 companies linked to Franco Macri.',
    description_es: 'Alejandra Macri presentó demanda reclamando derechos sucesorios sobre 398 empresas vinculadas a Franco Macri.',
  },
  {
    id: 'scatturice-oca-acquisition-2025',
    title: 'Scatturice OCA acquisition',
    date: '2025-12-12',
    description_en: 'Leonardo Scatturice acquired OCA courier company. Funding sources under scrutiny given SIDE contract links.',
    description_es: 'Leonardo Scatturice adquirió empresa de correo OCA. Fuentes de financiamiento bajo escrutinio por vínculos con contratos SIDE.',
  },
  {
    id: 'bcra-repo-3b-2026',
    title: 'BCRA repo USD 3B operation',
    date: '2026-01-07',
    description_en: 'BCRA executed USD 3B repo operation to stabilize reserves.',
    description_es: 'BCRA ejecutó operación repo de USD 3B para estabilizar reservas.',
  },
  {
    id: 'blanqueo-phase1-completion-2024',
    title: 'Blanqueo Phase 1 completion - USD 22.5B',
    date: '2024-11-30',
    description_en: 'First phase of tax amnesty (blanqueo) completed with USD 22.5B declared. Record capital repatriation.',
    description_es: 'Primera fase de blanqueo completada con USD 22.5B declarados. Repatriación de capital récord.',
  },
]

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

const RELATIONSHIPS = [
  // New entity relationships
  { from: 'kovalivker-jonathan', to: 'fp-suizo-argentina-s.a.', type: 'CONTROLS', props: { context: 'President of Suizo Argentina' } },
  { from: 'fn-macri-gianfranco', to: 'lares-corporation', type: 'CONTROLS', props: { context: 'Luxembourg wind farm holding' } },
  { from: 'fn-macri-gianfranco', to: 'bf-corporation-sa', type: 'CONTROLS', props: { context: 'Panama offshore entity' } },
  { from: 'macri-mauricio', to: 'fleg-trading-ltd', type: 'ASSOCIATED_WITH', props: { context: 'Bahamas offshore vehicle, Panama Papers' } },
  { from: 'macri-alejandra', to: 'fn-macri-francisco', type: 'CHILD_OF', props: { context: 'Unrecognized daughter' } },
  { from: 'macri-mariano', to: 'fp-socma-inversiones-s.a.', type: 'ASSOCIATED_WITH', props: { context: 'Filed fraud complaint over SOCMA holdings' } },
  // Scatturice: node has no id, match by name
  { fromName: 'SCATTURICE LEONARDO', to: 'coc-global-enterprise', type: 'CONTROLS', props: { context: 'Flybondi acquisition vehicle' } },
  { from: 'coc-global-enterprise', toName: 'FLYBONDI', type: 'ACQUIRED', props: { context: 'Low-cost airline acquisition' } },
  { from: 'mahiques-carlos', to: 'fp-comodoro-py', type: 'MEMBER_OF', props: { context: 'Casación judge' } },
  { from: 'drogueria-profarma', to: 'fp-andis', type: 'CONTRACTED_BY', props: { context: '93% of restricted procurement awards' } },
  { from: 'drogueria-genesis', to: 'fp-andis', type: 'CONTRACTED_BY', props: { context: 'ANDIS procurement partner' } },
  // Scatturice -> OCA
  { fromName: 'SCATTURICE LEONARDO', to: 'oca-sa', type: 'ACQUIRED', props: { context: 'Acquired courier company Dec 2025' } },
  // Macri family links
  { from: 'macri-mariano', to: 'fn-macri-francisco', type: 'CHILD_OF', props: { context: 'Son of Franco Macri' } },
  { from: 'macri-mauricio', to: 'fn-macri-francisco', type: 'CHILD_OF', props: { context: 'Son of Franco Macri' } },
  { from: 'macri-mariano', to: 'bf-corporation-sa', type: 'ASSOCIATED_WITH', props: { context: 'Panama entity co-holder' } },
  { from: 'macri-mariano', to: 'fleg-trading-ltd', type: 'ASSOCIATED_WITH', props: { context: 'Bahamas offshore vehicle' } },
  // Event involvement
  { from: 'macri-mariano', toEvent: 'mariano-macri-fraud-complaint-2024', type: 'INVOLVED_IN', props: {} },
  { from: 'macri-alejandra', toEvent: 'alejandra-macri-398-lawsuit-2025', type: 'INVOLVED_IN', props: {} },
  { fromName: 'SCATTURICE LEONARDO', toEvent: 'scatturice-oca-acquisition-2025', type: 'INVOLVED_IN', props: {} },
]

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

async function ingestPersons() {
  console.log(`\n--- Ingesting ${PERSONS.length} persons ---`)
  for (const p of PERSONS) {
    const fullId = `fp-${p.id}`
    await executeWrite(
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
         n.updated_at = $now`,
      {
        id: fullId,
        name: p.name,
        caso: CASO_SLUG,
        tier: TIER,
        desc_en: p.description_en,
        desc_es: p.description_es,
        submitted: SUBMITTED_BY,
        now: NOW,
      }
    )
    console.log(`  ✓ ${p.name}`)
  }
}

async function ingestOrganizations() {
  console.log(`\n--- Ingesting ${ORGANIZATIONS.length} organizations ---`)
  for (const o of ORGANIZATIONS) {
    const fullId = `fp-${o.id}`
    await executeWrite(
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
        id: fullId,
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
    console.log(`  ✓ ${o.name}`)
  }
}

async function ingestEvents() {
  console.log(`\n--- Ingesting ${EVENTS.length} events ---`)
  for (const e of EVENTS) {
    const fullId = `fp-${e.id}`
    await executeWrite(
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
        id: fullId,
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
    console.log(`  ✓ ${e.title} (${e.date})`)
  }
}

async function ingestRelationships() {
  console.log(`\n--- Ingesting ${RELATIONSHIPS.length} relationships ---`)
  for (const r of RELATIONSHIPS) {
    const props = { ...r.props, caso_slug: CASO_SLUG, created_at: NOW }

    let cypher: string
    const params: Record<string, unknown> = { props }

    if (r.fromName && r.toEvent) {
      // Name-based -> Event
      const toId = r.toEvent.startsWith('fp-') ? r.toEvent : `fp-${r.toEvent}`
      cypher = `MATCH (a:Person {name: $fromName, caso_slug: $caso}), (b:Event {event_id: $toId})
                MERGE (a)-[rel:${r.type}]->(b)
                ON CREATE SET rel += $props`
      params.fromName = r.fromName
      params.toId = toId
      params.caso = CASO_SLUG
    } else if (r.toEvent) {
      // Person (id) -> Event
      const fromId = r.from!.startsWith('fp-') || r.from!.startsWith('fn-') ? r.from : `fp-${r.from}`
      const toId = r.toEvent.startsWith('fp-') ? r.toEvent : `fp-${r.toEvent}`
      cypher = `MATCH (a:Person {id: $fromId}), (b:Event {event_id: $toId})
                MERGE (a)-[rel:${r.type}]->(b)
                ON CREATE SET rel += $props`
      params.fromId = fromId
      params.toId = toId
    } else if (r.fromName) {
      // Name-based from -> id-based to
      const toId = r.to!.startsWith('fp-') || r.to!.startsWith('fn-') ? r.to : `fp-${r.to}`
      cypher = `MATCH (a {name: $fromName, caso_slug: $caso}), (b {id: $toId})
                MERGE (a)-[rel:${r.type}]->(b)
                ON CREATE SET rel += $props`
      params.fromName = r.fromName
      params.toId = toId
      params.caso = CASO_SLUG
    } else if (r.toName) {
      // id-based from -> name-based to
      const fromId = r.from!.startsWith('fp-') || r.from!.startsWith('fn-') ? r.from : `fp-${r.from}`
      cypher = `MATCH (a {id: $fromId}), (b {name: $toName, caso_slug: $caso})
                MERGE (a)-[rel:${r.type}]->(b)
                ON CREATE SET rel += $props`
      params.fromId = fromId
      params.toName = r.toName
      params.caso = CASO_SLUG
    } else {
      // Both id-based
      const fromId = r.from!.startsWith('fp-') || r.from!.startsWith('fn-') ? r.from : `fp-${r.from}`
      const toId = r.to!.startsWith('fp-') || r.to!.startsWith('fn-') ? r.to : `fp-${r.to}`
      cypher = `MATCH (a {id: $fromId}), (b {id: $toId})
                MERGE (a)-[rel:${r.type}]->(b)
                ON CREATE SET rel += $props`
      params.fromId = fromId
      params.toId = toId
    }

    await executeWrite(cypher, params)
    const label = r.fromName || r.from || '?'
    const target = r.toName || r.toEvent || r.to || '?'
    console.log(`  ✓ ${label} -[${r.type}]-> ${target}`)
  }
}

async function fixNullNameEvents() {
  console.log('\n--- Fixing null-name events (copying title to name) ---')
  const result = await executeWrite(
    `MATCH (e:Event {caso_slug: $caso})
     WHERE e.name IS NULL AND e.title IS NOT NULL
     SET e.name = e.title
     RETURN count(e) AS fixed`,
    { caso: CASO_SLUG }
  )
  console.log(`  ✓ Fixed ${(result as any).records[0]?.get('fixed')} events`)
}

async function fixNodesWithoutIds() {
  console.log('\n--- Assigning IDs to nodes without them ---')
  const result = await executeWrite(
    `MATCH (n {caso_slug: $caso})
     WHERE n.id IS NULL AND n.name IS NOT NULL
     SET n.id = 'fp-' + toLower(replace(replace(n.name, ' ', '-'), '.', ''))
     RETURN count(n) AS fixed`,
    { caso: CASO_SLUG }
  )
  console.log(`  ✓ Assigned IDs to ${(result as any).records[0]?.get('fixed')} nodes`)
}

async function deduplicateEdges() {
  console.log('\n--- Deduplicating edges ---')
  // Find and remove duplicate edges (keep one per pair per type)
  const result = await executeWrite(
    `MATCH (a {caso_slug: $caso})-[r]->(b {caso_slug: $caso})
     WITH a, b, type(r) AS relType, collect(r) AS rels
     WHERE size(rels) > 1
     UNWIND rels[1..] AS dup
     DELETE dup
     RETURN count(dup) AS removed`,
    { caso: CASO_SLUG }
  )
  console.log(`  ✓ Removed ${(result as any).records[0]?.get('removed')} duplicate edges`)
}

async function connectOrphans() {
  console.log('\n--- Connecting orphan nodes ---')

  // MAHIQUES JUAN PABLO -> COMODORO PY (he's a judge)
  await executeWrite(
    `MATCH (p:Person {id: 'fp-mahiques-juan-pablo'}), (o:Organization {id: 'fp-comodoro-py'})
     MERGE (p)-[r:MEMBER_OF]->(o)
     ON CREATE SET r.caso_slug = $caso, r.context = 'Federal judge', r.created_at = $now`,
    { caso: CASO_SLUG, now: NOW }
  )
  console.log('  ✓ MAHIQUES JUAN PABLO -> COMODORO PY')

  // PAGLIANO -> PODER JUDICIAL
  await executeWrite(
    `MATCH (p:Person {id: 'fp-pagliano-alberto'}), (o:Organization {id: 'fp-poder-judicial-de-la-nacion'})
     MERGE (p)-[r:MEMBER_OF]->(o)
     ON CREATE SET r.caso_slug = $caso, r.context = 'Judicial official', r.created_at = $now`,
    { caso: CASO_SLUG, now: NOW }
  )
  console.log('  ✓ PAGLIANO ALBERTO -> PODER JUDICIAL')

  // CALEDONIA SEGUROS -> relate to insurance network
  // KOOLHAAS -> relate to construction network
  // LETHE -> shell company
  // These are harder to place without more info, create generic RELATED_TO to investigation config
  for (const orphanId of ['fp-caledonia-seguros', 'fp-koolhaas-s.a.', 'fp-lethe']) {
    await executeWrite(
      `MATCH (n {id: $id, caso_slug: $caso})
       WHERE NOT (n)--()
       WITH n
       MATCH (cfg:InvestigationConfig {caso_slug: $caso})
       MERGE (n)-[r:RELATED_TO]->(cfg)
       ON CREATE SET r.context = 'Entity under investigation', r.created_at = $now`,
      { id: orphanId, caso: CASO_SLUG, now: NOW }
    )
    console.log(`  ✓ ${orphanId} -> InvestigationConfig (fallback)`)
  }

  // RODRIGUEZ HUGO, TANOS MAURO, TORRES ALFONSO JOSE - connect to investigation
  for (const orphanId of ['fp-rodriguez-hugo', 'fp-tanos-mauro', 'fp-torres-alfonso-jose']) {
    await executeWrite(
      `MATCH (n:Person {id: $id, caso_slug: $caso})
       WHERE NOT (n)--()
       WITH n
       MATCH (cfg:InvestigationConfig {caso_slug: $caso})
       MERGE (n)-[r:RELATED_TO]->(cfg)
       ON CREATE SET r.context = 'Person under investigation', r.created_at = $now`,
      { id: orphanId, caso: CASO_SLUG, now: NOW }
    )
    console.log(`  ✓ ${orphanId} -> InvestigationConfig (fallback)`)
  }
}

async function fixMissingDescriptions() {
  console.log('\n--- Fixing nodes with missing descriptions ---')
  const result = await executeWrite(
    `MATCH (n {caso_slug: $caso})
     WHERE n.description IS NULL AND n.description_en IS NOT NULL
     SET n.description = n.description_en
     RETURN count(n) AS fixed`,
    { caso: CASO_SLUG }
  )
  console.log(`  ✓ Copied description_en to description for ${(result as any).records[0]?.get('fixed')} nodes`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Consolidation Ingestion for caso-finanzas-politicas ===\n')
  await verifyConnectivity()

  await ingestPersons()
  await ingestOrganizations()
  await ingestEvents()
  await ingestRelationships()

  console.log('\n=== Phase 3: Data quality fixes ===')
  await fixNullNameEvents()
  await fixNodesWithoutIds()
  await deduplicateEdges()
  await connectOrphans()
  await fixMissingDescriptions()

  console.log('\n=== Consolidation complete ===')
  await closeDriver()
}

main().catch(err => {
  console.error('FATAL:', err)
  process.exit(1)
})
