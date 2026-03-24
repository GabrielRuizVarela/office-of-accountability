/**
 * Transforms CABA BAC_OCDS releases into Neo4j node/relationship parameters.
 *
 * Maps OCDS standard fields to our existing obras-publicas graph schema:
 *   - tender  -> ObrasProcedure
 *   - award   -> Bid (with status 'adjudicada')
 *   - party (supplier role) -> Contractor
 *   - contract -> PublicContract
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type { OcdsRelease } from './types'
import type {
  ObrasProvenanceParams,
  ObrasProcedureParams,
  ObrasBidParams,
  ObrasContractorParams,
  ObrasPublicContractParams,
  BidOnRelParams,
  BidderRelParams,
  ObrasAwardedToRelParams,
} from '../contratar/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://data.buenosaires.gob.ar/dataset/buenos-aires-compras'
const SUBMITTED_BY = 'etl:ocds-provincial'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): ObrasProvenanceParams {
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
 * Extract CUIT from OCDS party/supplier id.
 * Formats seen: "AR-CUIT-30-57894432-6-supplier", "30-57894432-6"
 * Returns cleaned CUIT (digits only, no dashes) or empty string.
 */
function extractCuit(rawId: string): string {
  // Try to extract from AR-CUIT-XX-XXXXXXXX-X pattern
  const match = rawId.match(/(\d{2}-\d{7,8}-\d)/)
  if (match) {
    return match[1].replace(/-/g, '')
  }
  return ''
}

/**
 * For contractors without a CUIT, generate a deterministic hash-based ID
 * to avoid unique constraint violations.
 */
function contractorId(cuit: string, name: string): string {
  if (cuit) return cuit
  return `sha256:${computeHash(`contractor-no-cuit:${name}`)}`
}

// ---------------------------------------------------------------------------
// Release transformer
// ---------------------------------------------------------------------------

export interface OcdsTransformResult {
  readonly procedures: readonly ObrasProcedureParams[]
  readonly bids: readonly ObrasBidParams[]
  readonly contractors: readonly ObrasContractorParams[]
  readonly contracts: readonly ObrasPublicContractParams[]
  readonly bidOnRels: readonly BidOnRelParams[]
  readonly bidderRels: readonly BidderRelParams[]
  readonly awardedToRels: readonly ObrasAwardedToRelParams[]
}

