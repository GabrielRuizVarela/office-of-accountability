# Plan B: Webapp Front Door — Investigation Creation + Review UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Users can create new investigations from the webapp (no CLI), upload data, and review pipeline proposals — all without code changes or deploys.

**Architecture:** Dynamic investigation registry replaces hardcoded Map. New creation wizard + data import UI. Existing engine dashboard gets usability improvements.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, TailwindCSS 4, Zod 4, neo4j-driver-lite

**Depends on:** Plan A (MCP tools + ingest API routes must exist)

---

## File Map

| File | Responsibility |
|---|---|
| `src/lib/investigations/registry.ts` | Modify: add dynamic Neo4j lookup with in-memory cache |
| `src/app/api/casos/create/route.ts` | New: POST creates InvestigationConfig + SchemaDefinition + initial nodes |
| `src/app/nuevo/page.tsx` | New: Investigation creation wizard (4 steps) |
| `src/components/investigation/SeedEntitySearch.tsx` | New: Cross-investigation entity search with type-ahead |
| `src/components/investigation/ScopeSelector.tsx` | New: 1-hop neighbor checkboxes |
| `src/components/investigation/DataImport.tsx` | New: Tabbed CSV/URL/paste import panel |
| `src/components/investigation/EntityPalette.tsx` | New: Sidebar entity type palette |
| `src/components/engine/PipelineStatus.tsx` | Modify: add polling + "Run Pipeline" loading state |
| `src/components/engine/ProposalReview.tsx` | Modify: add diff preview, source link, confidence badge |

---

## Task 1: Dynamic Investigation Registry

**Files:**
- Modify: `src/lib/investigations/registry.ts`

- [ ] **Step 1: Read current registry.ts**
Read the file to understand the current hardcoded Map pattern.

- [ ] **Step 2: Add dynamic Neo4j lookup with cache**

Add a `getClientConfigDynamic(casoSlug)` function that:
1. Checks in-memory cache (Map with 5-minute TTL)
2. Queries Neo4j: `MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c`
3. Builds `InvestigationClientConfig` from DB fields
4. Falls back to static registry for legacy cases (caso-epstein, caso-libra, caso-finanzas-politicas)

```typescript
const dynamicCache = new Map<string, { config: InvestigationClientConfig; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getClientConfigDynamic(casoSlug: string): Promise<InvestigationClientConfig | null> {
  // Check static registry first
  const staticConfig = getClientConfig(casoSlug)
  if (staticConfig) return staticConfig

  // Check cache
  const cached = dynamicCache.get(casoSlug)
  if (cached && cached.expires > Date.now()) return cached.config

  // Query Neo4j
  const driver = getDriver()
  const session = driver.session()
  try {
    const result = await session.run(
      'MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c',
      { slug: casoSlug },
    )
    if (result.records.length === 0) return null

    const props = result.records[0].get('c').properties
    const config: InvestigationClientConfig = {
      casoSlug: props.caso_slug,
      name: { es: props.name_es ?? props.name, en: props.name_en ?? props.name },
      description: { es: props.description_es ?? '', en: props.description_en ?? '' },
      tabs: ['resumen', 'investigacion', 'grafo', 'cronologia', 'evidencia'],
      features: {
        wallets: false,
        simulation: false,
        flights: false,
        submissions: true,
        platformGraph: true,
      },
      hero: {
        title: { es: props.name_es ?? props.name, en: props.name_en ?? props.name },
        subtitle: { es: props.description_es ?? '', en: props.description_en ?? '' },
      },
      sources: [],
    }

    dynamicCache.set(casoSlug, { config, expires: Date.now() + CACHE_TTL })
    return config
  } finally {
    await session.close()
  }
}
```

- [ ] **Step 3: Update `src/app/caso/[slug]/layout.tsx`**

Replace the static `getClientConfig(slug)` call with `await getClientConfigDynamic(slug)`. If null, return 404.

- [ ] **Step 4: Verify compilation and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: add dynamic investigation registry with Neo4j fallback"`

---

## Task 2: Investigation Creation API

**Files:**
- Create: `src/app/api/casos/create/route.ts`

- [ ] **Step 1: Create the creation endpoint**

POST body (Zod validated):
```typescript
{
  name_es: string,
  name_en: string,
  description_es?: string,
  description_en?: string,
  tags?: string[],
  seed_entity_id?: string, // existing node ID to fork into new investigation
  node_types?: Array<{ name: string, color?: string, icon?: string }>,
}
```

The route should:
1. Generate `caso_slug` from name_es: lowercase, replace spaces with hyphens, strip accents, prefix with "caso-"
2. Check slug uniqueness: `MATCH (c:InvestigationConfig {caso_slug: $slug}) RETURN c`
3. Create InvestigationConfig node with all metadata
4. Create SchemaDefinition node linked via HAS_SCHEMA
5. Create default NodeTypeDefinition nodes (Person, Organization, Event, Document, Location) + any custom types from `node_types`
6. Create default RelTypeDefinition nodes (ASSOCIATED_WITH, AFFILIATED_WITH, PARTICIPATED_IN, MENTIONED_IN, DOCUMENTED_BY)
7. If `seed_entity_id` provided: copy that node and its 1-hop neighbors into the new caso_slug namespace
8. Return: `{ success: true, data: { caso_slug, investigation_config_id } }`

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat(api): add investigation creation endpoint"`

