/**
 * Transforms IGJ company registry CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions — no side effects, no mutations.
 * Matches IGJ authorities to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  EntityRow,
  AuthorityRow,
  IgjProvenanceParams,
  PublicCompanyParams,
  BoardMemberParams,
  BoardMemberOfRelParams,
  MaybeSameAsRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const IGJ_SOURCE = 'https://datos.jus.gob.ar/dataset/entidades-constituidas-en-la-inspeccion-general-de-justicia-igj'
const SUBMITTED_BY = 'etl:igj-securities'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

/**
 * Company types to include. We focus on business entities, not associations
 * or individuals. Codes observed in the data:
 *   160 = SOCIEDADES NO REGISTRADAS
 *   Other codes include SA, SRL, SCA, etc.
 * We include all entity types since the tipo_societario descriptions
 * identify the company form.
 */

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

// ---------------------------------------------------------------------------
// Node transformers
// ---------------------------------------------------------------------------

function transformEntity(row: EntityRow): PublicCompanyParams {
  const isActive = !row.dada_de_baja || row.dada_de_baja.trim() === ''
  return {
    ...buildProvenance(`igj-entity:${row.numero_correlativo}`),
    igj_id: row.numero_correlativo,
    name: row.razon_social.trim(),
    company_type: row.descripcion_tipo_societario.trim(),
    company_type_code: row.tipo_societario.trim(),
    cuit: row.cuit.trim(),
    active: isActive,
  }
}

function transformAuthority(row: AuthorityRow): BoardMemberParams {
  // Build a unique ID from correlativo + document number + name
  const uniqueKey = `${row.numero_correlativo}:${row.numero_documento}:${row.apellido_nombre}`
  return {
    ...buildProvenance(`igj-authority:${uniqueKey}`),
    igj_authority_id: computeHash(uniqueKey),
    name: row.apellido_nombre.trim(),
    role_type: row.tipo_administrador.trim(),
    role_description: row.descripcion_tipo_administrador.trim(),
    document_type: row.descripcion_tipo_documento.trim(),
    document_number: row.numero_documento.trim(),
    gender: row.genero_autoridad.trim(),
  }
}

// ---------------------------------------------------------------------------
// Relationship builders
// ---------------------------------------------------------------------------

function buildBoardMemberRels(
  authorities: readonly AuthorityRow[],
  entityIds: ReadonlySet<string>,
  authorityParams: readonly BoardMemberParams[],
): BoardMemberOfRelParams[] {
  const rels: BoardMemberOfRelParams[] = []
  for (let i = 0; i < authorities.length; i++) {
    const row = authorities[i]
    if (!entityIds.has(row.numero_correlativo)) continue
    rels.push({
      authority_id: authorityParams[i].igj_authority_id,
      company_igj_id: row.numero_correlativo,
      role_type: row.tipo_administrador.trim(),
      role_description: row.descripcion_tipo_administrador.trim(),
    })
  }
  return rels
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

/**
 * Match IGJ board members to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence 0.8 for name-only matches.
 * Skips ambiguous matches (multiple politicians with same normalized name).
 */
function matchPoliticians(
  authorities: readonly BoardMemberParams[],
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
  const seen = new Set<string>() // avoid duplicate matches for same authority

  for (const authority of authorities) {
    const normalized = normalizeName(authority.name)
    if (seen.has(`${normalized}:${authority.igj_authority_id}`)) continue
    seen.add(`${normalized}:${authority.igj_authority_id}`)

    const politicianId = lookup.get(normalized)
    if (politicianId) {
      matches.push({
        politician_id: politicianId,
        authority_id: authority.igj_authority_id,
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

export interface IgjTransformResult {
  readonly companies: readonly PublicCompanyParams[]
  readonly boardMembers: readonly BoardMemberParams[]
  readonly boardMemberOfRels: readonly BoardMemberOfRelParams[]
  readonly maybeSameAsRels: readonly MaybeSameAsRelParams[]
}

export interface IgjTransformInput {
  readonly entities: readonly EntityRow[]
  readonly authorities: readonly AuthorityRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformIgjAll(input: IgjTransformInput): IgjTransformResult {
  // Transform entities (all of them — includes SA, SRL, etc.)
  const companies = input.entities.map(transformEntity)
  const entityIds = new Set(input.entities.map((e) => e.numero_correlativo))

  // Transform authorities
  const boardMembers = input.authorities.map(transformAuthority)

  // Build relationships
  const boardMemberOfRels = buildBoardMemberRels(input.authorities, entityIds, boardMembers)

  // Match against politicians
  const maybeSameAsRels = matchPoliticians(boardMembers, input.politicians)

  return {
    companies,
    boardMembers,
    boardMemberOfRels,
    maybeSameAsRels,
  }
}
