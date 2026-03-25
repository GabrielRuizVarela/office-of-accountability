/**
 * Argentine Military Dictatorship investigation data types and Zod schemas.
 *
 * Covers all node types in the caso-dictadura knowledge graph:
 * DictaduraPersona, DictaduraCCD, DictaduraUnidadMilitar, DictaduraLugar,
 * DictaduraEvento, DictaduraCausa, DictaduraSentencia, DictaduraTribunal,
 * DictaduraDocumento, DictaduraAgencia, DictaduraOrganizacion,
 * DictaduraOperacion, DictaduraActa, DictaduraArchivo.
 */

import { z } from 'zod/v4'

import type { ConfidenceTier } from '../ingestion/types'

export type { ConfidenceTier }

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type PersonaCategory =
  | 'victima'
  | 'represor'
  | 'imputado'
  | 'complice_civil'
  | 'testigo'
  | 'juez'
  | 'diplomatico'
  | 'niño_apropiado'

export type DocumentType =
  | 'cable_diplomatico'
  | 'testimonio'
  | 'sentencia'
  | 'informe'
  | 'acta'
  | 'legajo'
  | 'foto'
  | 'expediente'

export type EventType =
  | 'operativo'
  | 'secuestro'
  | 'masacre'
  | 'juicio'
  | 'politico'
  | 'diplomatico'
  | 'legislativo'
  | 'restitucion'

export type OrgType =
  | 'ddhh'
  | 'militar'
  | 'gobierno'
  | 'empresa'
  | 'partido_politico'
  | 'inteligencia'
  | 'judicial'

export type CausaStatus = 'en_instruccion' | 'elevada_a_juicio' | 'en_juicio' | 'con_sentencia' | 'cerrada'

export type MilitaryBranch = 'EJÉRCITO' | 'ARMADA' | 'FUERZA_AÉREA' | 'PFA' | 'POLICÍA_PROVINCIAL' | 'SIDE' | 'MIXTO'

// ---------------------------------------------------------------------------
// Node interfaces
// ---------------------------------------------------------------------------

export interface DictaduraPersona {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly category: PersonaCategory
  readonly description?: string
  readonly ruvte_id?: string
  readonly dni?: string
  readonly birth_year?: string
  readonly birth_province?: string
  readonly nationality?: string
  readonly age_at_event?: string
  readonly pregnancy?: string
  readonly detention_date?: string
  readonly detention_location?: string
  readonly death_date?: string
  readonly rank?: string
  readonly unit?: string
  readonly employer?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraCCD {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly aliases?: string[]
  readonly address?: string
  readonly lat?: number
  readonly lon?: number
  readonly province?: string
  readonly municipality?: string
  readonly military_branch?: string
  readonly operating_period?: string
  readonly is_memory_space?: boolean
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraUnidadMilitar {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly branch?: MilitaryBranch
  readonly zone?: string
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraLugar {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly province?: string
  readonly country?: string
  readonly lat?: number
  readonly lon?: number
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraEvento {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly date: string
  readonly event_type: EventType
  readonly description: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraCausa {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly case_number?: string
  readonly status: CausaStatus
  readonly tribunal?: string
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraSentencia {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly date: string
  readonly outcome?: string
  readonly years?: number
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraTribunal {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly jurisdiction?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraDocumento {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly doc_type: DocumentType
  readonly source_url?: string
  readonly summary?: string
  readonly date?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraAgencia {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly country?: string
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraOrganizacion {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly org_type: OrgType
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraOperacion {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly description?: string
  readonly start_date?: string
  readonly end_date?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraActa {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly date: string
  readonly acta_number?: string
  readonly summary?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

export interface DictaduraArchivo {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly institution?: string
  readonly description?: string
  readonly confidence_tier?: ConfidenceTier
  readonly source?: string
  readonly ingestion_wave?: number
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const personaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  category: z.enum(['victima', 'represor', 'imputado', 'complice_civil', 'testigo', 'juez', 'diplomatico', 'niño_apropiado']),
  caso_slug: z.literal('caso-dictadura'),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
  ruvte_id: z.string().optional(),
  dni: z.string().optional(),
  detention_date: z.string().optional(),
  detention_location: z.string().optional(),
})

export const ccdSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  slug: z.string().min(1).max(200),
  caso_slug: z.literal('caso-dictadura'),
  lat: z.number().optional(),
  lon: z.number().optional(),
  military_branch: z.string().optional(),
  province: z.string().optional(),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
})

export const causaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  caso_slug: z.literal('caso-dictadura'),
  status: z.enum(['en_instruccion', 'elevada_a_juicio', 'en_juicio', 'con_sentencia', 'cerrada']),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
})

export const documentoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  doc_type: z.enum(['cable_diplomatico', 'testimonio', 'sentencia', 'informe', 'acta', 'legajo', 'foto', 'expediente']),
  caso_slug: z.literal('caso-dictadura'),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
})

export const sentenciaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  date: z.string().min(1).max(30),
  caso_slug: z.literal('caso-dictadura'),
  confidence_tier: z.enum(['gold', 'silver', 'bronze']),
  ingestion_wave: z.number().int(),
  source: z.string(),
})

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  cable_diplomatico: 'Cable Diplomático',
  testimonio: 'Testimonio',
  sentencia: 'Sentencia',
  informe: 'Informe',
  acta: 'Acta',
  legajo: 'Legajo',
  foto: 'Fotografía',
  expediente: 'Expediente',
}

export const PERSONA_CATEGORY_LABELS: Record<PersonaCategory, string> = {
  victima: 'Víctima',
  represor: 'Represor',
  imputado: 'Imputado',
  complice_civil: 'Cómplice Civil',
  testigo: 'Testigo',
  juez: 'Juez/a',
  diplomatico: 'Diplomático/a',
  niño_apropiado: 'Niño/a Apropiado/a',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  operativo: 'Operativo',
  secuestro: 'Secuestro',
  masacre: 'Masacre',
  juicio: 'Juicio',
  politico: 'Político',
  diplomatico: 'Diplomático',
  legislativo: 'Legislativo',
  restitucion: 'Restitución',
}

// ---------------------------------------------------------------------------
// Investigation slug constant
// ---------------------------------------------------------------------------

export const CASO_DICTADURA_SLUG = 'caso-dictadura'
