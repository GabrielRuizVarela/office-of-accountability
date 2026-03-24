/**
 * Wave 2: Centros Clandestinos de Detención (~800 nodes)
 *
 * Ingests CCD data from the `presentes` R package (DiegoKoz/presentes on GitHub).
 * Cross-references RUVTE victim detention_location strings against CCD names
 * to create DETENIDO_EN relationships.
 *
 * Source: https://raw.githubusercontent.com/DiegoKoz/presentes/master/extdata/centros_clandestinos_detencion.csv
 * Confidence tier: silver (government-sourced with coordinates)
 * Ingestion wave: 2
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CASO_SLUG = 'caso-dictadura'
const WAVE = 2
const SOURCE = 'presentes'
const BATCH_SIZE = 100
const CSV_URL =
  'https://raw.githubusercontent.com/DiegoKoz/presentes/master/extdata/centros_clandestinos_detencion.csv'
const DATA_DIR = resolve(__dirname, '../_ingestion_data/dictadura/ccds')
const CSV_PATH = resolve(DATA_DIR, 'centros_clandestinos_detencion.csv')

// ---------------------------------------------------------------------------
// CSV Parsing (no external deps)
// ---------------------------------------------------------------------------

function parseCSV(raw: string): Record<string, string>[] {
  const text = raw.replace(/^\uFEFF/, '')
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const record: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      record[headers[i].trim().replace(/^"|"$/g, '')] = (values[i] ?? '').trim().replace(/^"|"$/g, '')
    }
    return record
  })
}

function parseLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

// ---------------------------------------------------------------------------
// Text normalization
// ---------------------------------------------------------------------------

/** Strip diacritics, lowercase, collapse whitespace */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Create URL-safe slug */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

