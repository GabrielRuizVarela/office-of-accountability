# Plan: Complete M9 Investigation Standardization

## Current Step: Step 1 — Complete Phase 5 Backend (remaining items)

Phase 5 is partially done. Unified API routes exist at `/api/caso/[slug]/*` (graph, timeline, stats, config, schema, node/[id]). Registry, query-builder, types, utils, config all exist in `lib/investigations/`.

### Sub-tasks:
- [x] 1.1 Create `src/lib/caso-finanzas-politicas/types.ts` — domain types for Claim, MoneyFlow, Event, Person, Organization (file: webapp/src/lib/caso-finanzas-politicas/types.ts)
- [x] 1.2 Create `src/lib/caso-finanzas-politicas/queries.ts` — typed wrappers delegating to generic query builder (file: webapp/src/lib/caso-finanzas-politicas/queries.ts)
- [x] 1.3 Create `src/lib/caso-finanzas-politicas/transform.ts` — pure transform functions for Neo4j records → domain objects (file: webapp/src/lib/caso-finanzas-politicas/transform.ts)
- [x] 1.4 Update `src/lib/caso-libra/queries.ts` — rewrite Cypher from CasoLibra* labels to generic labels + caso_slug, delegate to query builder (file: webapp/src/lib/caso-libra/queries.ts)
- [x] 1.5 Update `src/lib/caso-epstein/transform.ts` — align with generic toInvestigationNode() transform (file: webapp/src/lib/caso-epstein/transform.ts)
- [x] 1.6 Update `src/lib/graph/constants.ts` — add ShellCompany, Aircraft, Wallet, Token, Claim, MoneyFlow, GovernmentAction to LABEL_COLORS and LABEL_DISPLAY (file: webapp/src/lib/graph/constants.ts)
- [x] 1.7 Create 3 unified routes (wallets, person, document) at `/api/caso/[slug]/*` + replace 3 caso-libra routes with 301 redirects (files: webapp/src/app/api/caso/[slug]/{wallets,person,document} + webapp/src/app/api/caso-libra/{wallets,person,document})
- [x] 1.8 Epstein-specific routes already at unified path — no changes needed (flights, proximity, simulation already at /api/caso/[slug]/)

### Notes:
- caso-finanzas-politicas only has config.ts + investigation-data.ts currently, needs types/queries/transform
- caso-libra/queries.ts still uses CasoLibra* labels
- Old caso-libra API routes (document, graph, investigation, person, simulate, wallets) still exist and need 301 redirects
- Epstein-specific routes at /api/caso/[slug]/ (flights, proximity, simulation) may need preservation as investigation-specific extensions
- 1.1 done: types.ts created with Zod schemas for Person, Organization, Claim, MoneyFlow, Event, GovernmentAction, Document. Includes category/status display config, relationship types, stats interface. Follows caso-libra pattern (Zod schemas + inferred types). Pre-existing TS errors in EvidenceExplorer.tsx (unrelated). Commit: 536e553
- 1.1 REVIEWED (Critic): PASS. Typecheck clean (pre-existing EvidenceExplorer only). Pattern-matches caso-libra exactly. Non-blocking note: claimStatusSchema overlaps FactcheckStatus in investigation-data.ts — consolidate later.
- Finalizer: 1.1 review passed, task already closed. 7 sub-tasks remain in Step 1 (1.2–1.8). Advancing queue for Builder to pick up 1.2 (fp/queries.ts).
- Planner (queue.advance): Advancing to 1.2. Key pattern: fp/queries.ts should be THIN wrappers that delegate to `getQueryBuilder()` from `lib/investigations/query-builder.ts`. It should NOT write raw Cypher like caso-libra/queries.ts (which is legacy and will be rewritten in 1.4). Export functions like getGraph, getTimeline, getStats, getNodesByType, getNodeBySlug, getNodeConnections — each just calls queryBuilder.methodName(CASO_FINANZAS_POLITICAS_SLUG, ...). Also add domain-specific queries if needed (e.g. getClaimsByStatus, getMoneyFlows) that DO use raw Cypher with caso_slug filter. Import types from ./types.ts.
- 1.2 done: queries.ts created. 6 generic delegates (getGraph, getTimeline, getStats, getNodesByType, getNodeBySlug, getNodeConnections) + 2 domain-specific (getClaimsByStatus with optional status filter, getMoneyFlows ordered by amount_ars DESC). All raw Cypher is parameterized with caso_slug. Typecheck clean (pre-existing EvidenceExplorer only).
- 1.2 REVIEWED (Critic): PASS. All Cypher parameterized. caso_slug filter present on both domain queries. Types align with types.ts exports. toNumber handles Neo4j Integer objects. No LIMIT/SKIP needed. Non-blocking: session.run used instead of session.executeRead — acceptable for read-only.
- Finalizer: 1.2 review passed, task closed. 6 sub-tasks remain (1.3–1.8). Advancing queue for Builder to pick up 1.3 (fp/transform.ts).
- Planner (queue.advance): Advancing to 1.3. Create `webapp/src/lib/caso-finanzas-politicas/transform.ts` — pure transform functions mapping Neo4j property bags → typed domain objects. Pattern: follow caso-libra/transform.ts style (takes `Record<string, unknown>` props, NOT `Node`). Need transforms for all 7 domain types from types.ts: toPerson, toOrganization, toClaim, toMoneyFlow, toEvent, toGovernmentAction, toDocument. Include same helper pattern: asString, asOptionalString, asOptionalNumber. FP-specific: toClaim needs ClaimStatus cast; toMoneyFlow needs asNumber (required, not optional) for amount_ars; toEvent needs InvestigationCategory cast; toGovernmentAction needs action_type string. Person has `party` and `datasets` fields (not in Epstein/Libra). Keep it pure, no Neo4j imports.
- 1.3 done: transform.ts created with 7 transforms (toPerson, toOrganization, toClaim, toMoneyFlow, toEvent, toGovernmentAction, toDocument). Helpers: asString, asOptionalString, asNumber (required), asOptionalNumber. ClaimStatus defaults to 'unconfirmed', InvestigationCategory defaults to 'political', tier defaults to 1. Person includes party + datasets fields. MoneyFlow uses asNumber (required) for amount_ars. Typecheck clean (pre-existing EvidenceExplorer only). Commit: 819511a
- 1.3 REVIEWED (Critic): PASS. All 7 transforms + 4 helpers present. Pattern-matches caso-libra/transform.ts exactly. asNumber correctly handles Neo4j Integer .toNumber(). Types align with types.ts Zod schemas. Pure functions, no Neo4j imports. Typecheck verified clean. Non-blocking: helpers duplicated across caso-libra and fp transforms — extract to shared util later.
- Finalizer: 1.3 review passed, task already closed. 5 sub-tasks remain (1.4–1.8). Advancing queue for Builder to pick up 1.4 (caso-libra/queries.ts rewrite).
- Planner (queue.advance): Advancing to 1.4. Rewrite `webapp/src/lib/caso-libra/queries.ts` — replace ALL CasoLibra* labels with generic labels + caso_slug filter. This is the KEY migration: the file currently has ~10 uses of CasoLibraPerson, CasoLibraEvent, CasoLibraDocument, CasoLibraWallet, CasoLibraOrganization, CasoLibraToken. Strategy: (A) For getInvestigationGraph, getTimeline, getStats — delegate to `getQueryBuilder()` like fp/queries.ts does, keep as thin wrappers. (B) For domain-specific queries (getWalletFlows, getPersonBySlug, getActors, getDocuments, getDocumentBySlug) — rewrite Cypher to use generic labels (Person, Event, Document, Wallet, Organization, Token) with `WHERE n.caso_slug = $casoSlug` filter. Use CASO_LIBRA_SLUG constant. (C) Keep the same export signatures so existing callers aren't broken — but add casoSlug param where currently missing (getInvestigationGraph, getTimeline, etc currently take no args; make casoSlug optional defaulting to CASO_LIBRA_SLUG for backwards compat, OR just hardcode it internally). (D) Remove local asString/asNumber helpers — import from a shared location or inline. (E) Keep TX_CONFIG pattern. All Cypher MUST remain parameterized (guardrail 1001). LIMIT values need neo4j.int() (guardrail 1002).
- Planner (queue.advance, iteration 2): 1.4 detailed builder brief below.

