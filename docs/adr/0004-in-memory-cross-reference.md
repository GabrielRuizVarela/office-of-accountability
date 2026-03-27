# ADR-0004: In-Memory Map Joins for Cross-Reference Engine

**Status:** Accepted
**Date:** 2026-03-19
**Context:** The CUIT/DNI entity resolution engine needs to match entities across 56,000+ contractors, politicians, donors, and offshore entities. Cypher-based cartesian joins (`MATCH (a), (b) WHERE a.cuit = b.cuit`) timeout on datasets this size.

## Decision

Load relevant node properties into JavaScript Maps, perform matching in-memory, then batch-write results back to Neo4j.

```typescript
// Load into Maps
const contractorsByCuit = new Map<string, ContractorNode[]>()
const donorsByCuit = new Map<string, DonorNode[]>()

// Match in memory
for (const [cuit, contractors] of contractorsByCuit) {
  const donors = donorsByCuit.get(cuit)
  if (donors) matches.push({ ... })
}

// Batch write matches
await batchCreateRelationships(matches)
```

## Rationale

- **Speed:** In-memory Map lookups are O(1) per key. The full cross-reference runs in <5s vs. timing out at 15s with Cypher.
- **Memory:** 56K nodes with 3-4 properties each fits comfortably in ~50MB of heap.
- **Flexibility:** JavaScript allows fuzzy matching (Levenshtein) that Cypher cannot express efficiently.

## Consequences

- Cross-reference scripts require enough RAM to hold the working set (~50-200MB depending on case).
- Fuzzy name matching is capped at 10K targets to prevent O(n*m) blowup.
- Results must always be verified against document IDs (fuzzy matches produce false positives).
