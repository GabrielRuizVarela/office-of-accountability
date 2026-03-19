/**
 * Fetches Como Voto JSON data from GitHub.
 *
 * Downloads legislators.json, votaciones.json, and per-legislator detail files
 * from the Como_voto repository's processed data directory.
 *
 * @see https://github.com/rquiroga7/Como_voto
 */

import {
  LegislatorsFileSchema,
  VotingSessionsFileSchema,
  LegislatorDetailSchema,
  LawNamesFileSchema,
  ElectionLegislatorsFileSchema,
} from './types'
import type {
  CompactLegislator,
  LegislatorDetail,
  VotingSession,
  ElectionLegislatorsFile,
} from './types'

const BASE_URL = 'https://raw.githubusercontent.com/rquiroga7/Como_voto/main/docs/data'

const LEGISLATORS_URL = `${BASE_URL}/legislators.json`
const VOTACIONES_URL = `${BASE_URL}/votaciones.json`
const LAW_NAMES_URL = `${BASE_URL}/law_names.json`
const ELECTION_LEGISLATORS_URL =
  'https://raw.githubusercontent.com/rquiroga7/Como_voto/main/data/election_legislators.json'

/** Build URL for a per-legislator detail file.
 * Como Voto filenames use `__` for comma-space and `_` for spaces:
 * "ABAD, MAXIMILIANO" → "ABAD__MAXIMILIANO.json"
 */
const legislatorDetailUrl = (nameKey: string): string => {
  const fileName = nameKey.replace(/, /g, '__').replace(/ /g, '_')
  return `${BASE_URL}/legislators/${encodeURIComponent(fileName)}.json`
}

/** Fetch JSON from a URL with timeout */
async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}: ${response.statusText}`)
  }

  return (await response.json()) as T
}

export interface FetchLegislatorsResult {
  readonly legislators: readonly CompactLegislator[]
  readonly count: number
}

/**
 * Fetch and validate the legislators.json file.
 * Returns all legislators with Zod validation applied.
 */
export async function fetchLegislators(signal?: AbortSignal): Promise<FetchLegislatorsResult> {
  const raw = await fetchJson<unknown>(LEGISLATORS_URL, signal)
  const legislators = LegislatorsFileSchema.parse(raw)

  return {
    legislators,
    count: legislators.length,
  }
}

export interface FetchVotingSessionsResult {
  readonly sessions: readonly VotingSession[]
  readonly count: number
}

/**
 * Fetch and validate the votaciones.json file.
 * The file is a dict keyed by chamber; we flatten into a single array.
 */
export async function fetchVotingSessions(
  signal?: AbortSignal,
): Promise<FetchVotingSessionsResult> {
  const raw = await fetchJson<unknown>(VOTACIONES_URL, signal)
  const parsed = VotingSessionsFileSchema.parse(raw)
  const sessions = [...parsed.diputados, ...parsed.senadores]

  return {
    sessions,
    count: sessions.length,
  }
}

export interface FetchLawNamesResult {
  readonly lawNames: readonly string[]
  readonly count: number
}

/**
 * Fetch and validate the law_names.json file.
 * Returns a flat array of law name display strings.
 */
export async function fetchLawNames(signal?: AbortSignal): Promise<FetchLawNamesResult> {
  const raw = await fetchJson<unknown>(LAW_NAMES_URL, signal)
  const lawNames = LawNamesFileSchema.parse(raw)

  return {
    lawNames,
    count: lawNames.length,
  }
}

export interface FetchElectionLegislatorsResult {
  readonly electionData: ElectionLegislatorsFile
  readonly yearCount: number
}

/**
 * Fetch and validate the election_legislators.json file.
 * Returns election data keyed by year, then by chamber.
 */
export async function fetchElectionLegislators(
  signal?: AbortSignal,
): Promise<FetchElectionLegislatorsResult> {
  const raw = await fetchJson<unknown>(ELECTION_LEGISLATORS_URL, signal)
  const electionData = ElectionLegislatorsFileSchema.parse(raw)

  return {
    electionData,
    yearCount: Object.keys(electionData).length,
  }
}

/**
 * Fetch and validate a single legislator's detail file.
 * The nameKey should be the uppercase key from legislators.json (e.g., "ABAD, MAXIMILIANO").
 */
export async function fetchLegislatorDetail(
  nameKey: string,
  signal?: AbortSignal,
): Promise<LegislatorDetail> {
  const url = legislatorDetailUrl(nameKey)
  const raw = await fetchJson<unknown>(url, signal)

  return LegislatorDetailSchema.parse(raw)
}

export interface FetchLegislatorDetailsResult {
  readonly details: readonly LegislatorDetail[]
  readonly succeeded: number
  readonly failed: number
  readonly errors: readonly FetchError[]
}

export interface FetchError {
  readonly nameKey: string
  readonly error: string
}

/**
 * Fetch detail files for multiple legislators with concurrency control.
 *
 * Downloads in batches to avoid overwhelming the GitHub CDN.
 * Failed fetches are collected (not thrown) so the pipeline can continue
 * with partial data.
 */
export async function fetchLegislatorDetails(
  nameKeys: readonly string[],
  options: { readonly concurrency?: number; readonly signal?: AbortSignal } = {},
): Promise<FetchLegislatorDetailsResult> {
  const { concurrency = 10, signal } = options
  const details: LegislatorDetail[] = []
  const errors: FetchError[] = []

  for (let i = 0; i < nameKeys.length; i += concurrency) {
    if (signal?.aborted) {
      throw new Error('Fetch aborted')
    }

    const batch = nameKeys.slice(i, i + concurrency)
    const results = await Promise.allSettled(
      batch.map((nameKey) => fetchLegislatorDetail(nameKey, signal)),
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      if (result.status === 'fulfilled') {
        details.push(result.value)
      } else {
        errors.push({
          nameKey: batch[j],
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        })
      }
    }
  }

  return {
    details,
    succeeded: details.length,
    failed: errors.length,
    errors,
  }
}
