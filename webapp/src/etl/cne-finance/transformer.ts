/**
 * Transforms CNE campaign finance CSV data into Neo4j node/relationship parameters.
 *
 * Pure functions - no side effects, no mutations.
 * Matches donors to existing Politician nodes via normalizeName.
 */

import { createHash } from 'node:crypto'
import { normalizeName } from '../como-voto/transformer'

import type {
  DonationRow,
  CneProvenanceParams,
  CampaignDonationParams,
  DonorParams,
  PoliticalPartyFinanceParams,
  DonatedToRelParams,
  ReceivedDonationRelParams,
  DonorMaybeSameAsRelParams,
  PartyFinanceMaybeSameRelParams,
} from './types'
import type { PoliticianParams } from '../como-voto/types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CNE_SOURCE = 'https://aportantes.electoral.gob.ar'
const SUBMITTED_BY = 'etl:cne-finance'
const CONFIDENCE_SCORE = 0.9
const TIER = 'silver' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

function buildProvenance(sourceKey: string): CneProvenanceParams {
  const now = new Date().toISOString()
  return {
    source_url: CNE_SOURCE,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

/** Slugify for IDs */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SPANISH_MONTHS: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
}

/**
 * Parse CNE date strings to ISO 8601 (YYYY-MM-DD).
 *
 * Handles two formats observed in the source data:
 *   - Numeric:      "DD/MM/YYYY" or "DD-MM-YYYY"
 *   - Spanish long: "12 de Julio de 2019"
 */
function parseCneDate(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) return ''

  // Numeric format: DD/MM/YYYY or DD-MM-YYYY
  const numericMatch = dateStr.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/)
  if (numericMatch) {
    const [, day, month, year] = numericMatch
    return `${year}-${month}-${day}`
  }

  // Spanish long form: "12 de Julio de 2019" or "12 de julio de 2019"
  const spanishMatch = dateStr
    .trim()
    .match(/^(\d{1,2})\s+de\s+([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+)\s+de\s+(\d{4})$/i)
  if (spanishMatch) {
    const [, day, monthName, year] = spanishMatch
    const month = SPANISH_MONTHS[monthName.toLowerCase()]
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`
    }
  }

  return ''
}

/**
 * Parse amount string from CNE CSV.
 *
 * Handles two formats observed in the source data:
 *   - Plain decimal:            "15000.00"   → 15000.00
 *   - European thousands + comma: "1.500.000,50" → 1500000.50
 *
 * Distinguishes them by whether a comma is present (European format)
 * or not (plain decimal). In plain decimal, the dot is the decimal
 * separator and must be preserved.
 */
function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0
  const trimmed = amountStr.trim()

  let cleaned: string
  if (trimmed.includes(',')) {
    // European format: dots are thousands separators, comma is decimal
    cleaned = trimmed.replace(/\./g, '').replace(',', '.')
  } else {
    // Plain decimal: dot is the decimal separator - preserve it
    cleaned = trimmed
  }

  const value = parseFloat(cleaned)
  return isNaN(value) ? 0 : value
}

function parseBoolField(value: string): boolean {
  const lower = value.toLowerCase().trim()
  return lower === 'si' || lower === 'sí' || lower === 'true' || lower === '1'
}

// ---------------------------------------------------------------------------
// Node transformers
// ---------------------------------------------------------------------------

function transformDonation(row: DonationRow, index: number): CampaignDonationParams {
  const donorName = row.Aportante?.trim() || ''
  const cuit = row['Cuil/Cuit']?.trim() || ''
  const date = row.Fecha?.trim() || ''
  const donationId = `cne-${computeHash(`${date}:${cuit}:${donorName}:${row.Agrupacion}:${row.Monto}:${index}`)}`

  return {
    ...buildProvenance(`donation:${donationId}`),
    donation_id: donationId,
    date,
    date_iso: parseCneDate(date),
    destination_code: row.Cod_destino?.trim() || '',
    destination: row.Destino?.trim() || '',
    donor_type: row['Persona Humana/Jurídica']?.trim() || '',
    donor_name: donorName,
    donor_cuit: cuit,
    district: row.Distrito?.trim() || '',
    party_name: row.Agrupacion?.trim() || '',
    modality: row.Modalidad?.trim() || '',
    recurring: parseBoolField(row.Recurrente || ''),
    amount: parseAmount(row.Monto || ''),
    source_bank: row['Banco Origen']?.trim() || '',
    rectified: parseBoolField(row.Rectificado || ''),
    annulled: parseBoolField(row.Anulado || ''),
    observation: row['Observación']?.trim() || '',
  }
}

function buildDonorId(name: string, cuit: string): string {
  if (cuit && cuit.trim() !== '') {
    return `cne-donor-${slugify(cuit)}`
  }
  return `cne-donor-${slugify(name)}`
}

function buildPartyFinanceId(partyName: string, district: string): string {
  return `cne-party-${slugify(partyName)}-${slugify(district)}`
}

// ---------------------------------------------------------------------------
// Politician matching
// ---------------------------------------------------------------------------

/**
 * Match CNE donors (individuals only) to existing Politician nodes using normalizeName.
 *
 * Returns MAYBE_SAME_AS relationships with confidence:
 * - 1.0 for exact normalized name match
 * - Skips corporate donors and ambiguous matches
 */
function matchDonorsToPoliticians(
  donors: readonly DonorParams[],
  politicians: readonly PoliticianParams[],
): DonorMaybeSameAsRelParams[] {
  // Build lookup: normalized name -> politician id (null if ambiguous)
  const lookup = new Map<string, string | null>()
  for (const p of politicians) {
    const key = normalizeName(p.full_name)
    if (lookup.has(key)) {
      lookup.set(key, null) // ambiguous
    } else {
      lookup.set(key, p.id)
    }
  }

  const matches: DonorMaybeSameAsRelParams[] = []

  for (const donor of donors) {
    // Only match individual donors, not companies
    if (donor.donor_type !== 'Humana') continue

    const normalized = normalizeName(donor.name)
    const politicianId = lookup.get(normalized)

    if (politicianId) {
      matches.push({
        politician_id: politicianId,
        donor_id: donor.donor_id,
        confidence: 0.8,
        match_method: 'normalized_name',
      })
    }
  }

  return matches
}

/**
 * Match CNE party finance nodes to existing Party nodes from Como Voto.
 *
 * Uses normalized name matching with lower confidence since party names
 * may differ between data sources.
 */
function matchPartiesToExisting(
  partyFinanceNodes: readonly PoliticalPartyFinanceParams[],
  existingPartyNames: readonly string[],
): PartyFinanceMaybeSameRelParams[] {
  const lookup = new Map<string, string>()
  for (const name of existingPartyNames) {
    lookup.set(normalizeName(name), slugify(name))
  }

  const matches: PartyFinanceMaybeSameRelParams[] = []
  const seen = new Set<string>()

  for (const pf of partyFinanceNodes) {
    const normalized = normalizeName(pf.name)
    const partyId = lookup.get(normalized)

    if (partyId) {
      const key = `${partyId}::${pf.party_finance_id}`
      if (!seen.has(key)) {
        seen.add(key)
        matches.push({
          party_id: partyId,
          party_finance_id: pf.party_finance_id,
          confidence: 0.8,
        })
      }
    }
  }

  return matches
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface CneTransformResult {
  readonly donations: readonly CampaignDonationParams[]
  readonly donors: readonly DonorParams[]
  readonly partyFinanceNodes: readonly PoliticalPartyFinanceParams[]
  readonly donatedToRels: readonly DonatedToRelParams[]
  readonly receivedDonationRels: readonly ReceivedDonationRelParams[]
  readonly donorMaybeSameAsRels: readonly DonorMaybeSameAsRelParams[]
  readonly partyMaybeSameRels: readonly PartyFinanceMaybeSameRelParams[]
}

export interface CneTransformInput {
  readonly campaignDonations: readonly DonationRow[]
  readonly institutionalDonations: readonly DonationRow[]
  readonly politicians: readonly PoliticianParams[]
  readonly existingPartyNames: readonly string[]
}

export function transformCneAll(input: CneTransformInput): CneTransformResult {
  const allRows = [...input.campaignDonations, ...input.institutionalDonations]

  // Filter out annulled donations
  const activeRows = allRows.filter((row) => !parseBoolField(row.Anulado || ''))

  // Transform donations
  const donations = activeRows.map((row, i) => transformDonation(row, i))

  // Build unique donors
  const donorMap = new Map<string, DonorParams>()
  for (const d of donations) {
    const donorId = buildDonorId(d.donor_name, d.donor_cuit)
    if (!donorMap.has(donorId)) {
      donorMap.set(donorId, {
        ...buildProvenance(`donor:${donorId}`),
        donor_id: donorId,
        name: d.donor_name,
        cuit: d.donor_cuit,
        donor_type: d.donor_type,
      })
    }
  }
  const donors = [...donorMap.values()]

  // Build unique party finance nodes
  const partyMap = new Map<string, PoliticalPartyFinanceParams>()
  for (const d of donations) {
    if (!d.party_name) continue
    const partyFinanceId = buildPartyFinanceId(d.party_name, d.district)
    if (!partyMap.has(partyFinanceId)) {
      partyMap.set(partyFinanceId, {
        ...buildProvenance(`party-finance:${partyFinanceId}`),
        party_finance_id: partyFinanceId,
        name: d.party_name,
        district: d.district,
      })
    }
  }
  const partyFinanceNodes = [...partyMap.values()]

  // Build relationships
  const donatedToRels: DonatedToRelParams[] = []
  const receivedDonationRels: ReceivedDonationRelParams[] = []

  for (const d of donations) {
    const donorId = buildDonorId(d.donor_name, d.donor_cuit)
    const partyFinanceId = buildPartyFinanceId(d.party_name, d.district)

    donatedToRels.push({
      donor_id: donorId,
      party_finance_id: partyFinanceId,
      donation_id: d.donation_id,
      amount: d.amount,
      date_iso: d.date_iso,
    })

    receivedDonationRels.push({
      party_finance_id: partyFinanceId,
      donation_id: d.donation_id,
    })
  }

  // Match donors to politicians
  const donorMaybeSameAsRels = matchDonorsToPoliticians(donors, input.politicians)

  // Match party finance nodes to existing parties
  const partyMaybeSameRels = matchPartiesToExisting(
    partyFinanceNodes,
    input.existingPartyNames,
  )

  return {
    donations,
    donors,
    partyFinanceNodes,
    donatedToRels,
    receivedDonationRels,
    donorMaybeSameAsRels,
    partyMaybeSameRels,
  }
}