**1.4 Builder Brief — caso-libra/queries.ts rewrite:**

File: `webapp/src/lib/caso-libra/queries.ts` (464 lines → should shrink significantly)

**Callers** (must preserve export signatures):
- `webapp/src/lib/caso-libra/index.ts` re-exports: getInvestigationGraph, getWalletFlows, getTimeline, getPersonBySlug, getActors, getDocuments, getDocumentBySlug, getStats
- `webapp/src/app/caso/[slug]/page.tsx` imports: getStats, getActors, getDocuments
- `webapp/src/app/caso/[slug]/cronologia/page.tsx` imports: getTimeline
- `webapp/src/app/caso/[slug]/evidencia/page.tsx` imports: getDocuments
- `webapp/src/app/api/caso-libra/person/[actorSlug]/route.ts` imports: getPersonBySlug
- `webapp/src/app/api/og/caso/[slug]/actor/[actorSlug]/route.tsx` imports: getPersonBySlug
- `webapp/src/app/api/caso-libra/wallets/route.ts` imports: getWalletFlows
- `webapp/src/app/api/caso-libra/document/[docSlug]/route.ts` imports: getDocumentBySlug

**Strategy:**
(A) DELEGATE generic queries to `getQueryBuilder()` (same pattern as fp/queries.ts):
  - `getInvestigationGraph()` → `getQueryBuilder().getGraph(SLUG)` — return type changes from GraphData (old) to GraphData (investigations). Both use `{ nodes, links }` shape so callers should be fine.
  - `getTimeline()` → `getQueryBuilder().getTimeline(SLUG)` — return type changes from `TimelineItem[]` (caso-libra) to `TimelineItem[]` (investigations). Field mapping: id, title, description, date stay same; event_type → category; source_url stays; actors stays. **BUT** callers in cronologia/page.tsx use the caso-libra TimelineItem shape. Check if they use `event_type` field — if so, the query-builder returns `category` instead. May need to keep the raw Cypher version OR ensure the investigations TimelineItem is compatible.
  - `getStats()` → `getQueryBuilder().getStats(SLUG)` — return type changes from CasoLibraStats to InvestigationStats. CasoLibraStats has { totalLossUsd, affectedWallets, priceDrop, actorCount, eventCount, documentCount }. InvestigationStats has { totalNodes, totalRelationships, nodeCountsByType }. These are INCOMPATIBLE. **Keep raw Cypher for getStats() that returns CasoLibraStats**, OR make callers use the new shape. Since callers will be migrated in Step 2 (frontend), keep the old return type for now using raw Cypher with generic labels.

(B) REWRITE domain-specific queries with generic labels + caso_slug:
  - `getWalletFlows()` — `CasoLibraWallet` → `Wallet WHERE w.caso_slug = $casoSlug`
  - `getPersonBySlug(slug)` — `CasoLibraPerson` → `Person WHERE p.caso_slug = $casoSlug`, `CasoLibraEvent` → `Event WHERE e.caso_slug = $casoSlug`, `CasoLibraDocument` → `Document WHERE d.caso_slug = $casoSlug`
  - `getActors()` — `CasoLibraPerson` → `Person WHERE p.caso_slug = $casoSlug`
  - `getDocuments()` — `CasoLibraDocument` → `Document WHERE d.caso_slug = $casoSlug`
  - `getDocumentBySlug(slug)` — `CasoLibraDocument` → `Document WHERE d.caso_slug = $casoSlug`

(C) Define `SLUG = 'caso-libra'` constant (or import from types if it exists there).

(D) Keep local asString/asNumber helpers (no shared location exists yet; extracting is deferred cleanup).

(E) Keep TX_CONFIG. Keep same export function signatures. No LIMIT values need neo4j.int() in this file (the only LIMIT 100 is a hardcoded literal, fine as-is).

**Guardrails:** All Cypher parameterized (1001). No neo4j.int() needed for current LIMITs (1002 — only applies to parameterized LIMIT/SKIP).

