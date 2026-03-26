/**
 * Fetches DDJJ Patrimoniales consolidated declarations from datos.jus.gob.ar.
 *
 * Strategy: Download the 2023 cumulative ZIP (contains 2012-2023 consolidado
 * CSVs with consistent column headers) + the 2024 direct CSV.
 *
 * @see https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales
 */

import { createReadStream, existsSync, readdirSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
import { parse } from 'csv-parse'

import type { DdjjRow } from './types'

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'ddjj')

// ---------------------------------------------------------------------------
// Download URLs
// ---------------------------------------------------------------------------

/** Direct CSV for 2024 (latest year, not yet in cumulative ZIP) */
const CSV_2024_URL =
  'https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/a331ccb8-5c13-447f-9bd6-d8018a4b8a62/download/declaraciones-juradas-2024-consolidado-al-20251222.csv'

/** Cumulative ZIP for 2023 - contains consolidado CSVs for 2012-2023 */
const ZIP_2023_URL =
  'https://datos.jus.gob.ar/dataset/4680199f-6234-4262-8a2a-8f7993bf784d/resource/15b9566d-f5b6-4bd1-a60b-fa9040fc0c2b/download/declaraciones-juradas-2023.zip'

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------

async function parseCsv(filePath: string): Promise<DdjjRow[]> {
  const records: DdjjRow[] = []
  const parser = createReadStream(filePath, { encoding: 'utf-8' }).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      bom: true,
    }),
  )
  for await (const record of parser) {
    records.push(record as DdjjRow)
  }
  return records
}

// ---------------------------------------------------------------------------
// Download helpers
// ---------------------------------------------------------------------------

async function downloadFile(url: string, destPath: string): Promise<void> {
  if (existsSync(destPath)) {
    console.log(`    Already downloaded: ${destPath}`)
    return
  }

  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText} - ${url}`)
  }

  const fileStream = createWriteStream(destPath)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchDdjjResult {
  readonly rows: readonly DdjjRow[]
  readonly stats: {
    readonly rowsByYear: Record<string, number>
    readonly totalRows: number
    readonly yearsProcessed: string[]
  }
}

/**
 * Download and parse consolidated DDJJ declaration CSVs.
 *
 * Uses the 2023 cumulative ZIP for years 2012-2023, plus the 2024 direct CSV.
 * All CSVs in the 2023 ZIP use the modern column format (funcionario_apellido_nombre, etc.).
 */
export async function fetchDdjjData(): Promise<FetchDdjjResult> {
  await mkdir(DATA_DIR, { recursive: true })

  const allRows: DdjjRow[] = []
  const rowsByYear: Record<string, number> = {}
  const yearsProcessed: string[] = []

  // -- Step 1: Download and extract 2023 cumulative ZIP (2012-2023) ---------
  const zipPath = join(DATA_DIR, 'ddjj-2023.zip')
  const extractDir = join(DATA_DIR, 'ddjj-2023')

  console.log('  Downloading 2023 cumulative ZIP (2012-2023)...')
  await downloadFile(ZIP_2023_URL, zipPath)

  if (!existsSync(extractDir)) {
    await mkdir(extractDir, { recursive: true })
    console.log('  Extracting...')
    execFileSync('unzip', ['-o', zipPath, '-d', extractDir], { stdio: 'pipe' })
  } else {
    console.log('    Already extracted.')
  }

  // Find all consolidado CSVs (exclude bienes/deudas/grupo-familiar)
  const files = readdirSync(extractDir)
    .filter((f) => f.includes('consolidado') && !f.includes('bienes') && !f.includes('deudas') && !f.includes('familiar'))
    .sort()

  for (const file of files) {
    const yearMatch = file.match(/(\d{4})-consolidado/)
    if (!yearMatch) continue
    const year = yearMatch[1]

    console.log(`  Parsing ${year}...`)
    try {
      const rows = await parseCsv(join(extractDir, file))
      console.log(`    ${year}: ${rows.length} rows`)
      allRows.push(...rows)
      rowsByYear[year] = rows.length
      yearsProcessed.push(year)
    } catch (error) {
      console.warn(`  WARNING: Failed to parse ${year}: ${error instanceof Error ? error.message : error}`)
    }
  }

  // -- Step 2: Download and parse 2024 direct CSV ---------------------------
  console.log('  Downloading 2024 CSV...')
  const csv2024Path = join(DATA_DIR, 'ddjj-2024-consolidado.csv')
  try {
    await downloadFile(CSV_2024_URL, csv2024Path)
    console.log('  Parsing 2024...')
    const rows = await parseCsv(csv2024Path)
    console.log(`    2024: ${rows.length} rows`)
    allRows.push(...rows)
    rowsByYear['2024'] = rows.length
    yearsProcessed.push('2024')
  } catch (error) {
    console.warn(`  WARNING: Failed to process 2024: ${error instanceof Error ? error.message : error}`)
  }

  return {
    rows: allRows,
    stats: {
      rowsByYear,
      totalRows: allRows.length,
      yearsProcessed: yearsProcessed.sort(),
    },
  }
}
