/**
 * Epstein investigation data types and Zod schemas.
 *
 * Covers all node types in the Epstein knowledge graph:
 * Person, Flight, Location, Document, Event, Organization, LegalCase.
 */

import { z } from 'zod/v4'

import type { ConfidenceTier } from '../ingestion/types'

export type { ConfidenceTier }

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type LocationType = 'property' | 'office' | 'island' | 'ranch' | 'apartment'

export type DocumentType =
  | 'court_filing'
  | 'deposition'
  | 'fbi'
  | 'flight_log'
  | 'police_report'
  | 'financial'
  | 'media_investigation'
  | 'medical'

export type EventType = 'legal' | 'social' | 'financial' | 'arrest' | 'death' | 'media'

export type OrgType = 'company' | 'bank' | 'foundation' | 'government' | 'modeling_agency' | 'prison'

export type CaseStatus = 'filed' | 'active' | 'settled' | 'closed' | 'dismissed'

export type RelationshipType =
  | 'associate'
  | 'employer'
  | 'attorney'
  | 'accuser'
  | 'victim'
  | 'employee'
  | 'client'
  | 'friend'
  | 'co_conspirator'
  | 'pilot'

// ---------------------------------------------------------------------------
// Node interfaces
// ---------------------------------------------------------------------------

export interface EpsteinPerson {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly role: string
  readonly description: string
  readonly nationality: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinFlight {
  readonly id: string
  readonly flight_number: string
  readonly date: string
  readonly origin: string
  readonly destination: string
  readonly aircraft: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinLocation {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly location_type: LocationType
  readonly address: string
  readonly coordinates: string | null
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinDocument {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly doc_type: DocumentType
  readonly source_url: string
  readonly summary: string
  readonly date: string
  readonly key_findings: string[]
  readonly excerpt: string
  readonly page_count: number | null
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinDocumentWithCount extends EpsteinDocument {
  readonly mentionedPersonCount: number
}

export interface EpsteinEvent {
  readonly id: string
  readonly title: string
  readonly date: string
  readonly event_type: EventType
  readonly description: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinOrganization {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly org_type: OrgType
  readonly description: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface EpsteinLegalCase {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly case_number: string
  readonly court: string
  readonly status: CaseStatus
  readonly date_filed: string
  readonly confidence_tier?: ConfidenceTier
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
  nationality: z.string().max(100),
})

export const flightSchema = z.object({
  flight_number: z.string().max(50),
  date: z.string().min(1).max(30),
  origin: z.string().max(200),
  destination: z.string().max(200),
  aircraft: z.string().max(100),
})

export const locationSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  location_type: z.enum(['property', 'office', 'island', 'ranch', 'apartment']),
  address: z.string().max(500),
  coordinates: z.string().max(100).nullable().optional(),
})

export const documentSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  doc_type: z.enum([
    'court_filing',
    'deposition',
    'fbi',
    'flight_log',
    'police_report',
    'financial',
    'media_investigation',
    'medical',
  ]),
  source_url: z.string().max(2000),
  summary: z.string().max(5000),
  date: z.string().min(1).max(30),
  key_findings: z.array(z.string().max(1000)),
  excerpt: z.string().max(5000),
  page_count: z.number().int().positive().nullable(),
})

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  court_filing: 'Court Filing',
  deposition: 'Deposition',
  fbi: 'FBI Record',
  flight_log: 'Flight Log',
  police_report: 'Police Report',
  financial: 'Financial Record',
  media_investigation: 'Investigative Journalism',
  medical: 'Medical Record',
}

export const DOCUMENT_TYPE_LABELS_PLURAL: Record<DocumentType, string> = {
  court_filing: 'Court Filings',
  deposition: 'Depositions',
  fbi: 'FBI Records',
  flight_log: 'Flight Logs',
  police_report: 'Police Reports',
  financial: 'Financial Records',
  media_investigation: 'Investigative Journalism',
  medical: 'Medical Records',
}

export const eventSchema = z.object({
  title: z.string().min(1).max(500),
  date: z.string().min(1).max(30),
  event_type: z.enum(['legal', 'social', 'financial', 'arrest', 'death', 'media']),
  description: z.string().max(5000),
})

export const organizationSchema = z.object({
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  org_type: z.enum(['company', 'bank', 'foundation', 'government', 'modeling_agency', 'prison']),
  description: z.string().max(5000),
})

export const legalCaseSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  case_number: z.string().max(100),
  court: z.string().max(300),
  status: z.enum(['filed', 'active', 'settled', 'closed', 'dismissed']),
  date_filed: z.string().min(1).max(30),
})

// ---------------------------------------------------------------------------
// Investigation slug constant
// ---------------------------------------------------------------------------

export const CASO_EPSTEIN_SLUG = 'caso-epstein'
