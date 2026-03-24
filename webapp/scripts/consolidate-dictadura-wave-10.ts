/**
 * Wave 10: Geographic Intelligence
 *
 * Consolidation pass over existing caso-dictadura graph data:
 *   1. Query all DictaduraPersona with detention_location and detention_date
 *   2. Aggregate disappearances by province and year → compute temporal density
 *   3. Match detention_location strings against DictaduraCCD names → create DETENIDO_EN
 *   4. Report: provincial stats, temporal peaks, geographic clusters
 *
 * No new external data. Works on existing graph structure.
 *
 * Run with: npx tsx scripts/consolidate-dictadura-wave-10.ts
 */

import neo4j from 'neo4j-driver-lite'
import { verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const CASO_SLUG = 'caso-dictadura'
const WAVE = 10

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  if (val && typeof val === 'object' && 'low' in val) return (val as { low: number }).low
  return Number(val) || 0
}

// ---------------------------------------------------------------------------
// Province normalization mapping
// ---------------------------------------------------------------------------

const PROVINCE_ALIASES: Record<string, string> = {
  'buenos aires': 'Buenos Aires',
  'capital federal': 'Capital Federal',
  'caba': 'Capital Federal',
  'ciudad de buenos aires': 'Capital Federal',
  'ciudad autónoma de buenos aires': 'Capital Federal',
  'córdoba': 'Córdoba',
  'cordoba': 'Córdoba',
  'santa fe': 'Santa Fe',
  'tucumán': 'Tucumán',
  'tucuman': 'Tucumán',
  'mendoza': 'Mendoza',
  'entre ríos': 'Entre Ríos',
  'entre rios': 'Entre Ríos',
  'salta': 'Salta',
  'jujuy': 'Jujuy',
  'misiones': 'Misiones',
  'chaco': 'Chaco',
  'formosa': 'Formosa',
  'corrientes': 'Corrientes',
  'santiago del estero': 'Santiago del Estero',
  'san luis': 'San Luis',
  'san juan': 'San Juan',
  'catamarca': 'Catamarca',
  'la rioja': 'La Rioja',
  'la pampa': 'La Pampa',
  'neuquén': 'Neuquén',
  'neuquen': 'Neuquén',
  'río negro': 'Río Negro',
  'rio negro': 'Río Negro',
  'chubut': 'Chubut',
  'santa cruz': 'Santa Cruz',
  'tierra del fuego': 'Tierra del Fuego',
}

/** Detect province from a location string */
function extractProvince(location: string): string {
  const lower = location.toLowerCase().trim()

  // Direct alias match
  for (const [alias, province] of Object.entries(PROVINCE_ALIASES)) {
    if (lower === alias || lower.includes(alias)) {
      return province
    }
  }

  // City-to-province known mappings
  const cityMap: Record<string, string> = {
    'rosario': 'Santa Fe',
    'la plata': 'Buenos Aires',
    'mar del plata': 'Buenos Aires',
    'bahía blanca': 'Buenos Aires',
    'bahia blanca': 'Buenos Aires',
    'esma': 'Capital Federal',
    'campo de mayo': 'Buenos Aires',
    'la perla': 'Córdoba',
    'el vesubio': 'Buenos Aires',
    'el olimpo': 'Capital Federal',
    'club atlético': 'Capital Federal',
    'el banco': 'Capital Federal',
    'automotores orletti': 'Capital Federal',
    'mansión seré': 'Buenos Aires',
    'mansion sere': 'Buenos Aires',
    'garage azopardo': 'Capital Federal',
    'pozo de banfield': 'Buenos Aires',
    'pozo de quilmes': 'Buenos Aires',
    'sheraton': 'Capital Federal',
    'virrey cevallos': 'Capital Federal',
  }

  for (const [city, province] of Object.entries(cityMap)) {
    if (lower.includes(city)) return province
  }

  return 'Desconocida'
}

/** Extract year from a date string (various formats) */
function extractYear(dateStr: string): number | null {
  // Try YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-/)
  if (isoMatch) return parseInt(isoMatch[1])

  // Try DD/MM/YYYY
  const slashMatch = dateStr.match(/(\d{4})$/)
  if (slashMatch) return parseInt(slashMatch[1])

  // Try just year
  const yearMatch = dateStr.match(/\b(19[67]\d|198[0-3])\b/)
  if (yearMatch) return parseInt(yearMatch[1])

  return null
}

// ---------------------------------------------------------------------------
// Phase 1: Aggregate disappearances by province and year
// ---------------------------------------------------------------------------

interface VictimGeo {
  name: string
  location: string
  date: string | null
  province: string
  year: number | null
}

