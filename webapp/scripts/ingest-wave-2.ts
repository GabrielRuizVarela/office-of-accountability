/**
 * Wave 2 Ingestion Script - epsteinexposed.com API v2
 * Run with: npx tsx scripts/ingest-wave-2.ts
 *
 * Imports persons, flights, and documents from the Epstein Exposed public API
 * into Neo4j as bronze-tier nodes scoped to caso-epstein.
 *
 * The script is resumable: if interrupted, re-run it and it will continue
 * from the last saved cursor (stored in _ingestion_data/wave-2-resume.json).
 *
 * Deduplication runs against all existing caso-epstein nodes (Waves 0–1 and
 * the seed dataset) before creating new nodes.
 *
 * Node IDs use the pattern: ep-w2-{slug}
 * All nodes receive: caso_slug, ingestion_wave: 2, confidence_tier: 'bronze',
 *                    source: 'epstein-exposed'
 *
 * Rate limiting: The API allows 100 req/hr.  The client automatically delays
 * ~37 s between page fetches.  Expect ~14 hrs for all persons (1 557 entries
 * at 50/page = 32 pages), ~73 hrs for all flights (3 615), and a very long
 * run for all 2 146 580 documents (paginated at 50, ~1 200 hrs).
 *
 * IMPORTANT: In practice, ingest persons + flights first; document ingestion
 * should be scoped or rate-limited separately with a higher page size.
 */

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { normalizeName, toSlug, dedup, buildExistingMaps } from '../src/lib/ingestion/dedup'
import {
  saveConflicts,
  printReport,
  saveResumeState,
  loadResumeState,
} from '../src/lib/ingestion/quality'
import {
  allPersons,
  allFlights,
  getDocuments,
  RATE_LIMIT_DELAY_MS,
  type EpsteinPerson,
  type EpsteinFlight,
  type EpsteinDocument,
} from '../src/lib/ingestion/epstein-exposed-client'
import type { ConflictRecord, WaveReport } from '../src/lib/ingestion/types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WAVE = 2
const SOURCE = 'epstein-exposed' as const
const CASO_SLUG = 'caso-epstein'

/**
 * Maximum number of document pages to ingest per run (safety valve).
 * Set to Infinity to ingest all documents (very slow due to rate limiting).
 */
const MAX_DOCUMENT_PAGES = 20

const PAGE_SIZE = 50

// ---------------------------------------------------------------------------
// Helpers - node ID generation
// ---------------------------------------------------------------------------

function toWave2Id(name: string): string {
  return `ep-w2-${toSlug(name)}`
}

function toFlightId(flightId: string): string {
  return `ep-w2-flight-${flightId}`
}

function toDocumentId(docId: string): string {
  return `ep-w2-doc-${docId}`
}

// ---------------------------------------------------------------------------
// Ingest: Persons
// ---------------------------------------------------------------------------

async function ingestPersons(
  nameMap: Map<string, { id: string; name: string }>,
  slugMap: Map<string, { id: string; name: string }>,
  conflicts: ConflictRecord[],
  startPage: number,
): Promise<{
  nodesCreated: number
  nodesSkipped: number
  lastPage: number
  /** Map from epstein-exposed person ID → Neo4j node ID */
  personIdMap: Map<string, string>
}> {
  let nodesCreated = 0
  let nodesSkipped = 0
  let lastPage = startPage
  const personIdMap = new Map<string, string>()

  console.log(`\nIngesting persons (resuming from page ${startPage})...`)

  for await (const person of allPersons(startPage, PAGE_SIZE)) {
    const dedupMatch = dedup(person.name, nameMap, slugMap)

    if (dedupMatch.result === 'exact_match') {
      personIdMap.set(person.id, dedupMatch.existingId!)
      nodesSkipped++
      continue
    }

    if (dedupMatch.result === 'fuzzy_match') {
      conflicts.push({
        incomingId: toWave2Id(person.name),
        incomingName: person.name,
        existingId: dedupMatch.existingId!,
        existingName: dedupMatch.existingName!,
        matchType: 'fuzzy_match',
        distance: dedupMatch.distance,
        source: SOURCE,
        wave: WAVE,
      })
      // Fall through - still create the bronze node
    }

    const neo4jId = toWave2Id(person.name)
    await createPersonNode(neo4jId, person)

    const norm = normalizeName(person.name)
    const slug = toSlug(person.name)
    nameMap.set(norm, { id: neo4jId, name: person.name })
    slugMap.set(slug, { id: neo4jId, name: person.name })

    personIdMap.set(person.id, neo4jId)
    nodesCreated++

    // Track progress and persist resume state every 10 nodes
    if ((nodesCreated + nodesSkipped) % 10 === 0) {
      console.log(`  Persons: ${nodesCreated} created, ${nodesSkipped} skipped`)
      saveResumeState(WAVE, {
        wave: WAVE,
        source: SOURCE,
        lastCursor: null,
        lastPage,
        nodesProcessed: nodesCreated + nodesSkipped,
        startedAt: new Date().toISOString(),
        phase: 'persons',
      })
    }

    // Update lastPage tracking (persons generator handles delay internally)
    lastPage = Math.ceil((nodesCreated + nodesSkipped) / PAGE_SIZE) + startPage - 1
  }

  console.log(`  Persons done: ${nodesCreated} created, ${nodesSkipped} skipped`)
  return { nodesCreated, nodesSkipped, lastPage, personIdMap }
}