---

## Task 3: Investigation Creation Wizard Page

**Files:**
- Create: `src/app/nuevo/page.tsx`
- Create: `src/components/investigation/SeedEntitySearch.tsx`
- Create: `src/components/investigation/ScopeSelector.tsx`

- [ ] **Step 1: Create SeedEntitySearch component**

Client component that:
- Has a text input with debounced search (300ms)
- Calls `GET /api/graph/search?q=${query}` on input
- Displays results as clickable cards with: name, label, caso_slug, connection count
- On select: calls `onSelect(entity)` callback
- On "Create new": shows dropdown of entity types (Person, Organization, Event, Document, Location)
- Bilingual labels using LanguageContext

- [ ] **Step 2: Create ScopeSelector component**

Client component that:
- Receives a `seed_entity_id` prop
- Fetches 1-hop neighbors: `GET /api/graph/expand/${seed_entity_id}?depth=1`
- Displays neighbors as a checklist: checkbox + name + label badge
- Has "Select All" / "Deselect All" buttons
- Returns selected node IDs via `onSelectionChange` callback

- [ ] **Step 3: Create wizard page**

`src/app/nuevo/page.tsx` — a 4-step wizard:

**Step 1: Name & Describe**
- Title (ES), Title (EN) — text inputs
- Description (optional) — textarea
- Tags — comma-separated input
- "Next" button

**Step 2: Seed Entity**
- SeedEntitySearch component
- "Skip" button (start empty)

**Step 3: Scope (only if seed selected)**
- ScopeSelector showing 1-hop neighbors
- "Include all" / "Start minimal" shortcuts

**Step 4: Confirm & Create**
- Summary of all selections
- "Create Investigation" button
- Calls POST `/api/casos/create`
- On success: redirect to `/caso/${caso_slug}`

Style: Follow existing page patterns. Use TailwindCSS 4. Keep it minimal and functional.

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: add investigation creation wizard with seed entity search"`

---

## Task 4: Data Import Panel

**Files:**
- Create: `src/components/investigation/DataImport.tsx`

- [ ] **Step 1: Create tabbed import component**

Client component with 3 tabs:

**Tab 1: Upload CSV**
- File input (accept .csv)
- FileReader reads content to string
- Column preview (first 3 rows displayed as table)
- Column mapping: for each CSV column, dropdown to select Neo4j property (name, role, description, nationality, etc.) or "Skip"
- Entity type selector (Person, Organization, etc.)
- "Import" button calls POST `/api/casos/${casoSlug}/engine/ingest/csv`
- Shows result: proposals created, conflicts

**Tab 2: Import URL**
- URL text input
- "Extract entities" checkbox
- "Import" button calls POST `/api/casos/${casoSlug}/engine/ingest/url`
- Shows result: title, summary, entities found

**Tab 3: Add Entity**
- Entity type dropdown
- Dynamic form fields based on type (Person: name, role, nationality; Organization: name, type; etc.)
- "Add" button calls POST `/api/casos/${casoSlug}/engine/ingest/entity`
- Shows confirmation with proposal_id

- [ ] **Step 2: Add DataImport tab to EngineDashboard**

Modify `src/components/engine/EngineDashboard.tsx`:
- Add a "Data" tab alongside existing Pipeline, Proposals, Audit, Snapshots, Orchestrator tabs
- Render DataImport in that tab

- [ ] **Step 3: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: add data import panel (CSV, URL, manual entity) to engine dashboard"`

---

## Task 5: Pipeline Status Improvements

**Files:**
- Modify: `src/components/engine/PipelineStatus.tsx`

- [ ] **Step 1: Add polling for pipeline status**

Add a `useEffect` with `setInterval(5000)` that polls `GET /api/casos/${casoSlug}/engine/state` when pipeline status is "running". Clear interval when stopped/completed/gate_pending.

- [ ] **Step 2: Add loading state to Run Pipeline button**

When "Run Pipeline" is clicked:
- Disable button, show spinner
- Call POST API
- On success: start polling
- On error: show error message, re-enable button

- [ ] **Step 3: Add stage progress display**

Show current stage name, progress percentage (from progress_json), and elapsed time.

- [ ] **Step 4: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: add pipeline polling, loading states, and stage progress to dashboard"`

---

## Task 6: Add "New Investigation" to Homepage

**Files:**
- Modify: `src/app/page.tsx` (or wherever the investigation list is rendered)

- [ ] **Step 1: Add button**

Add a "New Investigation" / "Nueva Investigacion" button that links to `/nuevo`. Place it prominently near the investigation list.

- [ ] **Step 2: Verify and commit**

Run: `npx tsc --noEmit`
Commit: `git commit -am "feat: add 'New Investigation' button to homepage"`

---

## Summary

| Task | Files | What it produces |
|---|---|---|
| 1. Dynamic Registry | 2 modified | Investigations created via API are immediately navigable |
| 2. Creation API | 1 new | POST endpoint creates full investigation structure in Neo4j |
| 3. Creation Wizard | 3 new | 4-step wizard: name → seed → scope → create |
| 4. Data Import Panel | 1 new + 1 modified | CSV/URL/manual entity import in dashboard |
| 5. Pipeline Status | 1 modified | Polling, loading states, progress display |
| 6. Homepage Button | 1 modified | Entry point for new investigations |
