/**
 * Transforms Como Voto raw data into Neo4j node/relationship parameters.
 *
 * Pure functions — no side effects, no mutations.
 * Input: validated Como Voto types from fetcher
 * Output: typed parameter objects ready for Neo4j MERGE queries
 */

import { createHash } from 'node:crypto'

import type {
  CastVoteRelParams,
  CompactLegislator,
  ElectionEntry,
  ElectionParams,
  LawNamePatchParams,
  LegislationParams,
  LegislativeVoteParams,
  LegislatorDetail,
  MemberOfRelParams,
  PartyParams,
  PoliticianParams,
  ProvenanceParams,
  ProvinceParams,
  RanInRelParams,
  RepresentsRelParams,
  ServedTermRelParams,
  TermNodeParams,
  TermPartyRelParams,
  TermProvinceRelParams,
  VoteOnRelParams,
  VotingSession,
} from './types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COMO_VOTO_SOURCE = 'https://github.com/rquiroga7/Como_voto'
const SUBMITTED_BY = 'etl:como-voto'
const CONFIDENCE_SCORE = 1.0
const TIER = 'gold' as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a string to a URL-safe slug */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-') // non-alphanum → dash
    .replace(/^-+|-+$/g, '') // trim leading/trailing dashes
}

/**
 * Normalize a name for fuzzy matching.
 * Strips diacritics, lowercases, removes punctuation, sorts parts alphabetically.
 * "Roberto Pedro Álvarez" → "alvarez pedro roberto"
 * "ALVAREZ, ROBERTO PEDRO" → "alvarez pedro roberto"
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}

/**
 * Parse Como Voto date format "DD/MM/YYYY - HH:MM" to ISO 8601.
 * Returns empty string for unparseable dates.
 */
export function parseComoVotoDate(dateStr: string): string {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2}):(\d{2})$/)
  if (!match) {
    return ''
  }

  const [, day, month, year, hour, minute] = match
  return `${year}-${month}-${day}T${hour}:${minute}:00-03:00`
}

/** Create a deterministic hash of the input data for deduplication */
function computeHash(data: string): string {
  return createHash('sha256').update(data).digest('hex').slice(0, 16)
}

/** Build provenance fields for a given source key */
function buildProvenance(sourceKey: string): ProvenanceParams {
  const now = new Date().toISOString()

  return {
    source_url: COMO_VOTO_SOURCE,
    submitted_by: SUBMITTED_BY,
    tier: TIER,
    confidence_score: CONFIDENCE_SCORE,
    ingestion_hash: computeHash(sourceKey),
    created_at: now,
    updated_at: now,
  }
}

// ---------------------------------------------------------------------------
// Node transformers
// ---------------------------------------------------------------------------

/** Transform a compact legislator record into Politician node params */
export function transformPolitician(legislator: CompactLegislator): PoliticianParams {
  const slug = slugify(legislator.k)

  return {
    ...buildProvenance(`politician:${legislator.k}`),
    id: slug,
    name: legislator.n,
    full_name: legislator.k,
    name_key: legislator.k,
    slug,
    chamber: legislator.c,
    province: legislator.p,
    bloc: legislator.b,
    coalition: legislator.co,
    photo: legislator.ph ?? '',
    total_votes: legislator.tv,
    presence_pct: legislator.pres,
  }
}

/** Transform a compact legislator record enriched with detail data */
export function transformPoliticianWithDetail(
  legislator: CompactLegislator,
  detail: LegislatorDetail,
): PoliticianParams {
  const slug = slugify(legislator.k)

  return {
    ...buildProvenance(`politician:${legislator.k}`),
    id: slug,
    name: detail.name,
    full_name: legislator.k,
    name_key: detail.name_key,
    slug,
    chamber: detail.chamber,
    province: detail.province,
    bloc: detail.bloc,
    coalition: detail.coalition,
    photo: detail.photo ?? '',
    total_votes: legislator.tv,
    presence_pct: legislator.pres,
  }
}

/** Extract unique Party params from a list of compact legislators */
export function transformParties(
  legislators: readonly CompactLegislator[],
): readonly PartyParams[] {
  const seen = new Set<string>()

  return legislators.reduce<PartyParams[]>((acc, leg) => {
    const id = slugify(leg.b)
    if (seen.has(id)) {
      return acc
    }
    seen.add(id)

    return [
      ...acc,
      {
        ...buildProvenance(`party:${leg.b}`),
        id,
        name: leg.b,
        slug: id,
      },
    ]
  }, [])
}

/** Extract unique Province params from a list of compact legislators */
export function transformProvinces(
  legislators: readonly CompactLegislator[],
): readonly ProvinceParams[] {
  const seen = new Set<string>()

  return legislators.reduce<ProvinceParams[]>((acc, leg) => {
    const id = slugify(leg.p)
    if (seen.has(id)) {
      return acc
    }
    seen.add(id)

    return [
      ...acc,
      {
        ...buildProvenance(`province:${leg.p}`),
        id,
        name: leg.p,
        slug: id,
      },
    ]
  }, [])
}

