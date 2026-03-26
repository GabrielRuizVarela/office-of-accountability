/**
 * Transforms judiciary designation CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions - no side effects, no mutations.
 * Matches judges to existing Politician, AssetDeclaration, CompanyOfficer,
 * and BoardMember nodes.
 */

import { createHash } from 'node:crypto'
import { normalizeName, slugify } from '../como-voto/transformer'

import type {
  DesignationRow,
  JudiciaryProvenanceParams,
  JudgeParams,
  CourtParams,
  AppointedByRelParams,
  ServesInRelParams,
  JudgePoliticianMaybeSameAsParams,
  JudgeDdjjMaybeSameAsParams,
  JudgeCompanyOfficerMaybeSameAsParams,
  JudgeBoardMemberMaybeSameAsParams,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JUDICIARY_SOURCE =
  'https://datos.jus.gob.ar/dataset/designaciones-de-magistrados-de-la-justicia-federal-y-la-justicia-nacional'
const SUBMITTED_BY = 'etl:judiciary'
const CONFIDENCE_SCORE = 1.0
const TIER = 'gold' as const

// President name mapping: norma_presidente values → normalized Politician names
// CSV uses mixed case full names like "Carlos Menem", "Cristina Fernández"
const PRESIDENT_NAME_MAP: Record<string, string> = {
  // Exact CSV values (normalized to uppercase for matching)
  'CARLOS MENEM': 'menem carlos saul',
  'CRISTINA FERNANDEZ': 'fernandez cristina elisabet',
  'RAUL ALFONSIN': 'alfonsin raul ricardo',
  'MAURICIO MACRI': 'macri mauricio',
  'NESTOR KIRCHNER': 'kirchner nestor carlos',
  'ALBERTO FERNANDEZ': 'fernandez alberto angel',
  'EDUARDO DUHALDE': 'duhalde eduardo alberto',
  'FERNANDO DE LA RUA': 'de la rua fernando',
  'JAVIER MILEI': 'milei javier gerardo',
  // Military period (if any appear)
  'VIDELA': 'videla jorge rafael',
  'VIOLA': 'viola roberto eduardo',
  'GALTIERI': 'galtieri leopoldo fortunato',
  'BIGNONE': 'bignone reynaldo benito antonio',
  // Transitional
  'RODRIGUEZ SAA': 'rodriguez saa adolfo',
  'ADOLFO RODRIGUEZ SAA': 'rodriguez saa adolfo',
  'CAMPORA': 'campora hector jose',
  'PERON': 'peron juan domingo',
  'JUAN DOMINGO PERON': 'peron juan domingo',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): JudiciaryProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: JUDICIARY_SOURCE,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

/**
 * Infer court type from organo_tipo field.
 */
function inferCourtType(organoTipo: string): string {
  const upper = organoTipo.toUpperCase()
  if (upper.includes('CAMARA') || upper.includes('CÁMARA')) return 'camara'
  if (upper.includes('JUZGADO')) return 'juzgado'
  if (upper.includes('TRIBUNAL')) return 'tribunal'
  if (upper.includes('FISCAL')) return 'fiscalia'
  if (upper.includes('DEFENSOR')) return 'defensoria'
  if (upper.includes('CORTE')) return 'corte'
  return organoTipo.toLowerCase() || 'otro'
}

/**
 * Normalize a presidente name from the CSV for matching against Politicians.
 * Returns the normalized name key or null if not mappable.
 */
function normalizePresidenteName(rawName: string): string | null {
  if (!rawName || rawName.trim() === '') return null

  // Strip diacritics and normalize to uppercase
  const cleaned = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Skip non-president entries
  if (cleaned === 'GOBIERNO DE FACTO' || cleaned === '') return null

  // Try direct map first
  if (PRESIDENT_NAME_MAP[cleaned]) {
    return PRESIDENT_NAME_MAP[cleaned]
  }

  // Try partial matching for variants
  for (const [key, value] of Object.entries(PRESIDENT_NAME_MAP)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Node transformers
// ---------------------------------------------------------------------------

/**
 * Build a unique court slug from its identifying fields.
 */
function buildCourtSlug(row: DesignationRow): string {
  const parts = [
    row.justicia_federal_o_nacional,
    row.camara,
    row.organo_tipo,
    row.organo_nombre,
    row.provincia_nombre,
  ].filter(Boolean)
  return slugify(parts.join(' '))
}

function transformJudge(
  row: DesignationRow,
  courtSlug: string,
): JudgeParams | null {
  const dni = row.magistrado_dni?.trim()
  if (!dni) return null

  return {
    ...buildProvenance(`judiciary-judge:${dni}`),
    dni,
    name: row.magistrado_nombre?.trim() ?? '',
    gender: row.magistrado_genero?.trim() ?? '',
    current_court: row.organo_nombre?.trim() ?? '',
    appointment_date: row.fecha_designacion?.trim() ?? '',
    cargo_tipo: row.cargo_tipo?.trim() ?? '',
  }
}

function transformCourt(row: DesignationRow): CourtParams {
  const slug = buildCourtSlug(row)
  return {
    ...buildProvenance(`judiciary-court:${slug}`),
    court_slug: slug,
    name: row.organo_nombre?.trim() ?? '',
    court_type: inferCourtType(row.organo_tipo ?? ''),
    chamber: row.camara?.trim() ?? '',
    province: row.provincia_nombre?.trim() ?? '',
    jurisdiction: row.justicia_federal_o_nacional?.trim() ?? '',
  }
}

// ---------------------------------------------------------------------------
// Relationship builders
// ---------------------------------------------------------------------------

function buildAppointedByRels(
  rows: readonly DesignationRow[],
  politicianLookup: ReadonlyMap<string, string>,
): AppointedByRelParams[] {
  const rels: AppointedByRelParams[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const dni = row.magistrado_dni?.trim()
    if (!dni) continue

    const normalizedPres = normalizePresidenteName(row.norma_presidente ?? '')
    if (!normalizedPres) continue

    const politicianId = politicianLookup.get(normalizedPres)
    if (!politicianId) continue

    const key = `${dni}::${politicianId}::${row.norma_numero}`
    if (seen.has(key)) continue
    seen.add(key)

    rels.push({
      judge_dni: dni,
      politician_id: politicianId,
      decreto: row.norma_numero?.trim() ?? '',
      fecha: row.norma_fecha?.trim() ?? '',
      cargo_tipo: row.cargo_tipo?.trim() ?? '',
    })
  }

  return rels
}

function buildServesInRels(
  rows: readonly DesignationRow[],
): ServesInRelParams[] {
  const rels: ServesInRelParams[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const dni = row.magistrado_dni?.trim()
    if (!dni) continue

    const courtSlug = buildCourtSlug(row)
    const key = `${dni}::${courtSlug}`
    if (seen.has(key)) continue
    seen.add(key)

    rels.push({
      judge_dni: dni,
      court_slug: courtSlug,
    })
  }

  return rels
}

// ---------------------------------------------------------------------------
// Cross-entity matching
// ---------------------------------------------------------------------------

/**
 * Match judges to Politician nodes by normalized name.
 * Some judges were formerly legislators.
 */
function matchJudgesToPoliticians(
  judges: readonly JudgeParams[],
  politicianLookup: ReadonlyMap<string, string>,
): JudgePoliticianMaybeSameAsParams[] {
  const matches: JudgePoliticianMaybeSameAsParams[] = []
  const seen = new Set<string>()

  for (const judge of judges) {
    const normalized = normalizeName(judge.name)
    if (!normalized) continue

    const politicianId = politicianLookup.get(normalized)
    if (!politicianId) continue

    const key = `${judge.dni}::${politicianId}`
    if (seen.has(key)) continue
    seen.add(key)

    matches.push({
      judge_dni: judge.dni,
      politician_id: politicianId,
      confidence: 0.8,
      match_method: 'normalized_name',
    })
  }

  return matches
}

/**
 * Match judges to AssetDeclaration nodes by CUIT/DNI.
 * CUIT format: XX-DDDDDDDD-D where DDDDDDDD is the DNI.
 * Confidence 0.9 for DNI matches.
 */
function matchJudgesToDdjj(
  judges: readonly JudgeParams[],
  ddjjDniLookup: ReadonlyMap<string, string[]>,
): JudgeDdjjMaybeSameAsParams[] {
  const matches: JudgeDdjjMaybeSameAsParams[] = []

  for (const judge of judges) {
    const dni = judge.dni.replace(/\D/g, '')
    if (!dni) continue

    const ddjjIds = ddjjDniLookup.get(dni)
    if (!ddjjIds) continue

    for (const ddjjId of ddjjIds) {
      matches.push({
        judge_dni: judge.dni,
        ddjj_id: ddjjId,
        confidence: 0.9,
        match_method: 'dni_cuit',
      })
    }
  }

  return matches
}

/**
 * Match judges to CompanyOfficer nodes by normalized name.
 * Judges who are also corporate directors = potential conflict of interest.
 */
function matchJudgesToCompanyOfficers(
  judges: readonly JudgeParams[],
  officerNameLookup: ReadonlyMap<string, string[]>,
): JudgeCompanyOfficerMaybeSameAsParams[] {
  const matches: JudgeCompanyOfficerMaybeSameAsParams[] = []

  for (const judge of judges) {
    const normalized = normalizeName(judge.name)
    if (!normalized) continue

    const officerIds = officerNameLookup.get(normalized)
    if (!officerIds) continue

    for (const officerId of officerIds) {
      matches.push({
        judge_dni: judge.dni,
        officer_id: officerId,
        confidence: 0.8,
        match_method: 'normalized_name',
      })
    }
  }

  return matches
}

/**
 * Match judges to BoardMember nodes by normalized name.
 * Judges on public company boards = potential conflict.
 */
function matchJudgesToBoardMembers(
  judges: readonly JudgeParams[],
  boardMemberNameLookup: ReadonlyMap<string, string[]>,
): JudgeBoardMemberMaybeSameAsParams[] {
  const matches: JudgeBoardMemberMaybeSameAsParams[] = []

  for (const judge of judges) {
    const normalized = normalizeName(judge.name)
    if (!normalized) continue

    const authorityIds = boardMemberNameLookup.get(normalized)
    if (!authorityIds) continue

    for (const authorityId of authorityIds) {
      matches.push({
        judge_dni: judge.dni,
        authority_id: authorityId,
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

export interface JudiciaryTransformResult {
  readonly judges: readonly JudgeParams[]
  readonly courts: readonly CourtParams[]
  readonly appointedByRels: readonly AppointedByRelParams[]
  readonly servesInRels: readonly ServesInRelParams[]
  readonly judgePoliticianRels: readonly JudgePoliticianMaybeSameAsParams[]
  readonly judgeDdjjRels: readonly JudgeDdjjMaybeSameAsParams[]
  readonly judgeCompanyOfficerRels: readonly JudgeCompanyOfficerMaybeSameAsParams[]
  readonly judgeBoardMemberRels: readonly JudgeBoardMemberMaybeSameAsParams[]
}

export interface JudiciaryTransformInput {
  readonly rows: readonly DesignationRow[]
  /** normalized full_name -> politician id (null if ambiguous) */
  readonly politicianLookup: ReadonlyMap<string, string>
  /** DNI (digits only) -> ddjj_id[] */
  readonly ddjjDniLookup: ReadonlyMap<string, string[]>
  /** normalized name -> officer_id[] */
  readonly companyOfficerNameLookup: ReadonlyMap<string, string[]>
  /** normalized name -> igj_authority_id[] */
  readonly boardMemberNameLookup: ReadonlyMap<string, string[]>
}

export function transformJudiciaryAll(input: JudiciaryTransformInput): JudiciaryTransformResult {
  // Build judges - deduplicate by DNI (keep latest appointment)
  const judgeMap = new Map<string, JudgeParams>()
  const courtMap = new Map<string, CourtParams>()

  for (const row of input.rows) {
    const courtSlug = buildCourtSlug(row)
    const judge = transformJudge(row, courtSlug)

    if (judge) {
      // Keep the entry with the latest appointment date
      const existing = judgeMap.get(judge.dni)
      if (!existing || (judge.appointment_date > existing.appointment_date)) {
        judgeMap.set(judge.dni, judge)
      }
    }

    if (!courtMap.has(courtSlug)) {
      courtMap.set(courtSlug, transformCourt(row))
    }
  }

  const judges = [...judgeMap.values()]
  const courts = [...courtMap.values()]

  // Relationships
  const appointedByRels = buildAppointedByRels(input.rows, input.politicianLookup)
  const servesInRels = buildServesInRels(input.rows)

  // Cross-entity matches
  const judgePoliticianRels = matchJudgesToPoliticians(judges, input.politicianLookup)
  const judgeDdjjRels = matchJudgesToDdjj(judges, input.ddjjDniLookup)
  const judgeCompanyOfficerRels = matchJudgesToCompanyOfficers(judges, input.companyOfficerNameLookup)
  const judgeBoardMemberRels = matchJudgesToBoardMembers(judges, input.boardMemberNameLookup)

  return {
    judges,
    courts,
    appointedByRels,
    servesInRels,
    judgePoliticianRels,
    judgeDdjjRels,
    judgeCompanyOfficerRels,
    judgeBoardMemberRels,
  }
}
