/**
 * Fetches CONTRAT.AR CSVs from datos.gob.ar open data portal.
 *
 * Downloads 5 key datasets: procedimientos, ofertas, contratos, obras,
 * ubicacion-geografica.
 *
 * @see https://datos.gob.ar/dataset/jgm-contrataciones-obra-publica
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type {
  ProcedimientoRow,
  OfertaRow,
  ContratoRow,
  ObraRow,
  UbicacionRow,
} from './types'

// ---------------------------------------------------------------------------
// Data source URLs — CONTRAT.AR distributions
// ---------------------------------------------------------------------------

const CSV_URLS = {
  procedimientos:
    'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.1/download/onc-contratar-procedimientos.csv',
  ofertas:
    'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.3/download/onc-contratar-ofertas.csv',
  contratos:
    'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.4/download/onc-contratar-contratos.csv',
  obras:
    'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.5/download/onc-contratar-obras.csv',
  ubicaciones:
    'https://infra.datos.gob.ar/catalog/jgm/dataset/30/distribution/30.6/download/onc-contratar-ubicacion-geografica.csv',
} as const

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'contratar')

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
// CSV parsing helper
// ---------------------------------------------------------------------------

async function parseCommaCsv<T>(filePath: string): Promise<T[]> {
  const records: T[] = []
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
    records.push(record as T)
  }
  return records
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchContratarResult {
  readonly procedimientos: readonly ProcedimientoRow[]
  readonly ofertas: readonly OfertaRow[]
  readonly contratos: readonly ContratoRow[]
  readonly obras: readonly ObraRow[]
  readonly ubicaciones: readonly UbicacionRow[]
  readonly stats: {
    readonly totalProcedimientos: number
    readonly totalOfertas: number
    readonly totalContratos: number
    readonly totalObras: number
    readonly totalUbicaciones: number
  }
}

/**
 * Download and parse CONTRAT.AR datasets.
 */
export async function fetchContratarData(): Promise<FetchContratarResult> {
  await mkdir(DATA_DIR, { recursive: true })

  // --- Procedimientos ---
  const procPath = join(DATA_DIR, 'onc-contratar-procedimientos.csv')
  await downloadFile(CSV_URLS.procedimientos, procPath)
  console.log('  Parsing procedimientos...')
  const procedimientos = await parseCommaCsv<ProcedimientoRow>(procPath)
  console.log(`  Procedimientos: ${procedimientos.length} rows`)

  // --- Ofertas ---
  const ofertasPath = join(DATA_DIR, 'onc-contratar-ofertas.csv')
  await downloadFile(CSV_URLS.ofertas, ofertasPath)
  console.log('  Parsing ofertas...')
  const ofertas = await parseCommaCsv<OfertaRow>(ofertasPath)
  console.log(`  Ofertas: ${ofertas.length} rows`)

  // --- Contratos ---
  const contratosPath = join(DATA_DIR, 'onc-contratar-contratos.csv')
  await downloadFile(CSV_URLS.contratos, contratosPath)
  console.log('  Parsing contratos...')
  const contratos = await parseCommaCsv<ContratoRow>(contratosPath)
  console.log(`  Contratos: ${contratos.length} rows`)

  // --- Obras ---
  const obrasPath = join(DATA_DIR, 'onc-contratar-obras.csv')
  await downloadFile(CSV_URLS.obras, obrasPath)
  console.log('  Parsing obras...')
  const obras = await parseCommaCsv<ObraRow>(obrasPath)
  console.log(`  Obras: ${obras.length} rows`)

  // --- Ubicaciones ---
  const ubicacionesPath = join(DATA_DIR, 'onc-contratar-ubicacion-geografica.csv')
  await downloadFile(CSV_URLS.ubicaciones, ubicacionesPath)
  console.log('  Parsing ubicaciones...')
  const ubicaciones = await parseCommaCsv<UbicacionRow>(ubicacionesPath)
  console.log(`  Ubicaciones: ${ubicaciones.length} rows`)

  return {
    procedimientos,
    ofertas,
    contratos,
    obras,
    ubicaciones,
    stats: {
      totalProcedimientos: procedimientos.length,
      totalOfertas: ofertas.length,
      totalContratos: contratos.length,
      totalObras: obras.length,
      totalUbicaciones: ubicaciones.length,
    },
  }
}
