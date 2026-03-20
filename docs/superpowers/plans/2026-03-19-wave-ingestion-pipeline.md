# Wave-Based Ingestion Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a staged data ingestion system that imports external Epstein investigation data into Neo4j in controlled waves with quality gates and confidence tiers.

**Architecture:** Three-layer approach: (1) shared ingestion infrastructure (types, dedup, wave runner), (2) wave-specific scripts that download/parse/merge data, (3) minimal UI additions for confidence filtering and source badges. Each wave runs independently as a CLI script, writes bronze-tier nodes, and produces a review report.

**Tech Stack:** TypeScript, Neo4j (neo4j-driver-lite), Zod validation, existing seed script patterns. No new runtime dependencies for Waves 1-2. Wave 3 adds `pdf-parse`.

---

## File Structure

### New Files

```
webapp/src/lib/ingestion/
├── types.ts                    — IngestionResult, ConflictRecord, WaveConfig, ConfidenceTier
├── dedup.ts                    — Name normalization, Levenshtein distance, fuzzy matching
├── quality.ts                  — Review report generation, conflict file I/O
└── epstein-exposed-client.ts   — Typed API client for Wave 2

webapp/scripts/
├── backfill-tiers.ts           — One-time: add ingestion_wave/confidence_tier/source to existing nodes
├── ingest-wave-1.ts            — GitHub rhowardstone data import
├── ingest-wave-2.ts            — Epstein Exposed API import
├── ingest-wave-3.ts            — Document content enrichment
├── review-wave.ts              — Quality gate: dump conflicts + sample for review
└── promote-nodes.ts            — Promote bronze → silver → gold by wave or IDs
```

### Modified Files

```
webapp/src/lib/caso-epstein/queries.ts     — Add optional confidence_tier filter param to queries
webapp/src/lib/caso-epstein/types.ts       — Add ConfidenceTier type, extend node interfaces
webapp/src/lib/neo4j/schema.ts             — Add indexes for confidence_tier, ingestion_wave, source
webapp/src/components/graph/ForceGraph.tsx  — Render bronze nodes with dashed borders
webapp/src/app/caso/[slug]/grafo/page.tsx   — Add confidence filter dropdown
webapp/src/components/investigation/EvidenceExplorer.tsx — Add confidence filter + source badge
webapp/src/components/investigation/DocumentCard.tsx     — Show source badge for non-gold docs
```

---

### Task 1: Ingestion Types and Shared Infrastructure

**Files:**
- Create: `webapp/src/lib/ingestion/types.ts`
- Modify: `webapp/src/lib/caso-epstein/types.ts`

- [ ] **Step 1: Create ingestion types file**

```typescript
// webapp/src/lib/ingestion/types.ts

export type ConfidenceTier = 'gold' | 'silver' | 'bronze'

export type IngestionSource = 'seed' | 'rhowardstone' | 'epstein-exposed' | 'courtlistener' | 'documentcloud' | 'doj' | 'community'

export interface IngestionMeta {
  readonly ingestion_wave: number
  readonly confidence_tier: ConfidenceTier
  readonly source: IngestionSource
}

export type DedupResult = 'exact_match' | 'fuzzy_match' | 'no_match'

export interface ConflictRecord {
  readonly incomingId: string
  readonly incomingName: string
  readonly existingId: string
  readonly existingName: string
  readonly matchType: 'fuzzy_match'
  readonly distance: number
  readonly source: IngestionSource
  readonly wave: number
}

export interface WaveReport {
  readonly wave: number
  readonly source: IngestionSource
  readonly nodesCreated: number
  readonly nodesSkipped: number
  readonly edgesCreated: number
  readonly edgesSkipped: number
  readonly conflicts: ConflictRecord[]
  readonly durationMs: number
}

export interface ResumeState {
  readonly wave: number
  readonly source: IngestionSource
  readonly lastCursor: string | null
  readonly lastPage: number
  readonly nodesProcessed: number
  readonly startedAt: string
}
```

- [ ] **Step 2: Add ConfidenceTier to caso-epstein types**

In `webapp/src/lib/caso-epstein/types.ts`, add the import and extend `EpsteinPerson` and other node interfaces to include optional ingestion metadata:

```typescript
// Add at top of file:
export type ConfidenceTier = 'gold' | 'silver' | 'bronze'

// Add to each node interface (EpsteinPerson, EpsteinDocument, etc.):
readonly confidence_tier?: ConfidenceTier
readonly source?: string
readonly ingestion_wave?: number
```

- [ ] **Step 3: Commit**

```bash
git add webapp/src/lib/ingestion/types.ts webapp/src/lib/caso-epstein/types.ts
git commit -m "feat: add ingestion types and confidence tier model"
```

---

### Task 2: Dedup Module

