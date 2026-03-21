/**
 * Ingest judicial branch investigation findings into Neo4j.
 * Reads research JSON files produced by research agents and creates
 * Person, Organization, Event nodes and RELATED_TO relationships.
 *
 * Run with: npx tsx scripts/ingest-judicial-findings.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const now = new Date().toISOString()
const CASO_SLUG = 'caso-finanzas-politicas'
const PROV = {
  submitted_by: 'investigation:judicial-branch',
  tier: 'silver' as const,
  confidence_score: 0.85,
}

function loadResearch(filename: string): unknown {
  const path = join(import.meta.dirname ?? __dirname, '..', 'src', 'etl', 'judiciary', 'research', filename)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j. Is the database running?')
    process.exit(1)
  }
  console.log('Connected to Neo4j. Ingesting judicial branch findings...\n')

  // Load research files (for reference/logging)
  const powerFindings = loadResearch('judicial-power-findings.json')
  const comodoroFindings = loadResearch('comodoro-py-findings.json')
  const casesFindings = loadResearch('judicial-cases-findings.json')
  console.log('Loaded 3 research files.\n')

  // ── PERSONS ──────────────────────────────────────────────────────────

  const persons = [
    { name: 'LIJO ARIEL OSCAR', role: 'Juez Federal Comodoro Py Juzgado 12, nominado a Corte Suprema via Decreto 137/2025', severity: 'critical' },
    { name: 'ERCOLINI JULIAN DANIEL', role: 'Juez Federal Comodoro Py Juzgado 11, Causa Seguros, sobreseyo a Frigerio', severity: 'critical' },
    { name: 'CASANELLO SEBASTIAN', role: 'Juez Federal Comodoro Py, instruye Causa Seguros', severity: 'high' },
    { name: 'BONADIO CLAUDIO', role: 'Juez Federal Comodoro Py (fallecido 2020), manejó causas Kirchner', severity: 'high' },
    { name: 'GIL LAVEDRA RICARDO', role: 'Juez de juicio a juntas militares, luego diputado UCR y Ministro de Justicia', severity: 'high' },
    { name: 'MONTENEGRO GUILLERMO', role: 'Ex juez federal Comodoro Py, intendente de Mar del Plata (LLA)', severity: 'high' },
    { name: 'MAQUEDA JUAN CARLOS', role: 'Ministro de Corte Suprema (2003-2023), politico PJ, senador y convencional constituyente', severity: 'high' },
    { name: 'FRAGA JOSE MARIA', role: 'Juez Federal que sobreseyo a Macri en causa Fleg Trading/Panama Papers', severity: 'high' },
  ]

  console.log('── Persons ──')
  for (const p of persons) {
    await executeWrite(
      `MERGE (n:Person {name: $name, caso_slug: $caso_slug})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.role_es = $role, n.severity = $severity,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.role_es = $role, n.severity = $severity, n.updated_at = $now`,
      { name: p.name, caso_slug: CASO_SLUG, role: p.role, severity: p.severity, ...PROV, now },
    )
    console.log(`  Person: ${p.name} (${p.severity})`)
  }

  // ── ORGANIZATIONS ────────────────────────────────────────────────────

  const orgs = [
    { name: 'COMODORO PY', sector: 'judiciary', note: 'Sede de los 12 Juzgados Federales de 1era instancia, Comodoro Py 2002, Buenos Aires. Centro neuralgico del poder judicial federal.' },
    { name: 'CONSEJO DE LA MAGISTRATURA', sector: 'judiciary', note: 'Organo constitucional de seleccion y remocion de jueces. Controlado por partidos politicos.' },
    { name: 'PODER JUDICIAL DE LA NACION', sector: 'judiciary', note: 'Poder Judicial federal argentino como institucion. Mas de 300 vacantes en 2026.' },
  ]

  console.log('\n── Organizations ──')
  for (const o of orgs) {
    await executeWrite(
      `MERGE (n:Organization {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = $caso_slug,
                     n.sector = $sector, n.note = $note,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.note = $note, n.updated_at = $now`,
      { name: o.name, caso_slug: CASO_SLUG, sector: o.sector, note: o.note, ...PROV, now },
    )
    console.log(`  Org: ${o.name}`)
  }

  // ── EVENTS ───────────────────────────────────────────────────────────

  const events = [
    {
      id: 'fp-lijo-nomination',
      date: '2025-02-25',
      title: 'Milei nomina a Lijo a Corte Suprema mientras maneja caso Correo Argentino (Macri)',
      category: 'judicial',
    },
    {
      id: 'fp-ercolini-dual',
      date: '2024-04-01',
      title: 'Ercolini sobreseyó a Frigerio (2022) y luego ordenó 24 allanamientos en Causa Seguros (2024)',
      category: 'judicial',
    },
    {
      id: 'fp-montenegro-transition',
      date: '2023-12-10',
      title: 'Montenegro pasó de juez federal a intendente de Mar del Plata (LLA)',
      category: 'judicial',
    },
    {
      id: 'fp-maqueda-dual',
      date: '2023-12-31',
      title: 'Maqueda en Corte Suprema como juez y también figura como político PJ',
      category: 'judicial',
    },
  ]

  console.log('\n── Events ──')
  for (const ev of events) {
    await executeWrite(
      `MERGE (e:Event {id: $id})
       SET e.caso_slug = $caso_slug, e.date = $date,
           e.title_en = $title, e.category = $category,
           e.submitted_by = $submitted_by, e.tier = $tier,
           e.created_at = coalesce(e.created_at, $now)`,
      { ...ev, caso_slug: CASO_SLUG, ...PROV, now },
    )
    console.log(`  Event: ${ev.title}`)
  }

  // ── RELATIONSHIPS ────────────────────────────────────────────────────

  const rels = [
    { from: 'LIJO ARIEL OSCAR', to: 'CORREO ARGENTINO S.A.', toLabel: 'Organization' as const, type: 'HANDLES_CASE', desc: 'Juez a cargo de causa Correo Argentino, sensible para familia Macri' },
    { from: 'ERCOLINI JULIAN DANIEL', to: 'CAUSA SEGUROS', toLabel: 'Event' as const, type: 'HANDLES_CASE', desc: 'Ordenó 24 allanamientos en Causa Seguros (2024)' },
    { from: 'ERCOLINI JULIAN DANIEL', to: 'FRIGERIO ROGELIO', toLabel: 'Person' as const, type: 'CLEARED', desc: 'Sobreseyó a Frigerio en 2022' },
    { from: 'CASANELLO SEBASTIAN', to: 'CAUSA SEGUROS', toLabel: 'Event' as const, type: 'PROSECUTES', desc: 'Instruye Causa Seguros desde juzgado federal' },
    { from: 'FRAGA JOSE MARIA', to: 'MACRI MAURICIO', toLabel: 'Person' as const, type: 'CLEARED', desc: 'Sobreseyó a Macri en causa Fleg Trading/Panama Papers' },
    { from: 'GIL LAVEDRA RICARDO', to: 'UCR', toLabel: 'Organization' as const, type: 'MEMBER_OF', desc: 'Diputado UCR, Ministro de Justicia bajo De la Rua' },
    { from: 'MONTENEGRO GUILLERMO', to: 'LA LIBERTAD AVANZA', toLabel: 'Organization' as const, type: 'MEMBER_OF', desc: 'Intendente de Mar del Plata por LLA desde 2023' },
    { from: 'LIJO ARIEL OSCAR', to: 'MILEI JAVIER', toLabel: 'Person' as const, type: 'NOMINATED_BY', desc: 'Nominado a Corte Suprema via Decreto 137/2025' },
  ]

  // Build labeled Cypher queries to avoid full-graph scans on 951K+ CompanyOfficer nodes
  const labeledQueries: Record<string, string> = {
    Person: `MATCH (a:Person {name: $from, caso_slug: $caso_slug})
         MATCH (b:Person {name: $to})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
    Organization: `MATCH (a:Person {name: $from, caso_slug: $caso_slug})
         MATCH (b:Organization {name: $to})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
    Event: `MATCH (a:Person {name: $from, caso_slug: $caso_slug})
         MATCH (b:Event {title_en: $to})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
  }

  console.log('\n── Relationships ──')
  for (const r of rels) {
    try {
      const query = labeledQueries[r.toLabel]
      await executeWrite(
        query,
        { from: r.from, to: r.to, caso_slug: CASO_SLUG, type: r.type, desc: r.desc, source: PROV.submitted_by, now },
      )
      console.log(`  Rel: ${r.from} -[${r.type}]-> ${r.to}`)
    } catch (e) {
      console.log(`  x Rel failed: ${r.from} -> ${r.to}: ${e instanceof Error ? e.message : e}`)
    }
  }

  console.log('\nIngestion complete.')
  await closeDriver()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
