/**
 * Wave 11: Corporate Complicity
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Query DictaduraOrganizacion with org_type='empresa'
 *   2. For Ford, Mercedes-Benz, Acindar: create COLABORO_CON relationships to CCDs
 *   3. Search RUVTE victims with employer data → create EMPLEADO_EN relationships
 *   4. Create ENTREGO_A relationships where documented (Ford → military for union workers)
 *   5. Report corporate connections found
 *
 * No new external data. Works on existing graph structure.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-11.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 11

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

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
// Documented corporate-military collaboration relationships
// ---------------------------------------------------------------------------

interface CorporateCCDLink {
  company: string
  ccd: string
  relationType: string
  description: string
  source: string
}

const CORPORATE_CCD_LINKS: CorporateCCDLink[] = [
  // Ford Motor Argentina
  {
    company: 'Ford Motor Argentina',
    ccd: 'Fábrica Ford de General Pacheco',
    relationType: 'ALOJO_CCD_EN_FABRICA',
    description: 'Ford permitió la instalación de un centro clandestino de detención dentro de su fábrica de General Pacheco. Delegados sindicales fueron secuestrados en la planta.',
    source: 'Causa Ford — TOF San Martín 2018',
  },
  {
    company: 'Ford Motor Argentina',
    ccd: 'Campo de Mayo',
    relationType: 'ENTREGO_TRABAJADORES_A',
    description: 'Ford entregó listas de delegados sindicales a las FFAA. Los trabajadores fueron trasladados a Campo de Mayo.',
    source: 'Sentencia Causa Ford 2018',
  },

  // Mercedes-Benz Argentina
  {
    company: 'Mercedes-Benz Argentina',
    ccd: 'Campo de Mayo',
    relationType: 'COLABORO_CON_INFORMACION',
    description: 'Mercedes-Benz suministró listas de trabajadores al Ejército. 14 obreros de la planta de González Catán desaparecieron.',
    source: 'Investigación fiscal Mercedes-Benz / Gaby Weber',
  },
  {
    company: 'Mercedes-Benz Argentina',
    ccd: 'El Vesubio',
    relationType: 'ENTREGO_TRABAJADORES_A',
    description: 'Trabajadores de Mercedes-Benz fueron trasladados al CCD El Vesubio.',
    source: 'Testimonio en juicios de lesa humanidad',
  },

  // Acindar
  {
    company: 'Acindar',
    ccd: 'Fábrica Militar de Villa Constitución',
    relationType: 'FACILITO_REPRESION',
    description: 'Acindar facilitó la represión al sindicato metalúrgico de Villa Constitución (Villazo). Martínez de Hoz fue presidente de Acindar antes de ser Ministro de Economía.',
    source: 'Operativo Villa Constitución 1975 / Causa Acindar',
  },

  // Ledesma
  {
    company: 'Ledesma SAAI',
    ccd: 'Guerrero',
    relationType: 'FACILITO_OPERATIVO',
    description: 'Ledesma facilitó camiones y el apagón (Noche del Apagón, 27/07/1976) para el secuestro masivo de trabajadores y estudiantes en Libertador General San Martín, Jujuy.',
    source: 'Causa Ledesma / RUVTE Jujuy',
  },

  // Ingenio La Fronterita
  {
    company: 'Ingenio La Fronterita',
    ccd: 'Arsenal Miguel de Azcuénaga',
    relationType: 'ENTREGO_TRABAJADORES_A',
    description: 'Trabajadores del ingenio La Fronterita fueron secuestrados y trasladados al arsenal de Azcuénaga en Tucumán.',
    source: 'Causa Operativo Independencia / RUVTE Tucumán',
  },

  // Techint
  {
    company: 'Techint',
    ccd: 'ESMA',
    relationType: 'BENEFICIARIO_REPRESION',
    description: 'Techint se benefició de la represión a la actividad sindical. Trabajadores de sus contratistas fueron desaparecidos.',
    source: 'Investigación Responsabilidad Empresarial CELS',
  },

  // Loma Negra
  {
    company: 'Loma Negra',
    ccd: 'Base Naval Mar del Plata',
    relationType: 'BENEFICIARIO_REPRESION',
    description: 'Amalia Lacroze de Fortabat (dueña de Loma Negra) tuvo vínculos con el régimen. Trabajadores de la cantera de Olavarría fueron secuestrados.',
    source: 'RUVTE Buenos Aires / Investigación CELS',
  },
]

// Documented handover cases: company → military
interface HandoverCase {
  company: string
  victimPattern: string // pattern to match victim names or employer data
  militaryUnit: string
  description: string
}

const HANDOVER_CASES: HandoverCase[] = [
  {
    company: 'Ford Motor Argentina',
    victimPattern: 'Ford',
    militaryUnit: 'Campo de Mayo',
    description: 'Ford entregó delegados sindicales al Ejército mediante listas proporcionadas por la empresa.',
  },
  {
    company: 'Mercedes-Benz Argentina',
    victimPattern: 'Mercedes',
    militaryUnit: 'Campo de Mayo',
    description: 'Mercedes-Benz colaboró con la identificación de activistas sindicales para su posterior secuestro.',
  },
  {
    company: 'Acindar',
    victimPattern: 'Acindar',
    militaryUnit: 'II Cuerpo de Ejército',
    description: 'Acindar participó en la represión al sindicato metalúrgico de Villa Constitución.',
  },
  {
    company: 'Ledesma SAAI',
    victimPattern: 'Ledesma',
    militaryUnit: 'V Cuerpo de Ejército',
    description: 'Ledesma proporcionó logística para la Noche del Apagón.',
  },
]

// ---------------------------------------------------------------------------
// Phase 1: Query existing corporate nodes
// ---------------------------------------------------------------------------

async function queryExistingCorporateNodes(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (o:DictaduraOrganizacion)
       WHERE o.caso_slug = $casoSlug
         AND (o.org_type = 'empresa' OR o.org_type = 'company' OR o.tipo = 'empresa')
       RETURN o.name AS name, o.org_type AS orgType, o.slug AS slug
       ORDER BY o.name`,
      { casoSlug: CASO_SLUG },
    )

    console.log('  Existing corporate nodes:')
    for (const r of result.records) {
      console.log(`    - ${r.get('name')} (${r.get('orgType') || 'empresa'})`)
    }

    return result.records.length
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Ensure corporate nodes exist, create COLABORO_CON relationships
// ---------------------------------------------------------------------------

async function createCorporateCCDRelationships(): Promise<{ created: number; companiesEnsured: number }> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0
  const companiesEnsured = new Set<string>()

  try {
    for (const link of CORPORATE_CCD_LINKS) {
      // Ensure company node exists
      await session.run(
        `MERGE (o:DictaduraOrganizacion {name: $name, caso_slug: $casoSlug})
         ON CREATE SET
           o.slug = $slug,
           o.org_type = 'empresa',
           o.confidence_tier = 'bronze',
           o.ingestion_wave = $wave,
           o.source = 'corporate-complicity-analysis',
           o.created_at = datetime(),
           o.updated_at = datetime()`,
        { name: link.company, casoSlug: CASO_SLUG, slug: slugify(link.company), wave: WAVE },
      )
      companiesEnsured.add(link.company)

      // Try to find matching CCD node
      const ccdMatch = await session.run(
        `MATCH (c:DictaduraCCD)
         WHERE c.caso_slug = $casoSlug
           AND (c.name CONTAINS $ccdName OR $ccdName CONTAINS c.name
                OR c.slug CONTAINS $ccdSlug)
         RETURN elementId(c) AS cid, c.name AS ccdName
         LIMIT 1`,
        { casoSlug: CASO_SLUG, ccdName: link.ccd, ccdSlug: slugify(link.ccd) },
      )

      if (ccdMatch.records.length > 0) {
        const cid = ccdMatch.records[0].get('cid') as string
        const ccdName = ccdMatch.records[0].get('ccdName') as string

        await session.run(
          `MATCH (o:DictaduraOrganizacion {name: $companyName, caso_slug: $casoSlug})
           MATCH (c) WHERE elementId(c) = $cid
           MERGE (o)-[r:COLABORO_CON]->(c)
           ON CREATE SET
             r.tipo = $relationType,
             r.description = $description,
             r.source = $source,
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          {
            companyName: link.company,
            casoSlug: CASO_SLUG,
            cid,
            relationType: link.relationType,
            description: link.description,
            source: link.source,
            wave: WAVE,
          },
        )
        console.log(`  COLABORO_CON: ${link.company} → ${ccdName} [${link.relationType}]`)
        created++
      } else {
        // CCD not found — create it as a placeholder
        await session.run(
          `MERGE (c:DictaduraCCD {name: $name, caso_slug: $casoSlug})
           ON CREATE SET
             c.slug = $slug,
             c.confidence_tier = 'bronze',
             c.ingestion_wave = $wave,
             c.source = 'corporate-complicity-analysis',
             c.created_at = datetime(),
             c.updated_at = datetime()
           WITH c
           MATCH (o:DictaduraOrganizacion {name: $companyName, caso_slug: $casoSlug})
           MERGE (o)-[r:COLABORO_CON]->(c)
           ON CREATE SET
             r.tipo = $relationType,
             r.description = $description,
             r.source = $source,
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          {
            name: link.ccd,
            casoSlug: CASO_SLUG,
            slug: slugify(link.ccd),
            wave: WAVE,
            companyName: link.company,
            relationType: link.relationType,
            description: link.description,
            source: link.source,
          },
        )
        console.log(`  COLABORO_CON: ${link.company} → ${link.ccd} [${link.relationType}] (CCD created)`)
        created++
      }
    }

    return { created, companiesEnsured: companiesEnsured.size }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: EMPLEADO_EN — match victims to employers
// ---------------------------------------------------------------------------

async function createEmpleadoEnRelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    // Find victims with employer data
    const victims = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.employer IS NOT NULL OR p.empleador IS NOT NULL
              OR p.lugar_trabajo IS NOT NULL OR p.occupation CONTAINS 'obrero'
              OR p.occupation CONTAINS 'empleado')
       RETURN elementId(p) AS pid, p.name AS name,
              coalesce(p.employer, p.empleador, p.lugar_trabajo) AS employer,
              p.occupation AS occupation`,
      { casoSlug: CASO_SLUG },
    )

    for (const rec of victims.records) {
      const pid = rec.get('pid') as string
      const name = rec.get('name') as string
      const employer = rec.get('employer') as string | null

      if (!employer) continue

      // Try to match employer to existing DictaduraOrganizacion
      const orgMatch = await session.run(
        `MATCH (o:DictaduraOrganizacion)
         WHERE o.caso_slug = $casoSlug
           AND (o.name CONTAINS $employer OR $employer CONTAINS o.name
                OR o.slug CONTAINS $employerSlug)
         RETURN elementId(o) AS oid, o.name AS orgName
         LIMIT 1`,
        { casoSlug: CASO_SLUG, employer, employerSlug: slugify(employer) },
      )

      if (orgMatch.records.length > 0) {
        const oid = orgMatch.records[0].get('oid') as string
        const orgName = orgMatch.records[0].get('orgName') as string

        await session.run(
          `MATCH (p) WHERE elementId(p) = $pid
           MATCH (o) WHERE elementId(o) = $oid
           MERGE (p)-[r:EMPLEADO_EN]->(o)
           ON CREATE SET
             r.source = 'corporate-complicity-analysis',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { pid, oid, wave: WAVE, casoSlug: CASO_SLUG },
        )
        console.log(`  EMPLEADO_EN: ${name} → ${orgName}`)
        created++
      }
    }

    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: ENTREGO_A — documented handover cases
// ---------------------------------------------------------------------------

async function createEntregoARelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const hc of HANDOVER_CASES) {
      // Find victims linked to the company (via employer match or CCD)
      const result = await session.run(
        `MATCH (o:DictaduraOrganizacion)
         WHERE o.caso_slug = $casoSlug
           AND (o.name CONTAINS $companyName OR o.name = $companyName)
         MATCH (u:DictaduraUnidadMilitar)
         WHERE u.caso_slug = $casoSlug
           AND (u.name CONTAINS $militaryUnit OR u.name = $militaryUnit)
         MERGE (o)-[r:ENTREGO_A]->(u)
         ON CREATE SET
           r.description = $description,
           r.source = 'corporate-complicity-analysis',
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN o.name AS company, u.name AS unit`,
        {
          casoSlug: CASO_SLUG,
          companyName: hc.company,
          militaryUnit: hc.militaryUnit,
          description: hc.description,
          wave: WAVE,
        },
      )

      for (const rec of result.records) {
        console.log(`  ENTREGO_A: ${rec.get('company')} → ${rec.get('unit')}`)
        created++
      }
    }

    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  process.env.NEO4J_QUERY_TIMEOUT_MS = '120000'

  const ok = await verifyConnectivity()
  if (!ok) {
    console.error('Cannot connect to Neo4j')
    process.exit(1)
  }
  console.log('Connected to Neo4j\n')
  console.log('=== Wave 11: Corporate Complicity ===\n')

  // Phase 1: Query existing corporate nodes
  console.log('--- Phase 1: Existing Corporate Nodes ---')
  const existingCount = await queryExistingCorporateNodes()
  console.log(`  Found ${existingCount} existing corporate nodes\n`)

  // Phase 2: Create COLABORO_CON relationships
  console.log('--- Phase 2: Corporate-CCD Collaboration (COLABORO_CON) ---')
  const { created: colaboroCreated, companiesEnsured } = await createCorporateCCDRelationships()
  console.log(`  ${companiesEnsured} companies ensured, ${colaboroCreated} COLABORO_CON relationships\n`)

  // Phase 3: EMPLEADO_EN
  console.log('--- Phase 3: Victim Employment Links (EMPLEADO_EN) ---')
  const empleadoCreated = await createEmpleadoEnRelationships()
  console.log(`  ${empleadoCreated} EMPLEADO_EN relationships created\n`)

  // Phase 4: ENTREGO_A
  console.log('--- Phase 4: Documented Handovers (ENTREGO_A) ---')
  const entregoCreated = await createEntregoARelationships()
  console.log(`  ${entregoCreated} ENTREGO_A relationships created\n`)

  // Final summary
  console.log('=== Wave 11 Summary ===')
  console.log(`  Companies in graph:            ${companiesEnsured + existingCount}`)
  console.log(`  COLABORO_CON relationships:    ${colaboroCreated}`)
  console.log(`  EMPLEADO_EN relationships:     ${empleadoCreated}`)
  console.log(`  ENTREGO_A relationships:       ${entregoCreated}`)
  console.log(`  Total new relationships:       ${colaboroCreated + empleadoCreated + entregoCreated}`)

  // Corporate network summary
  const driver = getDriver()
  const session = driver.session()
  try {
    const network = await session.run(
      `MATCH (o:DictaduraOrganizacion)
       WHERE o.caso_slug = $casoSlug
         AND (o.org_type = 'empresa' OR o.org_type = 'company' OR o.tipo = 'empresa')
       OPTIONAL MATCH (o)-[r]-(other)
       WHERE other.caso_slug = $casoSlug
       RETURN o.name AS company, count(r) AS connections
       ORDER BY connections DESC`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n  Corporate Network Density:')
    for (const r of network.records) {
      const conn = toNumber(r.get('connections'))
      console.log(`    ${(r.get('company') as string).padEnd(35)} ${conn} connections`)
    }
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\nWave 11 complete!')
}

main().catch((err) => {
  console.error('Wave 11 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
