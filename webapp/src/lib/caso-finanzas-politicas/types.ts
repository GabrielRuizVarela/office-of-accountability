/**
 * Caso Finanzas Politicas investigation — TypeScript interfaces.
 *
 * Bilingual domain types for the Argentine political finance investigation.
 * Covers persons, organizations, events, money flows, and factcheck claims.
 */

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

export interface FinanzasPerson {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly role_es: string
  readonly role_en: string
  readonly description_es: string
  readonly description_en: string
  readonly party: string
  readonly datasets: number
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export interface FinanzasOrganization {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly type: string
  readonly jurisdiction: string
  readonly incorporation_date: string
}

// ---------------------------------------------------------------------------
// Event
// ---------------------------------------------------------------------------

export interface FinanzasEvent {
  readonly id: string
  readonly date: string
  readonly title_es: string
  readonly title_en: string
  readonly description_es: string
  readonly description_en: string
  readonly category: string
  readonly sources: ReadonlyArray<{ readonly name: string; readonly url: string }>
}

// ---------------------------------------------------------------------------
// Money flow
// ---------------------------------------------------------------------------

export interface FinanzasMoneyFlow {
  readonly id: string
  readonly from_label: string
  readonly to_label: string
  readonly amount_ars: string
  readonly description_es: string
  readonly description_en: string
  readonly date: string
  readonly source: string
  readonly source_url: string
}

// ---------------------------------------------------------------------------
// Claim (factcheck)
// ---------------------------------------------------------------------------

export interface FinanzasClaim {
  readonly id: string
  readonly claim_es: string
  readonly claim_en: string
  readonly status: string
  readonly tier: number
  readonly source: string
  readonly source_url: string
  readonly detail_es: string
  readonly detail_en: string
}
