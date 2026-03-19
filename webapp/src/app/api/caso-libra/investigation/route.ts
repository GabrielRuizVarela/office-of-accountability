/**
 * API route: POST /api/caso-libra/investigation
 *
 * Unified endpoint for submitting investigation data.
 * Validates input against Zod schemas and stores in the investigation dataset.
 *
 * Designed for use by:
 * - Humans (via web forms or JSON file upload)
 * - MCP agents (programmatic API calls)
 * - CLI scripts (bulk import)
 *
 * ## Usage
 *
 * ### Single item:
 * POST /api/caso-libra/investigation
 * { "type": "factcheck", "data": { ... } }
 *
 * ### Bulk import:
 * POST /api/caso-libra/investigation
 * { "items": [{ "type": "factcheck", "data": { ... } }, ...] }
 *
 * ### Supported types:
 * - factcheck: A verified or alleged claim with source
 * - event: A timeline event with date, category, and sources
 * - actor: A person or organization involved in the case
 * - money_flow: A financial transaction between entities
 * - evidence: A source document (article, court filing, report)
 * - stat: An impact statistic
 * - government_response: A government action to obstruct/deflect
 *
 * ## GET /api/caso-libra/investigation
 * Returns the full investigation dataset as JSON.
 *
 * ## GET /api/caso-libra/investigation?type=factcheck
 * Returns only items of a specific type.
 *
 * ## GET /api/caso-libra/investigation?schema=true
 * Returns the JSON schema documentation for all entity types.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

import {
  investigationSubmissionSchema,
  bulkImportSchema,
  type InvestigationSubmission,
} from '@/lib/caso-libra/investigation-schema'

// ---------------------------------------------------------------------------
// Auth — API key for MCP agent access
// ---------------------------------------------------------------------------

const INVESTIGATION_API_KEY = process.env.INVESTIGATION_API_KEY

function isAuthorized(request: NextRequest): boolean {
  // In development, allow unauthenticated access
  if (process.env.NODE_ENV === 'development') return true

  if (!INVESTIGATION_API_KEY) return false

  const header = request.headers.get('x-api-key') ?? request.headers.get('authorization')?.replace('Bearer ', '')
  return header === INVESTIGATION_API_KEY
}

// ---------------------------------------------------------------------------
// Storage — async file I/O with write lock
// ---------------------------------------------------------------------------

const STORE_DIR = join(process.cwd(), 'data')
const STORE_PATH = join(STORE_DIR, 'investigation-submissions.json')

/** Max items per bulk import request */
const MAX_BULK_ITEMS = 100

interface StoredItem {
  id: string
  type: string
  data: Record<string, unknown>
  submitted_at: string
  status: 'pending_review' | 'approved' | 'rejected'
}

/** Simple write lock to prevent concurrent file corruption */
let writeLock: Promise<void> = Promise.resolve()

