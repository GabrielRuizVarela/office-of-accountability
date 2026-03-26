/**
 * Types for CNE Campaign Finance ETL pipeline.
 *
 * Data source: https://aportantes.electoral.gob.ar/aportes/descargar-csv/
 * CSV columns: Fecha, Cod_destino, Destino, Persona Humana/Jurídica,
 *              Aportante, Cuil/Cuit, Distrito, Agrupacion, Modalidad,
 *              Recurrente, Monto, Banco Origen, Rectificado, Anulado, Observación
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// CSV row schema - matches column headers from CNE aportes CSV
// ---------------------------------------------------------------------------

export const DonationRowSchema = z.object({
  Fecha: z.string().default(''),
  Cod_destino: z.string().default(''),
  Destino: z.string().default(''),
  'Persona Humana/Jurídica': z.string().default(''),
  Aportante: z.string().default(''),
  'Cuil/Cuit': z.string().default(''),
  Distrito: z.string().default(''),
  Agrupacion: z.string().default(''),
  Modalidad: z.string().default(''),
  Recurrente: z.string().default(''),
  Monto: z.string().default(''),
  'Banco Origen': z.string().default(''),
  Rectificado: z.string().default(''),
  Anulado: z.string().default(''),
  Observación: z.string().default(''),
})
export type DonationRow = z.infer<typeof DonationRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface CneProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface CampaignDonationParams extends CneProvenanceParams {
  readonly donation_id: string
  readonly date: string
  readonly date_iso: string
  readonly destination_code: string
  readonly destination: string
  readonly donor_type: string
  readonly donor_name: string
  readonly donor_cuit: string
  readonly district: string
  readonly party_name: string
  readonly modality: string
  readonly recurring: boolean
  readonly amount: number
  readonly source_bank: string
  readonly rectified: boolean
  readonly annulled: boolean
  readonly observation: string
}

export interface DonorParams extends CneProvenanceParams {
  readonly donor_id: string
  readonly name: string
  readonly cuit: string
  readonly donor_type: string
}

export interface PoliticalPartyFinanceParams extends CneProvenanceParams {
  readonly party_finance_id: string
  readonly name: string
  readonly district: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface DonatedToRelParams {
  readonly donor_id: string
  readonly party_finance_id: string
  readonly donation_id: string
  readonly amount: number
  readonly date_iso: string
}

export interface ReceivedDonationRelParams {
  readonly party_finance_id: string
  readonly donation_id: string
}

export interface DonorMaybeSameAsRelParams {
  readonly politician_id: string
  readonly donor_id: string
  readonly confidence: number
  readonly match_method: string
}

export interface PartyFinanceMaybeSameRelParams {
  readonly party_id: string
  readonly party_finance_id: string
  readonly confidence: number
}
