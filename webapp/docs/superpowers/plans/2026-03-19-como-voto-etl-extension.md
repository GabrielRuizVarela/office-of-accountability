# Como Voto ETL Extension - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Como Voto ETL pipeline to ingest Terms, Legislation, and Election data into Neo4j.

**Architecture:** Add new types, fetchers, transformers, and loaders to the existing `webapp/src/etl/como-voto/` module. The runner script fetches two new JSON files alongside existing data, transforms everything in one pass, and loads in dependency order. No new entry points - `npm run etl:como-voto` runs everything.

**Tech Stack:** TypeScript, Zod v4, neo4j-driver-lite, Node.js fetch API

**Spec:** `webapp/docs/superpowers/specs/2026-03-19-como-voto-etl-extension-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/etl/como-voto/types.ts` | Add Zod schemas (`ElectionEntrySchema`, `ElectionLegislatorsFileSchema`, `LawNamesFileSchema`) and Neo4j param interfaces (`TermParams`, `LegislationParams`, `ElectionParams`, 5 rel param types, `LawNamePatchParams`) |
| `src/etl/como-voto/fetcher.ts` | Add `fetchLawNames()` and `fetchElectionLegislators()` |
| `src/etl/como-voto/transformer.ts` | Add `transformTerms()`, `transformLegislation()`, `transformElections()`, `normalizeName()`; extend `TransformInput`, `TransformResult`, `transformAll()` |
| `src/etl/como-voto/loader.ts` | Add 3 node loaders, 5 rel loaders, 1 patch loader; extend `loadAll()` |
| `src/etl/como-voto/index.ts` | Re-export new types and functions |
| `scripts/run-etl-como-voto.ts` | Fetch new data sources; pass to `transformAll()`; print new counts |

---

### Task 1: Add new Zod schemas and param interfaces to types.ts

**Files:**
- Modify: `webapp/src/etl/como-voto/types.ts`

**Note:** Find insertion points by searching for the content markers (e.g., `VotingSessionsFileSchema`), not by line numbers - line numbers shift after each insertion.

- [ ] **Step 1: Add LawNamesFileSchema**

After the `VotingSessionsFileSchema` definition, add:

```typescript
/** Law names file - flat array of law name strings */
export const LawNamesFileSchema = z.array(z.string())
```

- [ ] **Step 2: Add ElectionEntrySchema and ElectionLegislatorsFileSchema**

```typescript
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
```

- [ ] **Step 3: Add new Neo4j param interfaces**

After the existing `RepresentsRelParams` interface, add:

```typescript
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
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to the new types

- [ ] **Step 5: Commit**

```bash
git add webapp/src/etl/como-voto/types.ts
git commit -m "feat(etl): add Term, Legislation, Election schemas and param types"
```

---

### Task 2: Add new fetchers

**Files:**
- Modify: `webapp/src/etl/como-voto/fetcher.ts`

- [ ] **Step 1: Add imports for new schemas**

Update the import line at the top of fetcher.ts to include:

```typescript
import {
  LegislatorsFileSchema,
  VotingSessionsFileSchema,
  LegislatorDetailSchema,
  LawNamesFileSchema,
  ElectionLegislatorsFileSchema,
} from './types'
import type {
  CompactLegislator,
  LegislatorDetail,
  VotingSession,
  ElectionLegislatorsFile,
} from './types'
```

- [ ] **Step 2: Add URL constants**

After the existing URL constants (line 16), add:

```typescript
const LAW_NAMES_URL = `${BASE_URL}/law_names.json`
const ELECTION_LEGISLATORS_URL =
  'https://raw.githubusercontent.com/rquiroga7/Como_voto/main/data/election_legislators.json'
```

- [ ] **Step 3: Add fetchLawNames function**

After `fetchVotingSessions` (line 77), add:

```typescript
export interface FetchLawNamesResult {
  readonly lawNames: readonly string[]
  readonly count: number
}

/**
 * Fetch and validate the law_names.json file.
 * Returns a flat array of law name display strings.
 */
export async function fetchLawNames(signal?: AbortSignal): Promise<FetchLawNamesResult> {
  const raw = await fetchJson<unknown>(LAW_NAMES_URL, signal)
  const lawNames = LawNamesFileSchema.parse(raw)

  return {
    lawNames,
    count: lawNames.length,
  }
}
```

- [ ] **Step 4: Add fetchElectionLegislators function**

```typescript
export interface FetchElectionLegislatorsResult {
  readonly electionData: ElectionLegislatorsFile
  readonly yearCount: number
}

/**
 * Fetch and validate the election_legislators.json file.
 * Returns election data keyed by year, then by chamber.
 */
