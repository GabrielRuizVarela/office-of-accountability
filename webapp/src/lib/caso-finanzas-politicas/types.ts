/**
 * Caso Finanzas Politicas - Zod schemas and TypeScript interfaces.
 *
 * Neo4j graph query result types for the Argentine Political Finance
 * investigation. These are distinct from the seed data types in
 * investigation-data.ts which are for static display.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CASO_FINPOL_SLUG = 'caso-finanzas-politicas'

// ---------------------------------------------------------------------------
// Node schemas
// ---------------------------------------------------------------------------

export const finPolPersonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  role_es: z.string().optional(),
  role_en: z.string().optional(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  party: z.string().optional(),
  nationality: z.string().optional(),
  datasets: z.number().optional(),
})

export type FinPolPerson = z.infer<typeof finPolPersonSchema>

export const finPolEventSchema = z.object({
  id: z.string().min(1),
  title_es: z.string().min(1),
  title_en: z.string().optional(),
  date: z.string(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  category: z.enum(['political', 'financial', 'legal', 'corporate']),
  sources: z.array(z.string()).optional(),
})

export type FinPolEvent = z.infer<typeof finPolEventSchema>

export const finPolDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  doc_type: z.string(),
  source_url: z.string().url().optional(),
  summary: z.string().optional(),
  date_published: z.string().optional(),
})

export type FinPolDocument = z.infer<typeof finPolDocumentSchema>

export const finPolOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  org_type: z.string().optional(),
  description: z.string().optional(),
  country: z.string().optional(),
  datasets: z.array(z.string()).optional(),
})

export type FinPolOrganization = z.infer<typeof finPolOrganizationSchema>

export const finPolMoneyFlowSchema = z.object({
  id: z.string().min(1),
  from_label: z.string().min(1),
  to_label: z.string().min(1),
  amount_ars: z.number().nonnegative(),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  date: z.string().optional(),
  source: z.string().optional(),
  source_url: z.string().url().optional(),
})

export type FinPolMoneyFlow = z.infer<typeof finPolMoneyFlowSchema>

// ---------------------------------------------------------------------------
// Relationship types
// ---------------------------------------------------------------------------

export type RelationshipType =
  | 'DONATED_TO'
  | 'CONTROLS'
  | 'AFFILIATED_WITH'
  | 'RECEIVED_FROM'
  | 'CONTRACTED_BY'
  | 'DIRECTED'
  | 'APPOINTED'

// ---------------------------------------------------------------------------
// Event type display config
// ---------------------------------------------------------------------------

export type EventType = 'political' | 'financial' | 'legal' | 'corporate'

export const EVENT_TYPE_COLORS: Readonly<Record<EventType, string>> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  corporate: '#f59e0b',
}

export const EVENT_TYPE_LABELS: Readonly<Record<EventType, string>> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  corporate: 'Corporativo',
}

// ---------------------------------------------------------------------------
// Timeline item (flattened for display)
// ---------------------------------------------------------------------------

export interface TimelineItem {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly date: string
  readonly event_type: EventType
  readonly source_url: string | null
  readonly actors: readonly { readonly id: string; readonly name: string }[]
}

// ---------------------------------------------------------------------------
// Investigation stats
// ---------------------------------------------------------------------------

export interface FinPolStats {
  readonly crossDatasetMatches: string
  readonly politiciansMultiDataset: string
  readonly totalGraphNodes: string
  readonly actorCount: number
  readonly eventCount: number
  readonly documentCount: number
}
