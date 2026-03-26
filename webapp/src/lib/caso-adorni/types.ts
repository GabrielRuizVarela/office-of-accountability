/**
 * Adorni investigation Neo4j node types and Zod schemas.
 *
 * Every entity carries caso_slug, ingestion_wave, confidence_tier,
 * and source provenance fields for traceability.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Confidence tiers
// ---------------------------------------------------------------------------

export const ConfidenceTier = z.enum(['gold', 'silver', 'bronze'])
export type ConfidenceTier = z.infer<typeof ConfidenceTier>

// ---------------------------------------------------------------------------
// Base entity schema (shared fields)
// ---------------------------------------------------------------------------

const BaseEntity = z.object({
  id: z.string(),
  caso_slug: z.literal('caso-adorni'),
  ingestion_wave: z.number().int().min(1).max(13),
  confidence_tier: ConfidenceTier,
  source: z.string(),
  source_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// ---------------------------------------------------------------------------
// Person (Adorni, associates, government officials)
// ---------------------------------------------------------------------------

export const AdorniPerson = BaseEntity.extend({
  name: z.string(),
  role_es: z.string(),
  role_en: z.string(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  cuit: z.string().optional(),
  dni: z.string().optional(),
  party: z.string().optional(),
  government_position_es: z.string().optional(),
  government_position_en: z.string().optional(),
  tenure_start: z.string().optional(),
  tenure_end: z.string().optional(),
})
export type AdorniPerson = z.infer<typeof AdorniPerson>

// ---------------------------------------------------------------------------
// Organization (companies, media outlets, govt agencies)
// ---------------------------------------------------------------------------

export const AdorniOrganization = BaseEntity.extend({
  name: z.string(),
  type: z.enum(['company', 'media', 'government_agency', 'political_party', 'ngo']),
  cuit: z.string().optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
})
export type AdorniOrganization = z.infer<typeof AdorniOrganization>

// ---------------------------------------------------------------------------
// Contract (government procurement)
// ---------------------------------------------------------------------------

export const AdorniContract = BaseEntity.extend({
  contract_id: z.string(),
  description_es: z.string(),
  description_en: z.string(),
  amount_ars: z.number(),
  date: z.string(),
  contractor_cuit: z.string().optional(),
  contractor_name: z.string(),
  awarding_agency: z.string(),
})
export type AdorniContract = z.infer<typeof AdorniContract>

// ---------------------------------------------------------------------------
// Statement (press conference claims, public declarations)
// ---------------------------------------------------------------------------

export const AdorniStatement = BaseEntity.extend({
  date: z.string(),
  claim_es: z.string(),
  claim_en: z.string(),
  context_es: z.string(),
  context_en: z.string(),
  verified: z.boolean(),
  verification_es: z.string().optional(),
  verification_en: z.string().optional(),
  video_url: z.string().url().optional(),
})
export type AdorniStatement = z.infer<typeof AdorniStatement>

// ---------------------------------------------------------------------------
// Legal Case
// ---------------------------------------------------------------------------

export const AdorniLegalCase = BaseEntity.extend({
  case_number: z.string(),
  court: z.string(),
  judge: z.string().optional(),
  status_es: z.string(),
  status_en: z.string(),
  description_es: z.string(),
  description_en: z.string(),
  filing_date: z.string(),
  parties: z.array(z.string()),
})
export type AdorniLegalCase = z.infer<typeof AdorniLegalCase>

// ---------------------------------------------------------------------------
// Video (YouTube transcript source)
// ---------------------------------------------------------------------------

export const AdorniVideo = BaseEntity.extend({
  video_id: z.string(),
  url: z.string().url(),
  title: z.string(),
  source_type: z.enum(['conference', 'interview', 'congressional', 'investigative', 'news']),
  transcript_text: z.string().optional(),
  duration_seconds: z.number().optional(),
  entity_mentions_count: z.number().optional(),
})
export type AdorniVideo = z.infer<typeof AdorniVideo>