async function loadStore(): Promise<StoredItem[]> {
  try {
    const content = await readFile(STORE_PATH, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function saveStore(items: StoredItem[]): Promise<void> {
  // Queue writes to prevent race conditions
  writeLock = writeLock.then(async () => {
    await mkdir(STORE_DIR, { recursive: true })
    await writeFile(STORE_PATH, JSON.stringify(items, null, 2), 'utf-8')
  })
  await writeLock
}

function generateId(type: string): string {
  const prefix = {
    factcheck: 'fc',
    event: 'tl',
    actor: 'act',
    money_flow: 'mf',
    evidence: 'ev',
    stat: 'st',
    government_response: 'gr',
  }[type] ?? 'item'
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

// ---------------------------------------------------------------------------
// Schema documentation for MCP agents
// ---------------------------------------------------------------------------

const SCHEMA_DOCS = {
  description:
    'Caso Libra Investigation Data API. Submit factchecked claims, timeline events, actors, money flows, evidence documents, and government responses.',
  endpoint: 'POST /api/caso-libra/investigation',
  types: {
    factcheck: {
      description: 'A factchecked claim about the $LIBRA scandal',
      required_fields: {
        claim_es: 'string — The claim in Spanish (min 10 chars)',
        claim_en: 'string — The claim in English (min 10 chars)',
        status: 'enum — "confirmed" | "alleged" | "denied" | "under_investigation"',
        source: 'string — Source name (e.g. "Nansen Research")',
        source_url: 'string — URL to the source',
      },
      optional_fields: {
        id: 'string — Auto-generated if omitted',
        detail_es: 'string — Additional detail in Spanish',
        detail_en: 'string — Additional detail in English',
      },
      example: {
        type: 'factcheck',
        data: {
          claim_es: '86% de los traders perdieron $251M en total',
          claim_en: '86% of traders lost $251M in total',
          status: 'confirmed',
          source: 'Nansen Research',
          source_url: 'https://research.nansen.ai/articles/libra-the-aftermath',
        },
      },
    },
    event: {
      description: 'A timeline event in the investigation',
      required_fields: {
        date: 'string — YYYY-MM-DD format',
        title_es: 'string — Event title in Spanish',
        title_en: 'string — Event title in English',
        description_es: 'string — Event description in Spanish',
        description_en: 'string — Event description in English',
        category: 'enum — "political" | "financial" | "legal" | "media" | "coverup"',
        sources: 'array — [{ name: string, url: string }] (min 1)',
      },
      optional_fields: {
        id: 'string',
        is_new: 'boolean — Mark as newly discovered evidence',
      },
    },
    actor: {
      description: 'A person or organization involved in the case',
      required_fields: {
        name: 'string — Full name',
        role_es: 'string — Role in Spanish',
        role_en: 'string — Role in English',
        description_es: 'string — Description in Spanish',
        description_en: 'string — Description in English',
        nationality: 'string — e.g. "argentina", "estadounidense"',
      },
      optional_fields: {
        id: 'string',
        is_new: 'boolean — Newly discovered actor',
        status_es: 'string — Current legal/political status in Spanish',
        status_en: 'string — Current legal/political status in English',
      },
    },
    money_flow: {
      description: 'A financial flow between wallets/entities',
      required_fields: {
        from_label: 'string — Source entity',
        to_label: 'string — Destination entity',
        amount_usd: 'number — Amount in USD',
        date: 'string — YYYY-MM-DD format',
        source: 'string — Source of this data',
      },
    },
    evidence: {
      description: 'A source document or report',
      required_fields: {
        title: 'string — Document title',
        type_es: 'string — Document type in Spanish',
        type_en: 'string — Document type in English',
        date: 'string — YYYY-MM-DD format',
        summary_es: 'string — Summary in Spanish',
        summary_en: 'string — Summary in English',
        source_url: 'string — URL to the document',
        verification_status: 'enum — "verified" | "partially_verified" | "unverified"',
      },
    },
    stat: {
      description: 'An impact statistic',
      required_fields: {
        value: 'string — The stat value (e.g. "$251M")',
        label_es: 'string — Label in Spanish',
        label_en: 'string — Label in English',
        source: 'string — Data source',
      },
    },
    government_response: {
      description: 'A government action to obstruct, deflect, or minimize the investigation',
      required_fields: {
        date: 'string — YYYY-MM-DD format',
        action_es: 'string — What the government did in Spanish',
        action_en: 'string — What the government did in English',
        effect_es: 'string — The effect/consequence in Spanish',
        effect_en: 'string — The effect/consequence in English',
        source: 'string — Source name',
        source_url: 'string — URL to the source',
      },
    },
  },
  bulk_import: {
    description: 'Submit multiple items at once',
    format: '{ "items": [{ "type": "...", "data": { ... } }, ...] }',
  },
}

// ---------------------------------------------------------------------------
// GET — Read investigation data or schema
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url)

  // Return schema documentation for MCP agents
  if (searchParams.get('schema') === 'true') {
    return NextResponse.json(SCHEMA_DOCS)
  }

  const store = await loadStore()
  const typeFilter = searchParams.get('type')
  const statusFilter = searchParams.get('status') // pending_review, approved, rejected

  let filtered = store
  if (typeFilter) {
    filtered = filtered.filter((item) => item.type === typeFilter)
  }
  if (statusFilter) {
    filtered = filtered.filter((item) => item.status === statusFilter)
  }

  return NextResponse.json({
    count: filtered.length,
    items: filtered,
  })
}

// ---------------------------------------------------------------------------
// POST — Submit new investigation data
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  // Auth check — require API key in production
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide x-api-key header or Authorization: Bearer <key>.' },
      { status: 401 },
    )
  }

  try {
    const body = await request.json()

    // Check if bulk import
    if ('items' in body && Array.isArray(body.items)) {
      // Enforce max bulk size
      if (Array.isArray(body.items) && body.items.length > MAX_BULK_ITEMS) {
        return NextResponse.json(
          { error: `Bulk import limited to ${MAX_BULK_ITEMS} items per request.` },
          { status: 400 },
        )
      }

      const parsed = bulkImportSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: parsed.error.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
            })),
          },
          { status: 400 },
        )
      }

      // Atomic read-modify-write inside the lock
      const results: { id: string; type: string }[] = []
      const store = await loadStore()

      for (const item of parsed.data.items) {
        const id = (item.data as Record<string, unknown>).id as string || generateId(item.type)
        const stored: StoredItem = {
          id,
          type: item.type,
          data: { ...item.data, id },
          submitted_at: new Date().toISOString(),
          status: 'pending_review',
        }
        store.push(stored)
        results.push({ id, type: item.type })
      }

      await saveStore(store)

      return NextResponse.json({
        success: true,
        message: `${results.length} items submitted for review`,
        items: results,
      })
    }

    // Single item submission
    const parsed = investigationSubmissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
          hint: 'GET /api/caso-libra/investigation?schema=true for documentation',
        },
        { status: 400 },
      )
    }

    const id = (parsed.data.data as Record<string, unknown>).id as string || generateId(parsed.data.type)
    const stored: StoredItem = {
      id,
      type: parsed.data.type,
      data: { ...parsed.data.data, id },
      submitted_at: new Date().toISOString(),
      status: 'pending_review',
    }

    // Atomic read-modify-write inside the lock
    const store = await loadStore()
    store.push(stored)
    await saveStore(store)

    return NextResponse.json({
      success: true,
      message: `Item submitted for review`,
      id,
      type: parsed.data.type,
    })
  } catch (error) {
    console.error('Investigation submission error:', error)
    return NextResponse.json(
      {
        error: 'Invalid request body',
        hint: 'GET /api/caso-libra/investigation?schema=true for documentation',
      },
      { status: 400 },
    )
  }
}
