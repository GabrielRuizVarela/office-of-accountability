/**
 * Fetches Compr.ar adjudicaciones CSVs from datos.gob.ar open data portal.
 *
 * Handles three different CSV schemas across 2015-2020 and normalizes
 * them all into AdjudicacionRow.
 *
 * @see https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type { AdjudicacionRow } from './types'

// ---------------------------------------------------------------------------
// Data source URLs -- Adjudicaciones by year
// ---------------------------------------------------------------------------

const ADJUDICACIONES_URLS: Record<string, string> = {
  '2020': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.20/download/adjudicaciones-2020.csv',
  '2019': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.18/download/adjudicaciones-2019.csv',
  '2018': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.15/download/adjudicaciones-2018.csv',
  '2017': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.2/download/adjudicaciones-2017.csv',
  '2016': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.6/download/adjudicaciones-2016.csv',
  '2015': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.10/download/adjudicaciones-2015.csv',
}

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'comprar-adjudicaciones')

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

async function downloadFile(url: string, destPath: string): Promise<void> {
  if (existsSync(destPath)) {
    console.log(`  Already downloaded: ${destPath}`)
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log(`  Downloading ${url}...`)

  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log(`  Saved to ${destPath}`)
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

async function parseCsv(filePath: string): Promise<Record<string, string>[]> {
  const records: Record<string, string>[] = []
  const parser = createReadStream(filePath, { encoding: 'utf-8' }).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      delimiter: ',',
      quote: '"',
      bom: true,
    }),
  )
  for await (const record of parser) {
    records.push(record as Record<string, string>)
  }
  return records
}

// ---------------------------------------------------------------------------
// Schema normalization -- three different CSV schemas to one AdjudicacionRow
// ---------------------------------------------------------------------------

/**
 * 2020 schema: Spanish headers with spaces
 *   Número Procedimiento, Descripcion SAF, Unidad Ejecutora,
 *   Tipo de Procedimiento, Modalidad, Ejercicio, Fecha de Adjudicación,
 *   Rubros, CUIT, Descripción Proveedor, Documento Contractual,
 *   Monto, Moneda
 */
function normalize2020(row: Record<string, string>): AdjudicacionRow {
  return {
    numero_procedimiento: (row['Número Procedimiento'] ?? '').trim(),
    ejercicio: (row['Ejercicio'] ?? '').trim(),
    tipo_procedimiento: (row['Tipo de Procedimiento'] ?? '').trim(),
    modalidad: (row['Modalidad'] ?? '').trim(),
    organismo: (row['Descripcion SAF'] ?? '').trim(),
    unidad_ejecutora: (row['Unidad Ejecutora'] ?? '').trim(),
    rubros: (row['Rubros'] ?? '').trim(),
    cuit: (row['CUIT'] ?? '').trim(),
    proveedor: (row['Descripción Proveedor'] ?? '').trim(),
    documento_contractual: (row['Documento Contractual'] ?? '').trim(),
    monto: (row['Monto'] ?? '').trim(),
    moneda: (row['Moneda'] ?? '').trim(),
    fecha_adjudicacion: (row['Fecha de Adjudicación'] ?? row['Fecha de Adjudicacion'] ?? '').trim(),
  }
}

/**
 * 2017-2019 schema: snake_case headers
 *   numero_procedimiento, descripcion_saf / descripcion_SAF,
 *   unidad_ejecutora, tipo_de_procedimiento, modalidad,
 *   ejercicio, fecha_de_adjudicacion, rubros, cuit,
 *   descripcion_proveedor, documento_contractual, monto, moneda
 */
function normalizeSnakeCase(row: Record<string, string>): AdjudicacionRow {
  return {
    numero_procedimiento: (row['numero_procedimiento'] ?? '').trim(),
    ejercicio: (row['ejercicio'] ?? '').trim(),
    tipo_procedimiento: (row['tipo_de_procedimiento'] ?? '').trim(),
    modalidad: (row['modalidad'] ?? '').trim(),
    organismo: (row['descripcion_SAF'] ?? row['descripcion_saf'] ?? '').trim(),
    unidad_ejecutora: (row['unidad_ejecutora'] ?? '').trim(),
    rubros: (row['rubros'] ?? '').trim(),
    cuit: (row['cuit'] ?? '').trim(),
    proveedor: (row['descripcion_proveedor'] ?? '').trim(),
    documento_contractual: (row['documento_contractual'] ?? '').trim(),
    monto: (row['monto'] ?? '').trim(),
    moneda: (row['moneda'] ?? '').trim(),
    fecha_adjudicacion: (row['fecha_de_adjudicacion'] ?? '').trim(),
  }
}

