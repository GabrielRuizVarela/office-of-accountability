/**
 * Ingest Argentine oligarchic family network data into Neo4j.
 * Run with: npx tsx scripts/ingest-family-networks.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const now = new Date().toISOString()
const PROV = {
  submitted_by: 'investigation:family-networks',
  tier: 'silver' as const,
  confidence_score: 0.85,
}

async function main(): Promise<void> {
  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Ingesting Argentine oligarchic family network data...\n')

  // ── PERSONS ──────────────────────────────────────────────────────────

  const persons = [
    // Macri clan (Mauricio already in graph)
    { name: 'MACRI FRANCISCO', role_es: 'Patriarca clan Macri, fundador SOCMA, 17 empresas en IGJ', role_en: 'Macri clan patriarch, SOCMA founder, 17 companies in IGJ', severity: 'critical' },
    { name: 'MACRI GIANFRANCO', role_es: 'Cabeza operativa clan Macri, 12 empresas, BF Corporation Panamá', role_en: 'Macri clan operational head, 12 companies, BF Corporation Panama', severity: 'critical' },
    { name: 'MACRI MARIANO', role_es: '7 empresas, denunció a SOCMA por fraude 2024', role_en: '7 companies, denounced SOCMA for fraud 2024', severity: 'high' },
    { name: 'MACRI JORGE', role_es: 'Jefe de Gobierno CABA, 4 empresas', role_en: 'Mayor of Buenos Aires (CABA), 4 companies', severity: 'high' },

    // Magnetto-Clarín (Héctor Magnetto, Marcela Noble Herrera, Felipe Noble Herrera already seeded)
    { name: 'HERRERA DE NOBLE ERNESTINA', role_es: 'Fundadora Grupo Clarín, 2 empresas', role_en: 'Founder Grupo Clarín, 2 companies', severity: 'critical' },

    // Mindlin-Pampa
    { name: 'MINDLIN MARCOS', role_es: '52 empresas, controla Pampa Energía/CITELEC/EDELAP', role_en: '52 companies, controls Pampa Energía/CITELEC/EDELAP', severity: 'critical' },
    { name: 'MINDLIN NICOLAS', role_es: '17 empresas, grupo Mindlin', role_en: '17 companies, Mindlin group', severity: 'high' },

    // Werthein
    { name: 'WERTHEIN DARIO', role_es: '29 empresas, imperio de seguros', role_en: '29 companies, insurance empire', severity: 'critical' },
    { name: 'WERTHEIN ADRIAN', role_es: '29 empresas, grupo Werthein', role_en: '29 companies, Werthein group', severity: 'critical' },
    { name: 'WERTHEIN DANIEL', role_es: '27 empresas, grupo Werthein', role_en: '27 companies, Werthein group', severity: 'high' },
    { name: 'WERTHEIN LEO', role_es: '10 empresas, SOFORA Telecomunicaciones', role_en: '10 companies, SOFORA Telecomunicaciones', severity: 'high' },

    // Caputo
    { name: 'CAPUTO NICOLAS', role_es: '13 empresas, fundador PENSAR, amigo íntimo Macri', role_en: '13 companies, PENSAR founder, Macri intimate friend', severity: 'critical' },
    { name: 'CAPUTO LUIS ANDRES', role_es: '13 empresas, ANKER, Ministro de Economía bajo Milei', role_en: '13 companies, ANKER, Economy Minister under Milei', severity: 'critical' },
  ]

  console.log('── Creating Person nodes ──')
  for (const p of persons) {
    await executeWrite(
      `MERGE (n:Person {name: $name})
       ON CREATE SET n.id = 'fn-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.role_es = $role_es, n.role_en = $role_en,
                     n.severity = $severity,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.role_es = coalesce($role_es, n.role_es),
                    n.role_en = coalesce($role_en, n.role_en),
                    n.severity = $severity, n.updated_at = $now`,
      { name: p.name, role_es: p.role_es, role_en: p.role_en, severity: p.severity, ...PROV, now },
    )
    console.log(`  Person: ${p.name} (${p.severity})`)
  }

  // ── ORGANIZATIONS ────────────────────────────────────────────────────

  const orgs = [
    // Macri holdings
    { name: 'SOCMA S.A.', sector: 'financial_holding', note: 'Macri family master holding company (Sociedad Macri)' },
    { name: 'BF CORPORATION S.A.', sector: 'offshore_holding', note: 'Gianfranco Macri offshore vehicle, Panama' },

    // Clarín
    { name: 'GRUPO CLARIN S.A.', sector: 'media', note: 'Largest Argentine media conglomerate' },
    { name: 'FUNDACION CAROLINA', sector: 'foundation', note: 'Shared board: Magnetto + De Narváez link' },
    { name: 'EL CRONISTA COMERCIAL S.A.', sector: 'media', note: 'Business newspaper, De Narváez link' },

    // Mindlin-Pampa
    { name: 'PAMPA ENERGIA S.A.', sector: 'energy', note: 'Mindlin flagship, controls electricity distribution' },
    { name: 'CITELEC S.A.', sector: 'energy_distribution', note: 'Electricity distribution, controlled by Pampa Energía' },
    { name: 'EDELAP S.A.', sector: 'energy_distribution', note: 'Electricity distribution La Plata, Mindlin controlled' },

    // Werthein
    { name: 'CAJA DE SEGUROS S.A.', sector: 'insurance', note: 'Werthein insurance empire flagship' },
    { name: 'SOFORA TELECOMUNICACIONES S.A.', sector: 'telecommunications', note: 'Telecom Argentina controlling shareholder, Leo Werthein' },

    // Caputo
    { name: 'FUNDACION PENSAR', sector: 'think_tank', note: 'PRO party think tank, Nicolás Caputo founder' },
    { name: 'ANKER LATINOAMERICA S.A.', sector: 'financial_holding', note: 'Luis Caputo vehicle, pre-ministry' },

    // Cross-family
    { name: 'CONSEJO EMPRESARIO ARGENTINO', sector: 'business_lobby', note: 'Argentine business council, all major families represented' },
  ]

  console.log('\n── Creating Organization nodes ──')
  for (const o of orgs) {
    await executeWrite(
      `MERGE (n:Organization {name: $name})
       ON CREATE SET n.id = 'fn-' + replace(toLower($name), ' ', '-'),
                     n.caso_slug = 'caso-finanzas-politicas',
                     n.sector = $sector, n.note = $note,
                     n.submitted_by = $submitted_by, n.tier = $tier,
                     n.confidence_score = $confidence_score, n.created_at = $now
       ON MATCH SET n.note = $note, n.updated_at = $now`,
      { name: o.name, sector: o.sector, note: o.note, ...PROV, now },
    )
    console.log(`  Org: ${o.name}`)
  }

  // ── RELATIONSHIPS ────────────────────────────────────────────────────

  // Person-to-Person relationships
  const ppRels: Array<{ from: string; to: string; type: string; desc: string }> = [
    // Macri family ties
    { from: 'MACRI FRANCISCO', to: 'MACRI GIANFRANCO', type: 'FAMILY_OF', desc: 'Father and son' },
    { from: 'MACRI FRANCISCO', to: 'MACRI MARIANO', type: 'FAMILY_OF', desc: 'Father and son' },
    { from: 'MACRI FRANCISCO', to: 'MACRI MAURICIO', type: 'FAMILY_OF', desc: 'Father and son' },
    { from: 'MACRI FRANCISCO', to: 'MACRI JORGE', type: 'FAMILY_OF', desc: 'Uncle/nephew (Franco patriarch)' },
    { from: 'MACRI GIANFRANCO', to: 'MACRI MAURICIO', type: 'FAMILY_OF', desc: 'Brothers' },
    { from: 'MACRI GIANFRANCO', to: 'MACRI MARIANO', type: 'FAMILY_OF', desc: 'Brothers' },
    { from: 'MACRI MAURICIO', to: 'MACRI MARIANO', type: 'FAMILY_OF', desc: 'Brothers' },
    { from: 'MACRI MAURICIO', to: 'MACRI JORGE', type: 'FAMILY_OF', desc: 'Cousins' },

    // Magnetto-Clarín family
    { from: 'HERRERA DE NOBLE ERNESTINA', to: 'NOBLE HERRERA MARCELA', type: 'FAMILY_OF', desc: 'Mother and adopted daughter' },
    { from: 'HERRERA DE NOBLE ERNESTINA', to: 'NOBLE HERRERA FELIPE', type: 'FAMILY_OF', desc: 'Mother and adopted son' },
    { from: 'NOBLE HERRERA MARCELA', to: 'NOBLE HERRERA FELIPE', type: 'FAMILY_OF', desc: 'Siblings (adopted)' },

    // Mindlin family
    { from: 'MINDLIN MARCOS', to: 'MINDLIN NICOLAS', type: 'FAMILY_OF', desc: 'Father and son' },

    // Werthein family
    { from: 'WERTHEIN DARIO', to: 'WERTHEIN ADRIAN', type: 'FAMILY_OF', desc: 'Brothers' },
    { from: 'WERTHEIN DARIO', to: 'WERTHEIN DANIEL', type: 'FAMILY_OF', desc: 'Brothers' },
    { from: 'WERTHEIN DARIO', to: 'WERTHEIN LEO', type: 'FAMILY_OF', desc: 'Brothers/cousins' },
    { from: 'WERTHEIN ADRIAN', to: 'WERTHEIN DANIEL', type: 'FAMILY_OF', desc: 'Brothers' },

    // Caputo ↔ Macri
    { from: 'CAPUTO NICOLAS', to: 'MACRI MAURICIO', type: 'ASSOCIATED_WITH', desc: 'Lifelong business partners, intimate friends' },
    { from: 'CAPUTO LUIS ANDRES', to: 'MACRI MAURICIO', type: 'ASSOCIATED_WITH', desc: 'Business partner, Economy Minister link' },
  ]

  // Person-to-Organization relationships
  const poRels: Array<{ from: string; to: string; type: string; desc: string }> = [
    // Macri → SOCMA/BF
    { from: 'MACRI FRANCISCO', to: 'SOCMA S.A.', type: 'CONTROLS', desc: 'Founder and patriarch of SOCMA' },
    { from: 'MACRI GIANFRANCO', to: 'SOCMA S.A.', type: 'OFFICER_OF', desc: 'Operational head' },
    { from: 'MACRI GIANFRANCO', to: 'BF CORPORATION S.A.', type: 'CONTROLS', desc: 'Panama offshore vehicle' },

    // Magnetto-Clarín → orgs
    { from: 'HERRERA DE NOBLE ERNESTINA', to: 'GRUPO CLARIN S.A.', type: 'CONTROLS', desc: 'Founder Grupo Clarín' },
    { from: 'MAGNETTO HECTOR', to: 'GRUPO CLARIN S.A.', type: 'OFFICER_OF', desc: 'CEO Grupo Clarín, 35 companies' },
    { from: 'NOBLE HERRERA MARCELA', to: 'GRUPO CLARIN S.A.', type: 'OFFICER_OF', desc: '24.85% shareholder' },
    { from: 'NOBLE HERRERA FELIPE', to: 'GRUPO CLARIN S.A.', type: 'OFFICER_OF', desc: '24.85% shareholder' },
    { from: 'MAGNETTO HECTOR', to: 'FUNDACION CAROLINA', type: 'OFFICER_OF', desc: 'Shared board with De Narváez' },
    { from: 'MAGNETTO HECTOR', to: 'EL CRONISTA COMERCIAL S.A.', type: 'ASSOCIATED_WITH', desc: 'Media cross-ownership link to De Narváez' },

    // Mindlin → Pampa
    { from: 'MINDLIN MARCOS', to: 'PAMPA ENERGIA S.A.', type: 'CONTROLS', desc: 'Controls Pampa Energía, 52 companies' },
    { from: 'MINDLIN NICOLAS', to: 'PAMPA ENERGIA S.A.', type: 'OFFICER_OF', desc: 'Family member in group, 17 companies' },

    // Werthein → orgs
    { from: 'WERTHEIN DARIO', to: 'CAJA DE SEGUROS S.A.', type: 'CONTROLS', desc: 'Insurance empire control' },
    { from: 'WERTHEIN ADRIAN', to: 'CAJA DE SEGUROS S.A.', type: 'OFFICER_OF', desc: 'Insurance empire, 29 companies' },
    { from: 'WERTHEIN DANIEL', to: 'CAJA DE SEGUROS S.A.', type: 'OFFICER_OF', desc: 'Insurance empire, 27 companies' },
    { from: 'WERTHEIN LEO', to: 'SOFORA TELECOMUNICACIONES S.A.', type: 'OFFICER_OF', desc: 'Telecom controlling shareholder, 10 companies' },

    // Caputo → orgs
    { from: 'CAPUTO NICOLAS', to: 'FUNDACION PENSAR', type: 'CONTROLS', desc: 'Founder PRO think tank' },
    { from: 'CAPUTO LUIS ANDRES', to: 'ANKER LATINOAMERICA S.A.', type: 'CONTROLS', desc: 'Financial vehicle pre-ministry' },

    // Cross-family: CONSEJO EMPRESARIO ARGENTINO
    { from: 'MACRI FRANCISCO', to: 'CONSEJO EMPRESARIO ARGENTINO', type: 'MEMBER_OF', desc: 'Business lobby member' },
    { from: 'MAGNETTO HECTOR', to: 'CONSEJO EMPRESARIO ARGENTINO', type: 'MEMBER_OF', desc: 'Business lobby member' },
    { from: 'MINDLIN MARCOS', to: 'CONSEJO EMPRESARIO ARGENTINO', type: 'MEMBER_OF', desc: 'Business lobby member' },
    { from: 'WERTHEIN DARIO', to: 'CONSEJO EMPRESARIO ARGENTINO', type: 'MEMBER_OF', desc: 'Business lobby member' },
    { from: 'CAPUTO NICOLAS', to: 'CONSEJO EMPRESARIO ARGENTINO', type: 'MEMBER_OF', desc: 'Business lobby member' },
  ]

  // Organization-to-Organization relationships
  const ooRels: Array<{ from: string; to: string; type: string; desc: string }> = [
    { from: 'PAMPA ENERGIA S.A.', to: 'CITELEC S.A.', type: 'CONTROLS', desc: 'Electricity distribution subsidiary' },
    { from: 'PAMPA ENERGIA S.A.', to: 'EDELAP S.A.', type: 'CONTROLS', desc: 'Electricity distribution La Plata subsidiary' },
  ]

  console.log('\n── Creating Person↔Person relationships ──')
  for (const r of ppRels) {
    try {
      await executeWrite(
        `MATCH (a:Person {name: $from}) MATCH (b:Person {name: $to})
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

  console.log('\n── Creating Person→Organization relationships ──')
  for (const r of poRels) {
    try {
      await executeWrite(
        `MATCH (a:Person {name: $from}) MATCH (b:Organization {name: $to})
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

  console.log('\n── Creating Organization→Organization relationships ──')
  for (const r of ooRels) {
    try {
      await executeWrite(
        `MATCH (a:Organization {name: $from}) MATCH (b:Organization {name: $to})
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

  console.log('\nFamily network ingestion complete.')
  await closeDriver()
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
