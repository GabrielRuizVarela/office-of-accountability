/**
 * Seed script - ingests YouTube transcript entity mentions into the Neo4j knowledge graph.
 * Run with: NEO4J_URI=bolt://localhost:7687 NEO4J_USER=neo4j npx tsx scripts/seed-youtube-mentions.ts
 *
 * For each video in the transcript JSON:
 *   1. Creates a Source node (type: "youtube") for the video
 *   2. Creates MENTIONED_IN_VIDEO relationships from existing entity nodes to the Source,
 *      with mention_count, first_mention_timestamp, and timestamps properties.
 *
 * Uses MERGE for idempotency - safe to re-run.
 *
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { executeWrite, writeQuery, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EntityMention {
  entity_id: string
  entity_name: string
  entity_label: 'Person' | 'Location' | 'Organization'
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
}

interface TranscriptData {
  _meta: {
    generated_at: string
    video_count: number
    total_entity_mentions: number
  }
  results: VideoResult[]
}

// ---------------------------------------------------------------------------
// Aggregate mentions per entity per video
// ---------------------------------------------------------------------------

interface AggregatedMention {
  entity_id: string
  entity_name: string
  entity_label: string
  mention_count: number
  first_mention_timestamp: string
  timestamps: string[]
}

function aggregateMentions(mentions: EntityMention[]): AggregatedMention[] {
  const map = new Map<string, AggregatedMention>()

  for (const m of mentions) {
    const existing = map.get(m.entity_id)
    if (existing) {
      existing.mention_count++
      existing.timestamps.push(m.timestamp_formatted)
      // Keep earliest timestamp
      if (m.timestamp_ms < parseTimestamp(existing.first_mention_timestamp)) {
        existing.first_mention_timestamp = m.timestamp_formatted
      }
    } else {
      map.set(m.entity_id, {
        entity_id: m.entity_id,
        entity_name: m.entity_name,
        entity_label: m.entity_label,
        mention_count: 1,
        first_mention_timestamp: m.timestamp_formatted,
        timestamps: [m.timestamp_formatted],
      })
    }
  }

  return Array.from(map.values())
}

/** Parse "HH:MM:SS" back to ms for comparison */
function parseTimestamp(ts: string): number {
  const parts = ts.split(':').map(Number)
  return ((parts[0] * 60 + parts[1]) * 60 + parts[2]) * 1000
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CASO_SLUG = 'caso-epstein'

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const start = Date.now()

  // Load transcript data
  const jsonPath = join(import.meta.dirname!, 'youtube-epstein-transcripts.json')
  const data: TranscriptData = JSON.parse(readFileSync(jsonPath, 'utf-8'))

  const videosWithMentions = data.results.filter((v) => v.entity_mentions.length > 0)
  console.log(`Loaded ${data.results.length} videos, ${videosWithMentions.length} have entity mentions`)

  // Connect to Neo4j
  console.log('\nConnecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Is it running?')
    process.exit(1)
  }
  console.log('Connected.')

  let totalSources = 0
  let totalRelationships = 0

  for (const video of videosWithMentions) {
    const sourceId = `ep-yt-${video.video_id}`
    const displayTitle = video.title || `YouTube ${video.video_id}`

    // 1. Create Source node
    console.log(`\nSource: ${displayTitle} (${video.video_id})`)
    await executeWrite(
      `MERGE (s:Source {id: $id})
       SET s.title = $title,
           s.type = 'youtube',
           s.url = $url,
           s.video_id = $video_id,
           s.source_type = $source_type,
           s.duration_seconds = $duration_seconds,
           s.segment_count = $segment_count,
           s.caso_slug = $casoSlug`,
      {
        id: sourceId,
        title: displayTitle,
        url: video.url,
        video_id: video.video_id,
        source_type: video.source_type,
        duration_seconds: video.duration_seconds,
        segment_count: video.segment_count,
        casoSlug: CASO_SLUG,
      },
    )
    totalSources++

    // 2. Aggregate mentions per entity and create relationships
    const aggregated = aggregateMentions(video.entity_mentions)

    for (const agg of aggregated) {
      // Use the entity_label to match the correct node type
      const label = agg.entity_label // Person, Location, or Organization
      await executeWrite(
        `MATCH (e:${label} {id: $entityId})
         MATCH (s:Source {id: $sourceId})
         MERGE (e)-[r:MENTIONED_IN_VIDEO]->(s)
         SET r.mention_count = $mentionCount,
             r.first_mention_timestamp = $firstTimestamp,
             r.timestamps = $timestamps`,
        {
          entityId: agg.entity_id,
          sourceId: sourceId,
          mentionCount: agg.mention_count,
          firstTimestamp: agg.first_mention_timestamp,
          timestamps: agg.timestamps,
        },
      )
      totalRelationships++
      console.log(`  -> ${agg.entity_name} (${agg.mention_count} mentions, first at ${agg.first_mention_timestamp})`)
    }
  }

  // 3. Print summary
  const duration = Date.now() - start
  console.log(`\n${'─'.repeat(50)}`)
  console.log('Seed summary:')
  console.log(`  Source nodes created:          ${totalSources}`)
  console.log(`  MENTIONED_IN_VIDEO relations:  ${totalRelationships}`)

  // Query total graph counts
  const nodeResult = await writeQuery(
    'MATCH (n) RETURN count(n) AS cnt',
    {},
    (rec) => rec.get('cnt').toNumber() as number,
  )
  const relResult = await writeQuery(
    'MATCH ()-[r]->() RETURN count(r) AS cnt',
    {},
    (rec) => rec.get('cnt').toNumber() as number,
  )
  console.log(`  Total graph nodes:             ${nodeResult.records[0]}`)
  console.log(`  Total graph relationships:     ${relResult.records[0]}`)
  console.log(`\nCompleted in ${duration}ms`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Seed script failed:', error)
  closeDriver().finally(() => process.exit(1))
})
