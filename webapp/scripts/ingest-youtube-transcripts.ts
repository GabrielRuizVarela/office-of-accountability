/**
 * YouTube Transcript Ingestion Pipeline for the Epstein Investigation Knowledge Graph
 *
 * Downloads transcripts from YouTube videos, extracts entity mentions by matching
 * against persons, organizations, and locations in the existing Neo4j graph,
 * and outputs structured JSON for downstream Neo4j ingestion.
 *
 * Usage:
 *   npx tsx scripts/ingest-youtube-transcripts.ts                          # process all sources in youtube-epstein-sources.json
 *   npx tsx scripts/ingest-youtube-transcripts.ts --urls URL1 URL2 ...     # process specific URLs
 *   npx tsx scripts/ingest-youtube-transcripts.ts --out results.json       # custom output path
 *   npx tsx scripts/ingest-youtube-transcripts.ts --skip-neo4j             # use hardcoded entity list (no DB)
 */

import neo4j, { type Driver } from 'neo4j-driver-lite'
import { readFile, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const execFileAsync = promisify(execFile)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface YouTubeSource {
  url: string
  title: string
  type: 'documentary' | 'hearing' | 'interview' | 'news'
}

interface TranscriptSegment {
  text: string
  offset: number   // milliseconds from start
  duration: number  // segment duration in ms
}

interface EntityMention {
  entity_id: string
  entity_name: string
  entity_label: 'Person' | 'Organization' | 'Location'
  matched_text: string
  timestamp_ms: number
  timestamp_formatted: string
  segment_text: string
}

interface VideoResult {
  video_id: string
  url: string
  title: string
  source_type: string
  transcript_text: string
  segment_count: number
  duration_seconds: number
  entity_mentions: EntityMention[]
  unique_entities: string[]
  ingested_at: string
}

interface GraphEntity {
  id: string
  name: string
  label: 'Person' | 'Organization' | 'Location'
  aliases: string[]  // alternate name forms for matching
}

// ---------------------------------------------------------------------------
// YouTube helpers
// ---------------------------------------------------------------------------

/** Extract video ID from a YouTube URL */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pat of patterns) {
    const m = url.match(pat)
    if (m) return m[1]
  }
  return null
}

/**
 * Fetch transcript from YouTube's timedtext API.
 *
 * Strategy:
 *  1. Fetch the video page HTML to extract caption track metadata
 *  2. Parse out the timedtext URL from the playerCaptionsTracklistRenderer
 *  3. Fetch the XML transcript and parse segments
 */
/** Find yt-dlp binary — check common locations */
async function findYtDlp(): Promise<string> {
  const candidates = [
    join(process.env.HOME ?? '', '.local/bin/yt-dlp'),
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    'yt-dlp',
  ]
  for (const p of candidates) {
    try {
      await execFileAsync(p, ['--version'], { timeout: 5000 })
      return p
    } catch { /* try next */ }
  }
  throw new Error('yt-dlp not found. Install with: pip3 install yt-dlp')
}

