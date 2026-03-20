/**
 * Fetches IGJ corporate registry data from datos.gob.ar.
 *
 * Downloads the latest semester ZIP containing entity and authority CSVs,
 * extracts and parses them.
 *
 * Data source: https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia
 * License: Creative Commons Attribution 4.0
 *
 * @see https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia
 */

import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
import { parse } from 'csv-parse'

import type { EntityRow, AuthorityRow } from './types'

// ---------------------------------------------------------------------------
// Data source URLs
// ---------------------------------------------------------------------------

/**
 * Latest semester ZIP from IGJ open data.
 * Contains: igj-entidades-*.csv, igj-autoridades-*.csv, igj-domicilios-*.csv,
 *           igj-balances-*.csv, igj-asambleas-*.csv
 */
const DOWNLOAD_URL =
  'https://datos.jus.gob.ar/dataset/da045e06-35cb-4bdd-9b5e-ddee6712c86c/resource/101ebb5b-bbb6-43b9-8929-27ab620443d5/download/igj-2026-semestre-1.zip'

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'igj')
const ZIP_PATH = join(DATA_DIR, 'igj.zip')

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------

async function parseCsv<T>(filePath: string): Promise<T[]> {
  const records: T[] = []
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_column_count: true }),
  )
  for await (const record of parser) {
    records.push(record as T)
  }
  return records
}

/**
 * Find a file in the data directory matching a glob-like prefix.
 * IGJ ZIPs contain files like igj-entidades-20260209.csv
 */
function findCsvFile(prefix: string): string {
  const files = readdirSync(DATA_DIR)
  const match = files.find((f) => f.startsWith(prefix) && f.endsWith('.csv'))
  if (!match) {
    throw new Error(`No CSV file found with prefix "${prefix}" in ${DATA_DIR}`)
  }
  return join(DATA_DIR, match)
}

// ---------------------------------------------------------------------------
// Download & extract
// ---------------------------------------------------------------------------

async function downloadZip(): Promise<void> {
  if (existsSync(ZIP_PATH)) {
    console.log('  ZIP already downloaded, skipping...')
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log('  Downloading IGJ data...')

  const response = await fetch(DOWNLOAD_URL)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download IGJ data: ${response.status} ${response.statusText}`)
  }

  const fileStream = createWriteStream(ZIP_PATH)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log('  Download complete.')
}

function extractZip(): void {
  // Check if any entidades CSV already exists
  const files = readdirSync(DATA_DIR)
  if (files.some((f) => f.startsWith('igj-entidades') && f.endsWith('.csv'))) {
    console.log('  CSVs already extracted, skipping...')
    return
  }

  console.log('  Extracting CSVs...')
  execFileSync('unzip', ['-o', ZIP_PATH, '-d', DATA_DIR], { stdio: 'pipe' })
  console.log('  Extraction complete.')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchIgjResult {
  readonly entities: readonly EntityRow[]
  readonly authorities: readonly AuthorityRow[]
  readonly stats: {
    readonly totalEntities: number
    readonly totalAuthorities: number
  }
}

/**
 * Download, extract, and parse IGJ entity + authority data.
 */
export async function fetchIgjData(): Promise<FetchIgjResult> {
  await downloadZip()
  extractZip()

  console.log('  Parsing entities...')
  const entitiesPath = findCsvFile('igj-entidades')
  const entities = await parseCsv<EntityRow>(entitiesPath)
  console.log(`  Entities: ${entities.length}`)

  console.log('  Parsing authorities...')
  const authoritiesPath = findCsvFile('igj-autoridades')
  const authorities = await parseCsv<AuthorityRow>(authoritiesPath)
  console.log(`  Authorities: ${authorities.length}`)

  return {
    entities,
    authorities,
    stats: {
      totalEntities: entities.length,
      totalAuthorities: authorities.length,
    },
  }
}