**Files:**
- Create: `webapp/src/lib/ingestion/dedup.ts`

- [ ] **Step 1: Create dedup module with name normalization and Levenshtein**

```typescript
// webapp/src/lib/ingestion/dedup.ts

import type { DedupResult } from './types'

const FUZZY_THRESHOLD = 2

/** Normalize a name for comparison: lowercase, strip accents, collapse whitespace */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

/** Levenshtein distance between two strings */
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/** Slugify a name for slug-based matching */
export function toSlug(name: string): string {
  return normalizeName(name).replace(/\s+/g, '-')
}

export interface DedupMatch {
  result: DedupResult
  existingId: string | null
  existingName: string | null
  distance: number
}

/**
 * Check an incoming name against a map of existing names.
 * existingEntries: Map<normalizedName, { id, originalName }>
 * Also checks slug match.
 */
export function dedup(
  incomingName: string,
  existingEntries: Map<string, { id: string; name: string }>,
  existingSlugs: Map<string, { id: string; name: string }>,
): DedupMatch {
  const normalized = normalizeName(incomingName)
  const slug = toSlug(incomingName)

  // Exact normalized name match
  const exact = existingEntries.get(normalized)
  if (exact) {
    return { result: 'exact_match', existingId: exact.id, existingName: exact.name, distance: 0 }
  }

  // Exact slug match
  const slugMatch = existingSlugs.get(slug)
  if (slugMatch) {
    return { result: 'exact_match', existingId: slugMatch.id, existingName: slugMatch.name, distance: 0 }
  }

  // Fuzzy match: check Levenshtein against all existing
  let bestDistance = Infinity
  let bestMatch: { id: string; name: string } | null = null

  for (const [existingNorm, entry] of existingEntries) {
    const dist = levenshtein(normalized, existingNorm)
    if (dist <= FUZZY_THRESHOLD && dist < bestDistance) {
      bestDistance = dist
      bestMatch = entry
    }
  }

  if (bestMatch) {
    return { result: 'fuzzy_match', existingId: bestMatch.id, existingName: bestMatch.name, distance: bestDistance }
  }

  return { result: 'no_match', existingId: null, existingName: null, distance: -1 }
}
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/lib/ingestion/dedup.ts
git commit -m "feat: add dedup module with name normalization and Levenshtein matching"
```

---

### Task 3: Quality Report Module

**Files:**
- Create: `webapp/src/lib/ingestion/quality.ts`

- [ ] **Step 1: Create quality module for conflict logging and report generation**

```typescript
// webapp/src/lib/ingestion/quality.ts

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ConflictRecord, WaveReport } from './types'

const CONFLICTS_DIR = join(process.cwd(), '_ingestion_data')

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

export function saveConflicts(wave: number, conflicts: ConflictRecord[]): string {
  ensureDir(CONFLICTS_DIR)
  const path = join(CONFLICTS_DIR, `wave-${wave}-conflicts.json`)
  writeFileSync(path, JSON.stringify(conflicts, null, 2))
  return path
}

export function loadConflicts(wave: number): ConflictRecord[] {
  const path = join(CONFLICTS_DIR, `wave-${wave}-conflicts.json`)
  if (!existsSync(path)) return []
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function saveResumeState(wave: number, state: Record<string, unknown>): void {
  ensureDir(CONFLICTS_DIR)
  const path = join(CONFLICTS_DIR, `wave-${wave}-resume.json`)
  writeFileSync(path, JSON.stringify(state, null, 2))
}

export function loadResumeState(wave: number): Record<string, unknown> | null {
  const path = join(CONFLICTS_DIR, `wave-${wave}-resume.json`)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

export function printReport(report: WaveReport): void {
  console.log('\n' + '═'.repeat(60))
  console.log(`  Wave ${report.wave} Ingestion Report (${report.source})`)
  console.log('═'.repeat(60))
  console.log(`  Nodes created:  ${report.nodesCreated}`)
  console.log(`  Nodes skipped:  ${report.nodesSkipped} (duplicates)`)
  console.log(`  Edges created:  ${report.edgesCreated}`)
  console.log(`  Edges skipped:  ${report.edgesSkipped}`)
  console.log(`  Conflicts:      ${report.conflicts.length} (fuzzy matches, logged for review)`)
  console.log(`  Duration:       ${(report.durationMs / 1000).toFixed(1)}s`)
  console.log('═'.repeat(60))

  if (report.conflicts.length > 0) {
    console.log('\n  Fuzzy match conflicts (review needed):')
    for (const c of report.conflicts.slice(0, 10)) {
      console.log(`    "${c.incomingName}" ≈ "${c.existingName}" (distance: ${c.distance})`)
    }
    if (report.conflicts.length > 10) {
      console.log(`    ... and ${report.conflicts.length - 10} more`)
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add webapp/src/lib/ingestion/quality.ts
git commit -m "feat: add quality report module for ingestion conflict tracking"
```

