/**
 * Wave 1: RUVTE Victims (~9,400 nodes)
 *
 * Ingests the RUVTE (Registro Unificado de Víctimas del Terrorismo de Estado)
 * CSV files into the caso-dictadura Neo4j graph.
 *
 * Source: datos.jus.gob.ar / GitHub mirror
 * Confidence tier: bronze (raw government registry data)
 * Ingestion wave: 1
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CASO_SLUG = 'caso-dictadura'
const WAVE = 1
const SOURCE = 'ruvte'
const BATCH_SIZE = 200

// ---------------------------------------------------------------------------
// CSV Parsing (no external deps — RUVTE format is simple)
// ---------------------------------------------------------------------------

function parseCSV(raw: string): Record<string, string>[] {
  // Strip BOM
  const text = raw.replace(/^\uFEFF/, '')
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseLine(line)
    const record: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      record[headers[i].trim()] = (values[i] ?? '').trim()
    }
    return record
  })
}

/** Parse a single CSV line handling quoted fields */
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
// Name normalization
// ---------------------------------------------------------------------------

/** "LASTNAME  FIRSTNAME" → "Firstname Lastname" */
function normalizeName(raw: string): string {
  const parts = raw
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

  if (parts.length === 0) return raw

  // RUVTE format: "APELLIDO  NOMBRES" — first word(s) are surname
  // We titleCase each part
  return parts.map(titleCase).join(' ')
}

function titleCase(word: string): string {
  if (word.length <= 2 && word === word.toUpperCase()) return word.toLowerCase()
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/** Create URL-safe slug from name */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

// ---------------------------------------------------------------------------
// Field extraction
// ---------------------------------------------------------------------------

/** Extract DNI/LE/LC number from mixed "documentos" field */
function extractDNI(raw: string): string | null {
  if (!raw || raw === 'sin datos' || raw === '---') return null
  // Try to extract the number from patterns like "LE 8293245", "DNI 12345678", "LC 1234567"
  const match = raw.match(/(?:LE|LC|DNI|CI)\s*(\d[\d.]*)/i)
  if (match) return match[1].replace(/\./g, '')
  // Raw number
  const numMatch = raw.match(/(\d{6,8})/)
  if (numMatch) return numMatch[1]
  return null
}

/** Parse combined "fecha_lugar_detencion_secuestro" field
 *  Format: "26/12/1976   LA PLATA  BUENOS AIRES" or "sin datos fecha   sin datos lugar"
 */
function parseDateLocation(raw: string): { date: string | null; location: string | null } {
  if (!raw || raw.startsWith('sin datos') || raw === '---') return { date: null, location: null }

  // Try to extract date pattern DD/MM/YYYY
  const dateMatch = raw.match(/(\d{1,2}\/\d{1,2}\/\d{4})/)
  const date = dateMatch ? isoDate(dateMatch[1]) : null

  // Location is everything after the date (and whitespace)
  let location: string | null = null
  if (dateMatch) {
    const afterDate = raw.slice(dateMatch.index! + dateMatch[0].length).trim()
    if (afterDate && afterDate !== '---' && !afterDate.startsWith('sin datos')) {
      location = afterDate.replace(/\s+/g, ' ').trim()
    }
  } else {
    // No date found — entire field might be location
    const trimmed = raw.replace(/\s+/g, ' ').trim()
    if (trimmed && trimmed !== '---' && !trimmed.startsWith('sin datos')) {
      location = trimmed
    }
  }

  return { date, location }
}

/** Convert DD/MM/YYYY to YYYY-MM-DD */
function isoDate(raw: string): string | null {
  const parts = raw.split('/')
  if (parts.length !== 3) return null
  const [d, m, y] = parts
  if (!y || y.length !== 4) return null
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Dedup check against existing seed personas
// ---------------------------------------------------------------------------

async function loadExistingSlugs(): Promise<Set<string>> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona) WHERE p.caso_slug = $casoSlug RETURN p.slug AS slug`,
      { casoSlug: CASO_SLUG },
    )
    return new Set(result.records.map((r) => r.get('slug') as string))
  } finally {
    await session.close()
  }
}

async function loadExistingRuvteIds(): Promise<Set<string>> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (p:DictaduraPersona) WHERE p.caso_slug = $casoSlug AND p.ruvte_id IS NOT NULL RETURN p.ruvte_id AS rid`,
      { casoSlug: CASO_SLUG },
    )
    return new Set(result.records.map((r) => r.get('rid') as string))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Main ingestion
