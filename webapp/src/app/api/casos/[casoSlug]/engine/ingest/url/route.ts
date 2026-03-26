import { NextRequest } from 'next/server'
import { z } from 'zod/v4'

import { writeQuery } from '@/lib/neo4j/client'

const MAX_CONTENT_BYTES = 100 * 1024 // 100KB
const CONTENT_STORE_CAP = 50 * 1024  // 50KB
const FETCH_TIMEOUT_MS = 15_000

const bodySchema = z.object({
  url: z.url(),
  extract_entities: z.boolean().default(false),
  proposed_by: z.string().optional(),
})

/**
 * Strip HTML tags, decode basic entities, and collapse whitespace.
 * Removes <script> and <style> blocks first.
 */
function stripHtml(html: string): string {
  // Remove script and style blocks
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '')
  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, ' ')
  // Decode basic HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

/**
 * Extract text content from <title> tag.
 */
function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return ''
  return stripHtml(match[1]).trim()
}

interface ExtractedEntities {
  dates: string[]
  dollar_amounts: string[]
  emails: string[]
}

/**
 * Run regex extraction for dates, dollar amounts, and emails.
 */
function extractEntities(text: string): ExtractedEntities {
  const dateRe = /\b(\d{4}-\d{2}-\d{2})\b/g
  const dollarRe = /\$[\d,.]+\s*(million|billion|trillion)?/gi
  const emailRe = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

  const dates = [...new Set([...text.matchAll(dateRe)].map((m) => m[1]))].slice(0, 50)
  const dollar_amounts = [...new Set([...text.matchAll(dollarRe)].map((m) => m[0].trim()))].slice(0, 50)
  const emails = [...new Set([...text.matchAll(emailRe)].map((m) => m[0]))].slice(0, 50)

  return { dates, dollar_amounts, emails }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ casoSlug: string }> },
) {
  const { casoSlug } = await params

  let body: z.infer<typeof bodySchema>
  try {
    const raw = await request.json()
    body = bodySchema.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json(
      { success: false, error: `Invalid request body: ${message}` },
      { status: 400 },
    )
  }

  try {
    // Fetch URL with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let rawHtml: string
    try {
      const response = await fetch(body.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OfficeOfAccountability/1.0; +https://office-of-accountability.org)',
        },
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        return Response.json(
          { success: false, error: `Failed to fetch URL: HTTP ${response.status}` },
          { status: 422 },
        )
      }

      // Cap at 100KB
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer.slice(0, MAX_CONTENT_BYTES))
      rawHtml = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const fetchMsg = fetchError instanceof Error ? fetchError.message : String(fetchError)
      if (fetchMsg.includes('abort') || fetchMsg.includes('timeout')) {
        return Response.json(
          { success: false, error: 'URL fetch timed out after 15 seconds' },
          { status: 504 },
        )
      }
      return Response.json(
        { success: false, error: `Failed to fetch URL: ${fetchMsg}` },
        { status: 422 },
      )
    }

    const title = extractTitle(rawHtml)
    const plainText = stripHtml(rawHtml)
    const contentLength = plainText.length

    // Cap stored content at 50KB
    const content = plainText.slice(0, CONTENT_STORE_CAP)
    const summary = plainText.slice(0, 500)

    const proposalId = crypto.randomUUID()
    const nodeId = `${casoSlug}:document-${Date.now()}`
    const payloadJson = JSON.stringify({
      label: 'Document',
      id: nodeId,
      properties: {
        caso_slug: casoSlug,
        title,
        source_url: body.url,
        content,
        summary,
        confidence_tier: 'bronze',
      },
    })

    await writeQuery(
      `CREATE (p:Proposal {
        id: $proposalId,
        investigation_id: $casoSlug,
        stage: 'ingest',
        type: 'create_node',
        payload_json: $payloadJson,
        confidence: 0.5,
        reasoning: $reasoning,
        proposed_by: $proposedBy,
        status: 'pending',
        created_at: datetime()
      }) RETURN p.id AS id`,
      {
        proposalId,
        casoSlug,
        payloadJson,
        reasoning: `Bronze-tier document ingest from URL: ${body.url}`,
        proposedBy: body.proposed_by ?? 'url-ingest-api',
      },
      (r) => ({ id: r.get('id') as string }),
    )

    const responseData: Record<string, unknown> = {
      url: body.url,
      title,
      content_length: contentLength,
      content_summary: summary,
      proposals_created: 1,
      document_proposal_id: proposalId,
    }

    if (body.extract_entities) {
      const entities = extractEntities(plainText)
      responseData.entities_found = entities
    }

    return Response.json({ success: true, data: responseData })
  } catch (error) {
    console.error('[engine/ingest/url]', error)
    const message = error instanceof Error ? error.message : String(error)

    if (
      message.includes('connect') ||
      message.includes('ECONNREFUSED') ||
      message.includes('ServiceUnavailable')
    ) {
      return Response.json(
        { success: false, error: 'Database unavailable' },
        { status: 503 },
      )
    }

    return Response.json(
      { success: false, error: 'Failed to create document proposal' },
      { status: 500 },
    )
  }
}
