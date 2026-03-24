/**
 * Transforms CONTRAT.AR data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type {
  ProcedimientoRow,
  OfertaRow,
  ContratoRow,
  ObraRow,
  UbicacionRow,
  ObrasProvenanceParams,
  ObrasProcedureParams,
  ObrasPublicWorkParams,
  ObrasBidParams,
  ObrasContractorParams,
  ObrasPublicContractParams,
  ProcedureForRelParams,
  BidOnRelParams,
  BidderRelParams,
  ContractedForRelParams,
  ObrasAwardedToRelParams,
  LocatedInProvinceRelParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://datos.gob.ar/dataset/jgm-contrataciones-obra-publica'
const SUBMITTED_BY = 'etl:contratar'
const CONFIDENCE_SCORE = 0.85
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

/**
 * Parse coordinate string to number, defaulting to 0.
 */
function parseCoord(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  const num = parseFloat(raw.trim().replace(',', '.'))
  return isNaN(num) ? 0 : num
}

/**
 * Clean CUIT: remove dashes.
 */
function cleanCuit(raw: string): string {
  return (raw ?? '').trim().replace(/-/g, '')
}

/**
 * Derive bid status from evaluada/desestimada/orden_merito fields.
 */
function deriveBidStatus(
  evaluada: string,
  desestimada: string,
  ordenMerito: string,
): string {
  if (desestimada?.trim().toLowerCase() === 'si') return 'desestimada'
  if (evaluada?.trim().toLowerCase() === 'si') {
    const merito = parseInt(ordenMerito?.trim() ?? '', 10)
    if (!isNaN(merito) && merito === 1) return 'adjudicada'
    return 'evaluada'
  }
  return 'presentada'
}

// ---------------------------------------------------------------------------
// Row transformers
// ---------------------------------------------------------------------------

export function transformProcedimiento(row: ProcedimientoRow): ObrasProcedureParams {
  const numero = row.procedimiento_numero?.trim() ?? ''
  const procedureId = computeHash(`proc:${numero}`)

  return {
    ...buildProvenance(`proc:${numero}`),
    procedure_id: procedureId,
    caso_slug: 'obras-publicas',
    numero_procedimiento: numero,
    nombre: row.procedimiento_nombre?.trim() ?? '',
    tipo_procedimiento: row.procedimiento_tipo?.trim() ?? '',
    modalidad: row.sistema_contratacion?.trim() ?? '',
    organismo: row.organismo_nombre?.trim() ?? '',
    estado: row.procedimiento_estado?.trim() ?? '',
    fecha_publicacion: row.publicacion_contratar_fecha?.trim() ?? '',
    monto_estimado: parseAmount(row.presupuesto_oficial_monto ?? ''),
  }
}

export function transformOferta(row: OfertaRow): {
  bid: ObrasBidParams
  contractor: ObrasContractorParams
  bidOnRel: BidOnRelParams
  bidderRel: BidderRelParams
} {
  const procNumero = row.procedimiento_numero?.trim() ?? ''
  const cuit = cleanCuit(row.oferente_cuit ?? '')
  const renglon = row.renglon_numero?.trim() ?? ''
  const bidId = computeHash(`bid:${procNumero}:${cuit}:${renglon}`)
  const procedureId = computeHash(`proc:${procNumero}`)

  const name = row.oferente_razon_social?.trim() ?? ''
  const contractorId = cuit || computeHash(`contractor:${name}`)
  const isUte = row.oferente_ute_si_no?.trim().toLowerCase() === 'si'

  const status = deriveBidStatus(
    row.evaluada_si_no ?? '',
    row.desestimada_si_no ?? '',
    row.orden_merito ?? '',
  )

  const ordenMerito = parseInt(row.orden_merito?.trim() ?? '', 10)

  const bid: ObrasBidParams = {
    ...buildProvenance(`bid:${procNumero}:${cuit}:${renglon}`),
    bid_id: bidId,
    caso_slug: 'obras-publicas',
    procedure_number: procNumero,
    bidder_name: name,
    bidder_cuit: cuit,
    amount: parseAmount(row.oferta_monto ?? ''),
    currency: 'ARS',
    date: '',
    status,
    orden_merito: isNaN(ordenMerito) ? 0 : ordenMerito,
  }

  const contractor: ObrasContractorParams = {
    ...buildProvenance(`contractor:${contractorId}`),
    contractor_id: contractorId,
    caso_slug: 'obras-publicas',
    cuit,
    name,
    is_ute: isUte,
  }

  const bidOnRel: BidOnRelParams = {
    bid_id: bidId,
    procedure_id: procedureId,
  }

  const bidderRel: BidderRelParams = {
    bid_id: bidId,
    contractor_id: contractorId,
  }

  return { bid, contractor, bidOnRel, bidderRel }
}

