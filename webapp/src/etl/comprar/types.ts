/**
 * Types for Compr.ar ETL pipeline.
 *
 * Data source:
 * - Sistema de Contrataciones Electronicas — Ordenes de Compra
 *   https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schema — Ordenes de Compra (comma-delimited)
// Columns:
//   Número Procedimiento, Estado, Ejercicio, Tipo de Procedimiento,
//   Modalidad, Descripcion SAF, Unidad Ejecutora, Rubros,
//   CUIT, Descripción Proveedor, Monto, Moneda,
//   Tipo de Operación, Fecha de perfeccionamiento OC
// ---------------------------------------------------------------------------

export const ComprarOcRowSchema = z.object({
  'Número Procedimiento': z.string().default(''),
  'Estado': z.string().default(''),
  'Ejercicio': z.string().default(''),
  'Tipo de Procedimiento': z.string().default(''),
  'Modalidad': z.string().default(''),
  'Descripcion SAF': z.string().default(''),
  'Unidad Ejecutora': z.string().default(''),
  'Rubros': z.string().default(''),
  'CUIT': z.string().default(''),
  'Descripción Proveedor': z.string().default(''),
  'Monto': z.string().default(''),
  'Moneda': z.string().default(''),
  'Tipo de Operación': z.string().default(''),
  'Fecha de perfeccionamiento OC': z.string().default(''),
})
export type ComprarOcRow = z.infer<typeof ComprarOcRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

/**
 * Re-export shared types from boletin-oficial.
 * PublicContractParams and ContractorParams are identical for both pipelines.
 */
export type { PublicContractParams, ContractorParams, AwardedToRelParams } from '../boletin-oficial/types'

export interface ComprarProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}
