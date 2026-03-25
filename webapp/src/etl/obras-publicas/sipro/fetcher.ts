/**
 * Fetches SIPRO (Sistema de Informacion de Proveedores) CSV from datos.gob.ar.
 *
 * @see https://datos.gob.ar/dataset/modernizacion-sistema-informacion-proveedores-sipro
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type { SiproRow } from './types'

// ---------------------------------------------------------------------------
// Data source
// ---------------------------------------------------------------------------

const SIPRO_URL =
  'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.11/download/proveedores.csv'

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'sipro')

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

export interface FetchSiproResult {
  readonly suppliers: readonly SiproRow[]
  readonly count: number
}

/**
 * Download and parse the SIPRO proveedores dataset.
 */
export async function fetchSiproData(): Promise<FetchSiproResult> {
  await mkdir(DATA_DIR, { recursive: true })

  const csvPath = join(DATA_DIR, 'proveedores.csv')

  try {
    await downloadFile(SIPRO_URL, csvPath)
    console.log('  Parsing SIPRO proveedores...')
    const suppliers = await parseCommaCsv<SiproRow>(csvPath)
    console.log(`  SIPRO suppliers: ${suppliers.length} rows`)

    return { suppliers, count: suppliers.length }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to fetch SIPRO data: ${msg}`)
  }
}