export function transformContrato(row: ContratoRow): {
  contract: ObrasPublicContractParams
  contractor: ObrasContractorParams
  awardedToRel: ObrasAwardedToRelParams
} {
  const contratoNumero = row.contrato_numero?.trim() ?? ''
  const contractId = computeHash(`contract:${contratoNumero}`)

  const cuit = cleanCuit(row.contratista_cuit ?? '')
  const name = row.contratista_razon_social?.trim() ?? ''
  const contractorId = cuit || computeHash(`contractor:${name}`)
  const isUte = row.contratista_ute_si_no?.trim().toLowerCase() === 'si'

  const monto = parseAmount(row.contrato_monto ?? '')
  const moneda = row.contrato_moneda?.trim() ?? 'ARS'

  const contract: ObrasPublicContractParams = {
    ...buildProvenance(`contract:${contratoNumero}`),
    contract_id: contractId,
    caso_slug: 'obras-publicas',
    contrato_numero: contratoNumero,
    procedimiento_numero: row.procedimiento_numero?.trim() ?? '',
    nombre_obra: row.nombre_obra?.trim() ?? '',
    fecha_perfeccionamiento: row.contrato_perfeccionamiento_fecha?.trim() ?? '',
    monto,
    moneda,
    funcionario_nombre: row.funcionario_contratante_nombre?.trim() ?? '',
    funcionario_cargo: row.funcionario_contratante_cargo?.trim() ?? '',
  }

  const contractor: ObrasContractorParams = {
    ...buildProvenance(`contractor:${contractorId}`),
    contractor_id: contractorId,
    caso_slug: 'obras-publicas',
    cuit,
    name,
    is_ute: isUte,
  }

  const awardedToRel: ObrasAwardedToRelParams = {
    contract_id: contractId,
    contractor_id: contractorId,
    monto,
    moneda,
  }

  return { contract, contractor, awardedToRel }
}

export function transformObra(row: ObraRow): ObrasPublicWorkParams {
  const numeroObra = row.numero_obra?.trim() ?? ''
  const workId = computeHash(`work:${numeroObra}`)

  return {
    ...buildProvenance(`work:${numeroObra}`),
    work_id: workId,
    caso_slug: 'obras-publicas',
    name: row.nombre_obra?.trim() ?? '',
    description: row.ues_nombre?.trim() ?? '',
    sector: 'other',
    province: '',
    municipality: '',
    latitude: parseCoord(row.latitud_1 ?? ''),
    longitude: parseCoord(row.longitud_1 ?? ''),
    status: '',
    plazo_ejecucion: [
      row.plazo_ejecucion_obra?.trim() ?? '',
      row.plazo_ejecucion_obra_tipo?.trim() ?? '',
    ]
      .filter(Boolean)
      .join(' '),
  }
}