export async function fetchElectionLegislators(
  signal?: AbortSignal,
): Promise<FetchElectionLegislatorsResult> {
  const raw = await fetchJson<unknown>(ELECTION_LEGISLATORS_URL, signal)
  const electionData = ElectionLegislatorsFileSchema.parse(raw)

  return {
    electionData,
    yearCount: Object.keys(electionData).length,
  }
}
```

- [ ] **Step 5: Verify fetchers work**

Run: `cd webapp && npx tsx -e "
import 'dotenv/config'
import { fetchLawNames, fetchElectionLegislators } from './src/etl/como-voto/fetcher'
async function main() {
  const ln = await fetchLawNames()
  console.log('Law names:', ln.count)
  console.log('Sample:', ln.lawNames.slice(0, 3))
  const el = await fetchElectionLegislators()
  console.log('Election years:', el.yearCount)
  console.log('Years:', Object.keys(el.electionData).sort().join(', '))
}
main()
"`

Expected: Law names count ~2400, election years count > 10, list of years from 1983+

- [ ] **Step 6: Commit**

```bash
git add webapp/src/etl/como-voto/fetcher.ts
git commit -m "feat(etl): add fetchLawNames and fetchElectionLegislators"
```

---

### Task 3: Add transformer for Terms

**Files:**
- Modify: `webapp/src/etl/como-voto/transformer.ts`

- [ ] **Step 1: Add new type imports**

Update the import block to include:

```typescript
import type {
  // ... existing imports ...
  TermNodeParams,
  ServedTermRelParams,
  TermPartyRelParams,
  TermProvinceRelParams,
} from './types'
```

- [ ] **Step 2: Add transformTerms function**

After the existing relationship transformers section (after `transformRepresents`, line 230), add:

```typescript
// ---------------------------------------------------------------------------
// Term transformers
// ---------------------------------------------------------------------------

export interface TermTransformResult {
  readonly terms: readonly TermNodeParams[]
  readonly servedTermRels: readonly ServedTermRelParams[]
  readonly termPartyRels: readonly TermPartyRelParams[]
  readonly termProvinceRels: readonly TermProvinceRelParams[]
  readonly additionalParties: readonly PartyParams[]
  readonly additionalProvinces: readonly ProvinceParams[]
}

/** Transform a legislator's terms into Term nodes and relationships */
export function transformTerms(
  detail: LegislatorDetail,
  existingPartySlugs: ReadonlySet<string>,
  existingProvinceSlugs: ReadonlySet<string>,
): TermTransformResult {
  const politicianSlug = slugify(detail.name_key)
  const terms: TermNodeParams[] = []
  const servedTermRels: ServedTermRelParams[] = []
  const termPartyRels: TermPartyRelParams[] = []
  const termProvinceRels: TermProvinceRelParams[] = []
  const additionalParties: PartyParams[] = []
  const additionalProvinces: ProvinceParams[] = []
  const seenParties = new Set<string>()
  const seenProvinces = new Set<string>()

  for (const term of detail.terms) {
    const termId = `${politicianSlug}--${term.ch}-${term.yf}-${term.yt}`
    const partySlug = slugify(term.b)
    const provinceSlug = slugify(term.p)

    terms.push({
      ...buildProvenance(`term:${termId}`),
      id: termId,
      chamber: term.ch,
      year_from: term.yf,
      year_to: term.yt,
      bloc: term.b,
      province: term.p,
      coalition: term.co,
    })

    servedTermRels.push({ politician_id: politicianSlug, term_id: termId })
    termPartyRels.push({ term_id: termId, party_id: partySlug })
    termProvinceRels.push({ term_id: termId, province_id: provinceSlug })

    // Emit new Party if not in existing set
    if (!existingPartySlugs.has(partySlug) && !seenParties.has(partySlug)) {
      seenParties.add(partySlug)
      additionalParties.push({
        ...buildProvenance(`party:${term.b}`),
        id: partySlug,
        name: term.b,
        slug: partySlug,
      })
    }

    // Emit new Province if not in existing set
    if (!existingProvinceSlugs.has(provinceSlug) && !seenProvinces.has(provinceSlug)) {
      seenProvinces.add(provinceSlug)
      additionalProvinces.push({
        ...buildProvenance(`province:${term.p}`),
        id: provinceSlug,
        name: term.p,
        slug: provinceSlug,
      })
    }
  }

  return { terms, servedTermRels, termPartyRels, termProvinceRels, additionalParties, additionalProvinces }
}
```

Note: `buildProvenance` is already defined in the file (line 68). `slugify` is also already available.

