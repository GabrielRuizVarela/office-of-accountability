/**
 * Types for the cross-reference engine.
 *
 * Links entities across ETL data sources (Boletin Oficial, OpenCorporates,
 * Como Voto, ICIJ, CNE) using CUIT/DNI/name matching.
 */

export interface CrossRefMatch {
  source_id: string
  target_id: string
  source_label: string
  target_label: string
  match_key: string          // the CUIT, DNI, or normalized name that matched
  match_type: 'cuit' | 'dni' | 'cuil' | 'normalized_name' | 'fuzzy_name'
  confidence: number         // 0.6 - 1.0
  evidence: string           // human-readable explanation
}

export interface CrossRefResult {
  cuitMatches: readonly CrossRefMatch[]
  dniMatches: readonly CrossRefMatch[]
  nameMatches: readonly CrossRefMatch[]
  flags: readonly InvestigationFlag[]
  durationMs: number
}

export type FlagType =
  | 'contractor_donor'
  | 'contractor_offshore'
  | 'officer_appointment'
  | 'repeat_winner'
  | 'shell_company'
  // obras-publicas flags
  | 'debarred_active'
  | 'budget_overrun'
  | 'budget_underrun'
  | 'odebrecht_linked'
  | 'cuadernos_linked'
  | 'cross_investigation'
  | 'multilateral_national'
  | 'geographic_concentration'

export interface InvestigationFlag {
  entity_id: string
  entity_name: string
  flag_type: FlagType
  evidence: string
  confidence: number
}