async function fetchTranscript(videoId: string): Promise<TranscriptSegment[]> {
  // Use yt-dlp to extract subtitles — handles all YouTube edge cases reliably
  const outTemplate = join(tmpdir(), `yt-sub-${videoId}`)

  try {
    // Try user-local yt-dlp first, fall back to system
    const ytdlp = process.env.YTDLP_PATH ?? (await findYtDlp())
    await execFileAsync(ytdlp, [
      '--write-auto-sub',
      '--write-sub',
      '--sub-lang', 'en',
      '--sub-format', 'json3',
      '--skip-download',
      '--no-warnings',
      '-o', outTemplate,
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { timeout: 30_000 })
  } catch (err) {
    throw new Error(`yt-dlp failed for ${videoId}: ${err instanceof Error ? err.message : String(err)}`)
  }

  // yt-dlp outputs to <outTemplate>.en.json3 or <outTemplate>.en-orig.json3
  const possiblePaths = [
    `${outTemplate}.en.json3`,
    `${outTemplate}.en-orig.json3`,
  ]

  let jsonContent: string | null = null
  for (const p of possiblePaths) {
    try {
      jsonContent = await readFile(p, 'utf-8')
      break
    } catch { /* try next */ }
  }

  if (!jsonContent) {
    throw new Error(`No subtitle file produced by yt-dlp for ${videoId}`)
  }

  // Parse json3 format: { events: [ { tStartMs, dDurationMs, segs: [{ utf8 }] } ] }
  const data = JSON.parse(jsonContent) as {
    events: Array<{
      tStartMs?: number
      dDurationMs?: number
      segs?: Array<{ utf8?: string }>
    }>
  }

  const segments: TranscriptSegment[] = []
  for (const evt of data.events ?? []) {
    if (!evt.segs) continue
    const text = evt.segs.map((s) => s.utf8 ?? '').join('').replace(/\n/g, ' ').trim()
    if (!text) continue

    segments.push({
      text,
      offset: evt.tStartMs ?? 0,
      duration: evt.dDurationMs ?? 0,
    })
  }

  if (segments.length === 0) {
    throw new Error(`Parsed 0 segments from yt-dlp output for ${videoId}`)
  }

  return segments
}

/** Format milliseconds to HH:MM:SS */
function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Entity loading from Neo4j
// ---------------------------------------------------------------------------

/** Generate plausible name aliases for fuzzy matching */
function generateAliases(name: string, label: string): string[] {
  const aliases: string[] = [name]

  if (label === 'Person') {
    const parts = name.split(/\s+/)
    // Last name only (for names with 2+ parts)
    if (parts.length >= 2) {
      aliases.push(parts[parts.length - 1])
    }
    // First + Last (skip middle names)
    if (parts.length >= 3) {
      aliases.push(`${parts[0]} ${parts[parts.length - 1]}`)
    }
    // Handle "Prince Andrew" style names
    if (parts[0] === 'Prince' || parts[0] === 'King' || parts[0] === 'Queen') {
      aliases.push(parts.slice(1).join(' '))
    }
  }

  if (label === 'Organization') {
    // Handle "X / Y" names
    if (name.includes('/')) {
      for (const part of name.split('/')) {
        const trimmed = part.trim()
        if (trimmed) aliases.push(trimmed)
      }
    }
  }

  if (label === 'Location') {
    // Handle parenthetical info
    const base = name.replace(/\s*\(.*?\)\s*/g, '').trim()
    if (base !== name) aliases.push(base)
  }

  return [...new Set(aliases)]
}

async function loadEntitiesFromNeo4j(): Promise<GraphEntity[]> {
  const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687'
  const user = process.env.NEO4J_USER ?? 'neo4j'
  const password = process.env.NEO4J_PASSWORD ?? ''

  const auth = password ? neo4j.auth.basic(user, password) : neo4j.auth.basic(user, '')
  const driver: Driver = neo4j.driver(uri, auth)

  try {
    await driver.verifyConnectivity()
    console.log('[neo4j] Connected to', uri)

    const session = driver.session()
    const entities: GraphEntity[] = []

    try {
      // Load persons
      const personResult = await session.run(
        `MATCH (p:Person {caso_slug: 'caso-epstein'}) RETURN p.id AS id, p.name AS name`,
      )
      for (const rec of personResult.records) {
        const name = rec.get('name') as string
        entities.push({
          id: rec.get('id') as string,
          name,
          label: 'Person',
          aliases: generateAliases(name, 'Person'),
        })
      }

      // Load organizations
      const orgResult = await session.run(
        `MATCH (o:Organization {caso_slug: 'caso-epstein'}) RETURN o.id AS id, o.name AS name`,
      )
      for (const rec of orgResult.records) {
        const name = rec.get('name') as string
        entities.push({
          id: rec.get('id') as string,
          name,
          label: 'Organization',
          aliases: generateAliases(name, 'Organization'),
        })
      }

      // Load locations
      const locResult = await session.run(
        `MATCH (l:Location {caso_slug: 'caso-epstein'}) RETURN l.id AS id, l.name AS name`,
      )
      for (const rec of locResult.records) {
        const name = rec.get('name') as string
        entities.push({
          id: rec.get('id') as string,
          name,
          label: 'Location',
          aliases: generateAliases(name, 'Location'),
        })
      }

      console.log(
        `[neo4j] Loaded ${entities.length} entities (${entities.filter((e) => e.label === 'Person').length} persons, ` +
          `${entities.filter((e) => e.label === 'Organization').length} orgs, ` +
          `${entities.filter((e) => e.label === 'Location').length} locations)`,
      )
    } finally {
      await session.close()
    }

    return entities
  } finally {
    await driver.close()
  }
}

/** Fallback: hardcoded entities derived from the seed script */
function loadFallbackEntities(): GraphEntity[] {
  const persons: Array<[string, string]> = [
    ['ep-jeffrey-epstein', 'Jeffrey Epstein'],
    ['ep-ghislaine-maxwell', 'Ghislaine Maxwell'],
    ['ep-leslie-wexner', 'Leslie Wexner'],
    ['ep-alan-dershowitz', 'Alan Dershowitz'],
    ['ep-prince-andrew', 'Prince Andrew'],
    ['ep-bill-clinton', 'Bill Clinton'],
    ['ep-jean-luc-brunel', 'Jean-Luc Brunel'],
    ['ep-sarah-kellen', 'Sarah Kellen'],
    ['ep-nadia-marcinko', 'Nadia Marcinko'],
    ['ep-virginia-giuffre', 'Virginia Giuffre'],
    ['ep-larry-visoski', 'Larry Visoski'],
    ['ep-david-copperfield', 'David Copperfield'],
    ['ep-jes-staley', 'Jes Staley'],
    ['ep-leon-black', 'Leon Black'],
    ['ep-donald-trump', 'Donald Trump'],
  ]

  const orgs: Array<[string, string]> = [
    ['ep-org-epstein-co', 'J. Epstein & Co'],
    ['ep-org-southern-trust', 'Southern Trust Company'],
    ['ep-org-jpmorgan', 'JPMorgan Chase'],
    ['ep-org-deutsche', 'Deutsche Bank'],
    ['ep-org-l-brands', 'L Brands'],
    ['ep-org-apollo', 'Apollo Global Management'],
    ['ep-org-mc2', 'MC2 Model Management'],
    ['ep-org-vi-foundation', 'Jeffrey Epstein VI Foundation'],
    ['ep-org-mcc', 'Metropolitan Correctional Center'],
  ]

  const locations: Array<[string, string]> = [
    ['ep-little-st-james', 'Little St. James Island'],
    ['ep-zorro-ranch', 'Zorro Ranch'],
    ['ep-nyc-townhouse', '9 East 71st Street Townhouse'],
    ['ep-palm-beach-mansion', 'Palm Beach Mansion'],
    ['ep-paris-apartment', 'Paris Apartment'],
    ['ep-columbus-oh', 'Columbus, Ohio'],
  ]

  const entities: GraphEntity[] = []

  for (const [id, name] of persons) {
    entities.push({ id, name, label: 'Person', aliases: generateAliases(name, 'Person') })
  }
  for (const [id, name] of orgs) {
    entities.push({ id, name, label: 'Organization', aliases: generateAliases(name, 'Organization') })
  }
  for (const [id, name] of locations) {
    entities.push({ id, name, label: 'Location', aliases: generateAliases(name, 'Location') })
  }

  console.log(`[fallback] Using ${entities.length} hardcoded entities`)
  return entities
}

// ---------------------------------------------------------------------------
// Entity matching
// ---------------------------------------------------------------------------

/**
 * Build compiled matchers: for each entity alias, create a case-insensitive
 * word-boundary regex. Sort longest-first to prefer full name matches.
 */
function buildMatchers(
  entities: GraphEntity[],
): Array<{ entity: GraphEntity; alias: string; regex: RegExp }> {
  const matchers: Array<{ entity: GraphEntity; alias: string; regex: RegExp }> = []

  for (const entity of entities) {
    for (const alias of entity.aliases) {
      // Skip very short aliases that produce too many false positives
      if (alias.length < 4) continue
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      matchers.push({
        entity,
        alias,
        regex: new RegExp(`\\b${escaped}\\b`, 'i'),
      })
    }
  }

  // Sort longest aliases first — prefer "Jeffrey Epstein" over "Epstein"
  matchers.sort((a, b) => b.alias.length - a.alias.length)

  return matchers
}

function extractMentions(
  segments: TranscriptSegment[],
  matchers: Array<{ entity: GraphEntity; alias: string; regex: RegExp }>,
): EntityMention[] {
  const mentions: EntityMention[] = []

  for (const seg of segments) {
    // Track which entity IDs we already matched in this segment (avoid duplicates)
    const matchedInSegment = new Set<string>()

    for (const { entity, alias, regex } of matchers) {
      if (matchedInSegment.has(entity.id)) continue
      if (regex.test(seg.text)) {
        matchedInSegment.add(entity.id)
        mentions.push({
          entity_id: entity.id,
          entity_name: entity.name,
          entity_label: entity.label,
          matched_text: alias,
          timestamp_ms: seg.offset,
          timestamp_formatted: formatTimestamp(seg.offset),
          segment_text: seg.text,
        })
      }
    }
  }

  return mentions
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function processVideo(
  source: YouTubeSource,
  matchers: Array<{ entity: GraphEntity; alias: string; regex: RegExp }>,
): Promise<VideoResult | null> {
  const videoId = extractVideoId(source.url)
  if (!videoId) {
    console.error(`[skip] Invalid YouTube URL: ${source.url}`)
    return null
  }

  console.log(`\n[process] ${videoId} — ${source.title}`)

  let segments: TranscriptSegment[]
  try {
    segments = await fetchTranscript(videoId)
    console.log(`  [ok] ${segments.length} transcript segments fetched`)
  } catch (err) {
    console.error(`  [error] ${(err as Error).message}`)
    return null
  }

  const fullText = segments.map((s) => s.text).join(' ')
  const lastSeg = segments[segments.length - 1]
  const durationMs = lastSeg ? lastSeg.offset + lastSeg.duration : 0

  const mentions = extractMentions(segments, matchers)
  const uniqueEntities = [...new Set(mentions.map((m) => m.entity_name))].sort()

  console.log(
    `  [entities] ${mentions.length} mentions of ${uniqueEntities.length} unique entities`,
  )
  if (uniqueEntities.length > 0) {
    console.log(`  [entities] ${uniqueEntities.join(', ')}`)
  }

  return {
    video_id: videoId,
    url: source.url,
    title: source.title,
    source_type: source.type,
    transcript_text: fullText,
    segment_count: segments.length,
    duration_seconds: Math.round(durationMs / 1000),
    entity_mentions: mentions,
    unique_entities: uniqueEntities,
    ingested_at: new Date().toISOString(),
  }
}

async function main() {
  const args = process.argv.slice(2)
  const skipNeo4j = args.includes('--skip-neo4j')
  const outIdx = args.indexOf('--out')
  const outputPath =
    outIdx !== -1 && args[outIdx + 1]
      ? args[outIdx + 1]
      : join(dirname(fileURLToPath(import.meta.url)), 'youtube-epstein-transcripts.json')

  // Determine which URLs to process
  let sources: YouTubeSource[]
  const urlIdx = args.indexOf('--urls')
  if (urlIdx !== -1) {
    // Collect all args after --urls that are not flags
    const urls: string[] = []
    for (let i = urlIdx + 1; i < args.length; i++) {
      if (args[i].startsWith('--')) break
      urls.push(args[i])
    }
    sources = urls.map((u) => ({ url: u, title: '', type: 'news' as const }))
  } else {
    const sourcesPath = join(
      dirname(fileURLToPath(import.meta.url)),
      'youtube-epstein-sources.json',
    )
    const raw = await readFile(sourcesPath, 'utf-8')
    sources = JSON.parse(raw) as YouTubeSource[]
  }

  console.log(`[init] Processing ${sources.length} video(s)`)

  // Load entities for matching
  let entities: GraphEntity[]
  if (skipNeo4j) {
    entities = loadFallbackEntities()
  } else {
    try {
      entities = await loadEntitiesFromNeo4j()
    } catch (err) {
      console.warn(
        `[warn] Neo4j connection failed: ${(err as Error).message}. Falling back to hardcoded entities.`,
      )
      entities = loadFallbackEntities()
    }
  }

  const matchers = buildMatchers(entities)
  console.log(`[init] ${matchers.length} entity matching patterns compiled`)

  // Process videos sequentially to avoid rate-limiting
  const results: VideoResult[] = []
  let successCount = 0
  let failCount = 0

  for (const source of sources) {
    try {
      const result = await processVideo(source, matchers)
      if (result) {
        results.push(result)
        successCount++
      } else {
        failCount++
      }
    } catch (err) {
      console.error(`[error] Unexpected error processing ${source.url}: ${(err as Error).message}`)
      failCount++
    }

    // Polite delay between requests
    if (sources.indexOf(source) < sources.length - 1) {
      await new Promise((r) => setTimeout(r, 1500))
    }
  }

  // Write output
  const output = {
    _meta: {
      generated_at: new Date().toISOString(),
      video_count: results.length,
      total_entity_mentions: results.reduce((sum, r) => sum + r.entity_mentions.length, 0),
      total_unique_entities: [
        ...new Set(results.flatMap((r) => r.unique_entities)),
      ].sort(),
      pipeline_version: '1.0.0',
      description:
        'YouTube transcript ingestion for the Epstein investigation knowledge graph. ' +
        'Entity mentions are matched against the caso-epstein Neo4j graph nodes.',
    },
    results,
  }

  await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8')

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[done] ${successCount} succeeded, ${failCount} failed`)
  console.log(`[done] ${output._meta.total_entity_mentions} total entity mentions`)
  console.log(`[done] ${output._meta.total_unique_entities.length} unique entities across all videos`)
  console.log(`[done] Output written to ${outputPath}`)
}

main().catch((err) => {
  console.error('[fatal]', err)
  process.exit(1)
})
