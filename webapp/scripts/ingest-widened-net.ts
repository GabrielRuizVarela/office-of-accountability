/**
 * Ingest widened net findings into Neo4j.
 * Run with: npx tsx scripts/ingest-widened-net.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const now = new Date().toISOString()
const PROV = {
  submitted_by: 'investigation:widened-net',
  tier: 'silver' as const,
  confidence_score: 0.85,
  source_url: 'https://www.infobae.com',
}

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) { console.error('Cannot connect to Neo4j'); process.exit(1) }
  console.log('Ingesting widened net findings...\n')

  // ── Persons ──────────────────────────────────────────────
  const persons = [
    { name: 'BELOCOPITT CLAUDIO', role: 'Owner Swiss Medical (76%) + Grupo America (40%), 6 offshore entities', severity: 'critical' },
    { name: 'CLOSS MAURICE FABIAN', role: 'Senator, declared $8.82B ARS, 367x wealth growth in 9 years', severity: 'high' },
    { name: 'PUERTA FEDERICO RAMON', role: 'Diputado, declared $8.51B ARS, 63x gap jump', severity: 'high' },
    { name: 'KIRCHNER MAXIMO CARLOS', role: 'Diputado, $8.31B declared, 27 properties + Los Sauces/Hotesur', severity: 'high' },
    { name: 'CARRIZO ANA CARLA', role: 'Diputada, $7.07B, 1577x growth in 12 years', severity: 'high' },
    { name: 'STURZENEGGER FEDERICO', role: 'Min. Desregulación, $2.37B, 45x growth + PENSAR member', severity: 'high' },
    { name: 'GRIMALDI JOSE LUIS SANTIAGO', role: 'Individual with 32 defense contracts ($1.3B)', severity: 'high' },
    { name: 'CAPUTO SANTIAGO', role: 'Reported controller of SIDE intelligence', severity: 'critical' },
  ]

  for (const p of persons) {
    const res = await executeWrite(
      `MERGE (n:Person {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.role_es = $role, n.severity = $severity,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.severity = $severity, n.role_es = $role, n.updated_at = $now`,
      { name: p.name, role: p.role, severity: p.severity, ...PROV, now },
    )
    console.log(`  Person: ${p.name} (${p.severity})`, res.summary.counters)
  }

  // ── Organizations ────────────────────────────────────────
  const orgs = [
    { name: 'SWISS MEDICAL GROUP', sector: 'health_insurance', note: 'Health insurance, Belocopitt 76%, $1.1B' },
    { name: 'GRUPO AMERICA S.A.', sector: 'media', note: 'Media (America TV, A24, La Red), Belocopitt 40%' },
    { name: 'SIDE (SECRETARIA DE INTELIGENCIA)', sector: 'intelligence', note: 'Intelligence service, 2838% secret fund increase' },
    { name: 'PHARMOS S.A.', sector: 'health_contractor', note: 'Health contractor #1, $14.9B' },
    { name: 'GLENCORE ARGENTINA', sector: 'mining', note: 'Mining, Bermuda offshore structures' },
    { name: 'FUNDACION PENSAR', sector: 'think_tank', note: 'PRO party think tank' },
  ]

  for (const o of orgs) {
    const res = await executeWrite(
      `MERGE (n:Organization {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.sector = $sector, n.note = $note,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.note = $note, n.updated_at = $now`,
      { name: o.name, sector: o.sector, note: o.note, ...PROV, now },
    )
    console.log(`  Org: ${o.name}`, res.summary.counters)
  }

  // ── Events ───────────────────────────────────────────────
  const events = [
    { id: 'fp-side-funds-explosion', date: '2025-01-01', title: 'SIDE secret funds grew 2,838% under Milei: ARS 3.8B → 13.4B (2025)' },
    { id: 'fp-belocopitt-panama', date: '2016-04-03', title: 'Belocopitt: 6 offshore entities in Panama Papers — most of any Argentine' },
    { id: 'fp-health-cartel', date: '2025-06-01', title: 'Health sector concentration: PHARMOS $14.9B in 4 contracts, SUIZO dual CUITs' },
  ]

  for (const ev of events) {
    const res = await executeWrite(
      `MERGE (e:Event {id: $id})
       SET e.caso_slug = 'caso-finanzas-politicas', e.date = $date,
           e.title_en = $title, e.submitted_by = $submitted_by,
           e.tier = $tier, e.created_at = coalesce(e.created_at, $now)`,
      { ...ev, ...PROV, now },
    )
    console.log(`  Event: ${ev.title}`, res.summary.counters)
  }

  // ── Relationships ────────────────────────────────────────
  const rels = [
    { from: 'BELOCOPITT CLAUDIO', to: 'SWISS MEDICAL GROUP', toLabel: 'Organization', type: 'CONTROLS', desc: 'Owns 76% of Swiss Medical Group' },
    { from: 'BELOCOPITT CLAUDIO', to: 'GRUPO AMERICA S.A.', toLabel: 'Organization', type: 'CONTROLS', desc: 'Owns 40% of Grupo America media conglomerate' },
    { from: 'CAPUTO SANTIAGO', to: 'SIDE (SECRETARIA DE INTELIGENCIA)', toLabel: 'Organization', type: 'CONTROLS', desc: 'Reported controller of SIDE intelligence service' },
    { from: 'STURZENEGGER FEDERICO', to: 'FUNDACION PENSAR', toLabel: 'Organization', type: 'MEMBER_OF', desc: 'Member of PRO think tank Fundacion PENSAR' },
  ]

  for (const r of rels) {
    try {
      const query = r.toLabel === 'Person'
        ? `MATCH (a:Person {name: $from, caso_slug: 'caso-finanzas-politicas'})
           MATCH (b:Person {name: $to})
           MERGE (a)-[rel:RELATED_TO]->(b)
           SET rel.relationship_type = $type, rel.description = $desc,
               rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`
        : `MATCH (a:Person {name: $from, caso_slug: 'caso-finanzas-politicas'})
           MATCH (b:Organization {name: $to})
           MERGE (a)-[rel:RELATED_TO]->(b)
           SET rel.relationship_type = $type, rel.description = $desc,
               rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`
      const res = await executeWrite(
        query,
        { from: r.from, to: r.to, type: r.type, desc: r.desc, source: PROV.submitted_by, now },
      )
      console.log(`  Rel: ${r.from} -[${r.type}]-> ${r.to}`, res.summary.counters)
    } catch (e) {
      console.log(`  x Rel failed: ${r.from} -> ${r.to}: ${e instanceof Error ? e.message : e}`)
    }
  }

  console.log('\nWidened net ingestion complete.')
  await closeDriver()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
