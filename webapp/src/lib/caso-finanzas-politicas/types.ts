/**
 * Caso Finanzas Politicas — Zod schemas and TypeScript interfaces.
 *
 * Covers all node types and relationships for the Argentine Political
 * Finance investigation knowledge graph.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Slug constant
// ---------------------------------------------------------------------------

export const CASO_FINANZAS_POLITICAS_SLUG = 'caso-finanzas-politicas'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const claimStatusSchema = z.enum([
  'confirmed',
  'alleged',
  'confirmed_cleared',
  'unconfirmed',
])
export type ClaimStatus = z.infer<typeof claimStatusSchema>

export const investigationCategorySchema = z.enum([
  'political',
  'financial',
  'legal',
  'corporate',
])
export type InvestigationCategory = z.infer<typeof investigationCategorySchema>

// ---------------------------------------------------------------------------
// Node schemas
// ---------------------------------------------------------------------------

export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  party: z.string().optional(),
  nationality: z.string().optional(),
  datasets: z.number().int().nonnegative().optional(),
})

export type Person = z.infer<typeof personSchema>

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  org_type: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
})

export type Organization = z.infer<typeof organizationSchema>

export const claimSchema = z.object({
  id: z.string().min(1),
  claim: z.string().min(1),
  status: claimStatusSchema,
  tier: z.number().int().min(1).max(5),
  source: z.string().min(1),
  source_url: z.string().url().optional(),
  detail: z.string().optional(),
})

export type Claim = z.infer<typeof claimSchema>

export const moneyFlowSchema = z.object({
  id: z.string().min(1),
  from_id: z.string().min(1),
  to_id: z.string().min(1),
  amount_ars: z.number().nonnegative(),
  description: z.string().optional(),
  date: z.string(),
  source: z.string().optional(),
  source_url: z.string().url().optional(),
})

export type MoneyFlow = z.infer<typeof moneyFlowSchema>

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
  category: investigationCategorySchema,
  source_url: z.string().url().optional(),
})

export type FinanzasPoliticasEvent = z.infer<typeof eventSchema>

export const governmentActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  action_type: z.string(),
  date: z.string(),
  source_url: z.string().url().optional(),
  summary: z.string().optional(),
})

export type GovernmentAction = z.infer<typeof governmentActionSchema>

export const documentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  doc_type: z.string(),
  source_url: z.string().url().optional(),
  summary: z.string().optional(),
  date_published: z.string().optional(),
})

export type FinanzasPoliticasDocument = z.infer<typeof documentSchema>

// ---------------------------------------------------------------------------
// Relationship types
// ---------------------------------------------------------------------------

export type RelationshipType =
  | 'AFFILIATED_WITH'
  | 'DONATED_TO'
  | 'CONTRACTED_BY'
  | 'OWNS'
  | 'DIRECTED'
  | 'PARTICIPATED_IN'
  | 'DOCUMENTED_BY'
  | 'MENTIONS'
  | 'RECEIVED_FROM'
  | 'RELATED_TO'

// ---------------------------------------------------------------------------
// Category display config
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Readonly<Record<InvestigationCategory, string>> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  corporate: '#a855f7',
}

export const CATEGORY_LABELS: Readonly<Record<InvestigationCategory, string>> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  corporate: 'Corporativo',
}

// ---------------------------------------------------------------------------
// Claim status display config
// ---------------------------------------------------------------------------

export const CLAIM_STATUS_COLORS: Readonly<Record<ClaimStatus, string>> = {
  confirmed: '#10b981',
  alleged: '#f59e0b',
  confirmed_cleared: '#6b7280',
  unconfirmed: '#ef4444',
}

export const CLAIM_STATUS_LABELS: Readonly<Record<ClaimStatus, string>> = {
  confirmed: 'Confirmado',
  alleged: 'Presunto',
  confirmed_cleared: 'Descartado',
  unconfirmed: 'Sin confirmar',
}

// ---------------------------------------------------------------------------
// Investigation stats
// ---------------------------------------------------------------------------

export interface FinanzasPoliticasStats {
  readonly crossDatasetMatches: string
  readonly politiciansMultiDataset: string
  readonly graphNodes: string
  readonly dataSources: number
  readonly actorCount: number
  readonly claimCount: number
  readonly moneyFlowCount: number
}
