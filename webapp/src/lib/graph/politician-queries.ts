/**
 * Politician-specific query functions for profile pages.
 *
 * These queries power the server-rendered /politico/[slug] pages.
 * All queries use parameterized Cypher (no string interpolation).
 */

import neo4j, { type Record as Neo4jRecord } from 'neo4j-driver-lite'

import { getDriver } from '../neo4j/client'

import { transformNode } from './transform'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum query execution time in milliseconds (security: prevent graph bombs) */
const QUERY_TIMEOUT_MS = 5_000

/** Transaction config applied to all user-facing queries */
const TX_CONFIG = { timeout: QUERY_TIMEOUT_MS }

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Politician profile data returned by getPoliticianBySlug */
export interface PoliticianProfile {
  readonly id: string
  readonly name: string
  readonly fullName: string
  readonly slug: string
  readonly chamber: string
  readonly province: string
  readonly bloc: string
  readonly coalition: string
  readonly photo: string
  readonly totalVotes: number
  readonly presencePct: number
  readonly properties: Readonly<Record<string, unknown>>
  readonly party: { readonly id: string; readonly name: string } | null
  readonly provinceNode: { readonly id: string; readonly name: string } | null
}

/** A single vote record in the politician's vote history */
export interface VoteRecord {
  readonly sessionId: string
  readonly sessionTitle: string
  readonly sessionDate: string
  readonly sessionResult: string
  readonly sessionType: string
  readonly vote: string
  readonly chamber: string
}

/** Paginated vote history result */
export interface VoteHistoryResult {
  readonly votes: readonly VoteRecord[]
  readonly totalCount: number
  readonly page: number
  readonly limit: number
  readonly hasMore: boolean
}

// ---------------------------------------------------------------------------
// getPoliticianBySlug
// ---------------------------------------------------------------------------

/**
 * Fetch a politician profile by slug, including their current party and province.
 *
 * Returns null if no politician with that slug exists.
 */
export async function getPoliticianBySlug(slug: string): Promise<PoliticianProfile | null> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Politician {slug: $slug})
       OPTIONAL MATCH (p)-[:MEMBER_OF]->(party:Party)
       OPTIONAL MATCH (p)-[:REPRESENTS]->(prov:Province)
       RETURN p, party, prov
       LIMIT 1`,
      { slug },
      TX_CONFIG,
    )

    if (result.records.length === 0) {
      return null
    }

    const record = result.records[0]
    const politicianNode = transformNode(record.get('p'))
    const props = politicianNode.properties

    const partyNode = record.get('party')
    const provNode = record.get('prov')

    return {
      id: politicianNode.id,
      name: asString(props.name),
      fullName: asString(props.full_name),
      slug: asString(props.slug),
      chamber: asString(props.chamber),
      province: asString(props.province),
      bloc: asString(props.bloc),
      coalition: asString(props.coalition),
      photo: asString(props.photo),
      totalVotes: asNumber(props.total_votes),
      presencePct: asNumber(props.presence_pct),
      properties: props,
      party: partyNode
        ? {
            id: asString(transformNode(partyNode).id),
            name: asString(transformNode(partyNode).properties.name),
          }
        : null,
      provinceNode: provNode
        ? {
            id: asString(transformNode(provNode).id),
            name: asString(transformNode(provNode).properties.name),
          }
        : null,
    }
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// getPoliticianVoteHistory
// ---------------------------------------------------------------------------

/**
 * Fetch paginated vote history for a politician.
 *
 * Returns the politician's CAST_VOTE relationships with their linked
 * LegislativeVote sessions, sorted by date descending (most recent first).
 */
export async function getPoliticianVoteHistory(
  slug: string,
  page: number = 1,
  limit: number = 20,
): Promise<VoteHistoryResult> {
  const skip = (page - 1) * limit
  const countSession = getDriver().session()
  const pageSession = getDriver().session()

  try {
    const [countResult, pageResult] = await Promise.all([
      countSession.run(
        `MATCH (p:Politician {slug: $slug})-[:CAST_VOTE]->(v:LegislativeVote)
         RETURN count(v) AS total`,
        { slug },
        TX_CONFIG,
      ),
      pageSession.run(
        `MATCH (p:Politician {slug: $slug})-[cv:CAST_VOTE]->(v:LegislativeVote)
         RETURN cv.vote AS vote, v
         ORDER BY v.date DESC
         SKIP $skip
         LIMIT $limit`,
        { slug, skip: toNeo4jInt(skip), limit: toNeo4jInt(limit) },
        TX_CONFIG,
      ),
    ])

    const totalCount = extractCount(countResult.records)
    const votes = pageResult.records.map(mapVoteRecord)

    return {
      votes,
      totalCount,
      page,
      limit,
      hasMore: skip + votes.length < totalCount,
    }
  } finally {
    await Promise.all([countSession.close(), pageSession.close()])
  }
}

// ---------------------------------------------------------------------------
// getAllPoliticianSlugs
// ---------------------------------------------------------------------------

/**
 * Fetch all politician slugs for static page generation and sitemap.
 */
export async function getAllPoliticianSlugs(): Promise<readonly string[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (p:Politician)
       WHERE p.slug IS NOT NULL
       RETURN p.slug AS slug
       ORDER BY p.slug`,
      {},
      TX_CONFIG,
    )

    return result.records.map((r: Neo4jRecord) => r.get('slug') as string)
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Province queries
// ---------------------------------------------------------------------------

