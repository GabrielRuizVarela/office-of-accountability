/**
 * Manuel Adorni investigation structured data.
 *
 * Bilingual (ES primary, EN secondary) factcheck items, timeline events,
 * actors, money flows, and impact stats — built through a 13-wave
 * investigation loop with MiroFish/Qwen verification at each stage.
 *
 * Investigation covers: crypto/LIBRA connections, pauta oficial,
 * asset declarations, corporate ties, revolving door, media ecosystem,
 * and cross-reference with existing investigations (finanzas-politicas,
 * obras-publicas, monopolios, libra).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FactcheckStatus =
  | 'confirmed'
  | 'alleged'
  | 'confirmed_cleared'
  | 'unconfirmed'

export type InvestigationCategory =
  | 'political'
  | 'financial'
  | 'legal'
  | 'corporate'
  | 'media'

export interface FactcheckItem {
  id: string
  claim_es: string
  claim_en: string
  status: FactcheckStatus
  tier: number
  source: string
  source_url: string
  detail_es?: string
  detail_en?: string
}

export interface TimelineEvent {
  id: string
  date: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  category: InvestigationCategory
  sources: string[]
}

export interface Actor {
  id: string
  name: string
  role_es: string
  role_en: string
  description_es: string
  description_en: string
  party: string
  datasets: number
  status_es?: string
  status_en?: string
  source_url?: string
}

export interface MoneyFlow {
  id: string
  from_label: string
  to_label: string
  amount_ars: number
  description_es: string
  description_en: string
  date: string
  source: string
  source_url: string
}

export interface ImpactStat {
  value: string
  label_es: string
  label_en: string
  source: string
}

export interface Statement {
  id: string
  date: string
  claim_es: string
  claim_en: string
  context_es: string
  context_en: string
  verified: boolean
  verification_es?: string
  verification_en?: string
  source_url: string
  video_url?: string
}

// ---------------------------------------------------------------------------
// Impact Stats (populated during Wave 13)
// ---------------------------------------------------------------------------

export const IMPACT_STATS: readonly ImpactStat[] = [
  // Will be populated by investigation waves
]

// ---------------------------------------------------------------------------
// Factcheck Items (populated progressively across waves)
// ---------------------------------------------------------------------------

export const FACTCHECK_ITEMS: readonly FactcheckItem[] = [
  // Will be populated by investigation waves
]

// ---------------------------------------------------------------------------
// Timeline Events (populated progressively across waves)
// ---------------------------------------------------------------------------

export const TIMELINE_EVENTS: readonly TimelineEvent[] = [
  // Will be populated by investigation waves
]

// ---------------------------------------------------------------------------
// Actors (populated progressively across waves)
// ---------------------------------------------------------------------------

export const ACTORS: readonly Actor[] = [
  // Will be populated by investigation waves
]

// ---------------------------------------------------------------------------
// Money Flows (populated during Waves 8-12)
// ---------------------------------------------------------------------------

export const MONEY_FLOWS: readonly MoneyFlow[] = [
  // Will be populated by investigation waves
]

// ---------------------------------------------------------------------------
// Public Statements (populated during Waves 3-4)
// ---------------------------------------------------------------------------

export const STATEMENTS: readonly Statement[] = [
  // Will be populated by investigation waves
]
