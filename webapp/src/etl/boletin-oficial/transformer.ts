/**
 * Transforms Boletin Oficial data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 * Matches appointed officials to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  AuthorityRow,
  AwardRow,
  BoletinProvenanceParams,
  GovernmentAppointmentParams,
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
  MaybeSameAsAppointmentRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTHORITIES_SOURCE =
  'https://datos.gob.ar/dataset/jgm-estructura-organica-autoridades-poder-ejecutivo-nacional'
const CONTRACTS_SOURCE =
  'https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas'
const SUBMITTED_BY = 'etl:boletin-oficial'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceUrl: string, sourceKey: string): BoletinProvenanceParams {
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

/**
 * Build a stable ID for an authority row.
 * Uses cargo + jurisdiccion + name as composite key since there's no unique ID.
 */
function buildAppointmentId(row: AuthorityRow): string {
  const parts = [
    row.cargo,
    row.jurisdiccion,
    row.autoridad_nombre,
    row.autoridad_apellido,
  ]
    .map((s) => s.trim().toLowerCase())
    .join('::')
  return computeHash(parts)
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
// Authority/Appointment transformers
// ---------------------------------------------------------------------------

function transformAuthority(row: AuthorityRow): GovernmentAppointmentParams {
  const appointmentId = buildAppointmentId(row)
  const nombre = row.autoridad_nombre?.trim() ?? ''
  const apellido = row.autoridad_apellido?.trim() ?? ''
  const fullName = [nombre, apellido].filter(Boolean).join(' ')

  return {
    ...buildProvenance(AUTHORITIES_SOURCE, `authority:${appointmentId}`),
    appointment_id: appointmentId,
    person_name: nombre,
    person_apellido: apellido,
    full_name: fullName,
    cargo: row.cargo?.trim() ?? '',
    jurisdiccion: row.jurisdiccion?.trim() ?? '',
    subjurisdiccion: row.subjurisdiccion?.trim() ?? '',
    unidad: row.unidad?.trim() ?? '',
    tipo_administracion: row.tipo_administracion?.trim() ?? '',
    norma_designacion: row.autoridad_norma_designacion?.trim() ?? '',
    sexo: row.autoridad_sexo?.trim() ?? '',
    dni: row.autoridad_dni?.trim() ?? '',
    cuil: row.autoridad_cuil?.trim() ?? '',
  }
}

// ---------------------------------------------------------------------------
// Contract/Award transformers
// ---------------------------------------------------------------------------

function transformAward(row: AwardRow): {
  contract: PublicContractParams
  contractor: ContractorParams
  rel: AwardedToRelParams
} {
  const numProc = row['Número Procedimiento']?.trim() ?? ''
  const docContractual = row['Documento Contractual']?.trim() ?? ''
  const contractId = computeHash(`contract:${numProc}:${docContractual}`)

  const cuit = row['CUIT']?.trim() ?? ''
  const proveedorName = row['Descripción Proveedor']?.trim() ?? ''
  const contractorId = cuit || computeHash(`contractor:${proveedorName}`)

  const monto = parseAmount(row['Monto'] ?? '')

  const contract: PublicContractParams = {
    ...buildProvenance(CONTRACTS_SOURCE, `contract:${contractId}`),
    contract_id: contractId,
    numero_procedimiento: numProc,
    tipo_procedimiento: row['Tipo de Procedimiento']?.trim() ?? '',
    modalidad: row['Modalidad']?.trim() ?? '',
    ejercicio: row['Ejercicio']?.trim() ?? '',
    fecha_adjudicacion: row['Fecha de Adjudicación']?.trim() ?? '',
    organismo: row['Descripcion SAF']?.trim() ?? '',
    unidad_ejecutora: row['Unidad Ejecutora']?.trim() ?? '',
    rubros: row['Rubros']?.trim() ?? '',
    monto,
    moneda: row['Moneda']?.trim() ?? '',
    documento_contractual: docContractual,
  }

  const contractor: ContractorParams = {
    ...buildProvenance(CONTRACTS_SOURCE, `contractor:${contractorId}`),
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

/**
 * Match appointed officials to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence:
 * - 1.0 for exact normalized name match
 * - Skips ambiguous matches (multiple politicians with same normalized name)
 */
function matchPoliticians(
  appointments: readonly GovernmentAppointmentParams[],
  politicians: readonly PoliticianParams[],
): MaybeSameAsAppointmentRelParams[] {
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

  const matches: MaybeSameAsAppointmentRelParams[] = []

  for (const appt of appointments) {
    if (!appt.full_name || appt.full_name.trim() === '') continue

    const normalized = normalizeName(appt.full_name)
    const politicianId = lookup.get(normalized)

    if (politicianId) {
      matches.push({
        politician_id: politicianId,
        appointment_id: appt.appointment_id,
        confidence: 1.0,
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface BoletinTransformResult {
  readonly appointments: readonly GovernmentAppointmentParams[]
  readonly contracts: readonly PublicContractParams[]
  readonly contractors: readonly ContractorParams[]
  readonly awardedToRels: readonly AwardedToRelParams[]
  readonly maybeSameAsRels: readonly MaybeSameAsAppointmentRelParams[]
}

export interface BoletinTransformInput {
  readonly authorities: readonly AuthorityRow[]
  readonly awards: readonly AwardRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformBoletinAll(input: BoletinTransformInput): BoletinTransformResult {
  // --- Appointments ---
  const appointments = input.authorities.map(transformAuthority)

  // --- Contracts + Contractors ---
  const contractMap = new Map<string, PublicContractParams>()
  const contractorMap = new Map<string, ContractorParams>()
  const awardedToRels: AwardedToRelParams[] = []

  for (const row of input.awards) {
    const { contract, contractor, rel } = transformAward(row)

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
  const maybeSameAsRels = matchPoliticians(appointments, input.politicians)

  return {
    appointments,
    contracts,
    contractors,
    awardedToRels,
    maybeSameAsRels,
  }
}
