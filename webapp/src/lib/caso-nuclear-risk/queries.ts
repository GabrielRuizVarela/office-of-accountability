/**
 * Neo4j Cypher queries for the Nuclear Risk Tracking investigation.
 *
 * All queries use parameterized Cypher — never interpolate user input.
 * LIMIT clauses use neo4j.int(n) — JS numbers are floats.
 */

import neo4j from 'neo4j-driver-lite'

// ---------------------------------------------------------------------------
// Status / counts
// ---------------------------------------------------------------------------

export const STATUS_QUERY = `
  MATCH (n)
  WHERE n:NuclearSignal OR n:NuclearActor OR n:WeaponSystem
    OR n:Treaty OR n:NuclearFacility OR n:RiskBriefing OR n:SignalSource
  RETURN labels(n)[0] AS type, count(n) AS count
  ORDER BY type
`

export const RELATIONSHIP_COUNT_QUERY = `
  MATCH ()-[r]->()
  WHERE type(r) IN [
    'INVOLVES', 'REFERENCES_SYSTEM', 'REFERENCES_TREATY',
    'LOCATED_AT', 'ESCALATES', 'OPERATES', 'PARTY_TO',
    'POSSESSES', 'SYNTHESIZES', 'SOURCED_FROM'
  ]
  RETURN type(r) AS type, count(r) AS count
  ORDER BY type
`

// ---------------------------------------------------------------------------
// Signal queries
// ---------------------------------------------------------------------------

export function signalsByTheaterQuery(theater: string, limit: number) {
  return {
    cypher: `
      MATCH (s:NuclearSignal)
      WHERE s.theater = $theater
      RETURN s
      ORDER BY s.date DESC
      LIMIT $limit
    `,
    params: { theater, limit: neo4j.int(limit) },
  }
}

export function signalsByDateRangeQuery(fromDate: string, toDate: string, limit: number) {
  return {
    cypher: `
      MATCH (s:NuclearSignal)
      WHERE s.date >= $fromDate AND s.date <= $toDate
      RETURN s
      ORDER BY s.severity DESC, s.date DESC
      LIMIT $limit
    `,
    params: { fromDate, toDate, limit: neo4j.int(limit) },
  }
}

export function signalsByEscalationQuery(escalationLevel: string, limit: number) {
  return {
    cypher: `
      MATCH (s:NuclearSignal)
      WHERE s.escalation_level = $escalationLevel
      RETURN s
      ORDER BY s.date DESC
      LIMIT $limit
    `,
    params: { escalationLevel, limit: neo4j.int(limit) },
  }
}

export function recentSignalsQuery(limit: number) {
  return {
    cypher: `
      MATCH (s:NuclearSignal)
      RETURN s
      ORDER BY s.date DESC
      LIMIT $limit
    `,
    params: { limit: neo4j.int(limit) },
  }
}

// ---------------------------------------------------------------------------
// Actor queries
// ---------------------------------------------------------------------------

export function actorDetailQuery(actorId: string) {
  return {
    cypher: `
      MATCH (a:NuclearActor {id: $actorId})
      OPTIONAL MATCH (a)<-[:INVOLVES]-(s:NuclearSignal)
      OPTIONAL MATCH (a)-[:POSSESSES]->(w:WeaponSystem)
      OPTIONAL MATCH (a)-[:PARTY_TO]->(t:Treaty)
      OPTIONAL MATCH (a)-[:OPERATES]->(f:NuclearFacility)
      RETURN a,
        collect(DISTINCT s) AS signals,
        collect(DISTINCT w) AS weapons,
        collect(DISTINCT t) AS treaties,
        collect(DISTINCT f) AS facilities
    `,
    params: { actorId },
  }
}

// ---------------------------------------------------------------------------
// Graph query (for visualization)
// ---------------------------------------------------------------------------

export function nuclearGraphQuery(limit: number) {
  return {
    cypher: `
      MATCH (s:NuclearSignal)
      WITH s ORDER BY s.date DESC LIMIT $limit
      OPTIONAL MATCH (s)-[r1:INVOLVES]->(a:NuclearActor)
      OPTIONAL MATCH (s)-[r2:REFERENCES_SYSTEM]->(w:WeaponSystem)
      OPTIONAL MATCH (s)-[r3:REFERENCES_TREATY]->(t:Treaty)
      OPTIONAL MATCH (s)-[r4:LOCATED_AT]->(f:NuclearFacility)
      OPTIONAL MATCH (s)-[r5:ESCALATES]->(s2:NuclearSignal)
      RETURN s, r1, a, r2, w, r3, t, r4, f, r5, s2
    `,
    params: { limit: neo4j.int(limit) },
  }
}

