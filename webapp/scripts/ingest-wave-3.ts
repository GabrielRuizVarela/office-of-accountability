/**
 * Wave 3 Ingestion Script - Document Content Enrichment
 * Run with: npx tsx scripts/ingest-wave-3.ts [--limit N]
 *
 * Enriches existing Document nodes with full text content fetched from:
 *   1. CourtListener API  (free, no auth)
 *   2. DocumentCloud API  (free)
 *   3. DOJ PDF download   (if source_url contains justice.gov)
 *
 * Documents are processed most-connected-first.
 * Resume state is saved after each document so the script can be re-run safely.
 *
 * Content is stored as `content` on the Document node.
 * Basic key findings (dollar amounts, dates) are appended to `key_findings`.
 * `content_source` is set to 'courtlistener' | 'documentcloud' | 'doj'.
 */

import neo4j from 'neo4j-driver-lite'
import { readQuery, executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { saveResumeState, loadResumeState } from '../src/lib/ingestion/quality'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WAVE = 3
const CASO_SLUG = 'caso-epstein'
const RATE_LIMIT_MS = 1_000

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(): { limit: number } {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx !== -1 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : 100
  return { limit: isNaN(limit) ? 100 : limit }
}

// ---------------------------------------------------------------------------
// Document record from Neo4j
// ---------------------------------------------------------------------------

interface DocumentRecord {
  id: string
  title: string
  sourceUrl: string | null
  slug: string
}

// ---------------------------------------------------------------------------
// Content extraction result
// ---------------------------------------------------------------------------

interface ContentResult {
  content: string
  source: 'courtlistener' | 'documentcloud' | 'doj'
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Extract key findings from raw text via regex
// ---------------------------------------------------------------------------

function extractKeyFindings(text: string): string[] {
  const findings: string[] = []

  // Dollar amounts: $X million / $X billion / $X,XXX
  const dollarPattern = /\$[\d,]+(?:\.\d+)?\s*(?:million|billion|thousand)?/gi
  const dollarMatches = text.match(dollarPattern) ?? []
  for (const match of dollarMatches.slice(0, 5)) {
    const finding = `Financial figure mentioned: ${match.trim()}`
    if (!findings.includes(finding)) findings.push(finding)
  }

  // Year patterns: e.g. "in 1999", "from 2002 to 2005"
  const yearPattern = /\b(19[89]\d|20[012]\d)\b/g
  const years = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = yearPattern.exec(text)) !== null) {
    years.add(m[1])
  }
  if (years.size > 0) {
    findings.push(`Years referenced: ${[...years].sort().join(', ')}`)
  }

  return findings
}

// ---------------------------------------------------------------------------
// Source 1: CourtListener
// ---------------------------------------------------------------------------

