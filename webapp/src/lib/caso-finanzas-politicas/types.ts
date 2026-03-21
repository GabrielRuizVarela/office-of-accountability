/**
 * Caso Finanzas Politicas — Zod schemas and TypeScript interfaces.
 *
 * Covers all node types in the Argentine political finance investigation:
 * Person, Organization, Event, Claim, MoneyFlow, ShellCompany, GovernmentAction.
 *
 * All nodes use generic Neo4j labels with caso_slug = 'caso-finanzas-politicas'.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CASO_FINPOL_SLUG = 'caso-finanzas-politicas'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ClaimStatus = 'confirmed' | 'alleged' | 'confirmed_cleared' | 'unconfirmed'

export type InvestigationCategory = 'political' | 'financial' | 'legal' | 'corporate'

export type MoneyFlowDirection = 'inbound' | 'outbound' | 'transfer'

export type GovernmentActionType =
  | 'decree'
  | 'resolution'
  | 'law'
  | 'investigation'
  | 'appointment'
  | 'sanction'

export type RelationshipType =
  | 'OFFICER_OF'
  | 'DONATED_TO'
  | 'CONTRACTED_BY'
  | 'ASSOCIATED_WITH'
  | 'FLOW_FROM'
  | 'FLOW_TO'
  | 'PARTICIPATED_IN'
  | 'MENTIONED_IN'
  | 'SUBJECT_OF'

// ---------------------------------------------------------------------------
// Node interfaces
// ---------------------------------------------------------------------------

export interface FinPolPerson {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly role?: string
  readonly description?: string
  readonly party?: string
  readonly nationality?: string
  readonly datasets?: number
}

export interface FinPolOrganization {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly org_type?: string
  readonly description?: string
  readonly country?: string
  readonly jurisdiction?: string
}

export interface FinPolEvent {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly date: string
  readonly event_type?: string
  readonly description?: string
  readonly category?: InvestigationCategory
  readonly source_url?: string
}

export interface FinPolClaim {
  readonly id: string
  readonly claim_es: string
  readonly claim_en: string
  readonly status: ClaimStatus
  readonly tier: number
  readonly source: string
  readonly source_url: string
  readonly detail_es?: string
  readonly detail_en?: string
}

export interface FinPolMoneyFlow {
  readonly id: string
  readonly from_label: string
  readonly to_label: string
  readonly amount_ars: number
  readonly description_es: string
  readonly description_en: string
  readonly date: string
  readonly source: string
  readonly source_url: string
  readonly direction?: MoneyFlowDirection
}

export interface FinPolShellCompany {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly jurisdiction: string
  readonly incorporation_date?: string
  readonly source: string
  readonly source_url?: string
  readonly status?: string
}

export interface FinPolGovernmentAction {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly action_type: GovernmentActionType
  readonly date: string
  readonly description?: string
  readonly source_url?: string
}

// ---------------------------------------------------------------------------
// Zod schemas
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

export const organizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  org_type: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
  jurisdiction: z.string().optional(),
})

export const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z.string().min(1),
  event_type: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['political', 'financial', 'legal', 'corporate']).optional(),
  source_url: z.string().optional(),
})

export const claimSchema = z.object({
  id: z.string().min(1),
  claim_es: z.string().min(1),
  claim_en: z.string().min(1),
  status: z.enum(['confirmed', 'alleged', 'confirmed_cleared', 'unconfirmed']),
  tier: z.number().int().min(1).max(5),
  source: z.string().min(1),
  source_url: z.string(),
  detail_es: z.string().optional(),
  detail_en: z.string().optional(),
})

export const moneyFlowSchema = z.object({
  id: z.string().min(1),
  from_label: z.string().min(1),
  to_label: z.string().min(1),
  amount_ars: z.number(),
  description_es: z.string(),
  description_en: z.string(),
  date: z.string().min(1),
  source: z.string().min(1),
  source_url: z.string(),
  direction: z.enum(['inbound', 'outbound', 'transfer']).optional(),
})

export const shellCompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  jurisdiction: z.string().min(1),
  incorporation_date: z.string().optional(),
  source: z.string().min(1),
  source_url: z.string().optional(),
  status: z.string().optional(),
})

export const governmentActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  action_type: z.enum(['decree', 'resolution', 'law', 'investigation', 'appointment', 'sanction']),
  date: z.string().min(1),
  description: z.string().optional(),
  source_url: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Claim status display config
// ---------------------------------------------------------------------------

export const CLAIM_STATUS_COLORS: Readonly<Record<ClaimStatus, string>> = {
  confirmed: '#ef4444',
  alleged: '#f59e0b',
  confirmed_cleared: '#22c55e',
  unconfirmed: '#6b7280',
}

export const CLAIM_STATUS_LABELS: Readonly<Record<ClaimStatus, { es: string; en: string }>> = {
  confirmed: { es: 'Confirmado', en: 'Confirmed' },
  alleged: { es: 'Alegado', en: 'Alleged' },
  confirmed_cleared: { es: 'Desestimado', en: 'Cleared' },
  unconfirmed: { es: 'Sin confirmar', en: 'Unconfirmed' },
}