- [ ] **Step 3: Verify it compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add webapp/src/etl/como-voto/transformer.ts
git commit -m "feat(etl): add transformTerms for career timeline data"
```

---

### Task 4: Add transformer for Legislation

**Files:**
- Modify: `webapp/src/etl/como-voto/transformer.ts`

- [ ] **Step 1: Add new type imports**

Add to the existing import block:

```typescript
import type {
  // ... existing ...
  LegislationParams,
  VoteOnRelParams,
  LawNamePatchParams,
  LegislatorVote,
} from './types'
```

- [ ] **Step 2: Add transformLegislation function**

```typescript
// ---------------------------------------------------------------------------
// Legislation transformers
// ---------------------------------------------------------------------------

export interface LegislationTransformResult {
  readonly legislation: readonly LegislationParams[]
  readonly voteOnRels: readonly VoteOnRelParams[]
  readonly lawNamePatches: readonly LawNamePatchParams[]
}

/**
 * Build Legislation nodes from vote group keys, VOTE_ON rels, and law_name patches.
 *
 * - Legislation identity is always derived from `gk` (group key)
 * - Display name: first non-empty `ln` per gk, then lawNames fallback, then raw gk
 * - Votes without `gk` get no VOTE_ON rel but may still get law_name from `ln`
 */
export function transformLegislation(
  details: readonly LegislatorDetail[],
  lawNames: readonly string[],
): LegislationTransformResult {
  // Build a Set of law names for O(1) fallback lookup
  const lawNameSet = new Set(lawNames)

  // Track: slugified id → raw gk, and gk → best display name
  const idToGk = new Map<string, string>()
  const gkToName = new Map<string, string>()
  const voteOnRels: VoteOnRelParams[] = []
  const lawNamePatches: LawNamePatchParams[] = []
  const seenVoteOn = new Set<string>()

  for (const detail of details) {
    for (const vote of detail.votes) {
      // Patch law_name if ln is present (regardless of gk)
      if (vote.ln && vote.ln.trim() !== '') {
        lawNamePatches.push({ acta_id: vote.vid, law_name: vote.ln.trim() })
      }

      // Build Legislation nodes and VOTE_ON rels only when gk exists
      if (vote.gk && vote.gk.trim() !== '') {
        const gk = vote.gk.trim()
        const legislationId = slugify(gk)

        // Preserve raw gk for node creation
        if (!idToGk.has(legislationId)) {
          idToGk.set(legislationId, gk)
        }

        // Track best name: prefer ln field
        if (!gkToName.has(gk) && vote.ln && vote.ln.trim() !== '') {
          gkToName.set(gk, vote.ln.trim())
        }

        // Dedup VOTE_ON: one rel per (acta_id, legislation_id)
        const relKey = `${vote.vid}::${legislationId}`
        if (!seenVoteOn.has(relKey)) {
          seenVoteOn.add(relKey)
          voteOnRels.push({ acta_id: vote.vid, legislation_id: legislationId })
        }
      }
    }
  }

  // Build Legislation nodes from all collected gk values
  const legislation: LegislationParams[] = []
  for (const [id, gk] of idToGk.entries()) {
    // Name resolution: ln field > lawNames fallback > raw gk
    let name = gkToName.get(gk)
    if (!name && lawNameSet.has(gk)) {
      name = gk // gk itself appears in lawNames - use it as display name
    }

    legislation.push({
      ...buildProvenance(`legislation:${gk}`),
      id,
      name: name || gk,
      group_key: gk,
      slug: id,
    })
  }

  // Dedup lawNamePatches by acta_id (keep first)
  const seenActa = new Set<string>()
  const dedupedPatches = lawNamePatches.filter((p) => {
    if (seenActa.has(p.acta_id)) return false
    seenActa.add(p.acta_id)
    return true
  })

  return { legislation, voteOnRels, lawNamePatches: dedupedPatches }
}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add webapp/src/etl/como-voto/transformer.ts
git commit -m "feat(etl): add transformLegislation for law grouping and naming"
```

---

### Task 5: Add transformer for Elections

**Files:**
- Modify: `webapp/src/etl/como-voto/transformer.ts`

- [ ] **Step 1: Add new type imports**

Add to the import block:

```typescript
import type {
  // ... existing ...
  ElectionEntry,
  ElectionParams,
  RanInRelParams,
  TermNodeParams,
} from './types'
```

Note: `TermNodeParams` is needed for the year-overlap disambiguation in `transformElections`.

- [ ] **Step 2: Add normalizeName helper**

In the helpers section (after `slugify`, around line 46):

```typescript
/**
 * Normalize a name for fuzzy matching.
 * Strips diacritics, lowercases, removes punctuation, sorts parts alphabetically.
 * "Roberto Pedro Álvarez" → "alvarez pedro roberto"
 * "ALVAREZ, ROBERTO PEDRO" → "alvarez pedro roberto"
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(' ')
}
```

- [ ] **Step 3: Add transformElections function**

```typescript
// ---------------------------------------------------------------------------
// Election transformers
// ---------------------------------------------------------------------------

export interface ElectionTransformResult {
  readonly elections: readonly ElectionParams[]
  readonly ranInRels: readonly RanInRelParams[]
  readonly unmatchedCount: number
}

/**
 * Transform election data into Election nodes and RAN_IN relationships.
 *
 * Matches election entries to existing Politicians using:
 * 1. Normalized name + province (most collisions resolve here)
 * 2. Name + province + year overlap with known terms (resolves ambiguity)
 * 3. Skip with warning if still ambiguous or unmatched
 */
