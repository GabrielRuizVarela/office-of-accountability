/**
 * REST API connector — M10 Source Connectors (Phase 4).
 *
 * Fetches records from paginated REST endpoints.
 * Supports offset and cursor pagination modes.
 */

import type { ConnectorKind } from '../types'
import type { Connector, ConnectorResult } from './types'
import { restApiConfigSchema } from './types'

/**
 * Extracts records from a JSON response.
 * Handles both top-level arrays and `{ data: [...] }` shapes.
 */
function extractRecords(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[]
  if (body !== null && typeof body === 'object' && 'data' in body && Array.isArray((body as Record<string, unknown>).data)) {
    return (body as Record<string, unknown>).data as Record<string, unknown>[]
  }
  return []
}

export class RestApiConnector implements Connector {
  kind: ConnectorKind = 'rest_api'

  async fetch(config: Record<string, unknown>): Promise<ConnectorResult> {
    const parsed = restApiConfigSchema.parse(config)
    const url = new URL(parsed.path, parsed.base_url)
    const headers = parsed.headers ?? {}

    let records: Record<string, unknown>[]

    if (!parsed.pagination) {
      const res = await globalThis.fetch(url.toString(), { headers })
      if (!res.ok) throw new Error(`REST fetch failed: ${res.status} ${res.statusText}`)
      const body: unknown = await res.json()
      records = extractRecords(body)
    } else if (parsed.pagination.type === 'offset') {
      records = await this.fetchOffset(url, headers, parsed.pagination)
    } else {
      records = await this.fetchCursor(url, headers, parsed.pagination)
    }

    return {
      records,
      metadata: {
        source: url.toString(),
        fetched_at: new Date().toISOString(),
        record_count: records.length,
      },
    }
  }

  private async fetchOffset(
    baseUrl: URL,
    headers: Record<string, string>,
    pagination: { page_param: string; limit_param: string; limit: number },
  ): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = []
    let offset = 0

    for (;;) {
      const url = new URL(baseUrl.toString())
      url.searchParams.set(pagination.page_param, String(offset))
      url.searchParams.set(pagination.limit_param, String(pagination.limit))

      const res = await globalThis.fetch(url.toString(), { headers })
      if (!res.ok) throw new Error(`REST fetch failed: ${res.status} ${res.statusText}`)

      const body: unknown = await res.json()
      const page = extractRecords(body)
      all.push(...page)

      if (page.length < pagination.limit) break
      offset += pagination.limit
    }

    return all
  }

  /**
   * Cursor-based pagination. Expects response shape:
   * `{ data: [...], next_cursor?: string }`
   * Stops when next_cursor is absent or empty.
   */
  private async fetchCursor(
    baseUrl: URL,
    headers: Record<string, string>,
    pagination: { page_param: string; limit_param: string; limit: number },
  ): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = []
    let cursor: string | undefined

    for (;;) {
      const url = new URL(baseUrl.toString())
      url.searchParams.set(pagination.limit_param, String(pagination.limit))
      if (cursor) url.searchParams.set(pagination.page_param, cursor)

      const res = await globalThis.fetch(url.toString(), { headers })
      if (!res.ok) throw new Error(`REST fetch failed: ${res.status} ${res.statusText}`)

      const body = (await res.json()) as Record<string, unknown>
      const page = extractRecords(body)
      all.push(...page)

      const nextCursor = body.next_cursor
      if (typeof nextCursor !== 'string' || nextCursor === '') break
      cursor = nextCursor
    }

    return all
  }
}