async function tryCourtListener(title: string): Promise<ContentResult | null> {
  try {
    const encoded = encodeURIComponent(title)
    const url = `https://www.courtlistener.com/api/rest/v4/search/?type=o&q=${encoded}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'OfficeOfAccountability/1.0' },
    })

    if (!response.ok) {
      console.log(`    CourtListener: HTTP ${response.status}`)
      return null
    }

    const data = (await response.json()) as {
      results?: Array<{
        caseName?: string
        snippet?: string
        text?: string
        plain_text?: string
      }>
    }

    if (!data.results || data.results.length === 0) {
      return null
    }

    const first = data.results[0]
    const content = first.plain_text ?? first.text ?? first.snippet ?? ''

    if (!content || content.trim().length < 50) {
      return null
    }

    console.log(`    CourtListener: found content (${content.length} chars)`)
    return { content: content.trim(), source: 'courtlistener' }
  } catch (err) {
    console.log(`    CourtListener: error - ${(err as Error).message}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Source 2: DocumentCloud
// ---------------------------------------------------------------------------

async function tryDocumentCloud(title: string): Promise<ContentResult | null> {
  try {
    const encoded = encodeURIComponent(title)
    const url = `https://api.www.documentcloud.org/api/documents/search/?q=${encoded}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'OfficeOfAccountability/1.0' },
    })

    if (!response.ok) {
      console.log(`    DocumentCloud: HTTP ${response.status}`)
      return null
    }

    const data = (await response.json()) as {
      results?: Array<{
        title?: string
        description?: string
        full_text_url?: string
      }>
    }

    if (!data.results || data.results.length === 0) {
      return null
    }

    // Try to fetch full text from the first result
    const first = data.results[0]
    let content = first.description ?? ''

    if (first.full_text_url) {
      try {
        const textResp = await fetch(first.full_text_url, {
          headers: { 'User-Agent': 'OfficeOfAccountability/1.0' },
        })
        if (textResp.ok) {
          content = await textResp.text()
        }
      } catch {
        // fall through to description
      }
    }

    if (!content || content.trim().length < 50) {
      return null
    }

    console.log(`    DocumentCloud: found content (${content.length} chars)`)
    return { content: content.trim(), source: 'documentcloud' }
  } catch (err) {
    console.log(`    DocumentCloud: error - ${(err as Error).message}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Source 3: DOJ PDF (justice.gov URLs)
// ---------------------------------------------------------------------------

async function tryDojPdf(sourceUrl: string): Promise<ContentResult | null> {
  if (!sourceUrl.includes('justice.gov')) return null

  try {
    console.log(`    DOJ PDF: fetching ${sourceUrl}`)
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'OfficeOfAccountability/1.0' },
    })

    if (!response.ok) {
      console.log(`    DOJ PDF: HTTP ${response.status}`)
      return null
    }

    const contentType = response.headers.get('content-type') ?? ''

    // Handle PDF
    if (contentType.includes('pdf')) {
      const buffer = await response.arrayBuffer()
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: Buffer.from(buffer) })
      const textResult = await parser.getText()
      const content = textResult.text?.trim() ?? ''

      if (content.length < 50) return null

      console.log(`    DOJ PDF: extracted ${content.length} chars from PDF`)
      return { content, source: 'doj' }
    }

    // Handle plain HTML / text
    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      const text = await response.text()
      // Strip HTML tags for a rough plain-text extraction
      const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

      if (stripped.length < 50) return null

      console.log(`    DOJ PDF: extracted ${stripped.length} chars from HTML`)
      return { content: stripped, source: 'doj' }
    }

    console.log(`    DOJ PDF: unsupported content-type ${contentType}`)
    return null
  } catch (err) {
    console.log(`    DOJ PDF: error - ${(err as Error).message}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Enrich one document in Neo4j
// ---------------------------------------------------------------------------

async function enrichDocument(doc: DocumentRecord, result: ContentResult): Promise<void> {
  const newFindings = extractKeyFindings(result.content)

  await executeWrite(
    `MATCH (d:Document {id: $id})
     SET d.content        = $content,
         d.content_source = $contentSource,
         d.key_findings   = CASE
           WHEN d.key_findings IS NULL THEN $newFindings
           ELSE d.key_findings + $newFindings
         END`,
    {
      id: doc.id,
      content: result.content.slice(0, 50_000), // cap at 50k chars
      contentSource: result.source,
      newFindings,
    },
  )
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

interface Stats {
  total: number
  enriched: number
  skipped: number
  failed: number
  bySource: Record<string, number>
  startMs: number
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { limit } = parseArgs()
  const stats: Stats = {
    total: 0,
    enriched: 0,
    skipped: 0,
    failed: 0,
    bySource: { courtlistener: 0, documentcloud: 0, doj: 0 },
    startMs: Date.now(),
  }

  // Load resume state
  const resume = loadResumeState(WAVE)
  const processedIds = new Set<string>((resume?.processedIds as string[]) ?? [])
  if (processedIds.size > 0) {
    console.log(`Resuming Wave 3 - ${processedIds.size} documents already processed.\n`)
  }

  // Connect
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // Query documents most-connected-first
  console.log(`Querying documents (limit: ${limit})...`)
  const queryResult = await readQuery(
    `MATCH (d:Document)
     WHERE d.caso_slug = $casoSlug AND d.content IS NULL
     OPTIONAL MATCH (p:Person)-[:MENTIONED_IN]->(d)
     WITH d, count(p) AS connections
     ORDER BY connections DESC
     LIMIT $limit
     RETURN d.id AS id, d.title AS title, d.source_url AS sourceUrl, d.slug AS slug`,
    { casoSlug: CASO_SLUG, limit: neo4j.int(limit) },
    (record) => ({
      id: record.get('id') as string,
      title: record.get('title') as string,
      sourceUrl: record.get('sourceUrl') as string | null,
      slug: record.get('slug') as string,
    }),
  )

  const documents = queryResult.records
  stats.total = documents.length
  console.log(`Found ${documents.length} documents to enrich.\n`)

  // Process each document
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]

    if (processedIds.has(doc.id)) {
      console.log(`[${i + 1}/${documents.length}] SKIP (already processed): ${doc.title}`)
      stats.skipped++
      continue
    }

    console.log(`[${i + 1}/${documents.length}] Processing: ${doc.title}`)

    let result: ContentResult | null = null

    try {
      // Try sources in priority order
      result = await tryCourtListener(doc.title)

      if (!result) {
        await sleep(RATE_LIMIT_MS)
        result = await tryDocumentCloud(doc.title)
      }

      if (!result && doc.sourceUrl) {
        await sleep(RATE_LIMIT_MS)
        result = await tryDojPdf(doc.sourceUrl)
      }
    } catch (err) {
      console.log(`  ERROR fetching content: ${(err as Error).message}`)
    }

    if (result) {
      try {
        await enrichDocument(doc, result)
        stats.enriched++
        stats.bySource[result.source] = (stats.bySource[result.source] ?? 0) + 1
        console.log(`  Enriched via ${result.source}`)
      } catch (err) {
        console.log(`  ERROR writing to Neo4j: ${(err as Error).message}`)
        stats.failed++
      }
    } else {
      console.log('  No content found - skipping')
      stats.skipped++
    }

    // Save resume state after each doc
    processedIds.add(doc.id)
    saveResumeState(WAVE, {
      processedIds: [...processedIds],
      stats,
      lastProcessedAt: new Date().toISOString(),
    })

    // Rate limit between docs
    if (i < documents.length - 1) {
      await sleep(RATE_LIMIT_MS)
    }
  }

  // Final report
  const durationSec = ((Date.now() - stats.startMs) / 1000).toFixed(1)

  console.log('\n' + '═'.repeat(60))
  console.log('  Wave 3 Enrichment Report')
  console.log('═'.repeat(60))
  console.log(`  Documents queried:   ${stats.total}`)
  console.log(`  Enriched:            ${stats.enriched}`)
  console.log(`  Skipped / no data:   ${stats.skipped}`)
  console.log(`  Failed (write err):  ${stats.failed}`)
  console.log(`  By source:`)
  console.log(`    courtlistener:     ${stats.bySource['courtlistener']}`)
  console.log(`    documentcloud:     ${stats.bySource['documentcloud']}`)
  console.log(`    doj:               ${stats.bySource['doj']}`)
  console.log(`  Duration:            ${durationSec}s`)
  console.log('═'.repeat(60))

  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 3 enrichment failed:', error)
  closeDriver().finally(() => process.exit(1))
})
