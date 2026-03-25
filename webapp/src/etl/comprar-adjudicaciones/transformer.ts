/**
 * Transforms Compr.ar adjudicaciones data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 * Skips contractors without a CUIT (unique constraint).
 */

import { createHash } from 'node:crypto'

import type {
  AdjudicacionRow,
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas'
const SUBMITTED_BY = 'etl:comprar-adjudicaciones'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const
const CASO_SLUG = 'obras-publicas'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string) {
  const now = new Date().toISOString()
  return {
    source_url: SOURCE_URL,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

/**
 * Clean CUIT: remove dashes. Returns empty string if no valid CUIT.
 */
function cleanCuit(raw: string): string {
  const cleaned = raw.replace(/-/g, '').trim()
  // Must be 11 digits
  if (!/^\d{11}$/.test(cleaned)) return ''
  return cleaned
}

/**
 * Parse Argentine-format amount string to number.
 * Handles: "27164", "1957142.84", "1.957.142,84"
 */
function parseAmount(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  const trimmed = raw.trim()

  // If it has comma as decimal separator (Argentine format: 1.957.142,84)
  if (trimmed.includes(',')) {
    const cleaned = trimmed.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // Otherwise parse directly (US/simple format: 1957142.84 or 27164)
  const num = parseFloat(trimmed)
  return isNaN(num) ? 0 : num
}

// ---------------------------------------------------------------------------
// Row transformer
// ---------------------------------------------------------------------------

interface TransformRowResult {
  contract: PublicContractParams
  contractor: ContractorParams
  rel: AwardedToRelParams
}

function transformRow(row: AdjudicacionRow): TransformRowResult | null {
  const cuit = cleanCuit(row.cuit)

  // Skip rows without valid CUIT -- unique constraint on Contractor
  if (!cuit) return null

  const numProc = row.numero_procedimiento
  const docContr = row.documento_contractual
  const contractKey = `adj:${numProc}:${docContr}:${cuit}`
  const contractId = computeHash(contractKey)

  const contractorId = cuit

  const monto = parseAmount(row.monto)

  const contract: PublicContractParams = {
    ...buildProvenance(`contract:${contractKey}`),
    contract_id: contractId,
    numero_procedimiento: numProc,
    tipo_procedimiento: row.tipo_procedimiento,
    modalidad: row.modalidad,
    ejercicio: row.ejercicio,
    fecha_adjudicacion: row.fecha_adjudicacion,
    organismo: row.organismo,
    unidad_ejecutora: row.unidad_ejecutora,
    rubros: row.rubros,
    monto,
    moneda: row.moneda,
    documento_contractual: docContr,
  }

  const contractor: ContractorParams = {
    ...buildProvenance(`contractor:${cuit}`),
    contractor_id: contractorId,
    cuit,
    name: row.proveedor,
  }

  const rel: AwardedToRelParams = {
    contract_id: contractId,
    contractor_id: contractorId,
    monto,
    moneda: row.moneda,
  }

  return { contract, contractor, rel }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface AdjudicacionesTransformResult {
  readonly contracts: readonly PublicContractParams[]
  readonly contractors: readonly ContractorParams[]
  readonly awardedToRels: readonly AwardedToRelParams[]
  readonly skippedNoCuit: number
  readonly casoSlug: string
}

export function transformAdjudicacionesAll(
  rows: readonly AdjudicacionRow[],
): AdjudicacionesTransformResult {
  const contractMap = new Map<string, PublicContractParams>()
  const contractorMap = new Map<string, ContractorParams>()
  const awardedToRels: AwardedToRelParams[] = []
  let skippedNoCuit = 0

  for (const row of rows) {
    const result = transformRow(row)

    if (!result) {
      skippedNoCuit++
      continue
    }

    const { contract, contractor, rel } = result

    // Deduplicate contracts by ID
    if (!contractMap.has(contract.contract_id)) {
      contractMap.set(contract.contract_id, contract)
    }

    // Deduplicate contractors by CUIT
    if (!contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }

    awardedToRels.push(rel)
  }

  return {
    contracts: [...contractMap.values()],
    contractors: [...contractorMap.values()],
    awardedToRels,
    skippedNoCuit,
    casoSlug: CASO_SLUG,
  }
}