**Decision on getStats/getTimeline delegation:** Keep raw Cypher for getStats() (CasoLibraStats is not compatible with InvestigationStats). For getTimeline(), keep raw Cypher too since the old TimelineItem has `event_type: EventType` but investigations TimelineItem has `category?: string`. Callers depend on the old shape. Frontend migration (Step 2) will fix this. For getInvestigationGraph(), delegation IS safe because GraphData shape is compatible — both use `{ nodes, links }` and the graph visualization doesn't care about exact node types.

## Step 2 — Phase 6: Frontend Standardization (fetch URLs + nav)
- [ ] 2.1 Update hardcoded fetch URLs in 3 [slug] pages: dinero, actor/[actorSlug], evidencia/[docSlug] (file: webapp/src/app/caso/[slug]/{dinero,actor,evidencia})
- [ ] 2.2 Refactor InvestigationNav.tsx — remove hardcoded CASE_TABS, read from investigation registry/config (file: webapp/src/components/investigation/InvestigationNav.tsx)
- [ ] 2.3 Delete static finanzas-politicas routes except /conexiones (files: webapp/src/app/caso/finanzas-politicas/{page,resumen,investigacion,cronologia,dinero})
- [ ] 2.4 Add browser language detection + bilingual page titles/metadata (file: webapp/src/app/caso/[slug]/layout.tsx)

### Notes:
- investigacion/page.tsx fetch URL stays as `/api/caso-libra/investigation` — that route was kept as caso-libra-specific (standalone submission system, CSRF-exempt). Will generalize later if needed.
- dinero/page.tsx does NOT currently use useParams — needs to add it to get slug.
- actor/[actorSlug]/page.tsx and evidencia/[docSlug]/page.tsx already have `slug` from useParams.
- Static caso-epstein pages (under caso/caso-epstein/) are separate from [slug] dynamic pages — left as-is for now (they provide curated narrative content).
- CASE_TABS in InvestigationNav.tsx is already per-slug with a DEFAULT_TABS fallback — 2.2 is about reading tab config from the investigation registry instead of hardcoding.
- Original 2.3 (shared components) and 2.4 (refactor pages) removed — shared components already exist, and page refactoring is too broad/speculative for M9 scope. The [slug] dynamic routes already work generically. YAGNI.

- 1.4 done: caso-libra/queries.ts rewritten. All CasoLibra* labels replaced with generic labels + caso_slug='caso-libra'. getInvestigationGraph delegated to query builder. getStats/getTimeline kept as raw Cypher (incompatible return types with generic versions). Domain queries (getWalletFlows, getPersonBySlug, getActors, getDocuments, getDocumentBySlug) rewritten with parameterized caso_slug. All Cypher parameterized. Typecheck clean (pre-existing EvidenceExplorer only). No callers use getInvestigationGraph from caso-libra externally. Commit: 27744d6
- 1.4 REVIEWED (Critic): PASS. All CasoLibra* labels gone. All Cypher parameterized with $casoSlug. caso_slug filter on every query. getInvestigationGraph correctly delegates to query builder. getStats/getTimeline correctly kept as raw Cypher (CasoLibraStats/TimelineItem shapes incompatible with generic versions). Export signatures preserved. Typecheck verified clean. Non-blocking: getWalletFlows return type changed from GraphData to inline readonly type — structurally compatible.

## Completed Steps:
- Phase 1: Schema & Config Nodes — done
- Phase 2: Caso Libra Label Migration — done
- Phase 3: Caso Finanzas Politicas Import — done
- Phase 4: Caso Epstein Alignment — done
- Phase 5 (partial): types.ts, utils.ts, config.ts, query-builder.ts, registry.ts, unified API routes (graph, timeline, stats, config, schema, node/[id]) — done
- Finalizer: 1.4 review passed, task closed. 4 sub-tasks remain in Step 1 (1.5–1.8). Advancing queue for Builder to pick up 1.5 (caso-epstein/transform.ts alignment).
- Planner (queue.advance): Advancing to 1.5. Detailed builder brief below.

**1.5 Builder Brief — caso-epstein/transform.ts alignment:**

File: `webapp/src/lib/caso-epstein/transform.ts` (139 lines → similar size)

**Problem:** Epstein transform.ts takes `Node` objects (imports `Node` from neo4j-driver-lite), while the standardized pattern (caso-libra, caso-fp) takes `Record<string, unknown>` property bags. It also lacks confidence_tier/source/ingestion_wave fields.

**Callers:**
- `webapp/src/lib/caso-epstein/index.ts` re-exports: toPerson, toFlight, toLocation, toDocument, toEvent, toOrganization, toLegalCase
- Nobody directly imports from `caso-epstein/transform` (all go through index.ts barrel)
- queries.ts has its OWN inline transforms (toPersonProps, toEventProps, toDocumentProps, toLegalCaseProps) that duplicate logic and DO handle confidence_tier/source/ingestion_wave. These inline transforms in queries.ts should be updated in a FOLLOW-UP to delegate to the centralized transform.ts functions (not part of this task).

**Changes required:**
1. Remove `import type { Node } from 'neo4j-driver-lite'` — no more Node dependency
2. Change ALL transform function signatures from `(node: Node)` to `(props: Record<string, unknown>)` — matching caso-libra/caso-fp pattern
3. Remove the `const p = node.properties as Record<string, unknown>` line from each function — the parameter IS the props bag already
4. Replace helper functions `str`, `strOrNull`, `strArray`, `numOrNull` with the standard naming: `asString`, `asOptionalString`, `asOptionalNumber` (plus `asStringArray` for key_findings)
5. Handle Neo4j Integer objects in asOptionalNumber: check for `.toNumber()` method (same pattern as caso-libra/caso-fp)
6. Add optional confidence_tier, source, ingestion_wave fields to ALL transforms (present in the type interfaces but missing from current transform.ts). Use:
   - `confidence_tier: asOptionalString(props.confidence_tier) as ConfidenceTier | undefined`
   - `source: asOptionalString(props.source)`
   - `ingestion_wave: asOptionalNumber(props.ingestion_wave)`
7. Import ConfidenceTier type from './types'

