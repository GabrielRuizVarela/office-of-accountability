/**
 * Types for Argentine corporate registry ETL pipeline.
 *
 * Data source: https://datos.gob.ar — IGJ (Inspeccion General de Justicia)
 * CSV files: igj-entidades.csv, igj-autoridades.csv
 *
 * Note: Named "opencorporates" for the ETL module path, but the actual data
 * comes from Argentina's open data portal (datos.gob.ar) because
 * OpenCorporates requires API authentication with strict rate limits
 * (200 req/month free tier). The IGJ dataset is fully open under CC BY 4.0.
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schemas — match the column headers from IGJ CSVs
// ---------------------------------------------------------------------------

/**
 * Entity (company) row from igj-entidades.csv
 *
 * Fields:
 * - numero_correlativo: unique entity identifier
 * - tipo_societario: numeric code for company type
 * - descripcion_tipo_societario: human-readable company type
 * - razon_social: company name (razon social)
 * - dada_de_baja: whether the entity is deregistered
 * - codigo_baja: deregistration code
 * - detalle_baja: deregistration detail
 * - cuit: tax ID (CUIT)
 */
export const EntityRowSchema = z.object({
  numero_correlativo: z.string(),
  tipo_societario: z.string().default(''),
  descripcion_tipo_societario: z.string().default(''),
  razon_social: z.string().default(''),
  dada_de_baja: z.string().default(''),
  codigo_baja: z.string().default(''),
  detalle_baja: z.string().default(''),
  cuit: z.string().default(''),
})
export type EntityRow = z.infer<typeof EntityRowSchema>

/**
 * Authority (officer/director/shareholder) row from igj-autoridades.csv
 *
 * Fields:
 * - numero_correlativo: foreign key to entity
 * - apellido_nombre: person name (surname, given names)
 * - tipo_administrador: role code (A=Authority, S=Partner/Socio, R=Representative)
 * - descripcion_tipo_administrador: human-readable role
 * - tipo_documento: document type code (1=DNI, 5=Passport, etc.)
 * - descripcion_tipo_documento: human-readable document type
 * - numero_documento: document number
 * - genero_autoridad: gender (often empty)
 */
export const AuthorityRowSchema = z.object({
  numero_correlativo: z.string(),
  apellido_nombre: z.string().default(''),
  tipo_administrador: z.string().default(''),
  descripcion_tipo_administrador: z.string().default(''),
  tipo_documento: z.string().default(''),
  descripcion_tipo_documento: z.string().default(''),
  numero_documento: z.string().default(''),
  genero_autoridad: z.string().default(''),
})
export type AuthorityRow = z.infer<typeof AuthorityRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface IgjProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface CompanyParams extends IgjProvenanceParams {
  readonly igj_id: string
  readonly name: string
  readonly company_type_code: string
  readonly company_type: string
  readonly cuit: string
  readonly status: string
  readonly deregistration_code: string
  readonly deregistration_detail: string
}

export interface CompanyOfficerParams extends IgjProvenanceParams {
  /** Composite key: igj_id + document number + role code */
  readonly officer_id: string
  readonly name: string
  readonly role_code: string
  readonly role: string
  readonly document_type_code: string
  readonly document_type: string
  readonly document_number: string
  readonly gender: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface OfficerOfCompanyRelParams {
  readonly officer_id: string
  readonly company_igj_id: string
  readonly role: string
  readonly role_code: string
}

export interface MaybeSameAsRelParams {
  readonly politician_id: string
  readonly officer_id: string
  readonly confidence: number
  readonly match_method: string
}
