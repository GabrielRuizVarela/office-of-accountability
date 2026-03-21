/**
 * Transforms Compr.ar ordenes de compra data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 * Matches contractors to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  ComprarOcRow,
  ComprarProvenanceParams,
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas'
const SUBMITTED_BY = 'etl:comprar'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): ComprarProvenanceParams {
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
 * Parse Argentine-format amount string to number.
 * Handles: "27164", "1957142.84", "1.957.142,84"
 */
function parseAmount(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  // If contains comma as decimal separator (Argentine format)
  const cleaned = raw.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  // If parseFloat on cleaned gives NaN, try direct parse (US format)
  if (isNaN(num)) {
    const direct = parseFloat(raw.trim())
    return isNaN(direct) ? 0 : direct
  }
  return num
}

// ---------------------------------------------------------------------------
// Row transformer
// ---------------------------------------------------------------------------

function transformOrder(row: ComprarOcRow): {
  contract: PublicContractParams
  contractor: ContractorParams
  rel: AwardedToRelParams
} {
  const numProc = row['Número Procedimiento']?.trim() ?? ''
  // Ordenes de compra don't have a separate Documento Contractual column;
  // use numero_procedimiento alone as the composite key.
  const contractId = computeHash(`contract:${numProc}`)

  const rawCuit = row['CUIT']?.trim() ?? ''
  const cuit = rawCuit.replace(/-/g, '')
  const proveedorName = row['Descripción Proveedor']?.trim() ?? ''
  const contractorId = cuit || computeHash(`contractor:${proveedorName}`)

  const monto = parseAmount(row['Monto'] ?? '')

  const contract: PublicContractParams = {
    ...buildProvenance(`contract:${contractId}`),
    contract_id: contractId,
    numero_procedimiento: numProc,
    tipo_procedimiento: row['Tipo de Procedimiento']?.trim() ?? '',
    modalidad: row['Modalidad']?.trim() ?? '',
    ejercicio: row['Ejercicio']?.trim() ?? '',
    fecha_adjudicacion: row['Fecha de perfeccionamiento OC']?.trim() ?? '',
    organismo: row['Descripcion SAF']?.trim() ?? '',
    unidad_ejecutora: row['Unidad Ejecutora']?.trim() ?? '',
    rubros: row['Rubros']?.trim() ?? '',
    monto,
    moneda: row['Moneda']?.trim() ?? '',
    documento_contractual: '',
  }

  const contractor: ContractorParams = {
    ...buildProvenance(`contractor:${contractorId}`),
    contractor_id: contractorId,
    cuit,
    name: proveedorName,
  }

  const rel: AwardedToRelParams = {
    contract_id: contractId,
    contractor_id: contractorId,
    monto,
    moneda: row['Moneda']?.trim() ?? '',
  }

  return { contract, contractor, rel }
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

export interface MaybeSameAsContractorRelParams {
  readonly politician_id: string
  readonly contractor_id: string
  readonly confidence: number
  readonly match_method: string
}

/**
 * Match contractors to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence:
 * - 0.8 for exact normalized name match
 * - Skips ambiguous matches (multiple politicians with same normalized name)
 */
function matchPoliticians(
  contractors: readonly ContractorParams[],
  politicians: readonly PoliticianParams[],
): MaybeSameAsContractorRelParams[] {
  // Build lookup: normalized name -> politician id (null if ambiguous)
  const lookup = new Map<string, string | null>()
  for (const p of politicians) {
    const key = normalizeName(p.full_name)
    if (lookup.has(key)) {
      lookup.set(key, null) // ambiguous
    } else {
      lookup.set(key, p.id)
    }
  }

  const matches: MaybeSameAsContractorRelParams[] = []

  for (const c of contractors) {
    if (!c.name || c.name.trim() === '') continue

    const normalized = normalizeName(c.name)
    const politicianId = lookup.get(normalized)

    if (politicianId) {
      matches.push({
        politician_id: politicianId,
        contractor_id: c.contractor_id,
        confidence: 0.8,
        match_method: 'normalized_name',
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface ComprarTransformResult {
  readonly contracts: readonly PublicContractParams[]
  readonly contractors: readonly ContractorParams[]
  readonly awardedToRels: readonly AwardedToRelParams[]
  readonly maybeSameAsRels: readonly MaybeSameAsContractorRelParams[]
}

export interface ComprarTransformInput {
  readonly orders: readonly ComprarOcRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformComprarAll(input: ComprarTransformInput): ComprarTransformResult {
  const contractMap = new Map<string, PublicContractParams>()
  const contractorMap = new Map<string, ContractorParams>()
  const awardedToRels: AwardedToRelParams[] = []

  for (const row of input.orders) {
    const { contract, contractor, rel } = transformOrder(row)

    // Deduplicate contracts by ID
    if (!contractMap.has(contract.contract_id)) {
      contractMap.set(contract.contract_id, contract)
    }

    // Deduplicate contractors by ID (CUIT or hash)
    if (!contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }

    awardedToRels.push(rel)
  }

  const contracts = [...contractMap.values()]
  const contractors = [...contractorMap.values()]

  // --- Politician matching ---
  const maybeSameAsRels = matchPoliticians(contractors, input.politicians)

  return {
    contracts,
    contractors,
    awardedToRels,
    maybeSameAsRels,
  }
}
