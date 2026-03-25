/**
 * Fetches CABA BAC_OCDS data — clones GitHub repo + downloads JSON releases.
 *
 * The GitHub repo (datosgcba/BAC_OCDS) contains only documentation.
 * Actual OCDS JSON releases are hosted on the Buenos Aires open data CDN.
 *
 * Coverage: Jan–Jun 2022, ~23K releases, ~81 MB JSON.
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { execFileSync } from 'node:child_process'

import { OcdsReleasePackageSchema, type OcdsRelease } from './types'

// ---------------------------------------------------------------------------
// Paths & URLs
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'ocds-provincial', 'BAC_OCDS')
const REPO_URL = 'https://github.com/datosgcba/BAC_OCDS.git'

/** CDN URL for the OCDS JSON release package (all 2022 H1 releases in one file). */
const BAC_JSON_URL =
  'https://cdn.buenosaires.gob.ar/datosabiertos/datasets/ministerio-de-economia-y-finanzas/buenos-aires-compras/bac_anual.json'

const JSON_FILE = join(DATA_DIR, 'bac_anual.json')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cloneRepoIfNeeded(): void {
  if (existsSync(join(DATA_DIR, '.git')) || existsSync(join(DATA_DIR, 'README.md'))) {
    console.log(`  BAC_OCDS repo already present at ${DATA_DIR}`)
    return
  }

  console.log(`  Cloning ${REPO_URL} ...`)
  execFileSync('git', ['clone', '--depth', '1', REPO_URL, DATA_DIR], {
    stdio: 'inherit',
  })
}

async function downloadJsonIfNeeded(): Promise<void> {
  if (existsSync(JSON_FILE)) {
    console.log(`  Already downloaded: ${JSON_FILE}`)
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log(`  Downloading ${BAC_JSON_URL} (~81 MB) ...`)

  const response = await fetch(BAC_JSON_URL)
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download BAC JSON: ${response.status} ${response.statusText}`,
    )
  }

  const fileStream = createWriteStream(JSON_FILE)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log(`  Saved to ${JSON_FILE}`)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchOcdsProvincialResult {
  readonly releases: readonly OcdsRelease[]
  readonly stats: {
    readonly totalReleases: number
    readonly withTender: number
    readonly withAward: number
    readonly withContract: number
    readonly dateRange: { earliest: string; latest: string }
  }
}

/**
 * Clone repo (docs only) + download and parse BAC OCDS JSON releases.
 */
export async function fetchOcdsProvincialData(): Promise<FetchOcdsProvincialResult> {
  // Step 1: Clone repo for documentation context
  cloneRepoIfNeeded()

  // Step 2: Download OCDS JSON if not cached
  await downloadJsonIfNeeded()

  // Step 3: Parse JSON
  console.log('  Parsing bac_anual.json ...')
  const raw = await readFile(JSON_FILE, 'utf-8')
  const parsed = OcdsReleasePackageSchema.parse(JSON.parse(raw))
  const releases = parsed.releases

  // Compute stats
  const dates = releases.map((r) => r.date).filter(Boolean).sort()
  const withTender = releases.filter((r) => r.tag.includes('tender')).length
  const withAward = releases.filter((r) => r.tag.includes('award')).length
  const withContract = releases.filter((r) => r.tag.includes('contract')).length

  return {
    releases,
    stats: {
      totalReleases: releases.length,
      withTender,
      withAward,
      withContract,
      dateRange: {
        earliest: dates[0] ?? '',
        latest: dates[dates.length - 1] ?? '',
      },
    },
  }
}
