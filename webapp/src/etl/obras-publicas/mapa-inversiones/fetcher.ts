/**
 * Fetches MapaInversiones CSV from obraspublicas.gob.ar.
 *
 * Downloads the dataset_mop.csv and parses it into typed rows.
 *
 * @see https://mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type { MapaRow } from './types'

// ---------------------------------------------------------------------------
// Data source URL
// ---------------------------------------------------------------------------

const CSV_URL =
  'https://mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv'

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'mapa-inversiones')

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

export interface FetchMapaResult {
  readonly works: readonly MapaRow[]
  readonly count: number
}

/**
 * Download and parse MapaInversiones dataset.
 */
export async function fetchMapaData(): Promise<FetchMapaResult> {
  await mkdir(DATA_DIR, { recursive: true })

  const csvPath = join(DATA_DIR, 'dataset_mop.csv')
  await downloadFile(CSV_URL, csvPath)
  console.log('  Parsing dataset_mop.csv...')
  const works = await parseCommaCsv<MapaRow>(csvPath)
  console.log(`  Works: ${works.length} rows`)

  return { works, count: works.length }
}
