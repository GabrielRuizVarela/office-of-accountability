/**
 * Types for IGJ (Inspeccion General de Justicia) company registry ETL pipeline.
 *
 * Data source: https://datos.jus.gob.ar/dataset/entidades-constituidas-en-la-inspeccion-general-de-justicia-igj
 *
 * The IGJ is Argentina's corporate registry under the Ministry of Justice.
 * It registers all companies (sociedades anonimas, SRLs, etc.) operating
 * in the federal jurisdiction (Ciudad de Buenos Aires), including publicly
 * traded companies regulated by the CNV.
 *
 * CSV files inside the ZIP:
 *   - igj-entidades-*.csv  (companies)
 *   - igj-autoridades-*.csv (directors / board members / partners)
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schemas — match column headers from IGJ CSVs
// ---------------------------------------------------------------------------

export const EntityRowSchema = z.object({
  numero_correlativo: z.string(),
  tipo_societario: z.string().default(''),
  descripcion_tipo_societario: z.string().default(''),
  razon_social: z.string(),
  dada_de_baja: z.string().default(''),
  codigo_baja: z.string().default(''),
  detalle_baja: z.string().default(''),
  cuit: z.string().default(''),
})
export type EntityRow = z.infer<typeof EntityRowSchema>

export const AuthorityRowSchema = z.object({
  numero_correlativo: z.string(),
  apellido_nombre: z.string(),
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

export interface PublicCompanyParams extends IgjProvenanceParams {
  readonly igj_id: string
  readonly name: string
  readonly company_type: string
  readonly company_type_code: string
  readonly cuit: string
  readonly active: boolean
}

export interface BoardMemberParams extends IgjProvenanceParams {
  readonly igj_authority_id: string
  readonly name: string
  readonly role_type: string
  readonly role_description: string
  readonly document_type: string
  readonly document_number: string
  readonly gender: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface BoardMemberOfRelParams {
  readonly authority_id: string
  readonly company_igj_id: string
  readonly role_type: string
  readonly role_description: string
}

export interface MaybeSameAsRelParams {
  readonly politician_id: string
  readonly authority_id: string
  readonly confidence: number
  readonly match_method: string
}
