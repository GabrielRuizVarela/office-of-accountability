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
  LegislativeVoteParams,
  LegislatorDetail,
  MemberOfRelParams,
  PartyParams,
  PoliticianParams,
  ProvenanceParams,
  ProvinceParams,
  RepresentsRelParams,
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
}

export interface TransformInput {
  readonly legislators: readonly CompactLegislator[]
  readonly details: readonly LegislatorDetail[]
  readonly sessions: readonly VotingSession[]
}

/**
 * Transform all Como Voto data into Neo4j-ready parameters.
 *
 * Matches legislators with their detail records when available,
 * falls back to compact data only when detail is missing.
 */
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

  return {
    politicians,
    parties,
    provinces,
    votingSessions,
    castVotes,
    memberOfRels,
    representsRels,
  }
}
