# ADR-0001: Neo4j as Primary Database

**Status:** Accepted
**Date:** 2026-03-13
**Context:** Investigation platform needs to model complex relationships between persons, organizations, documents, financial flows, and events across multiple cases.

## Decision

Use Neo4j 5 Community Edition as the sole database, accessed via `neo4j-driver-lite` (ESM/browser-compatible build).

## Rationale

- **Graph-native queries**: Relationship traversal (shortest paths, N-hop neighborhoods, co-occurrence) is the core use case. Cypher expresses these naturally vs. recursive SQL CTEs.
- **Schema flexibility**: Each investigation (caso) introduces new node labels and relationship types without migrations.
- **Community Edition**: Free, sufficient for single-instance deployment. No clustering needed at current scale.
- **neo4j-driver-lite**: ESM-compatible, works in Cloudflare Workers and browser bundles (unlike the full driver).

## Consequences

- No ACID transactions across multiple databases -- everything lives in one Neo4j instance.
- `LIMIT` clauses require `neo4j.int(n)` or `toInteger($limit)` because JS numbers are IEEE 754 floats.
- Large cartesian joins timeout -- the cross-reference engine uses in-memory Map joins instead of Cypher.
- Backup/restore is Neo4j-specific (`neo4j-admin dump/load`).
