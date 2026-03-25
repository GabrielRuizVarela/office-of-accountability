/**
 * Transforms MapaInversiones data into Neo4j node/relationship parameters.
 *
 * Pure functions -- no side effects, no mutations.
 */

import { createHash } from 'node:crypto'

import type {
  MapaRow,
  MapaProvenanceParams,
  MapaPublicWorkParams,
  MapaContractorParams,
  ContractedForMapaRelParams,
  LocatedInProvinceMapaRelParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SOURCE_URL =
  'https://mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv'
const SUBMITTED_BY = 'etl:mapa-inversiones'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): MapaProvenanceParams {
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

// ---------------------------------------------------------------------------
// Sector mapping
// ---------------------------------------------------------------------------

const SECTOR_MAP: Record<string, string> = {
  'RED SECUNDARIA': 'water',
  'OBRAS ELECTROMECANICAS': 'water',
  'VIVIENDA': 'housing',
  'VIALIDAD': 'road',
  'ENERGIA': 'energy',
  'TRANSPORTE': 'transport',
  'RED PRIMARIA': 'water',
  'RED TERCIARIA': 'water',
  'AGUA POTABLE': 'water',
  'SANEAMIENTO': 'water',
  'CLOACAS': 'water',
  'DESAGUES': 'water',
  'RIEGO': 'water',
  'HIDRAULICA': 'water',
  'RUTAS': 'road',
  'AUTOPISTA': 'road',
  'PUENTE': 'road',
  'PAVIMENTACION': 'road',
  'ELECTRIFICACION': 'energy',
  'GAS': 'energy',
  'GASODUCTO': 'energy',
  'FERROCARRIL': 'transport',
  'AEROPUERTO': 'transport',
  'PUERTO': 'transport',
}

function mapSector(raw: string): string {
  const upper = (raw ?? '').trim().toUpperCase()
  if (SECTOR_MAP[upper]) return SECTOR_MAP[upper]
  // Partial match fallback
  for (const [key, value] of Object.entries(SECTOR_MAP)) {
    if (upper.includes(key)) return value
  }
  return 'other'
}

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

function mapStatus(etapaobra: string): string {
  const upper = (etapaobra ?? '').trim().toUpperCase()
  if (upper === 'FINALIZADAS' || upper === 'FINALIZADA') return 'completed'
  if (upper.includes('EJECUCI')) return 'in_progress'
  if (upper.includes('SUSPEND')) return 'suspended'
  if (upper.includes('CANCEL')) return 'cancelled'
  return 'planned'
}

// ---------------------------------------------------------------------------
// Amount parsing — US format "17,872,007.00"
// ---------------------------------------------------------------------------

function parseAmount(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  // US format: remove commas, keep decimal point
  const cleaned = raw.trim().replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// ---------------------------------------------------------------------------
// Percentage parsing
// ---------------------------------------------------------------------------

function parsePercentage(raw: string): number {
  if (!raw || raw.trim() === '') return 0
  const cleaned = raw.trim().replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

// ---------------------------------------------------------------------------
// CUIT cleaning
// ---------------------------------------------------------------------------

function cleanCuit(raw: string): string {
  return (raw ?? '').trim().replace(/-/g, '')
}

// ---------------------------------------------------------------------------
// Row transformer
// ---------------------------------------------------------------------------

function transformRow(row: MapaRow): {
  work: MapaPublicWorkParams
  contractor: MapaContractorParams | null
  contractedForRel: ContractedForMapaRelParams | null
  locatedInRel: LocatedInProvinceMapaRelParams | null
} {
  const idProyecto = (row.idproyecto ?? '').trim()
  const workId = computeHash(`mapa:${idProyecto}`)

  const work: MapaPublicWorkParams = {
    ...buildProvenance(`mapa:${idProyecto}`),
    work_id: workId,
    caso_slug: 'obras-publicas',
    name: (row.nombreobra ?? '').trim(),
    description: (row.descripicionfisica ?? '').trim(),
    sector: mapSector(row.sectornombre ?? ''),
    province: (row.nombreprovincia ?? '').trim(),
    municipality: (row.nombredepto ?? '').trim(),
    latitude: '',
    longitude: '',
    status: mapStatus(row.etapaobra ?? ''),
    start_date: (row.fechainicioanio ?? '').trim(),
    end_date: (row.fechafinanio ?? '').trim(),
    monto_total: parseAmount(row.montototal ?? ''),
    avance_financiero: parsePercentage(row.avancefinanciero ?? ''),
    avance_fisico: parsePercentage(row.avancefisico ?? ''),
    tipo_proyecto: (row.tipoproyecto ?? '').trim(),
    entidad_ejecutora: (row.entidadejecutoranombre ?? '').trim(),
    programa_infraestructura: (row.programa_infraestructura ?? '').trim(),
  }

  // --- Contractor ---
  const cuit = cleanCuit(row.contraparte_cuit ?? '')
  const contractorName = (row.contraparte_val ?? '').trim()

  let contractor: MapaContractorParams | null = null
  let contractedForRel: ContractedForMapaRelParams | null = null

  if (cuit) {
    const contractorId = cuit

    contractor = {
      ...buildProvenance(`contractor:${contractorId}`),
      contractor_id: contractorId,
      caso_slug: 'obras-publicas',
      cuit,
      name: contractorName,
    }

    contractedForRel = {
      work_id: workId,
      contractor_id: contractorId,
    }
  }

  // --- Province location ---
  const province = (row.nombreprovincia ?? '').trim()
  const locatedInRel: LocatedInProvinceMapaRelParams | null = province
    ? { work_id: workId, province_name: province }
    : null

  return { work, contractor, contractedForRel, locatedInRel }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface MapaTransformResult {
  readonly publicWorks: readonly MapaPublicWorkParams[]
  readonly contractors: readonly MapaContractorParams[]
  readonly contractedForRels: readonly ContractedForMapaRelParams[]
  readonly locatedInProvinceRels: readonly LocatedInProvinceMapaRelParams[]
}

export function transformMapaAll(rows: readonly MapaRow[]): MapaTransformResult {
  const workMap = new Map<string, MapaPublicWorkParams>()
  const contractorMap = new Map<string, MapaContractorParams>()
  const contractedForRels: ContractedForMapaRelParams[] = []
  const locatedInProvinceRels: LocatedInProvinceMapaRelParams[] = []
  const seenLocations = new Set<string>()

  for (const row of rows) {
    const { work, contractor, contractedForRel, locatedInRel } = transformRow(row)

    // Deduplicate works by work_id
    if (!workMap.has(work.work_id)) {
      workMap.set(work.work_id, work)
    }

    // Deduplicate contractors by contractor_id (CUIT-based)
    if (contractor && !contractorMap.has(contractor.contractor_id)) {
      contractorMap.set(contractor.contractor_id, contractor)
    }

    if (contractedForRel) {
      contractedForRels.push(contractedForRel)
    }

    // Deduplicate location rels
    if (locatedInRel) {
      const locKey = `${locatedInRel.work_id}:${locatedInRel.province_name}`
      if (!seenLocations.has(locKey)) {
        seenLocations.add(locKey)
        locatedInProvinceRels.push(locatedInRel)
      }
    }
  }

  return {
    publicWorks: [...workMap.values()],
    contractors: [...contractorMap.values()],
    contractedForRels,
    locatedInProvinceRels,
  }
}
