/**
 * Fetches ICIJ Offshore Leaks data, filters to Argentine-connected entries.
 *
 * Downloads the full CSV zip, extracts and parses CSVs, then filters:
 * 1. Officers with ARG country code
 * 2. All entities/addresses/intermediaries connected to those officers via relationships
 *
 * @see https://offshoreleaks.icij.org/pages/database
 */

import { createReadStream, existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'
import { parse } from 'csv-parse'

import type {
  OfficerRow,
  EntityRow,
  AddressRow,
  IntermediaryRow,
  RelationshipRow,
} from './types'

const DOWNLOAD_URL = 'https://offshoreleaks-data.icij.org/offshoreleaks/csv/full-oldb.LATEST.zip'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'icij')
const ZIP_PATH = join(DATA_DIR, 'icij.zip')

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

// ---------------------------------------------------------------------------
// Download
// ---------------------------------------------------------------------------

async function downloadZip(): Promise<void> {
  if (existsSync(ZIP_PATH)) {
    console.log('  ZIP already downloaded, skipping...')
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log('  Downloading ICIJ data (~600MB)...')

  const response = await fetch(DOWNLOAD_URL)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ICIJ data: ${response.status} ${response.statusText}`)
  }

  const fileStream = createWriteStream(ZIP_PATH)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log('  Download complete.')
}

function extractZip(): void {
  if (existsSync(join(DATA_DIR, 'nodes-officers.csv'))) {
    console.log('  CSVs already extracted, skipping...')
    return
  }

  console.log('  Extracting CSVs...')
  execFileSync('unzip', ['-o', ZIP_PATH, '-d', DATA_DIR], { stdio: 'pipe' })
  console.log('  Extraction complete.')
}

// ---------------------------------------------------------------------------
// Filter and parse
// ---------------------------------------------------------------------------

export interface FetchIcijResult {
  readonly officers: readonly OfficerRow[]
  readonly entities: readonly EntityRow[]
  readonly addresses: readonly AddressRow[]
  readonly intermediaries: readonly IntermediaryRow[]
  readonly relationships: readonly RelationshipRow[]
  readonly stats: {
    readonly totalOfficers: number
    readonly totalEntities: number
    readonly totalAddresses: number
    readonly totalIntermediaries: number
    readonly totalRelationships: number
  }
}

/**
 * Download, extract, and filter ICIJ data to Argentine-connected entries.
 *
 * Strategy:
 * 1. Parse officers, keep those with ARG in country_codes
 * 2. Parse relationships, keep those involving Argentine officer node_ids
 * 3. Collect connected entity/address/intermediary node_ids from relationships
 * 4. Parse entities/addresses/intermediaries, keep only connected ones
 */
export async function fetchIcijData(): Promise<FetchIcijResult> {
  await downloadZip()
  extractZip()

  // Step 1: Argentine officers
  console.log('  Parsing officers...')
  const allOfficers = await parseCsv<OfficerRow>(join(DATA_DIR, 'nodes-officers.csv'))
  const argOfficers = allOfficers.filter(
    (o) => o.country_codes && o.country_codes.split(';').some((c) => c.trim() === 'ARG'),
  )
  const argOfficerIds = new Set(argOfficers.map((o) => o.node_id))
  console.log(`  Argentine officers: ${argOfficers.length} / ${allOfficers.length}`)

  // Step 2: Relationships involving Argentine officers
  console.log('  Parsing relationships...')
  const allRelationships = await parseCsv<RelationshipRow>(join(DATA_DIR, 'relationships.csv'))
  const relevantRels = allRelationships.filter(
    (r) => argOfficerIds.has(r.node_id_start) || argOfficerIds.has(r.node_id_end),
  )
  console.log(`  Relevant relationships: ${relevantRels.length} / ${allRelationships.length}`)

  // Step 3: Collect connected node IDs
  const connectedIds = new Set<string>()
  for (const r of relevantRels) {
    connectedIds.add(r.node_id_start)
    connectedIds.add(r.node_id_end)
  }

  // Step 4: Filter entities, addresses, intermediaries
  console.log('  Parsing entities...')
  const allEntities = await parseCsv<EntityRow>(join(DATA_DIR, 'nodes-entities.csv'))
  const relevantEntities = allEntities.filter((e) => connectedIds.has(e.node_id))
  console.log(`  Connected entities: ${relevantEntities.length} / ${allEntities.length}`)

  console.log('  Parsing addresses...')
  const allAddresses = await parseCsv<AddressRow>(join(DATA_DIR, 'nodes-addresses.csv'))
  const relevantAddresses = allAddresses.filter((a) => connectedIds.has(a.node_id))
  console.log(`  Connected addresses: ${relevantAddresses.length} / ${allAddresses.length}`)

  console.log('  Parsing intermediaries...')
  const allIntermediaries = await parseCsv<IntermediaryRow>(
    join(DATA_DIR, 'nodes-intermediaries.csv'),
  )
  const relevantIntermediaries = allIntermediaries.filter((i) => connectedIds.has(i.node_id))
  console.log(`  Connected intermediaries: ${relevantIntermediaries.length} / ${allIntermediaries.length}`)

  return {
    officers: argOfficers,
    entities: relevantEntities,
    addresses: relevantAddresses,
    intermediaries: relevantIntermediaries,
    relationships: relevantRels,
    stats: {
      totalOfficers: argOfficers.length,
      totalEntities: relevantEntities.length,
      totalAddresses: relevantAddresses.length,
      totalIntermediaries: relevantIntermediaries.length,
      totalRelationships: relevantRels.length,
    },
  }
}
