/**
 * ETL runner for Como Voto data pipeline.
 * Run with: npx tsx scripts/run-etl-como-voto.ts
 *
 * Pipeline: Fetch → Transform → Load
 * 1. Fetches legislators.json + votaciones.json from GitHub
 * 2. Fetches per-legislator detail files (with concurrency control)
 * 3. Transforms raw data into Neo4j node/relationship params
 * 4. Batch MERGEs everything into Neo4j
 *
 * Idempotent — safe to re-run (uses MERGE, not CREATE).
 * Requires NEO4J_URI, NEO4J_USER environment variables (see .env.example).
 */

import 'dotenv/config'
import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import {
  fetchLegislators,
  fetchVotingSessions,
  fetchLegislatorDetails,
  fetchLawNames,
  fetchElectionLegislators,
} from '../src/etl/como-voto'
import { transformAll } from '../src/etl/como-voto'
import { loadAll } from '../src/etl/como-voto'
import type { LoadStepResult } from '../src/etl/como-voto'

const CONCURRENCY = 10

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

function printStepResult(step: LoadStepResult): void {
  const status = step.errors.length === 0 ? '✓' : '⚠'
  console.log(`  ${status} ${step.label}: ${step.totalItems} items (${step.batchesRun} batches)`)

  for (const err of step.errors) {
    console.error(`    ERROR: ${err}`)
  }
}

async function main(): Promise<void> {
  const pipelineStart = Date.now()

  // ── 1. Verify Neo4j connectivity ──────────────────────────────────────
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j. Check NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD env vars.')
    process.exit(1)
  }
  console.log('Connected.\n')

  // ── 2. Fetch ──────────────────────────────────────────────────────────
  console.log('Fetching Como Voto data from GitHub...')
  const fetchStart = Date.now()

  const [legislatorsResult, sessionsResult, lawNamesResult, electionResult] = await Promise.all([
    fetchLegislators(),
    fetchVotingSessions(),
    fetchLawNames(),
    fetchElectionLegislators(),
  ])

  console.log(`  Legislators: ${legislatorsResult.count}`)
  console.log(`  Voting sessions: ${sessionsResult.count}`)
  console.log(`  Law names: ${lawNamesResult.count}`)
  console.log(`  Election years: ${electionResult.yearCount}`)

  const nameKeys = legislatorsResult.legislators.map((l) => l.k)
  console.log(`  Fetching ${nameKeys.length} legislator details (concurrency: ${CONCURRENCY})...`)

  const detailsResult = await fetchLegislatorDetails(nameKeys, { concurrency: CONCURRENCY })

  console.log(
    `  Details fetched: ${detailsResult.succeeded} succeeded, ${detailsResult.failed} failed`,
  )

  if (detailsResult.errors.length > 0) {
    console.warn(`  Failed fetches:`)
    for (const err of detailsResult.errors.slice(0, 10)) {
      console.warn(`    - ${err.nameKey}: ${err.error}`)
    }
    if (detailsResult.errors.length > 10) {
      console.warn(`    ... and ${detailsResult.errors.length - 10} more`)
    }
  }

  const fetchDuration = Date.now() - fetchStart
  console.log(`  Fetch complete in ${formatDuration(fetchDuration)}\n`)

  // ── 3. Transform ──────────────────────────────────────────────────────
  console.log('Transforming data...')
  const transformStart = Date.now()

  const transformed = transformAll({
    legislators: legislatorsResult.legislators,
    details: detailsResult.details,
    sessions: sessionsResult.sessions,
    lawNames: lawNamesResult.lawNames,
    electionData: electionResult.electionData,
  })

  const transformDuration = Date.now() - transformStart
  console.log(`  Politicians:      ${transformed.politicians.length}`)
  console.log(`  Parties:          ${transformed.parties.length}`)
  console.log(`  Provinces:        ${transformed.provinces.length}`)
  console.log(`  Voting sessions:  ${transformed.votingSessions.length}`)
  console.log(`  CAST_VOTE rels:   ${transformed.castVotes.length}`)
  console.log(`  MEMBER_OF rels:   ${transformed.memberOfRels.length}`)
  console.log(`  REPRESENTS rels:  ${transformed.representsRels.length}`)
  console.log(`  Terms:            ${transformed.terms.length}`)
  console.log(`  Legislation:      ${transformed.legislation.length}`)
  console.log(`  Elections:        ${transformed.elections.length}`)
  console.log(`  SERVED_TERM rels: ${transformed.servedTermRels.length}`)
  console.log(`  TERM_PARTY rels:  ${transformed.termPartyRels.length}`)
  console.log(`  TERM_PROVINCE:    ${transformed.termProvinceRels.length}`)
  console.log(`  VOTE_ON rels:     ${transformed.voteOnRels.length}`)
  console.log(`  RAN_IN rels:      ${transformed.ranInRels.length}`)
  console.log(`  Law name patches: ${transformed.lawNamePatches.length}`)
  console.log(`  Transform complete in ${formatDuration(transformDuration)}\n`)

  // ── 4. Load ───────────────────────────────────────────────────────────
  console.log('Loading into Neo4j...')

  const loadResult = await loadAll(transformed)

  for (const step of loadResult.steps) {
    printStepResult(step)
  }

  console.log(`  Load complete in ${formatDuration(loadResult.durationMs)}\n`)

  // ── Summary ───────────────────────────────────────────────────────────
  const totalDuration = Date.now() - pipelineStart
  const hasErrors = loadResult.totalErrors > 0 || detailsResult.failed > 0

  console.log('─'.repeat(50))
  console.log(`ETL pipeline ${hasErrors ? 'completed with warnings' : 'completed successfully'}`)
  console.log(`  Total duration: ${formatDuration(totalDuration)}`)
  console.log(`  Fetch errors:   ${detailsResult.failed}`)
  console.log(`  Load errors:    ${loadResult.totalErrors}`)

  await closeDriver()

  if (loadResult.totalErrors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('ETL pipeline failed:', error)
  closeDriver().finally(() => process.exit(1))
})
