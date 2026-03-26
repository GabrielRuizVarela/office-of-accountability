# Plan C: Engine Consolidation - MiroFish Absorption + Graph Algorithms + Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Absorb MiroFish analysis functions into the engine, implement the stub graph algorithms, delete dead simulation code, and repurpose the /simular page.

**Architecture:** Move working analysis code from `src/lib/mirofish/` into `src/lib/engine/analysis/`. Implement 5 graph algorithms in TypeScript. Delete dead simulation infrastructure.

**Tech Stack:** Next.js 16, Neo4j 5, TypeScript, neo4j-driver-lite

**Can run in parallel with Plan B after Task 1 (dead code cleanup).**

---

## File Map

### Files to Delete (MiroFish Simulation - Dead Code)

| File | Reason |
|---|---|
| `src/lib/mirofish/client.ts` | Swarm API stubs, backend never deployed |
| `src/lib/mirofish/export.ts` | Seed export for non-existent backend |
| `src/lib/mirofish/types.ts` | Simulation types, unused |
| `src/components/investigation/SimulationPanel.tsx` | Dead component, never rendered |
| `src/components/investigation/AgentChat.tsx` | Dead component |
| `src/components/investigation/ScenarioInput.tsx` | Dead component |
| `scripts/export-caso-libra-seed.ts` | Export script for dead backend |

### Files to Move

| From | To | Reason |
|---|---|---|
| `src/lib/mirofish/analysis.ts` | `src/lib/engine/analysis/analysis.ts` | Working code, belongs in engine |
| `src/lib/mirofish/prompts.ts` | `src/lib/engine/analysis/prompts.ts` | Working code, belongs in engine |

### Files to Create

| File | Responsibility |
|---|---|
| `src/lib/engine/analysis/index.ts` | Barrel export for analysis module |
| `src/lib/engine/algorithms/centrality.ts` | Degree + betweenness centrality |
| `src/lib/engine/algorithms/community.ts` | Label propagation community detection |
| `src/lib/engine/algorithms/temporal.ts` | Event co-occurrence within time windows |
| `src/lib/engine/algorithms/anomaly.ts` | Statistical outlier detection |
| `src/lib/engine/algorithms/index.ts` | Barrel export for algorithms |

### Files to Modify

| File | Change |
|---|---|
| `src/app/caso/[slug]/simular/page.tsx` | Repurpose from "Coming Soon" to "What-If" analysis |
| `src/app/api/casos/[casoSlug]/engine/analyze/run/route.ts` | Wire algorithm calls for centrality/temporal/anomaly |
| `scripts/run-investigation-loop.ts` | Update imports from mirofish → engine/analysis |
| `src/lib/engine/types.ts` | Remove MiroFishConfig type |
| `src/lib/engine/config.ts` | Remove MiroFishConfig CRUD |
| `scripts/init-schema.ts` | Remove MiroFishConfig constraint |

---

## Task 1: Delete Dead MiroFish Simulation Code

**Files to delete:**
- `src/lib/mirofish/client.ts`
- `src/lib/mirofish/export.ts`
- `src/lib/mirofish/types.ts`
- `src/components/investigation/SimulationPanel.tsx`
- `src/components/investigation/AgentChat.tsx`
- `src/components/investigation/ScenarioInput.tsx`
- `scripts/export-caso-libra-seed.ts`

- [ ] **Step 1: Check for any live imports of these files**

Run grep for imports of each file to make sure nothing references them:
```bash
grep -r "mirofish/client" src/ --include="*.ts" --include="*.tsx"
grep -r "mirofish/export" src/ --include="*.ts" --include="*.tsx"
grep -r "mirofish/types" src/ --include="*.ts" --include="*.tsx"
grep -r "SimulationPanel" src/ --include="*.ts" --include="*.tsx"
grep -r "AgentChat" src/ --include="*.ts" --include="*.tsx"
grep -r "ScenarioInput" src/ --include="*.ts" --include="*.tsx"
grep -r "export-caso-libra-seed" scripts/ --include="*.ts"
```

If any file imports them, remove the import first.

- [ ] **Step 2: Delete the files**

```bash
rm src/lib/mirofish/client.ts
rm src/lib/mirofish/export.ts
rm src/lib/mirofish/types.ts
rm src/components/investigation/SimulationPanel.tsx
rm src/components/investigation/AgentChat.tsx
rm src/components/investigation/ScenarioInput.tsx
rm scripts/export-caso-libra-seed.ts
```