async function createPersonNode(id: string, person: EpsteinPerson): Promise<void> {
  await executeWrite(
    `MERGE (n:Person {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.ee_person_id = $ee_person_id,
         n.ee_slug = $ee_slug,
         n.category = $category,
         n.aliases = $aliases,
         n.short_bio = $short_bio,
         n.image_url = $image_url,
         n.black_book_entry = $black_book_entry,
         n.ee_url = $ee_url`,
    {
      id,
      name: person.name,
      slug: toSlug(person.name),
      caso_slug: CASO_SLUG,
      ingestion_wave: WAVE,
      confidence_tier: 'bronze',
      source: SOURCE,
      ee_person_id: person.id,
      ee_slug: person.slug,
      category: person.category,
      aliases: person.aliases.join('; '),
      short_bio: person.short_bio ?? null,
      image_url: person.image_url ?? null,
      black_book_entry: person.black_book_entry,
      ee_url: person.url,
    },
  )
}

// ---------------------------------------------------------------------------
// Ingest: Flights + FLEW_WITH relationships
// ---------------------------------------------------------------------------

async function ingestFlights(
  personIdMap: Map<string, string>,
  startPage: number,
): Promise<{ edgesCreated: number; edgesSkipped: number; flightNodesCreated: number }> {
  let edgesCreated = 0
  let edgesSkipped = 0
  let flightNodesCreated = 0

  console.log(`\nIngesting flights (resuming from page ${startPage})...`)

  for await (const flight of allFlights(startPage, PAGE_SIZE)) {
    // Create the flight node itself as a Location (aircraft/flight)
    const flightNeo4jId = toFlightId(flight.id)
    await createFlightNode(flightNeo4jId, flight)
    flightNodesCreated++

    // Create FLEW_WITH edges between all pairs of passengers
    const passengerNeo4jIds = flight.passenger_ids
      .map((pid) => personIdMap.get(pid))
      .filter((id): id is string => id !== undefined)

    for (let i = 0; i < passengerNeo4jIds.length; i++) {
      for (let j = i + 1; j < passengerNeo4jIds.length; j++) {
        const aId = passengerNeo4jIds[i]
        const bId = passengerNeo4jIds[j]
        try {
          await executeWrite(
            `MATCH (a {id: $aId}), (b {id: $bId})
             MERGE (a)-[r:FLEW_WITH]->(b)
             SET r.confidence_tier = 'bronze',
                 r.source = $source,
                 r.ingestion_wave = $wave,
                 r.ee_flight_id = $flightId,
                 r.flight_date = $date,
                 r.origin = $origin,
                 r.destination = $destination,
                 r.aircraft = $aircraft`,
            {
              aId,
              bId,
              source: SOURCE,
              wave: WAVE,
              flightId: flight.id,
              date: flight.date,
              origin: flight.origin,
              destination: flight.destination,
              aircraft: flight.aircraft,
            },
          )
          edgesCreated++
        } catch {
          edgesSkipped++
        }
      }
    }

    if (flightNodesCreated % 50 === 0) {
      console.log(
        `  Flights: ${flightNodesCreated} flight nodes, ${edgesCreated} FLEW_WITH edges`,
      )
    }
  }

  console.log(
    `  Flights done: ${flightNodesCreated} flight nodes, ${edgesCreated} FLEW_WITH edges, ${edgesSkipped} edges skipped`,
  )

  return { edgesCreated, edgesSkipped, flightNodesCreated }
}

