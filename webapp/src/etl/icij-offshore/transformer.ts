/**
 * Transforms ICIJ Offshore Leaks CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions — no side effects, no mutations.
 * Matches ICIJ officers to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  OfficerRow,
  EntityRow,
  AddressRow,
  IntermediaryRow,
  RelationshipRow,
  IcijProvenanceParams,
  OffshoreOfficerParams,
  OffshoreEntityParams,
  OffshoreAddressParams,
  OffshoreIntermediaryParams,
  OfficerOfRelParams,
  IntermediaryOfRelParams,
  RegisteredAtRelParams,
  MaybeSameAsRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICIJ_SOURCE = 'https://offshoreleaks.icij.org'
const SUBMITTED_BY = 'etl:icij-offshore'
const CONFIDENCE_SCORE = 1.0
const TIER = 'gold' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): IcijProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: ICIJ_SOURCE,
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

function transformOfficer(row: OfficerRow): OffshoreOfficerParams {
  return {
    ...buildProvenance(`icij-officer:${row.node_id}`),
    icij_id: row.node_id,
    name: row.name,
    countries: row.countries,
    country_codes: row.country_codes,
    source_investigation: row.sourceID,
  }
}

function transformEntity(row: EntityRow): OffshoreEntityParams {
  return {
    ...buildProvenance(`icij-entity:${row.node_id}`),
    icij_id: row.node_id,
    name: row.name,
    jurisdiction: row.jurisdiction,
    jurisdiction_description: row.jurisdiction_description,
    company_type: row.company_type,
    incorporation_date: row.incorporation_date,
    status: row.status,
    countries: row.countries,
    country_codes: row.country_codes,
    source_investigation: row.sourceID,
  }
}

function transformAddress(row: AddressRow): OffshoreAddressParams {
  return {
    ...buildProvenance(`icij-address:${row.node_id}`),
    icij_id: row.node_id,
    address: row.address,
    countries: row.countries,
    country_codes: row.country_codes,
    source_investigation: row.sourceID,
  }
}

function transformIntermediary(row: IntermediaryRow): OffshoreIntermediaryParams {
  return {
    ...buildProvenance(`icij-intermediary:${row.node_id}`),
    icij_id: row.node_id,
    name: row.name,
    status: row.status,
    countries: row.countries,
    country_codes: row.country_codes,
    source_investigation: row.sourceID,
  }
}

// ---------------------------------------------------------------------------
// Relationship transformers
// ---------------------------------------------------------------------------

/**
 * Categorize ICIJ relationships by type.
 *
 * ICIJ rel_type values include:
 * - "officer_of" / "related_entity" / "similar" → OFFICER_OF
 * - "intermediary_of" → INTERMEDIARY_OF
 * - "registered_address" → REGISTERED_AT
 *
 * We map all officer-to-entity relationships (officer_of, related_entity, etc.)
 * to OFFICER_OF with the original link text preserved.
 */
function transformRelationships(
  rels: readonly RelationshipRow[],
  officerIds: ReadonlySet<string>,
  entityIds: ReadonlySet<string>,
  intermediaryIds: ReadonlySet<string>,
  addressIds: ReadonlySet<string>,
): {
  officerOfRels: OfficerOfRelParams[]
  intermediaryOfRels: IntermediaryOfRelParams[]
  registeredAtRels: RegisteredAtRelParams[]
} {
  const officerOfRels: OfficerOfRelParams[] = []
  const intermediaryOfRels: IntermediaryOfRelParams[] = []
  const registeredAtRels: RegisteredAtRelParams[] = []

  for (const r of rels) {
    if (r.rel_type === 'registered_address') {
      // Entity/officer → Address
      if (addressIds.has(r.node_id_end)) {
        registeredAtRels.push({
          entity_icij_id: r.node_id_start,
          address_icij_id: r.node_id_end,
        })
      }
    } else if (r.rel_type === 'intermediary_of') {
      if (intermediaryIds.has(r.node_id_start) && entityIds.has(r.node_id_end)) {
        intermediaryOfRels.push({
          intermediary_icij_id: r.node_id_start,
          entity_icij_id: r.node_id_end,
          link: r.link,
          rel_status: r.status,
        })
      }
    } else {
      // officer_of, related_entity, similar, etc. → OFFICER_OF
      if (officerIds.has(r.node_id_start) && entityIds.has(r.node_id_end)) {
        officerOfRels.push({
          officer_icij_id: r.node_id_start,
          entity_icij_id: r.node_id_end,
          link: r.link,
          rel_status: r.status,
          start_date: r.start_date,
          end_date: r.end_date,
        })
      }
    }
  }

  return { officerOfRels, intermediaryOfRels, registeredAtRels }
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

/**
 * Match ICIJ officers to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence:
 * - 1.0 for exact normalized name match
 * - Skips ambiguous matches (multiple politicians with same normalized name)
 */
function matchPoliticians(
  officers: readonly OffshoreOfficerParams[],
  politicians: readonly PoliticianParams[],
): MaybeSameAsRelParams[] {
  // Build lookup: normalized name → politician id (null if ambiguous)
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

  for (const officer of officers) {
    // Clean ICIJ names: strip "(1)" joint tenancy annotations
    const cleanName = officer.name.replace(/\s*\(\d+\)\s*/g, ' ').replace(/,?\s*as joint.*$/i, '').trim()
    const normalized = normalizeName(cleanName)
    const politicianId = lookup.get(normalized)

    if (politicianId) {
      matches.push({
        politician_id: politicianId,
        officer_icij_id: officer.icij_id,
        confidence: 1.0,
      })
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface IcijTransformResult {
  readonly officers: readonly OffshoreOfficerParams[]
  readonly entities: readonly OffshoreEntityParams[]
  readonly addresses: readonly OffshoreAddressParams[]
  readonly intermediaries: readonly OffshoreIntermediaryParams[]
  readonly officerOfRels: readonly OfficerOfRelParams[]
  readonly intermediaryOfRels: readonly IntermediaryOfRelParams[]
  readonly registeredAtRels: readonly RegisteredAtRelParams[]
  readonly maybeSameAsRels: readonly MaybeSameAsRelParams[]
}

export interface IcijTransformInput {
  readonly officers: readonly OfficerRow[]
  readonly entities: readonly EntityRow[]
  readonly addresses: readonly AddressRow[]
  readonly intermediaries: readonly IntermediaryRow[]
  readonly relationships: readonly RelationshipRow[]
  readonly politicians: readonly PoliticianParams[]
}

export function transformIcijAll(input: IcijTransformInput): IcijTransformResult {
  const officers = input.officers.map(transformOfficer)
  const entities = input.entities.map(transformEntity)
  const addresses = input.addresses.map(transformAddress)
  const intermediaries = input.intermediaries.map(transformIntermediary)

  const officerIds = new Set(officers.map((o) => o.icij_id))
  const entityIds = new Set(entities.map((e) => e.icij_id))
  const intermediaryIds = new Set(intermediaries.map((i) => i.icij_id))
  const addressIds = new Set(addresses.map((a) => a.icij_id))

  const { officerOfRels, intermediaryOfRels, registeredAtRels } = transformRelationships(
    input.relationships,
    officerIds,
    entityIds,
    intermediaryIds,
    addressIds,
  )

  const maybeSameAsRels = matchPoliticians(officers, input.politicians)

  return {
    officers,
    entities,
    addresses,
    intermediaries,
    officerOfRels,
    intermediaryOfRels,
    registeredAtRels,
    maybeSameAsRels,
  }
}