---

### Task 4: Backfill Existing Nodes with Tier Metadata

**Files:**
- Create: `webapp/scripts/backfill-tiers.ts`
- Modify: `webapp/src/lib/neo4j/schema.ts`

- [ ] **Step 1: Add indexes for new properties to schema.ts**

Add to the `BTREE_INDEXES` array in `webapp/src/lib/neo4j/schema.ts`:

```typescript
// Add these entries to the BTREE_INDEXES array:
{
  name: 'node_confidence_tier_index',
  label: 'Person',
  property: 'confidence_tier',
},
{
  name: 'node_ingestion_wave_index',
  label: 'Person',
  property: 'ingestion_wave',
},
{
  name: 'document_confidence_tier_index',
  label: 'Document',
  property: 'confidence_tier',
},
{
  name: 'organization_confidence_tier_index',
  label: 'Organization',
  property: 'confidence_tier',
},
{
  name: 'event_confidence_tier_index',
  label: 'Event',
  property: 'confidence_tier',
},
```

- [ ] **Step 2: Create backfill script**

```typescript
// webapp/scripts/backfill-tiers.ts
// Run with: npx tsx scripts/backfill-tiers.ts
//
// Adds ingestion_wave, confidence_tier, and source properties
// to all existing nodes that don't have them (original seed data).

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

const LABELS = ['Person', 'Location', 'Event', 'Document', 'Organization', 'LegalCase', 'Flight']

async function main(): Promise<void> {
  console.log('Connecting to Neo4j...')
  const connected = await verifyConnectivity()
  if (!connected) {
    console.error('Failed to connect to Neo4j.')
    process.exit(1)
  }

  for (const label of LABELS) {
    const result = await executeWrite(
      `MATCH (n:${label})
       WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave IS NULL
       SET n.ingestion_wave = 0,
           n.confidence_tier = 'gold',
           n.source = 'seed'
       RETURN count(n) AS updated`,
    )
    const count = result.records.length > 0 ? 'done' : '0'
    console.log(`  ${label}: ${count}`)
  }

  // Also backfill relationships
  const relTypes = ['ASSOCIATED_WITH', 'EMPLOYED_BY', 'AFFILIATED_WITH', 'OWNED',
                    'PARTICIPATED_IN', 'FILED_IN', 'DOCUMENTED_BY', 'MENTIONED_IN',
                    'FLEW_WITH', 'FINANCED']

  for (const relType of relTypes) {
    await executeWrite(
      `MATCH ()-[r:${relType}]->()
       WHERE r.confidence_tier IS NULL
       SET r.confidence_tier = 'gold',
           r.source = 'seed',
           r.ingestion_wave = 0`,
    )
    console.log(`  Rel ${relType}: backfilled`)
  }

  console.log('\nBackfill complete.')
  await closeDriver()
}

main().catch((error) => {
  console.error('Backfill failed:', error)
  closeDriver().finally(() => process.exit(1))
})
```

- [ ] **Step 3: Commit**

```bash
git add webapp/scripts/backfill-tiers.ts webapp/src/lib/neo4j/schema.ts
git commit -m "feat: add confidence tier indexes and backfill script for existing nodes"
```

- [ ] **Step 4: Run the backfill (requires Neo4j running)**

```bash
cd webapp && npx tsx scripts/backfill-tiers.ts
```

---

### Task 5: Wave 1 — Ingest rhowardstone GitHub Data

**Files:**
- Create: `webapp/scripts/ingest-wave-1.ts`

This is the largest task. The script:
1. Downloads structured JSON/CSV from the GitHub repo
2. Parses entities and relationships
3. Deduplicates against existing graph
4. Writes new bronze nodes and edges
5. Produces a review report

- [ ] **Step 1: Examine the rhowardstone repo data format**

Before writing the script, manually clone and inspect the repo to understand its data structure:

```bash
cd /tmp && git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git epstein-data-check && ls epstein-data-check/ && find epstein-data-check -name "*.json" -o -name "*.csv" | head -30
```

Examine the actual file structure and field names to map them correctly. Update the script below based on findings.

- [ ] **Step 2: Create the Wave 1 ingestion script**

Create `webapp/scripts/ingest-wave-1.ts`. The script should:
- Expect the rhowardstone data to be pre-cloned to `_ingestion_data/rhowardstone/` (instructions in README, not auto-cloned in script for safety)
- Parse the data files (JSON or CSV) based on what Step 1 revealed
- Build dedup maps from existing Neo4j nodes
- For each entity: dedup, then create bronze node or log conflict
- For each relationship: resolve source/target IDs, create edge
- Save conflicts and print report

