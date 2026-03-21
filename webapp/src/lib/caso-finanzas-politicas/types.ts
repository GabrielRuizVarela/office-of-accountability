/**
 * Caso Finanzas Politicas — Zod schemas and TypeScript interfaces.
 *
 * Covers all node types for the Argentine Political Finance investigation
 * knowledge graph: Person, Organization, Event, MoneyFlow, Claim.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const factcheckStatusSchema = z.enum([
  'confirmed',
  'alleged',
  'confirmed_cleared',
  'unconfirmed',
])
export type FactcheckStatus = z.infer<typeof factcheckStatusSchema>

export const investigationCategorySchema = z.enum([
  'political',
  'financial',
  'legal',
  'corporate',
])
export type InvestigationCategory = z.infer<typeof investigationCategorySchema>

export const orgTypeSchema = z.enum([
  'shell_company',
  'political_party',
  'government_agency',
  'contractor',
  'foundation',
  'media',
])
export type OrgType = z.infer<typeof orgTypeSchema>

// ---------------------------------------------------------------------------
// Node schemas
// ---------------------------------------------------------------------------

export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  role_es: z.string().optional(),
  role_en: z.string().optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  party: z.string().optional(),
  datasets: z.number().int().nonnegative().optional(),
  status_es: z.string().optional(),
  status_en: z.string().optional(),
})

export type Person = z.infer<typeof personSchema>

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  org_type: orgTypeSchema.optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  country: z.string().optional(),
})

export type Organization = z.infer<typeof organizationSchema>

export const eventSchema = z.object({
  id: z.string().min(1),
  title_es: z.string().min(1),
  title_en: z.string().optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  date: z.string(),
  category: investigationCategorySchema,
  sources: z.array(z.string()).optional(),
})

export type FPEvent = z.infer<typeof eventSchema>

export const moneyFlowSchema = z.object({
  id: z.string().min(1),
  from_label: z.string().min(1),
  to_label: z.string().min(1),
  amount_ars: z.number().nonnegative(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  date: z.string(),
  source: z.string().optional(),
  source_url: z.string().optional(),
})

export type MoneyFlow = z.infer<typeof moneyFlowSchema>

export const claimSchema = z.object({
  id: z.string().min(1),
  claim_es: z.string().min(1),
  claim_en: z.string().optional(),
  status: factcheckStatusSchema,
  tier: z.number().int().min(1).max(5),
  source: z.string().optional(),
  source_url: z.string().optional(),
  detail_es: z.string().optional(),
  detail_en: z.string().optional(),
})

export type Claim = z.infer<typeof claimSchema>

// ---------------------------------------------------------------------------
// Relationship types
// ---------------------------------------------------------------------------

export type RelationshipType =
  | 'AFFILIATED_WITH'
  | 'DONATED_TO'
  | 'CONTRACTED_BY'
  | 'DIRECTED'
  | 'OWNS'
  | 'MONEY_FLOW'
  | 'PARTICIPATED_IN'
  | 'MENTIONED_IN'
  | 'SUBJECT_OF'

// ---------------------------------------------------------------------------
// Category display config
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Readonly<Record<InvestigationCategory, string>> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  corporate: '#f59e0b',
}

export const CATEGORY_LABELS: Readonly<Record<InvestigationCategory, string>> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  corporate: 'Corporativo',
}

export const FACTCHECK_STATUS_LABELS: Readonly<Record<FactcheckStatus, string>> = {
  confirmed: 'Confirmado',
  alleged: 'Alegado',
  confirmed_cleared: 'Desestimado',
  unconfirmed: 'No confirmado',
}

// ---------------------------------------------------------------------------
// Impact stat
// ---------------------------------------------------------------------------

export interface ImpactStat {
  readonly value: string
  readonly label_es: string
  readonly label_en: string
  readonly source: string
}

// ---------------------------------------------------------------------------
// Investigation slug constant
// ---------------------------------------------------------------------------

export const CASO_FP_SLUG = 'caso-finanzas-politicas'
