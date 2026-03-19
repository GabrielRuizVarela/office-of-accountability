# Como Voto ETL Extension — Design Spec

**Date:** 2026-03-19
**Branch:** worktree-epstein
**Scope:** Extend the existing Como Voto ETL pipeline to ingest Terms, Legislation, and Election data

## Context

The Como Voto ETL pipeline (`webapp/src/etl/como-voto/`) ingests Argentine legislative voting data from [rquiroga7/Como_voto](https://github.com/rquiroga7/Como_voto) into Neo4j. The current pipeline loads Politicians, Parties, Provinces, LegislativeVotes, and three relationship types (MEMBER_OF, REPRESENTS, CAST_VOTE).

Three data sources are available but not yet ingested:

1. **Terms** — career timeline per legislator (already fetched in detail files, not loaded)
2. **Law names** — `law_names.json` with ~2,400 named laws; plus `gk`/`ln` fields in vote detail data
3. **Election data** — `election_legislators.json` with legislators by election year since 1983

## Approach

Extend the existing pipeline in-place. No new entry points — `npm run etl:como-voto` continues to run everything in one idempotent pass.

## New Neo4j Schema

### New Nodes

| Label | Primary Key | Properties |
|-------|-------------|------------|
| `Term` | `id` (`{politician-slug}--{chamber}-{yf}-{yt}`) | `chamber`, `year_from`, `year_to`, `bloc`, `province`, `coalition`, + provenance |
| `Legislation` | `id` (slugified from `group_key` or law name) | `name`, `group_key`, `slug`, + provenance |
| `Election` | `id` (`election-{year}`) | `year`, `slug`, + provenance |

### New Relationships

| Type | Direction | Properties |
|------|-----------|------------|
| `SERVED_TERM` | Politician → Term | — |
| `TERM_PARTY` | Term → Party | — |
| `TERM_PROVINCE` | Term → Province | — |
| `VOTE_ON` | LegislativeVote → Legislation | — |
| `RAN_IN` | Politician → Election | `alliance`, `province`, `coalition`, `party_code` |

### Modified Existing Nodes

| Node | New Property |
|------|-------------|
| `LegislativeVote` | `law_name` (string, from `law_names.json` or vote `ln` field) |

## Data Flow

### Fetcher Additions

- `fetchLawNames()` — downloads `docs/data/law_names.json`, returns array of law name strings
- `fetchElectionLegislators()` — downloads `data/election_legislators.json`, returns legislators grouped by election year

Terms require no new fetching — already present in `LegislatorDetail.terms[]`.

### Transformer Additions

- `transformTerms(detail: LegislatorDetail)` → `TermParams[]` + `ServedTermRelParams[]` + `TermPartyRelParams[]` + `TermProvinceRelParams[]`
- `transformLegislation(lawNames, details)` → `LegislationParams[]` + `VoteOnRelParams[]`. Also produces `law_name` property values for patching `LegislativeVote` nodes.
- `transformElections(electionData)` → `ElectionParams[]` + `RanInRelParams[]` (matches election entries to existing Politician slugs)

### Loader Execution Order

1. **Existing nodes:** Politician, Party, Province, LegislativeVote (unchanged)
2. **New nodes:** Term, Legislation, Election
3. **Existing rels:** MEMBER_OF, REPRESENTS, CAST_VOTE (unchanged)
4. **New rels:** SERVED_TERM, TERM_PARTY, TERM_PROVINCE, VOTE_ON, RAN_IN
5. **Patch step:** Update `law_name` property on existing LegislativeVote nodes

Everything runs in one `loadAll()` call. `TransformResult` is extended with the new arrays.

## Matching & Disambiguation

### Election → Politician Matching

Election data uses display names (`"Roberto Pedro Álvarez"`) while Politician nodes use uppercase name keys (`"ALVAREZ, ROBERTO PEDRO"`). Matching strategy:

1. **Name + Province** — normalize both sides (strip diacritics, lowercase, sort name parts). Most collisions resolve here.
2. **Name + Province + Year overlap** — if province also collides, check if election year falls within a politician's known term range.
3. **Unresolved** — skip with warning log. Don't create a wrong relationship.

Existing data has zero name_key or slug collisions among 2,258 politicians (verified).

### Legislation Grouping

- Primary key: `gk` (group key) field from vote detail files — groups related votes on same law
- Law name: first try `ln` field from vote data, then fall back to `law_names.json` lookup
- Votes without `gk`: no `VOTE_ON` relationship (standalone procedural votes)

### Edge Cases

- `gk` and `ln` are optional — many votes won't have them
- Overlapping terms (e.g. diputados 2015-2019 then senadores 2019-2023) — handled by compound key
- Pre-1993 election entries with no matching Politician node — skip `RAN_IN` rel, log warning

## Files Modified

| File | Change |
|------|--------|
| `src/etl/como-voto/types.ts` | Add Zod schemas for law_names, election_legislators; add TermParams, LegislationParams, ElectionParams, and new rel param interfaces |
| `src/etl/como-voto/fetcher.ts` | Add `fetchLawNames()`, `fetchElectionLegislators()` |
| `src/etl/como-voto/transformer.ts` | Add `transformTerms()`, `transformLegislation()`, `transformElections()`; extend `TransformResult` and `transformAll()` |
| `src/etl/como-voto/loader.ts` | Add loaders for 3 new node types, 5 new rel types, and the law_name patch step; extend `loadAll()` |
| `scripts/run-etl-como-voto.ts` | Fetch law_names and election data alongside existing fetches; pass to `transformAll()` |

## Non-Goals

- Investigation pages (separate spec)
- Modifying existing node/relationship data
- New API routes or UI components
