/**
 * Transforms DDJJ Patrimoniales CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions — no side effects, no mutations.
 * Matches DDJJ officials to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  DdjjRow,
  DdjjProvenanceParams,
  AssetDeclarationParams,
  DdjjMaybeSameAsRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DDJJ_SOURCE = 'https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales'
const SUBMITTED_BY = 'etl:ddjj-patrimoniales'
const CONFIDENCE_SCORE = 1.0
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): DdjjProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: DDJJ_SOURCE,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

/**
 * Parse DDJJ financial values.
 * The CSV uses "-" as decimal separator: "35278884-41" = 35278884.41
 * Also handles negative values prefixed with "-": "-35278884-41" = -35278884.41
 * Empty or "---" values return 0.
 */
export function parseDdjjAmount(raw: string | undefined): number {
  if (!raw || raw === '---' || raw === '-00' || raw.trim() === '') return 0

  const trimmed = raw.trim()

  // Check for negative values: starts with "-" followed by digits
  let isNegative = false
  let value = trimmed

  if (value.startsWith('-') && value.length > 1 && /\d/.test(value[1])) {
    isNegative = true
    value = value.slice(1)
  }

  // Split on the last "-" which is the decimal separator
  const lastDash = value.lastIndexOf('-')
  let result: number

  if (lastDash > 0) {
    const intPart = value.slice(0, lastDash)
    const decPart = value.slice(lastDash + 1)
    result = parseFloat(`${intPart}.${decPart}`)
  } else {
    result = parseFloat(value)
  }

  if (isNaN(result)) return 0
  return isNegative ? -result : result
}

/**
 * Infer branch of government from the sector and agency fields.
 */
function inferBranch(sector: string | undefined, organismo: string | undefined): string {
  const org = (organismo ?? '').toUpperCase()
  const sec = (sector ?? '').toUpperCase()

  if (sec === 'PEN' || org.includes('PRESIDENCIA') || org.includes('MINISTERIO') || org.includes('SECRETARIA')) {
    return 'executive'
  }
  if (sec.includes('LEGISL') || org.includes('SENADO') || org.includes('DIPUTADOS') || org.includes('CONGRESO') || org.includes('H. CÁMARA')) {
    return 'legislative'
  }
  if (sec.includes('JUDIC') || org.includes('CORTE SUPREMA') || org.includes('PODER JUDICIAL') || org.includes('CONSEJO DE LA MAGISTRATURA')) {
    return 'judicial'
  }
  if (org.includes('MINISTERIO PUBLICO') || org.includes('FISCALIA') || org.includes('DEFENSORIA')) {
    return 'judicial'
  }

  // Default based on sector field
  if (sec === 'PUBLICO' || sec === 'PEN') return 'executive'
  return 'public'
}

// ---------------------------------------------------------------------------
// Node transformer
// ---------------------------------------------------------------------------

function transformDeclaration(row: DdjjRow): AssetDeclarationParams {
  const year = parseInt(row.anio, 10)
  const totalAssetsStart = parseDdjjAmount(row.total_bienes_inicio)
  const totalDebtsStart = parseDdjjAmount(row.deudas_inicio)
  const totalAssetsEnd = parseDdjjAmount(row.total_bienes_final)
  const totalDebtsEnd = parseDdjjAmount(row.total_deudas_final)

  return {
    ...buildProvenance(`ddjj:${row.dj_id}`),
    ddjj_id: row.dj_id,
    cuit: row.cuit ?? '',
    year,
    declaration_type: row.tipo_declaracion_jurada_descripcion ?? '',
    is_rectification: row.rectificativa !== '0',
    official_name: row.funcionario_apellido_nombre ?? '',
    sector: row.sector ?? '',
    agency: row.organismo ?? '',
    position: row.cargo ?? '',
    position_since: row.desde ?? '',
    branch: inferBranch(row.sector, row.organismo),
    total_assets_start: totalAssetsStart,
    total_debts_start: totalDebtsStart,
    total_assets_end: totalAssetsEnd,
    total_debts_end: totalDebtsEnd,
    net_worth_start: totalAssetsStart - totalDebtsStart,
    net_worth_end: totalAssetsEnd - totalDebtsEnd,
    net_income: parseDdjjAmount(row.ingresos_neto_gastos),
    income_salary: parseDdjjAmount(row.ingreso_neto_renta_sueldo_c1),
    income_capital: parseDdjjAmount(row.ingreso_neto_renta_capitales_c2),
    income_business: parseDdjjAmount(row.ingreso_neto_renta_empresa_c3),
    income_personal_work: parseDdjjAmount(row.ingreso_neto_renta_trabajo_personal_c4),
    total_net_income: parseDdjjAmount(row.total_ingreso_neto_c1234),
  }
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

/**
 * Match DDJJ officials to existing Politician nodes using normalizeName.
 *
 * DDJJ names are in "APELLIDO NOMBRE" format (e.g. "ABAD MAXIMILIANO").
 * Politician full_name is in "ABAD, MAXIMILIANO" format.
 * normalizeName handles both by stripping punctuation and sorting parts.
 *
 * Returns one MAYBE_SAME_AS per unique (politician, declaration) pair.
 * Skips ambiguous matches (multiple politicians with same normalized name).
 */
function matchPoliticians(
  declarations: readonly AssetDeclarationParams[],
  politicians: readonly PoliticianParams[],
): DdjjMaybeSameAsRelParams[] {
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

  const matches: DdjjMaybeSameAsRelParams[] = []
  const seen = new Set<string>()

  for (const decl of declarations) {
    if (!decl.official_name) continue
    const normalized = normalizeName(decl.official_name)
    if (!normalized) continue
    const politicianId = lookup.get(normalized)

    if (politicianId) {
      const key = `${politicianId}::${decl.ddjj_id}`
      if (!seen.has(key)) {
        seen.add(key)
        matches.push({
          politician_id: politicianId,
          ddjj_id: decl.ddjj_id,
          confidence: 0.8,
          match_method: 'normalized_name',
        })
      }
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface DdjjTransformResult {
  readonly declarations: readonly AssetDeclarationParams[]
  readonly maybeSameAsRels: readonly DdjjMaybeSameAsRelParams[]
  readonly matchedPoliticianIds: ReadonlySet<string>
}

export interface DdjjTransformInput {
  readonly rows: readonly DdjjRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformDdjjAll(input: DdjjTransformInput): DdjjTransformResult {
  const declarations = input.rows.map(transformDeclaration)
  const maybeSameAsRels = matchPoliticians(declarations, input.politicians)

  const matchedPoliticianIds = new Set(maybeSameAsRels.map((r) => r.politician_id))

  return {
    declarations,
    maybeSameAsRels,
    matchedPoliticianIds,
  }
}
