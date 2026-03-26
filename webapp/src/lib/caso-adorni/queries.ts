/**
 * Neo4j Cypher queries for the Adorni investigation.
 *
 * All queries use parameterized Cypher (never interpolate user input).
 * LIMIT clauses use toInteger($limit) to avoid JS float issues.
 */

// ---------------------------------------------------------------------------
// Graph overview
// ---------------------------------------------------------------------------

/** Count nodes by label for caso-adorni */
export const NODE_COUNTS = `
  MATCH (n) WHERE n.caso_slug = 'caso-adorni'
  RETURN labels(n)[0] AS type, count(n) AS cnt
  ORDER BY cnt DESC
`

/** Relationship summary */
export const RELATIONSHIP_SUMMARY = `
  MATCH (a)-[r]->(b)
  WHERE a.caso_slug = 'caso-adorni' OR b.caso_slug = 'caso-adorni'
  RETURN type(r) AS rel, count(r) AS cnt
  ORDER BY cnt DESC
  LIMIT toInteger($limit)
`

/** Confidence tier breakdown */
export const CONFIDENCE_BREAKDOWN = `
  MATCH (n) WHERE n.caso_slug = 'caso-adorni'
  RETURN n.confidence_tier AS tier, count(n) AS cnt
  ORDER BY cnt DESC
`

// ---------------------------------------------------------------------------
// Subgraph for conexiones visualization
// ---------------------------------------------------------------------------

/** Get the Adorni network subgraph for force-graph visualization */
export const ADORNI_SUBGRAPH = `
  MATCH (p:Person {caso_slug: 'caso-adorni'})
  OPTIONAL MATCH (p)-[r1]->(target)
  WHERE target.caso_slug = 'caso-adorni' OR target:Company OR target:OffshoreEntity
  WITH p, collect(DISTINCT {
    node: target,
    rel: type(r1),
    relProps: properties(r1)
  }) AS connections
  RETURN p, connections
  ORDER BY size(connections) DESC
  LIMIT toInteger($limit)
`

/** Cross-investigation links - entities shared with other cases */
export const CROSS_INVESTIGATION_LINKS = `
  MATCH (a {caso_slug: 'caso-adorni'})-[:SAME_ENTITY]-(b)
  WHERE b.caso_slug <> 'caso-adorni'
  RETURN a.name AS adorni_entity,
         labels(a)[0] AS adorni_type,
         b.name AS linked_entity,
         labels(b)[0] AS linked_type,
         b.caso_slug AS linked_case
  ORDER BY linked_case, adorni_entity
`

// ---------------------------------------------------------------------------
// Money trails
// ---------------------------------------------------------------------------

/** Contracts awarded to Adorni-network entities */
export const NETWORK_CONTRACTS = `
  MATCH (p:Person {caso_slug: 'caso-adorni'})-[:ASSOCIATE_OF|OFFICER_OF_COMPANY*1..2]-(c:Company)
        -[:SAME_ENTITY]-(ct:Contractor)-[:AWARDED_TO]-(pc:PublicContract)
  WHERE pc.monto IS NOT NULL
  WITH p.name AS person, ct.name AS contractor, sum(pc.monto) AS total, count(pc) AS contracts
  ORDER BY total DESC
  LIMIT toInteger($limit)
  RETURN person, contractor, total, contracts
`

/** Statement-contract timing correlation */
export const STATEMENT_CONTRACT_CORRELATION = `
  MATCH (s:Statement {caso_slug: 'caso-adorni'})
  WITH s, date(s.date) AS stmt_date
  MATCH (pc:PublicContract)
  WHERE date(pc.fecha_adjudicacion) >= stmt_date
    AND date(pc.fecha_adjudicacion) <= stmt_date + duration({days: 30})
  RETURN s.claim_es AS statement, s.date AS statement_date,
         pc.descripcion AS contract, pc.monto AS amount,
         pc.fecha_adjudicacion AS contract_date
  ORDER BY s.date DESC
`

// ---------------------------------------------------------------------------
// Statement verification
// ---------------------------------------------------------------------------

/** Statements by verification status */
export const STATEMENTS_BY_STATUS = `
  MATCH (s:Statement {caso_slug: 'caso-adorni'})
  RETURN s.verified AS verified, count(s) AS cnt
`

/** Latest statements */
export const LATEST_STATEMENTS = `
  MATCH (s:Statement {caso_slug: 'caso-adorni'})
  RETURN s
  ORDER BY s.date DESC
  LIMIT toInteger($limit)
`
