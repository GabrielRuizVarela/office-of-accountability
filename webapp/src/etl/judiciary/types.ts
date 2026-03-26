/**
 * Types for Argentine federal judiciary designations ETL pipeline.
 *
 * Data source: https://datos.jus.gob.ar/dataset/designaciones-de-magistrados-de-la-justicia-federal-y-la-justicia-nacional
 * CSV: magistrados-justicia-federal-nacional-designaciones-*.csv
 *
 * Contains judge, prosecutor, and public defender appointments since 1976.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schema - matches column headers from the designations CSV
// ---------------------------------------------------------------------------

export const DesignationRowSchema = z.object({
  justicia_federal_o_nacional: z.string().default(''),
  camara: z.string().default(''),
  organo_tipo: z.string().default(''),
  organo_nombre: z.string().default(''),
  cargo_tipo: z.string().default(''),
  cargo_detalle: z.string().default(''),
  magistrado_nombre: z.string().default(''),
  magistrado_dni: z.string().default(''),
  magistrado_genero: z.string().default(''),
  fecha_designacion: z.string().default(''),
  norma_numero: z.string().default(''),
  norma_fecha: z.string().default(''),
  norma_presidente: z.string().default(''),
  norma_ministro: z.string().default(''),
  provincia_id: z.string().default(''),
  provincia_nombre: z.string().default(''),
  localidad_id: z.string().default(''),
  localidad_nombre: z.string().default(''),
})
export type DesignationRow = z.infer<typeof DesignationRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface JudiciaryProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'gold'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface JudgeParams extends JudiciaryProvenanceParams {
  readonly dni: string
  readonly name: string
  readonly gender: string
  readonly current_court: string
  readonly appointment_date: string
  readonly cargo_tipo: string
}

export interface CourtParams extends JudiciaryProvenanceParams {
  readonly court_slug: string
  readonly name: string
  readonly court_type: string
  readonly chamber: string
  readonly province: string
  readonly jurisdiction: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface AppointedByRelParams {
  readonly judge_dni: string
  readonly politician_id: string
  readonly decreto: string
  readonly fecha: string
  readonly cargo_tipo: string
}

export interface ServesInRelParams {
  readonly judge_dni: string
  readonly court_slug: string
}

export interface JudgePoliticianMaybeSameAsParams {
  readonly judge_dni: string
  readonly politician_id: string
  readonly confidence: number
  readonly match_method: string
}

export interface JudgeDdjjMaybeSameAsParams {
  readonly judge_dni: string
  readonly ddjj_id: string
  readonly confidence: number
  readonly match_method: string
}

export interface JudgeCompanyOfficerMaybeSameAsParams {
  readonly judge_dni: string
  readonly officer_id: string
  readonly confidence: number
  readonly match_method: string
}

export interface JudgeBoardMemberMaybeSameAsParams {
  readonly judge_dni: string
  readonly authority_id: string
  readonly confidence: number
  readonly match_method: string
}