async function queryVictimsWithLocation(): Promise<VictimGeo[]> {
  const driver = getDriver()
  const session = driver.session()

  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.detention_location IS NOT NULL OR p.lugar_detencion IS NOT NULL
              OR p.lugar_secuestro IS NOT NULL OR p.location IS NOT NULL)
       RETURN p.name AS name,
              coalesce(p.detention_location, p.lugar_detencion, p.lugar_secuestro, p.location) AS location,
              coalesce(p.detention_date, p.fecha_detencion, p.fecha_secuestro, p.date) AS date`,
      { casoSlug: CASO_SLUG },
    )

    return result.records.map((r) => {
      const location = r.get('location') as string
      const dateStr = r.get('date') as string | null
      return {
        name: r.get('name') as string,
        location,
        date: dateStr,
        province: extractProvince(location),
        year: dateStr ? extractYear(dateStr) : null,
      }
    })
  } finally {
    await session.close()
  }
}

function computeStats(victims: VictimGeo[]) {
  // By province
  const byProvince = new Map<string, number>()
  for (const v of victims) {
    byProvince.set(v.province, (byProvince.get(v.province) || 0) + 1)
  }

  // By year
  const byYear = new Map<number, number>()
  for (const v of victims) {
    if (v.year) {
      byYear.set(v.year, (byYear.get(v.year) || 0) + 1)
    }
  }

  // By province-year (temporal density)
  const byProvinceYear = new Map<string, number>()
  for (const v of victims) {
    if (v.year && v.province !== 'Desconocida') {
      const key = `${v.province}|${v.year}`
      byProvinceYear.set(key, (byProvinceYear.get(key) || 0) + 1)
    }
  }

  return { byProvince, byYear, byProvinceYear }
}

// ---------------------------------------------------------------------------
// Phase 2: Match detention locations to CCD nodes → create DETENIDO_EN
// ---------------------------------------------------------------------------

async function createDetenidoEnRelationships(): Promise<{ created: number; unmatched: string[] }> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0
  const unmatchedLocations = new Set<string>()

  try {
    // Get all CCDs
    const ccds = await session.run(
      `MATCH (c:DictaduraCCD)
       WHERE c.caso_slug = $casoSlug
       RETURN c.name AS name, c.slug AS slug, elementId(c) AS cid,
              coalesce(c.aliases, []) AS aliases`,
      { casoSlug: CASO_SLUG },
    )

    // Build lookup: lowercase name/alias → CCD elementId
    const ccdLookup = new Map<string, string>()
    for (const r of ccds.records) {
      const cid = r.get('cid') as string
      const name = (r.get('name') as string).toLowerCase()
      const slug = r.get('slug') as string
      const aliases = r.get('aliases') as string[]

      ccdLookup.set(name, cid)
      if (slug) ccdLookup.set(slug, cid)
      for (const alias of aliases) {
        ccdLookup.set(alias.toLowerCase(), cid)
      }
    }

    // Find victims with detention locations
    const victims = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND (p.detention_location IS NOT NULL OR p.lugar_detencion IS NOT NULL
              OR p.lugar_secuestro IS NOT NULL OR p.ccd IS NOT NULL)
       OPTIONAL MATCH (p)-[existing:DETENIDO_EN]->(:DictaduraCCD)
       WITH p, existing
       WHERE existing IS NULL
       RETURN elementId(p) AS pid, p.name AS name,
              coalesce(p.ccd, p.detention_location, p.lugar_detencion, p.lugar_secuestro) AS location`,
      { casoSlug: CASO_SLUG },
    )

    for (const rec of victims.records) {
      const pid = rec.get('pid') as string
      const pname = rec.get('name') as string
      const location = (rec.get('location') as string).trim()
      const locationLower = location.toLowerCase()

      // Try exact match first, then contains match
      let matchedCid: string | null = null
      if (ccdLookup.has(locationLower)) {
        matchedCid = ccdLookup.get(locationLower)!
      } else {
        // Try partial match: check if any CCD name is contained in the location or vice versa
        for (const [ccdName, cid] of ccdLookup) {
          if (locationLower.includes(ccdName) || ccdName.includes(locationLower)) {
            matchedCid = cid
            break
          }
        }
      }

      if (matchedCid) {
        await session.run(
          `MATCH (p) WHERE elementId(p) = $pid
           MATCH (c) WHERE elementId(c) = $cid
           MERGE (p)-[r:DETENIDO_EN]->(c)
           ON CREATE SET
             r.source = 'geographic-intelligence',
             r.ingestion_wave = $wave,
             r.caso_slug = $casoSlug,
             r.created_at = datetime()`,
          { pid, cid: matchedCid, wave: WAVE, casoSlug: CASO_SLUG },
        )
        created++
      } else {
        unmatchedLocations.add(location)
      }
    }

    return { created, unmatched: [...unmatchedLocations] }
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
  console.log('=== Wave 10: Geographic Intelligence ===\n')

  // Phase 1: Query victims and compute stats
  console.log('--- Phase 1: Querying Victims with Location Data ---')
  const victims = await queryVictimsWithLocation()
  console.log(`  Found ${victims.length} victims with location data\n`)

  const { byProvince, byYear, byProvinceYear } = computeStats(victims)

  // Report provincial stats
  console.log('--- Provincial Distribution ---')
  const sortedProvinces = [...byProvince.entries()].sort((a, b) => b[1] - a[1])
  for (const [province, count] of sortedProvinces) {
    const pct = ((count / victims.length) * 100).toFixed(1)
    const bar = '#'.repeat(Math.ceil(count / Math.max(1, Math.ceil(sortedProvinces[0][1] / 40))))
    console.log(`  ${province.padEnd(25)} ${String(count).padStart(5)} (${pct}%) ${bar}`)
  }

  // Report temporal stats
  console.log('\n--- Temporal Distribution ---')
  const sortedYears = [...byYear.entries()].sort((a, b) => a[0] - b[0])
  for (const [year, count] of sortedYears) {
    const bar = '#'.repeat(Math.ceil(count / Math.max(1, Math.ceil(sortedYears.reduce((m, [, c]) => Math.max(m, c), 0) / 40))))
    console.log(`  ${year}  ${String(count).padStart(5)}  ${bar}`)
  }

  // Report temporal density peaks
  console.log('\n--- Temporal Density Peaks (province-year, top 15) ---')
  const sortedDensity = [...byProvinceYear.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
  for (const [key, count] of sortedDensity) {
    const [province, year] = key.split('|')
    console.log(`  ${province.padEnd(25)} ${year}  ${count} disappearances`)
  }

  // Phase 2: Match locations to CCDs
  console.log('\n--- Phase 2: Matching Detention Locations to CCD Nodes ---')
  const { created, unmatched } = await createDetenidoEnRelationships()
  console.log(`  Created ${created} DETENIDO_EN relationships`)
  if (unmatched.length > 0) {
    console.log(`  ${unmatched.length} locations could not be matched to CCD nodes:`)
    for (const loc of unmatched.slice(0, 30)) {
      console.log(`    - ${loc}`)
    }
    if (unmatched.length > 30) {
      console.log(`    ... and ${unmatched.length - 30} more`)
    }
  }

  // Phase 3: Geographic cluster analysis
  console.log('\n--- Phase 3: Geographic Cluster Summary ---')
  const driver = getDriver()
  const session = driver.session()
  try {
    const ccdStats = await session.run(
      `MATCH (c:DictaduraCCD)<-[:DETENIDO_EN]-(p:DictaduraPersona)
       WHERE c.caso_slug = $casoSlug
       RETURN c.name AS ccd, count(p) AS victimCount
       ORDER BY victimCount DESC
       LIMIT 20`,
      { casoSlug: CASO_SLUG },
    )

    if (ccdStats.records.length > 0) {
      console.log('  Top CCDs by victim count:')
      for (const r of ccdStats.records) {
        const count = toNumber(r.get('victimCount'))
        console.log(`    ${(r.get('ccd') as string).padEnd(40)} ${count} victims`)
      }
    }

    // Total DETENIDO_EN relationships
    const totalRels = await session.run(
      `MATCH ()-[r:DETENIDO_EN]->()
       WHERE r.caso_slug = $casoSlug
       RETURN count(r) AS total`,
      { casoSlug: CASO_SLUG },
    )
    console.log(`\n  Total DETENIDO_EN relationships: ${toNumber(totalRels.records[0]?.get('total'))}`)
  } finally {
    await session.close()
  }

  // Final summary
  console.log('\n=== Wave 10 Summary ===')
  console.log(`  Victims with location data:    ${victims.length}`)
  console.log(`  Provinces identified:           ${byProvince.size}`)
  console.log(`  Years covered:                  ${byYear.size} (${sortedYears[0]?.[0] || '?'}-${sortedYears[sortedYears.length - 1]?.[0] || '?'})`)
  console.log(`  DETENIDO_EN relationships:      ${created}`)
  console.log(`  Unmatched locations:            ${unmatched.length}`)

  await closeDriver()
  console.log('\nWave 10 complete!')
}

main().catch((err) => {
  console.error('Wave 10 failed:', err)
  closeDriver().finally(() => process.exit(1))
})
