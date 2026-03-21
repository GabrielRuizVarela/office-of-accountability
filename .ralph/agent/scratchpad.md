# Plan: Complete M9 — Investigation Standardization

## Overview
M9 Phases 1-4 are done (schema, migrations, seed scripts). Phase 5 is ~70% done (unified API routes exist, investigations lib exists, configs exist). Remaining work is Phase 5 completion + Phase 6 frontend.

**Unified API routes** live at `/api/caso/[slug]/*` (11 routes, slug-validated). Old `/api/caso-libra/*` routes already have 301 redirects.

## Current Step: Step 1 — Complete Phase 5 Backend

### Sub-tasks:
- [x] 1.1 Create `caso-finanzas-politicas/{types,queries,transform}.ts` — DONE commit 5133098. types.ts has FinPol* interfaces + Zod schemas for Person, Org, Event, Claim, MoneyFlow, ShellCompany, GovernmentAction. queries.ts delegates generic ops to query builder, adds domain queries for Claims/MoneyFlows/ShellCompanies. transform.ts maps Neo4j props to typed objects. tsc passes (no new errors).
- [ ] 1.2 Rewrite `caso-libra/queries.ts` — still uses CasoLibra* prefixed labels, needs generic labels + caso_slug + delegation to query builder (file: `webapp/src/lib/caso-libra/queries.ts`)
- [ ] 1.3 Update `graph/constants.ts` — add ShellCompany, Aircraft, Wallet, Token, Claim, MoneyFlow, GovernmentAction to LABEL_COLORS and LABEL_DISPLAY (file: `webapp/src/lib/graph/constants.ts`)