- [ ] **Step 3: Check if mirofish/index.ts re-exports deleted files**

Read `src/lib/mirofish/index.ts` and remove any re-exports of deleted files. Keep exports of `analysis.ts` and `prompts.ts`.

- [ ] **Step 4: Remove MiroFishConfig from engine types**

Read `src/lib/engine/types.ts`, find and remove the MiroFishConfig Zod schema and TypeScript type. Also remove it from any union types or exports.

Read `src/lib/engine/config.ts`, find and remove MiroFishConfig CRUD functions (getMiroFishConfig, saveMiroFishConfig, etc.).

Read `scripts/init-schema.ts`, find and remove the MiroFishConfig.id uniqueness constraint.

- [ ] **Step 5: Remove simulation API routes if they exist**

Check if these exist and delete:
- `src/app/api/caso-libra/simulate/` (entire directory)
- Any simulation-specific routes under `src/app/api/caso/[slug]/simulation/`

Check for imports first.

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit`
Fix any remaining broken imports.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: delete dead MiroFish simulation code (7 files, MiroFishConfig type)

Removed: client.ts, export.ts, types.ts, SimulationPanel, AgentChat,
ScenarioInput, export-caso-libra-seed script, MiroFishConfig from engine."
```

---

## Task 2: Move MiroFish Analysis into Engine

**Files:**
- Move: `src/lib/mirofish/analysis.ts` → `src/lib/engine/analysis/analysis.ts`
- Move: `src/lib/mirofish/prompts.ts` → `src/lib/engine/analysis/prompts.ts`
- Create: `src/lib/engine/analysis/index.ts`

- [ ] **Step 1: Create engine/analysis directory and move files**

```bash
mkdir -p src/lib/engine/analysis
cp src/lib/mirofish/analysis.ts src/lib/engine/analysis/analysis.ts
cp src/lib/mirofish/prompts.ts src/lib/engine/analysis/prompts.ts
```

- [ ] **Step 2: Update imports in the moved files**

Read the moved files. Update any imports that reference `../mirofish/` to use relative paths within `engine/analysis/`. For example:
- `import { ... } from './prompts'` (should already work if both files moved together)
- Any imports of `../neo4j/client` should become `../../neo4j/client`

- [ ] **Step 3: Create barrel export**

```typescript
// src/lib/engine/analysis/index.ts
export { analyzeProcurementAnomalies, analyzeOwnershipChains, analyzePoliticalConnections } from './analysis'
```

- [ ] **Step 4: Update consumers**

Read `scripts/run-investigation-loop.ts` and update any imports:
```typescript
// Before: import { ... } from '../src/lib/mirofish/analysis'
// After:  import { ... } from '../src/lib/engine/analysis'
```

- [ ] **Step 5: Delete old mirofish analysis files**

```bash
rm src/lib/mirofish/analysis.ts
rm src/lib/mirofish/prompts.ts
```

If `src/lib/mirofish/` directory is now empty (or only has index.ts with nothing to export), delete the entire directory:
```bash
rm -rf src/lib/mirofish/
```

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "refactor: move MiroFish analysis into engine/analysis module"`

---

## Task 3: Implement Graph Algorithms

**Files:**
- Create: `src/lib/engine/algorithms/centrality.ts`
- Create: `src/lib/engine/algorithms/community.ts`
- Create: `src/lib/engine/algorithms/temporal.ts`
- Create: `src/lib/engine/algorithms/anomaly.ts`
- Create: `src/lib/engine/algorithms/index.ts`

Read the existing stub files in `src/lib/engine/algorithms/` first to understand what types are defined. Then replace with real implementations.

- [ ] **Step 1: Implement centrality.ts**

```typescript
// src/lib/engine/algorithms/centrality.ts
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

export interface CentralityResult {
  id: string
  name: string
  label: string
  degree: number
}

/**
 * Degree centrality - count relationships per node.
 * Returns top N nodes by connection count.
 */