**Export signatures stay the same** (same function names, same return types). Only the parameter type changes from `Node` to `Record<string, unknown>`.

**Guardrails:** Pure functions only, no Neo4j imports (1001 n/a — no queries). Typecheck must pass.

- 1.5 done: caso-epstein/transform.ts aligned with generic pattern. Removed Node import from neo4j-driver-lite. All 7 transforms changed from (node: Node) to (props: Record<string, unknown>). Replaced str/strOrNull/strArray/numOrNull helpers with standard asString/asOptionalString/asOptionalNumber/asStringArray. Added confidence_tier, source, ingestion_wave fields to all transforms. asOptionalNumber handles Neo4j Integer .toNumber(). coordinates uses ?? null for string|null type. page_count uses ?? null for number|null type. Typecheck clean (pre-existing EvidenceExplorer only). No callers import directly from transform.ts (all go through index.ts barrel). queries.ts has separate inline transforms (toPersonProps etc.) — follow-up task. Commit: 4970cb6
- 1.5 REVIEWED (Critic): PASS. All 7 requirements met: (1) Node import removed, (2) all signatures changed to Record<string,unknown>, (3) const p = node.properties removed, (4) helpers renamed to standard as* pattern, (5) asOptionalNumber handles .toNumber(), (6) confidence_tier/source/ingestion_wave added to all 7 transforms, (7) ConfidenceTier imported from ./types. No external callers import transform.ts directly — all go through index.ts barrel. queries.ts inline transforms (toPersonProps etc.) still use Node — noted as follow-up. Typecheck verified clean (pre-existing EvidenceExplorer only). Pure functions, no Neo4j imports. Non-blocking: helpers duplicated across all three caso modules — extract to shared util later.
- Finalizer: 1.5 review passed. 3 remaining open tasks in Step 1: graph-constants (m9:graph-constants), libra-redirects (m9:libra-redirects), epstein-routes (m9:epstein-routes). Advancing queue for Builder to pick up next task (m9:graph-constants — update graph/constants.ts with new label colors and display names for all caso types).
- Planner (queue.advance): Advancing to 1.6. Detailed builder brief below.

**1.6 Builder Brief — graph/constants.ts label additions:**

File: `webapp/src/lib/graph/constants.ts` (197 lines)

**Problem:** LABEL_COLORS and LABEL_DISPLAY only cover Argentine politics labels + Epstein labels. The M9 migration added generic labels used across all investigations that are missing from the graph visualization constants. LINK_COLORS also lacks relationship types from caso-libra and caso-finanzas-politicas.

**Missing node labels (add to LABEL_COLORS + LABEL_DISPLAY):**
From neo4j/schema.ts generic labels NOT already in constants:
- `Claim` — color: `#f59e0b` (amber-500), display: `Declaración`
- `Token` — color: `#06b6d4` (cyan-500), display: `Token`
- `Wallet` — color: `#22c55e` (green-500), display: `Billetera`
- `Aircraft` — color: `#f97316` (orange-500), display: `Aeronave`
- `ShellCompany` — color: `#dc2626` (red-600), display: `Empresa Fantasma`
- `MoneyFlow` — color: `#10b981` (emerald-500), display: `Flujo de Dinero`
- `GovernmentAction` — color: `#7c3aed` (violet-600), display: `Acción Gubernamental`

Note: Person, Organization, Event, Document, Location already exist in LABEL_COLORS/LABEL_DISPLAY (from Epstein section). Flight also exists. LegalCase also exists.

**Missing relationship types (add to LINK_COLORS):**
From caso-libra/types.ts RelationshipType:
- `CONTROLS` — `#dc2626` (red-600)
- `SENT` — `#f97316` (orange-500)
- `COMMUNICATED_WITH` — `#06b6d4` (cyan-500)
- `MET_WITH` — `#3b82f6` (blue-500)
- `PROMOTED` — `#a855f7` (purple-500)
- `CREATED_BY` — `#64748b` (slate-500)

From caso-finanzas-politicas/types.ts RelationshipType (excluding already-present):
- `DONATED_TO` — `#22c55e` (green-500)
- `CONTRACTED_BY` — `#14b8a6` (teal-500)
- `OWNS` — `#a855f7` (purple-500)
- `DIRECTED` — `#8b5cf6` (violet-500)
- `MENTIONS` — `#ef4444` (red-500)
- `RECEIVED_FROM` — `#10b981` (emerald-500)
- `RELATED_TO` — `#64748b` (slate-500)

Already present in LINK_COLORS: AFFILIATED_WITH, PARTICIPATED_IN, DOCUMENTED_BY (shared across investigations).

**Strategy:**
1. Add a new comment section `// Generic investigation node types` in LABEL_COLORS after the Epstein section
2. Add corresponding entries in LABEL_DISPLAY with Spanish display names
3. Add new comment sections `// Caso Libra relationship types` and `// Caso Finanzas Politicas relationship types` in LINK_COLORS
4. Keep existing entries unchanged — only ADD new ones

**Guardrails:** No queries (1001 n/a). No Neo4j integers (1002 n/a). Pure constants file. Typecheck must pass.