/** Transform a voting session into LegislativeVote node params */
export function transformVotingSession(session: VotingSession): LegislativeVoteParams {
  return {
    ...buildProvenance(`vote:${session.id}`),
    acta_id: session.id,
    title: session.title,
    date: session.date,
    date_iso: parseComoVotoDate(session.date),
    result: session.result,
    vote_type: session.type,
    tally_afirmativo: session.afirmativo,
    tally_negativo: session.negativo,
    tally_abstencion: session.abstencion,
    tally_ausente: session.ausente,
  }
}

// ---------------------------------------------------------------------------
// Relationship transformers
// ---------------------------------------------------------------------------

/** Build CAST_VOTE relationship params from legislator detail data */
export function transformCastVotes(detail: LegislatorDetail): readonly CastVoteRelParams[] {
  const politicianId = slugify(detail.name_key)

  return detail.votes
    .filter((vote) => vote.v !== '')
    .map((vote) => ({
      politician_id: politicianId,
      vote_acta_id: vote.vid,
      vote_value: vote.v,
      source_url: vote.url,
    }))
}

/** Build MEMBER_OF relationship params for a legislator */
export function transformMemberOf(legislator: CompactLegislator): MemberOfRelParams {
  return {
    politician_id: slugify(legislator.k),
    party_id: slugify(legislator.b),
  }
}

/** Build REPRESENTS relationship params for a legislator */
export function transformRepresents(legislator: CompactLegislator): RepresentsRelParams {
  return {
    politician_id: slugify(legislator.k),
    province_id: slugify(legislator.p),
  }
}

// ---------------------------------------------------------------------------
// Term transformers
// ---------------------------------------------------------------------------

export interface TermTransformResult {
  readonly terms: readonly TermNodeParams[]
  readonly servedTermRels: readonly ServedTermRelParams[]
  readonly termPartyRels: readonly TermPartyRelParams[]
  readonly termProvinceRels: readonly TermProvinceRelParams[]
  readonly additionalParties: readonly PartyParams[]
  readonly additionalProvinces: readonly ProvinceParams[]
}

/** Transform a legislator's terms into Term nodes and relationships */
export function transformTerms(
  detail: LegislatorDetail,
  existingPartySlugs: ReadonlySet<string>,
  existingProvinceSlugs: ReadonlySet<string>,
): TermTransformResult {
  const politicianSlug = slugify(detail.name_key)
  const terms: TermNodeParams[] = []
  const servedTermRels: ServedTermRelParams[] = []
  const termPartyRels: TermPartyRelParams[] = []
  const termProvinceRels: TermProvinceRelParams[] = []
  const additionalParties: PartyParams[] = []
  const additionalProvinces: ProvinceParams[] = []
  const seenParties = new Set<string>()
  const seenProvinces = new Set<string>()

  for (const term of detail.terms) {
    const termId = `${politicianSlug}--${term.ch}-${term.yf}-${term.yt}`
    const partySlug = slugify(term.b)
    const provinceSlug = slugify(term.p)

    terms.push({
      ...buildProvenance(`term:${termId}`),
      id: termId,
      chamber: term.ch,
      year_from: term.yf,
      year_to: term.yt,
      bloc: term.b,
      province: term.p,
      coalition: term.co,
    })

    servedTermRels.push({ politician_id: politicianSlug, term_id: termId })
    termPartyRels.push({ term_id: termId, party_id: partySlug })
    termProvinceRels.push({ term_id: termId, province_id: provinceSlug })

    if (!existingPartySlugs.has(partySlug) && !seenParties.has(partySlug)) {
      seenParties.add(partySlug)
      additionalParties.push({
        ...buildProvenance(`party:${term.b}`),
        id: partySlug,
        name: term.b,
        slug: partySlug,
      })
    }

    if (!existingProvinceSlugs.has(provinceSlug) && !seenProvinces.has(provinceSlug)) {
      seenProvinces.add(provinceSlug)
      additionalProvinces.push({
        ...buildProvenance(`province:${term.p}`),
        id: provinceSlug,
        name: term.p,
        slug: provinceSlug,
      })
    }
  }

  return { terms, servedTermRels, termPartyRels, termProvinceRels, additionalParties, additionalProvinces }
}

// ---------------------------------------------------------------------------
// Legislation transformers
// ---------------------------------------------------------------------------

export interface LegislationTransformResult {
  readonly legislation: readonly LegislationParams[]
  readonly voteOnRels: readonly VoteOnRelParams[]
  readonly lawNamePatches: readonly LawNamePatchParams[]
}