Key structure:

```typescript
// webapp/scripts/ingest-wave-1.ts
// Run with: npx tsx scripts/ingest-wave-1.ts
//
// Wave 1: Imports structured data from rhowardstone/Epstein-research-data.
// Pre-requisite: Clone the repo to _ingestion_data/rhowardstone/
//   git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git _ingestion_data/rhowardstone

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { executeWrite, verifyConnectivity, closeDriver, getDriver } from '../src/lib/neo4j/client'
import { normalizeName, toSlug, dedup } from '../src/lib/ingestion/dedup'
import { saveConflicts, printReport } from '../src/lib/ingestion/quality'
import type { ConflictRecord, WaveReport } from '../src/lib/ingestion/types'

const WAVE = 1
const SOURCE = 'rhowardstone' as const
const CASO_SLUG = 'caso-epstein'
const DATA_DIR = join(process.cwd(), '_ingestion_data', 'rhowardstone')

// Check data exists
if (!existsSync(DATA_DIR)) {
  console.error(`Data not found at ${DATA_DIR}`)
  console.error('Run: git clone --depth 1 https://github.com/rhowardstone/Epstein-research-data.git _ingestion_data/rhowardstone')
  process.exit(1)
}

// --- Data loading and parsing ---
// NOTE: Actual file paths and field names depend on repo structure.
// Adapt after examining the cloned data in Step 1.

interface RawEntity {
  name: string
  type: string
  id?: string
  description?: string
  [key: string]: unknown
}

interface RawRelationship {
  source: string
  target: string
  type: string
  [key: string]: unknown
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
    return obj
  })
}

function loadEntities(): RawEntity[] {
  // Adapt paths based on actual repo structure
  const possiblePaths = [
    'entities.json', 'knowledge_graph/entities.json', 'data/entities.json',
    'Knowledge_Graph/entities.csv', 'entities.csv',
  ]
  for (const p of possiblePaths) {
    const full = join(DATA_DIR, p)
    if (existsSync(full)) {
      console.log(`Loading entities from ${p}`)
      if (p.endsWith('.json')) return JSON.parse(readFileSync(full, 'utf-8'))
      return parseCsv(readFileSync(full, 'utf-8')) as unknown as RawEntity[]
    }
  }
  console.error('Could not find entities data file. Check repo structure at:', DATA_DIR)
  process.exit(1)
}

function loadRelationships(): RawRelationship[] {
  const possiblePaths = [
    'relationships.json', 'knowledge_graph/relationships.json',
    'data/relationships.json', 'Knowledge_Graph/relationships.csv', 'relationships.csv',
  ]
  for (const p of possiblePaths) {
    const full = join(DATA_DIR, p)
    if (existsSync(full)) {
      console.log(`Loading relationships from ${p}`)
      if (p.endsWith('.json')) return JSON.parse(readFileSync(full, 'utf-8'))
      return parseCsv(readFileSync(full, 'utf-8')) as unknown as RawRelationship[]
    }
  }
  console.error('Could not find relationships data file.')
  process.exit(1)
}

// --- Build existing entity maps from Neo4j ---
async function loadExistingEntities(): Promise<{
  nameMap: Map<string, { id: string; name: string }>
  slugMap: Map<string, { id: string; name: string }>
}> {
  const session = getDriver().session()
  try {
    const result = await session.run(
      `MATCH (n) WHERE n.caso_slug = $casoSlug AND n.name IS NOT NULL
       RETURN n.id AS id, n.name AS name, n.slug AS slug`,
      { casoSlug: CASO_SLUG },
    )
    const nameMap = new Map<string, { id: string; name: string }>()
    const slugMap = new Map<string, { id: string; name: string }>()
    for (const record of result.records) {
      const id = record.get('id') as string
      const name = record.get('name') as string
      const slug = record.get('slug') as string | null
      const entry = { id, name }
      nameMap.set(normalizeName(name), entry)
      if (slug) slugMap.set(slug, entry)
    }
    return { nameMap, slugMap }
  } finally {
    await session.close()
  }
}

// --- Map external entity types to Neo4j labels ---
function mapTypeToLabel(type: string): string {
  const normalized = type.toLowerCase().trim()
  const mapping: Record<string, string> = {
    person: 'Person', individual: 'Person',
    organization: 'Organization', company: 'Organization', institution: 'Organization',
    location: 'Location', place: 'Location',
    event: 'Event', document: 'Document',
    legal_case: 'LegalCase', case: 'LegalCase',
  }
  return mapping[normalized] ?? 'Person'
}

// --- Main ingestion ---
async function main(): Promise<void> {
  const start = Date.now()
  console.log('=== Wave 1: rhowardstone/Epstein-research-data ===\n')

  const connected = await verifyConnectivity()
  if (!connected) { console.error('Failed to connect to Neo4j.'); process.exit(1) }

  const entities = loadEntities()
  const relationships = loadRelationships()
  console.log(`Loaded ${entities.length} entities and ${relationships.length} relationships`)

  const { nameMap, slugMap } = await loadExistingEntities()
  console.log(`Existing graph has ${nameMap.size} named entities\n`)

  const conflicts: ConflictRecord[] = []
  let nodesCreated = 0, nodesSkipped = 0
  const newIdMap = new Map<string, string>()

  for (const entity of entities) {
    const name = entity.name?.trim()
    if (!name) continue

    const match = dedup(name, nameMap, slugMap)

    if (match.result === 'exact_match') {
      nodesSkipped++
      if (entity.id) newIdMap.set(entity.id, match.existingId!)
      newIdMap.set(name, match.existingId!)
      continue
    }

    if (match.result === 'fuzzy_match') {
      conflicts.push({
        incomingId: entity.id ?? name, incomingName: name,
        existingId: match.existingId!, existingName: match.existingName!,
        matchType: 'fuzzy_match', distance: match.distance,
        source: SOURCE, wave: WAVE,
      })
      nodesSkipped++
      if (entity.id) newIdMap.set(entity.id, match.existingId!)
      newIdMap.set(name, match.existingId!)
      continue
    }

    const label = mapTypeToLabel(entity.type ?? 'person')
    const slug = toSlug(name)
    const id = `ep-w1-${slug}`

    await executeWrite(
      `MERGE (n:${label} {id: $id})
       SET n.name = $name, n.slug = $slug, n.description = $description,
           n.caso_slug = $casoSlug, n.ingestion_wave = $wave,
           n.confidence_tier = 'bronze', n.source = $source`,
      { id, name, slug, description: entity.description ?? '', casoSlug: CASO_SLUG, wave: WAVE, source: SOURCE },
    )

    nodesCreated++
    if (entity.id) newIdMap.set(entity.id, id)
    newIdMap.set(name, id)
    nameMap.set(normalizeName(name), { id, name })
    slugMap.set(slug, { id, name })

    if (nodesCreated % 50 === 0) console.log(`  Created ${nodesCreated} nodes...`)
  }

  let edgesCreated = 0, edgesSkipped = 0

  for (const rel of relationships) {
    const sourceId = newIdMap.get(rel.source) ?? newIdMap.get(rel.source?.trim())
    const targetId = newIdMap.get(rel.target) ?? newIdMap.get(rel.target?.trim())
    if (!sourceId || !targetId) { edgesSkipped++; continue }

    const relType = (rel.type ?? 'ASSOCIATED_WITH').toUpperCase().replace(/\s+/g, '_')

    await executeWrite(
      `MATCH (a {id: $sourceId}), (b {id: $targetId})
       MERGE (a)-[r:${relType}]->(b)
       SET r.confidence_tier = 'bronze', r.source = $source, r.ingestion_wave = $wave`,
      { sourceId, targetId, source: SOURCE, wave: WAVE },
    )
    edgesCreated++
    if (edgesCreated % 100 === 0) console.log(`  Created ${edgesCreated} edges...`)
  }

  if (conflicts.length > 0) {
    const conflictPath = saveConflicts(WAVE, conflicts)
    console.log(`\nConflicts saved to: ${conflictPath}`)
  }

  const report: WaveReport = {
    wave: WAVE, source: SOURCE, nodesCreated, nodesSkipped,
    edgesCreated, edgesSkipped, conflicts, durationMs: Date.now() - start,
  }
  printReport(report)
  await closeDriver()
}

main().catch((error) => {
  console.error('Wave 1 ingestion failed:', error)
  closeDriver().finally(() => process.exit(1))
})
```

