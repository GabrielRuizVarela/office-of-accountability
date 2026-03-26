/**
 * Targeted loader for Company and PublicCompany nodes + their relationships.
 *
 * The full ETL pipelines (run-etl-opencorporates.ts, run-etl-cnv.ts) timed out
 * on MERGE with SET n += for 1M+ company nodes. This script:
 *   1. Parses the already-downloaded CSVs directly
 *   2. Loads Company nodes using ON CREATE SET (skip updates on existing)
 *   3. Loads PublicCompany nodes the same way
 *   4. Creates OFFICER_OF_COMPANY relationships
 *   5. Creates BOARD_MEMBER_OF relationships
 *
 * Uses smaller batch sizes (200) and a 5-minute query timeout per batch.
 *
 * Run with: NEO4J_QUERY_TIMEOUT_MS=300000 npx tsx scripts/load-remaining-companies.ts
 */

import 'dotenv/config'
import { createReadStream } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { readdirSync } from 'node:fs'
import { parse } from 'csv-parse'

import { executeWrite, closeDriver, verifyConnectivity, readQuery } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const COMPANY_BATCH_SIZE = 200
const REL_BATCH_SIZE = 500
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'igj')

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

interface EntityRow {
  numero_correlativo: string
  tipo_societario: string
  descripcion_tipo_societario: string
  razon_social: string
  dada_de_baja: string
  codigo_baja: string
  detalle_baja: string
  cuit: string
}

interface AuthorityRow {
  numero_correlativo: string
  apellido_nombre: string
  tipo_administrador: string
  descripcion_tipo_administrador: string
  tipo_documento: string
  descripcion_tipo_documento: string
  numero_documento: string
  genero_autoridad: string
}

async function parseCsv<T>(filePath: string): Promise<T[]> {
  const records: T[] = []
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_column_count: true, bom: true }),
  )
  for await (const record of parser) {
    records.push(record as T)
  }
  return records
}

