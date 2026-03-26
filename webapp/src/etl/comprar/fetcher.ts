/**
 * Fetches Compr.ar ordenes de compra CSVs from datos.gob.ar open data portal.
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

import type { ComprarOcRow } from './types'

// ---------------------------------------------------------------------------
// Data source URLs - Ordenes de Compra by year
// ---------------------------------------------------------------------------

const OC_URLS: Record<string, string> = {
  '2024': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.28/download/ordenes-compra-2024.csv',
  '2023': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.26/download/ordenes-compra-2023.csv',
  '2022': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.24/download/ordenes-compra-2022.csv',
  '2021': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.22/download/ordenes-compra-2021.csv',
}

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'comprar')

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

export interface FetchComprarResult {
  readonly orders: readonly ComprarOcRow[]
  readonly stats: {
    readonly totalOrders: number
    readonly orderYears: readonly string[]
  }
}

/**
 * Download and parse Compr.ar ordenes de compra datasets.
 */
export async function fetchComprarData(): Promise<FetchComprarResult> {
  await mkdir(DATA_DIR, { recursive: true })

  const allOrders: ComprarOcRow[] = []
  const loadedYears: string[] = []

  for (const [year, url] of Object.entries(OC_URLS)) {
    const ocPath = join(DATA_DIR, `ordenes-compra-${year}.csv`)
    try {
      await downloadFile(url, ocPath)
      console.log(`  Parsing ordenes de compra ${year}...`)
      const yearOrders = await parseCommaCsv<ComprarOcRow>(ocPath)
      console.log(`  Orders ${year}: ${yearOrders.length} rows`)
      allOrders.push(...yearOrders)
      loadedYears.push(year)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`  Warning: failed to load orders ${year}: ${msg}`)
    }
  }

  return {
    orders: allOrders,
    stats: {
      totalOrders: allOrders.length,
      orderYears: loadedYears,
    },
  }
}
