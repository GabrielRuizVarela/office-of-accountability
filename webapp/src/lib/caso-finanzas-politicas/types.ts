/**
 * Caso Finanzas Politicas — Zod schemas and TypeScript interfaces.
 *
 * Covers node types in the Argentine Political Finance investigation:
 * Person, Organization, ShellCompany, Event, Claim, MoneyFlow, GovernmentAction.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Investigation slug
// ---------------------------------------------------------------------------

export const CASO_FP_SLUG = 'caso-finanzas-politicas'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type ClaimStatus = 'confirmed' | 'alleged' | 'confirmed_cleared' | 'unconfirmed'

export type InvestigationCategory = 'political' | 'financial' | 'legal' | 'corporate'

export type OrgType = 'shell_company' | 'government' | 'intermediary' | 'political_party' | 'company'

export type GovernmentActionType = 'judicial' | 'legislative' | 'regulatory' | 'executive'

// ---------------------------------------------------------------------------
// Node interfaces
// ---------------------------------------------------------------------------

export interface FPPerson {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly role: string
  readonly description: string
  readonly party: string
  readonly datasets: number
  readonly nationality: string
  readonly confidence_tier?: string
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface FPOrganization {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly org_type: OrgType
  readonly description: string
  readonly country: string
  readonly confidence_tier?: string
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface FPShellCompany {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly jurisdiction: string
  readonly incorporation_date: string
  readonly intermediary: string
  readonly status: string
  readonly confidence_tier?: string
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface FPEvent {
  readonly id: string
  readonly title: string
  readonly date: string
  readonly event_type: InvestigationCategory
  readonly description: string
  readonly confidence_tier?: string
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface FPClaim {
  readonly id: string
  readonly claim_es: string
  readonly claim_en: string
  readonly status: ClaimStatus
  readonly tier: number
  readonly source: string
  readonly source_url: string
  readonly detail_es: string
  readonly detail_en: string
  readonly confidence_tier?: string
  readonly ingestion_wave?: number
}

export interface FPMoneyFlow {
  readonly id: string
  readonly from_label: string
  readonly to_label: string
  readonly amount_ars: number
  readonly description: string
  readonly date: string
  readonly source: string
  readonly source_url: string
  readonly confidence_tier?: string
  readonly ingestion_wave?: number
}

export interface FPGovernmentAction {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly action_type: GovernmentActionType
  readonly description: string
  readonly date: string
  readonly authority: string
  readonly confidence_tier?: string
  readonly source?: string
  readonly ingestion_wave?: number
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const personSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  role: z.string().max(500),
  description: z.string().max(5000),
  party: z.string().max(200),
  datasets: z.number().int().nonnegative(),
  nationality: z.string().max(100),
})

export const organizationSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  org_type: z.enum(['shell_company', 'government', 'intermediary', 'political_party', 'company']),
  description: z.string().max(5000),
  country: z.string().max(100),
})

export const shellCompanySchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  jurisdiction: z.string().max(200),
  incorporation_date: z.string().max(30),
  intermediary: z.string().max(300),
  status: z.string().max(50),
})

export const eventSchema = z.object({
  title: z.string().min(1).max(500),
  date: z.string().min(1).max(30),
  event_type: z.enum(['political', 'financial', 'legal', 'corporate']),
  description: z.string().max(5000),
})

export const claimSchema = z.object({
  claim_es: z.string().min(1).max(5000),
  claim_en: z.string().min(1).max(5000),
  status: z.enum(['confirmed', 'alleged', 'confirmed_cleared', 'unconfirmed']),
  tier: z.number().int().min(1).max(5),
  source: z.string().max(500),
  source_url: z.string().max(2000),
})

export const moneyFlowSchema = z.object({
  from_label: z.string().min(1).max(300),
  to_label: z.string().min(1).max(300),
  amount_ars: z.number().nonnegative(),
  description: z.string().max(5000),
  date: z.string().max(30),
  source: z.string().max(500),
  source_url: z.string().max(2000),
})

export const governmentActionSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  action_type: z.enum(['judicial', 'legislative', 'regulatory', 'executive']),
  description: z.string().max(5000),
  date: z.string().min(1).max(30),
  authority: z.string().max(300),
})

// ---------------------------------------------------------------------------
// Display label mappings
// ---------------------------------------------------------------------------

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  confirmed: 'Confirmado',
  alleged: 'Alegado',
  confirmed_cleared: 'Confirmado (absuelto)',
  unconfirmed: 'Sin confirmar',
}

export const CATEGORY_LABELS: Record<InvestigationCategory, string> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  corporate: 'Corporativo',
}