export async function degreeCentrality(
  casoSlug: string,
  limit: number = 50,
): Promise<CentralityResult[]> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (n {caso_slug: $casoSlug})-[r]-()
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label, count(r) AS degree
       ORDER BY degree DESC
       LIMIT $limit`,
      { casoSlug, limit: neo4j.int(limit) },
    )
    return result.records.map(r => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      label: r.get('label') as string,
      degree: (r.get('degree') as { toNumber(): number }).toNumber(),
    }))
  } finally {
    await session.close()
  }
}

export interface BetweennessResult {
  id: string
  name: string
  label: string
  betweenness: number
}

/**
 * Approximate betweenness centrality.
 * Samples K random source nodes, runs shortest paths,
 * counts how often each node appears as intermediary.
 */
export async function betweennessCentrality(
  casoSlug: string,
  sampleSize: number = 50,
  limit: number = 30,
): Promise<BetweennessResult[]> {
  const driver = getDriver()
  const session = driver.session()
  try {
    // Get random sample of source nodes
    const sources = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE (n)-[]-()
       WITH n, rand() AS r
       ORDER BY r
       LIMIT $sample
       RETURN n.id AS id`,
      { casoSlug, sample: neo4j.int(sampleSize) },
    )

    const sourceIds = sources.records.map(r => r.get('id') as string)

    // For each pair, find shortest path and count intermediaries
    const betweenness = new Map<string, { name: string; label: string; count: number }>()

    // Process in batches to avoid timeout
    for (let i = 0; i < sourceIds.length; i++) {
      const paths = await session.run(
        `MATCH (start {id: $sourceId, caso_slug: $casoSlug})
         MATCH (end {caso_slug: $casoSlug})
         WHERE end.id <> $sourceId AND (end)-[]-()
         WITH start, end, rand() AS r
         ORDER BY r LIMIT 10
         MATCH path = shortestPath((start)-[*..6]-(end))
         UNWIND nodes(path) AS intermediate
         WHERE intermediate <> start AND intermediate <> end
         RETURN intermediate.id AS id, intermediate.name AS name,
                labels(intermediate)[0] AS label, count(*) AS appearances`,
        { sourceId: sourceIds[i], casoSlug },
      )

      for (const r of paths.records) {
        const id = r.get('id') as string
        const existing = betweenness.get(id)
        const appearances = (r.get('appearances') as { toNumber(): number }).toNumber()
        if (existing) {
          existing.count += appearances
        } else {
          betweenness.set(id, {
            name: r.get('name') as string,
            label: r.get('label') as string,
            count: appearances,
          })
        }
      }
    }

    return Array.from(betweenness.entries())
      .map(([id, data]) => ({ id, ...data, betweenness: data.count }))
      .sort((a, b) => b.betweenness - a.betweenness)
      .slice(0, limit)
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 2: Implement community.ts**

```typescript
// src/lib/engine/algorithms/community.ts
import { getDriver } from '@/lib/neo4j/client'

export interface Community {
  id: number
  members: Array<{ id: string; name: string; label: string }>
  size: number
}

/**
 * Label propagation community detection.
 * Each node adopts the most common community label among its neighbors.
 * Runs in-memory on node/edge data fetched from Neo4j.
 */
export async function detectCommunities(
  casoSlug: string,
  maxIterations: number = 20,
): Promise<Community[]> {
  const driver = getDriver()
  const session = driver.session()
  try {
    // Fetch all nodes
    const nodesResult = await session.run(
      `MATCH (n {caso_slug: $casoSlug})
       WHERE (n)-[]-()
       RETURN n.id AS id, n.name AS name, labels(n)[0] AS label
       LIMIT 5000`,
      { casoSlug },
    )

    // Fetch all edges (as pairs of IDs)
    const edgesResult = await session.run(
      `MATCH (a {caso_slug: $casoSlug})-[r]-(b {caso_slug: $casoSlug})
       WHERE id(a) < id(b)
       RETURN a.id AS source, b.id AS target
       LIMIT 20000`,
      { casoSlug },
    )

    // Build adjacency list
    const nodes = nodesResult.records.map(r => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      label: r.get('label') as string,
    }))

    const adjacency = new Map<string, string[]>()
    for (const node of nodes) {
      adjacency.set(node.id, [])
    }
    for (const r of edgesResult.records) {
      const source = r.get('source') as string
      const target = r.get('target') as string
      adjacency.get(source)?.push(target)
      adjacency.get(target)?.push(source)
    }

    // Initialize: each node is its own community
    const communityOf = new Map<string, number>()
    nodes.forEach((n, i) => communityOf.set(n.id, i))

    // Iterate
    for (let iter = 0; iter < maxIterations; iter++) {
      let changed = false
      // Shuffle nodes for randomness
      const shuffled = [...nodes].sort(() => Math.random() - 0.5)

      for (const node of shuffled) {
        const neighbors = adjacency.get(node.id) ?? []
        if (neighbors.length === 0) continue

        // Count community labels among neighbors
        const counts = new Map<number, number>()
        for (const nId of neighbors) {
          const comm = communityOf.get(nId) ?? 0
          counts.set(comm, (counts.get(comm) ?? 0) + 1)
        }

        // Adopt most common
        let maxCount = 0
        let maxComm = communityOf.get(node.id) ?? 0
        for (const [comm, count] of counts) {
          if (count > maxCount) {
            maxCount = count
            maxComm = comm
          }
        }

        const current = communityOf.get(node.id)
        if (current !== maxComm) {
          communityOf.set(node.id, maxComm)
          changed = true
        }
      }

      if (!changed) break
    }

    // Group by community
    const groups = new Map<number, Array<{ id: string; name: string; label: string }>>()
    for (const node of nodes) {
      const comm = communityOf.get(node.id) ?? 0
      if (!groups.has(comm)) groups.set(comm, [])
      groups.get(comm)!.push(node)
    }

    // Filter out single-member communities, sort by size
    return Array.from(groups.entries())
      .filter(([, members]) => members.length > 1)
      .map(([id, members]) => ({ id, members, size: members.length }))
      .sort((a, b) => b.size - a.size)
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Implement temporal.ts**

```typescript
// src/lib/engine/algorithms/temporal.ts
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