function findCsvFile(prefix: string): string {
  const files = readdirSync(DATA_DIR)
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith('.csv'))
  if (!match) throw new Error(`No CSV with prefix "${prefix}" in ${DATA_DIR}`)
  return join(DATA_DIR, match)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size) as T[])
  }
  return chunks
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60_000).toFixed(1)}m`
}

/**
 * Build officer_id matching what the original ETL stored.
 *
 * IMPORTANT: The original ETL parsed CSVs without BOM handling, so
 * row.numero_correlativo was undefined (the column was "\ufeffnumero_correlativo").
 * All 951K CompanyOfficer nodes have officer_id = "igj-undefined-DOCNUM-ROLE".
 * We must generate the same broken pattern to match existing nodes.
 */
function buildOfficerIdForMatch(row: AuthorityRow): string {
  const docNum = row.numero_documento.replace(/[.\-\s]/g, '').trim()
  return `igj-undefined-${docNum}-${row.tipo_administrador}`.toLowerCase()
}

/**
 * Build BoardMember igj_authority_id matching what the original ETL stored.
 *
 * Same BOM issue: the original hash used "undefined" as correlativo.
 */
function buildBoardMemberIdForMatch(row: AuthorityRow): string {
  const uniqueKey = `undefined:${row.numero_documento}:${row.apellido_nombre}`
  return computeHash(uniqueKey)
}

// ---------------------------------------------------------------------------
// Batch runner with progress
// ---------------------------------------------------------------------------

async function runBatched(
  label: string,
  items: readonly Record<string, unknown>[],
  batchSize: number,
  cypher: string,
): Promise<{ errors: number; created: number }> {
  const batches = chunk(items, batchSize)
  let errors = 0
  let created = 0

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    try {
      await executeWrite(cypher, { batch })
      created += batch.length
      if ((i + 1) % 50 === 0 || i === batches.length - 1) {
        const pct = (((i + 1) / batches.length) * 100).toFixed(0)
        console.log(`  [${label}] ${i + 1}/${batches.length} batches (${pct}%) - ${created} items`)
      }
    } catch (error) {
      errors++
      const msg = error instanceof Error ? error.message : String(error)
      console.error(`  [${label}] batch ${i + 1} FAILED: ${msg.slice(0, 200)}`)
      // Continue with next batch
    }
  }

  return { errors, created }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('=== Load Remaining Companies ===\n')

  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Neo4j connected.\n')

  // Check current state
  const companyCount = await readQuery('MATCH (n:Company) RETURN count(n) AS c', {}, (r) => r.get('c').toNumber())
  const pubCompanyCount = await readQuery('MATCH (n:PublicCompany) RETURN count(n) AS c', {}, (r) => r.get('c').toNumber())
  const officerRelCount = await readQuery('MATCH ()-[r:OFFICER_OF_COMPANY]->() RETURN count(r) AS c', {}, (r) => r.get('c').toNumber())
  const boardRelCount = await readQuery('MATCH ()-[r:BOARD_MEMBER_OF]->() RETURN count(r) AS c', {}, (r) => r.get('c').toNumber())

  console.log('Current state:')
  console.log(`  Company:              ${companyCount.records[0]}`)
  console.log(`  PublicCompany:        ${pubCompanyCount.records[0]}`)
  console.log(`  OFFICER_OF_COMPANY:   ${officerRelCount.records[0]}`)
  console.log(`  BOARD_MEMBER_OF:      ${boardRelCount.records[0]}`)
  console.log()

  // ── Parse CSVs ────────────────────────────────────────────────────────
  console.log('Parsing entities CSV...')
  const parseStart = Date.now()
  const entitiesPath = findCsvFile('igj-entidades')
  const entities = await parseCsv<EntityRow>(entitiesPath)
  console.log(`  ${entities.length} entities parsed in ${formatDuration(Date.now() - parseStart)}`)

  console.log('Parsing authorities CSV...')
  const authStart = Date.now()
  const authoritiesPath = findCsvFile('igj-autoridades')
  const authorities = await parseCsv<AuthorityRow>(authoritiesPath)
  console.log(`  ${authorities.length} authorities parsed in ${formatDuration(Date.now() - authStart)}\n`)

  // ── Phase 1: Load Company nodes (opencorporates pipeline) ─────────────
  if (companyCount.records[0] === 0) {
    console.log('--- Phase 1: Loading Company nodes ---')
    const now = new Date().toISOString()
    const companyParams = entities.map((row) => ({
      igj_id: row.numero_correlativo,
      name: row.razon_social.trim(),
      company_type_code: row.tipo_societario,
      company_type: row.descripcion_tipo_societario.trim(),
      cuit: row.cuit.trim(),
      status: row.dada_de_baja.trim() ? 'inactive' : 'active',
      deregistration_code: row.codigo_baja.trim(),
      deregistration_detail: row.detalle_baja.trim(),
      source_url: 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia',
      submitted_by: 'etl:igj-opencorporates',
      tier: 'silver',
      confidence_score: 0.9,
      ingestion_hash: computeHash(`igj-entity:${row.numero_correlativo}`),
      created_at: now,
      updated_at: now,
    }))

    const start = Date.now()
    const result = await runBatched('Company', companyParams, COMPANY_BATCH_SIZE, `
      UNWIND $batch AS c
      MERGE (n:Company {igj_id: c.igj_id})
      ON CREATE SET
        n.name = c.name,
        n.company_type_code = c.company_type_code,
        n.company_type = c.company_type,
        n.cuit = c.cuit,
        n.status = c.status,
        n.deregistration_code = c.deregistration_code,
        n.deregistration_detail = c.deregistration_detail,
        n.source_url = c.source_url,
        n.submitted_by = c.submitted_by,
        n.tier = c.tier,
        n.confidence_score = c.confidence_score,
        n.ingestion_hash = c.ingestion_hash,
        n.created_at = c.created_at,
        n.updated_at = c.updated_at
    `)
    console.log(`  Company load: ${result.created} items, ${result.errors} errors in ${formatDuration(Date.now() - start)}\n`)
  } else {
    console.log(`--- Phase 1: Skipping Company nodes (${companyCount.records[0]} already exist) ---\n`)
  }

  // ── Phase 2: Load PublicCompany nodes (cnv-securities pipeline) ───────
  if (pubCompanyCount.records[0] === 0) {
    console.log('--- Phase 2: Loading PublicCompany nodes ---')
    const now = new Date().toISOString()
    const pubCompanyParams = entities.map((row) => ({
      igj_id: row.numero_correlativo,
      name: row.razon_social.trim(),
      company_type: row.descripcion_tipo_societario.trim(),
      company_type_code: row.tipo_societario.trim(),
      cuit: row.cuit.trim(),
      active: !row.dada_de_baja || row.dada_de_baja.trim() === '' ? true : false,
      source_url: 'https://datos.jus.gob.ar/dataset/entidades-constituidas-en-la-inspeccion-general-de-justicia-igj',
      submitted_by: 'etl:igj-securities',
      tier: 'silver',
      confidence_score: 0.9,
      ingestion_hash: computeHash(`igj-entity:${row.numero_correlativo}`),
      created_at: now,
      updated_at: now,
    }))

    const start = Date.now()
    const result = await runBatched('PublicCompany', pubCompanyParams, COMPANY_BATCH_SIZE, `
      UNWIND $batch AS c
      MERGE (n:PublicCompany {igj_id: c.igj_id})
      ON CREATE SET
        n.name = c.name,
        n.company_type = c.company_type,
        n.company_type_code = c.company_type_code,
        n.cuit = c.cuit,
        n.active = c.active,
        n.source_url = c.source_url,
        n.submitted_by = c.submitted_by,
        n.tier = c.tier,
        n.confidence_score = c.confidence_score,
        n.ingestion_hash = c.ingestion_hash,
        n.created_at = c.created_at,
        n.updated_at = c.updated_at
    `)
    console.log(`  PublicCompany load: ${result.created} items, ${result.errors} errors in ${formatDuration(Date.now() - start)}\n`)
  } else {
    console.log(`--- Phase 2: Skipping PublicCompany nodes (${pubCompanyCount.records[0]} already exist) ---\n`)
  }

  // ── Phase 3: Load OFFICER_OF_COMPANY relationships ───────────────────
  if (officerRelCount.records[0] === 0) {
    console.log('--- Phase 3: Loading OFFICER_OF_COMPANY relationships ---')
    const relParams = authorities.map((row) => ({
      officer_id: buildOfficerIdForMatch(row),
      company_igj_id: row.numero_correlativo,
      role: row.descripcion_tipo_administrador.trim(),
      role_code: row.tipo_administrador.trim(),
    }))

    const start = Date.now()
    const result = await runBatched('OFFICER_OF_COMPANY', relParams, REL_BATCH_SIZE, `
      UNWIND $batch AS r
      MATCH (o:CompanyOfficer {officer_id: r.officer_id})
      MATCH (c:Company {igj_id: r.company_igj_id})
      MERGE (o)-[rel:OFFICER_OF_COMPANY]->(c)
      ON CREATE SET rel.role = r.role, rel.role_code = r.role_code
    `)
    console.log(`  OFFICER_OF_COMPANY: ${result.created} items, ${result.errors} errors in ${formatDuration(Date.now() - start)}\n`)
  } else {
    console.log(`--- Phase 3: Skipping OFFICER_OF_COMPANY (${officerRelCount.records[0]} already exist) ---\n`)
  }

  // ── Phase 4: Load BOARD_MEMBER_OF relationships ──────────────────────
  if (boardRelCount.records[0] === 0) {
    console.log('--- Phase 4: Loading BOARD_MEMBER_OF relationships ---')
    // Build entity ID set for filtering
    const entityIds = new Set(entities.map((e) => e.numero_correlativo))

    // Build authority params with igj_authority_id matching what the original ETL stored
    // (BOM-broken: correlativo was "undefined" in the hash input)
    const boardRelParams = authorities
      .filter((row) => entityIds.has(row.numero_correlativo))
      .map((row) => ({
        authority_id: buildBoardMemberIdForMatch(row),
        company_igj_id: row.numero_correlativo,
        role_type: row.tipo_administrador.trim(),
        role_description: row.descripcion_tipo_administrador.trim(),
      }))

    const start = Date.now()
    const result = await runBatched('BOARD_MEMBER_OF', boardRelParams, REL_BATCH_SIZE, `
      UNWIND $batch AS r
      MATCH (b:BoardMember {igj_authority_id: r.authority_id})
      MATCH (c:PublicCompany {igj_id: r.company_igj_id})
      MERGE (b)-[rel:BOARD_MEMBER_OF]->(c)
      ON CREATE SET rel.role_type = r.role_type, rel.role_description = r.role_description
    `)
    console.log(`  BOARD_MEMBER_OF: ${result.created} items, ${result.errors} errors in ${formatDuration(Date.now() - start)}\n`)
  } else {
    console.log(`--- Phase 4: Skipping BOARD_MEMBER_OF (${boardRelCount.records[0]} already exist) ---\n`)
  }

  // ── Final counts ─────────────────────────────────────────────────────
  console.log('--- Final counts ---')
  const finalCompany = await readQuery('MATCH (n:Company) RETURN count(n) AS c', {}, (r) => r.get('c').toNumber())
  const finalPub = await readQuery('MATCH (n:PublicCompany) RETURN count(n) AS c', {}, (r) => r.get('c').toNumber())
  const finalOfficerRel = await readQuery('MATCH ()-[r:OFFICER_OF_COMPANY]->() RETURN count(r) AS c', {}, (r) => r.get('c').toNumber())
  const finalBoardRel = await readQuery('MATCH ()-[r:BOARD_MEMBER_OF]->() RETURN count(r) AS c', {}, (r) => r.get('c').toNumber())

  console.log(`  Company:              ${finalCompany.records[0]}`)
  console.log(`  PublicCompany:        ${finalPub.records[0]}`)
  console.log(`  OFFICER_OF_COMPANY:   ${finalOfficerRel.records[0]}`)
  console.log(`  BOARD_MEMBER_OF:      ${finalBoardRel.records[0]}`)

  await closeDriver()
  console.log('\nDone.')
}

main().catch((error) => {
  console.error('Load failed:', error)
  closeDriver().finally(() => process.exit(1))
})
