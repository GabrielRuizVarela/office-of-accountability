# Plan: Complete M9 Investigation Standardization (remaining frontend + backend tasks)

M10 engine work is complete. Remaining work is M9 standardization: making the frontend and backend fully generic across all 3 investigations.

## Current Step: Step 1 — Fix blocking issues + backend completions

### Sub-tasks:
- [x] 1.1 Fix TypeScript errors in EvidenceExplorer.tsx — `date` → `datePublished` prop (file: webapp/src/components/investigation/EvidenceExplorer.tsx)
- [x] 1.2 Update caso-libra queries.ts to use generic labels + caso_slug filter (file: webapp/src/lib/caso-libra/queries.ts)
- [x] 1.3 Create caso-finanzas-politicas backend module — types.ts, queries.ts, transform.ts (files: webapp/src/lib/caso-finanzas-politicas/{types,queries,transform}.ts)
- [x] 1.4 Replace remaining caso-libra API routes with 301 redirects (files: webapp/src/app/api/caso-libra/*/route.ts — investigation, wallets, person/[actorSlug])
- [x] 1.5 Update graph constants — add ShellCompany, Aircraft, Wallet, Token, Claim, MoneyFlow, GovernmentAction to LABEL_COLORS + LABEL_DISPLAY (file: webapp/src/lib/graph/constants.ts)

### Notes:
- caso-libra queries still use CasoLibraPerson/CasoLibraEvent etc. labels — need to switch to Person {caso_slug: 'caso-libra'}
- EvidenceExplorer has 2 TS errors blocking typecheck
- finanzas-politicas only has config.ts + investigation-data.ts, needs types/queries/transform

## Step 2 — Fix shared component imports
- [ ] 2.1 Update EventCard.tsx imports from caso-libra/types → investigations/types
- [ ] 2.2 Update Timeline.tsx imports from caso-libra/types → investigations/types

## Step 3 — Fix remaining TS errors in pages/OG (6 errors, 4 files)
- [ ] 3.1 Fix [slug]/page.tsx — pass slug to getStats, getActors, getDocuments (3 errors)
- [ ] 3.2 Fix [slug]/cronologia/page.tsx — accept params, pass slug to getTimeline (1 error)
- [ ] 3.3 Fix [slug]/evidencia/page.tsx — pass slug to getDocuments (1 error)
- [ ] 3.4 Fix api/og/caso/[slug]/actor/[actorSlug]/route.tsx — pass slug to getPersonBySlug (1 error)

## Step 4 — Cleanup
- [ ] 4.1 Delete static case route folders (caso/caso-epstein/, caso/finanzas-politicas/)
- [ ] 4.2 Verify typecheck passes

## Completed Steps:
- 1.1: Aligned EvidenceExplorer props with DocumentCard interface: date→datePublished, casoSlug→investigationSlug, removed mentionedPersonCount/confidence_tier/source. tsc --noEmit passes clean. Commit c160ba9.

### Finalizer note (iteration after 1.1 review):
- review.passed for 1.1 confirmed. Task m9:fix-ts-errors already closed.
- Step 1 has 4 remaining sub-tasks (1.2–1.5). Advancing queue for Builder to pick up 1.2 next.

### Planner note (queue.advance → 1.2):
- Task m9:libra-queries (task-1774113360-c2ad) started.
- Builder guidance for 1.2: Update `webapp/src/lib/caso-libra/queries.ts` — replace all prefixed labels (CasoLibraPerson→Person, CasoLibraEvent→Event, CasoLibraDocument→Document, CasoLibraWallet→Wallet, CasoLibraOrganization→Organization, CasoLibraToken→Token) with generic labels + `caso_slug = $casoSlug` filter on every MATCH clause. Every exported function must accept a `casoSlug: string` parameter. Follow the pattern from `lib/investigations/query-builder.ts` (parameterized caso_slug, two-pass graph query, buildGraphData helper). The getStats hardcoded display strings (totalLossUsd etc.) should remain since they are caso-libra-specific — move them to a per-investigation config or keep inline. Keep CasoLibraStats type name in types.ts for now (rename is a separate task).

### Builder note (1.2 complete):
- Replaced all 6 CasoLibra* prefixed labels → generic labels (Person, Event, Document, Wallet, Organization, Token)
- Added `casoSlug: string` as first param to all 8 exported functions
- getInvestigationGraph now uses two-pass pattern (nodes first, rels second) matching query-builder.ts
- All MATCH clauses filter by `caso_slug = $casoSlug` (parameterized, no interpolation)
- getStats keeps hardcoded display strings (totalLossUsd etc.) inline — caso-libra-specific
- queries.ts itself has 0 TS errors; 9 caller errors in API routes + pages expected (tasks 1.4, 3.x)
- Commit 746189a

### Critic review (1.2):
- All 8 functions accept casoSlug, all Cypher parameterized, two-pass graph, caso_slug filter on every MATCH.
- tsc confirms 9 caller errors (all in API routes + pages, scoped to tasks 1.4/3.x). queries.ts clean.
- No blocking issues. review.passed.

### Finalizer note (iteration after 1.2 review):
- review.passed for 1.2 confirmed. Task m9:libra-queries closed.
- Step 1 has 3 remaining sub-tasks (1.3–1.5). Advancing queue for Builder to pick up 1.3 next.

### Planner note (queue.advance → 1.3):
- Task m9:finpol-backend (task-1774113360-ce0f) started.
- Builder guidance for 1.3: Create 4 files in `webapp/src/lib/caso-finanzas-politicas/`:

**1. types.ts** — Define domain types for Argentine political finance investigation:
- Node types: `FinPolPerson` (id, name, slug, role_es, role_en, description_es, description_en, party, nationality, datasets: number), `FinPolEvent` (id, title_es, title_en, date, description_es, description_en, category: 'political'|'financial'|'legal'|'corporate', sources: string[]), `FinPolDocument` (id, title, slug, doc_type, source_url, summary, date_published), `FinPolOrganization` (id, name, slug, org_type, description, country, datasets: string[]), `FinPolMoneyFlow` (id, from_label, to_label, amount_ars: number, description_es, description_en, date, source, source_url)
- Zod schemas for each type (z from 'zod/v4')
- RelationshipType union: 'DONATED_TO', 'CONTROLS', 'AFFILIATED_WITH', 'RECEIVED_FROM', 'CONTRACTED_BY', 'DIRECTED', 'APPOINTED'
- EventType = 'political' | 'financial' | 'legal' | 'corporate'
- EVENT_TYPE_COLORS, EVENT_TYPE_LABELS (bilingual labels in Spanish)
- TimelineItem interface (same shape as caso-libra: id, title, description, date, event_type, source_url, actors[])
- FinPolStats interface: crossDatasetMatches: string, politiciansMultiDataset: string, totalGraphNodes: string, actorCount: number, eventCount: number, documentCount: number
- Export CASO_FINPOL_SLUG = 'caso-finanzas-politicas'

**2. queries.ts** — Cypher queries following caso-libra post-genericization pattern:
- Same constants: QUERY_TIMEOUT_MS = 15_000, TX_CONFIG
- Same helpers: asString, asNumber, asOptionalString
- All functions take `casoSlug: string` as first param
- Implement: getInvestigationGraph (two-pass: nodes with Person|Event|Document|Organization|MoneyFlow labels + caso_slug filter, then rels), getTimeline, getPersonBySlug, getActors, getDocuments, getMoneyFlows (new — query MoneyFlow nodes with from/to relationships), getStats (return FinPolStats with count queries)
- Import from '../neo4j/client' (getDriver), '../graph/transform' (transformNode, transformRelationship)
- All Cypher MUST be parameterized (never interpolate)
- LIMIT values use neo4j.int(n) — import neo4j from 'neo4j-driver-lite'

**3. transform.ts** — Pure transform functions following caso-libra pattern:
- Helpers: asString, asOptionalString, asOptionalNumber
- Export: toPerson, toEvent, toDocument, toOrganization, toMoneyFlow
- Input: Record<string, unknown> (property bags, NOT Node objects — match caso-libra style)

**4. index.ts** — Barrel exports for all types, schemas, query functions, transforms, and CASO_FINPOL_SLUG

Key reference files:
- caso-libra/types.ts (L1-156) — Zod schema pattern
- caso-libra/queries.ts (L1-80+) — two-pass graph query, casoSlug pattern
- caso-libra/transform.ts (L1-108) — property bag transform pattern
- caso-finanzas-politicas/investigation-data.ts (L1-100) — seed data types for reference (FactcheckItem, TimelineEvent, Actor, MoneyFlow are the seed types; the new types.ts types are for Neo4j graph queries, not seed data)
- caso-finanzas-politicas/config.ts — tabs: resumen, investigacion, cronologia, dinero, conexiones; features.wallets=false, features.platformGraph=true

Note: investigation-data.ts already defines seed data types (FactcheckItem, TimelineEvent, Actor, MoneyFlow). The new types.ts defines Neo4j graph query result types — these are distinct. The seed types are for static data display; the graph types are for dynamic Neo4j queries. Don't duplicate or conflict with the seed types.

### Builder note (1.3 complete):
- Created 4 files: types.ts, queries.ts, transform.ts, index.ts in webapp/src/lib/caso-finanzas-politicas/
- types.ts: 5 Zod schemas (FinPolPerson, FinPolEvent, FinPolDocument, FinPolOrganization, FinPolMoneyFlow), CASO_FINPOL_SLUG constant, EventType with 'corporate' replacing caso-libra's 'media', EVENT_TYPE_COLORS/LABELS, TimelineItem, FinPolStats
- queries.ts: 7 exported functions (getInvestigationGraph, getTimeline, getPersonBySlug, getActors, getDocuments, getMoneyFlows, getStats) — all take casoSlug as first param, all Cypher parameterized, two-pass graph pattern, caso_slug filter on every MATCH
- transform.ts: 5 pure transforms (toPerson, toEvent, toDocument, toOrganization, toMoneyFlow) — property bag input matching caso-libra pattern
- index.ts: barrel exports for all types, schemas, queries, transforms, and CASO_FINPOL_SLUG
- Timeline maps title_es→title, description_es→description, category→event_type, sources[0]→source_url (bilingual field mapping)
- tsc --noEmit: same 9 pre-existing caller errors (tasks 1.4/3.x), 0 new errors from finpol files
- Commit a8fceb5

### Critic review (1.3):
- All 4 files created per spec: types.ts (5 Zod schemas), queries.ts (7 functions), transform.ts (5 transforms), index.ts (barrel).
- All Cypher parameterized, caso_slug filter on every MATCH, two-pass graph pattern.
- tsc: 9 pre-existing caller errors (tasks 1.4/3.x), 0 new errors from finpol files.
- No `any` types, no speculative code, no seed-type conflicts.
- No blocking issues. review.passed.

### Finalizer note (iteration after 1.3 review):
- review.passed for 1.3 confirmed. Task m9:finpol-backend closed.
- Step 1 has 2 remaining sub-tasks (1.4–1.5). Advancing queue for Builder to pick up 1.4 next.

### Planner note (queue.advance → 1.4):
- Task m9:libra-redirects (task-1774113360-d9b6) started.
- Builder guidance for 1.4: Convert the 3 caso-libra API routes with broken imports to 301 redirects, and create the corresponding generic routes under `/api/caso/[slug]/`. This fixes 3 of the 9 TS errors from task 1.2 (the other 6 are in pages/OG, handled by tasks 3.x).

**Current TS errors in scope:**
- `api/caso-libra/person/[actorSlug]/route.ts:21` — `getPersonBySlug(actorSlug)` → needs `(casoSlug, actorSlug)`
- `api/caso-libra/wallets/route.ts:12` — `getWalletFlows()` → needs `(casoSlug)`
- `api/caso-libra/document/[docSlug]/route.ts:21` — `getDocumentBySlug(docSlug)` → needs `(casoSlug, docSlug)`

**What to do — 6 files total (3 new generic routes + 3 converted redirects):**

**A. Create 3 new generic API routes under `webapp/src/app/api/caso/[slug]/`:**

1. **`person/[actorSlug]/route.ts`** — GET handler:
   - Extract `slug` and `actorSlug` from params
   - Validate slug via `getClientConfig(slug)` from `@/lib/investigations/registry`
   - Import `getPersonBySlug` from both `@/lib/caso-libra` and `@/lib/caso-finanzas-politicas`
   - Use a slug-based resolver: if `slug === 'caso-libra'` → call caso-libra's `getPersonBySlug(slug, actorSlug)`, if `slug === 'caso-finanzas-politicas'` → call finpol's, else use query-builder's `getNodeBySlug(slug, 'Person', actorSlug)` as fallback
   - Return `{ success: true, data }` or 404/500 following the pattern in `api/caso/[slug]/graph/route.ts`

2. **`wallets/route.ts`** — GET handler:
   - Extract `slug` from params
   - Validate slug via `getClientConfig(slug)`
   - Only caso-libra has wallets — if `slug === 'caso-libra'`, import and call `getWalletFlows(slug)` from `@/lib/caso-libra`
   - For other investigations, return `{ success: false, error: 'Wallets not available for this investigation' }` with 404
   - Follow the error handling pattern from `api/caso/[slug]/graph/route.ts`

3. **`document/[docSlug]/route.ts`** — GET handler:
   - Extract `slug` and `docSlug` from params
   - Validate slug via `getClientConfig(slug)`
   - Same resolver pattern as person: call caso-specific `getDocumentBySlug(slug, docSlug)` or fallback to query-builder's `getNodeBySlug(slug, 'Document', docSlug)`
   - Return `{ success: true, data }` or 404/500

**B. Convert 3 old routes to 301 redirects (follow the pattern in `api/caso-libra/graph/route.ts`):**

4. **`api/caso-libra/person/[actorSlug]/route.ts`** — strip old handler, redirect GET to `/api/caso/caso-libra/person/${actorSlug}`. Preserve query params.
5. **`api/caso-libra/wallets/route.ts`** — redirect GET to `/api/caso/caso-libra/wallets`
6. **`api/caso-libra/document/[docSlug]/route.ts`** — redirect GET to `/api/caso/caso-libra/document/${docSlug}`

**Leave alone:**
- `api/caso-libra/investigation/route.ts` — file-based submission API, no broken imports, case-specific. Not in scope.
- `api/caso-libra/simulate/*` — MiroFish proxy routes, no caso-libra query imports, no TS errors.
- `api/caso-libra/graph/route.ts` — already a 301 redirect ✓

**Also note (not in scope but tracked):**
- `api/og/caso/[slug]/actor/[actorSlug]/route.tsx:22` has the same `getPersonBySlug` error — this is an OG image route that should be fixed in step 3.4 alongside the actor page.

**Key reference files:**
- `api/caso-libra/graph/route.ts` — redirect pattern (301 with query param preservation)
- `api/caso/[slug]/graph/route.ts` — generic route pattern (getClientConfig + getQueryBuilder)
- `lib/caso-libra/queries.ts` — `getPersonBySlug(casoSlug, slug)`, `getWalletFlows(casoSlug)`, `getDocumentBySlug(casoSlug, slug)`
- `lib/caso-finanzas-politicas/queries.ts` — `getPersonBySlug(casoSlug, slug)`, `getDocuments(casoSlug)` (no getDocumentBySlug or getWalletFlows)
- `lib/investigations/query-builder.ts` — `getNodeBySlug(casoSlug, nodeType, slug)` as fallback

**Verification:** After changes, the 3 API route TS errors must be gone. Run `pnpm exec tsc --noEmit` from `webapp/` — expect 6 remaining errors (all in pages/OG, not API routes).

### Builder note (1.4 complete):
- Created 3 new generic routes: `api/caso/[slug]/person/[actorSlug]/route.ts`, `api/caso/[slug]/wallets/route.ts`, `api/caso/[slug]/document/[docSlug]/route.ts`
- Converted 3 old routes to 301 redirects: person, wallets, document under `api/caso-libra/`
- Generic person route dispatches to caso-libra or finpol via switch on slug
- Generic wallets route only serves caso-libra (404 for other slugs, matching config.features.wallets)
- Generic document route uses caso-libra's getDocumentBySlug (only impl with per-slug lookup)
- All redirects preserve query params and use encodeURIComponent for dynamic segments
- All generic routes follow the graph/route.ts pattern: getClientConfig validation, success envelope, Neo4j connection error detection (503)
- tsc --noEmit: 3 API route errors gone, 6 remaining errors all in pages/OG (tasks 3.x scope)
- Commit 79ca4d4

### Critic review (1.4):
- All 3 redirects follow existing graph/route.ts pattern exactly (NextRequest, query param preservation, 301).
- All 3 generic routes use getClientConfig validation, success envelope, 503 detection — matches graph/route.ts generic pattern.
- Person route dispatches by slug (libra, finpol, default→libra). Default is safe since post-1.2 libra queries are generic (use caso_slug param).
- Document route uses libra's getDocumentBySlug (only implementation with per-slug lookup) — also generic post-1.2.
- Wallets route correctly gates on slug === 'caso-libra' with 404 for others.
- tsc independently verified: 6 remaining errors, all pages/OG (tasks 3.x scope). 0 API route errors.
- No blocking issues. review.passed.

### Finalizer note (iteration after 1.4 review):
- review.passed for 1.4 confirmed. Task m9:libra-redirects closed.
- Step 1 has 1 remaining sub-task (1.5). Advancing queue for Builder to pick up 1.5 next.

### Planner note (queue.advance → 1.5):
- Task m9:graph-constants (task-1774113360-e583) started.
- Builder guidance for 1.5: Add missing node labels to `LABEL_COLORS` and `LABEL_DISPLAY` in `webapp/src/lib/graph/constants.ts`. Also add missing relationship types to `LINK_COLORS`.

**Add to LABEL_COLORS (after existing entries):**
- `ShellCompany: '#a855f7'` — purple-500 (corporate shell entities)
- `Aircraft: '#f97316'` — orange-500 (planes, matches Flight color family)
- `Wallet: '#22c55e'` — green-500 (crypto wallets)
- `Token: '#84cc16'` — lime-500 (crypto tokens, distinct from Wallet green)
- `Claim: '#f43f5e'` — rose-500 (legal claims)
- `MoneyFlow: '#14b8a6'` — teal-500 (financial flows)
- `GovernmentAction: '#6366f1'` — indigo-500 (government actions)

**Add to LABEL_DISPLAY (matching entries):**
- `ShellCompany: 'Empresa Fantasma'`
- `Aircraft: 'Aeronave'`
- `Wallet: 'Billetera'`
- `Token: 'Token'`
- `Claim: 'Reclamo'`
- `MoneyFlow: 'Flujo de Dinero'`
- `GovernmentAction: 'Accion Gubernamental'`

**Add to LINK_COLORS (finanzas-politicas relationship types):**
- `DONATED_TO: '#22c55e'` — green-500 (money flowing)
- `CONTROLS: '#dc2626'` — red-600 (power relationship)
- `RECEIVED_FROM: '#14b8a6'` — teal-500 (money received)
- `CONTRACTED_BY: '#f59e0b'` — amber-500 (contracts)
- `DIRECTED: '#8b5cf6'` — violet-500 (management)
- `APPOINTED: '#3b82f6'` — blue-500 (political appointment)

**Key reference:** `webapp/src/lib/graph/constants.ts` (L1-198) — current state of all maps.

**Do NOT modify:** helper functions, PERSON_CATEGORY_COLORS, SUBCATEGORY_CONFIGS, or any other existing entries.

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — should still have same 6 remaining errors (pages/OG scope). No new errors expected since this is additive-only.

### Builder note (1.5 complete):
- Added 7 node labels to LABEL_COLORS: ShellCompany (#a855f7), Aircraft (#f97316), Wallet (#22c55e), Token (#84cc16), Claim (#f43f5e), MoneyFlow (#14b8a6), GovernmentAction (#6366f1)
- Added matching 7 entries to LABEL_DISPLAY with Spanish names
- Added 6 finpol relationship types to LINK_COLORS: DONATED_TO, CONTROLS, RECEIVED_FROM, CONTRACTED_BY, DIRECTED, APPOINTED
- Additive-only change, no function modifications
- tsc --noEmit: same 6 pre-existing errors (all pages/OG, tasks 3.x scope), 0 new errors
- Commit 659d1b0

### Finalizer note (iteration after 1.5 review):
- review.passed for 1.5 confirmed. Task m9:graph-constants closed.
- Step 1 fully complete (all 5 sub-tasks 1.1–1.5 closed). Advancing to Step 2 — Fix shared component imports.
- 6 TS errors remain (all pages/OG, Steps 2–3 scope). Step 4 is final cleanup + verification.

### Planner note (queue.advance → 2.1):
- Step 1 complete. 6 TS errors remain (all pages/OG — Step 3 scope).
- Step 2 addresses shared components importing from caso-libra/types instead of a shared location. Not blocking typecheck, but required for correctness when rendering finpol events (EventType 'corporate' not in caso-libra's EventType).
- Two sub-tasks: 2.1 adds shared types, 2.2 updates component imports.

- Task m9:shared-event-types created for 2.1.
- Builder guidance for 2.1: Add shared EventType, EVENT_TYPE_COLORS, and EVENT_TYPE_LABELS to `webapp/src/lib/investigations/types.ts`.

**What to add (after the existing TimelineItem interface, around L90):**

1. **Shared EventType** — superset of caso-libra ('political'|'financial'|'legal'|'media') and finpol ('political'|'financial'|'legal'|'corporate'):
```typescript
export type EventType = 'political' | 'financial' | 'legal' | 'media' | 'corporate'
```

2. **Shared EVENT_TYPE_COLORS** — merge of both investigations' color maps:
```typescript
export const EVENT_TYPE_COLORS: Readonly<Record<EventType, string>> = {
  political: '#3b82f6',
  financial: '#10b981',
  legal: '#ef4444',
  media: '#a855f7',
  corporate: '#f59e0b',
}
```

3. **Shared EVENT_TYPE_LABELS** — merge of both investigations' label maps:
```typescript
export const EVENT_TYPE_LABELS: Readonly<Record<EventType, string>> = {
  political: 'Politico',
  financial: 'Financiero',
  legal: 'Legal',
  media: 'Medios',
  corporate: 'Corporativo',
}
```

4. **Update existing TimelineItem** — add `event_type` field so components can use it:
```typescript
export interface TimelineItem {
  readonly id: string
  readonly title: string | BilingualText
  readonly description: string | BilingualText
  readonly date: string
  readonly event_type?: EventType
  readonly category?: string
  readonly source_url?: string
  readonly actors?: readonly { readonly id: string; readonly name: string }[]
}
```

**Do NOT:**
- Remove or modify anything in caso-libra/types.ts or caso-finanzas-politicas/types.ts
- Change existing fields in TimelineItem (just add event_type)
- Touch any other types in investigations/types.ts

**Key reference files:**
- caso-libra/types.ts L46-47, L116-128 — caso-libra EventType + colors + labels
- caso-finanzas-politicas/types.ts L104-119 — finpol EventType + colors + labels
- investigations/types.ts L82-90 — existing TimelineItem

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — should still have same 6 errors (no new errors, these are additive exports).

### Builder note (2.1 complete):
- Added shared EventType = 'political' | 'financial' | 'legal' | 'media' | 'corporate' to investigations/types.ts
- Added EVENT_TYPE_COLORS and EVENT_TYPE_LABELS (superset of caso-libra + finpol maps)
- Added event_type?: EventType field to TimelineItem interface
- Placed after Timeline section (L91), before Stats section
- tsc --noEmit: same 6 pre-existing errors (pages/OG, tasks 3.x scope), 0 new errors
- Commit 6d1e2f5

### Critic review (2.1):
- All 4 additions per spec: shared EventType (5-member union), EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, event_type field on TimelineItem.
- Values match spec exactly (colors, labels, superset union of caso-libra + finpol).
- Additive-only, Readonly<Record<...>> for const maps, event_type optional.
- tsc independently verified: 6 pre-existing errors (all pages/OG, tasks 3.x scope), 0 new errors.
- No blocking issues. review.passed.

### Finalizer note (iteration after 2.1 review):
- review.passed for 2.1 confirmed. Task m9:shared-event-types already closed.
- Step 2 has 1 remaining sub-task (2.2). Advancing queue for Builder to pick up 2.2 next.

### Planner note (queue.advance → 2.2):
- Task m9:component-imports to be created for 2.2.
- Builder guidance for 2.2: Update EventCard.tsx and Timeline.tsx to import EventType, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS from `@/lib/investigations/types` instead of `@/lib/caso-libra/types`.

**Files to modify:**

1. **`webapp/src/components/investigation/EventCard.tsx`** (L9-10):
   - Change `import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/caso-libra/types'` → `import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/investigations/types'`
   - Change `import type { EventType } from '@/lib/caso-libra/types'` → `import type { EventType } from '@/lib/investigations/types'`

2. **`webapp/src/components/investigation/Timeline.tsx`** (L10-11):
   - Change `import type { TimelineItem, EventType } from '@/lib/caso-libra/types'` → `import type { TimelineItem, EventType } from '@/lib/investigations/types'`
   - Change `import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/caso-libra/types'` → `import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/investigations/types'`

**Note:** TimelineItem is already exported from `@/lib/investigations/types` (it was there before 2.1). EventType, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS were added in 2.1 (commit 6d1e2f5).

**Do NOT:**
- Remove EventType/EVENT_TYPE_COLORS/EVENT_TYPE_LABELS from caso-libra/types.ts (other code may still import from there)
- Modify any component logic — only change import paths

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — should still have same 6 errors (pages/OG scope). No new errors expected since shared types are a superset.

### Builder note (2.2 complete):
- Updated EventCard.tsx: imports EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, EventType from @/lib/investigations/types
- Updated Timeline.tsx: imports TimelineItem, EventType, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS from @/lib/investigations/types
- Also updated CronologiaContent.tsx: imports TimelineItem from @/lib/investigations/types (cascading — it passes data to Timeline)
- Added BilingualText narrowing in Timeline.tsx EventCard props (`.es` fallback for bilingual titles/descriptions)
- Added defaults for optional shared TimelineItem fields: event_type ?? 'political', source_url ?? null, actors ?? []
- Fixed shared TimelineItem.source_url type: `string` → `string | null` to accept caso-libra's null values
- tsc --noEmit: 6 pre-existing errors (all pages/OG, tasks 3.x scope), 0 new errors
- Commit 6379815

### Critic review (2.2):
- All 3 files updated per spec: EventCard.tsx (2 import lines), Timeline.tsx (2 import lines), CronologiaContent.tsx (1 import line — cascading dep, correct addition).
- BilingualText narrowing in Timeline.tsx is correct: shared TimelineItem.title/description is `string | BilingualText`, `.es` fallback needed.
- Optional field defaults (event_type ?? 'political', source_url ?? null, actors ?? []) are safe — prevents runtime errors with finpol data.
- source_url type fix (`string` → `string | null`) matches caso-libra data reality.
- tsc independently verified: 6 pre-existing errors (all pages/OG, tasks 3.x scope), 0 new errors.
- No `any` types, no speculative code, no logic changes beyond necessary narrowing.
- No blocking issues. review.passed.

### Finalizer note (iteration after 2.2 review):
- review.passed for 2.2 confirmed. Task m9:component-imports closed.
- Step 2 fully complete (both sub-tasks 2.1–2.2 closed). Advancing to Step 3 — Genericize page components.
- 6 TS errors remain (all pages/OG, Step 3 scope). Step 3 has 8 sub-tasks (3.1–3.8). Step 4 is final cleanup.

### Planner note (queue.advance → 3.1):
- Step 2 complete. Revised Step 3 scope: 6 TS errors across 4 files (not 8 sub-tasks — original plan included non-error pages). Step 3 focuses on fixing all 6 remaining TS errors.
- Original sub-tasks 3.4–3.8 (actor page fetch URLs, dinero, investigacion, AgentChat, layout) have no TS errors — deferred to Step 4 if needed.
- Task m9:fix-landing-page created for 3.1.
- Builder guidance for 3.1: Fix `webapp/src/app/caso/[slug]/page.tsx` — pass `slug` to all 3 query function calls.

**Current state (L6, L15-16):**
```typescript
import { getStats, getActors, getDocuments } from '@/lib/caso-libra'
// ...
const { slug } = await params
const [_stats, actors, documents] = await Promise.all([getStats(), getActors(), getDocuments()])
```

**Fix — pass `slug` as first argument (all 3 functions now require `casoSlug: string` since task 1.2):**
```typescript
const [_stats, actors, documents] = await Promise.all([getStats(slug), getActors(slug), getDocuments(slug)])
```

**That's it.** One line change, 3 errors fixed. Import stays `@/lib/caso-libra` — those functions are already generic (they accept any casoSlug).

**Do NOT:**
- Switch imports to query-builder (caso-libra functions have richer return types needed by CasoLandingContent)
- Modify CasoLandingContent or any other component
- Change any other code in this file

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — expect 3 remaining errors (cronologia:10, evidencia:15, og/actor:22).

### Builder note (3.1 complete):
- Fixed [slug]/page.tsx L16: passed `slug` to getStats, getActors, getDocuments
- One line change, 3 TS errors resolved (Expected N arguments, but got 0)
- tsc --noEmit: 3 remaining errors (cronologia:10, evidencia:15, og/actor:22) — all pages/OG scope as expected
- Commit be1ec9b

### Critic review (3.1):
- One-line change per spec: `getStats(slug), getActors(slug), getDocuments(slug)` — exactly matches guidance.
- No scope creep: import unchanged (`@/lib/caso-libra`), no component modifications.
- tsc independently verified: 3 remaining errors (cronologia:10, evidencia:15, og/actor:22) — all pages/OG scope.
- No code quality issues.
- No blocking issues. review.passed.

### Finalizer note (iteration after 3.1 review):
- review.passed for 3.1 confirmed. Task m9:fix-landing-page closed.
- Step 3 has 3 remaining sub-tasks: 3.2 (cronologia:10), 3.3 (evidencia:15), 3.4 (og/actor:22). 3 TS errors remain.
- Advancing queue for Planner to scope 3.2 next.

### Planner note (queue.advance → 3.2):
- Task m9:fix-cronologia created for 3.2.
- Builder guidance for 3.2: Fix `webapp/src/app/caso/[slug]/cronologia/page.tsx` — add `params` prop and pass `slug` to `getTimeline`.

**Current state (L9-10):**
```typescript
export default async function CronologiaPage() {
  const events = await getTimeline()
```

**Fix — add params prop, destructure slug, pass to getTimeline:**
```typescript
export default async function CronologiaPage({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const events = await getTimeline(slug)
```

**That's it.** `getTimeline(casoSlug: string)` needs one argument (since task 1.2). The page currently has no params at all.

**Do NOT:**
- Change the import (stays `@/lib/caso-libra`)
- Modify CronologiaContent or any other component
- Change any other code in this file

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — expect 2 remaining errors (evidencia:15, og/actor:22).

### Builder note (3.2 complete):
- Fixed cronologia/page.tsx: added params prop with `Promise<{ slug: string }>`, destructured slug, passed to getTimeline
- One file change, 1 TS error resolved (Expected 1 arguments, but got 0)
- tsc --noEmit: 2 remaining errors (evidencia:15, og/actor:22) — matches expected
- Commit 6eac824

### Finalizer note (iteration after 3.2 review):
- review.passed for 3.2 confirmed. Task m9:fix-cronologia closed.
- Step 3 has 2 remaining sub-tasks: 3.3 (evidencia:15), 3.4 (og/actor:22). 2 TS errors remain.
- Advancing queue for Planner to scope 3.3 next.

### Planner note (queue.advance → 3.3):
- Task m9:fix-evidencia created for 3.3.
- Builder guidance for 3.3: Fix `webapp/src/app/caso/[slug]/evidencia/page.tsx` — pass `slug` to `getDocuments`.

**Current state (L14-15):**
```typescript
const { slug } = await params
const documents = await getDocuments()
```

**Fix — pass `slug` as first argument (getDocuments now requires `casoSlug: string` since task 1.2):**
```typescript
const documents = await getDocuments(slug)
```

**That's it.** One line change, 1 error fixed. The page already has `params` prop and destructures `slug` (L9-14). Only L15 needs the argument added.

**Do NOT:**
- Change the import (stays `@/lib/caso-libra`)
- Modify EvidenciaContent or any other component
- Change any other code in this file

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — expect 1 remaining error (og/actor:22).

**Preview of 3.4 (og/actor:22):** `webapp/src/app/api/og/caso/[slug]/actor/[actorSlug]/route.tsx` L22 calls `getPersonBySlug(actorSlug)` but needs `getPersonBySlug(slug, actorSlug)`. Also needs to destructure `slug` from params at L16 (currently only destructures `actorSlug`).

### Builder note (3.3 complete):
- Fixed evidencia/page.tsx L15: passed `slug` to getDocuments(slug)
- One line change, 1 TS error resolved (Expected 1 arguments, but got 0)
- tsc --noEmit: 1 remaining error (og/actor:22) — matches expected
- Commit 85bd8e9

### Critic review (3.3):
- One-line change per spec: `getDocuments()` → `getDocuments(slug)` — exactly matches guidance.
- No scope creep: import unchanged (`@/lib/caso-libra`), no component modifications.
- tsc independently verified: 1 remaining error (og/actor route.tsx:22) — matches expected.
- No code quality issues.
- No blocking issues. review.passed.

### Finalizer note (iteration after 3.3 review):
- review.passed for 3.3 confirmed. Task m9:fix-evidencia closed.
- Step 3 has 1 remaining sub-task: 3.4 (og/actor:22). 1 TS error remains.
- Advancing queue for Planner to scope 3.4 next.
- Preview from 3.3 planner note: `webapp/src/app/api/og/caso/[slug]/actor/[actorSlug]/route.tsx` L22 needs `getPersonBySlug(slug, actorSlug)` and L16 needs to destructure `slug` from params.

### Planner note (queue.advance → 3.4):
- Task m9:fix-og-actor created for 3.4. This is the LAST TS error.
- Builder guidance for 3.4: Fix `webapp/src/app/api/og/caso/[slug]/actor/[actorSlug]/route.tsx` — destructure `slug` from params and pass it to `getPersonBySlug`.

**Current state (L16, L22):**
```typescript
const { actorSlug } = await params
// ...
const data = await getPersonBySlug(actorSlug)
```

**Fix — two changes:**

1. **L16** — also destructure `slug`:
```typescript
const { slug, actorSlug } = await params
```

2. **L22** — pass `slug` as first argument (`getPersonBySlug(casoSlug: string, slug: string)` since task 1.2):
```typescript
const data = await getPersonBySlug(slug, actorSlug)
```

**That's it.** Two minimal edits, 1 error fixed. The params type at L14 already includes `slug: string` — it just wasn't being destructured.

**Do NOT:**
- Change the import (stays `@/lib/caso-libra`)
- Modify any JSX or the truncate helper
- Change any other code in this file

**Verification:** `pnpm exec tsc --noEmit` from `webapp/` — expect **0 remaining errors**. This is the last TS error in the project.

**After 3.4:** Step 3 fully complete. Step 4 is cleanup + final verification. With 0 TS errors, M9 standardization may be complete pending review of whether Step 4 tasks are needed.

### Builder note (3.4 complete):
- Fixed og/actor/route.tsx L16: destructured `slug` from params (`{ slug, actorSlug }`)
- Fixed og/actor/route.tsx L22: `getPersonBySlug(actorSlug)` → `getPersonBySlug(slug, actorSlug)`
- Two-line change, 1 TS error resolved (last one)
- tsc --noEmit: **0 errors** — all TS errors resolved
- Commit c1394e8
- Step 3 fully complete (all sub-tasks 3.1–3.4 closed). M9 standardization typecheck is clean.

### Critic review (3.4):
- Two-line change per spec: `{ actorSlug }` → `{ slug, actorSlug }` (L16), `getPersonBySlug(actorSlug)` → `getPersonBySlug(slug, actorSlug)` (L22).
- No scope creep: import unchanged (`@/lib/caso-libra`), no JSX or truncate helper modifications.
- tsc independently verified: **0 errors** — all TS errors resolved across the project.
- No code quality issues.
- No blocking issues. review.passed.

### Finalizer note (iteration after 3.4 review):
- review.passed for 3.4 confirmed. All Step 3 sub-tasks (3.1–3.4) closed.
- **Final verification complete:**
  - `pnpm exec tsc --noEmit`: **0 errors**
  - `pnpm run build`: **success** (all 5 phases built clean, only pre-existing warnings from vinext/rolldown)
- Step 4 (cleanup) has no remaining TS errors or build failures. M9 standardization is complete.
- One deferred task remains (m9:i18n-titles — browser language detection + bilingual metadata) — not blocking M9 completion.
- **M9 COMPLETE.** Objective is "Continue from M10 onward" — emitting LOOP_COMPLETE.