export interface TemporalCluster {
  window_start: string
  window_end: string
  events: Array<{ id: string; title: string; date: string }>
}

/**
 * Find event co-occurrences within configurable time windows.
 * Groups events that fall within N days of each other.
 */
export async function findTemporalClusters(
  casoSlug: string,
  windowDays: number = 7,
  minClusterSize: number = 2,
): Promise<TemporalCluster[]> {
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      `MATCH (e:Event {caso_slug: $casoSlug})
       WHERE e.date IS NOT NULL
       RETURN e.id AS id, e.title AS title, e.date AS date
       ORDER BY e.date`,
      { casoSlug },
    )

    const events = result.records.map(r => ({
      id: r.get('id') as string,
      title: r.get('title') as string,
      date: r.get('date') as string,
    }))

    if (events.length < 2) return []

    // Sliding window clustering
    const clusters: TemporalCluster[] = []
    let i = 0

    while (i < events.length) {
      const windowStart = new Date(events[i].date)
      const windowEnd = new Date(windowStart.getTime() + windowDays * 86400000)
      const cluster: typeof events = [events[i]]

      let j = i + 1
      while (j < events.length && new Date(events[j].date) <= windowEnd) {
        cluster.push(events[j])
        j++
      }

      if (cluster.length >= minClusterSize) {
        clusters.push({
          window_start: events[i].date,
          window_end: cluster[cluster.length - 1].date,
          events: cluster,
        })
      }

      // Move past this cluster
      i = j > i + 1 ? j : i + 1
    }

    return clusters
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 4: Implement anomaly.ts**

