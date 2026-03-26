# Como Voto ETL Extension - Design Spec

**Date:** 2026-03-19
**Branch:** worktree-epstein
**Scope:** Extend the existing Como Voto ETL pipeline to ingest Terms, Legislation, and Election data

## Context

The Como Voto ETL pipeline (`webapp/src/etl/como-voto/`) ingests Argentine legislative voting data from [rquiroga7/Como_voto](https://github.com/rquiroga7/Como_voto) into Neo4j. The current pipeline loads Politicians, Parties, Provinces, LegislativeVotes, and three relationship types (MEMBER_OF, REPRESENTS, CAST_VOTE).

Three data sources are available but not yet ingested:

1. **Terms** - career timeline per legislator (already fetched in detail files, not loaded)
2. **Law names** - `law_names.json` with ~2,400 named laws; plus `gk`/`ln` fields in vote detail data
3. **Election data** - `election_legislators.json` with legislators by election year since 1983

## Approach

Extend the existing pipeline in-place. No new entry points - `npm run etl:como-voto` continues to run everything in one idempotent pass.

## New Neo4j Schema

### New Nodes

| Label | Primary Key | Properties |
|-------|-------------|------------|
| `Term` | `id` (`{politician-slug}--{chamber}-{yearFrom}-{yearTo}`) | `chamber`, `year_from`, `year_to`, `bloc`, `province`, `coalition`, + provenance |
| `Legislation` | `id` (slugified from `group_key` - always canonical) | `name`, `group_key`, `slug`, + provenance |
| `Election` | `id` (`election-{year}`) | `year`, `slug`, + provenance |

### New Relationships

| Type | Direction | Properties |
|------|-----------|------------|
| `SERVED_TERM` | Politician → Term | - |
| `TERM_PARTY` | Term → Party | - |
| `TERM_PROVINCE` | Term → Province | - |
| `VOTE_ON` | LegislativeVote → Legislation | (matched via `acta_id`) |
| `RAN_IN` | Politician → Election | `alliance`, `province`, `coalition`, `party_code` |

### Modified Existing Nodes

| Node | New Property |
|------|-------------|
| `LegislativeVote` | `law_name` (string, from vote `ln` field or `law_names.json` lookup) |

### New Indexes/Constraints

Create uniqueness constraints for `Term(id)`, `Legislation(id)`, `Election(id)` to support MERGE performance and data integrity.

## Source Data Schemas

### `law_names.json`

URL: `https://raw.githubusercontent.com/rquiroga7/Como_voto/main/docs/data/law_names.json`

Structure: `string[]` - a flat array of ~2,400 law name strings. These are display names only; mapping to specific votes is done via the `gk` (group key) and `ln` (law name) fields in per-legislator vote detail data, not via this file directly. This file serves as a fallback lookup when a vote's `ln` field is missing but its `gk` matches a known law.

Zod schema: `z.array(z.string())`

### `election_legislators.json`

URL: `https://raw.githubusercontent.com/rquiroga7/Como_voto/main/data/election_legislators.json`

**Note:** This file lives under `data/`, not `docs/data/`. Different directory from the existing fetcher's `BASE_URL`.

Structure: `Record<string, Record<string, ElectionEntry[]>>` - keyed by election year, then by chamber (`"diputados"`, `"senadores"`).

```typescript
interface ElectionEntry {
  name: string        // Display name: "Roberto Pedro Álvarez"
  province: string    // Province represented
  alliance: string    // Electoral alliance (can differ from legislative bloc)
  coalition: string   // Coalition code (PJ, UCR, PRO, LLA, OTROS)
  party_code: string | null  // Party identifier, nullable
}
```

Zod schema:
```typescript
const ElectionEntrySchema = z.object({
  name: z.string(),
  province: z.string(),
  alliance: z.string(),
  coalition: z.string(),
  party_code: z.string().nullable(),
})

const ElectionLegislatorsFileSchema = z.record(
  z.string(),  // year
  z.record(z.string(), z.array(ElectionEntrySchema))  // chamber -> entries
)
```

### Terms (existing - `LegislatorDetail.terms[]`)

Already defined in `types.ts` as `TermSchema`. Each entry: `{ch, yf, yt, b, p, co}`.

## Data Flow

### Fetcher Additions

- `fetchLawNames(signal?)` - `GET docs/data/law_names.json` via existing `BASE_URL`
- `fetchElectionLegislators(signal?)` - `GET data/election_legislators.json` via a separate URL (different base path: `https://raw.githubusercontent.com/rquiroga7/Como_voto/main/data/election_legislators.json`)

Terms require no new fetching - already present in `LegislatorDetail.terms[]`.

### Transformer Additions

**`TransformInput` extension:**
```typescript
interface TransformInput {
  // existing
  readonly legislators: readonly CompactLegislator[]
  readonly details: readonly LegislatorDetail[]
  readonly sessions: readonly VotingSession[]
  // new
  readonly lawNames: readonly string[]
  readonly electionData: Record<string, Record<string, ElectionEntry[]>>
}
```

**`transformTerms(detail: LegislatorDetail)`** → For each term in `detail.terms[]`, produce:
- `TermParams` node with compound key
- `ServedTermRelParams` (Politician → Term)
- `TermPartyRelParams` (Term → Party, matched by slugifying `term.b`)
- `TermProvinceRelParams` (Term → Province, matched by slugifying `term.p`)

If a term's `bloc` or `province` value doesn't match an existing Party/Province slug from the compact legislator list, the transformer also emits new Party/Province params to ensure the target nodes exist.

**`transformLegislation(details, lawNames)`** → Scans all vote detail `gk` fields to build Legislation nodes:
- `Legislation.id` = `slugify(gk)` - always derived from `gk`, never from law name (avoids duplicate nodes)
- `Legislation.name` = first non-empty `ln` value found for that `gk`, or fall back to matching entry in `lawNames` array
- Produces `VoteOnRelParams` linking `LegislativeVote` (via `acta_id`) → `Legislation` (via `id`)
- Produces `LawNamePatchParams` mapping `acta_id` → `law_name` string for the patch step

**`transformElections(electionData, politicians)`** → For each election year + entry:
- `ElectionParams` node with key `election-{year}`
- Match entry to Politician using the disambiguation strategy (see below)
- `RanInRelParams` with alliance, province, coalition, party_code as properties

### Loader Execution Order

1. **Existing nodes:** Politician, Party, Province, LegislativeVote (unchanged)
2. **New nodes:** Term, Legislation, Election
3. **Existing rels:** MEMBER_OF, REPRESENTS, CAST_VOTE (unchanged)
4. **New rels:** SERVED_TERM, TERM_PARTY, TERM_PROVINCE, VOTE_ON, RAN_IN
5. **Patch step:** Update `law_name` on LegislativeVote nodes (matched via `acta_id`)

**VOTE_ON loader Cypher:**
```cypher
UNWIND $batch AS r
MATCH (v:LegislativeVote {acta_id: r.acta_id})
MATCH (l:Legislation {id: r.legislation_id})
MERGE (v)-[:VOTE_ON]->(l)
```

**Law name patch Cypher:**
```cypher
UNWIND $batch AS r
MATCH (v:LegislativeVote {acta_id: r.acta_id})
SET v.law_name = r.law_name
```

Everything runs in one `loadAll()` call. `TransformResult` is extended with the new arrays.

## Matching & Disambiguation

### Election → Politician Matching

Election data uses display names (`"Roberto Pedro Álvarez"`) while Politician nodes use uppercase name keys (`"ALVAREZ, ROBERTO PEDRO"`). Matching strategy:

1. **Name + Province** - normalize both sides (strip diacritics, lowercase, sort name parts). Most collisions resolve here.
2. **Name + Province + Year overlap** - if province also collides, check if election year falls within a politician's known term range.
3. **Unresolved** - skip with warning log. Don't create a wrong relationship.

Existing data has zero name_key or slug collisions among 2,258 politicians (verified). But election data uses a different name format, so compound matching (name + province) is essential to avoid false matches.

### Legislation Grouping

- Canonical key: always `slugify(gk)` - the `gk` (group key) is the single source of truth for Legislation identity
- Display name: `ln` field from vote data (first non-empty value per `gk`), with `law_names.json` as fallback
- Votes without `gk`: no `VOTE_ON` relationship (standalone procedural votes), but may still get `law_name` property if their `ln` field is populated

### Edge Cases

- `gk` and `ln` are optional fields on votes - many votes won't have them, that's expected
- Overlapping terms (e.g. diputados 2015-2019 then senadores 2019-2023) - handled by compound key including chamber
- Pre-1993 election entries with no matching Politician node - skip `RAN_IN` rel, log warning
- Term bloc values not in existing Party list - transformer emits additional Party nodes
- Term province values not in existing Province list - transformer emits additional Province nodes
- `party_code` on `RAN_IN` is an electoral code, distinct from the legislative bloc/Party node - stored as relationship property, not linked to a Party node

## Files Modified

| File | Change |
|------|--------|
| `src/etl/como-voto/types.ts` | Add `ElectionEntrySchema`, `ElectionLegislatorsFileSchema`, `LawNamesFileSchema`; add `TermParams`, `LegislationParams`, `ElectionParams`, `ServedTermRelParams`, `TermPartyRelParams`, `TermProvinceRelParams`, `VoteOnRelParams`, `RanInRelParams`, `LawNamePatchParams` interfaces |
| `src/etl/como-voto/fetcher.ts` | Add `fetchLawNames()`, `fetchElectionLegislators()` |
| `src/etl/como-voto/transformer.ts` | Add `transformTerms()`, `transformLegislation()`, `transformElections()`; extend `TransformInput`, `TransformResult`, and `transformAll()` |
| `src/etl/como-voto/loader.ts` | Add loaders for 3 new node types, 5 new rel types, and the law_name patch step; extend `loadAll()` |
| `scripts/run-etl-como-voto.ts` | Fetch law_names and election data alongside existing fetches; pass to `transformAll()` |

## Non-Goals

- Investigation pages (separate spec)
- Modifying existing node/relationship data structure
- New API routes or UI components
