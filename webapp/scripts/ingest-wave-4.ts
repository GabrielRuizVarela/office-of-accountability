/**
 * Wave 4 Ingestion Script - dleerdefi/epstein-network-data flight logs
 * Run with: npx tsx scripts/ingest-wave-4.ts
 *
 * Imports handwritten pilot logbook data (153 parsed JSON pages) from the
 * dleerdefi dataset into Neo4j as silver-tier nodes scoped to caso-epstein.
 *
 * Data must be pre-cloned to _ingestion_data/dleerdefi/:
 *   git clone --depth 1 https://github.com/dleerdefi/epstein-network-data.git \
 *     _ingestion_data/dleerdefi
 *
 * Source files consumed:
 *   - data/final/flight_logs/page_NNNN_analysis.json  (one file per logbook page)
 *
 * What this script creates:
 *   - Flight nodes (label: Flight) with date, route, aircraft metadata
 *   - Person nodes for identified passengers (deduped against existing graph)
 *   - ON_FLIGHT edges: (Person)-[:ON_FLIGHT]->(Flight)
 *   - FLEW_WITH edges: (Person)-[:FLEW_WITH]->(Person) for all passenger pairs
 *
 * Node IDs:
 *   - Flights:  ep-w4-f{flight_number}  (or ep-w4-f{page}-{idx} if no flight_number)
 *   - Persons:  ep-w4-{slug}
 *
 * All nodes receive: caso_slug, ingestion_wave: 4, confidence_tier: 'silver',
 *                    source: 'dleerdefi'
 *
 * Unidentified passengers (type: 'unidentified') are skipped for Person creation
 * but are counted in the summary.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { normalizeName, toSlug, dedup, buildExistingMaps } from '../src/lib/ingestion/dedup'
import { saveConflicts, printReport } from '../src/lib/ingestion/quality'
import type { ConflictRecord, WaveReport } from '../src/lib/ingestion/types'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WAVE = 4
const SOURCE = 'dleerdefi' as const
const CASO_SLUG = 'caso-epstein'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'dleerdefi', 'data', 'final', 'flight_logs')

// ---------------------------------------------------------------------------
// Source data types (dleerdefi flight log schema)
// ---------------------------------------------------------------------------

interface FlightDate {
  parsed?: string
  display?: string
  original?: string
  confidence?: string
}

interface FlightAircraft {
  make_model?: string
  tail_number?: string
  confidence?: string
}

interface FlightRoute {
  from?: string
  to?: string
  confidence?: string
}

interface FlightData {
  flight_number?: string
  miles_flown?: string
  confidence?: string
}

interface FlightPassenger {
  name: string
  code?: string | null
  type?: string
  confidence?: string
  notable?: boolean
  gender?: string
}

interface LogbookFlight {
  date?: FlightDate
  aircraft?: FlightAircraft
  route?: FlightRoute
  flight_data?: FlightData
  passengers?: FlightPassenger[]
  remarks?: string
}

interface LogbookPage {
  page_number?: number
  date_header?: {
    year?: number
    month?: string
  }
  flights?: LogbookFlight[]
}

// ---------------------------------------------------------------------------
// Helpers - node ID generation
// ---------------------------------------------------------------------------

function toFlightId(flightNumber: string): string {
  return `ep-w4-f${flightNumber}`
}

function toPersonId(name: string): string {
  return `ep-w4-${toSlug(name)}`
}

// ---------------------------------------------------------------------------
// Create or merge a Flight node
// ---------------------------------------------------------------------------

async function createFlightNode(
  id: string,
  flight: LogbookFlight,
  pageNumber: number,
): Promise<void> {
  const origin = flight.route?.from ?? null
  const destination = flight.route?.to ?? null
  const date = flight.date?.parsed ?? null
  const tailNumber = flight.aircraft?.tail_number ?? null
  const makeModel = flight.aircraft?.make_model ?? null
  const flightNumber = flight.flight_data?.flight_number ?? null
  const milesFlown = flight.flight_data?.miles_flown ?? null
  const remarks = flight.remarks ?? null
  const dateConfidence = flight.date?.confidence ?? null
  const routeConfidence = flight.route?.confidence ?? null

  const name = [
    'Flight',
    flightNumber ? `#${flightNumber}` : null,
    origin && destination ? `${origin} → ${destination}` : null,
    date ? `(${date})` : null,
  ]
    .filter(Boolean)
    .join(' ')

  await executeWrite(
    `MERGE (n:Flight {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.flight_date = $flight_date,
         n.origin = $origin,
         n.destination = $destination,
         n.tail_number = $tail_number,
         n.make_model = $make_model,
         n.flight_number = $flight_number,
         n.miles_flown = $miles_flown,
         n.remarks = $remarks,
         n.date_confidence = $date_confidence,
         n.route_confidence = $route_confidence,
         n.logbook_page = $logbook_page`,
    {
      id,
      name,
      slug: toSlug(name),
      caso_slug: CASO_SLUG,
      ingestion_wave: WAVE,
      confidence_tier: 'silver',
      source: SOURCE,
      flight_date: date,
      origin,
      destination,
      tail_number: tailNumber,
      make_model: makeModel,
      flight_number: flightNumber,
      miles_flown: milesFlown,
      remarks,
      date_confidence: dateConfidence,
      route_confidence: routeConfidence,
      logbook_page: pageNumber,
    },
  )
}

// ---------------------------------------------------------------------------
// Create or merge a Person node
// ---------------------------------------------------------------------------

async function createPersonNode(id: string, passenger: FlightPassenger): Promise<void> {
  const name = passenger.name
  await executeWrite(
    `MERGE (n:Person {id: $id})
     SET n.name = $name,
         n.slug = $slug,
         n.caso_slug = $caso_slug,
         n.ingestion_wave = $ingestion_wave,
         n.confidence_tier = $confidence_tier,
         n.source = $source,
         n.passenger_code = $passenger_code,
         n.notable = $notable`,
    {
      id,
      name,
      slug: toSlug(name),
      caso_slug: CASO_SLUG,
      ingestion_wave: WAVE,
      confidence_tier: 'silver',
      source: SOURCE,
      passenger_code: passenger.code ?? null,
      notable: passenger.notable ?? false,
    },
  )
}

// ---------------------------------------------------------------------------
// Create ON_FLIGHT edge: (Person)-[:ON_FLIGHT]->(Flight)
// ---------------------------------------------------------------------------

async function createOnFlightEdge(
  personId: string,
  flightId: string,
  flight: LogbookFlight,
): Promise<void> {
  await executeWrite(
    `MATCH (p {id: $personId}), (f:Flight {id: $flightId})
     MERGE (p)-[r:ON_FLIGHT]->(f)
     SET r.confidence_tier = 'silver',
         r.source = $source,
         r.ingestion_wave = $wave,
         r.flight_date = $flight_date,
         r.origin = $origin,
         r.destination = $destination`,
    {
      personId,
      flightId,
      source: SOURCE,
      wave: WAVE,
      flight_date: flight.date?.parsed ?? null,
      origin: flight.route?.from ?? null,
      destination: flight.route?.to ?? null,
    },
  )
}

// ---------------------------------------------------------------------------
// Create FLEW_WITH edge: (Person)-[:FLEW_WITH]->(Person)
// ---------------------------------------------------------------------------

async function createFlewWithEdge(
  aId: string,
  bId: string,
  flightId: string,
  flight: LogbookFlight,
): Promise<void> {
  await executeWrite(
    `MATCH (a {id: $aId}), (b {id: $bId})
     MERGE (a)-[r:FLEW_WITH]->(b)
     SET r.confidence_tier = 'silver',
         r.source = $source,
         r.ingestion_wave = $wave,
         r.w4_flight_id = $flightId,
         r.flight_date = $flight_date,
         r.origin = $origin,
         r.destination = $destination,
         r.tail_number = $tail_number`,
    {
      aId,
      bId,
      source: SOURCE,
      wave: WAVE,
      flightId,
      flight_date: flight.date?.parsed ?? null,
      origin: flight.route?.from ?? null,
      destination: flight.route?.to ?? null,
      tail_number: flight.aircraft?.tail_number ?? null,
    },
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now()

  console.log('Wave 4 Ingestion - dleerdefi Flight Log Data')
  console.log('=============================================')

  // ── Check data directory exists ─────────────────────────────────────────
  if (!existsSync(DATA_DIR)) {
    console.error('\n  ERROR: Flight log data not found at', DATA_DIR)
    console.error('\n  Please clone the source repo first:')
    console.error(
      '\n    git clone --depth 1 https://github.com/dleerdefi/epstein-network-data.git \\',
    )
    console.error('      _ingestion_data/dleerdefi\n')
    process.exit(1)
  }

  // ── Discover JSON files ──────────────────────────────────────────────────
  const jsonFiles = readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  console.log(`  Found ${jsonFiles.length} logbook page files in ${DATA_DIR}\n`)

  // ── Connect ─────────────────────────────────────────────────────────────
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Exiting.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // ── Build existing node dedup maps ───────────────────────────────────────
  console.log('Building dedup maps from existing caso-epstein nodes...')
  const { nameMap, slugMap } = await buildExistingMaps(CASO_SLUG)
  console.log(`  Existing nodes indexed: ${nameMap.size}\n`)

  // ── Tracking counters ────────────────────────────────────────────────────
  const conflicts: ConflictRecord[] = []
  let flightNodesCreated = 0
  let personNodesCreated = 0
  let personNodesSkipped = 0
  let onFlightEdgesCreated = 0
  let flewWithEdgesCreated = 0
  let edgesSkipped = 0
  let unidentifiedPassengersSkipped = 0
  let flightsWithNoNumber = 0

  // Map flightId → list of resolved person Neo4j IDs (for FLEW_WITH creation)
  // Populated as we process each flight.

  // ── Process each page file ───────────────────────────────────────────────
  console.log('Processing logbook pages...')

  for (const filename of jsonFiles) {
    const filepath = join(DATA_DIR, filename)
    let page: LogbookPage

    try {
      page = JSON.parse(readFileSync(filepath, 'utf-8')) as LogbookPage
    } catch (err) {
      console.warn(`  WARN: Failed to parse ${filename}: ${err}`)
      continue
    }

    const pageNumber = page.page_number ?? 0
    const flights = page.flights ?? []

    for (let flightIdx = 0; flightIdx < flights.length; flightIdx++) {
      const flight = flights[flightIdx]

      // ── Determine flight ID ────────────────────────────────────────────
      const rawFlightNumber = flight.flight_data?.flight_number?.trim()
      let flightId: string
      if (rawFlightNumber && rawFlightNumber !== '' && /^\d+$/.test(rawFlightNumber)) {
        flightId = toFlightId(rawFlightNumber)
      } else {
        // Fall back to page+index for unnumbered or non-numeric entries
        flightId = `ep-w4-page${pageNumber}-idx${flightIdx}`
        flightsWithNoNumber++
      }

      // ── Create Flight node ─────────────────────────────────────────────
      await createFlightNode(flightId, flight, pageNumber)
      flightNodesCreated++

      // ── Resolve passengers ─────────────────────────────────────────────
      const passengers = flight.passengers ?? []
      const resolvedPersonIds: string[] = []

      for (const passenger of passengers) {
        // Skip unidentified passengers (e.g. "1 Passenger", "1 Male")
        if (passenger.type === 'unidentified') {
          unidentifiedPassengersSkipped++
          continue
        }

        // Skip entries with no usable name
        const name = passenger.name?.trim()
        if (!name) {
          unidentifiedPassengersSkipped++
          continue
        }

        // ── Dedup against existing nodes ─────────────────────────────────
        const dedupMatch = dedup(name, nameMap, slugMap)

        let personNeo4jId: string

        if (dedupMatch.result === 'exact_match') {
          personNeo4jId = dedupMatch.existingId!
          personNodesSkipped++
        } else {
          if (dedupMatch.result === 'fuzzy_match') {
            conflicts.push({
              incomingId: toPersonId(name),
              incomingName: name,
              existingId: dedupMatch.existingId!,
              existingName: dedupMatch.existingName!,
              matchType: 'fuzzy_match',
              distance: dedupMatch.distance,
              source: SOURCE,
              wave: WAVE,
            })
            // Fall through - still create the silver node
          }

          personNeo4jId = toPersonId(name)
          await createPersonNode(personNeo4jId, passenger)

          // Register in dedup maps so later passengers don't conflict
          const norm = normalizeName(name)
          const slug = toSlug(name)
          nameMap.set(norm, { id: personNeo4jId, name })
          slugMap.set(slug, { id: personNeo4jId, name })

          personNodesCreated++
        }

        resolvedPersonIds.push(personNeo4jId)

        // ── ON_FLIGHT edge ─────────────────────────────────────────────
        try {
          await createOnFlightEdge(personNeo4jId, flightId, flight)
          onFlightEdgesCreated++
        } catch {
          edgesSkipped++
        }
      }

      // ── FLEW_WITH edges (all pairs) ─────────────────────────────────────
      for (let i = 0; i < resolvedPersonIds.length; i++) {
        for (let j = i + 1; j < resolvedPersonIds.length; j++) {
          const aId = resolvedPersonIds[i]
          const bId = resolvedPersonIds[j]
          try {
            await createFlewWithEdge(aId, bId, flightId, flight)
            flewWithEdgesCreated++
          } catch {
            edgesSkipped++
          }
        }
      }
    }

    // Progress update every 5 pages
    if (pageNumber % 5 === 0 || pageNumber === 1) {
      console.log(
        `  Page ${String(pageNumber).padStart(3, '0')}: ` +
          `${flights.length} flights - ` +
          `${flightNodesCreated} flights, ${personNodesCreated} persons created so far`,
      )
    }
  }

  console.log('\nIngestion complete.')
  console.log(`  Flights with no numeric flight_number: ${flightsWithNoNumber}`)
  console.log(`  Unidentified passengers skipped:       ${unidentifiedPassengersSkipped}\n`)

  // ── Save conflicts and print report ─────────────────────────────────────
  const conflictPath = saveConflicts(WAVE, conflicts)
  console.log(`Conflicts saved to: ${conflictPath}`)

  const totalNodesCreated = flightNodesCreated + personNodesCreated
  const totalNodesSkipped = personNodesSkipped
  const totalEdgesCreated = onFlightEdgesCreated + flewWithEdgesCreated

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

  console.log('\n  Breakdown:')
  console.log(`    Flight nodes created:  ${flightNodesCreated}`)
  console.log(`    Person nodes created:  ${personNodesCreated}`)
  console.log(`    Person nodes skipped:  ${personNodesSkipped} (duplicates)`)
  console.log(`    ON_FLIGHT edges:       ${onFlightEdgesCreated}`)
  console.log(`    FLEW_WITH edges:       ${flewWithEdgesCreated}`)

  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 4 ingestion failed:', error)
  closeDriver().finally(() => process.exit(1))
})
