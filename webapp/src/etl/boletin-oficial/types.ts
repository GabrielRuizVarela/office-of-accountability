/**
 * Types for Boletin Oficial ETL pipeline.
 *
 * Data sources:
 * - Estructura Organica y Autoridades del PEN (appointments/authorities)
 *   https://datos.gob.ar/dataset/jgm-estructura-organica-autoridades-poder-ejecutivo-nacional
 * - Sistema de Contrataciones Electronicas (procurement)
 *   https://datos.gob.ar/dataset/jgm-sistema-contrataciones-electronicas
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schemas — Estructura Organica (appointments / authorities)
// Pipe-delimited CSV with columns:
//   jurisdiccion, subjurisdiccion, unidad_de_nivel_politico, unidad,
//   reporta_a, nombre_corto, tipo_administracion, unidad_rango,
//   unidad_clase, norma_competencias_objetivos, car_orden, cargo,
//   car_nivel, car_rango_jerarquia, car_categoria, car_extraescalafonario,
//   car_escalafon, car_suplemento, autoridad_tratamiento,
//   autoridad_nombre, autoridad_apellido, autoridad_dni, autoridad_cuil,
//   autoridad_sexo, autoridad_norma_designacion, web
// ---------------------------------------------------------------------------

export const AuthorityRowSchema = z.object({
  jurisdiccion: z.string().default(''),
  subjurisdiccion: z.string().default(''),
  unidad_de_nivel_politico: z.string().default(''),
  unidad: z.string().default(''),
  reporta_a: z.string().default(''),
  nombre_corto: z.string().default(''),
  tipo_administracion: z.string().default(''),
  unidad_rango: z.string().default(''),
  unidad_clase: z.string().default(''),
  norma_competencias_objetivos: z.string().default(''),
  car_orden: z.string().default(''),
  cargo: z.string().default(''),
  car_nivel: z.string().default(''),
  car_rango_jerarquia: z.string().default(''),
  car_categoria: z.string().default(''),
  car_extraescalafonario: z.string().default(''),
  car_escalafon: z.string().default(''),
  car_suplemento: z.string().default(''),
  autoridad_tratamiento: z.string().default(''),
  autoridad_nombre: z.string().default(''),
  autoridad_apellido: z.string().default(''),
  autoridad_dni: z.string().default(''),
  autoridad_cuil: z.string().default(''),
  autoridad_sexo: z.string().default(''),
  autoridad_norma_designacion: z.string().default(''),
  web: z.string().default(''),
})
export type AuthorityRow = z.infer<typeof AuthorityRowSchema>

// ---------------------------------------------------------------------------
// CSV row schemas — Contrataciones Adjudicaciones (procurement awards)
// Comma-delimited CSV with columns:
//   Número Procedimiento, Nro SAF, Descripcion SAF, Nro UOC,
//   Descripcion UOC, Unidad Ejecutora, Tipo de Procedimiento,
//   Modalidad, Apartado Directa, Ejercicio, Fecha de Adjudicación,
//   Rubros, CUIT, Descripción Proveedor, Documento Contractual,
//   Tipo, Monto, Moneda, Tipo de Operación,
//   Fecha de perfeccionamiento OC
// ---------------------------------------------------------------------------

export const AwardRowSchema = z.object({
  'Número Procedimiento': z.string().default(''),
  'Nro SAF': z.string().default(''),
  'Descripcion SAF': z.string().default(''),
  'Nro UOC': z.string().default(''),
  'Descripcion UOC': z.string().default(''),
  'Unidad Ejecutora': z.string().default(''),
  'Tipo de Procedimiento': z.string().default(''),
  'Modalidad': z.string().default(''),
  'Apartado Directa': z.string().default(''),
  'Ejercicio': z.string().default(''),
  'Fecha de Adjudicación': z.string().default(''),
  'Rubros': z.string().default(''),
  'CUIT': z.string().default(''),
  'Descripción Proveedor': z.string().default(''),
  'Documento Contractual': z.string().default(''),
  'Tipo': z.string().default(''),
  'Monto': z.string().default(''),
  'Moneda': z.string().default(''),
  'Tipo de Operación': z.string().default(''),
  'Fecha de perfeccionamiento OC': z.string().default(''),
})
export type AwardRow = z.infer<typeof AwardRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface BoletinProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

/** A government appointment from Estructura Organica data */
export interface GovernmentAppointmentParams extends BoletinProvenanceParams {
  readonly appointment_id: string
  readonly person_name: string
  readonly person_apellido: string
  readonly full_name: string
  readonly cargo: string
  readonly jurisdiccion: string
  readonly subjurisdiccion: string
  readonly unidad: string
  readonly tipo_administracion: string
  readonly norma_designacion: string
  readonly sexo: string
  readonly dni: string
  readonly cuil: string
}

/** A public procurement contract from Contrataciones data */
export interface PublicContractParams extends BoletinProvenanceParams {
  readonly contract_id: string
  readonly numero_procedimiento: string
  readonly tipo_procedimiento: string
  readonly modalidad: string
  readonly ejercicio: string
  readonly fecha_adjudicacion: string
  readonly organismo: string
  readonly unidad_ejecutora: string
  readonly rubros: string
  readonly monto: number
  readonly moneda: string
  readonly documento_contractual: string
}

/** A contractor (supplier) from Contrataciones data */
export interface ContractorParams extends BoletinProvenanceParams {
  readonly contractor_id: string
  readonly cuit: string
  readonly name: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface AwardedToRelParams {
  readonly contract_id: string
  readonly contractor_id: string
  readonly monto: number
  readonly moneda: string
}

export interface MaybeSameAsAppointmentRelParams {
  readonly politician_id: string
  readonly appointment_id: string
  readonly confidence: number
  readonly match_method: string
}
