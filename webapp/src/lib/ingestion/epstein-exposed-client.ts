/**
 * Typed API client for epsteinexposed.com v2 REST API.
 *
 * Rate limit: 100 requests/hour. The client enforces a 37-second delay between
 * consecutive page fetches (≈97 req/hr to stay safely under the cap).
 *
 * Base URL: https://epsteinexposed.com/api/v2
 *
 * Endpoints consumed:
 *   GET /persons?page=N&limit=N
 *   GET /flights?page=N&limit=N
 *   GET /documents?page=N&limit=N
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = 'https://epsteinexposed.com/api/v2'

/**
 * Delay in milliseconds between paginated requests to honour the 100 req/hr
 * rate limit. 3600 s / 97 effective requests ≈ 37 s.
 */
const RATE_LIMIT_DELAY_MS = 37_000

/** Default page size for all endpoints. */
const DEFAULT_PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Shared response envelope
// ---------------------------------------------------------------------------

interface ApiMeta {
  readonly total: number
  readonly page: number
  readonly per_page: number
  readonly has_more: boolean
  readonly timestamp: string
}

interface ApiCitation {
  readonly source: string
  readonly url: string
  readonly license: string
  readonly accessed_at: string
}

interface ApiResponse<T> {
  readonly api_version: string
  readonly status: 'ok' | 'error'
  readonly data: T[]
  readonly meta: ApiMeta
  readonly citation: ApiCitation
}

// ---------------------------------------------------------------------------
// Person types
// ---------------------------------------------------------------------------

export interface EpsteinPerson {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly category: string
  readonly aliases: string[]
  readonly short_bio: string | null
  readonly image_url: string | null
  readonly status: string[]
  readonly black_book_entry: boolean
  readonly stats: {
    readonly documents: number
    readonly flights: number
    readonly connections: number
    readonly emails: number
  }
  readonly url: string
}

export interface PersonsPage {
  readonly data: EpsteinPerson[]
  readonly total: number
  readonly page: number
  readonly hasMore: boolean
}

// ---------------------------------------------------------------------------
// Flight types
// ---------------------------------------------------------------------------

export interface EpsteinFlight {
  readonly id: string
  readonly date: string
  readonly origin: string
  readonly destination: string
  readonly aircraft: string
  readonly pilot: string
  readonly passenger_count: number
  readonly passenger_ids: string[]
  readonly passenger_names: string[]
  readonly url: string
}

export interface FlightsPage {
  readonly data: EpsteinFlight[]
  readonly total: number
  readonly page: number
  readonly hasMore: boolean
}

// ---------------------------------------------------------------------------
// Document types
// ---------------------------------------------------------------------------

export interface EpsteinDocument {
  readonly id: string
  readonly title: string
  readonly summary: string | null
  readonly date: string | null
  readonly source: string | null
  readonly category: string | null
  readonly tags: string[]
  readonly pdf_url: string | null
  readonly source_url: string | null
  readonly page_count: number | null
  readonly bates_range: string | null
  readonly person_count: number
  readonly upvotes: number
  readonly url: string
}

export interface DocumentsPage {
  readonly data: EpsteinDocument[]
  readonly total: number
  readonly page: number
  readonly hasMore: boolean
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Sleep for the given number of milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Fetch a single page from any endpoint and parse the JSON envelope. */
async function fetchPage<T>(
  endpoint: string,
  page: number,
  limit: number,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}/${endpoint}?page=${page}&limit=${limit}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'office-of-accountability-ingestion/1.0 (public-interest-research)',
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`API error ${response.status} for ${url}: ${body.slice(0, 200)}`)
  }

  const json = (await response.json()) as ApiResponse<T>

  if (json.status !== 'ok') {
    throw new Error(`API returned status "${json.status}" for ${url}`)
  }

  return json
}

// ---------------------------------------------------------------------------
// Public API client methods
// ---------------------------------------------------------------------------

/**
 * Fetch one page of persons.
 * Callers are responsible for applying the rate-limit delay between calls.
 */
export async function getPersons(page: number, limit = DEFAULT_PAGE_SIZE): Promise<PersonsPage> {
  const response = await fetchPage<EpsteinPerson>('persons', page, limit)
  return {
    data: response.data,
    total: response.meta.total,
    page: response.meta.page,
    hasMore: response.meta.has_more,
  }
}

/**
 * Async generator that yields every person across all pages.
 * Enforces the rate-limit delay between fetches.
 *
 * @param startPage - Resume from this page number (default: 1).
 * @param limit     - Page size (default: 50).
 */
export async function* allPersons(
  startPage = 1,
  limit = DEFAULT_PAGE_SIZE,
): AsyncGenerator<EpsteinPerson> {
  let page = startPage

  while (true) {
    const result = await getPersons(page, limit)

    for (const person of result.data) {
      yield person
    }

    if (!result.hasMore) break

    page++
    await sleep(RATE_LIMIT_DELAY_MS)
  }
}

/**
 * Fetch one page of flights.
 * Callers are responsible for applying the rate-limit delay between calls.
 */
export async function getFlights(page: number, limit = DEFAULT_PAGE_SIZE): Promise<FlightsPage> {
  const response = await fetchPage<EpsteinFlight>('flights', page, limit)
  return {
    data: response.data,
    total: response.meta.total,
    page: response.meta.page,
    hasMore: response.meta.has_more,
  }
}

/**
 * Async generator that yields every flight across all pages.
 * Enforces the rate-limit delay between fetches.
 *
 * @param startPage - Resume from this page number (default: 1).
 * @param limit     - Page size (default: 50).
 */
export async function* allFlights(
  startPage = 1,
  limit = DEFAULT_PAGE_SIZE,
): AsyncGenerator<EpsteinFlight> {
  let page = startPage

  while (true) {
    const result = await getFlights(page, limit)

    for (const flight of result.data) {
      yield flight
    }

    if (!result.hasMore) break

    page++
    await sleep(RATE_LIMIT_DELAY_MS)
  }
}

/**
 * Fetch one page of documents.
 * Callers are responsible for applying the rate-limit delay between calls.
 */
export async function getDocuments(
  page: number,
  limit = DEFAULT_PAGE_SIZE,
): Promise<DocumentsPage> {
  const response = await fetchPage<EpsteinDocument>('documents', page, limit)
  return {
    data: response.data,
    total: response.meta.total,
    page: response.meta.page,
    hasMore: response.meta.has_more,
  }
}

/**
 * Async generator that yields every document across all pages.
 * Enforces the rate-limit delay between fetches.
 *
 * @param startPage - Resume from this page number (default: 1).
 * @param limit     - Page size (default: 50).
 */
export async function* allDocuments(
  startPage = 1,
  limit = DEFAULT_PAGE_SIZE,
): AsyncGenerator<EpsteinDocument> {
  let page = startPage

  while (true) {
    const result = await getDocuments(page, limit)

    for (const doc of result.data) {
      yield doc
    }

    if (!result.hasMore) break

    page++
    await sleep(RATE_LIMIT_DELAY_MS)
  }
}

/** Expose the delay constant so the ingestion script can log it. */
export { RATE_LIMIT_DELAY_MS }
