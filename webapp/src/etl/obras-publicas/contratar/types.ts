/**
 * Types for CONTRAT.AR ETL pipeline — Obras Publicas investigation.
 *
 * Data source:
 * - CONTRAT.AR — Sistema de Contrataciones de Obra Publica
 *   https://datos.gob.ar/dataset/jgm-contrataciones-obra-publica
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schemas — Procedimientos (distribution 30.1)
// ---------------------------------------------------------------------------

export const ProcedimientoRowSchema = z.object({
  procedimiento_numero: z.string().default(''),
  procedimiento_nombre: z.string().default(''),
  uoc_codigo: z.string().default(''),
  uoc_descripcion: z.string().default(''),
  organismo_codigo_saf: z.string().default(''),
  organismo_nombre: z.string().default(''),
  expediente_procedimiento_numero: z.string().default(''),
  procedimiento_estado: z.string().default(''),
  procedimiento_objeto: z.string().default(''),
  procedimiento_tipo: z.string().default(''),
  solicitud_de_contratacion_numero: z.string().default(''),
  financiamiento_fuente_prev: z.string().default(''),
  sistema_contratacion: z.string().default(''),
  presupuesto_oficial_monto: z.string().default(''),
  pliego_condiciones_generales_numero_gedo: z.string().default(''),
  pliego_condiciones_particulares_numero_gedo: z.string().default(''),
  publicacion_contratar_fecha: z.string().default(''),
  publicacion_bora_fecha: z.string().default(''),
  publicacion_cantidad_dias: z.string().default(''),
  consultas_inicio_fecha: z.string().default(''),
  consultas_fin_fecha: z.string().default(''),
})
export type ProcedimientoRow = z.infer<typeof ProcedimientoRowSchema>

// ---------------------------------------------------------------------------
// CSV row schemas — Ofertas (distribution 30.3)
// ---------------------------------------------------------------------------

export const OfertaRowSchema = z.object({
  procedimiento_numero: z.string().default(''),
  procedimiento_nombre: z.string().default(''),
  numero_obra: z.string().default(''),
  uoc_codigo: z.string().default(''),
  uoc_descripcion: z.string().default(''),
  organismo_codigo_saf: z.string().default(''),
  organismo_nombre: z.string().default(''),
  expediente_procedimiento_numero: z.string().default(''),
  renglon_numero: z.string().default(''),
  renglon_descripcion: z.string().default(''),
  oferente_cuit: z.string().default(''),
  oferente_razon_social: z.string().default(''),
  oferente_ute_si_no: z.string().default(''),
  alternativa_numero: z.string().default(''),
  oferta_monto: z.string().default(''),
  presupuesto_oficial_renglon_monto: z.string().default(''),
  evaluada_si_no: z.string().default(''),
  desestimada_si_no: z.string().default(''),
  orden_merito: z.string().default(''),
})
export type OfertaRow = z.infer<typeof OfertaRowSchema>

// ---------------------------------------------------------------------------
// CSV row schemas — Contratos (distribution 30.4)
// ---------------------------------------------------------------------------

export const ContratoRowSchema = z.object({
  contrato_numero: z.string().default(''),
  contrato_numero_gedo: z.string().default(''),
  procedimiento_numero: z.string().default(''),
  procedimiento_nombre: z.string().default(''),
  uoc_codigo: z.string().default(''),
  uoc_descripcion: z.string().default(''),
  organismo_codigo_saf: z.string().default(''),
  organismo_nombre: z.string().default(''),
  expediente_procedimiento_numero: z.string().default(''),
  numero_obra: z.string().default(''),
  nombre_obra: z.string().default(''),
  contrato_perfeccionamiento_fecha: z.string().default(''),
  contratista_cuit: z.string().default(''),
  contratista_razon_social: z.string().default(''),
  contratista_ute_si_no: z.string().default(''),
  contrato_monto: z.string().default(''),
  contrato_moneda: z.string().default(''),
  funcionario_contratante_nombre: z.string().default(''),
  funcionario_contratante_cargo: z.string().default(''),
})
export type ContratoRow = z.infer<typeof ContratoRowSchema>

// ---------------------------------------------------------------------------
// CSV row schemas — Obras (distribution 30.5)
// ---------------------------------------------------------------------------

export const ObraRowSchema = z.object({
  procedimiento_numero: z.string().default(''),
  uoc_codigo: z.string().default(''),
  uoc_descripcion: z.string().default(''),
  organismo_codigo_saf: z.string().default(''),
  organismo_nombre: z.string().default(''),
  expediente_procedimiento_numero: z.string().default(''),
  numero_obra: z.string().default(''),
  nombre_obra: z.string().default(''),
  ues_nombre: z.string().default(''),
  plazo_ejecucion_obra: z.string().default(''),
  plazo_ejecucion_obra_tipo: z.string().default(''),
  latitud_1: z.string().default(''),
  longitud_1: z.string().default(''),
  latitud_2: z.string().default(''),
  longitud_2: z.string().default(''),
})
export type ObraRow = z.infer<typeof ObraRowSchema>

// ---------------------------------------------------------------------------
// CSV row schemas — Ubicacion Geografica (distribution 30.6)
// ---------------------------------------------------------------------------

export const UbicacionRowSchema = z.object({
  numero_obra: z.string().default(''),
  nombre_obra: z.string().default(''),
  uoc_codigo: z.string().default(''),
  uoc_descripcion: z.string().default(''),
  organismo_codigo_saf: z.string().default(''),
  organismo_nombre: z.string().default(''),
  expediente_procedimiento_numero: z.string().default(''),
  renglon_numero: z.string().default(''),
  renglon_descripcion: z.string().default(''),
  provincia_id: z.string().default(''),
  provincia_nombre: z.string().default(''),
  departamento_id: z.string().default(''),
  departamento_nombre: z.string().default(''),
  localidad_id: z.string().default(''),
  localidad_nombre: z.string().default(''),
})
export type UbicacionRow = z.infer<typeof UbicacionRowSchema>

// ---------------------------------------------------------------------------
// Neo4j provenance base
// ---------------------------------------------------------------------------

export interface ObrasProvenanceParams {
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

/** A procurement procedure from CONTRAT.AR */
export interface ObrasProcedureParams extends ObrasProvenanceParams {
  readonly procedure_id: string
  readonly caso_slug: 'obras-publicas'
  readonly numero_procedimiento: string
  readonly nombre: string
  readonly tipo_procedimiento: string
  readonly modalidad: string
  readonly organismo: string
  readonly estado: string
  readonly fecha_publicacion: string
  readonly monto_estimado: number
}