async function createFlightNode(id: string, flight: EpsteinFlight): Promise<void> {
  await executeWrite(
    `MERGE (n:Location {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.location_type = 'flight',
         n.ee_flight_id = $ee_flight_id,
         n.flight_date = $flight_date,
         n.origin = $origin,
         n.destination = $destination,
         n.aircraft = $aircraft,
         n.pilot = $pilot,
         n.passenger_count = $passenger_count,
         n.ee_url = $ee_url`,
    {
      id,
      name: `Flight ${flight.id}: ${flight.origin} → ${flight.destination} (${flight.date})`,
      slug: `flight-${flight.id}`,
      caso_slug: CASO_SLUG,
      ingestion_wave: WAVE,
      confidence_tier: 'bronze',
      source: SOURCE,
      ee_flight_id: flight.id,
      flight_date: flight.date,
      origin: flight.origin,
      destination: flight.destination,
      aircraft: flight.aircraft,
      pilot: flight.pilot || null,
      passenger_count: flight.passenger_count,
      ee_url: flight.url,
    },
  )
}

// ---------------------------------------------------------------------------
// Ingest: Documents (capped at MAX_DOCUMENT_PAGES per run)
// ---------------------------------------------------------------------------

async function ingestDocuments(
  nameMap: Map<string, { id: string; name: string }>,
  slugMap: Map<string, { id: string; name: string }>,
  conflicts: ConflictRecord[],
  startPage: number,
): Promise<{
  docsCreated: number
  docsSkipped: number
  lastDocPage: number
}> {
  let docsCreated = 0
  let docsSkipped = 0
  let currentPage = startPage

  console.log(
    `\nIngesting documents (up to ${MAX_DOCUMENT_PAGES} pages, resuming from page ${startPage})...`,
  )

  for (let i = 0; i < MAX_DOCUMENT_PAGES; i++) {
    const result = await getDocuments(currentPage, PAGE_SIZE)

    for (const doc of result.data) {
      const dedupMatch = dedup(doc.title, nameMap, slugMap)

      if (dedupMatch.result === 'exact_match') {
        docsSkipped++
        continue
      }

      if (dedupMatch.result === 'fuzzy_match') {
        conflicts.push({
          incomingId: toDocumentId(doc.id),
          incomingName: doc.title,
          existingId: dedupMatch.existingId!,
          existingName: dedupMatch.existingName!,
          matchType: 'fuzzy_match',
          distance: dedupMatch.distance,
          source: SOURCE,
          wave: WAVE,
        })
        // Fall through - still create the bronze node
      }

      const neo4jId = toDocumentId(doc.id)
      await createDocumentNode(neo4jId, doc)

      const norm = normalizeName(doc.title)
      const slug = toSlug(doc.title)
      nameMap.set(norm, { id: neo4jId, name: doc.title })
      slugMap.set(slug, { id: neo4jId, name: doc.title })

      docsCreated++
    }

    console.log(
      `  Page ${currentPage}: ${result.data.length} docs (${docsCreated} created, ${docsSkipped} skipped)`,
    )

    if (!result.hasMore) {
      break
    }

    currentPage++

    // Rate limit between pages (skip after last page)
    if (i < MAX_DOCUMENT_PAGES - 1 && result.hasMore) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS))
    }
  }

  console.log(
    `  Documents done: ${docsCreated} created, ${docsSkipped} skipped (stopped at page ${currentPage})`,
  )
  return { docsCreated, docsSkipped, lastDocPage: currentPage }
}