/**
 * Build Legislation nodes from vote group keys, VOTE_ON rels, and law_name patches.
 *
 * - Legislation identity is always derived from `gk` (group key)
 * - Display name: first non-empty `ln` per gk, then lawNames fallback, then raw gk
 * - Votes without `gk` get no VOTE_ON rel but may still get law_name from `ln`
 */
export function transformLegislation(
  details: readonly LegislatorDetail[],
  lawNames: readonly string[],
): LegislationTransformResult {
  const lawNameSet = new Set(lawNames)

  const idToGk = new Map<string, string>()
  const gkToName = new Map<string, string>()
  const voteOnRels: VoteOnRelParams[] = []
  const lawNamePatches: LawNamePatchParams[] = []
  const seenVoteOn = new Set<string>()

  for (const detail of details) {
    for (const vote of detail.votes) {
      if (vote.ln && vote.ln.trim() !== '') {
        lawNamePatches.push({ acta_id: vote.vid, law_name: vote.ln.trim() })
      }

      if (vote.gk && vote.gk.trim() !== '') {
        const gk = vote.gk.trim()
        const legislationId = slugify(gk)

        if (!idToGk.has(legislationId)) {
          idToGk.set(legislationId, gk)
        }

        if (!gkToName.has(gk) && vote.ln && vote.ln.trim() !== '') {
          gkToName.set(gk, vote.ln.trim())
        }

        const relKey = `${vote.vid}::${legislationId}`
        if (!seenVoteOn.has(relKey)) {
          seenVoteOn.add(relKey)
          voteOnRels.push({ acta_id: vote.vid, legislation_id: legislationId })
        }
      }
    }
  }

  const legislation: LegislationParams[] = []
  for (const [id, gk] of idToGk.entries()) {
    let name = gkToName.get(gk)
    if (!name && lawNameSet.has(gk)) {
      name = gk
    }

    legislation.push({
      ...buildProvenance(`legislation:${gk}`),
      id,
      name: name || gk,
      group_key: gk,
      slug: id,
    })
  }

  const seenActa = new Set<string>()
  const dedupedPatches = lawNamePatches.filter((p) => {
    if (seenActa.has(p.acta_id)) return false
    seenActa.add(p.acta_id)
    return true
  })

  return { legislation, voteOnRels, lawNamePatches: dedupedPatches }
}

// ---------------------------------------------------------------------------
// Election transformers
// ---------------------------------------------------------------------------

export interface ElectionTransformResult {
  readonly elections: readonly ElectionParams[]
  readonly ranInRels: readonly RanInRelParams[]
  readonly unmatchedCount: number
}

/**
 * Transform election data into Election nodes and RAN_IN relationships.
 *
 * Matches election entries to existing Politicians using:
 * 1. Normalized name + province (most collisions resolve here)
 * 2. Name + province + year overlap with known terms (resolves ambiguity)
 * 3. Skip with warning if still ambiguous or unmatched
 */
