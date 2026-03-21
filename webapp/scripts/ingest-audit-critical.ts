/**
 * Ingest critical missing entities from session audit report.
 * Covers Tier 1 + Tier 2 persons, organizations, and relationships.
 *
 * Run with: npx tsx scripts/ingest-audit-critical.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const now = new Date().toISOString()
const CASO_SLUG = 'caso-finanzas-politicas'
const PROV = {
  submitted_by: 'investigation:session-audit-2026-03-21',
  tier: 'silver' as const,
  confidence_score: 0.85,
}

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Connected to Neo4j. Ingesting audit-critical entities...\n')

  // ── PERSONS ──────────────────────────────────────────────────────────

  const persons = [
    // Critical priority
    { name: 'CANTERO MARIA', role: 'Secretaria personal de Alberto Fernández, esposa de Martínez Sosa, chats revelaron esquema de seguros', severity: 'critical' },
    { name: 'CASEY PABLO', role: 'Sobrino de Héctor Magnetto (CEO Clarín), organizó vuelo a Lago Escondido para jueces', severity: 'critical' },
    { name: 'LIJO ALFREDO', role: 'Hermano de Ariel Lijo, 95% de Finaig Consultores SA, riqueza inexplicable, departamento no declarado USD 2M', severity: 'critical' },
    { name: 'MILEI KARINA', role: 'Secretaria General de la Presidencia, vinculada al escándalo ANDIS/Suizo, conexión con Spagnuolo', severity: 'critical' },
    { name: 'SILEY VANESA RAQUEL', role: 'Diputada UxP, vinculada a 11+ jueces vía Justicia Legítima', severity: 'high' },
    // High priority
    { name: 'RODRIGUEZ HUGO', role: 'Administrador de Olivos, facilitó reuniones no registradas, procesado', severity: 'high' },
    { name: 'TANOS MAURO', role: 'Gerente general/comercial Nación Seguros, ex-La Cámpora, allanado y despedido', severity: 'high' },
    { name: 'TORRES ALFONSO JOSE', role: 'Presidente actual de Nación Seguros, vinculado a Martín Menem', severity: 'high' },
    { name: 'PAGLIANO ALBERTO', role: 'Funcionario de Nación Seguros, procesado judicialmente', severity: 'high' },
    { name: 'LEWIS JOE', role: 'Multimillonario británico, dueño de estancia Lago Escondido donde volaron jueces', severity: 'high' },
    { name: 'BETTINI CARLOS', role: 'Ex embajador, dueño del departamento no declarado de USD 2M de Ariel Lijo en Av. Alvear', severity: 'high' },
    { name: 'SPAGNUOLO DIEGO', role: 'Ex director ANDIS, audios de soborno filtrados, escándalo Suizo Argentina', severity: 'high' },
    { name: 'YADAROLA DIEGO', role: 'Juez federal, participante de Lago Escondido, debe decidir sobre causas Clarín', severity: 'high' },
    { name: 'CAYSSIALS PABLO', role: 'Juez federal, participante de Lago Escondido', severity: 'high' },
    { name: 'MAHIQUES JUAN PABLO', role: 'Juez, participante de Lago Escondido', severity: 'high' },
  ]

  console.log('── Persons ──')
  for (const p of persons) {
    const result = await executeWrite(
      `MERGE (n:Person {name: $name, caso_slug: $caso_slug})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.role_es = $role, n.severity = $severity,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.role_es = $role, n.severity = $severity, n.updated_at = $now`,
      { name: p.name, caso_slug: CASO_SLUG, role: p.role, severity: p.severity, ...PROV, now },
    )
    const action = result.summary.counters.nodesCreated ? 'CREATED' : 'MERGED'
    console.log(`  ${action} Person: ${p.name} (${p.severity})`)
  }

  // ── ORGANIZATIONS ────────────────────────────────────────────────────

  const orgs = [
    { name: 'NACION SEGUROS S.A.', sector: 'insurance', note: 'Aseguradora estatal #1 contratista del gobierno ARS 28.5B, centro de Causa Seguros. Monopolio cautivo.' },
    { name: 'FINAIG CONSULTORES SA', sector: 'consulting', note: 'Empresa de Alfredo Lijo (95%), Puerto Madero, riqueza inexplicable del hermano del juez' },
    { name: 'CALEDONIA SEGUROS', sector: 'insurance', note: 'Compañía de seguros vinculada a Alfredo Lijo' },
    { name: 'JUSTICIA LEGITIMA', sector: 'judiciary_association', note: 'Asociación que vincula a 11+ jueces con la diputada Siley (UxP)' },
    { name: 'KOOLHAAS S.A.', sector: 'real_estate', note: 'Empresa inmobiliaria en escándalo de transferencia de tierras de Frigerio, sobreseída por Ercolini' },
    { name: 'LETHE', sector: 'finance', note: 'Empresa que recibió préstamo irregular de $35M de Banco Ciudad bajo Frigerio (1500% del patrimonio, sin experiencia en construcción)' },
    { name: 'SUIZO ARGENTINA S.A.', sector: 'pharmaceutical', note: 'Droguería con CUITs duales (bandera de manipulación), crecimiento de contratos 2,678%, escándalo ANDIS' },
    { name: 'ANDIS', sector: 'government', note: 'Agencia Nacional de Discapacidad, vinculada a Karina Milei/Spagnuolo, escándalo de soborno' },
  ]

  console.log('\n── Organizations ──')
  for (const o of orgs) {
    const result = await executeWrite(
      `MERGE (n:Organization {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = $caso_slug,
                     n.sector = $sector, n.note = $note,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.note = $note, n.updated_at = $now`,
      { name: o.name, caso_slug: CASO_SLUG, sector: o.sector, note: o.note, ...PROV, now },
    )
    const action = result.summary.counters.nodesCreated ? 'CREATED' : 'MERGED'
    console.log(`  ${action} Org: ${o.name}`)
  }

  // ── RELATIONSHIPS ────────────────────────────────────────────────────

  // Person → Person relationships
  const personToPersonRels = [
    { from: 'CANTERO MARIA', to: 'MARTINEZ SOSA HECTOR', type: 'MARRIED_TO', desc: 'Esposa de Martínez Sosa, sus chats revelaron esquema de seguros' },
    { from: 'CANTERO MARIA', to: 'FERNANDEZ ALBERTO', type: 'SECRETARY_OF', desc: 'Secretaria personal del presidente Alberto Fernández' },
    { from: 'CASEY PABLO', to: 'MAGNETTO HECTOR', type: 'FAMILY_OF', desc: 'Sobrino de Héctor Magnetto (CEO Clarín)' },
    { from: 'LIJO ALFREDO', to: 'LIJO ARIEL OSCAR', type: 'FAMILY_OF', desc: 'Hermano del juez Ariel Lijo' },
    { from: 'BETTINI CARLOS', to: 'LIJO ARIEL OSCAR', type: 'PROVIDES_HOUSING', desc: 'Dueño del departamento no declarado de USD 2M de Lijo en Av. Alvear' },
    { from: 'ERCOLINI JULIAN DANIEL', to: 'CASEY PABLO', type: 'MET_AT_LAGO_ESCONDIDO', desc: 'Participó en viaje a Lago Escondido organizado por Casey/Clarín' },
    { from: 'ERCOLINI JULIAN DANIEL', to: 'LEWIS JOE', type: 'FLEW_TO_ESTATE', desc: 'Voló a estancia de Lewis en Lago Escondido' },
  ]

  // Person → Organization relationships
  const personToOrgRels = [
    { from: 'LIJO ALFREDO', to: 'FINAIG CONSULTORES SA', type: 'CONTROLS', desc: '95% propietario de Finaig Consultores SA' },
    { from: 'MILEI KARINA', to: 'ANDIS', type: 'LINKED_TO', desc: 'Vinculada al escándalo ANDIS, audios de soborno con Spagnuolo' },
    { from: 'SPAGNUOLO DIEGO', to: 'SUIZO ARGENTINA S.A.', type: 'BRIBERY', desc: 'Audios filtrados de soborno con Suizo Argentina' },
    { from: 'SILEY VANESA RAQUEL', to: 'JUSTICIA LEGITIMA', type: 'MEMBER_OF', desc: 'Diputada UxP vinculada a 11+ jueces vía Justicia Legítima' },
    { from: 'YADAROLA DIEGO', to: 'COMODORO PY', type: 'MEMBER_OF', desc: 'Juez federal de Comodoro Py, participante de Lago Escondido' },
    { from: 'CAYSSIALS PABLO', to: 'COMODORO PY', type: 'MEMBER_OF', desc: 'Juez federal de Comodoro Py, participante de Lago Escondido' },
  ]

  console.log('\n── Relationships (Person → Person) ──')
  for (const r of personToPersonRels) {
    try {
      const result = await executeWrite(
        `MATCH (a:Person {name: $from, caso_slug: $caso_slug})
         MATCH (b:Person {name: $to, caso_slug: $caso_slug})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
        { from: r.from, to: r.to, caso_slug: CASO_SLUG, type: r.type, desc: r.desc, source: PROV.submitted_by, now },
      )
      const action = result.summary.counters.relationshipsCreated ? 'CREATED' : 'MERGED'
      console.log(`  ${action} Rel: ${r.from} -[${r.type}]-> ${r.to}`)
    } catch (e) {
      console.log(`  x FAILED: ${r.from} -> ${r.to}: ${e instanceof Error ? e.message : e}`)
    }
  }

  console.log('\n── Relationships (Person → Organization) ──')
  for (const r of personToOrgRels) {
    try {
      const result = await executeWrite(
        `MATCH (a:Person {name: $from, caso_slug: $caso_slug})
         MATCH (b:Organization {name: $to})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
        { from: r.from, to: r.to, caso_slug: CASO_SLUG, type: r.type, desc: r.desc, source: PROV.submitted_by, now },
      )
      const action = result.summary.counters.relationshipsCreated ? 'CREATED' : 'MERGED'
      console.log(`  ${action} Rel: ${r.from} -[${r.type}]-> ${r.to}`)
    } catch (e) {
      console.log(`  x FAILED: ${r.from} -> ${r.to}: ${e instanceof Error ? e.message : e}`)
    }
  }

  // ── VERIFICATION ─────────────────────────────────────────────────────

  console.log('\n── Verification ──')
  const { summary: personCount } = await executeWrite(
    `MATCH (n:Person {caso_slug: $caso_slug})
     WHERE n.submitted_by = $submitted_by
     RETURN count(n) as cnt`,
    { caso_slug: CASO_SLUG, submitted_by: PROV.submitted_by },
  )
  console.log(`  Total audit persons in graph: query completed`)

  const { summary: orgCount } = await executeWrite(
    `MATCH (n:Organization {caso_slug: $caso_slug})
     WHERE n.submitted_by = $submitted_by
     RETURN count(n) as cnt`,
    { caso_slug: CASO_SLUG, submitted_by: PROV.submitted_by },
  )
  console.log(`  Total audit orgs in graph: query completed`)

  console.log('\nIngestion complete.')
  await closeDriver()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