```typescript
// src/lib/engine/algorithms/anomaly.ts
import { getDriver } from '@/lib/neo4j/client'
import neo4j from 'neo4j-driver-lite'

export interface Anomaly {
  type: 'high_degree' | 'isolated_cluster' | 'temporal_gap' | 'tier_mismatch'
  description: string
  node_ids: string[]
  severity: number // 0-1
}

/**
 * Detect statistical anomalies in the graph.
 * - High-degree outliers (> 3 std deviations)
 * - Isolated clusters (< 3 nodes)
 * - Nodes with many connections but still bronze tier
 */
export async function detectAnomalies(casoSlug: string): Promise<Anomaly[]> {
  const driver = getDriver()
  const session = driver.session()
  const anomalies: Anomaly[] = []

  try {
    // 1. High-degree outliers
    const degrees = await session.run(
      `MATCH (n {caso_slug: $casoSlug})-[r]-()
       RETURN n.id AS id, n.name AS name, count(r) AS degree
       ORDER BY degree DESC`,
      { casoSlug },
    )

    const degreeValues = degrees.records.map(r =>
      (r.get('degree') as { toNumber(): number }).toNumber(),
    )

    if (degreeValues.length > 0) {
      const mean = degreeValues.reduce((a, b) => a + b, 0) / degreeValues.length
      const stdDev = Math.sqrt(
        degreeValues.reduce((sum, d) => sum + (d - mean) ** 2, 0) / degreeValues.length,
      )
      const threshold = mean + 3 * stdDev

      for (const r of degrees.records) {
        const degree = (r.get('degree') as { toNumber(): number }).toNumber()
        if (degree > threshold) {
          anomalies.push({
            type: 'high_degree',
            description: `"${r.get('name')}" has ${degree} connections (mean: ${mean.toFixed(1)}, threshold: ${threshold.toFixed(1)})`,
            node_ids: [r.get('id') as string],
            severity: Math.min(1, (degree - threshold) / threshold),
          })
        }
      }
    }

    // 2. Tier mismatch - nodes with many connections but still bronze
    const tierMismatch = await session.run(
      `MATCH (n {caso_slug: $casoSlug, confidence_tier: 'bronze'})-[r]-()
       WITH n, count(r) AS degree
       WHERE degree > 5
       RETURN n.id AS id, n.name AS name, degree
       ORDER BY degree DESC
       LIMIT ${neo4j.int(20)}`,
      { casoSlug },
    )

    for (const r of tierMismatch.records) {
      anomalies.push({
        type: 'tier_mismatch',
        description: `"${r.get('name')}" has ${(r.get('degree') as { toNumber(): number }).toNumber()} connections but is still bronze tier`,
        node_ids: [r.get('id') as string],
        severity: 0.6,
      })
    }

    return anomalies.sort((a, b) => b.severity - a.severity)
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 5: Create algorithms barrel export**

```typescript
// src/lib/engine/algorithms/index.ts
export { degreeCentrality, betweennessCentrality } from './centrality'
export type { CentralityResult, BetweennessResult } from './centrality'
export { detectCommunities } from './community'
export type { Community } from './community'
export { findTemporalClusters } from './temporal'
export type { TemporalCluster } from './temporal'
export { detectAnomalies } from './anomaly'
export type { Anomaly } from './anomaly'
```

- [ ] **Step 6: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat(engine): implement 5 graph algorithms (centrality, community, temporal, anomaly)"`

---

## Task 4: Wire Algorithms into Analyze Route

**Files:**
- Modify: `src/app/api/casos/[casoSlug]/engine/analyze/run/route.ts`

- [ ] **Step 1: Update the analyze/run route**

Replace the placeholder implementations for centrality and temporal with calls to the new algorithm modules. Add community and anomaly as new analysis types.

Update the `type` enum in the Zod schema to include: `'procurement' | 'ownership' | 'connections' | 'temporal' | 'centrality' | 'community' | 'anomaly'`

Wire each type to its algorithm function:
- `centrality` → `degreeCentrality(casoSlug)`
- `temporal` → `findTemporalClusters(casoSlug)`
- `community` → `detectCommunities(casoSlug)`
- `anomaly` → `detectAnomalies(casoSlug)`
- `procurement`, `ownership`, `connections` → return graph summary + LLM-required message (unchanged)

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: wire graph algorithms into analyze/run API route"`

---

## Task 5: Repurpose /simular Page

**Files:**
- Modify: `src/app/caso/[slug]/simular/page.tsx`

- [ ] **Step 1: Replace "Coming Soon" with "What-If" analysis**

Replace the static content with an interactive page:
- Text input: "What would happen if..." / "Que pasaria si..."
- Submit button
- On submit: call the webapp's built-in LLM (if available) or display a message directing users to use the graph explorer for now
- Show graph stats (node counts, tier breakdown) as context
- Show top 5 centrality nodes as "Key Actors"
- Show detected anomalies as "Patterns Found"

Keep it simple - this is a stepping stone. The real analysis happens through MCP tools where the external LLM does the heavy lifting.

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: repurpose /simular from 'Coming Soon' to 'What-If' analysis page"`

---

## Summary

| Task | Files | What it produces |
|---|---|---|
| 1. Delete dead code | 7+ deleted, 3 modified | Clean codebase, no phantom imports |
| 2. Move analysis | 2 moved, 1 created, 1+ modified | Analysis lives in engine where it belongs |
| 3. Graph algorithms | 5 new | Real implementations for centrality, community, temporal, anomaly |
| 4. Wire algorithms | 1 modified | analyze/run route calls real algorithms |
| 5. Repurpose /simular | 1 modified | Interactive analysis page replaces dead "Coming Soon" |

**Delegation note:** All 5 tasks in this plan are suitable for Ralph - they're well-scoped, follow existing patterns, and have clear acceptance criteria.
