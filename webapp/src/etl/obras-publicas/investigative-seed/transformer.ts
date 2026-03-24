/**
 * Transforms investigative seed JSON data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type {
  SeedFile,
  InvestigativeProvenanceParams,
  BriberyCaseParams,
  IntermediaryParams,
  SeedContractorParams,
  SeedPublicWorkParams,
  CaseInvolvesRelParams,
  BribedByRelParams,
  IntermediatedRelParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUBMITTED_BY = 'etl:investigative-seed'
const CONFIDENCE_SCORE = 0.6
const TIER = 'bronze' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string, sourceUrl: string): InvestigativeProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: sourceUrl,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

function cleanCuit(raw: string): string {
  return (raw ?? '').trim().replace(/-/g, '')
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface InvestigativeSeedTransformResult {
  readonly briberyCases: readonly BriberyCaseParams[]
  readonly intermediaries: readonly IntermediaryParams[]
  readonly contractors: readonly SeedContractorParams[]
  readonly publicWorks: readonly SeedPublicWorkParams[]
  readonly caseInvolvesRels: readonly CaseInvolvesRelParams[]
  readonly bribedByRels: readonly BribedByRelParams[]
  readonly intermediatedRels: readonly IntermediatedRelParams[]
}

export function transformSeedFile(seed: SeedFile): InvestigativeSeedTransformResult {
  const sourceUrl = seed.source_urls?.[0] ?? ''
  const caseId = computeHash(`case:${seed.case_name}`)

  // --- BriberyCase node ---
  const briberyCase: BriberyCaseParams = {
    ...buildProvenance(`case:${seed.case_name}`, sourceUrl),
    case_id: caseId,
    caso_slug: 'obras-publicas',
    name: seed.case_name,
    source_case: seed.source_case,
    total_bribes_usd: seed.total_bribes_usd,
    period_start: seed.period.start,
    period_end: seed.period.end,
    jurisdiction: seed.jurisdiction,
  }

  // --- Intermediaries ---
  const intermediaryMap = new Map<string, IntermediaryParams>()
  const intermediatedRels: IntermediatedRelParams[] = []

  for (const inter of seed.intermediaries) {
    const cuit = cleanCuit(inter.cuit)
    const intermediaryId = cuit || computeHash(`intermediary:${inter.name}`)

    if (!intermediaryMap.has(intermediaryId)) {
      intermediaryMap.set(intermediaryId, {
        ...buildProvenance(`intermediary:${inter.name}`, sourceUrl),
        intermediary_id: intermediaryId,
        caso_slug: 'obras-publicas',
        name: inter.name,
        role: inter.role,
        cuit,
        dni: (inter.dni ?? '').trim(),
      })
    }

    intermediatedRels.push({
      intermediary_id: intermediaryId,
      case_id: caseId,
    })
  }

  // --- Companies → Contractors ---
  const contractorMap = new Map<string, SeedContractorParams>()
  const caseInvolvesRels: CaseInvolvesRelParams[] = []

  for (const company of seed.companies) {
    const cuit = cleanCuit(company.cuit)
    const contractorId = cuit || computeHash(`seed-contractor:${company.name}`)

    if (!contractorMap.has(contractorId)) {
      contractorMap.set(contractorId, {
        ...buildProvenance(`contractor:${company.name}`, sourceUrl),
        contractor_id: contractorId,
        caso_slug: 'obras-publicas',
        cuit,
        name: company.name,
      })
    }

    caseInvolvesRels.push({
      case_id: caseId,
      entity_id: contractorId,
      entity_label: 'Contractor',
      role: company.role,
    })
  }

  // --- Projects → PublicWorks ---
  const publicWorks: SeedPublicWorkParams[] = []

  for (const project of seed.projects) {
    const workId = computeHash(`seed-work:${seed.case_name}:${project.name}`)

    publicWorks.push({
      ...buildProvenance(`work:${project.name}`, sourceUrl),
      work_id: workId,
      caso_slug: 'obras-publicas',
      name: project.name,
      description: `${seed.case_name} — ${project.sector}`,
      sector: project.sector,
      province: project.province,
      status: 'completed',
      bribe_amount_usd: project.bribe_amount_usd,
      contract_value_usd: project.contract_value_usd,
    })

    caseInvolvesRels.push({
      case_id: caseId,
      entity_id: workId,
      entity_label: 'PublicWork',
      role: 'project',
    })
  }

  // --- Politicians → BRIBED_BY rels ---
  const bribedByRels: BribedByRelParams[] = []

  for (const pol of seed.politicians) {
    bribedByRels.push({
      case_id: caseId,
      politician_name: pol.name,
      position: pol.position,
      period: pol.period,
    })
  }

  return {
    briberyCases: [briberyCase],
    intermediaries: [...intermediaryMap.values()],
    contractors: [...contractorMap.values()],
    publicWorks,
    caseInvolvesRels,
    bribedByRels,
    intermediatedRels,
  }
}

/**
 * Transform multiple seed files and merge results.
 */
export function transformAllSeeds(seeds: readonly SeedFile[]): InvestigativeSeedTransformResult {
  const merged: InvestigativeSeedTransformResult = {
    briberyCases: [],
    intermediaries: [],
    contractors: [],
    publicWorks: [],
    caseInvolvesRels: [],
    bribedByRels: [],
    intermediatedRels: [],
  }

  for (const seed of seeds) {
    const result = transformSeedFile(seed)
    ;(merged.briberyCases as BriberyCaseParams[]).push(...result.briberyCases)
    ;(merged.intermediaries as IntermediaryParams[]).push(...result.intermediaries)
    ;(merged.contractors as SeedContractorParams[]).push(...result.contractors)
    ;(merged.publicWorks as SeedPublicWorkParams[]).push(...result.publicWorks)
    ;(merged.caseInvolvesRels as CaseInvolvesRelParams[]).push(...result.caseInvolvesRels)
    ;(merged.bribedByRels as BribedByRelParams[]).push(...result.bribedByRels)
    ;(merged.intermediatedRels as IntermediatedRelParams[]).push(...result.intermediatedRels)
  }

  return merged
}
