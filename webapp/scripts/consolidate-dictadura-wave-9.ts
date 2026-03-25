/**
 * Wave 9: Chain of Command Reconstruction
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Query all DictaduraUnidadMilitar nodes
 *   2. Create DEPENDIA_DE hierarchy (GT 3.3.2 → ESMA → Armada, etc.)
 *   3. Ensure represors have PERTENECE_A to their unit, unit has DEPENDIA_DE to parent
 *   4. Add missing zone assignments (I Cuerpo → zona 1, III Cuerpo → zona 3, etc.)
 *   5. Report chain-of-command completeness
 *
 * No new external data. Works on existing graph structure.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-9.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 9

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Chain of command definitions
// ---------------------------------------------------------------------------

interface HierarchyLink {
  child: string      // name or slug pattern to match
  parent: string     // name or slug pattern to match
  childForce: string // force of the child unit
}

// These are historically documented subordination chains
const HIERARCHY: HierarchyLink[] = [
  // Armada (Navy) hierarchy
  { child: 'GT 3.3.2', parent: 'ESMA', childForce: 'Armada' },
  { child: 'GT 3.3', parent: 'ESMA', childForce: 'Armada' },
  { child: 'ESMA', parent: 'Armada Argentina', childForce: 'Armada' },
  { child: 'Prefectura Naval', parent: 'Armada Argentina', childForce: 'Armada' },
  { child: 'Base Naval Mar del Plata', parent: 'Armada Argentina', childForce: 'Armada' },

  // Ejército (Army) hierarchy
  { child: 'Batallón de Inteligencia 601', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'Batallón 601', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'I Cuerpo de Ejército', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'II Cuerpo de Ejército', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'III Cuerpo de Ejército', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'IV Cuerpo de Ejército', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'V Cuerpo de Ejército', parent: 'Ejército Argentino', childForce: 'Ejército' },
  { child: 'Campo de Mayo', parent: 'I Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'Regimiento de Infantería 3', parent: 'I Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'Destacamento 101', parent: 'I Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'Destacamento 121', parent: 'II Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'Destacamento 141', parent: 'III Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'La Perla', parent: 'III Cuerpo de Ejército', childForce: 'Ejército' },
  { child: 'Regimiento de Infantería de Monte 29', parent: 'V Cuerpo de Ejército', childForce: 'Ejército' },

  // Fuerza Aérea (Air Force) hierarchy
  { child: 'Mansión Seré', parent: 'Fuerza Aérea Argentina', childForce: 'Fuerza Aérea' },

  // Policía hierarchy
  { child: 'Policía Federal Argentina', parent: 'Ministerio del Interior', childForce: 'Policía' },
  { child: 'Superintendencia de Seguridad Federal', parent: 'Policía Federal Argentina', childForce: 'Policía' },
  { child: 'Coordinación Federal', parent: 'Policía Federal Argentina', childForce: 'Policía' },
  { child: 'Policía de la Provincia de Buenos Aires', parent: 'Gobierno de la Provincia de Buenos Aires', childForce: 'Policía' },
  { child: 'Servicio de Informaciones de Rosario', parent: 'Policía de Santa Fe', childForce: 'Policía' },

  // Intelligence
  { child: 'SIDE', parent: 'Presidencia de la Nación', childForce: 'Inteligencia' },
  { child: 'SIE', parent: 'Ejército Argentino', childForce: 'Inteligencia' },
  { child: 'SIN', parent: 'Armada Argentina', childForce: 'Inteligencia' },
]

// Zone assignments per military doctrine
const ZONE_ASSIGNMENTS: Array<{ unit: string; zone: number; subzone?: string }> = [
  { unit: 'I Cuerpo de Ejército', zone: 1, subzone: 'Capital Federal y Gran Buenos Aires' },
  { unit: 'II Cuerpo de Ejército', zone: 2, subzone: 'Santa Fe, Entre Ríos, Corrientes, Misiones, Chaco, Formosa' },
  { unit: 'III Cuerpo de Ejército', zone: 3, subzone: 'Córdoba, Mendoza, San Luis, San Juan, La Rioja, Catamarca, Santiago del Estero, Tucumán, Salta, Jujuy' },
  { unit: 'IV Cuerpo de Ejército', zone: 4, subzone: 'Noreste' },
  { unit: 'V Cuerpo de Ejército', zone: 5, subzone: 'Bahía Blanca, Patagonia' },
]

// ---------------------------------------------------------------------------
// Phase 1: Ensure all hierarchy units exist
// ---------------------------------------------------------------------------

async function ensureHierarchyUnitsExist(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    // Collect all unique unit names from hierarchy
    const unitNames = new Set<string>()
    for (const link of HIERARCHY) {
      unitNames.add(link.child)
      unitNames.add(link.parent)
    }

    for (const name of unitNames) {
      const result = await session.run(
        `MERGE (u:DictaduraUnidadMilitar {name: $name, caso_slug: $casoSlug})
         ON CREATE SET
           u.slug = $slug,
           u.confidence_tier = 'bronze',
           u.ingestion_wave = $wave,
           u.source = 'chain-of-command-reconstruction',
           u.created_at = datetime(),
           u.updated_at = datetime()
         RETURN u.created_at = u.updated_at AS isNew`,
        { name, casoSlug: CASO_SLUG, slug: slugify(name), wave: WAVE },
      )
      if (result.records[0]?.get('isNew')) created++
    }

    return created
  } finally {
    await session.close()
  }
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
// Phase 2: Create DEPENDIA_DE hierarchy relationships
// ---------------------------------------------------------------------------

async function createHierarchyRelationships(): Promise<{ created: number; existing: number }> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0
  let existing = 0

  try {
    for (const link of HIERARCHY) {
      // Use fuzzy matching on name — contains matching for flexibility
      const result = await session.run(
        `MATCH (child:DictaduraUnidadMilitar)
         WHERE child.caso_slug = $casoSlug
           AND (child.name = $childName OR child.name CONTAINS $childName OR $childName CONTAINS child.name)
         MATCH (parent:DictaduraUnidadMilitar)
         WHERE parent.caso_slug = $casoSlug
           AND (parent.name = $parentName OR parent.name CONTAINS $parentName OR $parentName CONTAINS parent.name)
           AND parent <> child
         MERGE (child)-[r:DEPENDIA_DE]->(parent)
         ON CREATE SET
           r.source = 'chain-of-command-reconstruction',
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN
           child.name AS childName,
           parent.name AS parentName,
           r.created_at = datetime() AS isNew`,
        { childName: link.child, parentName: link.parent, casoSlug: CASO_SLUG, wave: WAVE },
      )

      for (const rec of result.records) {
        console.log(`  ${rec.get('childName')} → DEPENDIA_DE → ${rec.get('parentName')}`)
        created++
      }
      if (result.records.length === 0) {
        existing++
      }
    }

    return { created, existing }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 3: Ensure represors have PERTENECE_A to their unit
// ---------------------------------------------------------------------------

async function linkRepresorsToUnits(): Promise<{ linked: number; alreadyLinked: number; unmatched: number }> {
  const driver = getDriver()
  const session = driver.session()
  let linked = 0
  let alreadyLinked = 0
  let unmatched = 0

  try {
    // Find represors with unit_name or military_unit property but no PERTENECE_A rel
    const represors = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.role IN ['represor', 'militar', 'policia', 'inteligencia', 'gendarme']
         AND (p.military_unit IS NOT NULL OR p.unit_name IS NOT NULL OR p.fuerza IS NOT NULL)
       OPTIONAL MATCH (p)-[existing:PERTENECE_A]->(:DictaduraUnidadMilitar)
       WITH p, existing
       WHERE existing IS NULL
       RETURN elementId(p) AS pid, p.name AS name,
              coalesce(p.military_unit, p.unit_name) AS unitName,
              p.fuerza AS fuerza`,
      { casoSlug: CASO_SLUG },
    )

    for (const rec of represors.records) {
      const pid = rec.get('pid') as string
      const name = rec.get('name') as string
      const unitName = rec.get('unitName') as string | null
      const fuerza = rec.get('fuerza') as string | null

      if (!unitName && !fuerza) {
        unmatched++
        continue
      }

      const searchTerm = unitName || fuerza || ''

      const matchResult = await session.run(
        `MATCH (p) WHERE elementId(p) = $pid
         MATCH (u:DictaduraUnidadMilitar)
         WHERE u.caso_slug = $casoSlug
           AND (u.name CONTAINS $searchTerm OR $searchTerm CONTAINS u.name OR u.slug CONTAINS $slugTerm)
         WITH p, u
         LIMIT 1
         MERGE (p)-[r:PERTENECE_A]->(u)
         ON CREATE SET
           r.source = 'chain-of-command-reconstruction',
           r.ingestion_wave = $wave,
           r.caso_slug = $casoSlug,
           r.created_at = datetime()
         RETURN u.name AS unitName`,
        { pid, searchTerm, slugTerm: slugify(searchTerm), casoSlug: CASO_SLUG, wave: WAVE },
      )

      if (matchResult.records.length > 0) {
        console.log(`  ${name} → PERTENECE_A → ${matchResult.records[0].get('unitName')}`)
        linked++
      } else {
        unmatched++
      }
    }

    // Count already linked
    const existingResult = await session.run(
      `MATCH (p:DictaduraPersona)-[:PERTENECE_A]->(:DictaduraUnidadMilitar)
       WHERE p.caso_slug = $casoSlug
       RETURN count(p) AS count`,
      { casoSlug: CASO_SLUG },
    )
    alreadyLinked = toNumber(existingResult.records[0]?.get('count'))

    return { linked, alreadyLinked, unmatched }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Zone assignments
// ---------------------------------------------------------------------------

async function assignZones(): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let assigned = 0

  try {
    for (const za of ZONE_ASSIGNMENTS) {
      const result = await session.run(
        `MATCH (u:DictaduraUnidadMilitar)
         WHERE u.caso_slug = $casoSlug
           AND (u.name = $unitName OR u.name CONTAINS $unitName)
         SET u.zona_represiva = $zone,
             u.zona_subzone = $subzone,
             u.updated_at = datetime()
         RETURN u.name AS name`,
        { casoSlug: CASO_SLUG, unitName: za.unit, zone: za.zone, subzone: za.subzone || '' },
      )

      for (const rec of result.records) {
        console.log(`  ${rec.get('name')} → zona ${za.zone}`)
        assigned++
      }
    }

    return assigned
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Phase 5: Completeness report
// ---------------------------------------------------------------------------

async function reportCompleteness(): Promise<void> {
  const driver = getDriver()
  const session = driver.session()

  try {
    // Total units
    const unitsResult = await session.run(
      `MATCH (u:DictaduraUnidadMilitar) WHERE u.caso_slug = $casoSlug
       RETURN count(u) AS total`,
      { casoSlug: CASO_SLUG },
    )
    const totalUnits = toNumber(unitsResult.records[0]?.get('total'))

    // Units with DEPENDIA_DE
    const withHierarchy = await session.run(
      `MATCH (u:DictaduraUnidadMilitar)-[:DEPENDIA_DE]->()
       WHERE u.caso_slug = $casoSlug
       RETURN count(DISTINCT u) AS count`,
      { casoSlug: CASO_SLUG },
    )
    const unitsWithHierarchy = toNumber(withHierarchy.records[0]?.get('count'))

    // Units without DEPENDIA_DE (root or orphan)
    const withoutHierarchy = await session.run(
      `MATCH (u:DictaduraUnidadMilitar)
       WHERE u.caso_slug = $casoSlug
       AND NOT (u)-[:DEPENDIA_DE]->()
       RETURN u.name AS name`,
      { casoSlug: CASO_SLUG },
    )

    // Represors with PERTENECE_A
    const represorsLinked = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.role IN ['represor', 'militar', 'policia', 'inteligencia', 'gendarme']
       OPTIONAL MATCH (p)-[:PERTENECE_A]->(u:DictaduraUnidadMilitar)
       RETURN count(p) AS total, count(u) AS linked`,
      { casoSlug: CASO_SLUG },
    )
    const totalRepresors = toNumber(represorsLinked.records[0]?.get('total'))
    const linkedRepresors = toNumber(represorsLinked.records[0]?.get('linked'))

    // Chain depth
    const depthResult = await session.run(
      `MATCH path = (u:DictaduraUnidadMilitar)-[:DEPENDIA_DE*]->(top)
       WHERE u.caso_slug = $casoSlug AND NOT (top)-[:DEPENDIA_DE]->()
       RETURN max(length(path)) AS maxDepth`,
      { casoSlug: CASO_SLUG },
    )
    const maxDepth = toNumber(depthResult.records[0]?.get('maxDepth'))

    console.log('\n=== Chain of Command Completeness ===')
    console.log(`  Total military units:           ${totalUnits}`)
    console.log(`  Units with hierarchy (DEPENDIA_DE): ${unitsWithHierarchy}`)
    console.log(`  Root/orphan units:              ${withoutHierarchy.records.length}`)
    if (withoutHierarchy.records.length > 0) {
      for (const r of withoutHierarchy.records) {
        console.log(`    - ${r.get('name')}`)
      }
    }
    console.log(`  Max chain depth:                ${maxDepth}`)
    console.log(`  Represors total:                ${totalRepresors}`)
    console.log(`  Represors linked to unit:       ${linkedRepresors}`)
    console.log(`  Represors unlinked:             ${totalRepresors - linkedRepresors}`)
    const pct = totalRepresors > 0 ? ((linkedRepresors / totalRepresors) * 100).toFixed(1) : '0'
    console.log(`  Link coverage:                  ${pct}%`)
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
  console.log('=== Wave 9: Chain of Command Reconstruction ===\n')

  // Phase 1: Ensure hierarchy units exist
  console.log('--- Phase 1: Ensuring Hierarchy Units Exist ---')
  const unitsCreated = await ensureHierarchyUnitsExist()
  console.log(`  Created ${unitsCreated} new unit nodes\n`)

  // Phase 2: Create DEPENDIA_DE relationships
  console.log('--- Phase 2: Creating DEPENDIA_DE Hierarchy ---')
  const { created: hierCreated, existing: hierExisting } = await createHierarchyRelationships()
  console.log(`  Created ${hierCreated} DEPENDIA_DE relationships (${hierExisting} already existed)\n`)

  // Phase 3: Link represors to units
  console.log('--- Phase 3: Linking Represors to Units (PERTENECE_A) ---')
  const { linked, alreadyLinked, unmatched } = await linkRepresorsToUnits()
  console.log(`  Newly linked: ${linked}, already linked: ${alreadyLinked}, unmatched: ${unmatched}\n`)

  // Phase 4: Zone assignments
  console.log('--- Phase 4: Zone Assignments ---')
  const zonesAssigned = await assignZones()
  console.log(`  Assigned ${zonesAssigned} zone designations\n`)

  // Phase 5: Completeness report
  console.log('--- Phase 5: Completeness Report ---')
  await reportCompleteness()

  await closeDriver()
  console.log('\nWave 9 complete!')
}

main().catch((err) => {
  console.error('Wave 9 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
