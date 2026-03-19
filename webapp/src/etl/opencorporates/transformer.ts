/**
 * Transforms IGJ corporate registry CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions — no side effects, no mutations.
 * Matches IGJ company officers to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  EntityRow,
  AuthorityRow,
  IgjProvenanceParams,
  CompanyParams,
  CompanyOfficerParams,
  OfficerOfCompanyRelParams,
  MaybeSameAsRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IGJ_SOURCE = 'https://datos.gob.ar/dataset/justicia-entidades-constituidas-inspeccion-general-justicia'
const SUBMITTED_BY = 'etl:igj-opencorporates'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): IgjProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: IGJ_SOURCE,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

/**
 * Build a stable officer ID from the authority row.
 * Uses igj_id + document_number + role_code to deduplicate.
 */
function buildOfficerId(row: AuthorityRow): string {
  const docNum = row.numero_documento.replace(/[.\-\s]/g, '').trim()
  return `igj-${row.numero_correlativo}-${docNum}-${row.tipo_administrador}`.toLowerCase()
}

// ---------------------------------------------------------------------------
// Node transformers
// ---------------------------------------------------------------------------

function transformEntity(row: EntityRow): CompanyParams {
  return {
    ...buildProvenance(`igj-entity:${row.numero_correlativo}`),
    igj_id: row.numero_correlativo,
    name: row.razon_social.trim(),
    company_type_code: row.tipo_societario,
    company_type: row.descripcion_tipo_societario.trim(),
    cuit: row.cuit.trim(),
    status: row.dada_de_baja.trim() ? 'inactive' : 'active',
    deregistration_code: row.codigo_baja.trim(),
    deregistration_detail: row.detalle_baja.trim(),
  }
}

function transformAuthority(row: AuthorityRow): CompanyOfficerParams {
  return {
    ...buildProvenance(`igj-authority:${buildOfficerId(row)}`),
    officer_id: buildOfficerId(row),
    name: row.apellido_nombre.trim(),
    role_code: row.tipo_administrador.trim(),
    role: row.descripcion_tipo_administrador.trim(),
    document_type_code: row.tipo_documento.trim(),
    document_type: row.descripcion_tipo_documento.trim(),
    document_number: row.numero_documento.replace(/[.\-\s]/g, '').trim(),
    gender: row.genero_autoridad.trim(),
  }
}

// ---------------------------------------------------------------------------
// Relationship transformers
// ---------------------------------------------------------------------------

function buildOfficerOfCompanyRels(
  authorities: readonly AuthorityRow[],
): OfficerOfCompanyRelParams[] {
  return authorities.map((row) => ({
    officer_id: buildOfficerId(row),
    company_igj_id: row.numero_correlativo,
    role: row.descripcion_tipo_administrador.trim(),
    role_code: row.tipo_administrador.trim(),
  }))
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

/**
 * Match IGJ company officers to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence:
 * - 1.0 for exact normalized name match
 * - Skips ambiguous matches (multiple politicians with same normalized name)
 * - Skips officers without meaningful names
 */
function matchPoliticians(
  officers: readonly CompanyOfficerParams[],
  politicians: readonly PoliticianParams[],
): MaybeSameAsRelParams[] {
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

  const matches: MaybeSameAsRelParams[] = []
  const seenPairs = new Set<string>()

  for (const officer of officers) {
    if (!officer.name || officer.name.length < 3) continue

    const normalized = normalizeName(officer.name)
    // Skip very short normalized names (risk of false positives)
    if (normalized.split(' ').length < 2) continue

    const politicianId = lookup.get(normalized)
    if (politicianId) {
      const pairKey = `${politicianId}::${officer.officer_id}`
      if (!seenPairs.has(pairKey)) {
        seenPairs.add(pairKey)
        matches.push({
          politician_id: politicianId,
          officer_id: officer.officer_id,
          confidence: 1.0,
        })
      }
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface IgjTransformResult {
  readonly companies: readonly CompanyParams[]
  readonly officers: readonly CompanyOfficerParams[]
  readonly officerOfCompanyRels: readonly OfficerOfCompanyRelParams[]
  readonly maybeSameAsRels: readonly MaybeSameAsRelParams[]
}

export interface IgjTransformInput {
  readonly entities: readonly EntityRow[]
  readonly authorities: readonly AuthorityRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformIgjAll(input: IgjTransformInput): IgjTransformResult {
  const companies = input.entities.map(transformEntity)

  // Deduplicate officers by officer_id
  const officerMap = new Map<string, CompanyOfficerParams>()
  for (const row of input.authorities) {
    const officer = transformAuthority(row)
    if (!officerMap.has(officer.officer_id)) {
      officerMap.set(officer.officer_id, officer)
    }
  }
  const officers = [...officerMap.values()]

  const officerOfCompanyRels = buildOfficerOfCompanyRels(input.authorities)
  const maybeSameAsRels = matchPoliticians(officers, input.politicians)

  return {
    companies,
    officers,
    officerOfCompanyRels,
    maybeSameAsRels,
  }
}