/** Title-case a word */
function titleCase(word: string): string {
  if (word.length <= 2 && word === word.toUpperCase()) return word.toLowerCase()
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/** "ESCUELA DE MECANICA" → "Escuela De Mecanica" */
function titleCaseName(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(titleCase)
    .join(' ')
}

// ---------------------------------------------------------------------------
// Province extraction from ubicacion field
// ---------------------------------------------------------------------------

/** Known Argentine provinces for extraction */
const PROVINCES = [
  'BUENOS AIRES', 'CAPITAL FEDERAL', 'CATAMARCA', 'CHACO', 'CHUBUT',
  'CÓRDOBA', 'CORDOBA', 'CORRIENTES', 'ENTRE RÍOS', 'ENTRE RIOS',
  'FORMOSA', 'JUJUY', 'LA PAMPA', 'LA RIOJA', 'MENDOZA', 'MISIONES',
  'NEUQUÉN', 'NEUQUEN', 'RÍO NEGRO', 'RIO NEGRO', 'SALTA',
  'SAN JUAN', 'SAN LUIS', 'SANTA CRUZ', 'SANTA FE', 'SANTIAGO DEL ESTERO',
  'TIERRA DEL FUEGO', 'TUCUMÁN', 'TUCUMAN',
]

function extractProvince(ubicacion: string): string | null {
  const upper = ubicacion.toUpperCase()

  // CAPITAL FEDERAL is Buenos Aires
  if (upper.includes('CAPITAL FEDERAL')) return 'Buenos Aires'

  for (const prov of PROVINCES) {
    if (upper.includes(prov)) {
      // Normalize variants
      const normalized = prov
        .replace('CORDOBA', 'CÓRDOBA')
        .replace('ENTRE RIOS', 'ENTRE RÍOS')
        .replace('NEUQUEN', 'NEUQUÉN')
        .replace('RIO NEGRO', 'RÍO NEGRO')
        .replace('TUCUMAN', 'TUCUMÁN')
      return titleCaseName(normalized)
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// CCD record type
// ---------------------------------------------------------------------------

interface CCDRecord {
  id: string
  name: string
  slug: string
  original_id: string
  fuerza: string
  lat: number | null
  lon: number | null
  province: string | null
  ubicacion: string
  espacio_de_memoria: boolean
}

function parseCCDRow(row: Record<string, string>): CCDRecord | null {
  const rawName = (row['denominacion'] ?? '').trim()
  if (!rawName) return null

  // Clean name: take first line (some have multi-line with unit info)
  const cleanName = rawName
    .split(/\s{10,}/)[0]    // Split on large whitespace gaps (multi-line encoded)
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanName.length < 2) return null

  const slug = slugify(cleanName)
  if (!slug) return null

  const originalId = (row['ID'] ?? '').trim()
  const fuerza = (row['lugar_emplazamiento_propiedad'] ?? '').trim()
  const ubicacion = (row['ubicacion'] ?? '').trim()
  const espacio = (row['espacio_de_memoria'] ?? '').trim()

  const latRaw = (row['lat'] ?? '').trim()
  const lonRaw = (row['lon'] ?? '').trim()
  const lat = latRaw ? parseFloat(latRaw) : null
  const lon = lonRaw ? parseFloat(lonRaw) : null

  const province = extractProvince(ubicacion)

  return {
    id: `presentes-ccd-${slug}`,
    name: titleCaseName(cleanName),
    slug,
    original_id: originalId,
    fuerza: fuerza || 'DESCONOCIDO',
    lat: lat && !isNaN(lat) ? lat : null,
    lon: lon && !isNaN(lon) ? lon : null,
    province,
    ubicacion: ubicacion.replace(/\s+/g, ' ').trim(),
    espacio_de_memoria: espacio === 'TRUE',
  }
}

// ---------------------------------------------------------------------------
// Download CSV
// ---------------------------------------------------------------------------

async function downloadCSV(): Promise<string> {
  if (existsSync(CSV_PATH)) {
    console.log(`Using cached CSV: ${CSV_PATH}`)
    return readFileSync(CSV_PATH, 'utf-8')
  }

  console.log(`Downloading CSV from ${CSV_URL}...`)
  mkdirSync(DATA_DIR, { recursive: true })

  const response = await fetch(CSV_URL)
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()
  writeFileSync(CSV_PATH, text, 'utf-8')
  console.log(`Saved to ${CSV_PATH} (${text.length} bytes)`)
  return text
}

// ---------------------------------------------------------------------------
// Dedup against existing seed CCDs
// ---------------------------------------------------------------------------

async function loadExistingCCDSlugs(): Promise<Set<string>> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD) WHERE c.caso_slug = $casoSlug RETURN c.slug AS slug`,
      { casoSlug: CASO_SLUG },
    )
    return new Set(result.records.map((r) => r.get('slug') as string))
  } finally {
    await session.close()
  }
}

async function loadExistingCCDNames(): Promise<Map<string, string>> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (c:DictaduraCCD) WHERE c.caso_slug = $casoSlug RETURN c.slug AS slug, c.name AS name`,
      { casoSlug: CASO_SLUG },
    )
    const map = new Map<string, string>()
    for (const r of result.records) {
      map.set(r.get('slug') as string, r.get('name') as string)
    }
    return map
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Ingest CCD nodes
// ---------------------------------------------------------------------------

async function ingestCCDBatch(records: CCDRecord[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const r of records) {
      await tx.run(
        `MERGE (c:DictaduraCCD {slug: $slug})
         ON CREATE SET
           c.id = $id,
           c.name = $name,
           c.original_id = $originalId,
           c.fuerza = $fuerza,
           c.lat = $lat,
           c.lon = $lon,
           c.province = $province,
           c.ubicacion = $ubicacion,
           c.espacio_de_memoria = $espacioMemoria,
           c.caso_slug = $casoSlug,
           c.confidence_tier = 'silver',
           c.ingestion_wave = $wave,
           c.source = $source,
           c.created_at = datetime(),
           c.updated_at = datetime()
         ON MATCH SET
           c.lat = COALESCE(c.lat, $lat),
           c.lon = COALESCE(c.lon, $lon),
           c.province = COALESCE(c.province, $province),
           c.ubicacion = COALESCE(c.ubicacion, $ubicacion),
           c.espacio_de_memoria = COALESCE(c.espacio_de_memoria, $espacioMemoria),
           c.original_id = COALESCE(c.original_id, $originalId),
           c.updated_at = datetime()`,
        {
          id: r.id,
          slug: r.slug,
          name: r.name,
          originalId: r.original_id,
          fuerza: r.fuerza,
          lat: r.lat,
          lon: r.lon,
          province: r.province,
          ubicacion: r.ubicacion,
          espacioMemoria: r.espacio_de_memoria,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE,
        },
      )
      created++
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

// ---------------------------------------------------------------------------
// Province DictaduraLugar nodes and UBICADO_EN relationships
// ---------------------------------------------------------------------------

async function ingestProvinceNodes(records: CCDRecord[]): Promise<number> {
  const provinces = new Map<string, string>()
  for (const r of records) {
    if (r.province) {
      const slug = slugify(r.province)
      if (slug && !provinces.has(slug)) {
        provinces.set(slug, r.province)
      }
    }
  }

  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const [slug, name] of provinces) {
      await session.run(
        `MERGE (l:DictaduraLugar {slug: $slug})
         ON CREATE SET
           l.id = $id,
           l.name = $name,
           l.province = $name,
           l.lugar_type = 'provincia',
           l.caso_slug = $casoSlug,
           l.confidence_tier = 'silver',
           l.ingestion_wave = $wave,
           l.source = $source,
           l.created_at = datetime(),
           l.updated_at = datetime()`,
        {
          id: `presentes-lugar-${slug}`,
          slug,
          name,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE,
        },
      )
      created++
    }
  } finally {
    await session.close()
  }

  return created
}

async function ingestUbicadoEnRelationships(records: CCDRecord[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const r of records) {
      if (r.province) {
        const provSlug = slugify(r.province)
        if (provSlug) {
          await tx.run(
            `MATCH (c:DictaduraCCD {slug: $ccdSlug})
             MATCH (l:DictaduraLugar {slug: $provSlug})
             MERGE (c)-[rel:UBICADO_EN]->(l)
             ON CREATE SET rel.source = $source`,
            {
              ccdSlug: r.slug,
              provSlug,
              source: SOURCE,
            },
          )
          created++
        }
      }
    }

    await tx.commit()
  } finally {
    await session.close()
  }

  return created
}

