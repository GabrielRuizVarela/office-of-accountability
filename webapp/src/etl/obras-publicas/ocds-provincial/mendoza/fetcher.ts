/**
 * Fetches Mendoza OCDS data from the provincial open contracting portal.
 *
 * Data source: https://datosabiertos-compras.mendoza.gov.ar
 * Publisher: Direccion General de Contrataciones y Gestion de Bienes (Mendoza)
 * OCID prefix: ocds-ppv9mm
 *
 * Three dataset periods available:
 *   - Period 01: 2020-2023 (~125 MB) — historical
 *   - Period 02: 2023-2025 (~87 MB)
 *   - Period 03: 2025-2026 (~11 MB) — most recent
 *
 * Uses streaming download with pipeline() for large files.
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'

import { OcdsReleasePackageSchema, type OcdsRelease } from '../types'

// ---------------------------------------------------------------------------
// Paths & URLs
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), '_ingestion_data', 'ocds-provincial', 'mendoza')

/**
 * Available Mendoza OCDS dataset periods.
 * The download URLs use /descargar-json/ (not /datasets/).
 */
export const MENDOZA_DATASETS = [
  {
    key: 'period-03',
    label: 'Period 2025-2026',
    url: 'https://datosabiertos-compras.mendoza.gov.ar/descargar-json/03/20260104_release.json',
    filename: 'mendoza-2025-2026.json',
    approxSizeMb: 11,
  },
  {
    key: 'period-02',
    label: 'Period 2023-2025',
    url: 'https://datosabiertos-compras.mendoza.gov.ar/descargar-json/02/20250810_release.json',
    filename: 'mendoza-2023-2025.json',
    approxSizeMb: 87,
  },
  {
    key: 'period-01',
    label: 'Period 2020-2023',
    url: 'https://datosabiertos-compras.mendoza.gov.ar/descargar-json/01/2020_20231021_v1_release.json',
    filename: 'mendoza-2020-2023.json',
    approxSizeMb: 125,
  },
] as const

export type MendozaDatasetKey = (typeof MENDOZA_DATASETS)[number]['key']

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------

async function downloadIfNeeded(url: string, destFile: string, sizeMb: number): Promise<void> {
  if (existsSync(destFile)) {
    console.log(`  Already downloaded: ${destFile}`)
    return
  }

  await mkdir(DATA_DIR, { recursive: true })
  console.log(`  Downloading ${url} (~${sizeMb} MB) ...`)

  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download Mendoza OCDS: ${response.status} ${response.statusText}`,
    )
  }

  const fileStream = createWriteStream(destFile)
  await pipeline(Readable.fromWeb(response.body as any), fileStream)
  console.log(`  Saved to ${destFile}`)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchMendozaOcdsResult {
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
 * Download and parse Mendoza OCDS data for specified periods.
 *
 * @param periods  Which periods to fetch (default: period-03 only, the smallest)
 */
export async function fetchMendozaOcdsData(
  periods: readonly MendozaDatasetKey[] = ['period-03'],
): Promise<FetchMendozaOcdsResult> {
  const allReleases: OcdsRelease[] = []

  for (const periodKey of periods) {
    const dataset = MENDOZA_DATASETS.find((d) => d.key === periodKey)
    if (!dataset) {
      console.warn(`  Unknown period key: ${periodKey}, skipping.`)
      continue
    }

    const filePath = join(DATA_DIR, dataset.filename)

    // Download if needed
    await downloadIfNeeded(dataset.url, filePath, dataset.approxSizeMb)

    // Parse JSON
    console.log(`  Parsing ${dataset.filename} ...`)
    const raw = await readFile(filePath, 'utf-8')
    const parsed = OcdsReleasePackageSchema.parse(JSON.parse(raw))
    console.log(`  Parsed ${parsed.releases.length} releases from ${dataset.label}`)
    allReleases.push(...parsed.releases)
  }

  // Compute stats
  const dates = allReleases.map((r) => r.date).filter(Boolean).sort()
  const withTender = allReleases.filter((r) => r.tag.includes('tender')).length
  const withAward = allReleases.filter((r) => r.tag.includes('award')).length
  const withContract = allReleases.filter((r) => r.tag.includes('contract')).length

  return {
    releases: allReleases,
    stats: {
      totalReleases: allReleases.length,
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