- [ ] **Step 3: Commit**

```bash
git add webapp/scripts/ingest-wave-1.ts
git commit -m "feat: add Wave 1 ingestion script for rhowardstone GitHub data"
```

---

### Task 6: Review and Promote Scripts

**Files:**
- Create: `webapp/scripts/review-wave.ts`
- Create: `webapp/scripts/promote-nodes.ts`

- [ ] **Step 1: Create review script**

```typescript
// webapp/scripts/review-wave.ts
// Run with: npx tsx scripts/review-wave.ts --wave 1
//
// Quality gate: shows ingestion stats, conflicts, and a random sample of new nodes.

import { getDriver, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'
import { loadConflicts } from '../src/lib/ingestion/quality'

const wave = parseInt(process.argv.find((a) => a.startsWith('--wave='))?.split('=')[1] ??
  process.argv[process.argv.indexOf('--wave') + 1] ?? '1')

async function main(): Promise<void> {
  const connected = await verifyConnectivity()
  if (!connected) { console.error('Failed to connect to Neo4j.'); process.exit(1) }

  const session = getDriver().session()
  try {
    // Stats
    const statsResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave = $wave
       RETURN labels(n)[0] AS label, count(n) AS count ORDER BY count DESC`,
      { wave },
    )

    console.log(`\n=== Wave ${wave} Review ===\n`)
    console.log('Node counts by type:')
    let total = 0
    for (const record of statsResult.records) {
      const label = record.get('label') as string
      const count = (record.get('count') as { low: number }).low
      console.log(`  ${label}: ${count}`)
      total += count
    }
    console.log(`  TOTAL: ${total}`)

    // Edge stats
    const edgeResult = await session.run(
      `MATCH ()-[r]->() WHERE r.ingestion_wave = $wave
       RETURN type(r) AS relType, count(r) AS count ORDER BY count DESC`,
      { wave },
    )

    console.log('\nEdge counts by type:')
    let edgeTotal = 0
    for (const record of edgeResult.records) {
      const relType = record.get('relType') as string
      const count = (record.get('count') as { low: number }).low
      console.log(`  ${relType}: ${count}`)
      edgeTotal += count
    }
    console.log(`  TOTAL: ${edgeTotal}`)

    // Conflicts
    const conflicts = loadConflicts(wave)
    if (conflicts.length > 0) {
      console.log(`\n${conflicts.length} fuzzy match conflicts:`)
      for (const c of conflicts) {
        console.log(`  "${c.incomingName}" ≈ "${c.existingName}" (dist: ${c.distance})`)
      }
    } else {
      console.log('\nNo conflicts.')
    }

    // Random sample of 20 new nodes
    const sampleResult = await session.run(
      `MATCH (n) WHERE n.caso_slug = 'caso-epstein' AND n.ingestion_wave = $wave
       WITH n, rand() AS r ORDER BY r LIMIT 20
       RETURN labels(n)[0] AS label, n.name AS name, n.id AS id, n.description AS desc`,
      { wave },
    )

    console.log('\nRandom sample of 20 new nodes:')
    for (const record of sampleResult.records) {
      const label = record.get('label') as string
      const name = record.get('name') as string
      const desc = (record.get('desc') as string)?.slice(0, 60) ?? ''
      console.log(`  [${label}] ${name}${desc ? ` — ${desc}...` : ''}`)
    }
  } finally {
    await session.close()
    await closeDriver()
  }
}