export function transformUbicacion(row: UbicacionRow): {
  workId: string
  province: string
  locatedInRel: LocatedInProvinceRelParams
} {
  const numeroObra = row.numero_obra?.trim() ?? ''
  const workId = computeHash(`work:${numeroObra}`)
  const province = row.provincia_nombre?.trim() ?? ''

  return {
    workId,
    province,
    locatedInRel: {
      work_id: workId,
      province_name: province,
    },
  }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface ContratarTransformInput {
  readonly procedimientos: readonly ProcedimientoRow[]
  readonly ofertas: readonly OfertaRow[]
  readonly contratos: readonly ContratoRow[]
  readonly obras: readonly ObraRow[]
  readonly ubicaciones: readonly UbicacionRow[]
}

export interface ContratarTransformResult {
  readonly procedures: readonly ObrasProcedureParams[]
  readonly publicWorks: readonly ObrasPublicWorkParams[]
  readonly bids: readonly ObrasBidParams[]
  readonly contractors: readonly ObrasContractorParams[]
  readonly contracts: readonly ObrasPublicContractParams[]
  readonly procedureForRels: readonly ProcedureForRelParams[]
  readonly bidOnRels: readonly BidOnRelParams[]
  readonly bidderRels: readonly BidderRelParams[]
  readonly contractedForRels: readonly ContractedForRelParams[]
  readonly awardedToRels: readonly ObrasAwardedToRelParams[]
  readonly locatedInProvinceRels: readonly LocatedInProvinceRelParams[]
}

export function transformContratarAll(input: ContratarTransformInput): ContratarTransformResult {
  // --- Procedures ---
  const procedureMap = new Map<string, ObrasProcedureParams>()
  for (const row of input.procedimientos) {
    const proc = transformProcedimiento(row)
    if (!procedureMap.has(proc.procedure_id)) {
      procedureMap.set(proc.procedure_id, proc)
    }
  }

  // --- Obras (PublicWork nodes) ---
  const workMap = new Map<string, ObrasPublicWorkParams>()
  // Build procedure_numero -> estado lookup for status enrichment
  const procEstadoLookup = new Map<string, string>()
  for (const row of input.procedimientos) {
    const num = row.procedimiento_numero?.trim() ?? ''
    if (num) procEstadoLookup.set(num, row.procedimiento_estado?.trim() ?? '')
  }

  // Build obra -> procedure link
  const obraProcLookup = new Map<string, string>()
  for (const row of input.obras) {
    const numObra = row.numero_obra?.trim() ?? ''
    const numProc = row.procedimiento_numero?.trim() ?? ''
    if (numObra && numProc) obraProcLookup.set(numObra, numProc)
  }

  const procedureForRels: ProcedureForRelParams[] = []
  for (const row of input.obras) {
    const work = transformObra(row)
    const numObra = row.numero_obra?.trim() ?? ''
    const numProc = row.procedimiento_numero?.trim() ?? ''

    // Enrich status from procedure
    const estado = numProc ? (procEstadoLookup.get(numProc) ?? '') : ''
    const enrichedWork: ObrasPublicWorkParams = { ...work, status: estado }

    if (!workMap.has(work.work_id)) {
      workMap.set(work.work_id, enrichedWork)
    }

    // Link obra to procedure
    if (numProc) {
      const procedureId = computeHash(`proc:${numProc}`)
      procedureForRels.push({
        procedure_id: procedureId,
        work_id: work.work_id,
      })
    }
  }

  // --- Ubicaciones: enrich PublicWork province + build LOCATED_IN_PROVINCE rels ---
  const locatedInProvinceRels: LocatedInProvinceRelParams[] = []
  const seenLocations = new Set<string>()
  for (const row of input.ubicaciones) {
    const { workId, province, locatedInRel } = transformUbicacion(row)
    const locKey = `${workId}:${province}`

    // Enrich work with province + municipality
    const existingWork = workMap.get(workId)
    if (existingWork && !existingWork.province && province) {
      workMap.set(workId, {
        ...existingWork,
        province,
        municipality: row.departamento_nombre?.trim() ?? '',
      })
    }

    // Deduplicate location rels
    if (province && !seenLocations.has(locKey)) {
      seenLocations.add(locKey)
      locatedInProvinceRels.push(locatedInRel)
    }
  }

  // --- Ofertas (Bids + Contractors) ---
  const bidMap = new Map<string, ObrasBidParams>()
  const contractorMap = new Map<string, ObrasContractorParams>()
  const bidOnRels: BidOnRelParams[] = []
  const bidderRels: BidderRelParams[] = []

  for (const row of input.ofertas) {
    const { bid, contractor, bidOnRel, bidderRel } = transformOferta(row)

    if (!bidMap.has(bid.bid_id)) {
      bidMap.set(bid.bid_id, bid)
    }

    if (!contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }

    bidOnRels.push(bidOnRel)
    bidderRels.push(bidderRel)
  }

  // --- Contratos (PublicContract + Contractors + AWARDED_TO + CONTRACTED_FOR) ---
  const contractMap = new Map<string, ObrasPublicContractParams>()
  const awardedToRels: ObrasAwardedToRelParams[] = []
  const contractedForRels: ContractedForRelParams[] = []

  for (const row of input.contratos) {
    const { contract, contractor, awardedToRel } = transformContrato(row)

    if (!contractMap.has(contract.contract_id)) {
      contractMap.set(contract.contract_id, contract)
    }

    // Merge contractor from contratos into same map (dedup by CUIT)
    if (!contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }

    awardedToRels.push(awardedToRel)

    // Link contract to obra via numero_obra
    const numObra = row.numero_obra?.trim() ?? ''
    if (numObra) {
      const workId = computeHash(`work:${numObra}`)
      contractedForRels.push({
        contract_id: contract.contract_id,
        work_id: workId,
      })
    }
  }

  return {
    procedures: [...procedureMap.values()],
    publicWorks: [...workMap.values()],
    bids: [...bidMap.values()],
    contractors: [...contractorMap.values()],
    contracts: [...contractMap.values()],
    procedureForRels,
    bidOnRels,
    bidderRels,
    contractedForRels,
    awardedToRels,
    locatedInProvinceRels,
  }
}