// ---------------------------------------------------------------------------
// Briefing queries
// ---------------------------------------------------------------------------

export function latestBriefingQuery() {
  return {
    cypher: `
      MATCH (b:RiskBriefing)
      RETURN b
      ORDER BY b.date DESC
      LIMIT 1
    `,
    params: {},
  }
}

export function briefingByDateQuery(date: string) {
  return {
    cypher: `
      MATCH (b:RiskBriefing {date: $date})
      OPTIONAL MATCH (b)-[:SYNTHESIZES]->(s:NuclearSignal)
      RETURN b, collect(s) AS signals
    `,
    params: { date },
  }
}

// ---------------------------------------------------------------------------
// Seed data loading (MERGE for idempotency)
// ---------------------------------------------------------------------------

export const MERGE_ACTOR = `
  UNWIND $actors AS a
  MERGE (n:NuclearActor {id: a.id})
  SET n.name = a.name,
      n.slug = a.slug,
      n.actor_type = a.actor_type,
      n.nuclear_status = a.nuclear_status,
      n.description_en = a.description_en,
      n.description_es = a.description_es,
      n.tier = 'gold',
      n.confidence_score = 1.0,
      n.submitted_by = 'seed',
      n.created_at = datetime(),
      n.updated_at = datetime()
  RETURN count(n) AS count
`

export const MERGE_TREATY = `
  UNWIND $treaties AS t
  MERGE (n:Treaty {id: t.id})
  SET n.name = t.name,
      n.status = t.status,
      n.signed_date = t.signed_date,
      n.parties = t.parties,
      n.description_en = t.description_en,
      n.description_es = t.description_es,
      n.tier = 'gold',
      n.confidence_score = 1.0,
      n.submitted_by = 'seed',
      n.created_at = datetime(),
      n.updated_at = datetime()
  RETURN count(n) AS count
`

export const MERGE_WEAPON = `
  UNWIND $weapons AS w
  MERGE (n:WeaponSystem {id: w.id})
  SET n.name = w.name,
      n.category = w.category,
      n.operator_id = w.operator_id,
      n.description_en = w.description_en,
      n.range_km = w.range_km,
      n.warheads = w.warheads,
      n.tier = 'gold',
      n.confidence_score = 1.0,
      n.submitted_by = 'seed',
      n.created_at = datetime(),
      n.updated_at = datetime()
  RETURN count(n) AS count
`

export const MERGE_FACILITY = `
  UNWIND $facilities AS f
  MERGE (n:NuclearFacility {id: f.id})
  SET n.name = f.name,
      n.facility_type = f.facility_type,
      n.location = f.location,
      n.lat = f.lat,
      n.lng = f.lng,
      n.operator_id = f.operator_id,
      n.description_en = f.description_en,
      n.tier = 'gold',
      n.confidence_score = 1.0,
      n.submitted_by = 'seed',
      n.created_at = datetime(),
      n.updated_at = datetime()
  RETURN count(n) AS count
`

/** Link actors to their treaties */
export const MERGE_PARTY_TO = `
  UNWIND $rels AS r
  MATCH (a:NuclearActor {id: r.actor_id})
  MATCH (t:Treaty {id: r.treaty_id})
  MERGE (a)-[:PARTY_TO]->(t)
`

/** Link actors to their weapon systems */
export const MERGE_POSSESSES = `
  UNWIND $rels AS r
  MATCH (a:NuclearActor {id: r.actor_id})
  MATCH (w:WeaponSystem {id: r.weapon_id})
  MERGE (a)-[:POSSESSES]->(w)
`

/** Link actors to their facilities */
export const MERGE_OPERATES = `
  UNWIND $rels AS r
  MATCH (a:NuclearActor {id: r.actor_id})
  MATCH (f:NuclearFacility {id: r.facility_id})
  MERGE (a)-[:OPERATES]->(f)
`
