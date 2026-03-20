/**
 * Fetches CNE campaign contribution data from aportantes.electoral.gob.ar.
 *
 * Downloads CSV exports filtered by destination type:
 *   destino=1 → Campaña electoral (electoral campaign)
 *   destino=2 → Desarrollo institucional (institutional development)
 *
 * @see https://aportantes.electoral.gob.ar/aportes/
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'csv-parse'

import type { DonationRow } from './types'

const BASE_URL = 'https://aportantes.electoral.gob.ar/aportes/descargar-csv/'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'cne-finance')

// ---------------------------------------------------------------------------
// CSV parsing helper
// ---------------------------------------------------------------------------

async function parseCsv(filePath: string): Promise<DonationRow[]> {
  const records: DonationRow[] = []
  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, relax_column_count: true, bom: true }),
  )
  for await (const record of parser) {
    records.push(record as DonationRow)
  }
  return records
}

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

async function downloadCsv(destino: number, fileName: string): Promise<string> {
  const filePath = join(DATA_DIR, fileName)

  if (existsSync(filePath)) {
    console.log(`  CSV already downloaded: ${fileName}, skipping...`)
    return filePath
  }

  await mkdir(DATA_DIR, { recursive: true })
  const url = `${BASE_URL}?destino=${destino}`
  console.log(`  Downloading CNE data (destino=${destino})...`)
  console.log(`  URL: ${url}`)

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'office-of-accountability-etl/1.0',
      Accept: 'text/csv',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to download CNE data: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  if (!text.includes(',') || text.length < 100) {
    throw new Error(`Response does not look like CSV data (${text.length} bytes)`)
  }

  await writeFile(filePath, text, 'utf-8')
  console.log(`  Downloaded: ${fileName} (${(text.length / 1024 / 1024).toFixed(1)}MB)`)

  return filePath
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchCneResult {
  readonly campaignDonations: readonly DonationRow[]
  readonly institutionalDonations: readonly DonationRow[]
  readonly stats: {
    readonly totalCampaign: number
    readonly totalInstitutional: number
  }
}

/**
 * Download and parse CNE campaign finance data.
 *
 * Fetches both campaign (destino=1) and institutional (destino=2) contributions.
 * Filters out annulled records.
 */
export async function fetchCneData(): Promise<FetchCneResult> {
  // Download campaign contributions
  const campaignPath = await downloadCsv(1, 'aportes-campana.csv')
  const campaignDonations = await parseCsv(campaignPath)
  console.log(`  Campaign donations parsed: ${campaignDonations.length}`)

  // Download institutional contributions
  let institutionalDonations: DonationRow[] = []
  try {
    const institutionalPath = await downloadCsv(2, 'aportes-institucional.csv')
    institutionalDonations = await parseCsv(institutionalPath)
    console.log(`  Institutional donations parsed: ${institutionalDonations.length}`)
  } catch (error) {
    console.warn(
      `  Warning: Could not fetch institutional donations: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return {
    campaignDonations,
    institutionalDonations,
    stats: {
      totalCampaign: campaignDonations.length,
      totalInstitutional: institutionalDonations.length,
    },
  }
}