/** A public work from obras.csv */
export interface ObrasPublicWorkParams extends ObrasProvenanceParams {
  readonly work_id: string
  readonly caso_slug: 'obras-publicas'
  readonly name: string
  readonly description: string
  readonly sector: string
  readonly province: string
  readonly municipality: string
  readonly latitude: number
  readonly longitude: number
  readonly status: string
  readonly plazo_ejecucion: string
}

/** A bid from ofertas.csv */
export interface ObrasBidParams extends ObrasProvenanceParams {
  readonly bid_id: string
  readonly caso_slug: 'obras-publicas'
  readonly procedure_number: string
  readonly bidder_name: string
  readonly bidder_cuit: string
  readonly amount: number
  readonly currency: string
  readonly date: string
  readonly status: string
  readonly orden_merito: number
}

/** A contractor from contratos.csv / ofertas.csv */
export interface ObrasContractorParams extends ObrasProvenanceParams {
  readonly contractor_id: string
  readonly caso_slug: 'obras-publicas'
  readonly cuit: string
  readonly name: string
  readonly is_ute: boolean
}

/** A public contract from contratos.csv */
export interface ObrasPublicContractParams extends ObrasProvenanceParams {
  readonly contract_id: string
  readonly caso_slug: 'obras-publicas'
  readonly contrato_numero: string
  readonly procedimiento_numero: string
  readonly nombre_obra: string
  readonly fecha_perfeccionamiento: string
  readonly monto: number
  readonly moneda: string
  readonly funcionario_nombre: string
  readonly funcionario_cargo: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface ProcedureForRelParams {
  readonly procedure_id: string
  readonly work_id: string
}

export interface BidOnRelParams {
  readonly bid_id: string
  readonly procedure_id: string
}

export interface BidderRelParams {
  readonly bid_id: string
  readonly contractor_id: string
}

export interface ContractedForRelParams {
  readonly contract_id: string
  readonly work_id: string
}

export interface ObrasAwardedToRelParams {
  readonly contract_id: string
  readonly contractor_id: string
  readonly monto: number
  readonly moneda: string
}

export interface LocatedInProvinceRelParams {
  readonly work_id: string
  readonly province_name: string
}