/**
 * 2015 legacy schema: 12 columns
 *   procedimiento_id, uoc_id, uoc_int_id, uoc_desc, uoc_int_desc,
 *   proc_ejercicio, isodatetime_fecha_acto, fecha_acto,
 *   rubro_contratacion_desc, cuit, prov_razon_social, monto_adjudicacion
 */
function normalize2015(row: Record<string, string>): AdjudicacionRow {
  return {
    numero_procedimiento: (row['procedimiento_id'] ?? '').trim(),
    ejercicio: (row['proc_ejercicio'] ?? '').trim(),
    tipo_procedimiento: '',
    modalidad: '',
    organismo: (row['uoc_desc'] ?? '').trim(),
    unidad_ejecutora: (row['uoc_int_desc'] ?? '').trim(),
    rubros: (row['rubro_contratacion_desc'] ?? '').trim(),
    cuit: (row['cuit'] ?? '').trim(),
    proveedor: (row['prov_razon_social'] ?? '').trim(),
    documento_contractual: '',
    monto: (row['monto_adjudicacion'] ?? '').trim(),
    moneda: 'Peso Argentino', // legacy data is all ARS
    fecha_adjudicacion: (row['fecha_acto'] ?? row['isodatetime_fecha_acto'] ?? '').trim(),
  }
}

/**
 * Detect schema from column names and return the appropriate normalizer.
 */
function detectNormalizer(
  columns: string[],
): (row: Record<string, string>) => AdjudicacionRow {
  // 2020 schema: Spanish with spaces
  if (columns.includes('Número Procedimiento')) return normalize2020
  // 2015 legacy schema
  if (columns.includes('procedimiento_id')) return normalize2015
  // 2017-2019 snake_case
  if (columns.includes('numero_procedimiento')) return normalizeSnakeCase

  throw new Error(`Unknown CSV schema. Columns: ${columns.slice(0, 5).join(', ')}`)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchAdjudicacionesResult {
  readonly rows: readonly AdjudicacionRow[]
  readonly stats: {
    readonly totalRows: number
    readonly years: readonly string[]
    readonly rowsByYear: Record<string, number>
  }
}

/**
 * Download, parse and normalize adjudicaciones CSVs for all available years.
 */
export async function fetchAdjudicacionesData(): Promise<FetchAdjudicacionesResult> {
  await mkdir(DATA_DIR, { recursive: true })

  const allRows: AdjudicacionRow[] = []
  const loadedYears: string[] = []
  const rowsByYear: Record<string, number> = {}

  for (const [year, url] of Object.entries(ADJUDICACIONES_URLS)) {
    const csvPath = join(DATA_DIR, `adjudicaciones-${year}.csv`)
    try {
      await downloadFile(url, csvPath)
      console.log(`  Parsing adjudicaciones ${year}...`)

      const rawRows = await parseCsv(csvPath)
      if (rawRows.length === 0) {
        console.warn(`  Warning: empty CSV for ${year}`)
        continue
      }

      // Detect schema from first row's keys
      const columns = Object.keys(rawRows[0]!)
      const normalize = detectNormalizer(columns)

      const yearRows = rawRows.map(normalize)
      console.log(`  Adjudicaciones ${year}: ${yearRows.length} rows`)
      allRows.push(...yearRows)
      loadedYears.push(year)
      rowsByYear[year] = yearRows.length
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`  Warning: failed to load adjudicaciones ${year}: ${msg}`)
    }
  }

  return {
    rows: allRows,
    stats: {
      totalRows: allRows.length,
      years: loadedYears,
      rowsByYear,
    },
  }
}
