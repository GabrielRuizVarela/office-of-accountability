/**
 * Types for ICIJ Offshore Leaks ETL pipeline.
 *
 * Data source: https://offshoreleaks.icij.org/pages/database
 * CSV files: nodes-officers.csv, nodes-entities.csv, nodes-addresses.csv,
 *            nodes-intermediaries.csv, relationships.csv
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schemas — match the column headers from ICIJ CSVs
// ---------------------------------------------------------------------------

export const OfficerRowSchema = z.object({
  node_id: z.string(),
  name: z.string(),
  countries: z.string().default(''),
  country_codes: z.string().default(''),
  sourceID: z.string().default(''),
  valid_until: z.string().default(''),
  note: z.string().default(''),
})
export type OfficerRow = z.infer<typeof OfficerRowSchema>

export const EntityRowSchema = z.object({
  node_id: z.string(),
  name: z.string(),
  original_name: z.string().default(''),
  former_name: z.string().default(''),
  jurisdiction: z.string().default(''),
  jurisdiction_description: z.string().default(''),
  company_type: z.string().default(''),
  address: z.string().default(''),
  internal_id: z.string().default(''),
  incorporation_date: z.string().default(''),
  inactivation_date: z.string().default(''),
  struck_off_date: z.string().default(''),
  dorm_date: z.string().default(''),
  status: z.string().default(''),
  service_provider: z.string().default(''),
  ibcRUC: z.string().default(''),
  country_codes: z.string().default(''),
  countries: z.string().default(''),
  sourceID: z.string().default(''),
  valid_until: z.string().default(''),
  note: z.string().default(''),
})
export type EntityRow = z.infer<typeof EntityRowSchema>

export const AddressRowSchema = z.object({
  node_id: z.string(),
  address: z.string().default(''),
  name: z.string().default(''),
  countries: z.string().default(''),
  country_codes: z.string().default(''),
  sourceID: z.string().default(''),
  valid_until: z.string().default(''),
  note: z.string().default(''),
})
export type AddressRow = z.infer<typeof AddressRowSchema>

export const IntermediaryRowSchema = z.object({
  node_id: z.string(),
  name: z.string(),
  status: z.string().default(''),
  internal_id: z.string().default(''),
  address: z.string().default(''),
  countries: z.string().default(''),
  country_codes: z.string().default(''),
  sourceID: z.string().default(''),
  valid_until: z.string().default(''),
  note: z.string().default(''),
})
export type IntermediaryRow = z.infer<typeof IntermediaryRowSchema>

export const RelationshipRowSchema = z.object({
  node_id_start: z.string(),
  node_id_end: z.string(),
  rel_type: z.string(),
  link: z.string().default(''),
  status: z.string().default(''),
  start_date: z.string().default(''),
  end_date: z.string().default(''),
  sourceID: z.string().default(''),
})
export type RelationshipRow = z.infer<typeof RelationshipRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface IcijProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'gold'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface OffshoreOfficerParams extends IcijProvenanceParams {
  readonly icij_id: string
  readonly name: string
  readonly countries: string
  readonly country_codes: string
  readonly source_investigation: string
}

export interface OffshoreEntityParams extends IcijProvenanceParams {
  readonly icij_id: string
  readonly name: string
  readonly jurisdiction: string
  readonly jurisdiction_description: string
  readonly company_type: string
  readonly incorporation_date: string
  readonly status: string
  readonly countries: string
  readonly country_codes: string
  readonly source_investigation: string
}

export interface OffshoreAddressParams extends IcijProvenanceParams {
  readonly icij_id: string
  readonly address: string
  readonly countries: string
  readonly country_codes: string
  readonly source_investigation: string
}

export interface OffshoreIntermediaryParams extends IcijProvenanceParams {
  readonly icij_id: string
  readonly name: string
  readonly status: string
  readonly countries: string
  readonly country_codes: string
  readonly source_investigation: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface OfficerOfRelParams {
  readonly officer_icij_id: string
  readonly entity_icij_id: string
  readonly link: string
  readonly rel_status: string
  readonly start_date: string
  readonly end_date: string
}

export interface IntermediaryOfRelParams {
  readonly intermediary_icij_id: string
  readonly entity_icij_id: string
  readonly link: string
  readonly rel_status: string
}

export interface RegisteredAtRelParams {
  readonly entity_icij_id: string
  readonly address_icij_id: string
}

export interface MaybeSameAsRelParams {
  readonly politician_id: string
  readonly officer_icij_id: string
  readonly confidence: number
  readonly match_method: string
}
