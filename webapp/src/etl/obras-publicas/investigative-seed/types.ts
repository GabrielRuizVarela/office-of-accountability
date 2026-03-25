/**
 * Types for investigative seed data ETL — Odebrecht, Cuadernos, Siemens FCPA.
 *
 * Manually curated seed JSONs enriched with Qwen LLM analysis.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Seed JSON schemas
// ---------------------------------------------------------------------------

export const SeedCompanySchema = z.object({
  name: z.string(),
  role: z.string(),
  cuit: z.string().default(''),
})
export type SeedCompany = z.infer<typeof SeedCompanySchema>

export const SeedIntermediarySchema = z.object({
  name: z.string(),
  role: z.string(), // 'bagman' | 'fixer' | 'lobbyist' | 'shell_operator'
  cuit: z.string().default(''),
  dni: z.string().default(''),
})
export type SeedIntermediary = z.infer<typeof SeedIntermediarySchema>

export const SeedProjectSchema = z.object({
  name: z.string(),
  sector: z.string().default('other'),
  province: z.string().default(''),
  contract_value_usd: z.number().default(0),
  bribe_amount_usd: z.number().default(0),
})
export type SeedProject = z.infer<typeof SeedProjectSchema>

export const SeedPoliticianSchema = z.object({
  name: z.string(),
  role: z.string().default('bribe_recipient'),
  position: z.string().default(''),
  period: z.string().default(''),
})
export type SeedPolitician = z.infer<typeof SeedPoliticianSchema>

export const SeedFileSchema = z.object({
  case_name: z.string(),
  source_case: z.string(),
  jurisdiction: z.string().default('Argentina'),
  total_bribes_usd: z.number().default(0),
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  companies: z.array(SeedCompanySchema).default([]),
  intermediaries: z.array(SeedIntermediarySchema).default([]),
  projects: z.array(SeedProjectSchema).default([]),
  politicians: z.array(SeedPoliticianSchema).default([]),
  source_urls: z.array(z.string()).default([]),
})
export type SeedFile = z.infer<typeof SeedFileSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface InvestigativeProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'bronze'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface BriberyCaseParams extends InvestigativeProvenanceParams {
  readonly case_id: string
  readonly caso_slug: 'obras-publicas'
  readonly name: string
  readonly source_case: string
  readonly total_bribes_usd: number
  readonly period_start: string
  readonly period_end: string
  readonly jurisdiction: string
}

export interface IntermediaryParams extends InvestigativeProvenanceParams {
  readonly intermediary_id: string
  readonly caso_slug: 'obras-publicas'
  readonly name: string
  readonly role: string
  readonly cuit: string
  readonly dni: string
}

export interface SeedContractorParams extends InvestigativeProvenanceParams {
  readonly contractor_id: string
  readonly caso_slug: 'obras-publicas'
  readonly cuit: string
  readonly name: string
}

export interface SeedPublicWorkParams extends InvestigativeProvenanceParams {
  readonly work_id: string
  readonly caso_slug: 'obras-publicas'
  readonly name: string
  readonly description: string
  readonly sector: string
  readonly province: string
  readonly status: string
  readonly bribe_amount_usd: number
  readonly contract_value_usd: number
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface CaseInvolvesRelParams {
  readonly case_id: string
  readonly entity_id: string
  readonly entity_label: string // 'Contractor' | 'PublicWork' | 'Intermediary'
  readonly role: string
}

export interface BribedByRelParams {
  readonly case_id: string
  readonly politician_name: string
  readonly position: string
  readonly period: string
}

export interface IntermediatedRelParams {
  readonly intermediary_id: string
  readonly case_id: string
}
