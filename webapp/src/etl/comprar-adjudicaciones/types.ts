/**
 * Types for Compr.ar Adjudicaciones ETL pipeline.
 *
 * Data source:
 * - Sistema de Contrataciones Electronicas -- Adjudicaciones (2015-2020)
 *   https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 *
 * Three CSV schemas exist across years:
 *   - 2020: Spanish headers with spaces (same as ordenes de compra)
 *   - 2017-2019: snake_case headers, 19-20 columns
 *   - 2015: legacy schema with 12 columns (procedimiento_id, prov_razon_social, etc.)
 */

// ---------------------------------------------------------------------------
// Normalized row — all CSV schemas map to this
// ---------------------------------------------------------------------------

export interface AdjudicacionRow {
  readonly numero_procedimiento: string
  readonly ejercicio: string
  readonly tipo_procedimiento: string
  readonly modalidad: string
  readonly organismo: string
  readonly unidad_ejecutora: string
  readonly rubros: string
  readonly cuit: string
  readonly proveedor: string
  readonly documento_contractual: string
  readonly monto: string
  readonly moneda: string
  readonly fecha_adjudicacion: string
}

// ---------------------------------------------------------------------------
// Re-export shared Neo4j param types
// ---------------------------------------------------------------------------

export type {
  PublicContractParams,
  ContractorParams,
  AwardedToRelParams,
} from '../boletin-oficial/types'

export interface AdjudicacionesProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}