- 1.6 done: graph/constants.ts updated. Added 7 node labels to LABEL_COLORS (Claim, Token, Wallet, Aircraft, ShellCompany, MoneyFlow, GovernmentAction) and matching entries in LABEL_DISPLAY with Spanish names. Added 13 relationship types to LINK_COLORS: 6 from caso-libra (CONTROLS, SENT, COMMUNICATED_WITH, MET_WITH, PROMOTED, CREATED_BY) and 7 from caso-finanzas-politicas (DONATED_TO, CONTRACTED_BY, OWNS, DIRECTED, MENTIONS, RECEIVED_FROM, RELATED_TO). All organized in comment sections. Typecheck clean (pre-existing EvidenceExplorer only). Commit: 5eb2dec
- 1.6 REVIEWED (Critic): PASS. All 7 node labels added to LABEL_COLORS + LABEL_DISPLAY with correct colors and Spanish display names. All 13 relationship types added to LINK_COLORS in organized comment sections (6 caso-libra, 7 caso-fp). Existing entries unchanged. Typecheck verified clean (pre-existing EvidenceExplorer only). Pure constants file, no queries or Neo4j imports. Non-blocking: Claim shares color with Event (#f59e0b) — minor visual overlap.
- Finalizer: 1.6 review passed, task already closed. 2 remaining open tasks in Step 1: libra-redirects (m9:libra-redirects), epstein-routes (m9:epstein-routes). Advancing queue for Builder to pick up 1.7 (caso-libra API route 301 redirects).
- Planner (queue.advance): Advancing to 1.7. Detailed builder brief below. Scope reduced: only handle routes where redirect targets exist or can be created simply. Simulate routes (3) are API-incompatible with unified simulation — defer to Step 2. Investigation route is a unique submission system — keep as-is.

**1.7 Builder Brief — caso-libra domain route redirects:**

**Problem:** Old caso-libra API routes at `/api/caso-libra/*` need to redirect to unified `/api/caso/[slug]/*` routes. The graph route is already done. Three domain-specific routes (wallets, document, person) have no unified equivalents yet — create them, then add 301 redirects.

**Scope: 6 file changes (3 new unified routes + 3 redirects)**

**Part A — Create 3 new unified routes under `/api/caso/[slug]/`:**

These are generic case routes that dispatch to per-caso query modules based on slug.

1. **`webapp/src/app/api/caso/[slug]/wallets/route.ts`** (NEW)
   - GET handler: extract slug from params, validate slug exists in investigation registry
   - For caso-libra: `import { getWalletFlows } from '@/lib/caso-libra'` → return JSON
   - For other slugs: return 404 (only caso-libra has wallet data)
   - Pattern: `const { slug } = await params; if (slug !== 'caso-libra') return 404; const data = await getWalletFlows(); return NextResponse.json(data)`

2. **`webapp/src/app/api/caso/[slug]/person/[actorSlug]/route.ts`** (NEW)
   - GET handler: extract slug + actorSlug from params
   - Validate actorSlug length <= 200
   - For caso-libra: `import { getPersonBySlug } from '@/lib/caso-libra'`
   - For caso-epstein: `import { getPersonBySlug } from '@/lib/caso-epstein'` (if it exists — check)
   - Return 404 for unknown slugs or not-found persons
   - Pattern matches the existing caso-libra/person route logic

3. **`webapp/src/app/api/caso/[slug]/document/[docSlug]/route.ts`** (NEW)
   - GET handler: extract slug + docSlug from params
   - Validate docSlug length <= 200
   - For caso-libra: `import { getDocumentBySlug } from '@/lib/caso-libra'`
   - Return 404 for unknown slugs or not-found documents

**Part B — Replace 3 caso-libra routes with 301 redirects:**

4. **`webapp/src/app/api/caso-libra/wallets/route.ts`** (REWRITE)
   - Replace implementation with 301 redirect to `/api/caso/caso-libra/wallets`
   - Pattern: same as existing graph redirect (preserve query params)

5. **`webapp/src/app/api/caso-libra/person/[actorSlug]/route.ts`** (REWRITE)
   - Replace with 301 redirect to `/api/caso/caso-libra/person/${actorSlug}`
   - Extract actorSlug from params, build target URL

6. **`webapp/src/app/api/caso-libra/document/[docSlug]/route.ts`** (REWRITE)
   - Replace with 301 redirect to `/api/caso/caso-libra/document/${docSlug}`
   - Extract docSlug from params, build target URL

**NOT in scope (handle later):**
- `simulate/` (3 routes) — Old MiroFish proxy has different API contract than unified simulation. Frontend (AgentChat.tsx) uses old API. Defer to Step 2.
- `investigation/` — Standalone submission system (380 lines), CSRF-exempt in middleware. Not a standard case-data route. Keep as-is.
- `graph/` — Already a 301 redirect ✓

**Callers that will follow the 301 chain (updated in Step 2):**
- `dinero/page.tsx:42` → `/api/caso-libra/wallets` → 301 → `/api/caso/caso-libra/wallets`
- `actor/[actorSlug]/page.tsx:41` → `/api/caso-libra/person/${slug}` → 301 → `/api/caso/caso-libra/person/${slug}`
- `evidencia/[docSlug]/page.tsx:34` → `/api/caso-libra/document/${slug}` → 301 → `/api/caso/caso-libra/document/${slug}`

**Check: does caso-epstein export getPersonBySlug?**
- Check `webapp/src/lib/caso-epstein/index.ts` for person/document query exports
- If yes, the unified person route can dispatch to either caso module
- If no, only handle caso-libra in the unified route for now

**Guardrails:** No Cypher in route files (1001 n/a). No neo4j.int (1002 n/a). Typecheck must pass. Unified routes should validate slug against registry or known slugs.

- 1.7 done: Created 3 unified routes + 3 redirects. Part A: `/api/caso/[slug]/wallets/route.ts` (caso-libra only — only case with wallet data), `/api/caso/[slug]/person/[actorSlug]/route.ts` (dispatches to caso-libra or caso-epstein), `/api/caso/[slug]/document/[docSlug]/route.ts` (dispatches to caso-libra or caso-epstein; note caso-epstein getDocumentBySlug takes (casoSlug, slug) while caso-libra takes just (slug)). All unified routes validate slug against registry, validate sub-slugs (max 200 chars), handle Neo4j connection errors (503), return `{success, data}` envelope matching existing unified routes. Part B: Replaced 3 caso-libra domain routes (wallets, person/[actorSlug], document/[docSlug]) with 301 redirects preserving query params, matching existing graph redirect pattern. actorSlug/docSlug are URI-encoded in redirect URLs. Not in scope: simulate/ (3 routes, incompatible API), investigation/ (standalone submission system). Typecheck clean (pre-existing EvidenceExplorer only).
- 1.7 REVIEWED (Critic): PASS. All 6 files match brief: 3 unified routes created, 3 caso-libra routes replaced with 301 redirects. Call signatures verified: getEpsteinPersonBySlug(slug) called correctly with actorSlug; getEpsteinDocumentBySlug(casoSlug, slug) called correctly with (slug, docSlug). All unified routes validate slug against registry, validate sub-slugs (max 200), handle Neo4j errors (503), return {success, data} envelope. Redirects use encodeURIComponent and preserve query params. No Cypher in route files. Typecheck verified clean (pre-existing EvidenceExplorer only). Non-blocking: asymmetric getDocumentBySlug signatures across caso modules — correct behavior, inherent to underlying functions.
- Finalizer: 1.7 review passed. 1.8 (epstein-routes) closed — routes already at unified `/api/caso/[slug]/` path (flights, proximity, simulation/init, simulation/query). No old routes to redirect. Step 1 COMPLETE — all 8 sub-tasks done. Advancing to Step 2 (Frontend Standardization). 1 task already exists (m9:i18n-titles for 2.6). Planner needs to create tasks for 2.1–2.5.
- Planner (Step 2 planning): Scoped Step 2 to 4 sub-tasks (reduced from 6). Removed shared components (2.3 old) and page refactoring (2.4 old) — shared components already exist, page refactoring is speculative. Kept: fetch URL fixes (2.1), nav config (2.2), delete static FP routes (2.3 new), i18n (2.4 new = old 2.6). investigacion/page.tsx excluded from 2.1 — its fetch goes to caso-libra-specific investigation route (kept as-is per Step 1 decision). Created 3 new tasks (2.1–2.3), existing task m9:i18n-titles covers 2.4. Advancing queue to 2.1.

**2.1 Builder Brief — Fix hardcoded fetch URLs in [slug] pages:**

**Problem:** 3 pages under `/caso/[slug]/` have fetch URLs hardcoded to `/api/caso-libra/*` instead of using the dynamic `slug` param. These break when accessed from any other investigation.

**Scope: 3 file edits**

1. **`webapp/src/app/caso/[slug]/dinero/page.tsx`** (168 lines)
   - Currently does NOT use `useParams` — must add it
   - Add: `import { useParams } from 'next/navigation'`
   - In the component body (find the `useEffect` or data-fetching function): `const params = useParams(); const slug = params.slug as string;`
   - Line 42: Change `fetch('/api/caso-libra/wallets')` → `fetch(`/api/caso/${slug}/wallets`)`
   - File is already `'use client'` ✓

2. **`webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx`** (147 lines)
   - Already has `const slug = params.slug as string` (line 32) ✓
   - Line 41: Change `fetch(`/api/caso-libra/person/${actorSlug}`)` → `fetch(`/api/caso/${slug}/person/${actorSlug}`)`
   - No other changes needed

3. **`webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx`** (131 lines)
   - Already has `const slug = params.slug as string` (line 25) ✓
   - Line 34: Change `fetch(`/api/caso-libra/document/${docSlug}`)` → `fetch(`/api/caso/${slug}/document/${docSlug}`)`
   - No other changes needed

**NOT in scope:**
- `investigacion/page.tsx` — investigation route is caso-libra-specific, kept as-is
- Any other pages — remaining [slug] pages already use generic URLs or static data

**Guardrails:** No Cypher (1001 n/a). No neo4j.int (1002 n/a). Typecheck must pass. Template literals must use backticks.

- 2.1 done: Fixed 3 hardcoded fetch URLs. dinero/page.tsx: added `useParams` import + `const { slug } = useParams<{ slug: string }>()`, changed fetch URL from `/api/caso-libra/wallets` to `/api/caso/${slug}/wallets`. actor/page.tsx: changed fetch URL from `/api/caso-libra/person/${actorSlug}` to `/api/caso/${slug}/person/${actorSlug}` (already had slug from useParams). evidencia/page.tsx: changed fetch URL from `/api/caso-libra/document/${docSlug}` to `/api/caso/${slug}/document/${docSlug}` (already had slug from useParams). Typecheck clean (pre-existing EvidenceExplorer only). Commit: a8c3b07
- 2.1 REVIEWED (Critic): PASS. All 3 files match brief: (1) dinero/page.tsx added useParams import + slug extraction with proper typing `useParams<{ slug: string }>()`, fetch URL dynamized. (2) actor/page.tsx fetch URL changed to use existing slug param. (3) evidencia/page.tsx fetch URL changed to use existing slug param. No scope creep — investigacion/page.tsx correctly excluded. Template literals use backticks. Typecheck verified: only pre-existing EvidenceExplorer date prop error. No new errors introduced.
- Finalizer: 2.1 review passed. 3 remaining open tasks in Step 2: nav-config (m9:nav-config), delete-fp-static (m9:delete-fp-static), i18n-titles (m9:i18n-titles). Advancing queue for Builder to pick up 2.2 (nav-config — refactor CASE_TABS to read from registry).
- Planner (queue.advance): Advancing to 2.2. Detailed builder brief below.

**2.2 Builder Brief — Refactor InvestigationNav CASE_TABS to read from registry:**

**Problem:** `InvestigationNav.tsx` hardcodes `CASE_TABS` — a per-slug map of tab arrays with bilingual labels. This duplicates tab lists that already exist in each investigation's `config.ts` (as `tabs: TabId[]`). Adding a new investigation requires editing both InvestigationNav AND the config. The tab LIST should come from the registry; only UI label metadata stays in InvestigationNav.

**File:** `webapp/src/components/investigation/InvestigationNav.tsx` (119 lines)

**Current structure:**
- `CASE_TABS`: `Record<string, NavTab[]>` — hardcoded per-slug tab arrays with `{href, label: {en, es}}`
- `DEFAULT_TABS`: fallback NavTab[] for unknown slugs
- Component reads `CASE_TABS[slug] ?? DEFAULT_TABS`

**Registry structure:**
- Each config has `tabs: readonly TabId[]` — e.g. `['resumen', 'investigacion', 'grafo', ...]`
- `TabId` = `'resumen' | 'investigacion' | 'cronologia' | 'evidencia' | 'grafo' | 'dinero' | 'simular' | 'vuelos' | 'proximidad' | 'conexiones'`
- `getClientConfig(slug)` returns `InvestigationClientConfig | undefined`

**Strategy:**

1. **Create `TAB_DEFAULTS`** — a `Record<TabId, NavTab>` mapping each TabId to its default `{href, label}`:
   ```ts
   const TAB_DEFAULTS: Record<TabId, NavTab> = {
     resumen:       { href: '/resumen',       label: { en: 'Summary',        es: 'Resumen' } },
     investigacion: { href: '/investigacion', label: { en: 'Investigation',  es: 'Investigación' } },
     cronologia:    { href: '/cronologia',    label: { en: 'Timeline',       es: 'Cronología' } },
     evidencia:     { href: '/evidencia',     label: { en: 'Evidence',       es: 'Evidencia' } },
     grafo:         { href: '/grafo',         label: { en: 'Connections',    es: 'Conexiones' } },
     dinero:        { href: '/dinero',        label: { en: 'The Money',      es: 'El Dinero' } },
     simular:       { href: '/simular',       label: { en: 'Simulation',     es: 'Simulación' } },
     vuelos:        { href: '/vuelos',        label: { en: 'Flights',        es: 'Vuelos' } },
     proximidad:    { href: '/proximidad',    label: { en: 'Proximity',      es: 'Proximidad' } },
     conexiones:    { href: '/conexiones',    label: { en: 'Connections',    es: 'Conexiones' } },
   }
   ```

2. **Create `LABEL_OVERRIDES`** — per-slug label overrides for cases where the default label doesn't fit:
   ```ts
   const LABEL_OVERRIDES: Partial<Record<string, Partial<Record<TabId, Record<Lang, string>>>>> = {
     'caso-libra': {
       resumen:       { en: 'What happened', es: 'Qué pasó' },
       investigacion: { en: 'Evidence',      es: 'Pruebas' },
       evidencia:     { en: 'Documents',     es: 'Evidencia' },
       simular:       { en: 'Predictions',   es: 'Predicciones' },
     },
   }
   ```
   Note: caso-epstein and finanzas-politicas labels match the defaults — no overrides needed.

3. **Home tab** — always prepend `{ href: '', label: { en: 'Home', es: 'Inicio' } }` (called "Overview" in caso-epstein):
   ```ts
   const HOME_TAB: NavTab = { href: '', label: { en: 'Home', es: 'Inicio' } }
   const HOME_OVERRIDES: Record<string, Record<Lang, string>> = {
     'caso-epstein': { en: 'Overview', es: 'Inicio' },
   }
   ```

4. **Replace component logic:**
   ```ts
   import { getClientConfig } from '@/lib/investigations/registry'
   import type { TabId } from '@/lib/investigations/types'

   // In component:
   const config = getClientConfig(slug)
   const homeLabel = HOME_OVERRIDES[slug] ?? HOME_TAB.label
   const homeDef: NavTab = { href: '', label: homeLabel }
   const tabDefs = config
     ? [homeDef, ...config.tabs.map((id) => {
         const base = TAB_DEFAULTS[id]
         const override = LABEL_OVERRIDES[slug]?.[id]
         return override ? { ...base, label: override } : base
       })]
     : DEFAULT_TABS
   ```

5. **Keep `DEFAULT_TABS` unchanged** as fallback for unregistered slugs.

6. **Delete `CASE_TABS`** — no longer needed.

**Imports to add:**
- `import { getClientConfig } from '@/lib/investigations/registry'`
- `import type { TabId } from '@/lib/investigations/types'`

**Imports to keep:**
- `Link`, `usePathname`, `useLanguage`, `type Lang` — all still used

**Verification:**
- Cross-check that the generated tabs for each slug match the current CASE_TABS output exactly:
  - caso-epstein: Home(Overview), resumen, investigacion, grafo, cronologia, vuelos, evidencia, proximidad, simular (note: config has `simular`, current CASE_TABS has `/simulacion` — check href!)
  - caso-libra: Home, resumen(What happened), investigacion(Evidence), cronologia, dinero, evidencia(Documents), grafo, simular(Predictions)
  - finanzas-politicas: Home, resumen, investigacion, cronologia, dinero, conexiones

**RESOLVED href discrepancy:** Both `/caso/[slug]/simulacion/` and `/caso/[slug]/simular/` route directories exist. Current CASE_TABS: caso-epstein uses `/simulacion`, caso-libra uses `/simular`. Both configs have TabId `'simular'`. Resolution: TAB_DEFAULTS should map `simular` → `/simular` (matches TabId). Add HREF_OVERRIDES for caso-epstein: `simular` → `/simulacion`. This preserves exact current behavior.

**Updated strategy for href overrides:** Add `HREF_OVERRIDES` alongside `LABEL_OVERRIDES`:
```ts
const HREF_OVERRIDES: Partial<Record<string, Partial<Record<TabId, string>>>> = {
  'caso-epstein': {
    simular: '/simulacion',
  },
}
```
In the tab-building logic:
```ts
const base = TAB_DEFAULTS[id]
const override = LABEL_OVERRIDES[slug]?.[id]
const hrefOverride = HREF_OVERRIDES[slug]?.[id]
return {
  href: hrefOverride ?? base.href,
  label: override ?? base.label,
}
```

**Guardrails:** No Cypher (1001 n/a). No neo4j.int (1002 n/a). Typecheck must pass. Client component — `getClientConfig` is called at render time (it's a pure function reading a static Map, no server-only code). Verify this doesn't break the 'use client' boundary.
- 2.2 done: Refactored InvestigationNav to derive tabs from registry config. Deleted hardcoded CASE_TABS. Created TAB_DEFAULTS (Record<TabId, NavTab>) with default href/labels for all 10 TabIds. LABEL_OVERRIDES for caso-libra (5 overrides: resumen, investigacion, evidencia, simular, dinero). HREF_OVERRIDES for caso-epstein (simular→/simulacion). HOME_LABEL_OVERRIDES for caso-epstein (Overview instead of Home). Slug lookup uses fallback `caso-${slug}` prefix to handle finanzas-politicas→caso-finanzas-politicas registry key mismatch. DEFAULT_TABS preserved as fallback for unregistered slugs. Cross-verified all 3 cases produce exact same tab output as old CASE_TABS. Typecheck clean (pre-existing EvidenceExplorer only). Commit: a122d36
- 2.2 REVIEWED (Critic): PASS. All checks verified: (1) CASE_TABS deleted, replaced by buildTabs() using registry getClientConfig(). (2) TAB_DEFAULTS covers all 10 TabIds with correct default labels/hrefs. (3) LABEL_OVERRIDES for caso-libra (5 entries) preserve exact old labels including case-sensitive 'El dinero' vs 'El Dinero'. (4) HREF_OVERRIDES for caso-epstein simular→/simulacion preserves old /simulacion path. (5) HOME_LABEL_OVERRIDES for caso-epstein (Overview). (6) Slug fallback `caso-${slug}` handles finanzas-politicas correctly. (7) Cross-verified all 3 cases produce identical tab arrays to old CASE_TABS. (8) getClientConfig is pure function on static Map — safe for 'use client'. (9) Typecheck: only pre-existing EvidenceExplorer date prop error, no new errors. No blocking issues.
- Finalizer: 2.2 review passed, task closed. 2 remaining open tasks in Step 2: delete-fp-static (m9:delete-fp-static), i18n-titles (m9:i18n-titles). Advancing queue for Planner to create 2.3 builder brief (delete static finanzas-politicas routes except conexiones).

- Planner (2.3 analysis): BLOCKING ISSUE — cannot delete static FP routes yet. Investigation:
  - `caso/[slug]/resumen/page.tsx` is caso-libra-specific (hardcoded Libra narrative, $LIBRA stats)
  - `caso/[slug]/cronologia/page.tsx` imports `getTimeline` from `@/lib/caso-libra`
  - `caso/[slug]/dinero/page.tsx` imports caso-libra wallet data
  - `caso/[slug]/investigacion/page.tsx` imports caso-libra fact-check items
  - `caso/[slug]/page.tsx` imports `getStats, getActors, getDocuments` from `@/lib/caso-libra`
  - The FP static pages have DIFFERENT content (Argentine political finance data, different stats, different timeline events from `@/lib/caso-finanzas-politicas/investigation-data`)
  - Deleting FP static routes would cause Next.js to fall through to [slug] routes, which would render CASO-LIBRA content for finanzas-politicas URLs — WRONG
  - The [slug] sub-routes need to be genericized first (dispatch content based on slug), which is out of M9 scope
  - DECISION: Close task m9:delete-fp-static as not-actionable. The [slug] routes are not yet generic enough. This is deferred post-M9 work.
  - Advancing to 2.4 (i18n-titles) as final Step 2 task.

**2.4 Builder Brief — Browser language detection + bilingual titles/metadata:**

**Problem:** The site is hardcoded to Spanish (`<html lang="es">`, metadata in Spanish only). The LanguageProvider defaults to a hardcoded lang and doesn't detect browser preference. The site should detect browser language and set appropriate defaults.

**Scope: 2 file edits**

1. **`webapp/src/lib/language-context.tsx`** (38 lines) — Add browser language detection
   - In the LanguageProvider, replace `useState<Lang>(defaultLang)` with browser detection:
   ```ts
   const [lang, setLang] = useState<Lang>(() => {
     if (typeof window === 'undefined') return defaultLang
     // Check navigator.language first (most reliable client-side)
     const browserLang = navigator.language?.slice(0, 2)
     if (browserLang === 'en' || browserLang === 'es') return browserLang
     return defaultLang
   })
   ```
   - Add a `useEffect` that sets `document.documentElement.lang` when `lang` changes:
   ```ts
   useEffect(() => {
     document.documentElement.lang = lang
   }, [lang])
   ```
   - Import `useEffect` from React (already has createContext, useContext, useState, useCallback)

2. **`webapp/src/app/layout.tsx`** (40 lines) — Make metadata bilingual
   - Change the metadata export:
   ```ts
   export const metadata: Metadata = {
     title: 'OA — Oficina de Rendición de Cuentas / Office of Accountability',
     description:
       'Plataforma de conocimiento cívico. Civic knowledge platform for investigative research.',
   }
   ```
   - This provides both languages in a single string since Next.js Metadata is server-side and can't be dynamic per-user without middleware. The bilingual approach is pragmatic and SEO-friendly.

**NOT in scope:**
- Changing per-investigation layout metadata (each already has appropriate lang context)
- Replacing hardcoded `siteName` strings in OG image routes or page components (content strings, not structural)
- Next.js i18n middleware / locale routing (YAGNI — this is a simple bilingual toggle, not full i18n)

**Guardrails:** No Cypher (1001 n/a). No neo4j.int (1002 n/a). Typecheck must pass. `typeof window === 'undefined'` guard for SSR safety.
- 2.4 done: Added browser language detection to LanguageProvider — useState initializer checks navigator.language (SSR-guarded with typeof window check), maps 'en'/'es' to Lang, falls back to defaultLang. Added useEffect to sync document.documentElement.lang on lang changes. Root layout metadata updated to bilingual: title "OA — Oficina de Rendición de Cuentas / Office of Accountability", description bilingual. Typecheck clean (pre-existing EvidenceExplorer only). Commit: 6c629ad
- 2.4 REVIEWED (Critic): PASS. All checks verified: (1) Browser lang detection uses navigator.language with proper SSR guard (typeof window === 'undefined'), maps only en/es to Lang type, falls back to defaultLang. (2) useEffect syncs document.documentElement.lang on lang changes — correct pattern. (3) useState lazy initializer is the right approach for client-only detection. (4) Root metadata bilingual — title and description both have en+es. (5) Scope correctly limited — no per-investigation metadata, no i18n middleware. (6) Typecheck: only pre-existing EvidenceExplorer date prop error, no new errors. No blocking issues.

- Finalizer (final verification): ALL steps in plan complete. Final checks:
  - Typecheck: PASS (only pre-existing EvidenceExplorer date prop error — not M9)
  - Build: PASS (client 537ms, ssr 564ms)
  - No orphaned TODOs in new code
  - Reconciliation: Step 1 completed Phase 5 remaining backend items (FP types/queries/transform, Libra query rewrite, Epstein transform align, graph constants, 301 redirects). Step 2 completed Phase 6 subset (fetch URL fixes, nav config from registry, i18n). Phase 6 items deferred: delete static FP routes (blocked — [slug] routes not generic enough), shared components (already exist), page refactoring (speculative/out of scope for this loop). 20 commits on branch.
  - LOOP_COMPLETE