// ---------------------------------------------------------------------------

interface RUVTERecord {
  id: string
  name: string
  slug: string
  ruvte_id: string
  category: string
  tipificacion: string
  dni: string | null
  birth_year: string | null
  birth_province: string | null
  nationality: string | null
  age_at_event: string | null
  pregnancy: string | null
  detention_date: string | null
  detention_location: string | null
  death_date: string | null
  death_location: string | null
  photo_available: boolean
  source_file: string
}

function parseRUVTERow(row: Record<string, string>, sourceFile: string): RUVTERecord | null {
  const rawName = row['apellido_paterno_nombres']
  if (!rawName || rawName === 'sin datos') return null

  const name = normalizeName(rawName)
  if (name.length < 2) return null

  const slug = slugify(name)
  if (!slug) return null

  const ruvteId = (row['id_unico_ruvte'] ?? '').trim()
  if (!ruvteId) return null

  const detention = parseDateLocation(row['fecha_lugar_detencion_secuestro'] ?? '')
  const death = parseDateLocation(row['fecha_lugar_asesinato_o_hallazgo_de_restos'] ?? '')

  const ageRaw = (row['edad_al_momento_del_hecho'] ?? '').trim()
  const age = ageRaw && ageRaw !== 'sin datos' ? ageRaw : null

  const birthYear = (row['anio_nacimiento'] ?? '').trim()
  const birthProv = (row['provincia_pais_nacimiento'] ?? '').trim()
  const nationality = (row['nacionalidad'] ?? '').trim()
  const pregnancy = (row['embarazo'] ?? '').trim()
  const photo = (row['fotografia'] ?? '').trim()

  return {
    id: `ruvte-${ruvteId.replace(/\s+/g, '-').toLowerCase()}`,
    name,
    slug,
    ruvte_id: ruvteId,
    category: 'victima',
    tipificacion: (row['tipificacion_ruvte'] ?? '').trim(),
    dni: extractDNI(row['documentos'] ?? ''),
    birth_year: birthYear && birthYear !== 'sin datos' ? birthYear : null,
    birth_province: birthProv && birthProv !== 'sin datos' ? birthProv : null,
    nationality: nationality && nationality !== 'sin datos' ? nationality : null,
    age_at_event: age,
    pregnancy: pregnancy && pregnancy !== 'sin datos' ? pregnancy : null,
    detention_date: detention.date,
    detention_location: detention.location,
    death_date: death.date,
    death_location: death.location,
    photo_available: photo === 'Sí',
    source_file: sourceFile,
  }
}