export function transformElections(
  electionData: Record<string, Record<string, ElectionEntry[]>>,
  politicians: readonly PoliticianParams[],
  terms: readonly TermNodeParams[],
): ElectionTransformResult {
  const lookup = new Map<string, string[]>()
  for (const p of politicians) {
    const key = `${normalizeName(p.full_name)}::${normalizeName(p.province)}`
    const existing = lookup.get(key) || []
    existing.push(p.id)
    lookup.set(key, existing)
  }

  const termsByPolitician = new Map<string, Array<{ year_from: number; year_to: number }>>()
  for (const t of terms) {
    const politicianSlug = t.id.split('--')[0]
    const existing = termsByPolitician.get(politicianSlug) || []
    existing.push({ year_from: t.year_from, year_to: t.year_to })
    termsByPolitician.set(politicianSlug, existing)
  }

  const elections: ElectionParams[] = []
  const ranInRels: RanInRelParams[] = []
  const seenElectionIds = new Set<string>()
  let unmatchedCount = 0

  for (const [year, chambers] of Object.entries(electionData)) {
    const electionId = `election-${year}`
    const electionYear = parseInt(year, 10)

    if (!seenElectionIds.has(electionId)) {
      seenElectionIds.add(electionId)
      elections.push({
        ...buildProvenance(`election:${year}`),
        id: electionId,
        year: electionYear,
        slug: electionId,
      })
    }

    for (const entries of Object.values(chambers)) {
      for (const entry of entries) {
        const key = `${normalizeName(entry.name)}::${normalizeName(entry.province)}`
        const candidates = lookup.get(key)

        if (!candidates || candidates.length === 0) {
          unmatchedCount += 1
          continue
        }

        let politicianId: string | null = null

        if (candidates.length === 1) {
          politicianId = candidates[0]
        } else {
          const matching = candidates.filter((slug) => {
            const t = termsByPolitician.get(slug)
            if (!t) return false
            return t.some((term) => electionYear >= term.year_from && electionYear <= term.year_to)
          })
          if (matching.length === 1) {
            politicianId = matching[0]
          }
        }

        if (!politicianId) {
          unmatchedCount += 1
          continue
        }

        ranInRels.push({
          politician_id: politicianId,
          election_id: electionId,
          alliance: entry.alliance,
          province: entry.province,
          coalition: entry.coalition,
          party_code: entry.party_code,
        })
      }
    }
  }

  return { elections, ranInRels, unmatchedCount }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export interface TransformResult {
  readonly politicians: readonly PoliticianParams[]
  readonly parties: readonly PartyParams[]
  readonly provinces: readonly ProvinceParams[]
  readonly votingSessions: readonly LegislativeVoteParams[]
  readonly castVotes: readonly CastVoteRelParams[]
  readonly memberOfRels: readonly MemberOfRelParams[]
  readonly representsRels: readonly RepresentsRelParams[]
  readonly terms: readonly TermNodeParams[]
  readonly servedTermRels: readonly ServedTermRelParams[]
  readonly termPartyRels: readonly TermPartyRelParams[]
  readonly termProvinceRels: readonly TermProvinceRelParams[]
  readonly legislation: readonly LegislationParams[]
  readonly voteOnRels: readonly VoteOnRelParams[]
  readonly lawNamePatches: readonly LawNamePatchParams[]
  readonly elections: readonly ElectionParams[]
  readonly ranInRels: readonly RanInRelParams[]
}

export interface TransformInput {
  readonly legislators: readonly CompactLegislator[]
  readonly details: readonly LegislatorDetail[]
  readonly sessions: readonly VotingSession[]
  readonly lawNames: readonly string[]
  readonly electionData: Record<string, Record<string, ElectionEntry[]>>
}

export function transformAll(input: TransformInput): TransformResult {
  const detailByKey = new Map(input.details.map((d) => [d.name_key, d]))

  const politicians = input.legislators.map((leg) => {
    const detail = detailByKey.get(leg.k)
    return detail ? transformPoliticianWithDetail(leg, detail) : transformPolitician(leg)
  })

  const parties = transformParties(input.legislators)
  const provinces = transformProvinces(input.legislators)

  const votingSessions = input.sessions.map(transformVotingSession)
  const castVotes = input.details.flatMap(transformCastVotes)
  const memberOfRels = input.legislators.map(transformMemberOf)
  const representsRels = input.legislators.map(transformRepresents)

  // --- Terms ---
  const existingPartySlugs = new Set(parties.map((p) => p.id))
  const existingProvinceSlugs = new Set(provinces.map((p) => p.id))

  const allTermResults = input.details.map((d) =>
    transformTerms(d, existingPartySlugs, existingProvinceSlugs),
  )

  const terms = allTermResults.flatMap((r) => r.terms)
  const servedTermRels = allTermResults.flatMap((r) => r.servedTermRels)
  const termPartyRels = allTermResults.flatMap((r) => r.termPartyRels)
  const termProvinceRels = allTermResults.flatMap((r) => r.termProvinceRels)

  const additionalParties = allTermResults.flatMap((r) => r.additionalParties)
  const additionalProvinces = allTermResults.flatMap((r) => r.additionalProvinces)

  const mergedParties = [...parties]
  const mergedPartySlugs = new Set(parties.map((p) => p.id))
  for (const p of additionalParties) {
    if (!mergedPartySlugs.has(p.id)) {
      mergedPartySlugs.add(p.id)
      mergedParties.push(p)
    }
  }

  const mergedProvinces = [...provinces]
  const mergedProvinceSlugs = new Set(provinces.map((p) => p.id))
  for (const p of additionalProvinces) {
    if (!mergedProvinceSlugs.has(p.id)) {
      mergedProvinceSlugs.add(p.id)
      mergedProvinces.push(p)
    }
  }

  // --- Legislation ---
  const { legislation, voteOnRels, lawNamePatches } = transformLegislation(
    input.details,
    input.lawNames,
  )

  // --- Elections ---
  const { elections, ranInRels, unmatchedCount } = transformElections(
    input.electionData,
    politicians,
    terms,
  )

  if (unmatchedCount > 0) {
    console.warn(`  Election matching: ${unmatchedCount} entries could not be matched to politicians`)
  }

  return {
    politicians,
    parties: mergedParties,
    provinces: mergedProvinces,
    votingSessions,
    castVotes,
    memberOfRels,
    representsRels,
    terms,
    servedTermRels,
    termPartyRels,
    termProvinceRels,
    legislation,
    voteOnRels,
    lawNamePatches,
    elections,
    ranInRels,
  }
}
