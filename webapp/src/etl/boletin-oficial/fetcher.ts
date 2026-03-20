/**
 * Fetches Boletin Oficial data from datos.gob.ar open data portal.
 *
 * Downloads:
 * 1. Estructura Organica y Autoridades del PEN (pipe-delimited CSV)
 * 2. Contrataciones Electronicas adjudicaciones (comma-delimited CSV)
 *
 * @see https://datos.gob.ar/dataset/jgm-estructura-organica-autoridades-poder-ejecutivo-nacional
 * @see https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { parse } from 'csv-parse'

import type { AuthorityRow, AwardRow } from './types'

// ---------------------------------------------------------------------------
// Data source URLs
// ---------------------------------------------------------------------------

/** Pipe-delimited CSV — Estructura Organica y Autoridades del PEN (2019-12-09 snapshot) */
const AUTHORITIES_URL =
  'http://infra.datos.gob.ar/catalog/jgm/dataset/2/distribution/2.1/download/estructura-20191209.csv'

/** Comma-delimited CSV — Adjudicaciones (procurement awards) by year */
const AWARD_URLS: Record<string, string> = {
  '2020': 'https://infra.datos.gob.ar/catalog/jgm/dataset/4/distribution/4.20/download/adjudicaciones-2020.csv',
  '2019': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.18/download/adjudicaciones-2019.csv',
  '2018': 'https://infra.datos.gob.ar/catalog/modernizacion/dataset/2/distribution/2.15/download/adjudicaciones-2018.csv',
}

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'boletin-oficial')

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
// CSV parsing helpers
// ---------------------------------------------------------------------------

async function parseAuthoritesCsv<T>(filePath: string): Promise<T[]> {
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

export interface FetchBoletinResult {
  readonly authorities: readonly AuthorityRow[]
  readonly awards: readonly AwardRow[]
  readonly stats: {
    readonly totalAuthorities: number
    readonly authoritiesWithNames: number
    readonly totalAwards: number
    readonly awardYears: readonly string[]
  }
}

/**
 * Download and parse Boletin Oficial datasets.
 *
 * Filters:
 * - Authorities: only rows with non-empty autoridad_nombre + autoridad_apellido
 * - Awards: all rows from available years
 */
export async function fetchBoletinData(): Promise<FetchBoletinResult> {
  await mkdir(DATA_DIR, { recursive: true })

  // --- Authorities ---
  const authPath = join(DATA_DIR, 'estructura-20191209.csv')
  await downloadFile(AUTHORITIES_URL, authPath)

  console.log('  Parsing authorities CSV...')
  const allAuthorities = await parseAuthoritesCsv<AuthorityRow>(authPath)
  const namedAuthorities = allAuthorities.filter(
    (a) =>
      (a.autoridad_nombre && a.autoridad_nombre.trim() !== '') ||
      (a.autoridad_apellido && a.autoridad_apellido.trim() !== ''),
  )
  console.log(
    `  Authorities with names: ${namedAuthorities.length} / ${allAuthorities.length} total rows`,
  )

  // --- Awards ---
  const allAwards: AwardRow[] = []
  const loadedYears: string[] = []

  for (const [year, url] of Object.entries(AWARD_URLS)) {
    const awardPath = join(DATA_DIR, `adjudicaciones-${year}.csv`)
    try {
      await downloadFile(url, awardPath)
      console.log(`  Parsing adjudicaciones ${year}...`)
      const yearAwards = await parseCommaCsv<AwardRow>(awardPath)
      console.log(`  Awards ${year}: ${yearAwards.length} rows`)
      allAwards.push(...yearAwards)
      loadedYears.push(year)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      console.warn(`  Warning: failed to load awards ${year}: ${msg}`)
    }
  }

  return {
    authorities: namedAuthorities,
    awards: allAwards,
    stats: {
      totalAuthorities: allAuthorities.length,
      authoritiesWithNames: namedAuthorities.length,
      totalAwards: allAwards.length,
      awardYears: loadedYears,
    },
  }
}