### Notes:
- caso-epstein transform.ts doesn't need update — query-builder.ts has generic toInvestigationNode() already used
- Unified API routes already done at /api/caso/[slug]/* — no need to create /api/casos/ routes
- Old caso-libra routes already have 301 redirects

## Step 2 — Frontend Standardization (Phase 6)

### Sub-tasks (materialize when Step 1 done):
- [ ] 2.1 Update hardcoded fetch URLs in [slug] pages (dinero, investigacion, actor, evidencia)
- [ ] 2.2 Refactor InvestigationNav.tsx — read tabs from config
- [ ] 2.3 Create shared components (InvestigationLanding, NarrativeView, ClaimCard, MoneyFlowCard)
- [ ] 2.4 Refactor landing/resumen/investigacion/cronologia/evidencia/grafo/vuelos pages
- [ ] 2.5 Delete static finanzas-politicas routes (keep /conexiones)
- [ ] 2.6 i18n — browser language detection + bilingual titles (existing task)

## Completed Steps:
- Phase 1: Schema & Config Nodes — done
- Phase 2: Caso Libra Label Migration — done
- Phase 3: Caso Finanzas Politicas Import — done
- Phase 4: Caso Epstein Alignment — done
- Phase 5 partial: investigations/ lib, unified API routes, configs, redirects — done

## Finalizer Note (iteration after 1.1 review)
Review passed for sub-task 1.1 (caso-finanzas-politicas types/queries/transform). Minor note: getMoneyFlowGraph duplicates getGraph — can be addressed later. Two sub-tasks remain in Step 1: 1.2 (caso-libra queries rewrite) and 1.3 (graph constants update). Advancing queue for Builder to pick up next sub-task.

## Planner Note (queue.advance after 1.1)
Emitting tasks.ready for sub-task 1.2 (caso-libra queries rewrite). Sub-task 1.3 (graph constants) follows after.

### Builder Guidance for 1.2 — Rewrite caso-libra/queries.ts
**File:** `webapp/src/lib/caso-libra/queries.ts` (463 lines)
**Reference pattern:** `webapp/src/lib/caso-finanzas-politicas/queries.ts` — delegates generic ops to query builder

**What to change:**
1. Replace all `CasoLibra*` prefixed labels in Cypher queries with generic labels (Person, Event, Document, Wallet, Organization, Token) + `caso_slug` filtering
2. Delegate generic operations to the query builder (`getQueryBuilder()` from `../investigations/query-builder`):
   - `getInvestigationGraph()` → `qb.getGraph(CASO_LIBRA_SLUG)`
   - `getTimeline()` → `qb.getTimeline(CASO_LIBRA_SLUG)`
   - `getStats()` → `qb.getStats(CASO_LIBRA_SLUG)`
   - `getActors()` → `qb.getNodesByType(CASO_LIBRA_SLUG, 'Person')`
   - `getDocuments()` → `qb.getNodesByType(CASO_LIBRA_SLUG, 'Document')`
   - `getPersonBySlug(slug)` → `qb.getNodeBySlug(CASO_LIBRA_SLUG, 'Person', slug)` + connections via `qb.getNodeConnections()`
   - `getDocumentBySlug(slug)` → `qb.getNodeBySlug(CASO_LIBRA_SLUG, 'Document', slug)` + mentions
3. Keep domain-specific queries that have no query-builder equivalent (e.g., `getWalletFlows` for the crypto wallet subgraph — may need local Cypher with generic labels + caso_slug)
4. Define `CASO_LIBRA_SLUG = 'caso-libra'` constant (check if already in types.ts)
5. Keep the existing export function signatures to avoid breaking callers — map query builder return types back to current types where needed
6. The `CasoLibraStats` type has hardcoded Libra-specific stats (totalLossUsd, affectedWallets, priceDrop) — keep those as domain-specific, only delegate the count queries

**Important:**
- Check `webapp/src/lib/caso-libra/types.ts` for the CASO_LIBRA_SLUG constant
- Check existing callers with: `grep -r "from.*caso-libra/queries" webapp/src/`
- `tsc --noEmit` must pass after changes

## Builder Note (sub-task 1.3 completed)
Added 7 new labels to both LABEL_COLORS and LABEL_DISPLAY in graph/constants.ts:
- ShellCompany (#a855f7 purple / Empresa Fantasma)
- Aircraft (#0ea5e9 sky / Aeronave)
- Wallet (#14b8a6 teal / Billetera)
- Token (#6366f1 indigo / Token)
- Claim (#f43f5e rose / Denuncia)
- MoneyFlow (#22c55e green / Flujo de Dinero)
- GovernmentAction (#d946ef fuchsia / Accion Gubernamental)
tsc passes (pre-existing EvidenceExplorer date prop error only, unrelated). Committed as 99b9ab9.

## Finalizer Note (sub-task 1.3 review passed)
Review passed for sub-task 1.3 (graph constants). Sub-tasks 1.1 and 1.3 are now complete. One sub-task remains in Step 1: 1.2 (caso-libra queries rewrite — task-1774082360-0f48). Advancing queue for Builder to pick up.

## Planner Note (queue.advance after 1.3, re-emitting 1.2)
Sub-task 1.2 was started in a previous iteration but no changes were committed — the builder didn't complete. Reopened task-1774082360-0f48 and re-emitting tasks.ready. This is the last sub-task in Step 1. Once 1.2 is done, Step 1 (Phase 5 Backend) is complete and Step 2 (Phase 6 Frontend) begins.

Builder guidance for 1.2 is already in scratchpad above (see "Builder Guidance for 1.2"). Key points:
- File: `webapp/src/lib/caso-libra/queries.ts` (463 lines)
- Reference: `webapp/src/lib/caso-finanzas-politicas/queries.ts` for delegation pattern
- Replace CasoLibra* labels → generic labels + caso_slug
- Delegate generic ops to query builder
- Keep domain-specific queries (wallet flows, crypto stats) with updated labels
- Preserve export signatures to avoid breaking callers

## Builder Note (sub-task 1.2 completed)
Rewrote `caso-libra/queries.ts` (463→150 lines net). Changes:
- Replaced all 6 CasoLibra* prefixed labels (CasoLibraPerson, CasoLibraEvent, CasoLibraDocument, CasoLibraWallet, CasoLibraOrganization, CasoLibraToken) with generic labels + `caso_slug = 'caso-libra'` filtering
- Delegated 5 generic ops to query builder: getInvestigationGraph → qb.getGraph, getTimeline → qb.getTimeline, getActors → qb.getNodesByType('Person'), getDocuments → qb.getNodesByType('Document'), getStats → qb.getStats + domain-specific fields
- Kept 3 domain-specific queries with local Cypher: getWalletFlows (wallet subgraph with SENT rels), getPersonBySlug (complex return with graph+events+documents), getDocumentBySlug (mentions subquery)
- Added thin adapters for getTimeline, getActors, getDocuments to preserve old return types (caso-libra TimelineItem, Record<string, unknown>[]) for caller compatibility — callers will be updated in Step 2
- Removed unused asNumber helper, walletElementIds variable
- tsc passes (only pre-existing EvidenceExplorer date prop errors remain, unrelated)
- Committed as 48064e2

## Critic Note (sub-task 1.2 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer errors)
- All 6 CasoLibra* labels replaced with generic labels + caso_slug filtering
- All Cypher queries parameterized ($slug, $casoSlug) — no injection risk
- 5 generic ops properly delegated to query builder
- 3 domain-specific queries (getWalletFlows, getPersonBySlug, getDocumentBySlug) use generic labels + caso_slug
- getWalletFlows uses two-pass pattern per architecture convention
- GraphData type moved from neo4j/types to investigations/types — non-breaking (no direct callers of caso-libra/queries found)
- Export signatures preserved via thin adapters
- No any types, no YAGNI violations

## Finalizer Note (Step 1 complete, advancing to Step 2)
Step 1 (Phase 5 Backend) is fully complete — all 3 sub-tasks passed review:
- 1.1 caso-finanzas-politicas types/queries/transform (commit 5133098)
- 1.2 caso-libra queries rewrite (commit 48064e2)
- 1.3 graph constants update (commit 99b9ab9)

Current step done, more steps remain → advancing queue for Planner to create Step 2 (Phase 6 Frontend) sub-tasks. Step 2 sub-tasks are already outlined in scratchpad (2.1-2.6).

## Current Step: Step 2 — Frontend Standardization (Phase 6)

### Exploration Findings:
- 4 pages have hardcoded fetch URLs to `/api/caso-libra/` instead of using `slug`: dinero, investigacion, evidencia/[docSlug], actor/[actorSlug]
- `InvestigationNav.tsx` has hardcoded `CASE_TABS` map — registry config (`registry.ts`) already defines tabs per case, nav should read from it
- Static route directories exist: `caso/caso-epstein/` (6 files) and `caso/finanzas-politicas/` (7 files) — these duplicate generic `[slug]` pages
- Shared components already exist (ActorCard, DocumentCard, Timeline, KeyStats, etc.) — no need to create new ones
- Landing page component `CasoLandingContent.tsx` already exists as shared component
- Registry at `webapp/src/lib/investigations/registry.ts` has client-side config with tabs, features, hero per case

### Re-scoped Sub-tasks:
- [ ] 2.1 Fix hardcoded fetch URLs in [slug] pages — 4 files need `/api/caso-libra/` → `/api/caso/${slug}/`
- [ ] 2.2 Refactor InvestigationNav.tsx — replace hardcoded CASE_TABS with registry config lookup
- [ ] 2.3 Delete static caso-epstein/ route directory — merge any unique logic into [slug] pages
- [ ] 2.4 Delete static finanzas-politicas/ route directory — keep /conexiones as [slug] sub-route
- [ ] 2.5 i18n — browser language detection + bilingual titles

### Notes:
- Original 2.3 (shared components) dropped — they already exist
- Original 2.4 (refactor pages) absorbed into 2.1 and 2.3/2.4
- Sub-task 2.1 is lowest risk and highest impact — start here
- Sub-tasks 2.3 and 2.4 (delete static routes) need careful verification that [slug] pages cover all functionality

### Builder Guidance for 2.1 — Fix Hardcoded Fetch URLs
**Files to change (4):**
1. `webapp/src/app/caso/[slug]/dinero/page.tsx` line ~42: `fetch('/api/caso-libra/wallets')` → `fetch(\`/api/caso/${slug}/wallets\`)`
2. `webapp/src/app/caso/[slug]/investigacion/page.tsx` line ~957: `fetch('/api/caso-libra/investigation', {...})` → `fetch(\`/api/caso/${slug}/investigation\`, {...})`
3. `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` line ~34: `fetch('/api/caso-libra/document/${docSlug}')` → `fetch(\`/api/caso/${slug}/document/${docSlug}\`)`
4. `webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx` line ~41: `fetch('/api/caso-libra/person/${actorSlug}')` → `fetch(\`/api/caso/${slug}/person/${actorSlug}\`)`

**Pattern:** Each page should already receive `slug` from `useParams()` or `params.slug`. If not, add it.

**Verify:** Check that the corresponding generic API routes exist at `/api/caso/[slug]/wallets`, `/api/caso/[slug]/investigation`, `/api/caso/[slug]/document/[docSlug]`, `/api/caso/[slug]/person/[actorSlug]`. If they don't exist yet, the builder must create them (route file + handler that delegates to query-builder or case-specific queries based on slug).

**Important:** `tsc --noEmit` must pass after changes.

## Builder Note (sub-task 2.1 completed)
Fixed all 4 hardcoded fetch URLs + created 4 generic API routes. Changes:
- Created `/api/caso/[slug]/wallets/route.ts` — validates slug via registry, delegates to caso-libra `getWalletFlows()`, returns empty GraphData for other cases
- Created `/api/caso/[slug]/person/[actorSlug]/route.ts` — delegates to caso-libra `getPersonBySlug()` for caso-libra, falls back to query builder `getNodeBySlug` + `getNodeConnections` for others
- Created `/api/caso/[slug]/document/[docSlug]/route.ts` — delegates to caso-libra `getDocumentBySlug()` for caso-libra, falls back to query builder for others
- Created `/api/caso/[slug]/investigation/route.ts` — proxies GET/POST to caso-libra investigation route handler
- Updated `dinero/page.tsx`: added `useParams`, extracted `slug`, changed fetch to `/api/caso/${slug}/wallets`, added `slug` to useEffect deps
- Updated `investigacion/page.tsx`: added `useParams` to `SubmitEvidenceForm` component (not main component — the fetch is in the form), changed fetch to `/api/caso/${slug}/investigation`
- Updated `evidencia/[docSlug]/page.tsx`: `slug` already available from `useParams`, changed fetch to `/api/caso/${slug}/document/${docSlug}`
- Updated `actor/[actorSlug]/page.tsx`: `slug` already available from `useParams`, changed fetch to `/api/caso/${slug}/person/${actorSlug}`
- tsc passes (only pre-existing EvidenceExplorer date prop errors remain, unrelated)
- Committed as 5264444

## Critic Note (sub-task 2.1 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer errors)
- All 4 hardcoded `/api/caso-libra/` fetch URLs replaced with `/api/caso/${slug}/`
- 4 generic API routes created with slug validation via registry
- Input validation on actorSlug/docSlug (length check ≤200)
- No direct Neo4j queries in route handlers — all delegate to caso-libra module or query builder
- No `any` types, no injection risk
- `useParams` correctly added where needed (dinero, investigacion); already present in other two
- `slug` added to useEffect deps in dinero — correct
- Investigation route proxies to existing caso-libra handler — pragmatic approach
- No YAGNI violations

## Finalizer Note (sub-task 2.1 review passed, advancing to 2.2)
Sub-task 2.1 (fix hardcoded fetch URLs) review passed. Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [ ] 2.2 Refactor InvestigationNav.tsx — replace hardcoded CASE_TABS with registry config
- [ ] 2.3 Delete static caso-epstein/ route directory
- [ ] 2.4 Delete static finanzas-politicas/ route directory
- [ ] 2.5 i18n — browser language detection + bilingual titles

4 sub-tasks remain. Advancing queue for Builder to pick up 2.2 (InvestigationNav refactor).

### Builder Guidance for 2.2 — Refactor InvestigationNav.tsx
**File:** `webapp/src/components/investigation/InvestigationNav.tsx` (~110 lines)

**Current state:** Hardcoded `CASE_TABS: Record<string, NavTab[]>` with per-case tab arrays (3 cases + DEFAULT_TABS fallback). Each NavTab has `{ href: string, label: Record<Lang, string> }`.

**Registry state:** Each case config already has `tabs: readonly TabId[]` (e.g., `['resumen', 'investigacion', 'grafo', ...]`). `TabId` is a union type in `investigations/types.ts`. Registry accessed via `getClientConfig(slug)` from `investigations/registry.ts`.

**What to change:**
1. Create a `TAB_DEFS: Record<TabId, { href: string; label: Record<Lang, string> }>` lookup that maps each TabId to its href suffix and bilingual label. There are 10 TabIds: resumen, investigacion, cronologia, evidencia, grafo, dinero, simular, vuelos, proximidad, conexiones. Also add a "home" entry (href='', label: Overview/Inicio) — every case gets it as the first tab.
2. Import `getClientConfig` from `@/lib/investigations/registry` and `TabId` from `@/lib/investigations/types`
3. Replace the hardcoded `CASE_TABS` and `DEFAULT_TABS` with: `const config = getClientConfig(slug)` → map `config.tabs` through `TAB_DEFS` to get NavTab[]. Prepend home tab. If no config, use a sensible default (resumen + investigacion + grafo + cronologia + evidencia).
4. Remove the old `CASE_TABS` and `DEFAULT_TABS` constants entirely

**Label mapping (from current CASE_TABS — merge duplicates, pick most generic label):**
- resumen → `/resumen` — Summary/Resumen
- investigacion → `/investigacion` — Investigation/Investigacion
- cronologia → `/cronologia` — Timeline/Cronologia
- evidencia → `/evidencia` — Evidence/Evidencia
- grafo → `/grafo` — Connections/Conexiones
- dinero → `/dinero` — The Money/El Dinero
- simular → `/simular` — Predictions/Predicciones (caso-libra) / Simulation/Simulacion (caso-epstein uses `/simulacion` href but could be same TabId)
- vuelos → `/vuelos` — Flights/Vuelos
- proximidad → `/proximidad` — Proximity/Proximidad
- conexiones → `/conexiones` — Connections/Conexiones

**Note on simular vs simulacion:** caso-epstein CASE_TABS uses href `/simulacion` but TabId is `simular`. Check if the actual page route is `simulacion/` or `simular/`. The href in TAB_DEFS must match the actual route directory name.

**Keep:** Language toggle JSX, Link rendering logic, active tab styling — only change data source.

**Verify:** `tsc --noEmit` must pass after changes

## Builder Note (sub-task 2.2 completed)
Refactored `InvestigationNav.tsx` (119→97 lines). Changes:
- Replaced hardcoded `CASE_TABS: Record<string, NavTab[]>` (3 cases + DEFAULT_TABS fallback) with `TAB_DEFS: Record<TabId, {href, label}>` lookup
- Nav now reads tabs from `getClientConfig(slug).tabs` via registry — adding a new case only requires a config entry, no nav changes
- Created `HOME_TAB` constant prepended to all tab lists
- `DEFAULT_TAB_IDS` fallback for unknown slugs: resumen, investigacion, grafo, cronologia, evidencia
- `simular` TabId maps to `/simular` href (both `/simular/` and `/simulacion/` route dirs exist; TabId is `simular`)
- tsc passes (only pre-existing EvidenceExplorer date prop errors remain, unrelated)
- Committed as 282f070

## Critic Note (sub-task 2.2 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer date prop errors)
- Hardcoded `CASE_TABS` and `DEFAULT_TABS` fully replaced with `TAB_DEFS` + registry lookup
- No leftover references to old constants (grep confirms)
- `getClientConfig(slug)` returns `InvestigationClientConfig | undefined` — handled via `config?.tabs ?? DEFAULT_TAB_IDS` fallback
- `HOME_TAB` prepended to all tab lists — matches old behavior (every case had a home/overview tab)
- All 10 TabIds covered in TAB_DEFS, matching the TabId union type
- No `any` types, no YAGNI violations
- Non-blocking note: caso-epstein simulation tab href changed from `/simulacion` to `/simular` — both routes exist, and registry TabId is `simular`, so this is correct alignment with the registry as source of truth
- Non-blocking note: caso-libra lost custom labels (e.g., "What happened" → "Summary") — expected per guidance to pick most generic labels

## Finalizer Note (sub-task 2.2 review passed, advancing to 2.3)
Sub-task 2.2 (InvestigationNav refactor) review passed. Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [ ] 2.3 Delete static caso-epstein/ route directory (task-1774084158-d897)
- [ ] 2.4 Delete static finanzas-politicas/ route directory (task-1774084160-146d)
- [ ] 2.5 i18n — browser language detection + bilingual titles (task-1774074000-i18n)

3 sub-tasks remain. Advancing queue for Builder to pick up 2.3 (delete caso-epstein static routes).

### Builder Guidance for 2.3 — Delete static caso-epstein/ route directory

**Directory to delete:** `webapp/src/app/caso/caso-epstein/` (6 files: layout.tsx, page.tsx, cronologia/page.tsx, evidencia/page.tsx, investigacion/page.tsx, resumen/page.tsx)

**[slug] coverage check:**
- `[slug]/layout.tsx` ✓ exists
- `[slug]/page.tsx` ✓ exists (landing)
- `[slug]/cronologia/page.tsx` ✓ exists
- `[slug]/evidencia/page.tsx` ✓ exists
- `[slug]/investigacion/page.tsx` ✓ exists
- `[slug]/resumen/page.tsx` ✓ exists

All 6 caso-epstein pages have [slug] equivalents.

**Before deleting:**
1. Diff each caso-epstein page against its [slug] equivalent — verify no unique logic exists in the static version that isn't in [slug]
2. Check if caso-epstein layout.tsx has unique metadata/head content not in [slug]/layout.tsx
3. Check for any imports from caso-epstein files: `grep -r "caso-epstein" webapp/src/`
4. Check for any links pointing to `/caso/caso-epstein/` that need to stay working (Next.js will route `/caso/caso-epstein` through `[slug]` after the static dir is removed)

**After deleting:**
- `tsc --noEmit` must pass
- Verify Next.js still routes `/caso/caso-epstein` through `[slug]` (no 404)

**Important:** Just `rm -rf` the directory. Next.js dynamic routes (`[slug]`) automatically catch `/caso/caso-epstein` when the static route is gone.

## Planner Note (queue.advance after 2.2, emitting 2.3)
Sub-task 2.2 (InvestigationNav refactor) passed review (commit 282f070). Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [ ] 2.3 Delete static caso-epstein/ route directory (task-1774084158-d897)
- [ ] 2.4 Delete static finanzas-politicas/ route directory (task-1774084160-146d)
- [ ] 2.5 i18n — browser language detection + bilingual titles

Emitting tasks.ready for 2.3. Builder guidance for 2.3 already in scratchpad above (see "Builder Guidance for 2.3").

## Builder Note (sub-task 2.3 completed)
Deleted static `caso-epstein/` route directory (6 files) and merged all unique logic into `[slug]` pages. Changes:

**Critical finding:** The [slug] pages were Libra-specific, not generic. Each imported from `@/lib/caso-libra` and had hardcoded Libra content (investigation narrative, timeline data, etc.). Simply deleting the static directory would have broken caso-epstein entirely.

**Approach:** Created 4 Epstein-specific content components under [slug]/, made each [slug] page route by slug:
- Created `EpsteinCronologiaContent.tsx` — moved from static cronologia/page.tsx, parameterized links via slug prop
- Created `EpsteinEvidenciaContent.tsx` — moved from static evidencia/page.tsx, parameterized links
- Created `EpsteinInvestigacionContent.tsx` — moved from static investigacion/page.tsx, parameterized links
- Created `EpsteinResumenContent.tsx` — moved from static resumen/page.tsx, parameterized links
- Updated `[slug]/page.tsx` — renders OverviewContent+EPSTEIN_STATS for caso-epstein, CasoLandingContent for others
- Updated `[slug]/cronologia/page.tsx` — server component, switches based on slug
- Updated `[slug]/evidencia/page.tsx` — server component, switches based on slug
- Updated `[slug]/investigacion/page.tsx` — extracted Libra content to `LibraInvestigacionContent`, early return for Epstein
- Updated `[slug]/resumen/page.tsx` — extracted Libra content to `LibraResumenContent`, early return for Epstein
- All hardcoded `/caso/caso-epstein/` links replaced with `${basePath}/...` using slug prop
- Deleted `caso-epstein/layout.tsx` (redundant — [slug]/layout.tsx already handles it via CASE_META registry)
- Deleted `caso-epstein/page.tsx` (redundant — [slug]/page.tsx now handles EPSTEIN_STATS)
- tsc passes (only pre-existing EvidenceExplorer date prop errors remain, unrelated)
- Committed as dd5c9da

## Critic Note (sub-task 2.3 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer date prop errors)
- Static `caso-epstein/` directory fully deleted (6 files: layout, page, cronologia, evidencia, investigacion, resumen)
- 4 Epstein content components created under [slug]/ subdirs — clean rename+refactor from static pages
- All [slug] page files route by slug comparison (`if (slug === 'caso-epstein')`) — correct pattern
- All hardcoded `/caso/caso-epstein/` links parameterized via `basePath` prop
- Unused `l` function removed from EpsteinInvestigacionContent (was dead code in original)
- Unused `SLUG` constant removed from EpsteinResumenContent (replaced with slug prop)
- `EPSTEIN_STATS` moved from deleted static page.tsx into [slug]/page.tsx — data preserved
- Layout deletion is safe: [slug]/layout.tsx already has CASE_META entry for caso-epstein with matching metadata
- No `any` types, no injection risk, no YAGNI violations
- Non-blocking: client vs server component pattern varies across pages (investigacion/resumen are client, cronologia/evidencia are server) — matches pre-existing pattern, not introduced by this change

## Finalizer Note (sub-task 2.3 review passed, advancing to 2.4)
Sub-task 2.3 (delete caso-epstein) review passed (commit dd5c9da). Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [x] 2.3 Delete static caso-epstein/ route directory — DONE (commit dd5c9da)
- [ ] 2.4 Delete static finanzas-politicas/ route directory (task-1774084160-146d)
- [ ] 2.5 i18n — browser language detection + bilingual titles (task-1774074000-i18n)

2 sub-tasks remain. Advancing queue for Builder to pick up 2.4.

### Builder Guidance for 2.4 — Delete static finanzas-politicas/ route directory

**Directory to delete:** `webapp/src/app/caso/finanzas-politicas/` (8 files: layout.tsx, page.tsx, cronologia/page.tsx, dinero/page.tsx, investigacion/page.tsx, resumen/page.tsx, conexiones/page.tsx, conexiones/ConexionesGraph.tsx)

**[slug] coverage check:**
- `[slug]/layout.tsx` ✓ exists — BUT needs CASE_META entry for finanzas-politicas (currently only has caso-libra and caso-epstein)
- `[slug]/page.tsx` ✓ exists (landing) — needs finanzas-politicas branch (imports from `@/lib/caso-finanzas-politicas/investigation-data`)
- `[slug]/cronologia/page.tsx` ✓ exists — needs finanzas-politicas branch
- `[slug]/dinero/page.tsx` ✓ exists — needs finanzas-politicas branch
- `[slug]/investigacion/page.tsx` ✓ exists — needs finanzas-politicas branch
- `[slug]/resumen/page.tsx` ✓ exists — needs finanzas-politicas branch
- `[slug]/conexiones/` ✗ DOES NOT EXIST — must create this as new [slug] sub-route

**Critical: Same pattern as 2.3.** The [slug] pages are currently Libra/Epstein-specific. Each finanzas-politicas page has unique content importing from `@/lib/caso-finanzas-politicas/investigation-data`. Follow the same approach as 2.3: create FinPolXxxContent components, add slug-based routing.

**Specific steps:**

1. **Add CASE_META entry** in `[slug]/layout.tsx`:
   ```
   'finanzas-politicas': {
     title: 'Finanzas Politicas Argentinas',
     description: 'Investigacion sobre conexiones entre poder politico y dinero en Argentina. 617 politicos en 2+ datasets, 8 fuentes cruzadas.',
     defaultLang: 'es',
   }
   ```

2. **Create content components** (move static page content into these):
   - `[slug]/FinPolLandingContent.tsx` — from static page.tsx (imports IMPACT_STATS, FACTCHECK_ITEMS, etc., has EntryPoint sub-component). Parameterize `BASE_PATH` via slug prop.
   - `[slug]/cronologia/FinPolCronologiaContent.tsx` — from static cronologia/page.tsx
   - `[slug]/dinero/FinPolDineroContent.tsx` — from static dinero/page.tsx
   - `[slug]/investigacion/FinPolInvestigacionContent.tsx` — from static investigacion/page.tsx (large file ~627 lines, includes factcheck table, timeline, actors, money flow sections)
   - `[slug]/resumen/FinPolResumenContent.tsx` — from static resumen/page.tsx (large file, 8-chapter narrative)

3. **Create [slug]/conexiones/ route** (NEW — this is the unique part):
   - `[slug]/conexiones/page.tsx` — move from static conexiones/page.tsx, parameterize if needed
   - `[slug]/conexiones/ConexionesGraph.tsx` — move from static. **IMPORTANT:** Line 158 has hardcoded `fetch('/api/caso/finanzas-politicas/graph')` — parameterize to `/api/caso/${slug}/graph` by accepting a `slug` prop.
   - Verify that `/api/caso/[slug]/graph/` route exists. If not, it may need to be created (check `/api/caso/finanzas-politicas/graph/` for existing handler).

4. **Update [slug] page files** to route by slug:
   - `[slug]/page.tsx` — add `finanzas-politicas` branch rendering FinPolLandingContent
   - `[slug]/cronologia/page.tsx` — add `finanzas-politicas` branch
   - `[slug]/dinero/page.tsx` — add `finanzas-politicas` branch
   - `[slug]/investigacion/page.tsx` — add `finanzas-politicas` branch
   - `[slug]/resumen/page.tsx` — add `finanzas-politicas` branch

5. **Delete** `caso/finanzas-politicas/` directory entirely after all content is migrated

**After deleting:**
- `tsc --noEmit` must pass
- Next.js routes `/caso/finanzas-politicas` through `[slug]` automatically

**Note on layout:** Static layout has `flex min-h-screen flex-col` wrapper that [slug] layout does not. The [slug] layout structure is slightly different but functionally equivalent. Don't add the wrapper — keep [slug] layout consistent.

**Note on resumen/page.tsx:** Very large (~600+ lines). Move entire content as-is into FinPolResumenContent.tsx component, just convert default export to named export with slug prop.

## Planner Note (queue.advance after 2.3, emitting 2.4)
Sub-task 2.3 (delete caso-epstein) passed review (commit dd5c9da). Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [x] 2.3 Delete static caso-epstein/ route directory — DONE (commit dd5c9da)
- [ ] 2.4 Delete static finanzas-politicas/ route directory (task-1774084160-146d)
- [ ] 2.5 i18n — browser language detection + bilingual titles

Emitting tasks.ready for 2.4. Builder guidance already in scratchpad above (see "Builder Guidance for 2.4"). This is the largest sub-task — 8 files to migrate including a new [slug]/conexiones/ route. Key considerations:
- CASE_META entry needed in layout.tsx
- 5 content components to create (FinPolXxxContent)
- New [slug]/conexiones/ route with ConexionesGraph.tsx (parameterize hardcoded fetch URL)
- Update 5 [slug] page files with finanzas-politicas branch
- Delete static directory after migration

## Builder Note (sub-task 2.4 completed)
Deleted static `finanzas-politicas/` route directory (8 files) and merged all content into `[slug]` pages. Changes:

- Added CASE_META entry for finanzas-politicas in `[slug]/layout.tsx` (title, description, defaultLang: 'es')
- Created 5 FinPol content components:
  - `FinPolLandingContent.tsx` — landing page with hero, stats, entry points (parameterized basePath via slug prop)
  - `FinPolCronologiaContent.tsx` — timeline with category filters
  - `FinPolDineroContent.tsx` — money flow cards with ARS formatting
  - `FinPolInvestigacionContent.tsx` — 627-line investigation page with scroll spy, factcheck table, timeline, actors, money sections
  - `FinPolResumenContent.tsx` — 525-line 8-chapter narrative with citations
- Created new `[slug]/conexiones/` route (did NOT exist before):
  - `conexiones/page.tsx` — wrapper passing slug to graph component
  - `conexiones/ConexionesGraph.tsx` — parameterized fetch URL from hardcoded `/api/caso/finanzas-politicas/graph` to `/api/caso/${slug}/graph`
- Updated 5 [slug] page routers with `finanzas-politicas` branches (page, cronologia, dinero, investigacion, resumen)
- Dinero page: extracted existing Libra-specific logic into `LibraDineroContent` function, early return for finanzas-politicas
- Layout deletion safe: [slug]/layout.tsx now has CASE_META entry for finanzas-politicas
- tsc passes (only pre-existing EvidenceExplorer date prop errors remain)
- Committed as 00e3e65

## Critic Note (sub-task 2.4 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer date prop errors)
- Static `finanzas-politicas/` directory fully deleted (8 files: layout, page, cronologia, dinero, investigacion, resumen, conexiones/page, conexiones/ConexionesGraph)
- 5 FinPol content components created (FinPolLandingContent, FinPolCronologiaContent, FinPolDineroContent, FinPolInvestigacionContent, FinPolResumenContent) — clean rename+refactor from static pages
- New `[slug]/conexiones/` route created (page.tsx + ConexionesGraph.tsx) — correctly parameterized
- ConexionesGraph fetch URL parameterized from hardcoded `/api/caso/finanzas-politicas/graph` to `/api/caso/${slug}/graph` with `slug` in useEffect deps
- CASE_META entry added in layout.tsx with title, description, defaultLang: 'es'
- All [slug] page files route by slug comparison (`if (slug === 'finanzas-politicas')`) — correct pattern
- Dinero page correctly extracted existing Libra logic into `LibraDineroContent` function
- Unused `unknownAmount` translation removed from FinPolDineroContent (dead code cleanup)
- No `any` types, no injection risk, no YAGNI violations
- Non-blocking: conexiones/page.tsx is a generic page (not slug-gated) — currently only finanzas-politicas has conexiones tab in registry, so this is fine. If another case adds conexiones tab, the slug is already passed to ConexionesGraph.

## Finalizer Note (sub-task 2.4 review passed, advancing to 2.5)
Sub-task 2.4 (delete finanzas-politicas) review passed (commit 00e3e65). Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [x] 2.3 Delete static caso-epstein/ route directory — DONE (commit dd5c9da)
- [x] 2.4 Delete static finanzas-politicas/ route directory — DONE (commit 00e3e65)
- [ ] 2.5 i18n — browser language detection + bilingual titles (task-1774074000-i18n)

1 sub-task remains. Advancing queue for Planner/Builder to pick up 2.5 (i18n).

### Builder Guidance for 2.5 — i18n: browser language detection + bilingual titles/metadata

**M9 acceptance criterion:** "Add browser language detection + bilingual page titles/metadata (i18n — 'OA Office of Accountability' en / 'OA Oficina de Rendición de Cuentas' es)"

**Current state:**
- `LanguageProvider` (`lib/language-context.tsx`) — client-side context with `lang`, `setLang`, `toggle`. Initializes from `defaultLang` prop (static, no browser detection).
- `InvestigationNav` already has EN/ES toggle buttons and reads from `useLanguage()`.
- `[slug]/layout.tsx` — `CASE_META` has monolingual title/description per case + `defaultLang` field.
- Root `layout.tsx` — hardcoded `lang="es"`, monolingual metadata.
- `i18n/request.ts` — hardcoded to `defaultLocale` ('es'). `messages/en.json` and `messages/es.json` exist.
- `middleware.ts` — no language detection.
- No `navigator.language` or `Accept-Language` detection anywhere.

**What to build (3 changes):**

#### 1. Browser language detection in LanguageProvider
**File:** `webapp/src/lib/language-context.tsx`

Add a `useEffect` that runs once on mount to detect browser language via `navigator.language`. If it starts with `'en'`, set lang to `'en'`; otherwise keep the `defaultLang`. Only apply if user hasn't manually toggled (i.e., only on initial mount).

```typescript
const [lang, setLang] = useState<Lang>(defaultLang)

useEffect(() => {
  // Detect browser language on mount — respect defaultLang for case-specific pages
  // but prefer browser language when it's a supported locale
  const browserLang = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : null
  if (browserLang === 'en' || browserLang === 'es') {
    setLang(browserLang)
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

**Important:** Empty deps array — run once on mount only. The `defaultLang` is the case's preferred language but browser language takes precedence for user comfort.

#### 2. Bilingual site-level `<title>` via client component
**File:** Create `webapp/src/components/layout/DynamicTitle.tsx`

A small client component that uses `useLanguage()` to update `document.title` reactively:
```typescript
'use client'
import { useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'

const SITE_TITLES: Record<string, Record<string, string>> = {
  // Will be used as title suffix via template
}

// Exports a component that sets <html lang> attribute dynamically
export function DynamicHtmlLang() {
  const { lang } = useLanguage()
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  return null
}
```

Then use this in `[slug]/layout.tsx` (inside the LanguageProvider) to keep `<html lang>` in sync with the user's chosen language.

**Do NOT try to make `generateMetadata` dynamic based on client state** — it runs server-side. The static server metadata is fine for SEO (crawlers see the default). The client-side `document.documentElement.lang` update handles accessibility.

#### 3. Bilingual CASE_META titles in [slug]/layout.tsx
**File:** `webapp/src/app/caso/[slug]/layout.tsx`

Change CASE_META to use bilingual titles and descriptions:
```typescript
const CASE_META: Record<string, { title: Record<Lang, string>; description: Record<Lang, string>; defaultLang: Lang }> = {
  'caso-libra': {
    title: { es: 'Caso Libra — Oficina de Rendición de Cuentas', en: 'Libra Case — Office of Accountability' },
    description: { es: 'Investigacion comunitaria...', en: 'Community investigation...' },
    defaultLang: 'es',
  },
  'caso-epstein': {
    title: { es: 'Caso Epstein — Oficina de Rendición de Cuentas', en: 'Epstein Case — Office of Accountability' },
    description: { es: 'Red de tráfico y poder...', en: 'Trafficking and power network...' },
    defaultLang: 'en',
  },
  'finanzas-politicas': {
    title: { es: 'Finanzas Políticas Argentinas', en: 'Argentine Political Finance' },
    description: { es: 'Investigacion sobre conexiones...', en: 'Investigation into connections...' },
    defaultLang: 'es',
  },
}
```

For `generateMetadata` (server-side), use `defaultLang` to pick the title:
```typescript
const lang = meta?.defaultLang ?? 'es'
return { title: meta?.title[lang], description: meta?.description[lang] }
```

Add a client component `<BilingualDocTitle>` that reads `useLanguage()` and updates `document.title` when lang changes:
```typescript
// Inside layout, after LanguageProvider:
<BilingualDocTitle titles={CASE_META[slug]?.title} />
```

This component reads the title map as a prop and sets `document.title` via useEffect when `lang` changes.

#### 4. Update root layout.tsx
**File:** `webapp/src/app/layout.tsx`

Change the static metadata to include both languages in some form. Simplest: keep `es` as default for SEO, but add alternates or just keep bilingual in the description. The key change: wrap in LanguageProvider at root level so the `DynamicHtmlLang` component works everywhere, or just add it to `[slug]/layout.tsx` only (since that's where LanguageProvider lives).

**Actually — keep it simple.** Only add `<DynamicHtmlLang />` inside `[slug]/layout.tsx` where LanguageProvider already wraps. The root layout can stay `lang="es"` — investigation pages will override dynamically.

**Verification:**
- `tsc --noEmit` must pass
- Browser detection: open a page in a browser with English locale → should show English labels
- Toggle EN/ES in InvestigationNav → `document.title` and `document.documentElement.lang` should update

## Planner Note (queue.advance after 2.4, emitting 2.5)
Sub-task 2.4 (delete finanzas-politicas) passed review (commit 00e3e65). Step 2 progress:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [x] 2.3 Delete static caso-epstein/ route directory — DONE (commit dd5c9da)
- [x] 2.4 Delete static finanzas-politicas/ route directory — DONE (commit 00e3e65)
- [ ] 2.5 i18n — browser language detection + bilingual titles (task-1774074000-i18n)

Emitting tasks.ready for 2.5. This is the FINAL sub-task of Step 2 (and M9). Builder guidance above covers all 3 changes needed: browser detection in LanguageProvider, DynamicHtmlLang component, bilingual CASE_META titles with client-side document.title updates.

## Builder Note (sub-task 2.5 completed)
Implemented i18n — browser language detection + bilingual titles/metadata. 3 changes:

1. **LanguageProvider** (`lib/language-context.tsx`): Added `useEffect` on mount to detect browser language via `navigator.language`. If browser lang is `en` or `es`, overrides `defaultLang`. Empty deps array — runs once on mount only.

2. **DynamicTitle.tsx** (`components/layout/DynamicTitle.tsx`): Created two client components:
   - `DynamicHtmlLang` — syncs `document.documentElement.lang` with current language
   - `BilingualDocTitle` — updates `document.title` when language changes, accepts `titles` prop (Record<string, string>)

3. **Bilingual CASE_META** (`[slug]/layout.tsx`): Changed `title` and `description` from `string` to `Record<Lang, string>`. All 3 cases (caso-libra, caso-epstein, finanzas-politicas) now have bilingual titles and descriptions. `generateMetadata` uses `defaultLang` for server-side SEO. Added `<DynamicHtmlLang />` and `<BilingualDocTitle titles={...} />` inside LanguageProvider.

- tsc passes (only pre-existing EvidenceExplorer date prop errors remain)
- Committed as 8853dc5

Step 2 complete:
- [x] 2.1 Fix hardcoded fetch URLs — DONE (commit 5264444)
- [x] 2.2 Refactor InvestigationNav.tsx — DONE (commit 282f070)
- [x] 2.3 Delete static caso-epstein/ route directory — DONE (commit dd5c9da)
- [x] 2.4 Delete static finanzas-politicas/ route directory — DONE (commit 00e3e65)
- [x] 2.5 i18n — browser language detection + bilingual titles — DONE (commit 8853dc5)

**M9 is complete.** All Step 1 (Phase 5 backend) and Step 2 (Phase 6 frontend) sub-tasks are done.

## Critic Note (sub-task 2.5 review)
Review PASSED. Verified independently:
- tsc --noEmit passes (only pre-existing EvidenceExplorer date prop errors)
- Browser language detection: `useEffect` on mount, checks `navigator.language`, sets to `en` or `es` if matched
- `DynamicHtmlLang`: syncs `document.documentElement.lang` with current language
- `BilingualDocTitle`: updates `document.title` from `titles` prop when lang changes, null-safe
- `CASE_META` changed from `string` to `Record<Lang, string>` for title/description — all 3 cases bilingual
- `generateMetadata` uses `defaultLang` to pick server-side title — correct (SEO gets default, client updates dynamically)
- `<DynamicHtmlLang />` and `<BilingualDocTitle />` placed inside `LanguageProvider` in layout — correct
- No `any` types, no injection risk, no YAGNI violations
- Empty deps array on browser detection is correct (mount-once)

**M9 Step 2 and M9 overall: COMPLETE.** All 5 sub-tasks passed review.

## Finalizer Note (M9 COMPLETE — final verification passed)
Final verification results:
- tsc --noEmit: PASS (only pre-existing EvidenceExplorer date prop errors, not M9-related)
- pnpm run build: PASS (client built in 541ms, SSR built in 515ms)
- No orphaned TODOs in caso/ directory
- All M9 sub-tasks reviewed and closed

M9 deliverables:
- Step 1 (Phase 5 backend): Generic API routes, registry config, query abstraction
- Step 2 (Phase 6 frontend):
  - 2.1 Fix hardcoded fetch URLs (commit 5264444)
  - 2.2 Refactor InvestigationNav.tsx (commit 282f070)
  - 2.3 Delete static caso-epstein/ routes (commit dd5c9da)
  - 2.4 Delete static finanzas-politicas/ routes (commit 00e3e65)
  - 2.5 i18n browser language detection + bilingual titles (commit 8853dc5)

Emitting LOOP_COMPLETE.
