/**
 * Types for World Bank multilateral contracts ETL — Obras Publicas investigation.
 *
 * Data source:
 * - World Bank Major Contract Awards (Socrata API)
 *   https://finances.worldbank.org/resource/kdui-wcs3.json
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// World Bank Socrata API row schema
// ---------------------------------------------------------------------------

export const WBContractRowSchema = z.object({
  as_of_date: z.string().optional().default(''),
  borrower_country: z.string().optional().default(''),
  borrower_country_code: z.string().optional().default(''),
  project_id: z.string().optional().default(''),
  project_name: z.string().optional().default(''),
  procurement_type: z.string().optional().default(''),
  procurement_category: z.string().optional().default(''),
  procurement_method: z.string().optional().default(''),
  product_line: z.string().optional().default(''),
  major_sector: z.string().optional().default(''),
  wb_contract_number: z.string().optional().default(''),
  contract_description: z.string().optional().default(''),
  contract_signing_date: z.string().optional().default(''),
  supplier_id: z.string().optional().default(''),
  supplier: z.string().optional().default(''),
  supplier_country: z.string().optional().default(''),
  supplier_country_code: z.string().optional().default(''),
  total_contract_amount_usd: z.string().optional().default('0'),
  borrower: z.string().optional().default(''),
  procurement_group: z.string().optional().default(''),
  region: z.string().optional().default(''),
})
export type WBContractRow = z.infer<typeof WBContractRowSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types
// ---------------------------------------------------------------------------

export interface MultilateralProjectParams {
  readonly project_id: string
  readonly caso_slug: 'obras-publicas'
  readonly funder: 'world_bank'
  readonly name: string
  readonly sector: string
  readonly amount_usd: number
  readonly status: string
  readonly approval_date: string
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface MultilateralContractorParams {
  readonly contractor_id: string
  readonly caso_slug: 'obras-publicas'
  readonly cuit: string
  readonly name: string
  readonly supplier_country: string
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

export interface MultilateralContractParams {
  readonly contract_id: string
  readonly caso_slug: 'obras-publicas'
  readonly project_id: string
  readonly supplier_name: string
  readonly amount_usd: number
  readonly contract_type: string
  readonly contract_description: string
  readonly signing_date: string
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'silver'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

// ---------------------------------------------------------------------------
// Relationship parameter types
// ---------------------------------------------------------------------------

export interface FundedByRelParams {
  readonly contract_id: string
  readonly project_id: string
}

export interface AwardedToRelParams {
  readonly contract_id: string
  readonly contractor_id: string
  readonly amount_usd: number
}
