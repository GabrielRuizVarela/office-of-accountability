/**
 * Shared types for investigation page components.
 *
 * These types describe the shape of investigation-specific editorial content
 * (factchecks, timeline events, actors, money flows, evidence, government
 * responses).  Each caso-* data module defines its own constants using these
 * interfaces so that the generic investigation page can render any case.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'denied'
  | 'under_investigation'

export interface FactcheckItem {
  readonly id: string
  readonly claim_es: string
  readonly claim_en: string
  readonly status: FactcheckStatus
  readonly source: string
  readonly source_url: string
  readonly detail_es?: string
  readonly detail_en?: string
}

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'media'
  | 'coverup'

export interface InvestigationTimelineEvent {
  readonly id: string
  readonly date: string
  readonly title_es: string
  readonly title_en: string
  readonly description_es: string
  readonly description_en: string
  readonly category: InvestigationCategory
  readonly sources: readonly { readonly name: string; readonly url: string }[]
  readonly is_new?: boolean
}

export interface Actor {
  readonly id: string
  readonly name: string
  readonly role_es: string
  readonly role_en: string
  readonly description_es: string
  readonly description_en: string
  readonly nationality: string
  readonly is_new?: boolean
  readonly status_es?: string
  readonly status_en?: string
}

export interface MoneyFlow {
  readonly id: string
  readonly from_label: string
  readonly to_label: string
  readonly amount_usd: number
  readonly date: string
  readonly source: string
}

export type VerificationStatus = 'verified' | 'partially_verified' | 'unverified'

export interface EvidenceDoc {
  readonly id: string
  readonly title: string
  readonly type_es: string
  readonly type_en: string
  readonly date: string
  readonly summary_es: string
  readonly summary_en: string
  readonly source_url: string
  readonly verification_status: VerificationStatus
}

export interface ImpactStat {
  readonly value: string
  readonly label_es: string
  readonly label_en: string
  readonly source: string
}

export interface GovernmentResponse {
  readonly id: string
  readonly date: string
  readonly action_es: string
  readonly action_en: string
  readonly effect_es: string
  readonly effect_en: string
  readonly source: string
  readonly source_url: string
}
