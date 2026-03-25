/**
 * Fetches World Bank major contract awards from the Socrata API.
 *
 * Paginates through the full Argentina dataset using $offset/$limit.
 * Saves raw JSON to _ingestion_data/multilateral/ for reproducibility.
 *
 * @see https://finances.worldbank.org/resource/kdui-wcs3.json
 */

import { existsSync } from 'node:fs'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { WBContractRow } from './types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WB_API_BASE =
  'https://finances.worldbank.org/resource/kdui-wcs3.json'
const PAGE_SIZE = 5000
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'multilateral')
const WB_CACHE_FILE = join(DATA_DIR, 'wb-contracts-argentina.json')

// IDB sanctions list (best-effort — HTML scrape, may fail)
const IDB_SANCTIONS_URL =
  'https://www.iadb.org/en/transparency/sanctioned-firms-individuals'
const IDB_CACHE_FILE = join(DATA_DIR, 'idb-sanctions.html')

// ---------------------------------------------------------------------------
// World Bank Socrata fetcher with pagination
// ---------------------------------------------------------------------------

async function fetchAllPages(): Promise<WBContractRow[]> {
  const allRows: WBContractRow[] = []
  let offset = 0

  console.log('  Fetching World Bank contracts for Argentina...')

  while (true) {
    const url = `${WB_API_BASE}?$where=borrower_country='Argentina'&$limit=${PAGE_SIZE}&$offset=${offset}`
    console.log(`  Page at offset ${offset}...`)

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(
        `WB API error: ${response.status} ${response.statusText} (offset=${offset})`,
      )
    }

    const page: WBContractRow[] = await response.json()
    if (page.length === 0) break

    allRows.push(...page)
    console.log(`  Got ${page.length} rows (total: ${allRows.length})`)

    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return allRows
}

// ---------------------------------------------------------------------------
// IDB sanctions fetcher (best-effort)
// ---------------------------------------------------------------------------

async function fetchIdbSanctions(): Promise<string | null> {
  try {
    console.log('  Fetching IDB sanctions list (best-effort)...')
    const response = await fetch(IDB_SANCTIONS_URL, {
      headers: { Accept: 'text/html' },
    })

    if (!response.ok) {
      console.log(`  IDB sanctions fetch failed: ${response.status} — skipping`)
      return null
    }

    const html = await response.text()
    console.log(`  IDB sanctions page: ${html.length} chars`)
    return html
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.log(`  IDB sanctions fetch error: ${msg} — skipping`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchMultilateralResult {
  readonly contracts: readonly WBContractRow[]
  readonly idbSanctionsHtml: string | null
  readonly stats: {
    readonly totalContracts: number
    readonly idbSanctionsFetched: boolean
  }
}

/**
 * Fetch World Bank contract data for Argentina + IDB sanctions list.
 * Uses local cache if available.
 */
export async function fetchMultilateralData(): Promise<FetchMultilateralResult> {
  await mkdir(DATA_DIR, { recursive: true })

  // -- World Bank contracts --------------------------------------------------
  let contracts: WBContractRow[]

  if (existsSync(WB_CACHE_FILE)) {
    console.log(`  Using cached WB data: ${WB_CACHE_FILE}`)
    const raw = await readFile(WB_CACHE_FILE, 'utf-8')
    contracts = JSON.parse(raw)
  } else {
    contracts = await fetchAllPages()
    await writeFile(WB_CACHE_FILE, JSON.stringify(contracts, null, 2), 'utf-8')
    console.log(`  Cached to ${WB_CACHE_FILE}`)
  }

  // -- IDB sanctions (best-effort) -------------------------------------------
  let idbSanctionsHtml: string | null = null

  if (existsSync(IDB_CACHE_FILE)) {
    console.log(`  Using cached IDB sanctions: ${IDB_CACHE_FILE}`)
    idbSanctionsHtml = await readFile(IDB_CACHE_FILE, 'utf-8')
  } else {
    idbSanctionsHtml = await fetchIdbSanctions()
    if (idbSanctionsHtml) {
      await writeFile(IDB_CACHE_FILE, idbSanctionsHtml, 'utf-8')
      console.log(`  Cached IDB sanctions to ${IDB_CACHE_FILE}`)
    }
  }

  return {
    contracts,
    idbSanctionsHtml,
    stats: {
      totalContracts: contracts.length,
      idbSanctionsFetched: idbSanctionsHtml !== null,
    },
  }
}
