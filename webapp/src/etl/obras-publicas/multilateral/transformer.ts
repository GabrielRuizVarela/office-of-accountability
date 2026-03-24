/**
 * Transforms World Bank contract data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type {
  WBContractRow,
  MultilateralProjectParams,
  MultilateralContractorParams,
  MultilateralContractParams,
  FundedByRelParams,
  AwardedToRelParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL = 'https://finances.worldbank.org/resource/kdui-wcs3.json'
const SUBMITTED_BY = 'etl:multilateral'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function parseAmount(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  const num = parseFloat(raw.trim())
  return isNaN(num) ? 0 : num
}

function buildProvenance(ingestionKey: string) {
  const now = new Date().toISOString()
  return {
    source_url: SOURCE_URL,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(ingestionKey),
    created_at: now,
    updated_at: now,
  } as const
}

/**
 * Generate a stable contractor_id (and cuit stand-in) for WB suppliers
 * that have no CUIT. Uses sha256 of the normalized name, truncated to 16 chars.
 */
function contractorIdFromName(name: string): string {
  return computeHash(`wb-contractor:${name}`)
}

// ---------------------------------------------------------------------------
// Transform orchestrator
// ---------------------------------------------------------------------------

export interface MultilateralTransformResult {
  readonly projects: readonly MultilateralProjectParams[]
  readonly contractors: readonly MultilateralContractorParams[]
  readonly contracts: readonly MultilateralContractParams[]
  readonly fundedByRels: readonly FundedByRelParams[]
  readonly awardedToRels: readonly AwardedToRelParams[]
}

export function transformMultilateralAll(
  rows: readonly WBContractRow[],
): MultilateralTransformResult {
  const projectMap = new Map<string, MultilateralProjectParams>()
  const contractorMap = new Map<string, MultilateralContractorParams>()
  const contractMap = new Map<string, MultilateralContractParams>()
  const fundedByRels: FundedByRelParams[] = []
  const awardedToRels: AwardedToRelParams[] = []

  // Track cumulative project amounts
  const projectAmounts = new Map<string, number>()

  for (const row of rows) {
    const wbProjectId = (row.project_id ?? '').trim()
    const wbContractNumber = (row.wb_contract_number ?? '').trim()
    const supplierName = (row.supplier ?? '').trim()
    const amount = parseAmount(row.total_contract_amount_usd ?? '0')

    // Skip rows without a project ID or contract number
    if (!wbProjectId || !wbContractNumber) continue

    // --- Project node ---
    if (!projectMap.has(wbProjectId)) {
      projectMap.set(wbProjectId, {
        ...buildProvenance(`wb-project:${wbProjectId}`),
        project_id: wbProjectId,
        caso_slug: 'obras-publicas',
        funder: 'world_bank',
        name: (row.project_name ?? '').trim(),
        sector: (row.major_sector ?? '').trim(),
        amount_usd: 0, // will be summed below
        status: 'active',
        approval_date: (row.contract_signing_date ?? '').trim(),
      })
      projectAmounts.set(wbProjectId, 0)
    }
    projectAmounts.set(
      wbProjectId,
      (projectAmounts.get(wbProjectId) ?? 0) + amount,
    )

    // --- Contractor node (deduplicated by normalized name) ---
    if (supplierName) {
      const normalizedName = supplierName.toUpperCase().trim()
      if (!contractorMap.has(normalizedName)) {
        const cid = contractorIdFromName(normalizedName)
        contractorMap.set(normalizedName, {
          ...buildProvenance(`wb-contractor:${normalizedName}`),
          contractor_id: cid,
          caso_slug: 'obras-publicas',
          cuit: cid, // sha256 hash as cuit stand-in (unique constraint)
          name: supplierName,
          supplier_country: (row.supplier_country ?? '').trim(),
        })
      }
    }

    // --- Contract node ---
    const contractId = computeHash(`wb-contract:${wbContractNumber}`)
    if (!contractMap.has(wbContractNumber)) {
      contractMap.set(wbContractNumber, {
        ...buildProvenance(`wb-contract:${wbContractNumber}`),
        contract_id: contractId,
        caso_slug: 'obras-publicas',
        project_id: wbProjectId,
        supplier_name: supplierName,
        amount_usd: amount,
        contract_type: (row.procurement_type ?? '').trim(),
        contract_description: (row.contract_description ?? '').trim(),
        signing_date: (row.contract_signing_date ?? '').trim(),
      })
    }

    // --- Relationships ---
    fundedByRels.push({
      contract_id: contractId,
      project_id: wbProjectId,
    })

    if (supplierName) {
      const normalizedName = supplierName.toUpperCase().trim()
      const contractor = contractorMap.get(normalizedName)!
      awardedToRels.push({
        contract_id: contractId,
        contractor_id: contractor.contractor_id,
        amount_usd: amount,
      })
    }
  }

  // Patch project amounts with cumulative totals
  const projects: MultilateralProjectParams[] = []
  projectMap.forEach((proj, pid) => {
    projects.push({
      ...proj,
      amount_usd: projectAmounts.get(pid) ?? 0,
    })
  })

  return {
    projects,
    contractors: Array.from(contractorMap.values()),
    contracts: Array.from(contractMap.values()),
    fundedByRels,
    awardedToRels,
  }
}
