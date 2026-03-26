/**
 * Zod schemas and TypeScript types for Como Voto JSON data.
 *
 * Data source: https://github.com/rquiroga7/Como_voto
 * Files validated:
 *   - docs/data/legislators.json (compact legislator list)
 *   - docs/data/votaciones.json (voting sessions)
 *   - docs/data/legislators/<NAME_KEY>.json (per-legislator detail)
 */

import { z } from 'zod/v4'

// ---------------------------------------------------------------------------
// Como Voto raw schemas - match the JSON structure from the source
// ---------------------------------------------------------------------------

/** Chamber identifier */
export const ChamberSchema = z.enum(['diputados', 'senadores', 'diputados+senadores'])
export type Chamber = z.infer<typeof ChamberSchema>

/** Coalition codes used in Como Voto */
export const CoalitionSchema = z.enum(['PJ', 'UCR', 'PRO', 'JxC', 'LLA', 'OTROS'])
export type Coalition = z.infer<typeof CoalitionSchema>

/** Vote value as cast by a legislator (free-form string in source data) */
export const VoteValueSchema = z.string()
export type VoteValue = z.infer<typeof VoteValueSchema>

/** Vote type classification (free-form string in source data) */
export const VoteTypeSchema = z.string()
export type VoteType = z.infer<typeof VoteTypeSchema>

/**
 * Compact legislator record from legislators.json
 * Uses abbreviated field names to minimize JSON size.
 */
export const CompactLegislatorSchema = z.object({
  /** Name key (uppercase): "ABAD, MAXIMILIANO" */
  k: z.string(),
  /** Display name: "ABAD, Maximiliano" */
  n: z.string(),
  /** Chamber */
  c: ChamberSchema,
  /** Bloc (political party/group) */
  b: z.string(),
  /** Province */
  p: z.string(),
  /** Coalition code */
  co: CoalitionSchema,
  /** Total votes cast */
  tv: z.number().int(),
  /** Presence percentage */
  pres: z.number(),
  /** Absences */
  aus: z.number().int(),
  /** Abstentions */
  abst: z.number().int(),
  /** Photo path */
  ph: z.string().optional(),
})
export type CompactLegislator = z.infer<typeof CompactLegislatorSchema>

/** Array of compact legislators (the full legislators.json file) */
export const LegislatorsFileSchema = z.array(CompactLegislatorSchema)

/**
 * Individual vote record from per-legislator detail files.
 */
export const LegislatorVoteSchema = z.object({
  /** Voting session ID */
  vid: z.string(),
  /** Chamber at time of vote */
  ch: ChamberSchema,
  /** Vote title/description */
  t: z.string(),
  /** Date: "DD/MM/YYYY - HH:MM" */
  d: z.string(),
  /** Year */
  yr: z.number().int(),
  /** Vote cast */
  v: VoteValueSchema,
  /** Vote type */
  tp: VoteTypeSchema,
  /** Source URL */
  url: z.string(),
  /** Group key (for grouped votes on same law) */
  gk: z.string().optional(),
  /** Law common name */
  ln: z.string().optional(),
})
export type LegislatorVote = z.infer<typeof LegislatorVoteSchema>

/**
 * Legislative term from per-legislator detail files.
 */
export const TermSchema = z.object({
  /** Chamber */
  ch: ChamberSchema,
  /** Year from */
  yf: z.number().int(),
  /** Year to */
  yt: z.number().int(),
  /** Bloc */
  b: z.string(),
  /** Province */
  p: z.string(),
  /** Coalition code */
  co: CoalitionSchema,
})
export type Term = z.infer<typeof TermSchema>

/**
 * Per-legislator detail file (legislators/<NAME_KEY>.json).
 */
export const LegislatorDetailSchema = z.object({
  name: z.string(),
  name_key: z.string(),
  chamber: ChamberSchema,
  chambers: z.array(ChamberSchema),
  bloc: z.string(),
  province: z.string(),
  coalition: CoalitionSchema,
  photo: z.string().optional(),
  terms: z.array(TermSchema),
  votes: z.array(LegislatorVoteSchema),
})
export type LegislatorDetail = z.infer<typeof LegislatorDetailSchema>

/**
 * Voting session record from votaciones.json.
 */
export const VotingSessionSchema = z.object({
  /** Session ID */
  id: z.string(),
  /** Description/title */
  title: z.string(),
  /** Date: "DD/MM/YYYY - HH:MM" */
  date: z.string(),
  /** Overall result */
  result: z.string(),
  /** Vote type */
  type: VoteTypeSchema,
  /** Tally counts */
  afirmativo: z.number().int(),
  negativo: z.number().int(),
  abstencion: z.number().int(),
  ausente: z.number().int(),
})
export type VotingSession = z.infer<typeof VotingSessionSchema>

