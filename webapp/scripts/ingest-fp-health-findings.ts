/**
 * Ingest key entities from side-belocopitt-health-findings.json
 * into the caso-finanzas-politicas graph.
 *
 * Persons: RUBINSTEIN ADOLFO, SCATTURICE LEONARDO
 * Organizations: ELEA PHOENIX, GP PHARM, KEMEX, BIOSIDUS, LABORATORIO RAFFO,
 *                ACE ONCOLOGIA, GLENCORE INVESTMENTS ANTAMINA LIMITED,
 *                GLENCORE EL PACHON LIMITED
 * Events: fp-pami-16x, fp-suizo-2678pct, fp-glencore-discrepancy, fp-side-dnu941
 * Relationships: BELOCOPITT → Swiss Medical COVID aid, RUBINSTEIN → PHARMOS
 *
 * Idempotent - uses MERGE on (name, caso_slug) for Person/Organization
 * and (id, caso_slug) for Event.
 *
 * Run with: npx tsx scripts/ingest-fp-health-findings.ts
 */

import 'dotenv/config'

process.env.NEO4J_QUERY_TIMEOUT_MS = process.env.NEO4J_QUERY_TIMEOUT_MS || '60000'

import { executeWrite, closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-finanzas-politicas'
const SOURCE = 'etl:widened-net/side-belocopitt-health-findings'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

interface SeedPerson {
  name: string
  role: string
  description_en: string
  description_es: string
  source_url: string
}

interface SeedOrg {
  name: string
  org_type: string
  description_en: string
  description_es: string
  source_url: string
}

interface SeedEvent {
  id: string
  title: string
  date: string
  event_type: string
  description_en: string
  description_es: string
  source_url: string
}

interface SeedRel {
  from_label: string
  from_name: string
  to_label: string
  to_name: string
  rel_type: string
  description: string
  source_url: string
}

const PERSONS: SeedPerson[] = [
  {
    name: 'RUBINSTEIN ADOLFO',
    role: 'Ex-Secretario de Salud (gestión Macri 2016-2019)',
    description_en: 'Charged with irregular renegotiation of contracts with private labs for $1.4 billion. Labs won bids and a week later received 40% increases without legal procedures.',
    description_es: 'Denunciado por readecuación irregular de contratos con laboratorios privados por $1.400 millones. Laboratorios ganaban licitaciones y una semana después recibían aumentos del 40% sin procedimientos legales.',
    source_url: 'https://www.tiempoar.com.ar/ta_article/denuncian-a-rubinstein-por-contrataciones-irregulares-por-1400-millones-de-pesos/amp/',
  },
  {
    name: 'SCATTURICE LEONARDO',
    role: 'Fiscal federal vinculado a investigaciones de corrupción',
    description_en: 'Federal prosecutor linked to corruption investigations in the health and intelligence sectors.',
    description_es: 'Fiscal federal vinculado a investigaciones de corrupción en los sectores de salud e inteligencia.',
    source_url: 'https://www.infobae.com/politica/',
  },
]

const ORGANIZATIONS: SeedOrg[] = [
  {
    name: 'ELEA PHOENIX',
    org_type: 'company',
    description_en: 'Part of oncological drug cartel - PAMI overpricing complaint before CNDC',
    description_es: 'Parte del cartel de medicamentos oncológicos - denuncia de sobreprecios en PAMI ante la CNDC',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'GP PHARM',
    org_type: 'company',
    description_en: 'Drug cartel member - PAMI oncological drug overpricing',
    description_es: 'Miembro del cartel farmacéutico - sobreprecios en medicamentos oncológicos del PAMI',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'KEMEX',
    org_type: 'company',
    description_en: 'Drug cartel member - PAMI oncological drug overpricing',
    description_es: 'Miembro del cartel farmacéutico - sobreprecios en medicamentos oncológicos del PAMI',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'BIOSIDUS',
    org_type: 'company',
    description_en: 'Drug cartel member - PAMI oncological drug overpricing',
    description_es: 'Miembro del cartel farmacéutico - sobreprecios en medicamentos oncológicos del PAMI',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'LABORATORIO RAFFO',
    org_type: 'company',
    description_en: 'Drug cartel member - PAMI oncological drug overpricing',
    description_es: 'Miembro del cartel farmacéutico - sobreprecios en medicamentos oncológicos del PAMI',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'ACE ONCOLOGIA',
    org_type: 'company',
    description_en: 'Drug cartel coordinator - coordinated pricing of oncological drugs with PAMI overpricing',
    description_es: 'Coordinador del cartel farmacéutico - fijación coordinada de precios en medicamentos oncológicos con sobreprecios del PAMI',
    source_url: 'https://www.infobae.com/politica/2025/01/23/denuncian-al-pami-y-a-un-grupo-de-laboratorios-por-sobreprecios-en-la-compra-de-remedios-oncologicos/',
  },
  {
    name: 'GLENCORE INVESTMENTS ANTAMINA LIMITED',
    org_type: 'company',
    description_en: 'Bermuda offshore entity for Argentine mining operations - Paradise Papers',
    description_es: 'Sociedad offshore en Bermuda para operaciones mineras argentinas - Paradise Papers',
    source_url: 'https://convoca.pe/investigacion/paradise-papers-los-negocios-de-glencore-en-argentina',
  },
  {
    name: 'GLENCORE EL PACHON LIMITED',
    org_type: 'company',
    description_en: 'Bermuda offshore entity for El Pachón copper project - Paradise Papers',
    description_es: 'Sociedad offshore en Bermuda para el proyecto de cobre El Pachón - Paradise Papers',
    source_url: 'https://convoca.pe/investigacion/paradise-papers-los-negocios-de-glencore-en-argentina',
  },
]

const EVENTS: SeedEvent[] = [
  {
    id: 'fp-pami-16x',
    title: 'PAMI paid 16x market price for oncological drugs (anastrozole $13,192 vs $924)',
    date: '2023',
    event_type: 'financial',
    description_en: 'Criminal complaint by Elisa Carrió and Hernán Reyes against PAMI for buying oncological drugs at 2 to 16 times higher prices than public tender in 2023. Anastrozole: $13,192/unit vs $924 in tender. Bevacizumab: $91,121 vs $17,000. Estimated loss: USD 1M in sample of 8 drugs from 5 labs.',
    description_es: 'Denuncia penal de Elisa Carrió y Hernán Reyes contra PAMI por comprar medicamentos oncológicos entre 2 y 16 veces más caros que por licitación pública en 2023. Anastrozol: $13.192/unidad vs $924. Bevacizumab: $91.121 vs $17.000. Pérdida estimada: USD 1M en muestra de 8 medicamentos de 5 laboratorios.',
    source_url: 'https://www.lanacion.com.ar/politica/denuncian-que-el-pami-pago-medicamentos-oncologicos-hasta-16-veces-mas-que-el-valor-de-las-compras-nid22012025/',
  },
  {
    id: 'fp-suizo-2678pct',
    title: 'Suizo Argentina contracts exploded 2,678% with bribery investigation',
    date: '2025',
    event_type: 'financial',
    description_en: 'Suizo Argentina S.A. went from $3,898M in contracts in 2024 to $108,299M in 2025 (2,678% increase). Owned by Kovalivker family. Leaked audios denounce illegal bribe collection. Raids found $240,000 cash in envelopes.',
    description_es: 'Suizo Argentina S.A. pasó de contratos por $3.898 millones en 2024 a $108.299 millones en 2025 (aumento del 2.678%). Propiedad de familia Kovalivker. Audios filtrados denuncian cobro ilegal de coimas. En allanamientos se encontraron $240.000 en sobres.',
    source_url: 'https://www.lanacion.com.ar/politica/aumento-exponencial-suizo-argentina-paso-de-3900-millones-a-108000-millones-en-contratos-con-el-nid24082025/',
  },
  {
    id: 'fp-glencore-discrepancy',
    title: 'Glencore reports USD 525M paid to Argentina vs USD 45M in databases',
    date: '2015',
    event_type: 'financial',
    description_en: 'Glencore reported paying circa USD 525 million to Argentina in 2015. However, per Resource Project (open source database), royalties and taxes barely exceeded USD 45 million. Mining royalties in Argentina are only 3%. Suggests large-scale transfer pricing.',
    description_es: 'Glencore informó que en 2015 pagó circa USD 525 millones a Argentina. Sin embargo, según Resource Project, la suma de regalías e impuestos apenas superó los USD 45 millones. Las regalías mineras en Argentina son solo del 3%. Sugiere transferencia de precios a gran escala.',
    source_url: 'https://www.perfil.com/noticias/paradisepapers/paradise-papers-glencore-el-oro-argentino-controlado-por-sociedades-offshore.phtml',
  },
  {
    id: 'fp-side-dnu941',
    title: 'DNU 941/2025 gave SIDE detention powers and mass surveillance without judicial order',
    date: '2025-12-31',
    event_type: 'legal',
    description_en: 'DNU 941/2025 reformed the National Intelligence Law by decree during congressional recess. Creates the National Intelligence Community (CITN), forces 15+ public agencies to share personal data with SIDE without controls, allows intelligence agents to apprehend people, and dissolves the National Directorate of Military Strategic Intelligence.',
    description_es: 'El DNU 941/2025 reformó la Ley de Inteligencia Nacional por decreto durante el receso del Congreso. Crea la Comunidad de Inteligencia Nacional (CITN), obliga a más de 15 organismos públicos a compartir datos personales con la SIDE sin controles, permite a agentes de inteligencia aprehender personas, y disuelve la Dirección Nacional de Inteligencia Estratégica Militar.',
    source_url: 'https://www.infobae.com/politica/2026/01/02/reforma-de-la-side-las-claves-de-la-reestructuracion-del-sistema-de-inteligencia-que-dispuso-milei-por-decreto/',
  },
]

const RELATIONSHIPS: SeedRel[] = [
  {
    from_label: 'Person',
    from_name: 'BELOCOPITT CLAUDIO FERNANDO',
    to_label: 'Organization',
    to_name: 'SWISS MEDICAL GROUP',
    rel_type: 'RECEIVED',
    description: '$13M COVID state aid while top-50 richest',
    source_url: 'https://www.lapoliticaonline.com/politica/en-el-gobierno-detectaron-que-belocopitt-recibio-mas-de-13-millones-de-dolares-del-estado-para-pagar-sueldos/',
  },
  {
    from_label: 'Person',
    from_name: 'RUBINSTEIN ADOLFO',
    to_label: 'Organization',
    to_name: 'PHARMOS',
    rel_type: 'FACILITATED',
    description: '40% post-bid price increases during his tenure',
    source_url: 'https://www.tiempoar.com.ar/ta_article/denuncian-a-rubinstein-por-contrataciones-irregulares-por-1400-millones-de-pesos/amp/',
  },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  const now = new Date().toISOString()

  // ── 1. Persons ──────────────────────────────────────────────────────
  console.log('=== Ingesting Persons ===')
  for (const p of PERSONS) {
    try {
      await executeWrite(
        `MERGE (p:Person {name: $name, caso_slug: $caso_slug})
         ON CREATE SET
           p.id = $id,
           p.slug = $slug,
           p.role = $role,
           p.description = $description_en,
           p.description_es = $description_es,
           p.source_url = $source_url,
           p.submitted_by = $submitted_by,
           p.confidence_tier = 'bronze',
           p.created_at = $now
         ON MATCH SET
           p.role = $role,
           p.description = $description_en,
           p.description_es = $description_es,
           p.source_url = $source_url,
           p.updated_at = $now`,
        {
          name: p.name,
          caso_slug: CASO_SLUG,
          id: `fp-${slugify(p.name)}`,
          slug: slugify(p.name),
          role: p.role,
          description_en: p.description_en,
          description_es: p.description_es,
          source_url: p.source_url,
          submitted_by: SOURCE,
          now,
        },
      )
      console.log(`  + Person: ${p.name}`)
    } catch (error) {
      console.error(`  x Person ${p.name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 2. Organizations ────────────────────────────────────────────────
  console.log('\n=== Ingesting Organizations ===')
  for (const o of ORGANIZATIONS) {
    try {
      await executeWrite(
        `MERGE (o:Organization {name: $name, caso_slug: $caso_slug})
         ON CREATE SET
           o.id = $id,
           o.slug = $slug,
           o.org_type = $org_type,
           o.description = $description_en,
           o.description_es = $description_es,
           o.source_url = $source_url,
           o.submitted_by = $submitted_by,
           o.confidence_tier = 'bronze',
           o.created_at = $now
         ON MATCH SET
           o.org_type = $org_type,
           o.description = $description_en,
           o.description_es = $description_es,
           o.source_url = $source_url,
           o.updated_at = $now`,
        {
          name: o.name,
          caso_slug: CASO_SLUG,
          id: `fp-${slugify(o.name)}`,
          slug: slugify(o.name),
          org_type: o.org_type,
          description_en: o.description_en,
          description_es: o.description_es,
          source_url: o.source_url,
          submitted_by: SOURCE,
          now,
        },
      )
      console.log(`  + Organization: ${o.name}`)
    } catch (error) {
      console.error(`  x Organization ${o.name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 3. Events ───────────────────────────────────────────────────────
  console.log('\n=== Ingesting Events ===')
  for (const e of EVENTS) {
    try {
      await executeWrite(
        `MERGE (e:Event {id: $id, caso_slug: $caso_slug})
         ON CREATE SET
           e.title = $title,
           e.slug = $slug,
           e.date = $date,
           e.event_type = $event_type,
           e.description = $description_en,
           e.description_es = $description_es,
           e.source_url = $source_url,
           e.submitted_by = $submitted_by,
           e.confidence_tier = 'bronze',
           e.created_at = $now
         ON MATCH SET
           e.title = $title,
           e.description = $description_en,
           e.description_es = $description_es,
           e.source_url = $source_url,
           e.updated_at = $now`,
        {
          id: e.id,
          caso_slug: CASO_SLUG,
          title: e.title,
          slug: slugify(e.title),
          date: e.date,
          event_type: e.event_type,
          description_en: e.description_en,
          description_es: e.description_es,
          source_url: e.source_url,
          submitted_by: SOURCE,
          now,
        },
      )
      console.log(`  + Event: ${e.id} - ${e.title.slice(0, 60)}...`)
    } catch (error) {
      console.error(`  x Event ${e.id}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── 4. Relationships ────────────────────────────────────────────────
  console.log('\n=== Creating Relationships ===')
  for (const r of RELATIONSHIPS) {
    try {
      // First ensure the target org exists (MERGE for idempotency)
      await executeWrite(
        `MERGE (o:Organization {name: $to_name, caso_slug: $caso_slug})
         ON CREATE SET
           o.id = $org_id,
           o.slug = $org_slug,
           o.submitted_by = $submitted_by,
           o.confidence_tier = 'bronze',
           o.created_at = $now`,
        {
          to_name: r.to_name,
          caso_slug: CASO_SLUG,
          org_id: `fp-${slugify(r.to_name)}`,
          org_slug: slugify(r.to_name),
          submitted_by: SOURCE,
          now,
        },
      )

      // First ensure the source person exists (MERGE for idempotency)
      await executeWrite(
        `MERGE (p:Person {name: $from_name, caso_slug: $caso_slug})
         ON CREATE SET
           p.id = $person_id,
           p.slug = $person_slug,
           p.submitted_by = $submitted_by,
           p.confidence_tier = 'bronze',
           p.created_at = $now`,
        {
          from_name: r.from_name,
          caso_slug: CASO_SLUG,
          person_id: `fp-${slugify(r.from_name)}`,
          person_slug: slugify(r.from_name),
          submitted_by: SOURCE,
          now,
        },
      )

      // Create the relationship
      // Dynamic relationship types require APOC or separate queries per type
      const cypher = `
        MATCH (from:${r.from_label} {name: $from_name, caso_slug: $caso_slug})
        MATCH (to:${r.to_label} {name: $to_name, caso_slug: $caso_slug})
        MERGE (from)-[rel:${r.rel_type}]->(to)
        SET rel.description = $description,
            rel.source_url = $source_url,
            rel.submitted_by = $submitted_by,
            rel.created_at = coalesce(rel.created_at, $now)`

      await executeWrite(cypher, {
        from_name: r.from_name,
        to_name: r.to_name,
        caso_slug: CASO_SLUG,
        description: r.description,
        source_url: r.source_url,
        submitted_by: SOURCE,
        now,
      })
      console.log(`  + ${r.from_name} -[${r.rel_type}]-> ${r.to_name}`)
    } catch (error) {
      console.error(`  x ${r.from_name} -> ${r.to_name}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n=== Ingestion Complete ===')
  console.log(`  Persons:       ${PERSONS.length}`)
  console.log(`  Organizations: ${ORGANIZATIONS.length} + ${RELATIONSHIPS.length} relationship targets`)
  console.log(`  Events:        ${EVENTS.length}`)
  console.log(`  Relationships: ${RELATIONSHIPS.length}`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