function transformRelease(release: OcdsRelease): {
  procedure: ObrasProcedureParams | null
  bids: ObrasBidParams[]
  contractors: ObrasContractorParams[]
  contracts: ObrasPublicContractParams[]
  bidOnRels: BidOnRelParams[]
  bidderRels: BidderRelParams[]
  awardedToRels: ObrasAwardedToRelParams[]
} {
  const bids: ObrasBidParams[] = []
  const contractors: ObrasContractorParams[] = []
  const contracts: ObrasPublicContractParams[] = []
  const bidOnRels: BidOnRelParams[] = []
  const bidderRels: BidderRelParams[] = []
  const awardedToRels: ObrasAwardedToRelParams[] = []

  const ocid = release.ocid || ''
  const tender = release.tender

  // --- Procedure from tender ---
  let procedure: ObrasProcedureParams | null = null
  let procedureId = ''

  if (tender) {
    const tenderId = tender.id || ocid
    procedureId = computeHash(`ocds-proc:${tenderId}`)

    const tenderValue = tender.value?.amount ?? 0
    const tenderCurrency = tender.value?.currency ?? 'ARS'

    procedure = {
      ...buildProvenance(`ocds-proc:${tenderId}`),
      procedure_id: procedureId,
      caso_slug: 'obras-publicas',
      numero_procedimiento: tenderId,
      nombre: tender.title || '',
      tipo_procedimiento: tender.procurementMethodDetails || tender.procurementMethod || '',
      modalidad: tender.mainProcurementCategory || '',
      organismo: (() => {
        // Extract procuring entity name from parties
        const procuringParty = release.parties.find((p) =>
          p.roles.includes('procuringEntity'),
        )
        return procuringParty?.name ?? ''
      })(),
      estado: tender.status || '',
      fecha_publicacion: release.date || '',
      monto_estimado: tenderValue,
    }
  }

  // --- Bids from awards ---
  for (const award of release.awards) {
    const awardValue = award.value?.amount ?? 0
    const awardCurrency = award.value?.currency ?? 'ARS'

    for (const supplier of award.suppliers) {
      const supplierName = supplier.name || ''
      const rawCuit = extractCuit(supplier.id || '')
      const cId = contractorId(rawCuit, supplierName)
      const bidId = computeHash(`ocds-bid:${ocid}:${award.id}:${cId}`)

      // Bid node
      bids.push({
        ...buildProvenance(`ocds-bid:${ocid}:${award.id}:${cId}`),
        bid_id: bidId,
        caso_slug: 'obras-publicas',
        procedure_number: tender?.id || ocid,
        bidder_name: supplierName,
        bidder_cuit: rawCuit,
        amount: awardValue,
        currency: awardCurrency,
        date: award.date || release.date || '',
        status: award.status === 'active' ? 'adjudicada' : award.status || '',
        orden_merito: 1, // Award winners are rank 1
      })

      // Contractor node — use cId as cuit fallback to avoid unique constraint violation
      contractors.push({
        ...buildProvenance(`contractor:${cId}`),
        contractor_id: cId,
        caso_slug: 'obras-publicas',
        cuit: rawCuit || cId,
        name: supplierName,
        is_ute: false,
      })

      // Bid -> Procedure relationship
      if (procedureId) {
        bidOnRels.push({
          bid_id: bidId,
          procedure_id: procedureId,
        })
      }

      // Contractor -> Bid relationship
      bidderRels.push({
        bid_id: bidId,
        contractor_id: cId,
      })
    }
  }

  // --- Contracts ---
  for (const contract of release.contracts) {
    const contractValue = contract.value?.amount ?? 0
    const contractCurrency = contract.value?.currency ?? 'ARS'
    const contractId = computeHash(`ocds-contract:${contract.id}`)

    contracts.push({
      ...buildProvenance(`ocds-contract:${contract.id}`),
      contract_id: contractId,
      caso_slug: 'obras-publicas',
      contrato_numero: contract.id || '',
      procedimiento_numero: tender?.id || ocid,
      nombre_obra: tender?.title || '',
      fecha_perfeccionamiento: contract.dateSigned || contract.period?.startDate || '',
      monto: contractValue,
      moneda: contractCurrency,
      funcionario_nombre: '',
      funcionario_cargo: '',
    })

    // Link contract to signatories (suppliers)
    for (const signatory of contract.signatories) {
      const rawCuit = extractCuit(signatory.id || '')
      const cId = contractorId(rawCuit, signatory.name || '')

      // Ensure contractor exists (may already be from award)
      if (!contractors.some((c) => c.contractor_id === cId)) {
        contractors.push({
          ...buildProvenance(`contractor:${cId}`),
          contractor_id: cId,
          caso_slug: 'obras-publicas',
          cuit: rawCuit || cId,
          name: signatory.name || '',
          is_ute: false,
        })
      }

      awardedToRels.push({
        contract_id: contractId,
        contractor_id: cId,
        monto: contractValue,
        moneda: contractCurrency,
      })
    }

    // If no signatories but awards have suppliers, link via award suppliers
    if (contract.signatories.length === 0) {
      const matchingAward = release.awards.find((a) => a.id === contract.awardID)
      if (matchingAward) {
        for (const supplier of matchingAward.suppliers) {
          const rawCuit = extractCuit(supplier.id || '')
          const cId = contractorId(rawCuit, supplier.name || '')

          awardedToRels.push({
            contract_id: contractId,
            contractor_id: cId,
            monto: contractValue,
            moneda: contractCurrency,
          })
        }
      }
    }
  }

  // --- Contractors from parties (supplier role) not yet captured ---
  for (const party of release.parties) {
    if (!party.roles.includes('supplier')) continue
    const rawCuit = extractCuit(party.identifier?.id || party.id || '')
    const cId = contractorId(rawCuit, party.name || '')

    if (!contractors.some((c) => c.contractor_id === cId)) {
      contractors.push({
        ...buildProvenance(`contractor:${cId}`),
        contractor_id: cId,
        caso_slug: 'obras-publicas',
        cuit: rawCuit || cId,
        name: party.name || '',
        is_ute: false,
      })
    }
  }

  return {
    procedure,
    bids,
    contractors,
    contracts,
    bidOnRels,
    bidderRels,
    awardedToRels,
  }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export function transformOcdsProvincialAll(
  releases: readonly OcdsRelease[],
): OcdsTransformResult {
  const procedureMap = new Map<string, ObrasProcedureParams>()
  const bidMap = new Map<string, ObrasBidParams>()
  const contractorMap = new Map<string, ObrasContractorParams>()
  const contractMap = new Map<string, ObrasPublicContractParams>()
  const bidOnRels: BidOnRelParams[] = []
  const bidderRels: BidderRelParams[] = []
  const awardedToRels: ObrasAwardedToRelParams[] = []

  for (const release of releases) {
    const result = transformRelease(release)

    if (result.procedure && !procedureMap.has(result.procedure.procedure_id)) {
      procedureMap.set(result.procedure.procedure_id, result.procedure)
    }

    for (const bid of result.bids) {
      if (!bidMap.has(bid.bid_id)) {
        bidMap.set(bid.bid_id, bid)
      }
    }

    for (const contractor of result.contractors) {
      if (!contractorMap.has(contractor.contractor_id)) {
        contractorMap.set(contractor.contractor_id, contractor)
      }
    }

    for (const contract of result.contracts) {
      if (!contractMap.has(contract.contract_id)) {
        contractMap.set(contract.contract_id, contract)
      }
    }

    bidOnRels.push(...result.bidOnRels)
    bidderRels.push(...result.bidderRels)
    awardedToRels.push(...result.awardedToRels)
  }

  return {
    procedures: [...procedureMap.values()],
    bids: [...bidMap.values()],
    contractors: [...contractorMap.values()],
    contracts: [...contractMap.values()],
    bidOnRels,
    bidderRels,
    awardedToRels,
  }
}
