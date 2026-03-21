/**
 * Ingest financial arms investigation findings into Neo4j.
 * Run with: npx tsx scripts/ingest-financial-findings.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const now = new Date().toISOString()
const PROV = {
  submitted_by: 'investigation:financial-arms',
  tier: 'silver' as const,
  confidence_score: 0.85,
  source_url: 'https://www.infobae.com',
}

async function main(): Promise<void> {
  await verifyConnectivity()
  console.log('Ingesting financial arms investigation findings...\n')

  // Key persons
  const persons = [
    { name: 'MARTINEZ SOSA HECTOR', role: 'Insurance broker, Alberto Fernandez associate', severity: 'critical' },
    { name: 'FERNANDEZ ALBERTO', role: 'President of Argentina 2019-2023, signed Decreto 823/2021', severity: 'critical' },
    { name: 'ORTOLANO FRANCO', role: 'Owner of Liderar Seguros, ally of Plate', severity: 'high' },
    { name: 'CUNEO LIBARONA MARIANO', role: 'Minister of Justice, former legal director of Libra Seguros', severity: 'critical' },
    { name: 'PAZO JUAN', role: 'Head of ARCA, former Superintendent of Insurance', severity: 'high' },
    { name: 'FRANCOS GUILLERMO', role: 'YPF Director, former Chief of Staff, former President Banco Provincia', severity: 'high' },
    { name: 'CATALAN LISANDRO', role: 'Former Interior Minister, then YPF Director Nov 2025', severity: 'critical' },
    { name: 'PLATE GUILLERMO PEDRO', role: 'Superintendent of Insurance, former VP Provincia ART', severity: 'critical' },
    { name: 'BREA ROBERTO MARIA', role: 'Tourism Vocal at Presidency, officer of 5 investment companies', severity: 'high' },
    { name: 'NEGRI JUAN JAVIER', role: 'Vocal PEN Min Education, officer of 7+ finance entities including BVI', severity: 'high' },
    { name: 'CLUSELLAS PABLO', role: 'Secretary of Presidency under Macri, SOCMA officer', severity: 'high' },
  ]

  for (const p of persons) {
    await executeWrite(
      `MERGE (n:Person {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.role_es = $role, n.severity = $severity,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.severity = $severity, n.updated_at = $now`,
      { name: p.name, role: p.role, severity: p.severity, ...PROV, now },
    )
    console.log(`  Person: ${p.name} (${p.severity})`)
  }

  // Key organizations
  const orgs = [
    { name: 'HECTOR MARTINEZ SOSA Y CIA S.A.', sector: 'insurance_broker', note: 'Top broker, embargoed $2.87B ARS' },
    { name: 'BACHELLIER S.A.', sector: 'insurance_broker', note: 'Broker #1: $1.665B ARS commissions, embargoed $9.669B ARS' },
    { name: 'LIDERAR SEGUROS', sector: 'insurance', note: 'Shielded by Superintendent Plate from inspections' },
    { name: 'LIBRA SEGUROS', sector: 'insurance', note: 'Double-shielded: Plate + Justice Minister' },
    { name: 'PARANA SEGUROS', sector: 'insurance', note: 'Favorable ART entry under Plate' },
    { name: 'BAPRO MANDATOS Y NEGOCIOS S.A.U.', sector: 'financial_holding', note: '99% Grupo Bapro, housing trust scandal' },
    { name: 'GRUPO BAPRO S.A.', sector: 'financial_holding', note: 'Banco Provincia group, political appointments' },
    { name: 'SOCMA INVERSIONES S.A.', sector: 'financial_holding', note: 'Macri family holding company' },
  ]

  for (const o of orgs) {
    await executeWrite(
      `MERGE (n:Organization {name: $name})
       ON CREATE SET n.id = 'fp-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.sector = $sector, n.note = $note,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.note = $note, n.updated_at = $now`,
      { name: o.name, sector: o.sector, note: o.note, ...PROV, now },
    )
    console.log(`  Org: ${o.name}`)
  }

  // Key relationships
  const rels: Array<{ from: string; to: string; type: string; desc: string }> = [
    { from: 'MARTINEZ SOSA HECTOR', to: 'FERNANDEZ ALBERTO', type: 'ASSOCIATED_WITH', desc: 'Personal associate and advisor 2010-2019' },
    { from: 'MARTINEZ SOSA HECTOR', to: 'HECTOR MARTINEZ SOSA Y CIA S.A.', type: 'OFFICER_OF', desc: 'Owner/Broker' },
    { from: 'CUNEO LIBARONA MARIANO', to: 'LIBRA SEGUROS', type: 'FORMERLY_AT', desc: 'Former legal director' },
    { from: 'PLATE GUILLERMO PEDRO', to: 'LIDERAR SEGUROS', type: 'PROTECTS', desc: 'Exempt from SSN inspections' },
    { from: 'CATALAN LISANDRO', to: 'BAPRO MANDATOS Y NEGOCIOS S.A.U.', type: 'FORMERLY_AT', desc: 'President during Scioli governorship' },
    { from: 'CLUSELLAS PABLO', to: 'SOCMA INVERSIONES S.A.', type: 'OFFICER_OF', desc: 'Corporate officer while Presidential Secretary' },
    { from: 'ORTOLANO FRANCO', to: 'LIDERAR SEGUROS', type: 'OWNS', desc: 'Owner of Liderar Seguros' },
  ]

  for (const r of rels) {
    try {
      await executeWrite(
        `MATCH (a {name: $from}) MATCH (b {name: $to})
         MERGE (a)-[rel:RELATED_TO]->(b)
         SET rel.relationship_type = $type, rel.description = $desc,
             rel.source = $source, rel.created_at = coalesce(rel.created_at, $now)`,
        { from: r.from, to: r.to, type: r.type, desc: r.desc, source: PROV.submitted_by, now },
      )
      console.log(`  Rel: ${r.from} -[${r.type}]-> ${r.to}`)
    } catch (e) {
      console.log(`  x Rel failed: ${r.from} -> ${r.to}: ${e instanceof Error ? e.message : e}`)
    }
  }

  // Timeline events
  const events = [
    { id: 'fp-decreto-823', date: '2021-12-01', title: 'Decreto 823/2021 - state insurance monopoly' },
    { id: 'fp-raids-seguros', date: '2024-04-01', title: '24 raids in Causa Seguros investigation' },
    { id: 'fp-decreto-747', date: '2024-08-21', title: 'Decreto 747/2024 revokes insurance monopoly' },
    { id: 'fp-catalan-ypf', date: '2025-11-17', title: 'Catalan appointed YPF Director after Interior' },
    { id: 'fp-procesamiento-msosa', date: '2026-02-10', title: 'Prosecution of Martinez Sosa company' },
  ]

  for (const ev of events) {
    await executeWrite(
      `MERGE (e:Event {id: $id})
       SET e.caso_slug = 'caso-finanzas-politicas', e.date = $date,
           e.title_en = $title, e.submitted_by = $submitted_by,
           e.tier = $tier, e.created_at = coalesce(e.created_at, $now)`,
      { ...ev, ...PROV, now },
    )
    console.log(`  Event: ${ev.title}`)
  }

  console.log('\nIngestion complete.')
  await closeDriver()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
