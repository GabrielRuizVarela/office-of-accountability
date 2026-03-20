/**
 * Fetches Argentine federal judiciary designation data.
 *
 * Downloads the CSV from datos.jus.gob.ar, parses it with BOM handling.
 *
 * @see https://datos.jus.gob.ar/dataset/designaciones-de-magistrados-de-la-justicia-federal-y-la-justicia-nacional
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type { DesignationRow } from './types'

const DOWNLOAD_URL =
  'https://datos.jus.gob.ar/dataset/9f397011-5459-4f1c-b88e-9f48f7824e03/resource/d4fd21f4-f5c5-48f5-a12d-511981f997dc/download/magistrados-justicia-federal-nacional-designaciones-20250310.csv'

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'judiciary')
const CSV_PATH = join(DATA_DIR, 'designaciones-magistrados.csv')

// ---------------------------------------------------------------------------
// CSV parsing helper (with BOM handling)
// ---------------------------------------------------------------------------

async function parseCsv<T>(filePath: string): Promise<T[]> {
  const records: T[] = []
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    }),
  )
  for await (const record of parser) {
    records.push(record as T)
  }
  return records
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

async function downloadCsv(): Promise<void> {
  if (existsSync(CSV_PATH)) {
    console.log('  CSV already downloaded, skipping...')
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log('  Downloading judiciary designations CSV...')

  const response = await fetch(DOWNLOAD_URL)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download judiciary data: ${response.status} ${response.statusText}`)
  }

  const fileStream = createWriteStream(CSV_PATH)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log('  Download complete.')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchJudiciaryResult {
  readonly rows: readonly DesignationRow[]
  readonly stats: {
    readonly totalRows: number
  }
}

/**
 * Download and parse the judiciary designations CSV.
 */
export async function fetchJudiciaryData(): Promise<FetchJudiciaryResult> {
  await downloadCsv()

  console.log('  Parsing designations CSV...')
  const rows = await parseCsv<DesignationRow>(CSV_PATH)
  console.log(`  Total designation rows: ${rows.length}`)

  return {
    rows,
    stats: {
      totalRows: rows.length,
    },
  }
}
