/**
 * Nuclear Risk Tracking investigation — Zod schemas and TypeScript interfaces.
 *
 * Covers all node types and relationships for the global nuclear
 * risk escalation monitoring knowledge graph.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const escalationLevelSchema = z.enum([
  'routine',
  'notable',
  'elevated',
  'serious',
  'critical',
])
export type EscalationLevel = z.infer<typeof escalationLevelSchema>

export const signalTypeSchema = z.enum([
  'nuclear_test',
  'missile_launch',
  'force_posture_change',
  'treaty_action',
  'official_statement',
  'inspection_event',
  'proliferation_activity',
  'facility_event',
  'military_exercise',
  'diplomatic_action',
  'osint_observation',
  'policy_analysis',
])
export type SignalType = z.infer<typeof signalTypeSchema>

export const theaterSchema = z.enum([
  'US-Russia',
  'Indo-Pacific',
  'Korean Peninsula',
  'Middle East',
  'Europe',
  'South Asia',
  'Global',
])
export type Theater = z.infer<typeof theaterSchema>

export const nuclearStatusSchema = z.enum([
  'armed',
  'threshold',
  'non-nuclear',
])
export type NuclearStatus = z.infer<typeof nuclearStatusSchema>

export const actorTypeSchema = z.enum([
  'state',
  'organization',
  'agency',
])
export type ActorType = z.infer<typeof actorTypeSchema>

export const treatyStatusSchema = z.enum([
  'active',
  'suspended',
  'withdrawn',
  'expired',
])
export type TreatyStatus = z.infer<typeof treatyStatusSchema>

export const weaponCategorySchema = z.enum([
  'icbm',
  'slbm',
  'tactical',
  'hypersonic',
  'missile_defense',
  'bomber',
  'cruise_missile',
  'submarine',
])
export type WeaponCategory = z.infer<typeof weaponCategorySchema>

export const facilityTypeSchema = z.enum([
  'enrichment',
  'reprocessing',
  'reactor',
  'test_site',
  'storage',
  'assembly',
  'research',
  'command_control',
])
export type FacilityType = z.infer<typeof facilityTypeSchema>

export const trendDirectionSchema = z.enum([
  'rising',
  'stable',
  'declining',
])
export type TrendDirection = z.infer<typeof trendDirectionSchema>

// ---------------------------------------------------------------------------
// Provenance (shared across all nodes)
// ---------------------------------------------------------------------------

export interface NuclearProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'gold' | 'silver' | 'bronze'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

// ---------------------------------------------------------------------------
// Node schemas
// ---------------------------------------------------------------------------

export const nuclearSignalSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  title_en: z.string().min(1),
  title_es: z.string().default(''),
  summary_en: z.string().min(1),
  summary_es: z.string().default(''),
  severity: z.number().min(0).max(100),
  escalation_level: escalationLevelSchema,
  signal_type: signalTypeSchema,
  theater: theaterSchema,
  source_url: z.string().url().optional(),
  source_module: z.string().optional(),
})
export type NuclearSignal = z.infer<typeof nuclearSignalSchema>

export const nuclearActorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  actor_type: actorTypeSchema,
  nuclear_status: nuclearStatusSchema,
  description_en: z.string().default(''),
  description_es: z.string().default(''),
})
export type NuclearActor = z.infer<typeof nuclearActorSchema>

export const weaponSystemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: weaponCategorySchema,
  operator_id: z.string().min(1),
  description_en: z.string().default(''),
  range_km: z.number().optional(),
  warheads: z.number().optional(),
})
export type WeaponSystem = z.infer<typeof weaponSystemSchema>

export const treatySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: treatyStatusSchema,
  signed_date: z.string().optional(),
  parties: z.array(z.string()).default([]),
  description_en: z.string().default(''),
  description_es: z.string().default(''),
})
export type Treaty = z.infer<typeof treatySchema>

export const nuclearFacilitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  facility_type: facilityTypeSchema,
  location: z.string().default(''),
  lat: z.number().optional(),
  lng: z.number().optional(),
  operator_id: z.string().min(1),
  description_en: z.string().default(''),
})
export type NuclearFacility = z.infer<typeof nuclearFacilitySchema>

export const signalSourceSchema = z.object({
  id: z.string().min(1),
  source_module: z.string().min(1),
  source_url: z.string().url(),
  tier: z.enum(['gold', 'silver', 'bronze']),
  fetched_at: z.string().min(1),
  raw_title: z.string().default(''),
})
export type SignalSource = z.infer<typeof signalSourceSchema>

export const riskBriefingSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  period: z.enum(['daily', 'weekly']),
  overall_score: z.number().min(0).max(100),
  summary_en: z.string().min(1),
  summary_es: z.string().default(''),
  theaters_summary: z.string().default(''),
})
export type RiskBriefing = z.infer<typeof riskBriefingSchema>

// ---------------------------------------------------------------------------
// Relationship types
// ---------------------------------------------------------------------------

export type NuclearRelationshipType =
  | 'INVOLVES'
  | 'REFERENCES_SYSTEM'
  | 'REFERENCES_TREATY'
  | 'LOCATED_AT'
  | 'ESCALATES'
  | 'OPERATES'
  | 'PARTY_TO'
  | 'POSSESSES'
  | 'SYNTHESIZES'
  | 'SOURCED_FROM'
  | 'REFERENCES'

// ---------------------------------------------------------------------------
// Escalation level display config
// ---------------------------------------------------------------------------

export const ESCALATION_COLORS: Readonly<Record<EscalationLevel, string>> = {
  routine: '#22c55e',
  notable: '#eab308',
  elevated: '#f97316',
  serious: '#ef4444',
  critical: '#dc2626',
}

export const ESCALATION_LABELS: Readonly<Record<EscalationLevel, string>> = {
  routine: 'Rutina',
  notable: 'Notable',
  elevated: 'Elevado',
  serious: 'Serio',
  critical: 'Critico',
}

export const THEATER_LABELS: Readonly<Record<Theater, string>> = {
  'US-Russia': 'EE.UU.-Rusia',
  'Indo-Pacific': 'Indo-Pacifico',
  'Korean Peninsula': 'Peninsula Coreana',
  'Middle East': 'Medio Oriente',
  'Europe': 'Europa',
  'South Asia': 'Asia del Sur',
  'Global': 'Global',
}
