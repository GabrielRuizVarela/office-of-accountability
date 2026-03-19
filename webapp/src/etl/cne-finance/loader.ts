/**
 * ETL Loader — batch MERGE of CNE campaign finance data into Neo4j.
 *
 * Uses UNWIND for efficient batching. Idempotent via MERGE.
 */

import { executeWrite } from '../../lib/neo4j/client'

import type {
  CampaignDonationParams,
  DonorParams,
  PoliticalPartyFinanceParams,
  DonatedToRelParams,
  ReceivedDonationRelParams,
  DonorMaybeSameAsRelParams,
  PartyFinanceMaybeSameRelParams,
} from './types'
import type { CneTransformResult } from './transformer'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_BATCH_SIZE = 500
const REL_BATCH_SIZE = 1000

// ---------------------------------------------------------------------------
// Batching helper
// ---------------------------------------------------------------------------

function chunk<T>(items: readonly T[], size: number): readonly T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

interface LoadStepResult {
  readonly label: string
  readonly totalItems: number
  readonly batchesRun: number
  readonly errors: readonly string[]
}

async function runBatched<T extends object>(
  label: string,
  items: readonly T[],
  batchSize: number,
  cypher: string,
): Promise<LoadStepResult> {
  const batches = chunk(items, batchSize)
  const errors: string[] = []
  let batchesRun = 0

  for (const batch of batches) {
    try {
      await executeWrite(cypher, { batch })
      batchesRun += 1
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`${label} batch ${batchesRun + 1}: ${message}`)
    }
  }

  return { label, totalItems: items.length, batchesRun, errors }
}

// ---------------------------------------------------------------------------
// Node loaders
// ---------------------------------------------------------------------------

async function loadDonors(items: readonly DonorParams[]): Promise<LoadStepResult> {
  return runBatched('Donor', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS d
    MERGE (n:Donor {donor_id: d.donor_id})
    SET n += d
  `)
}

async function loadPartyFinanceNodes(
  items: readonly PoliticalPartyFinanceParams[],
): Promise<LoadStepResult> {
  return runBatched('PoliticalPartyFinance', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS p
    MERGE (n:PoliticalPartyFinance {party_finance_id: p.party_finance_id})
    SET n += p
  `)
}

async function loadDonations(
  items: readonly CampaignDonationParams[],
): Promise<LoadStepResult> {
  return runBatched('CampaignDonation', items, NODE_BATCH_SIZE, `
    UNWIND $batch AS d
    MERGE (n:CampaignDonation {donation_id: d.donation_id})
    SET n += d
  `)
}

// ---------------------------------------------------------------------------
// Relationship loaders
// ---------------------------------------------------------------------------

async function loadDonatedToRels(
  items: readonly DonatedToRelParams[],
): Promise<LoadStepResult> {
  return runBatched('DONATED_TO', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (d:Donor {donor_id: r.donor_id})
    MATCH (p:PoliticalPartyFinance {party_finance_id: r.party_finance_id})
    MATCH (don:CampaignDonation {donation_id: r.donation_id})
    MERGE (d)-[rel:DONATED_TO]->(p)
    ON CREATE SET rel.first_donation = don.date_iso
    SET rel.last_donation = don.date_iso
  `)
}

async function loadReceivedDonationRels(
  items: readonly ReceivedDonationRelParams[],
): Promise<LoadStepResult> {
  return runBatched('RECEIVED_DONATION', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:PoliticalPartyFinance {party_finance_id: r.party_finance_id})
    MATCH (don:CampaignDonation {donation_id: r.donation_id})
    MERGE (p)-[:RECEIVED_DONATION]->(don)
  `)
}

async function loadDonorMaybeSameAsRels(
  items: readonly DonorMaybeSameAsRelParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS (Donor-Politician)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (d:Donor {donor_id: r.donor_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(d)
    SET rel.confidence = r.confidence,
        rel.source = 'cne-finance'
  `)
}

async function loadPartyMaybeSameRels(
  items: readonly PartyFinanceMaybeSameRelParams[],
): Promise<LoadStepResult> {
  return runBatched('MAYBE_SAME_AS (Party-PartyFinance)', items, REL_BATCH_SIZE, `
    UNWIND $batch AS r
    MATCH (p:Party {id: r.party_id})
    MATCH (pf:PoliticalPartyFinance {party_finance_id: r.party_finance_id})
    MERGE (p)-[rel:MAYBE_SAME_AS]->(pf)
    SET rel.confidence = r.confidence,
        rel.source = 'cne-finance'
  `)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CneLoadResult {
  readonly steps: readonly LoadStepResult[]
  readonly totalErrors: number
  readonly durationMs: number
}

export async function loadCneAll(data: CneTransformResult): Promise<CneLoadResult> {
  const start = Date.now()
  const steps: LoadStepResult[] = []

  // Phase 1: Nodes (order matters — donors and parties before donations)
  steps.push(await loadDonors(data.donors))
  steps.push(await loadPartyFinanceNodes(data.partyFinanceNodes))
  steps.push(await loadDonations(data.donations))

  // Phase 2: Relationships
  steps.push(await loadDonatedToRels(data.donatedToRels))
  steps.push(await loadReceivedDonationRels(data.receivedDonationRels))
  steps.push(await loadDonorMaybeSameAsRels(data.donorMaybeSameAsRels))
  steps.push(await loadPartyMaybeSameRels(data.partyMaybeSameRels))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return { steps, totalErrors, durationMs: Date.now() - start }
}
