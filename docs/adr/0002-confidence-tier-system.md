# ADR-0002: Gold/Silver/Bronze Confidence Tier System

**Status:** Accepted
**Date:** 2026-03-13
**Context:** Investigation data comes from multiple sources of varying reliability -- manual curation, government APIs, third-party aggregations, OCR'd handwritten documents. Users need to distinguish verified facts from unverified leads.

## Decision

Every node in the graph carries a `confidence_tier` property with one of three values:

| Tier | Standard | Promotion Path |
|------|----------|---------------|
| **Gold** | Manually curated from primary sources, cross-referenced against 2+ independent sources | Manual review only |
| **Silver** | Verified via web research against credible sources (courts, major news, official records) | `/investigate-loop` or manual review |
| **Bronze** | Raw ingested from external data, not independently verified | Verification cycle or community contribution |

## Rationale

- **Three tiers is enough.** More granular scoring (1-10) creates false precision. Three tiers map to clear editorial decisions: publish (gold), cite with attribution (silver), flag as unverified (bronze).
- **Bronze stays in the graph.** Unverified data may still contain real leads. Removing it loses information. Instead, bronze nodes render with reduced opacity in the UI.
- **Promotion is one-way up.** Tiers never downgrade automatically. If data is found to be wrong, the node is removed or flagged, not demoted.

## Consequences

- All ETL pipelines must assign a tier at ingestion time.
- UI components must respect tiers (opacity, badges, filter dropdowns).
- All Cypher queries that surface data to users should accept tier filters.
- The `/investigate-loop` skill can promote bronze to silver but never to gold.