main().catch((error) => {
  console.error('Review failed:', error)
  closeDriver().finally(() => process.exit(1))
})
```

- [ ] **Step 2: Create promote script**

```typescript
// webapp/scripts/promote-nodes.ts
// Run with:
//   npx tsx scripts/promote-nodes.ts --wave 1 --to silver
//   npx tsx scripts/promote-nodes.ts --ids ep-w1-foo,ep-w1-bar --to gold

import { executeWrite, verifyConnectivity, closeDriver } from '../src/lib/neo4j/client'

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  return idx >= 0 ? process.argv[idx + 1] : process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1]
}

async function main(): Promise<void> {
  const to = getArg('to')
  const wave = getArg('wave')
  const ids = getArg('ids')

  if (!to || !['silver', 'gold'].includes(to)) {
    console.error('Usage: --to silver|gold and either --wave N or --ids id1,id2,...')
    process.exit(1)
  }

  const connected = await verifyConnectivity()
  if (!connected) { console.error('Failed to connect to Neo4j.'); process.exit(1) }

  if (wave) {
    const waveNum = parseInt(wave)
    await executeWrite(
      `MATCH (n) WHERE n.ingestion_wave = $wave AND n.caso_slug = 'caso-epstein'
       SET n.confidence_tier = $tier`,
      { wave: waveNum, tier: to },
    )
    await executeWrite(
      `MATCH ()-[r]->() WHERE r.ingestion_wave = $wave SET r.confidence_tier = $tier`,
      { wave: waveNum, tier: to },
    )
    console.log(`Promoted all wave ${wave} nodes and edges to ${to}.`)
  } else if (ids) {
    const idList = ids.split(',').map((s) => s.trim())
    await executeWrite(
      `MATCH (n) WHERE n.id IN $ids SET n.confidence_tier = $tier`,
      { ids: idList, tier: to },
    )
    console.log(`Promoted ${idList.length} nodes to ${to}.`)
  }

  await closeDriver()
}

