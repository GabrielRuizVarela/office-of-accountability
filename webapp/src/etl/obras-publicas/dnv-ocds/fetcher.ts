/**
 * Fetches DNV (Direccion Nacional de Vialidad) OCDS data from local JSONL file.
 *
 * Data source:
 * - Open Contracting Data Standard publication #18
 *   https://data.open-contracting.org/en/publication/18
 *
 * 277 releases — road construction procurement by Argentina's national road authority.
 * Dataset covers federal highway construction — the same sector where
 * Cuadernos cartelization was alleged.
 */

import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import { OcdsReleaseSchema, type OcdsRelease } from '../ocds-provincial/types'

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'dnv-ocds')
const JSONL_FILE = join(DATA_DIR, 'full.jsonl')

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchDnvOcdsResult {
  readonly releases: readonly OcdsRelease[]
  readonly stats: {
    readonly totalReleases: number
    readonly withTender: number
    readonly withAward: number
    readonly withContract: number
    readonly parseErrors: number
    readonly dateRange: { earliest: string; latest: string }
  }
}

/**
 * Stream-parse DNV OCDS JSONL file into validated OcdsRelease objects.
 */
export async function fetchDnvOcdsData(): Promise<FetchDnvOcdsResult> {
  console.log(`  Reading ${JSONL_FILE} ...`)

  const releases: OcdsRelease[] = []
  let parseErrors = 0

  const rl = createInterface({
    input: createReadStream(JSONL_FILE),
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    if (!line.trim()) continue
    try {
      const raw = JSON.parse(line)
      const release = OcdsReleaseSchema.parse(raw)
      releases.push(release)
    } catch {
      parseErrors += 1
    }
  }

  // Compute stats
  const dates = releases.map((r) => r.date).filter(Boolean).sort()
  const withTender = releases.filter((r) => r.tender !== undefined).length
  const withAward = releases.filter((r) => r.awards.length > 0).length
  const withContract = releases.filter((r) => r.contracts.length > 0).length

  return {
    releases,
    stats: {
      totalReleases: releases.length,
      withTender,
      withAward,
      withContract,
      parseErrors,
      dateRange: {
        earliest: dates[0] ?? '',
        latest: dates[dates.length - 1] ?? '',
      },
    },
  }
}