export function transformElections(
  electionData: Record<string, Record<string, ElectionEntry[]>>,
  politicians: readonly PoliticianParams[],
  terms: readonly TermNodeParams[],
): ElectionTransformResult {
  // Build lookup: normalized(name + province) → politician slug(s)
  const lookup = new Map<string, string[]>()
  for (const p of politicians) {
    const key = `${normalizeName(p.full_name)}::${normalizeName(p.province)}`
    const existing = lookup.get(key) || []
    existing.push(p.id)
    lookup.set(key, existing)
  }

  // Build term lookup: politician slug → array of {year_from, year_to}
  const termsByPolitician = new Map<string, Array<{ year_from: number; year_to: number }>>()
  for (const t of terms) {
    // Extract politician slug from term id: "politician-slug--chamber-yf-yt"
    const politicianSlug = t.id.split('--')[0]
    const existing = termsByPolitician.get(politicianSlug) || []
    existing.push({ year_from: t.year_from, year_to: t.year_to })
    termsByPolitician.set(politicianSlug, existing)
  }

  const elections: ElectionParams[] = []
  const ranInRels: RanInRelParams[] = []
  const seenElectionIds = new Set<string>()
  let unmatchedCount = 0

  for (const [year, chambers] of Object.entries(electionData)) {
    const electionId = `election-${year}`
    const electionYear = parseInt(year, 10)

    if (!seenElectionIds.has(electionId)) {
      seenElectionIds.add(electionId)
      elections.push({
        ...buildProvenance(`election:${year}`),
        id: electionId,
        year: electionYear,
        slug: electionId,
      })
    }

    for (const entries of Object.values(chambers)) {
      for (const entry of entries) {
        const key = `${normalizeName(entry.name)}::${normalizeName(entry.province)}`
        const candidates = lookup.get(key)

        if (!candidates || candidates.length === 0) {
          unmatchedCount += 1
          continue
        }

        let politicianId: string | null = null

        if (candidates.length === 1) {
          // Step 1: unique match on name + province
          politicianId = candidates[0]
        } else {
          // Step 2: disambiguate by checking term year overlap
          const matching = candidates.filter((slug) => {
            const t = termsByPolitician.get(slug)
            if (!t) return false
            return t.some((term) => electionYear >= term.year_from && electionYear <= term.year_to)
          })
          if (matching.length === 1) {
            politicianId = matching[0]
          }
          // else: still ambiguous or no term overlap - skip
        }

        if (!politicianId) {
          unmatchedCount += 1
          continue
        }

        ranInRels.push({
          politician_id: politicianId,
          election_id: electionId,
          alliance: entry.alliance,
          province: entry.province,
          coalition: entry.coalition,
          party_code: entry.party_code,
        })
      }
    }
  }

  return { elections, ranInRels, unmatchedCount }
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add webapp/src/etl/como-voto/transformer.ts
git commit -m "feat(etl): add transformElections with name+province matching"
```

---

### Task 6: Extend TransformInput, TransformResult, and transformAll

**Files:**
- Modify: `webapp/src/etl/como-voto/transformer.ts`

- [ ] **Step 1: Extend TransformResult**

Find and replace the existing `TransformResult` interface (search for `export interface TransformResult`). **Do this first** since it appears before `TransformInput` in the file:

```typescript
export interface TransformResult {
  // Existing
  readonly politicians: readonly PoliticianParams[]
  readonly parties: readonly PartyParams[]
  readonly provinces: readonly ProvinceParams[]
  readonly votingSessions: readonly LegislativeVoteParams[]
  readonly castVotes: readonly CastVoteRelParams[]
  readonly memberOfRels: readonly MemberOfRelParams[]
  readonly representsRels: readonly RepresentsRelParams[]
  // New - Terms
  readonly terms: readonly TermNodeParams[]
  readonly servedTermRels: readonly ServedTermRelParams[]
  readonly termPartyRels: readonly TermPartyRelParams[]
  readonly termProvinceRels: readonly TermProvinceRelParams[]
  // New - Legislation
  readonly legislation: readonly LegislationParams[]
  readonly voteOnRels: readonly VoteOnRelParams[]
  readonly lawNamePatches: readonly LawNamePatchParams[]
  // New - Elections
  readonly elections: readonly ElectionParams[]
  readonly ranInRels: readonly RanInRelParams[]
}
```

- [ ] **Step 2: Extend TransformInput**

Find and replace the existing `TransformInput` interface (search for `export interface TransformInput`):

- [ ] **Step 3: Update transformAll to produce all data**

Replace the `transformAll` function body:

```typescript
export function transformAll(input: TransformInput): TransformResult {
  const detailByKey = new Map(input.details.map((d) => [d.name_key, d]))

  const politicians = input.legislators.map((leg) => {
    const detail = detailByKey.get(leg.k)
    return detail ? transformPoliticianWithDetail(leg, detail) : transformPolitician(leg)
  })

  const parties = transformParties(input.legislators)
  const provinces = transformProvinces(input.legislators)

  const votingSessions = input.sessions.map(transformVotingSession)
  const castVotes = input.details.flatMap(transformCastVotes)
  const memberOfRels = input.legislators.map(transformMemberOf)
  const representsRels = input.legislators.map(transformRepresents)

  // --- Terms ---
  const existingPartySlugs = new Set(parties.map((p) => p.id))
  const existingProvinceSlugs = new Set(provinces.map((p) => p.id))

  const allTermResults = input.details.map((d) =>
    transformTerms(d, existingPartySlugs, existingProvinceSlugs),
  )

  const terms = allTermResults.flatMap((r) => r.terms)
  const servedTermRels = allTermResults.flatMap((r) => r.servedTermRels)
  const termPartyRels = allTermResults.flatMap((r) => r.termPartyRels)
  const termProvinceRels = allTermResults.flatMap((r) => r.termProvinceRels)

  // Merge additional parties/provinces from terms into the existing arrays
  const additionalParties = allTermResults.flatMap((r) => r.additionalParties)
  const additionalProvinces = allTermResults.flatMap((r) => r.additionalProvinces)

  // Dedup additional parties/provinces
  const mergedParties = [...parties]
  const mergedPartySlugs = new Set(parties.map((p) => p.id))
  for (const p of additionalParties) {
    if (!mergedPartySlugs.has(p.id)) {
      mergedPartySlugs.add(p.id)
      mergedParties.push(p)
    }
  }

  const mergedProvinces = [...provinces]
  const mergedProvinceSlugs = new Set(provinces.map((p) => p.id))
  for (const p of additionalProvinces) {
    if (!mergedProvinceSlugs.has(p.id)) {
      mergedProvinceSlugs.add(p.id)
      mergedProvinces.push(p)
    }
  }

  // --- Legislation ---
  const { legislation, voteOnRels, lawNamePatches } = transformLegislation(
    input.details,
    input.lawNames,
  )

  // --- Elections ---
  const { elections, ranInRels, unmatchedCount } = transformElections(
    input.electionData,
    politicians,
    terms,
  )

  if (unmatchedCount > 0) {
    console.warn(`  Election matching: ${unmatchedCount} entries could not be matched to politicians`)
  }

  return {
    politicians,
    parties: mergedParties,
    provinces: mergedProvinces,
    votingSessions,
    castVotes,
    memberOfRels,
    representsRels,
    terms,
    servedTermRels,
    termPartyRels,
    termProvinceRels,
    legislation,
    voteOnRels,
    lawNamePatches,
    elections,
    ranInRels,
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: Errors only from `loader.ts` (which still uses old TransformResult) and `run-etl-como-voto.ts` (missing new input fields) - these are fixed in Tasks 7 and 8.

- [ ] **Step 5: Commit**

```bash
git add webapp/src/etl/como-voto/transformer.ts
git commit -m "feat(etl): wire transformAll to produce terms, legislation, elections"
```

---

### Task 7: Extend the loader with new node/rel/patch loaders

**Files:**
- Modify: `webapp/src/etl/como-voto/loader.ts`

- [ ] **Step 1: Add new type imports**

Update the import block to include all new param types:

```typescript
import type {
  CastVoteRelParams,
  ElectionParams,
  LawNamePatchParams,
  LegislationParams,
  LegislativeVoteParams,
  MemberOfRelParams,
  PartyParams,
  PoliticianParams,
  ProvinceParams,
  RanInRelParams,
  RepresentsRelParams,
  ServedTermRelParams,
  TermNodeParams,
  TermPartyRelParams,
  TermProvinceRelParams,
  VoteOnRelParams,
} from './types'
```

- [ ] **Step 2: Add new node loaders**

After `loadVotingSessions` (line 102):

```typescript
/** MERGE Term nodes in batches */
async function loadTerms(
  terms: readonly TermNodeParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS t
    MERGE (n:Term {id: t.id})
    SET n += t
  `
  return runBatched('Term', terms, batchSize, cypher)
}

/** MERGE Legislation nodes in batches */
async function loadLegislation(
  legislation: readonly LegislationParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS l
    MERGE (n:Legislation {id: l.id})
    SET n += l
  `
  return runBatched('Legislation', legislation, batchSize, cypher)
}

/** MERGE Election nodes in batches */
async function loadElections(
  elections: readonly ElectionParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS e
    MERGE (n:Election {id: e.id})
    SET n += e
  `
  return runBatched('Election', elections, batchSize, cypher)
}
```

- [ ] **Step 3: Add new relationship loaders**

After `loadCastVoteRels` (line 152):

```typescript
/** MERGE SERVED_TERM relationships in batches */
async function loadServedTermRels(
  rels: readonly ServedTermRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (t:Term {id: r.term_id})
    MERGE (p)-[:SERVED_TERM]->(t)
  `
  return runBatched('SERVED_TERM', rels, batchSize, cypher)
}

/** MERGE TERM_PARTY relationships in batches */
async function loadTermPartyRels(
  rels: readonly TermPartyRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (t:Term {id: r.term_id})
    MATCH (party:Party {id: r.party_id})
    MERGE (t)-[:TERM_PARTY]->(party)
  `
  return runBatched('TERM_PARTY', rels, batchSize, cypher)
}

/** MERGE TERM_PROVINCE relationships in batches */
async function loadTermProvinceRels(
  rels: readonly TermProvinceRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (t:Term {id: r.term_id})
    MATCH (prov:Province {id: r.province_id})
    MERGE (t)-[:TERM_PROVINCE]->(prov)
  `
  return runBatched('TERM_PROVINCE', rels, batchSize, cypher)
}

/** MERGE VOTE_ON relationships in batches */
async function loadVoteOnRels(
  rels: readonly VoteOnRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (v:LegislativeVote {acta_id: r.acta_id})
    MATCH (l:Legislation {id: r.legislation_id})
    MERGE (v)-[:VOTE_ON]->(l)
  `
  return runBatched('VOTE_ON', rels, batchSize, cypher)
}

/** MERGE RAN_IN relationships in batches */
async function loadRanInRels(
  rels: readonly RanInRelParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (p:Politician {id: r.politician_id})
    MATCH (e:Election {id: r.election_id})
    MERGE (p)-[ri:RAN_IN]->(e)
    SET ri.alliance = r.alliance,
        ri.province = r.province,
        ri.coalition = r.coalition,
        ri.party_code = r.party_code
  `
  return runBatched('RAN_IN', rels, batchSize, cypher)
}

/** Patch law_name property onto existing LegislativeVote nodes */
async function loadLawNamePatches(
  patches: readonly LawNamePatchParams[],
  batchSize: number,
): Promise<LoadStepResult> {
  const cypher = `
    UNWIND $batch AS r
    MATCH (v:LegislativeVote {acta_id: r.acta_id})
    SET v.law_name = r.law_name
  `
  return runBatched('LawNamePatch', patches, batchSize, cypher)
}
```

- [ ] **Step 4: Extend loadAll**

Replace the `loadAll` function body to include all new steps:

```typescript
export async function loadAll(
  data: TransformResult,
  options: LoadOptions = {},
): Promise<LoadResult> {
  const nodeBatchSize = options.nodeBatchSize ?? DEFAULT_BATCH_SIZE
  const relBatchSize = options.relBatchSize ?? RELATIONSHIP_BATCH_SIZE
  const start = Date.now()

  const steps: LoadStepResult[] = []

  // Phase 1: Nodes (order matters - politicians first since rels reference them)
  steps.push(await loadPoliticians(data.politicians, nodeBatchSize))
  steps.push(await loadParties(data.parties, nodeBatchSize))
  steps.push(await loadProvinces(data.provinces, nodeBatchSize))
  steps.push(await loadVotingSessions(data.votingSessions, nodeBatchSize))
  steps.push(await loadTerms(data.terms, nodeBatchSize))
  steps.push(await loadLegislation(data.legislation, nodeBatchSize))
  steps.push(await loadElections(data.elections, nodeBatchSize))

  // Phase 2: Relationships (nodes must exist first)
  steps.push(await loadMemberOfRels(data.memberOfRels, relBatchSize))
  steps.push(await loadRepresentsRels(data.representsRels, relBatchSize))
  steps.push(await loadCastVoteRels(data.castVotes, relBatchSize))
  steps.push(await loadServedTermRels(data.servedTermRels, relBatchSize))
  steps.push(await loadTermPartyRels(data.termPartyRels, relBatchSize))
  steps.push(await loadTermProvinceRels(data.termProvinceRels, relBatchSize))
  steps.push(await loadVoteOnRels(data.voteOnRels, relBatchSize))
  steps.push(await loadRanInRels(data.ranInRels, relBatchSize))

  // Phase 3: Patches
  steps.push(await loadLawNamePatches(data.lawNamePatches, relBatchSize))

  const totalErrors = steps.reduce((sum, step) => sum + step.errors.length, 0)

  return {
    steps,
    totalErrors,
    durationMs: Date.now() - start,
  }
}
```

- [ ] **Step 5: Verify it compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: Only errors from runner script (missing new input fields) - fixed in Task 8.

- [ ] **Step 6: Commit**

```bash
git add webapp/src/etl/como-voto/loader.ts
git commit -m "feat(etl): add loaders for Term, Legislation, Election nodes and rels"
```

---

### Task 8: Update the runner script and barrel exports

**Files:**
- Modify: `webapp/scripts/run-etl-como-voto.ts`
- Modify: `webapp/src/etl/como-voto/index.ts`

- [ ] **Step 1: Update runner imports**

Replace the import lines in the runner:

```typescript
import 'dotenv/config'
import { closeDriver, verifyConnectivity } from '../src/lib/neo4j/client'
import {
  fetchLegislators,
  fetchVotingSessions,
  fetchLegislatorDetails,
  fetchLawNames,
  fetchElectionLegislators,
} from '../src/etl/como-voto'
import { transformAll } from '../src/etl/como-voto'
import { loadAll } from '../src/etl/como-voto'
import type { LoadStepResult } from '../src/etl/como-voto'
```

- [ ] **Step 2: Add new fetches alongside existing ones**

In the fetch section, add law names and election data to the parallel fetch:

```typescript
  const [legislatorsResult, sessionsResult, lawNamesResult, electionResult] = await Promise.all([
    fetchLegislators(),
    fetchVotingSessions(),
    fetchLawNames(),
    fetchElectionLegislators(),
  ])

  console.log(`  Legislators: ${legislatorsResult.count}`)
  console.log(`  Voting sessions: ${sessionsResult.count}`)
  console.log(`  Law names: ${lawNamesResult.count}`)
  console.log(`  Election years: ${electionResult.yearCount}`)
```

- [ ] **Step 3: Pass new data to transformAll**

Update the `transformAll` call:

```typescript
  const transformed = transformAll({
    legislators: legislatorsResult.legislators,
    details: detailsResult.details,
    sessions: sessionsResult.sessions,
    lawNames: lawNamesResult.lawNames,
    electionData: electionResult.electionData,
  })
```

- [ ] **Step 4: Add new transform counts to output**

After the existing console.log lines for transform counts, add:

```typescript
  console.log(`  Terms:            ${transformed.terms.length}`)
  console.log(`  Legislation:      ${transformed.legislation.length}`)
  console.log(`  Elections:        ${transformed.elections.length}`)
  console.log(`  SERVED_TERM rels: ${transformed.servedTermRels.length}`)
  console.log(`  TERM_PARTY rels:  ${transformed.termPartyRels.length}`)
  console.log(`  TERM_PROVINCE:    ${transformed.termProvinceRels.length}`)
  console.log(`  VOTE_ON rels:     ${transformed.voteOnRels.length}`)
  console.log(`  RAN_IN rels:      ${transformed.ranInRels.length}`)
  console.log(`  Law name patches: ${transformed.lawNamePatches.length}`)
```

- [ ] **Step 5: Update barrel exports in index.ts**

Add new exports to `webapp/src/etl/como-voto/index.ts`:

```typescript
// Add to schema exports
export {
  // ... existing ...
  LawNamesFileSchema,
  ElectionEntrySchema,
  ElectionLegislatorsFileSchema,
} from './types'

// Add to type exports
export type {
  // ... existing ...
  ElectionEntry,
  ElectionLegislatorsFile,
  TermNodeParams,
  LegislationParams,
  ElectionParams,
  ServedTermRelParams,
  TermPartyRelParams,
  TermProvinceRelParams,
  VoteOnRelParams,
  RanInRelParams,
  LawNamePatchParams,
} from './types'

// Add to fetcher exports
export {
  // ... existing ...
  fetchLawNames,
  fetchElectionLegislators,
} from './fetcher'

export type {
  // ... existing ...
  FetchLawNamesResult,
  FetchElectionLegislatorsResult,
} from './fetcher'

// Add to transformer exports
export {
  // ... existing ...
  normalizeName,
  transformTerms,
  transformLegislation,
  transformElections,
} from './transformer'
```

- [ ] **Step 6: Verify everything compiles**

Run: `cd webapp && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: Zero errors

- [ ] **Step 7: Commit**

```bash
git add webapp/scripts/run-etl-como-voto.ts webapp/src/etl/como-voto/index.ts
git commit -m "feat(etl): wire runner and exports for extended pipeline"
```

---

### Task 9: Run the full ETL and verify

**Files:** None (verification only)

- [ ] **Step 1: Run the full ETL pipeline**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=60000 npx tsx scripts/run-etl-como-voto.ts 2>&1`

Expected: All steps show `✓`, zero load errors. New counts visible:
- Terms: > 0
- Legislation: > 0
- Elections: > 0
- SERVED_TERM, TERM_PARTY, TERM_PROVINCE, VOTE_ON, RAN_IN rels: > 0
- Law name patches: > 0

- [ ] **Step 2: Query Neo4j to verify new data**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=10000 npx tsx -e "
import 'dotenv/config'
import { readQuery, closeDriver } from './src/lib/neo4j/client'
async function main() {
  const counts = await readQuery(
    'MATCH (n) RETURN labels(n)[0] AS label, count(n) AS cnt ORDER BY cnt DESC',
    {}, (r) => ({ label: r.get('label'), count: r.get('cnt').toNumber() })
  )
  console.log('=== Node Counts ===')
  for (const c of counts.records) console.log('  ' + c.label + ': ' + c.count)

  const rels = await readQuery(
    'MATCH ()-[r]->() RETURN type(r) AS rel, count(r) AS cnt ORDER BY cnt DESC',
    {}, (r) => ({ rel: r.get('rel'), count: r.get('cnt').toNumber() })
  )
  console.log('\\n=== Relationship Counts ===')
  for (const c of rels.records) console.log('  ' + c.rel + ': ' + c.count)
  await closeDriver()
}
main()
"`

Expected: New labels `Term`, `Legislation`, `Election` appear in node counts. New relationship types `SERVED_TERM`, `TERM_PARTY`, `TERM_PROVINCE`, `VOTE_ON`, `RAN_IN` appear.

- [ ] **Step 3: Verify Term career tracking works**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=10000 npx tsx -e "
import 'dotenv/config'
import { readQuery, closeDriver } from './src/lib/neo4j/client'
async function main() {
  // Politicians who changed parties across terms
  const switchers = await readQuery(\\\`
    MATCH (p:Politician)-[:SERVED_TERM]->(t:Term)-[:TERM_PARTY]->(party:Party)
    WITH p, collect(DISTINCT party.name) AS parties
    WHERE size(parties) > 1
    RETURN p.name AS name, parties
    ORDER BY size(parties) DESC
    LIMIT 10
  \\\`, {}, (r) => ({ name: r.get('name'), parties: r.get('parties') }))
  console.log('=== Party Switchers ===')
  for (const s of switchers.records) console.log('  ' + s.name + ': ' + s.parties.join(' → '))
  await closeDriver()
}
main()
"`

Expected: List of politicians who served in multiple parties across terms.

- [ ] **Step 4: Verify Legislation grouping works**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=10000 npx tsx -e "
import 'dotenv/config'
import { readQuery, closeDriver } from './src/lib/neo4j/client'
async function main() {
  const laws = await readQuery(\\\`
    MATCH (v:LegislativeVote)-[:VOTE_ON]->(l:Legislation)
    RETURN l.name AS name, count(v) AS voteCount
    ORDER BY voteCount DESC
    LIMIT 10
  \\\`, {}, (r) => ({ name: r.get('name'), voteCount: r.get('voteCount').toNumber() }))
  console.log('=== Top Legislation by Vote Count ===')
  for (const l of laws.records) console.log('  ' + l.name + ': ' + l.voteCount + ' votes')
  await closeDriver()
}
main()
"`

Expected: Named laws with vote counts > 1.

- [ ] **Step 5: Create Neo4j uniqueness constraints for new node types**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=10000 npx tsx -e "
import 'dotenv/config'
import { executeWrite, closeDriver } from './src/lib/neo4j/client'
async function main() {
  await executeWrite('CREATE CONSTRAINT term_id IF NOT EXISTS FOR (t:Term) REQUIRE t.id IS UNIQUE', {})
  console.log('Created Term(id) constraint')
  await executeWrite('CREATE CONSTRAINT legislation_id IF NOT EXISTS FOR (l:Legislation) REQUIRE l.id IS UNIQUE', {})
  console.log('Created Legislation(id) constraint')
  await executeWrite('CREATE CONSTRAINT election_id IF NOT EXISTS FOR (e:Election) REQUIRE e.id IS UNIQUE', {})
  console.log('Created Election(id) constraint')
  await closeDriver()
}
main()
"`

Expected: Three constraints created successfully.

- [ ] **Step 6: Re-run ETL to verify constraints don't break idempotency**

Run: `cd webapp && NEO4J_QUERY_TIMEOUT_MS=60000 npx tsx scripts/run-etl-como-voto.ts 2>&1 | tail -20`

Expected: All steps `✓`, zero load errors. Pipeline is idempotent with constraints in place.