main().catch((error) => {
  console.error('Promote failed:', error)
  closeDriver().finally(() => process.exit(1))
})
```

- [ ] **Step 3: Commit**

```bash
git add webapp/scripts/review-wave.ts webapp/scripts/promote-nodes.ts
git commit -m "feat: add review and promote scripts for ingestion quality gates"
```

---

### Task 7: Wave 2 — Epstein Exposed API Client and Ingestion

**Files:**
- Create: `webapp/src/lib/ingestion/epstein-exposed-client.ts`
- Create: `webapp/scripts/ingest-wave-2.ts`

- [ ] **Step 1: Verify the Epstein Exposed API exists and check its endpoints**

```bash
curl -s https://epsteinexposed.com/api/v2/persons?limit=1 | head -c 500
```

If the API doesn't exist or returns errors, research the actual API endpoints. The script needs to be adapted to whatever the real API shape is.

- [ ] **Step 2: Create the API client**

```typescript
// webapp/src/lib/ingestion/epstein-exposed-client.ts

export interface EEPerson {
  id: string
  name: string
  description?: string
  role?: string
  nationality?: string
  connections?: number
}

export interface EEFlight {
  id: string
  date: string
  origin: string
  destination: string
  aircraft?: string
  passengers: string[]
}

export interface EEDocument {
  id: string
  title: string
  date: string
  type: string
  source_url?: string
  summary?: string
}

export interface EEResponse<T> {
  status: string
  data: T[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

const BASE_URL = 'https://epsteinexposed.com/api/v2'
const RATE_LIMIT_DELAY_MS = 36_000 // 100 req/hr = 1 every 36s

export class EpsteinExposedClient {
  private lastRequestTime = 0

  private async throttle(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < RATE_LIMIT_DELAY_MS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS - elapsed))
    }
    this.lastRequestTime = Date.now()
  }

  private async get<T>(path: string, params: Record<string, string> = {}): Promise<EEResponse<T>> {
    await this.throttle()
    const url = new URL(`${BASE_URL}${path}`)
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'OfficeOfAccountability/1.0' },
    })
    if (!res.ok) {
      throw new Error(`EE API error: ${res.status} ${res.statusText}`)
    }
    return res.json() as Promise<EEResponse<T>>
  }

  async getPersons(page = 1, perPage = 50): Promise<EEResponse<EEPerson>> {
    return this.get<EEPerson>('/persons', { page: String(page), per_page: String(perPage) })
  }

  async getFlights(page = 1, perPage = 50): Promise<EEResponse<EEFlight>> {
    return this.get<EEFlight>('/flights', { page: String(page), per_page: String(perPage) })
  }

  async getDocuments(page = 1, perPage = 50): Promise<EEResponse<EEDocument>> {
    return this.get<EEDocument>('/documents', { page: String(page), per_page: String(perPage) })
  }
}
```

- [ ] **Step 3: Create Wave 2 ingestion script**

Create `webapp/scripts/ingest-wave-2.ts` following the same pattern as Wave 1 but:
- Uses `EpsteinExposedClient` to paginate through API
- Saves resume state after each page (resumable via `quality.ts` helpers)
- Maps EE response types to Neo4j labels
- Deduplicates against existing graph (now includes Wave 1 data)
- Rate-limited: ~36s between requests, full run takes ~2-3 hours
- Creates relationships from flight passenger lists (FLEW_WITH edges)

- [ ] **Step 4: Commit**

```bash
git add webapp/src/lib/ingestion/epstein-exposed-client.ts webapp/scripts/ingest-wave-2.ts
git commit -m "feat: add Wave 2 Epstein Exposed API client and ingestion script"
```

---

### Task 8: Wave 3 — Document Content Enrichment

**Files:**
- Create: `webapp/scripts/ingest-wave-3.ts`

- [ ] **Step 1: Install pdf-parse**

```bash
cd webapp && npm install pdf-parse
```

- [ ] **Step 2: Create Wave 3 ingestion script**

Create `webapp/scripts/ingest-wave-3.ts` that:
1. Queries Neo4j for documents ordered by connection count (most-connected first)
2. Limits to top 100 documents (configurable via `--limit` arg)
3. Skips documents that already have a `content` property
4. For each document, tries to fetch full text from sources in order:
   - CourtListener API: `GET /api/rest/v4/search/?type=o&q={title}` → get opinion text
   - DocumentCloud API: `GET /api/documents/search/?q={title}` → get full text
   - DOJ EFTA URL: if source_url matches DOJ pattern, download PDF, extract text with pdf-parse
5. Stores extracted text as `content` property on the Document node
6. Runs basic key findings extraction (regex for dollar amounts, dates, person names)
7. Tags with `ingestion_wave: 3, content_source: 'courtlistener' | 'documentcloud' | 'doj'`

- [ ] **Step 3: Commit**

```bash
git add webapp/scripts/ingest-wave-3.ts
git commit -m "feat: add Wave 3 document content enrichment script"
```

---

### Task 9: Query Layer — Add Confidence Filtering

**Files:**
- Modify: `webapp/src/lib/caso-epstein/queries.ts`

- [ ] **Step 1: Add confidence tier filter to getInvestigationGraph**

Modify the `getInvestigationGraph` function signature:

```typescript
import type { ConfidenceTier } from './types'

