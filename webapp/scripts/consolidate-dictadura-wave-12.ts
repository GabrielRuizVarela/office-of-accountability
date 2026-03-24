/**
 * Wave 12: Plan Cóndor Deep Dive
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Query all cross-border victims (nationality != 'Argentine' or transferred_to IS NOT NULL)
 *   2. Map intelligence flows between agencies: CIA↔SIDE, DINA↔SIDE, SIE↔SIDE, OCOA↔SIDE
 *   3. Create COMPARTIO_INTELIGENCIA relationships
 *   4. Ensure all Cóndor victims link to Causa Plan Cóndor
 *   5. Report transnational network stats
 *
 * No new external data. Works on existing graph structure.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-12.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 12

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
// Intelligence agency definitions
// ---------------------------------------------------------------------------

interface IntelAgency {
  name: string
  country: string
  fullName: string
}

const INTEL_AGENCIES: IntelAgency[] = [
  { name: 'SIDE', country: 'Argentina', fullName: 'Secretaría de Inteligencia del Estado' },
  { name: 'SIE', country: 'Argentina', fullName: 'Servicio de Inteligencia del Ejército' },
  { name: 'SIN', country: 'Argentina', fullName: 'Servicio de Inteligencia Naval' },
  { name: 'CIA', country: 'Estados Unidos', fullName: 'Central Intelligence Agency' },
  { name: 'DINA', country: 'Chile', fullName: 'Dirección de Inteligencia Nacional' },
  { name: 'CNI', country: 'Chile', fullName: 'Central Nacional de Informaciones' },
  { name: 'OCOA', country: 'Uruguay', fullName: 'Organismo Coordinador de Operaciones Antisubversivas' },
  { name: 'SID', country: 'Uruguay', fullName: 'Servicio de Información de Defensa' },
  { name: 'ESID', country: 'Uruguay', fullName: 'Servicio de Información del Estado' },
  { name: 'SNI', country: 'Brasil', fullName: 'Serviço Nacional de Informações' },
  { name: 'DOI-CODI', country: 'Brasil', fullName: 'Destacamento de Operações de Informação — Centro de Operações de Defesa Interna' },
  { name: 'SIE Bolivia', country: 'Bolivia', fullName: 'Servicio de Inteligencia del Ejército de Bolivia' },
  { name: 'DINT', country: 'Paraguay', fullName: 'Dirección Nacional de Inteligencia' },
  { name: 'La Técnica', country: 'Paraguay', fullName: 'Departamento de Investigaciones de la Policía de Asunción' },
]

// Documented intelligence-sharing relationships (Plan Cóndor network)
interface IntelFlow {
  from: string
  to: string
  nature: string
  description: string
  source: string
}

const INTEL_FLOWS: IntelFlow[] = [
  // CIA coordination
  {
    from: 'CIA', to: 'SIDE',
    nature: 'coordinacion_estrategica',
    description: 'La CIA coordinó con SIDE la implementación de la Operación Cóndor. Documentos desclasificados muestran comunicaciones regulares.',
    source: 'National Security Archive — Documentos desclasificados',
  },
  {
    from: 'CIA', to: 'DINA',
    nature: 'coordinacion_estrategica',
    description: 'La CIA mantuvo contacto con DINA y Manuel Contreras. Documentos muestran conocimiento de operaciones transnacionales.',
    source: 'National Security Archive — Documentos Chile',
  },

  // Argentina-Chile axis
  {
    from: 'DINA', to: 'SIDE',
    nature: 'intercambio_prisioneros',
    description: 'DINA y SIDE intercambiaron prisioneros políticos y listas de personas buscadas. Coordinaron operaciones en Buenos Aires y Santiago.',
    source: 'Causa Plan Cóndor / Archivos del Terror Paraguay',
  },
  {
    from: 'CNI', to: 'SIDE',
    nature: 'intercambio_informacion',
    description: 'Tras la disolución de DINA, CNI continuó la coordinación con SIDE.',
    source: 'Causa Plan Cóndor',
  },

  // Argentina-Uruguay axis
  {
    from: 'OCOA', to: 'SIDE',
    nature: 'operaciones_conjuntas',
    description: 'OCOA y SIDE coordinaron operaciones en Buenos Aires contra exiliados uruguayos. Automotores Orletti sirvió como centro binacional.',
    source: 'Causa Automotores Orletti / Causa Plan Cóndor Uruguay',
  },
  {
    from: 'SID', to: 'SIE',
    nature: 'intercambio_informacion',
    description: 'SID uruguayo intercambió información con SIE argentino sobre activistas políticos.',
    source: 'Archivos del Terror / Causa Plan Cóndor',
  },

  // Argentina-Brazil axis
  {
    from: 'SNI', to: 'SIDE',
    nature: 'intercambio_informacion',
    description: 'SNI brasileño compartió información con SIDE sobre exiliados argentinos en Brasil.',
    source: 'Archivos Brasil / Comissão Nacional da Verdade',
  },
  {
    from: 'DOI-CODI', to: 'SIE',
    nature: 'coordinacion_operativa',
    description: 'DOI-CODI y SIE coordinaron vigilancia de exiliados en la triple frontera.',
    source: 'Comissão Nacional da Verdade Brasil',
  },

  // Argentina-Paraguay axis
  {
    from: 'DINT', to: 'SIDE',
    nature: 'intercambio_informacion',
    description: 'DINT paraguayo colaboró con SIDE. Los Archivos del Terror paraguayos documentan esta colaboración.',
    source: 'Archivos del Terror de Paraguay (descubiertos 1992)',
  },
  {
    from: 'La Técnica', to: 'SIE',
    nature: 'intercambio_prisioneros',
    description: 'La Técnica (policía de Stroessner) coordinó con inteligencia argentina la detención y traslado de prisioneros.',
    source: 'Archivos del Terror / Causa Plan Cóndor',
  },

  // Argentina-Bolivia axis
  {
    from: 'SIE Bolivia', to: 'SIE',
    nature: 'coordinacion_operativa',
    description: 'Inteligencia boliviana coordinó con SIE argentino durante la dictadura de Banzer y sucesores.',
    source: 'Causa Plan Cóndor / Informe CIDH Bolivia',
  },

  // Internal Argentine coordination
  {
    from: 'SIE', to: 'SIDE',
    nature: 'coordinacion_interna',
    description: 'SIE del Ejército coordinó operaciones con SIDE, la agencia civil de inteligencia.',
    source: 'Estructura represiva documentada en Juicio a las Juntas',
  },
  {
    from: 'SIN', to: 'SIDE',
    nature: 'coordinacion_interna',
    description: 'SIN de la Armada compartió inteligencia con SIDE sobre operaciones navales (ESMA, etc.).',
    source: 'Causa ESMA / Juicio a las Juntas',
  },
]

// ---------------------------------------------------------------------------
// Phase 1: Query cross-border victims
// ---------------------------------------------------------------------------

interface CrossBorderVictim {
  id: string
  name: string
  nationality: string | null
  transferredTo: string | null
  country: string | null
}

async function queryCrossBorderVictims(): Promise<CrossBorderVictim[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (
           (p.nationality IS NOT NULL AND p.nationality <> 'Argentine' AND p.nationality <> 'Argentina' AND p.nationality <> 'argentina')
           OR p.transferred_to IS NOT NULL
           OR p.pais_origen IS NOT NULL AND p.pais_origen <> 'Argentina'
           OR p.nacionalidad IS NOT NULL AND p.nacionalidad <> 'Argentina' AND p.nacionalidad <> 'argentina'
           OR p.plan_condor = true
         )
       RETURN elementId(p) AS id, p.name AS name,
              coalesce(p.nationality, p.nacionalidad) AS nationality,
              p.transferred_to AS transferredTo,
              coalesce(p.pais_origen, p.country) AS country`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      nationality: r.get('nationality') as string | null,
      transferredTo: r.get('transferredTo') as string | null,
      country: r.get('country') as string | null,
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 2: Ensure intel agencies exist as nodes
// ---------------------------------------------------------------------------

async function ensureIntelAgencyNodes(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const agency of INTEL_AGENCIES) {
      const result = await session.run(
        `MERGE (o:DictaduraOrganizacion {name: $name, caso_slug: $casoSlug})
         ON CREATE SET
           o.slug = $slug,
           o.org_type = 'agencia_inteligencia',
           o.country = $country,
           o.full_name = $fullName,
           o.confidence_tier = 'silver',
           o.ingestion_wave = $wave,
           o.source = 'plan-condor-deep-dive',
           o.created_at = datetime(),
           o.updated_at = datetime()
         RETURN o.created_at = o.updated_at AS isNew`,
        {
          name: agency.name,
          casoSlug: CASO_SLUG,
          slug: slugify(agency.name),
          country: agency.country,
          fullName: agency.fullName,
          wave: WAVE,
        },
      )
      if (result.records[0]?.get('isNew')) created++
    }

    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Create COMPARTIO_INTELIGENCIA relationships
// ---------------------------------------------------------------------------

async function createIntelFlowRelationships(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const flow of INTEL_FLOWS) {
      const result = await session.run(
        `MATCH (from:DictaduraOrganizacion)
         WHERE from.caso_slug = $casoSlug
           AND (from.name = $fromName OR from.name CONTAINS $fromName)
         MATCH (to:DictaduraOrganizacion)
         WHERE to.caso_slug = $casoSlug
           AND (to.name = $toName OR to.name CONTAINS $toName)
           AND from <> to
         MERGE (from)-[r:COMPARTIO_INTELIGENCIA]->(to)
         ON CREATE SET
           r.nature = $nature,
           r.description = $description,
           r.source = $source,
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN from.name AS fromName, to.name AS toName`,
        {
          fromName: flow.from,
          toName: flow.to,
          nature: flow.nature,
          description: flow.description,
          source: flow.source,
          wave: WAVE,
          casoSlug: CASO_SLUG,
        },
      )

      for (const rec of result.records) {
        console.log(`  COMPARTIO_INTELIGENCIA: ${rec.get('fromName')} → ${rec.get('toName')} [${flow.nature}]`)
        created++
      }
    }

    return created
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Link Cóndor victims to Causa Plan Cóndor
// ---------------------------------------------------------------------------

async function linkCondorVictimsToCausa(victims: CrossBorderVictim[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0

  try {
    // Ensure Causa Plan Cóndor exists
    await session.run(
      `MERGE (c:DictaduraCausa {name: 'Causa Plan Cóndor', caso_slug: $casoSlug})
       ON CREATE SET
         c.slug = 'causa-plan-condor',
         c.description = 'Causa judicial por la coordinación represiva transnacional entre dictaduras sudamericanas (Operación Cóndor)',
         c.tribunal = 'Tribunal Oral Federal N.° 1 de Buenos Aires',
         c.confidence_tier = 'silver',
         c.ingestion_wave = $wave,
         c.source = 'plan-condor-deep-dive',
         c.created_at = datetime(),
         c.updated_at = datetime()`,
      { casoSlug: CASO_SLUG, wave: WAVE },
    )

    for (const victim of victims) {
      const result = await session.run(
        `MATCH (p) WHERE elementId(p) = $pid
         MATCH (c:DictaduraCausa {name: 'Causa Plan Cóndor', caso_slug: $casoSlug})
         MERGE (p)-[r:VICTIMA_EN_CAUSA]->(c)
         ON CREATE SET
           r.source = 'plan-condor-deep-dive',
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN p.name AS name`,
        { pid: victim.id, casoSlug: CASO_SLUG, wave: WAVE },
      )

      if (result.records.length > 0) linked++
    }

    return linked
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Transnational network report
// ---------------------------------------------------------------------------

async function reportTransnationalNetwork(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Victims by nationality
    const byNationality = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.nationality IS NOT NULL OR p.nacionalidad IS NOT NULL)
       WITH coalesce(p.nationality, p.nacionalidad) AS nat
       WHERE nat <> 'Argentina' AND nat <> 'argentina' AND nat <> 'Argentine'
       RETURN nat AS nationality, count(*) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n  Cross-border victims by nationality:')
    for (const r of byNationality.records) {
      console.log(`    ${(r.get('nationality') as string).padEnd(20)} ${toNumber(r.get('count'))}`)
    }

    // Intelligence network density
    const intelNetwork = await session.run(
      `MATCH (a:DictaduraOrganizacion)-[r:COMPARTIO_INTELIGENCIA]->(b:DictaduraOrganizacion)
       WHERE r.caso_slug = $casoSlug
       RETURN a.name AS from, b.name AS to, r.nature AS nature
       ORDER BY a.name`,
      { casoSlug: CASO_SLUG },
    )

    console.log('\n  Intelligence sharing network:')
    const countries = new Set<string>()
    for (const r of intelNetwork.records) {
      const fromAgency = INTEL_AGENCIES.find((a) => a.name === r.get('from'))
      const toAgency = INTEL_AGENCIES.find((a) => a.name === r.get('to'))
      if (fromAgency) countries.add(fromAgency.country)
      if (toAgency) countries.add(toAgency.country)
    }
    console.log(`    Countries involved: ${[...countries].join(', ')}`)
    console.log(`    Intelligence flows: ${intelNetwork.records.length}`)
    console.log(`    Agencies: ${INTEL_AGENCIES.length}`)

    // Transfer routes
    const transfers = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug AND p.transferred_to IS NOT NULL
       RETURN p.transferred_to AS destination, count(p) AS count
       ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )

    if (transfers.records.length > 0) {
      console.log('\n  Transfer destinations:')
      for (const r of transfers.records) {
        console.log(`    → ${(r.get('destination') as string).padEnd(25)} ${toNumber(r.get('count'))} victims`)
      }
    }

    // Condor CCD (Automotores Orletti)
    const orletti = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
         AND (c.name CONTAINS 'Orletti' OR c.name CONTAINS 'Automotores')
       OPTIONAL MATCH (p:DictaduraPersona)-[:DETENIDO_EN]->(c)
       RETURN c.name AS name, count(p) AS victimCount`,
      { casoSlug: CASO_SLUG },
    )

    if (orletti.records.length > 0) {
      console.log('\n  Key Cóndor detention site:')
      for (const r of orletti.records) {
        console.log(`    ${r.get('name')}: ${toNumber(r.get('victimCount'))} linked victims`)
      }
    }
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
  console.log('=== Wave 12: Plan Cóndor Deep Dive ===\n')

  // Phase 1: Query cross-border victims
  console.log('--- Phase 1: Cross-Border Victims ---')
  const victims = await queryCrossBorderVictims()
  console.log(`  Found ${victims.length} cross-border / Plan Cóndor victims`)
  for (const v of victims.slice(0, 10)) {
    const nat = v.nationality || v.country || 'unknown nationality'
    const transfer = v.transferredTo ? ` → transferred to ${v.transferredTo}` : ''
    console.log(`    - ${v.name} (${nat})${transfer}`)
  }
  if (victims.length > 10) {
    console.log(`    ... and ${victims.length - 10} more`)
  }
  console.log()

  // Phase 2: Ensure intel agency nodes
  console.log('--- Phase 2: Intelligence Agency Nodes ---')
  const agenciesCreated = await ensureIntelAgencyNodes()
  console.log(`  Ensured ${INTEL_AGENCIES.length} agencies, created ${agenciesCreated} new nodes\n`)

  // Phase 3: COMPARTIO_INTELIGENCIA relationships
  console.log('--- Phase 3: Intelligence Sharing Network (COMPARTIO_INTELIGENCIA) ---')
  const intelCreated = await createIntelFlowRelationships()
  console.log(`  Created ${intelCreated} COMPARTIO_INTELIGENCIA relationships\n`)

  // Phase 4: Link Cóndor victims to causa
  console.log('--- Phase 4: Linking Victims to Causa Plan Cóndor ---')
  const victimsLinked = await linkCondorVictimsToCausa(victims)
  console.log(`  Linked ${victimsLinked} victims to Causa Plan Cóndor\n`)

  // Phase 5: Transnational network report
  console.log('--- Phase 5: Transnational Network Report ---')
  await reportTransnationalNetwork()

  // Final summary
  console.log('\n=== Wave 12 Summary ===')
  console.log(`  Cross-border victims identified: ${victims.length}`)
  console.log(`  Intelligence agencies:           ${INTEL_AGENCIES.length}`)
  console.log(`  COMPARTIO_INTELIGENCIA flows:    ${intelCreated}`)
  console.log(`  Victims linked to Causa Cóndor:  ${victimsLinked}`)

  await closeDriver()
  console.log('\nWave 12 complete!')
}

main().catch((err) => {
  console.error('Wave 12 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
