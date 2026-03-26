/**
 * Types for DDJJ Patrimoniales (sworn asset declarations) ETL pipeline.
 *
 * Data source: https://datos.jus.gob.ar/dataset/declaraciones-juradas-patrimoniales-integrales
 * CSV: consolidated declarations (declaraciones-juradas-YYYY-consolidado-*.csv)
 *
 * Financial values in the CSV use "-" as decimal separator (e.g. "35278884-41" = 35278884.41).
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schema - matches column headers from the consolidated DDJJ CSV
// ---------------------------------------------------------------------------

export const DdjjRowSchema = z.object({
  dj_id: z.string(),
  cuit: z.string().default(''),
  anio: z.string(),
  tipo_declaracion_jurada_id: z.string().default(''),
  tipo_declaracion_jurada_descripcion: z.string().default(''),
  rectificativa: z.string().default('0'),
  funcionario_apellido_nombre: z.string(),
  sector: z.string().default(''),
  organismo: z.string().default(''),
  actividad_principal_ambito: z.string().default(''),
  cargo: z.string().default(''),
  desde: z.string().default(''),
  goza_de_licencia: z.string().default(''),
  fecha_inicio_licencia: z.string().default(''),
  horas_dedicacion: z.string().default(''),
  proveedor_contratista: z.string().default(''),
  total_bienes_inicio: z.string().default(''),
  deudas_inicio: z.string().default(''),
  total_bienes_final: z.string().default(''),
  total_deudas_final: z.string().default(''),
  diferencia_valuacion: z.string().default(''),
  ingresos_neto_gastos: z.string().default(''),
  ingresos_no_alcanzados: z.string().default(''),
  bienes_por_herencia: z.string().default(''),
  importes_deducidos: z.string().default(''),
  gastos_no_deducibles: z.string().default(''),
  gastos_personales: z.string().default(''),
  total_ingresos_c1: z.string().default(''),
  total_gastos_c1: z.string().default(''),
  ingreso_neto_renta_sueldo_c1: z.string().default(''),
  total_ingresos_c2: z.string().default(''),
  total_gastos_c2: z.string().default(''),
  ingreso_neto_renta_capitales_c2: z.string().default(''),
  total_ingresos_c3: z.string().default(''),
  total_gastos_c3: z.string().default(''),
  ingreso_neto_renta_empresa_c3: z.string().default(''),
  total_ingresos_c4: z.string().default(''),
  total_gastos_c4: z.string().default(''),
  ingreso_neto_renta_trabajo_personal_c4: z.string().default(''),
  total_ingreso_neto_c1234: z.string().default(''),
  desgravaciones: z.string().default(''),
  deducciones_generales: z.string().default(''),
  seguro_vida: z.string().default(''),
  gastos_sepelio: z.string().default(''),
  aportes_obras_sociales: z.string().default(''),
  deducciones_servicio_domestico: z.string().default(''),
  cuota_medico_asistencial: z.string().default(''),
  donaciones_fiscos: z.string().default(''),
  fondos_jubilacion: z.string().default(''),
  pagos_trabajadores_autonomos: z.string().default(''),
  honorarios_asistencia_medica: z.string().default(''),
  intereses_creditos_hipotecarios: z.string().default(''),
  aportes_sociedades_garantias_reciprocas: z.string().default(''),
  otros: z.string().default(''),
  ingresos_trabajos_alquileres_rentas: z.string().default(''),
  ingresos_no_alcanzados_por_ig: z.string().default(''),
  bienes_heredados: z.string().default(''),
})
export type DdjjRow = z.infer<typeof DdjjRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface DdjjProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface AssetDeclarationParams extends DdjjProvenanceParams {
  readonly ddjj_id: string
  readonly cuit: string
  readonly year: number
  readonly declaration_type: string
  readonly is_rectification: boolean
  readonly official_name: string
  readonly sector: string
  readonly agency: string
  readonly position: string
  readonly position_since: string
  readonly branch: string
  readonly total_assets_start: number
  readonly total_debts_start: number
  readonly total_assets_end: number
  readonly total_debts_end: number
  readonly net_worth_start: number
  readonly net_worth_end: number
  readonly net_income: number
  readonly income_salary: number
  readonly income_capital: number
  readonly income_business: number
  readonly income_personal_work: number
  readonly total_net_income: number
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface DdjjMaybeSameAsRelParams {
  readonly politician_id: string
  readonly ddjj_id: string
  readonly confidence: number
  readonly match_method: string
}
