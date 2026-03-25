/**
 * Types for MapaInversiones ETL pipeline — Obras Publicas investigation.
 *
 * Data source:
 * - MapaInversiones — Mapa de Inversiones en Obra Publica
 *   https://mapainversiones.obraspublicas.gob.ar/opendata/dataset_mop.csv
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schema — dataset_mop.csv (40 columns)
// ---------------------------------------------------------------------------

export const MapaRowSchema = z.object({
  idproyecto: z.string().default(''),
  numeroobra: z.string().default(''),
  codigobapin: z.string().default(''),
  fechainicioanio: z.string().default(''),
  fechafinanio: z.string().default(''),
  nombreobra: z.string().default(''),
  descripicionfisica: z.string().default(''),
  montototal: z.string().default(''),
  sectornombre: z.string().default(''),
  avancefinanciero: z.string().default(''),
  avancefisico: z.string().default(''),
  entidadejecutoranombre: z.string().default(''),
  duracionobrasdias: z.string().default(''),
  objetivogeneral: z.string().default(''),
  tipoproyecto: z.string().default(''),
  nombredepto: z.string().default(''),
  nombreprovincia: z.string().default(''),
  codigo_bahra: z.string().default(''),
  etapaobra: z.string().default(''),
  tipomoneda: z.string().default(''),
  url_perfil_obra: z.string().default(''),
  programa_infraestructura: z.string().default(''),
  organismo_financiador_1: z.string().default(''),
  organismo_financiador_2: z.string().default(''),
  organismo_financiador_prestamo: z.string().default(''),
  contraparte_key: z.string().default(''),
  contraparte_val: z.string().default(''),
  contraparte_cuit: z.string().default(''),
  contraparte_modalidad: z.string().default(''),
  tag_accionclimatica: z.string().default(''),
  tag_ods_incidencia: z.string().default(''),
})
export type MapaRow = z.infer<typeof MapaRowSchema>

// ---------------------------------------------------------------------------
// Neo4j provenance base
// ---------------------------------------------------------------------------

export interface MapaProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

/** A public work from dataset_mop.csv */
export interface MapaPublicWorkParams extends MapaProvenanceParams {
  readonly work_id: string
  readonly caso_slug: 'obras-publicas'
  readonly name: string
  readonly description: string
  readonly sector: string
  readonly province: string
  readonly municipality: string
  readonly latitude: string
  readonly longitude: string
  readonly status: string
  readonly start_date: string
  readonly end_date: string
  readonly monto_total: number
  readonly avance_financiero: number
  readonly avance_fisico: number
  readonly tipo_proyecto: string
  readonly entidad_ejecutora: string
  readonly programa_infraestructura: string
}

/** A contractor from contraparte_val + contraparte_cuit */
export interface MapaContractorParams extends MapaProvenanceParams {
  readonly contractor_id: string
  readonly caso_slug: 'obras-publicas'
  readonly cuit: string
  readonly name: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface ContractedForMapaRelParams {
  readonly work_id: string
  readonly contractor_id: string
}

export interface LocatedInProvinceMapaRelParams {
  readonly work_id: string
  readonly province_name: string
}