/** Voting sessions file - dict keyed by chamber, each value is an array of sessions */
export const VotingSessionsFileSchema = z.object({
  diputados: z.array(VotingSessionSchema),
  senadores: z.array(VotingSessionSchema),
})

/** Law names file - flat array of law name strings */
export const LawNamesFileSchema = z.array(z.string())

/** Individual entry in election_legislators.json */
export const ElectionEntrySchema = z.object({
  name: z.string(),
  province: z.string(),
  alliance: z.string(),
  coalition: z.string(),
  party_code: z.string().nullable(),
})
export type ElectionEntry = z.infer<typeof ElectionEntrySchema>

/** Election legislators file - keyed by year, then chamber */
export const ElectionLegislatorsFileSchema = z.record(
  z.string(),
  z.record(z.string(), z.array(ElectionEntrySchema)),
)
export type ElectionLegislatorsFile = z.infer<typeof ElectionLegislatorsFileSchema>

// ---------------------------------------------------------------------------
// Neo4j node parameter types - used by the loader to MERGE nodes
// ---------------------------------------------------------------------------

/** Provenance fields attached to every ingested node */
export interface ProvenanceParams {
  readonly source_url: string
  readonly submitted_by: string
  readonly tier: 'gold'
  readonly confidence_score: number
  readonly ingestion_hash: string
  readonly created_at: string
  readonly updated_at: string
}

/** Parameters for a Politician node MERGE */
export interface PoliticianParams extends ProvenanceParams {
  readonly id: string
  readonly name: string
  readonly full_name: string
  readonly name_key: string
  readonly slug: string
  readonly chamber: Chamber
  readonly province: string
  readonly bloc: string
  readonly coalition: Coalition
  readonly photo: string
  readonly total_votes: number
  readonly presence_pct: number
}

/** Parameters for a Party node MERGE */
export interface PartyParams extends ProvenanceParams {
  readonly id: string
  readonly name: string
  readonly slug: string
}

/** Parameters for a Province node MERGE */
export interface ProvinceParams extends ProvenanceParams {
  readonly id: string
  readonly name: string
  readonly slug: string
}

/** Parameters for a LegislativeVote node MERGE */
export interface LegislativeVoteParams extends ProvenanceParams {
  readonly acta_id: string
  readonly title: string
  readonly date: string
  readonly date_iso: string
  readonly result: string
  readonly vote_type: string
  readonly tally_afirmativo: number
  readonly tally_negativo: number
  readonly tally_abstencion: number
  readonly tally_ausente: number
}

/** Parameters for a CAST_VOTE relationship */
export interface CastVoteRelParams {
  readonly politician_id: string
  readonly vote_acta_id: string
  readonly vote_value: string
  readonly source_url: string
}

/** Parameters for a MEMBER_OF relationship */
export interface MemberOfRelParams {
  readonly politician_id: string
  readonly party_id: string
}

/** Parameters for a REPRESENTS relationship */
export interface RepresentsRelParams {
  readonly politician_id: string
  readonly province_id: string
}

/** Parameters for a Term node MERGE */
export interface TermNodeParams extends ProvenanceParams {
  readonly id: string
  readonly chamber: Chamber
  readonly year_from: number
  readonly year_to: number
  readonly bloc: string
  readonly province: string
  readonly coalition: string
}

/** Parameters for a Legislation node MERGE */
export interface LegislationParams extends ProvenanceParams {
  readonly id: string
  readonly name: string
  readonly group_key: string
  readonly slug: string
}

/** Parameters for an Election node MERGE */
export interface ElectionParams extends ProvenanceParams {
  readonly id: string
  readonly year: number
  readonly slug: string
}

/** Parameters for a SERVED_TERM relationship */
export interface ServedTermRelParams {
  readonly politician_id: string
  readonly term_id: string
}

/** Parameters for a TERM_PARTY relationship */
export interface TermPartyRelParams {
  readonly term_id: string
  readonly party_id: string
}

/** Parameters for a TERM_PROVINCE relationship */
export interface TermProvinceRelParams {
  readonly term_id: string
  readonly province_id: string
}

/** Parameters for a VOTE_ON relationship */
export interface VoteOnRelParams {
  readonly acta_id: string
  readonly legislation_id: string
}

/** Parameters for a RAN_IN relationship */
export interface RanInRelParams {
  readonly politician_id: string
  readonly election_id: string
  readonly alliance: string
  readonly province: string
  readonly coalition: string
  readonly party_code: string | null
}

/** Parameters for patching law_name onto LegislativeVote nodes */
export interface LawNamePatchParams {
  readonly acta_id: string
  readonly law_name: string
}
