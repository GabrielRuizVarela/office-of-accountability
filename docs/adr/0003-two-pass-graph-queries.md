# ADR-0003: Two-Pass Graph Queries to Avoid Cartesian Products

**Status:** Accepted
**Date:** 2026-03-18
**Context:** Graph API endpoints that return nodes + relationships for visualization were causing O(n^2) result sets when matching multiple patterns in a single Cypher query (e.g., matching persons AND organizations AND their interconnections).

## Decision

Use two-pass queries for all graph visualization endpoints:

1. **Pass 1:** Fetch nodes matching the filter criteria (with LIMIT).
2. **Pass 2:** Fetch relationships between the returned node IDs only.

```cypher
// Pass 1: Get nodes
MATCH (n) WHERE n.caso = $caso RETURN n LIMIT $limit

// Pass 2: Get relationships between those nodes only
MATCH (a)-[r]->(b)
WHERE elementId(a) IN $nodeIds AND elementId(b) IN $nodeIds
RETURN r
```

## Rationale

- A single query `MATCH (a)-[r]->(b) WHERE ...` with multiple label patterns creates cartesian products that grow quadratically.
- Two passes keep each query linear and predictable.
- The 15s query timeout was being hit regularly with single-pass queries on cases with 1000+ nodes.

## Consequences

- Two round-trips to Neo4j per graph request (acceptable -- both are fast with indexes).
- Client receives complete subgraphs (no dangling edges).
- Pagination is on nodes, not edges -- edge count depends on density.