async function ingestBatch(records: RUVTERecord[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const r of records) {
      await tx.run(
        `MERGE (p:DictaduraPersona {id: $id})
         ON CREATE SET
           p.name = $name,
           p.slug = $slug,
           p.category = $category,
           p.ruvte_id = $ruvteId,
           p.tipificacion = $tipificacion,
           p.dni = $dni,
           p.birth_year = $birthYear,
           p.birth_province = $birthProvince,
           p.nationality = $nationality,
           p.age_at_event = $ageAtEvent,
           p.pregnancy = $pregnancy,
           p.detention_date = $detentionDate,
           p.detention_location = $detentionLocation,
           p.death_date = $deathDate,
           p.death_location = $deathLocation,
           p.photo_available = $photoAvailable,
           p.caso_slug = $casoSlug,
           p.confidence_tier = 'bronze',
           p.ingestion_wave = $wave,
           p.source = $source,
           p.source_file = $sourceFile,
           p.created_at = datetime(),
           p.updated_at = datetime()
         ON MATCH SET
           p.updated_at = datetime()`,
        {
          id: r.id,
          name: r.name,
          slug: r.slug,
          category: r.category,
          ruvteId: r.ruvte_id,
          tipificacion: r.tipificacion,
          dni: r.dni,
          birthYear: r.birth_year,
          birthProvince: r.birth_province,
          nationality: r.nationality,
          ageAtEvent: r.age_at_event,
          pregnancy: r.pregnancy,
          detentionDate: r.detention_date,
          detentionLocation: r.detention_location,
          deathDate: r.death_date,
          deathLocation: r.death_location,
          photoAvailable: r.photo_available,
          casoSlug: CASO_SLUG,
          wave: WAVE,
          source: SOURCE,
          sourceFile: r.source_file,
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

/** Create DictaduraLugar nodes from unique detention locations */
async function ingestLocations(records: RUVTERecord[]): Promise<number> {
  const locations = new Map<string, string>()

  for (const r of records) {
    if (r.detention_location) {
      const slug = slugify(r.detention_location)
      if (slug && !locations.has(slug)) {
        locations.set(slug, r.detention_location)
      }
    }
    if (r.birth_province) {
      const slug = slugify(r.birth_province)
      if (slug && !locations.has(slug)) {
        locations.set(slug, r.birth_province)
      }
    }
  }

  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    for (const [slug, name] of locations) {
      // Extract province from location string (often ends with province name)
      const parts = name.split(/\s{2,}/)
      const province = parts.length > 1 ? parts[parts.length - 1] : name

      await session.run(
        `MERGE (l:DictaduraLugar {slug: $slug})
         ON CREATE SET
           l.id = $id,
           l.name = $name,
           l.province = $province,
           l.caso_slug = $casoSlug,
           l.confidence_tier = 'bronze',
           l.ingestion_wave = $wave,
           l.source = $source,
           l.created_at = datetime(),
           l.updated_at = datetime()`,
        {
          id: `ruvte-lugar-${slug}`,
          slug,
          name,
          province,
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

/** Create SECUESTRADO_EN relationships between victims and locations */
async function ingestDetentionRelationships(records: RUVTERecord[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const r of records) {
      if (r.detention_location) {
        const locSlug = slugify(r.detention_location)
        if (locSlug) {
          await tx.run(
            `MATCH (p:DictaduraPersona {id: $personId})
             MATCH (l:DictaduraLugar {slug: $locSlug})
             MERGE (p)-[rel:SECUESTRADO_EN]->(l)
             ON CREATE SET rel.date = $date, rel.source = $source`,
            {
              personId: r.id,
              locSlug,
              date: r.detention_date,
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

/** Create NACIDO_EN relationships between victims and birth provinces */
async function ingestBirthRelationships(records: RUVTERecord[]): Promise<number> {
  const driver = getDriver()
  const session = driver.session()
  let created = 0

  try {
    const tx = session.beginTransaction()

    for (const r of records) {
      if (r.birth_province) {
        const locSlug = slugify(r.birth_province)
        if (locSlug) {
          await tx.run(
            `MATCH (p:DictaduraPersona {id: $personId})
             MATCH (l:DictaduraLugar {slug: $locSlug})
             MERGE (p)-[rel:NACIDO_EN]->(l)
             ON CREATE SET rel.source = $source`,
            {
              personId: r.id,
              locSlug,
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

/** Simple dedup: check if a RUVTE victim name fuzzy-matches a seed persona */
function normalizeForDedup(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Wave 1: RUVTE Victims Ingestion ===\n')

  await verifyConnectivity()
  console.log('✓ Neo4j connected\n')

  // Load existing data for dedup
  const existingSlugs = await loadExistingSlugs()
  const existingRuvteIds = await loadExistingRuvteIds()
  console.log(`Existing personas: ${existingSlugs.size} slugs, ${existingRuvteIds.size} RUVTE IDs\n`)

  // Parse CSV files
  const dataDir = resolve(__dirname, '../_ingestion_data/dictadura/ruvte')

  const mainCSV = readFileSync(resolve(dataDir, 'victimas-accionar-represivo-ilegal.csv'), 'utf-8')
  const mainRows = parseCSV(mainCSV)
  console.log(`Main CSV: ${mainRows.length} rows`)

  const sinDenunciaCSV = readFileSync(
    resolve(dataDir, 'victimas-accionar-represivo-ilegal-sin-denuncia-formal.csv'),
    'utf-8',
  )
  const sinDenunciaRows = parseCSV(sinDenunciaCSV)
  console.log(`Sin denuncia CSV: ${sinDenunciaRows.length} rows\n`)

  // Parse all records
  let allRecords: RUVTERecord[] = []
  let parseErrors = 0
  let dupsSkipped = 0

  for (const row of mainRows) {
    const record = parseRUVTERow(row, 'victimas-accionar-represivo-ilegal.csv')
    if (!record) {
      parseErrors++
      continue
    }
    // Skip if RUVTE ID already exists (seed match)
    if (existingRuvteIds.has(record.ruvte_id)) {
      dupsSkipped++
      continue
    }
    allRecords.push(record)
  }

  for (const row of sinDenunciaRows) {
    const record = parseRUVTERow(row, 'victimas-accionar-represivo-ilegal-sin-denuncia-formal.csv')
    if (!record) {
      parseErrors++
      continue
    }
    if (existingRuvteIds.has(record.ruvte_id)) {
      dupsSkipped++
      continue
    }
    allRecords.push(record)
  }

  console.log(`Parsed: ${allRecords.length} new records`)
  console.log(`Parse errors: ${parseErrors}`)
  console.log(`Duplicates skipped: ${dupsSkipped}\n`)

  // Dedup against seed personas by normalized name
  const seedNormalized = new Map<string, string>()
  for (const slug of existingSlugs) {
    seedNormalized.set(normalizeForDedup(slug.replace(/-/g, ' ')), slug)
  }

  let nameDedup = 0
  const dedupConflicts: Array<{ ruvte: string; seed: string }> = []
  allRecords = allRecords.filter((r) => {
    const norm = normalizeForDedup(r.name)
    const match = seedNormalized.get(norm)
    if (match) {
      nameDedup++
      dedupConflicts.push({ ruvte: r.name, seed: match })
      return false
    }
    return true
  })

  if (nameDedup > 0) {
    console.log(`Name dedup against seed: ${nameDedup} matches removed`)
    console.log(`  Conflicts: ${JSON.stringify(dedupConflicts.slice(0, 5))}...`)
  }
  console.log(`Final records to ingest: ${allRecords.length}\n`)

  // Ingest personas in batches
  console.log('Ingesting personas...')
  let totalCreated = 0
  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE)
    const created = await ingestBatch(batch)
    totalCreated += created
    process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allRecords.length / BATCH_SIZE)}: ${created} created (${totalCreated} total)\r`)
  }
  console.log(`\n✓ Personas ingested: ${totalCreated}\n`)

  // Ingest locations
  console.log('Ingesting locations...')
  const locationsCreated = await ingestLocations(allRecords)
  console.log(`✓ Locations created: ${locationsCreated}\n`)

  // Ingest detention relationships
  console.log('Ingesting SECUESTRADO_EN relationships...')
  const detentionRels = await ingestDetentionRelationships(allRecords)
  console.log(`✓ SECUESTRADO_EN relationships: ${detentionRels}\n`)

  // Ingest birth relationships
  console.log('Ingesting NACIDO_EN relationships...')
  const birthRels = await ingestBirthRelationships(allRecords)
  console.log(`✓ NACIDO_EN relationships: ${birthRels}\n`)

  // Final stats
  const driver = getDriver()
  const session = driver.session()
  try {
    const nodeCount = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug
       RETURN labels(n)[0] AS label, n.confidence_tier AS tier, count(n) AS count
       ORDER BY label, tier`,
      { casoSlug: CASO_SLUG },
    )
    console.log('=== Final Graph State ===')
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
  } finally {
    await session.close()
  }

  await closeDriver()
  console.log('\n✓ Wave 1 complete!')
}

main().catch((err) => {
  console.error('Wave 1 failed:', err)
  process.exit(1)
})