/** Summary of a politician for listing pages */
export interface PoliticianSummary {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly chamber: string
  readonly bloc: string
  readonly coalition: string
  readonly photo: string
  readonly totalVotes: number
  readonly presencePct: number
  readonly party: string
}

/** Province with its politician count */
export interface ProvinceInfo {
  readonly id: string
  readonly name: string
  readonly politicianCount: number
}

/**
 * Fetch all politicians representing a given province (by province slug).
 *
 * Returns null if the province doesn't exist.
 */
export async function getPoliticiansByProvince(
  provinceSlug: string,
): Promise<{ readonly province: ProvinceInfo; readonly politicians: readonly PoliticianSummary[] } | null> {
  const session = getDriver().session()

  try {
    // First check province exists and get its info
    const provinceResult = await session.run(
      `MATCH (prov:Province {id: $provinceSlug})
       OPTIONAL MATCH (p:Politician)-[:REPRESENTS]->(prov)
       RETURN prov.name AS name, prov.id AS id, count(p) AS politicianCount`,
      { provinceSlug },
      TX_CONFIG,
    )

    if (provinceResult.records.length === 0 || !provinceResult.records[0].get('name')) {
      return null
    }

    const provinceRecord = provinceResult.records[0]
    const province: ProvinceInfo = {
      id: asString(provinceRecord.get('id')),
      name: asString(provinceRecord.get('name')),
      politicianCount: asNumber(provinceRecord.get('politicianCount')),
    }

    // Fetch politicians
    const politiciansResult = await session.run(
      `MATCH (p:Politician)-[:REPRESENTS]->(prov:Province {id: $provinceSlug})
       OPTIONAL MATCH (p)-[:MEMBER_OF]->(party:Party)
       RETURN p, party.name AS partyName
       ORDER BY p.name`,
      { provinceSlug },
      TX_CONFIG,
    )

    const politicians = politiciansResult.records.map((record: Neo4jRecord): PoliticianSummary => {
      const node = transformNode(record.get('p'))
      const props = node.properties

      return {
        id: node.id,
        name: asString(props.name),
        slug: asString(props.slug),
        chamber: asString(props.chamber),
        bloc: asString(props.bloc),
        coalition: asString(props.coalition),
        photo: asString(props.photo),
        totalVotes: asNumber(props.total_votes),
        presencePct: asNumber(props.presence_pct),
        party: asString(record.get('partyName')),
      }
    })

    return { province, politicians }
  } finally {
    await session.close()
  }
}

/**
 * Fetch all provinces with their politician counts for index/sitemap.
 */
export async function getAllProvinces(): Promise<readonly ProvinceInfo[]> {
  const session = getDriver().session()

  try {
    const result = await session.run(
      `MATCH (prov:Province)
       OPTIONAL MATCH (p:Politician)-[:REPRESENTS]->(prov)
       RETURN prov.id AS id, prov.name AS name, count(p) AS politicianCount
       ORDER BY prov.name`,
      {},
      TX_CONFIG,
    )

    return result.records.map((record: Neo4jRecord): ProvinceInfo => ({
      id: asString(record.get('id')),
      name: asString(record.get('name')),
      politicianCount: asNumber(record.get('politicianCount')),
    }))
  } finally {
    await session.close()
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }
  return 0
}

function toNeo4jInt(value: number) {
  return neo4j.int(value)
}

function extractCount(records: Neo4jRecord[]): number {
  if (records.length === 0) return 0
  return asNumber(records[0].get('total'))
}

function mapVoteRecord(record: Neo4jRecord): VoteRecord {
  const voteNode = transformNode(record.get('v'))
  const props = voteNode.properties

  return {
    sessionId: voteNode.id,
    sessionTitle: asString(props.title),
    sessionDate: asString(props.date),
    sessionResult: asString(props.result),
    sessionType: asString(props.type),
    vote: asString(record.get('vote')),
    chamber: asString(props.chamber),
  }
}