export async function getInvestigationGraph(
  casoSlug: string,
  tiers?: ConfidenceTier[],
): Promise<GraphData> {
```

Update the Cypher WHERE clause to filter by tier when provided:

```cypher
MATCH (n)
WHERE n.caso_slug = $casoSlug
  AND (size($tiers) = 0 OR n.confidence_tier IN $tiers)
```

Pass `{ casoSlug, tiers: tiers ?? [] }` as params.

- [ ] **Step 2: Add same filter to getActors, getDocuments, getTimeline**

Same pattern: add optional `tiers` parameter, append tier filter to WHERE clauses.

- [ ] **Step 3: Update toPersonProps and other mappers to include tier fields**

In the `toPersonProps`, `toDocumentProps`, etc. functions, add:

```typescript
confidence_tier: typeof p.confidence_tier === 'string' ? p.confidence_tier : undefined,
source: typeof p.source === 'string' ? p.source : undefined,
ingestion_wave: typeof p.ingestion_wave === 'number' ? p.ingestion_wave : undefined,
```

- [ ] **Step 4: Commit**

```bash
git add webapp/src/lib/caso-epstein/queries.ts
git commit -m "feat: add confidence tier filtering to investigation queries"
```

---

### Task 10: UI — Confidence Filter and Source Badges

**Files:**
- Modify: `webapp/src/app/caso/[slug]/grafo/page.tsx`
- Modify: `webapp/src/components/investigation/EvidenceExplorer.tsx`
- Modify: `webapp/src/components/investigation/DocumentCard.tsx`
- Modify: `webapp/src/components/graph/ForceGraph.tsx`

- [ ] **Step 1: Add confidence filter state to graph page**

In `webapp/src/app/caso/[slug]/grafo/page.tsx`, add a filter dropdown above the graph:

```tsx
const [tierFilter, setTierFilter] = useState<string>('all')
const filterOptions = [
  { value: 'all', label: 'All data' },
  { value: 'gold_silver', label: 'Verified only' },
  { value: 'gold', label: 'Gold only' },
]
```

Render a `<select>` element in the toolbar. Map filter value to tier array and pass to data-fetching.

- [ ] **Step 2: Add bronze node styling to ForceGraph**

In `webapp/src/components/graph/ForceGraph.tsx`, modify node rendering to show bronze nodes with reduced opacity:

```typescript
const isBronze = (node as GraphNode).properties?.confidence_tier === 'bronze'
ctx.globalAlpha = isBronze ? 0.5 : 1.0
// ... draw node ...
ctx.globalAlpha = 1.0 // reset
```

- [ ] **Step 3: Add source badge to DocumentCard**

In `webapp/src/components/investigation/DocumentCard.tsx`, add a small badge for non-gold documents:

```tsx
{doc.confidence_tier && doc.confidence_tier !== 'gold' && (
  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
    {doc.confidence_tier === 'silver' ? '✓' : 'unverified'} · {doc.source}
  </span>
)}
```

- [ ] **Step 4: Add confidence filter to EvidenceExplorer**

Same dropdown pattern as the graph page. Filter documents client-side by `confidence_tier`.

- [ ] **Step 5: Commit**

```bash
git add webapp/src/app/caso/[slug]/grafo/page.tsx webapp/src/components/graph/ForceGraph.tsx webapp/src/components/investigation/DocumentCard.tsx webapp/src/components/investigation/EvidenceExplorer.tsx
git commit -m "feat: add confidence tier filtering and source badges to UI"
```

---

### Task 11: Add package.json scripts and .gitignore entry

**Files:**
- Modify: `webapp/package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add ingestion scripts to package.json**

```json
"ingest:backfill": "npx tsx scripts/backfill-tiers.ts",
"ingest:wave1": "npx tsx scripts/ingest-wave-1.ts",
"ingest:wave2": "npx tsx scripts/ingest-wave-2.ts",
"ingest:wave3": "npx tsx scripts/ingest-wave-3.ts",
"ingest:review": "npx tsx scripts/review-wave.ts",
"ingest:promote": "npx tsx scripts/promote-nodes.ts"
```

- [ ] **Step 2: Add _ingestion_data to .gitignore**

```
_ingestion_data/
```

This directory contains downloaded repos and resume state — not tracked in git.

- [ ] **Step 3: Commit**

```bash
git add webapp/package.json .gitignore
git commit -m "chore: add ingestion scripts to package.json, gitignore ingestion data"
```