async function createDocumentNode(id: string, doc: EpsteinDocument): Promise<void> {
  await executeWrite(
    `MERGE (n:Document {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.ee_doc_id = $ee_doc_id,
         n.title = $title,
         n.summary = $summary,
         n.date = $date,
         n.doc_source = $doc_source,
         n.category = $category,
         n.tags = $tags,
         n.pdf_url = $pdf_url,
         n.source_url = $source_url,
         n.page_count = $page_count,
         n.bates_range = $bates_range,
         n.person_count = $person_count,
         n.ee_url = $ee_url`,
    {
      id,
      name: doc.title,
      slug: toSlug(doc.title),
      caso_slug: CASO_SLUG,
      ingestion_wave: WAVE,
      confidence_tier: 'bronze',
      source: SOURCE,
      ee_doc_id: doc.id,
      title: doc.title,
      summary: doc.summary ?? null,
      date: doc.date ?? null,
      doc_source: doc.source ?? null,
      category: doc.category ?? null,
      tags: doc.tags ?? [],
      pdf_url: doc.pdf_url ?? null,
      source_url: doc.source_url ?? null,
      page_count: doc.page_count ?? null,
      bates_range: doc.bates_range ?? null,
      person_count: doc.person_count,
      ee_url: doc.url,
    },
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now()

  console.log('Wave 2 Ingestion - Epstein Exposed API')
  console.log('=========================================')
  console.log(`Rate limit delay: ${RATE_LIMIT_DELAY_MS / 1000}s between pages`)
  console.log(`Page size: ${PAGE_SIZE}`)
  console.log(`Max document pages per run: ${MAX_DOCUMENT_PAGES}`)

  // ── Load resume state ────────────────────────────────────────────────────
  const resumeState = loadResumeState(WAVE)
  const personsStartPage: number = (resumeState?.personsPage as number) ?? 1
  const flightsStartPage: number = (resumeState?.flightsPage as number) ?? 1
  const documentsStartPage: number = (resumeState?.documentsPage as number) ?? 1

  if (resumeState) {
    console.log(`\nResuming from saved state:`)
    console.log(`  Persons start page:   ${personsStartPage}`)
    console.log(`  Flights start page:   ${flightsStartPage}`)
    console.log(`  Documents start page: ${documentsStartPage}`)
  }

  // ── Connect ──────────────────────────────────────────────────────────────
  console.log('\nConnecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Exiting.')
    process.exit(1)
  }
  console.log('Connected.')

  // ── Build dedup maps ─────────────────────────────────────────────────────
  console.log('\nBuilding dedup maps from existing caso-epstein nodes...')
  const { nameMap, slugMap } = await buildExistingMaps(CASO_SLUG)
  console.log(`  Existing nodes indexed: ${nameMap.size}`)

  const conflicts: ConflictRecord[] = []

  // ── Phase 1: Persons ─────────────────────────────────────────────────────
  const {
    nodesCreated: personNodesCreated,
    nodesSkipped: personNodesSkipped,
    personIdMap,
  } = await ingestPersons(nameMap, slugMap, conflicts, personsStartPage)

  saveResumeState(WAVE, {
    wave: WAVE,
    source: SOURCE,
    personsPage: 'done',
    flightsPage: flightsStartPage,
    documentsPage: documentsStartPage,
    nodesProcessed: personNodesCreated + personNodesSkipped,
    startedAt: new Date().toISOString(),
    phase: 'flights',
  })

  // ── Phase 2: Flights ──────────────────────────────────────────────────────
  const { edgesCreated, edgesSkipped, flightNodesCreated } = await ingestFlights(
    personIdMap,
    flightsStartPage,
  )

  saveResumeState(WAVE, {
    wave: WAVE,
    source: SOURCE,
    personsPage: 'done',
    flightsPage: 'done',
    documentsPage: documentsStartPage,
    nodesProcessed: personNodesCreated + personNodesSkipped + flightNodesCreated,
    startedAt: new Date().toISOString(),
    phase: 'documents',
  })

  // ── Phase 3: Documents (capped) ───────────────────────────────────────────
  const { docsCreated, docsSkipped, lastDocPage } = await ingestDocuments(
    nameMap,
    slugMap,
    conflicts,
    documentsStartPage,
  )

  saveResumeState(WAVE, {
    wave: WAVE,
    source: SOURCE,
    personsPage: 'done',
    flightsPage: 'done',
    documentsPage: lastDocPage + 1,
    nodesProcessed:
      personNodesCreated + personNodesSkipped + flightNodesCreated + docsCreated + docsSkipped,
    startedAt: new Date().toISOString(),
    phase: docsCreated >= MAX_DOCUMENT_PAGES * PAGE_SIZE ? 'documents_partial' : 'complete',
  })

  // ── Save conflicts and print report ──────────────────────────────────────
  const conflictPath = saveConflicts(WAVE, conflicts)
  console.log(`\nConflicts saved to: ${conflictPath}`)

  const totalNodesCreated = personNodesCreated + flightNodesCreated + docsCreated
  const totalNodesSkipped = personNodesSkipped + docsSkipped
  const totalEdgesCreated = edgesCreated

  const report: WaveReport = {
    wave: WAVE,
    source: SOURCE,
    nodesCreated: totalNodesCreated,
    nodesSkipped: totalNodesSkipped,
    edgesCreated: totalEdgesCreated,
    edgesSkipped,
    conflicts,
    durationMs: Date.now() - startMs,
  }

  printReport(report)

  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 2 ingestion failed:', error)
  closeDriver().finally(() => process.exit(1))
})