// ---------------------------------------------------------------------------
// Cross-reference: RUVTE victim detention_location → CCD → DETENIDO_EN
// ---------------------------------------------------------------------------

interface VictimDetention {
  personId: string
  detentionLocation: string
}

async function loadVictimDetentionLocations(): Promise<VictimDetention[]> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona)
       WHERE p.caso_slug = $casoSlug
         AND p.detention_location IS NOT NULL
         AND p.detention_location <> ''
       RETURN p.id AS personId, p.detention_location AS detentionLocation`,
      { casoSlug: CASO_SLUG },
    )
    return result.records.map((r) => ({
      personId: r.get('personId') as string,
      detentionLocation: r.get('detentionLocation') as string,
    }))
  } finally {
    await session.close()
  }
}

/** Build lookup: normalized CCD name tokens → CCD slug */
interface CCDMatchEntry {
  slug: string
  name: string
  normalized: string
  tokens: string[]
}

function buildCCDMatchIndex(allCCDs: Map<string, string>): CCDMatchEntry[] {
  const entries: CCDMatchEntry[] = []
  for (const [slug, name] of allCCDs) {
    const normalized = normalize(name)
    const tokens = normalized.split(' ').filter((t) => t.length > 1)
    entries.push({ slug, name, normalized, tokens })
  }
  // Sort by name length descending so longer (more specific) names match first
  entries.sort((a, b) => b.normalized.length - a.normalized.length)
  return entries
}

/**
 * Fuzzy-match a RUVTE detention_location string against CCD names.
 *
 * Strategy:
 * 1. Exact normalized match (highest confidence)
 * 2. CCD name is contained within the detention_location string
 * 3. All significant tokens of a CCD name appear in the detention_location
 *
 * Examples:
 *   "ESMA  BUENOS AIRES" → match "ESMA"
 *   "COMISARIA 5TA  LA PLATA  BUENOS AIRES" → match "Comisaría 5ta La Plata"
 *   "CAMPO DE MAYO  BUENOS AIRES" → match "Campo de Mayo"
 */
function matchDetentionToCCD(
  detentionLocation: string,
  index: CCDMatchEntry[],
): CCDMatchEntry | null {
  const normLoc = normalize(detentionLocation)

  // Stopwords to ignore in token matching
  const stopwords = new Set([
    'de', 'del', 'la', 'las', 'los', 'el', 'en', 'y', 'e', 'o', 'a',
    'buenos', 'aires', 'capital', 'federal', 'provincia',
    'san', 'santa', 'mar', 'rio',
  ])

  // Strategy 1: Exact match
  for (const entry of index) {
    if (normLoc === entry.normalized) return entry
  }

  // Strategy 2: CCD normalized name is contained in detention location
  // Only match names with at least 4 characters to avoid false positives
  for (const entry of index) {
    if (entry.normalized.length >= 4 && normLoc.includes(entry.normalized)) {
      return entry
    }
  }

  // Strategy 3: All significant CCD tokens appear in the location string
  // Require at least 2 significant tokens to match
  const locTokens = new Set(normLoc.split(' ').filter((t) => t.length > 1))

  for (const entry of index) {
    const significantTokens = entry.tokens.filter((t) => !stopwords.has(t) && t.length > 2)
    if (significantTokens.length < 2) continue

    const matched = significantTokens.filter((t) => locTokens.has(t))
    if (matched.length === significantTokens.length) {
      return entry
    }
  }

  return null
}

async function createDetenidoEnRelationships(
  victims: VictimDetention[],
  ccdIndex: CCDMatchEntry[],
): Promise<{ created: number; matched: number; samples: Array<{ location: string; ccd: string }> }> {
  const driver = getDriver()
  let created = 0
  let matched = 0
  const samples: Array<{ location: string; ccd: string }> = []

  // Group matches by CCD to batch
  const matchMap = new Map<string, string[]>() // ccdSlug → personId[]

  for (const v of victims) {
    const match = matchDetentionToCCD(v.detentionLocation, ccdIndex)
    if (match) {
      matched++
      if (!matchMap.has(match.slug)) {
        matchMap.set(match.slug, [])
      }
      matchMap.get(match.slug)!.push(v.personId)

      if (samples.length < 20) {
        samples.push({ location: v.detentionLocation, ccd: match.name })
      }
    }
  }

  // Create relationships in batches
  const ccdSlugs = Array.from(matchMap.keys())
  for (let i = 0; i < ccdSlugs.length; i += BATCH_SIZE) {
    const batchSlugs = ccdSlugs.slice(i, i + BATCH_SIZE)
    const session = driver.session()

    try {
      const tx = session.beginTransaction()

      for (const ccdSlug of batchSlugs) {
        const personIds = matchMap.get(ccdSlug)!
        for (const personId of personIds) {
          await tx.run(
            `MATCH (p:DictaduraPersona {id: $personId})
             MATCH (c:DictaduraCCD {slug: $ccdSlug})
             MERGE (p)-[r:DETENIDO_EN]->(c)
             ON CREATE SET r.source = $source, r.match_method = 'fuzzy_location', r.created_at = datetime()`,
            {
              personId,
              ccdSlug,
              source: SOURCE,
            },
          )
          created++
        }
      }

      await tx.commit()
    } finally {
      await session.close()
    }

    process.stdout.write(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ccdSlugs.length / BATCH_SIZE)}: ${created} relationships\r`,
    )
  }

  return { created, matched, samples }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 2: Centros Clandestinos de Detención (presentes) ===\n')

  await verifyConnectivity()
  console.log('✓ Neo4j connected\n')

  // Step 1: Download CSV
  const csvText = await downloadCSV()
  const rows = parseCSV(csvText)
  console.log(`CSV parsed: ${rows.length} rows\n`)

  // Step 2: Parse CCD records
  const allRecords: CCDRecord[] = []
  let parseErrors = 0
  const seenSlugs = new Set<string>()

  for (const row of rows) {
    const record = parseCCDRow(row)
    if (!record) {
      parseErrors++
      continue
    }
    // Dedup within CSV (same slug = same CCD)
    if (seenSlugs.has(record.slug)) {
      continue
    }
    seenSlugs.add(record.slug)
    allRecords.push(record)
  }

  console.log(`Parsed: ${allRecords.length} unique CCDs`)
  console.log(`Parse errors/skipped: ${parseErrors}`)
  console.log(`Duplicates within CSV: ${rows.length - allRecords.length - parseErrors}\n`)

  // Step 3: Check existing seed CCDs for dedup
  const existingSlugs = await loadExistingCCDSlugs()
  console.log(`Existing seed CCDs: ${existingSlugs.size}`)

  let seedMatches = 0
  const newRecords: CCDRecord[] = []
  const updateRecords: CCDRecord[] = []

  for (const r of allRecords) {
    if (existingSlugs.has(r.slug)) {
      seedMatches++
      updateRecords.push(r) // Will update with coords/province via ON MATCH
    } else {
      newRecords.push(r)
    }
  }

  console.log(`Seed dedup matches: ${seedMatches} (will update with coordinates)`)
  console.log(`New CCDs to create: ${newRecords.length}\n`)

  // Step 4: Ingest all CCDs (MERGE handles dedup — updates seeds, creates new)
  console.log('Ingesting CCD nodes...')
  let totalProcessed = 0
  const allToIngest = [...updateRecords, ...newRecords]

  for (let i = 0; i < allToIngest.length; i += BATCH_SIZE) {
    const batch = allToIngest.slice(i, i + BATCH_SIZE)
    const processed = await ingestCCDBatch(batch)
    totalProcessed += processed
    process.stdout.write(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allToIngest.length / BATCH_SIZE)}: ${processed} processed (${totalProcessed} total)\r`,
    )
  }
  console.log(`\n✓ CCDs processed: ${totalProcessed} (${seedMatches} updated, ${newRecords.length} created)\n`)

  // Step 5: Province nodes and UBICADO_EN relationships
  console.log('Ingesting province DictaduraLugar nodes...')
  const provincesCreated = await ingestProvinceNodes(allToIngest)
  console.log(`✓ Province nodes: ${provincesCreated}\n`)

  console.log('Ingesting UBICADO_EN relationships...')
  const ubicadoEnCreated = await ingestUbicadoEnRelationships(allToIngest)
  console.log(`✓ UBICADO_EN relationships: ${ubicadoEnCreated}\n`)

  // Step 6: Cross-reference RUVTE victims → CCDs via detention_location
  console.log('Loading RUVTE victim detention locations...')
  const victims = await loadVictimDetentionLocations()
  console.log(`Found ${victims.length} victims with detention_location\n`)

  // Build full CCD index (seed + newly ingested)
  const allCCDNames = await loadExistingCCDNames()
  // Also add the new records we just ingested
  for (const r of newRecords) {
    if (!allCCDNames.has(r.slug)) {
      allCCDNames.set(r.slug, r.name)
    }
  }
  console.log(`CCD match index: ${allCCDNames.size} entries\n`)

  const ccdIndex = buildCCDMatchIndex(allCCDNames)

  console.log('Creating DETENIDO_EN relationships...')
  const { created: detenidoEnCreated, matched, samples } = await createDetenidoEnRelationships(
    victims,
    ccdIndex,
  )
  console.log(`\n✓ DETENIDO_EN relationships: ${detenidoEnCreated}`)
  console.log(`  Victims matched: ${matched}/${victims.length} (${((matched / Math.max(victims.length, 1)) * 100).toFixed(1)}%)`)
  console.log(`\n  Sample matches:`)
  for (const s of samples) {
    console.log(`    "${s.location}" → ${s.ccd}`)
  }

  // Step 7: Final stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const nodeCount = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, n.confidence_tier AS tier, count(n) AS count
       ORDER BY label, tier`,
      { casoSlug: CASO_SLUG },
    )
    console.log('\n=== Final Graph State ===')
    let total = 0
    for (const r of nodeCount.records) {
      const c = typeof r.get('count') === 'object' ? (r.get('count') as { low: number }).low : r.get('count')
      total += c as number
      console.log(`  ${r.get('label')} [${r.get('tier')}]: ${c}`)
    }
    console.log(`\n  Total nodes: ${total}`)

    const edgeCount = await session.run(
      `MATCH (a)-[r]->(b) WHERE a.caso_slug = $casoSlug AND b.caso_slug = $casoSlug
       RETURN type(r) AS relType, count(r) AS count ORDER BY count DESC`,
      { casoSlug: CASO_SLUG },
    )
    let totalEdges = 0
    for (const r of edgeCount.records) {
      const c = typeof r.get('count') === 'object' ? (r.get('count') as { low: number }).low : r.get('count')
      totalEdges += c as number
      console.log(`  ${r.get('relType')}: ${c}`)
    }
    console.log(`\n  Total edges: ${totalEdges}`)

    // CCD-specific stats
    const ccdStats = await session.run(
      `MATCH (c:DictaduraCCD) WHERE c.caso_slug = $casoSlug
       RETURN c.confidence_tier AS tier, count(c) AS count,
              sum(CASE WHEN c.lat IS NOT NULL THEN 1 ELSE 0 END) AS withCoords,
              sum(CASE WHEN c.espacio_de_memoria = true THEN 1 ELSE 0 END) AS memorySites`,
      { casoSlug: CASO_SLUG },
    )
    console.log('\n  CCD breakdown:')
    for (const r of ccdStats.records) {
      const c = typeof r.get('count') === 'object' ? (r.get('count') as { low: number }).low : r.get('count')
      const wc = typeof r.get('withCoords') === 'object' ? (r.get('withCoords') as { low: number }).low : r.get('withCoords')
      const ms = typeof r.get('memorySites') === 'object' ? (r.get('memorySites') as { low: number }).low : r.get('memorySites')
      console.log(`    [${r.get('tier')}]: ${c} CCDs, ${wc} with coordinates, ${ms} memory sites`)
    }

    // DETENIDO_EN stats
    const detenidoStats = await session.run(
      `MATCH (p:DictaduraPersona)-[r:DETENIDO_EN]->(c:DictaduraCCD)
       WHERE p.caso_slug = $casoSlug
       RETURN c.name AS ccd, count(p) AS victims
       ORDER BY victims DESC LIMIT 20`,
      { casoSlug: CASO_SLUG },
    )
    console.log('\n  Top CCDs by victim count:')
    for (const r of detenidoStats.records) {
      const v = typeof r.get('victims') === 'object' ? (r.get('victims') as { low: number }).low : r.get('victims')
      console.log(`    ${r.get('ccd')}: ${v} victims`)
    }
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\n✓ Wave 2 complete!')
}

main().catch((err) => {
  console.error('Wave 2 failed:', err)
  process.exit(1)
})
