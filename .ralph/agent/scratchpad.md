# Plan: Complete M9 — Investigation Standardization (Frontend)

Backend infrastructure (types, query-builder, registry, unified API routes, seed scripts, migrations) is done.
Four frontend tasks remain to complete M9.

## Current Step: Step 1 — Fix hardcoded fetch URLs + delete static routes

These are independent file-level changes that unblock the config-driven frontend.

### Sub-tasks:
- [x] 1.1 Update fetch URLs in `webapp/src/app/caso/[slug]/dinero/page.tsx` — change `/api/caso-libra/wallets` to `/api/caso/${slug}/wallets` (file: webapp/src/app/caso/[slug]/dinero/page.tsx)
- [x] 1.2 Update fetch URL in `webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx` — change `/api/caso-libra/person/${actorSlug}` to `/api/caso/${slug}/person/${actorSlug}` (file: webapp/src/app/caso/[slug]/actor/[actorSlug]/page.tsx)
- [x] 1.3 Update fetch URL in `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` — change `/api/caso-libra/document/${docSlug}` to `/api/caso/${slug}/document/${docSlug}` (file: webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx)
- [ ] 1.4 Delete static finanzas-politicas routes except /conexiones — remove page.tsx, layout.tsx, resumen/, investigacion/, cronologia/, dinero/ (dir: webapp/src/app/caso/finanzas-politicas/)

### Notes:
- The [slug] pages already receive slug from useParams() but don't use it in fetch calls
- /conexiones must be preserved — it's a platform-graph visualization
- The unified API routes already exist at /api/caso/[slug]/*

## Step 2 — Refactor InvestigationNav to be config-driven
### Sub-tasks:
- [ ] 2.1 Refactor InvestigationNav.tsx — replace hardcoded CASE_TABS with tabs from getInvestigationConfig(slug) or registry (file: webapp/src/components/investigation/InvestigationNav.tsx)

### Notes:
- Current CASE_TABS hardcodes per-investigation tab arrays
- Registry at src/lib/investigations/registry.ts has InvestigationClientConfig with tabs

## Current Step: Step 3 — Browser language detection + bilingual metadata
### Sub-tasks:
- [ ] 3.1 Add browser language detection to LanguageProvider (file: webapp/src/lib/language-context.tsx)
- [ ] 3.2 Replace hardcoded CASE_META in layout with registry-driven bilingual metadata (file: webapp/src/app/caso/[slug]/layout.tsx)

## Completed Steps:
- Phase 1-5 (backend): types, query-builder, registry, config, unified API routes, seed scripts, migrations — all done

## Iteration Notes — Step 1.1 (dinero URL fix)
- Added `useParams` import from next/navigation
- Extracted `slug` from params with string guard
- Changed fetch URL from `/api/caso-libra/wallets` to `/api/caso/${slug}/wallets`
- Typecheck: no new errors (pre-existing EvidenceExplorer.tsx date prop error unrelated)
- Commit: e192799

## Iteration Notes — Finalizer after Step 1.1 review
- Review passed for Step 1.1 (dinero URL fix) — verified correct
- Step 1 still has 3 unchecked sub-tasks (1.2 actor URL, 1.3 evidencia URL, 1.4 delete static routes)
- Steps 2 and 3 also remain
- Advancing queue for Builder to pick up next sub-task

## Iteration Notes — Planner queue.advance after Step 1.1
- Confirmed actor page still has hardcoded `/api/caso-libra/person/${actorSlug}` at line 41
- Confirmed evidencia page still has hardcoded `/api/caso-libra/document/${docSlug}` at line 34
- Actor page also imports from `@/lib/caso-libra/types` (line 13) — Builder should note this is a type import, not a URL, leave it for now
- Dispatching task 1.2 (actor URL) to Builder next

## Iteration Notes — Step 1.2 (actor URL fix)
- Changed fetch URL from `/api/caso-libra/person/${actorSlug}` to `/api/caso/${slug}/person/${actorSlug}` at line 41
- `slug` was already extracted from `useParams()` on line 32 — no new imports needed
- Added `slug` to useEffect dependency array (was only `[actorSlug]`, now `[slug, actorSlug]`)
- Type import from `@/lib/caso-libra/types` on line 13 left as-is (not a URL)
- Typecheck: no new errors (pre-existing EvidenceExplorer.tsx date prop error unrelated)
- Commit: 60da379

## Iteration Notes — Critic review of Step 1.2 (actor URL fix)
- Diff reviewed: commit 60da379 changes exactly 2 lines in actor/[actorSlug]/page.tsx
- URL correctly changed from `/api/caso-libra/person/${actorSlug}` to `/api/caso/${slug}/person/${actorSlug}`
- slug was already available from useParams() — no new imports needed
- useEffect deps updated to include slug — correct
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated to this change)
- No blocking issues found — passing review

## Iteration Notes — Finalizer after Step 1.2 review (second pass)
- Review passed for Step 1.2 (actor URL fix) — commit 60da379 verified correct
- Step 1 still has 2 unchecked sub-tasks: 1.3 evidencia URL, 1.4 delete static routes
- Steps 2 (nav refactor) and 3 (i18n) also remain
- Advancing queue for Builder to pick up next sub-task (1.3 evidencia URL)

## Iteration Notes — Planner queue.advance after Step 1.2
- Confirmed evidencia page at `webapp/src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` still has hardcoded `/api/caso-libra/document/${docSlug}` at line 34
- `slug` already extracted from `useParams()` on line 25 — no new imports needed
- useEffect deps at line 45 only has `[docSlug]` — Builder must add `slug` to deps array
- Dispatching task 1.3 (evidencia URL) to Builder next

## Iteration Notes — Step 1.3 (evidencia URL fix)
- Changed fetch URL from `/api/caso-libra/document/${docSlug}` to `/api/caso/${slug}/document/${docSlug}` at line 34
- `slug` was already extracted from `useParams()` on line 25 — no new imports needed
- Added `slug` to useEffect dependency array (was only `[docSlug]`, now `[slug, docSlug]`)
- Typecheck: no new errors (pre-existing EvidenceExplorer.tsx date prop errors unrelated)
- Commit: 55f8d84

## Iteration Notes — Critic review of Step 1.3 (evidencia URL fix)
- Diff reviewed: commit 55f8d84 changes exactly 2 lines in evidencia/[docSlug]/page.tsx
- URL correctly changed from `/api/caso-libra/document/${docSlug}` to `/api/caso/${slug}/document/${docSlug}`
- slug was already available from useParams() — no new imports needed
- useEffect deps updated to include slug — correct
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- No blocking issues found — passing review

## Iteration Notes — Finalizer after Step 1.3 review
- Review passed for Step 1.3 (evidencia URL fix) — commit 55f8d84 verified correct
- Step 1 still has 1 unchecked sub-task: 1.4 delete static finanzas-politicas routes
- Steps 2 (nav refactor) and 3 (i18n) also remain
- Advancing queue for Builder to pick up sub-task 1.4 (delete static routes)

## Iteration Notes — Planner queue.advance after Step 1.3
- Directory listing of `webapp/src/app/caso/finanzas-politicas/`:
  - `page.tsx` (root page) — DELETE
  - `layout.tsx` — DELETE
  - `resumen/page.tsx` — DELETE
  - `investigacion/page.tsx` — DELETE
  - `cronologia/page.tsx` — DELETE
  - `dinero/page.tsx` — DELETE
  - `conexiones/page.tsx` — KEEP (platform-graph visualization)
  - `conexiones/ConexionesGraph.tsx` — KEEP
- Builder should: `rm -rf cronologia dinero investigacion resumen` then `rm page.tsx layout.tsx`
- PRESERVE `conexiones/` entirely — it's the platform-graph visualization
- After deletion, verify no broken imports reference deleted files
- Dispatching task 1.4 (delete static routes) to Builder

## Iteration Notes — Step 1.4 (delete static finanzas-politicas routes)
- Deleted: page.tsx, layout.tsx, resumen/, investigacion/, cronologia/, dinero/ from webapp/src/app/caso/finanzas-politicas/
- Preserved: conexiones/ (page.tsx + ConexionesGraph.tsx) — platform-graph visualization
- Grep for broken imports: none found. Remaining references are config href, ConexionesGraph fetch, and API route — all valid
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- 6 files deleted, 1632 lines removed
- Commit: 61a1337

## Iteration Notes — Critic review of Step 1.4 (delete static routes)
- Commit 61a1337 deletes exactly 6 files (1632 lines): page.tsx, layout.tsx, cronologia/page.tsx, dinero/page.tsx, investigacion/page.tsx, resumen/page.tsx
- conexiones/ preserved with both page.tsx and ConexionesGraph.tsx — correct
- No remaining imports or references to deleted routes in webapp/src
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- No blocking issues — passing review
- Step 1 is now fully complete (all 4 sub-tasks done)

## Iteration Notes — Finalizer after Step 1.4 review
- Review passed for Step 1.4 (delete static routes) — commit 61a1337 verified correct
- Step 1 is fully complete: all 4 sub-tasks (1.1 dinero URL, 1.2 actor URL, 1.3 evidencia URL, 1.4 delete static routes) done
- Step 2 (nav refactor) is next ready task: task-1774080272-d098 (P2, key: m9:nav-refactor)
- Step 3 (i18n) also remains: task-1774074000-i18n (P3)
- Advancing queue for Planner to decompose Step 2

## Iteration Notes — Planner decomposition of Step 2 (nav refactor)

### Analysis of InvestigationNav.tsx
- CASE_TABS (lines 27-57) hardcodes per-slug tab arrays with `{ href, label: { en, es } }`
- DEFAULT_TABS (lines 59-66) is a fallback for unknown slugs
- Line 72: `const tabDefs = CASE_TABS[slug] ?? DEFAULT_TABS`
- Each tab has a "home" entry (href: '') plus sub-page entries (href: '/resumen', '/grafo', etc.)

### Registry config shape
- `InvestigationClientConfig.tabs: readonly TabId[]` — just IDs like 'resumen', 'investigacion', 'grafo'
- TabId enum: resumen | investigacion | cronologia | evidencia | grafo | dinero | simular | vuelos | proximidad | conexiones
- No "home" TabId — that's implicit (always first)
- No bilingual labels in the config — labels must be derived from a TabId→label map

### Refactor plan (single sub-task)
1. Import `getClientConfig` from `@/lib/investigations/registry`
2. Create a `TAB_META` constant: `Record<TabId, { href: string; label: Record<Lang, string> }>` mapping each TabId to its href suffix and bilingual label
3. Build a `HOME_TAB` constant for the always-present root tab (href: '', label: { en: 'Home'/'Overview', es: 'Inicio' })
   - Note: Epstein uses 'Overview'/'Inicio', Libra uses 'Home'/'Inicio'. Use config.name or just 'Inicio'/'Home' generically — KISS.
4. Replace CASE_TABS + DEFAULT_TABS with: `const config = getClientConfig(slug)`, then map `config.tabs` through TAB_META, prepend HOME_TAB
5. Fallback: if `getClientConfig(slug)` returns undefined, use DEFAULT_TABS (keep a hardcoded default TabId array)
6. Delete CASE_TABS and DEFAULT_TABS constants entirely

### Key details for Builder
- file: webapp/src/components/investigation/InvestigationNav.tsx
- Import: `import { getClientConfig } from '@/lib/investigations/registry'`
- Import: `import type { TabId } from '@/lib/investigations/types'`
- The href for each TabId is just `/${tabId}` except 'grafo' stays '/grafo', 'simular' stays '/simular' etc. — they match directly
- The bilingual labels can be inferred from the existing CASE_TABS (collect the union of all labels)
- Keep the NavTab interface, language toggle, and all rendering logic unchanged
- Typecheck must pass after changes

## Iteration Notes — Step 2.1 (InvestigationNav refactor)
- Replaced CASE_TABS + DEFAULT_TABS with config-driven approach
- Created TAB_META: Record<TabId, { href, label }> with generic bilingual labels
- Created HOME_TAB constant (always prepended)
- Created DEFAULT_TAB_IDS fallback array for unknown slugs
- Uses `getClientConfig(slug) ?? getClientConfig('caso-' + slug)` to handle the finanzas-politicas slug mismatch (URL slug 'finanzas-politicas' vs registry key 'caso-finanzas-politicas')
- Removed NavTab interface (no longer needed — tab shape is inline)
- Language toggle and all rendering logic unchanged
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- Net: +31 lines, -45 lines (simplified)
- Commit: 7980792

## Iteration Notes — Critic review of Step 2.1 (InvestigationNav refactor)
- Diff reviewed: commit 7980792, 1 file changed (31 insertions, 45 deletions)
- TAB_META, HOME_TAB, DEFAULT_TAB_IDS correctly replace CASE_TABS/DEFAULT_TABS
- Registry lookup with caso-prefix fallback handles finanzas-politicas slug mismatch — correct
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (confirmed independently)
- **BLOCKING ISSUE: simulacion/simular route mismatch**
  - Old CASE_TABS: caso-epstein → `/simulacion` (real SimulationPanel at `webapp/src/app/caso/[slug]/simulacion/page.tsx`)
  - New TAB_META: TabId `simular` → `/simular` (placeholder "coming soon" page at `webapp/src/app/caso/[slug]/simular/page.tsx`)
  - Regression: caso-epstein's simulation tab now points to wrong page
  - Fix options: (a) add `simulacion` to TabId union + epstein config, or (b) rename `/simulacion` route dir to `/simular` and consolidate
  - Recommended: option (b) — rename route dir, fewer moving parts, aligns with TabId
- Secondary note: per-case labels lost (e.g., caso-libra's "What happened"/"Que paso" for resumen becomes generic "Summary"/"Resumen") — acceptable as part of standardization, non-blocking

## Iteration Notes — Fix simulacion/simular route mismatch (review.changes_requested)
- Chose option (b): rename route dir, consolidate under TabId 'simular'
- Replaced simular/page.tsx placeholder ("coming soon") with real SimulationPanel from simulacion/page.tsx
- Deleted simulacion/ directory entirely
- Updated OverviewContent.tsx link from `/simulacion` to `/simular`
- Grep confirmed no other references to `/simulacion` route in webapp/src (only Spanish word "simulacion" in UI strings)
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- Commit: 5a3e698

## Iteration Notes — Critic review of simulacion/simular fix (commit 5a3e698)
- Diff reviewed: 3 files changed (14 insertions, 204 deletions)
- simulacion/page.tsx deleted, simular/page.tsx replaced placeholder with real SimulationPanel — correct
- OverviewContent link updated from /simulacion to /simular — correct
- Grep: no remaining /simulacion route references in webapp/src (only Spanish UI strings in SimulationResults/ScenarioInput — not routes)
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- No blocking issues — passing review
- Step 2 (nav refactor) is now fully complete with this fix

## Iteration Notes — Finalizer after Step 2 review (simulacion fix)
- Review passed for simulacion/simular route consolidation — commit 5a3e698 verified correct
- Step 2 (nav refactor) is fully complete: CASE_TABS replaced with registry-driven config, simulacion route consolidated
- Step 3 (i18n: browser language detection + bilingual metadata) is the final remaining step
- Advancing queue for Planner to decompose Step 3

## Iteration Notes — Planner decomposition of Step 3 (i18n)

### Analysis of LanguageProvider (webapp/src/lib/language-context.tsx)
- Currently: `useState<Lang>(defaultLang)` with `defaultLang` param, defaults to `'en'`
- No browser language detection — always uses the prop default
- Fix: On mount (useEffect), detect `navigator.language` — if starts with `'es'`, set lang to `'es'`; otherwise keep default
- Only detect once on mount, don't override if user has explicitly toggled
- Keep `defaultLang` prop as server-side hint (per-case default) — browser detection overrides it client-side

### Analysis of layout.tsx (webapp/src/app/caso/[slug]/layout.tsx)
- CASE_META (lines 7-20) hardcodes title, description, and defaultLang per slug
- `generateMetadata` uses CASE_META for page title/description — monolingual
- `CasoLayout` passes `defaultLang` from CASE_META to LanguageProvider
- Fix: Replace CASE_META with `getClientConfig(slug)` from registry
  - Registry `InvestigationClientConfig` has `name: BilingualText` and `description: BilingualText`
  - For generateMetadata (server-side, no access to client lang): use `config.name.en` + ` | ` + `config.name.es` or pick a default language from the config
  - For defaultLang: infer from config — if `config.name.es` is primary (Spanish-first investigation) → 'es', else 'en'
  - Simpler: add a `defaultLang` field to InvestigationClientConfig? YAGNI — just check if slug contains Spanish keywords or hardcode a simple heuristic
  - Simplest: the config already has `casoSlug` — 'caso-epstein' → 'en', everything else → 'es'. This matches current CASE_META behavior.
  - Actually simplest: just use the existing CASE_META defaultLang approach but source name/description from registry

### Sub-task 3.1: LanguageProvider browser detection
- Add useEffect that runs once on mount
- Check `typeof window !== 'undefined'` and `navigator.language`
- If navigator.language starts with 'es', set lang to 'es'; if starts with 'en', set lang to 'en'
- Otherwise keep defaultLang
- Use a ref to track if user has manually toggled — if so, don't override

### Sub-task 3.2: Layout metadata from registry
- Import `getClientConfig` from registry
- Replace CASE_META with registry lookups
- generateMetadata: use `config.name.en` as title (server-side, pick one language)
  - Actually for bilingual: `config.name.en + ' — ' + config.name.es` if they differ, or just config.name.en
  - Better: use `config.name.en` + site name. Keep it simple.
- defaultLang: 'caso-epstein' → 'en', else 'es' (matches current behavior)
- Delete CASE_META constant

### Dispatching sub-task 3.1 (LanguageProvider browser detection) to Builder

## Iteration Notes — Step 3.1 (LanguageProvider browser detection)
- Renamed internal `setLang` to `setLangState`, wrapped public `setLang` and `toggle` to set `userToggled.current = true`
- Added `useRef(false)` for `userToggled` — tracks if user has manually changed language
- Added `useEffect([], ...)` on mount: checks `navigator.language`, sets 'es' if starts with 'es', 'en' if starts with 'en', otherwise keeps defaultLang
- Guard: skips detection if `userToggled.current` is true or `typeof window === 'undefined'`
- Imports added: `useEffect`, `useRef`
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- Net: +21 lines, -3 lines
- Commit: bba2ed9

## Iteration Notes — Critic review of Step 3.1 (LanguageProvider browser detection)
- Diff reviewed: commit bba2ed9, 1 file changed (21 insertions, 3 deletions)
- userToggled ref correctly prevents overriding manual user choice
- setLang and toggle both set userToggled.current = true before state change — correct
- useEffect runs once on mount (empty deps), detects navigator.language prefix — correct
- Guards: SSR check (typeof window === 'undefined') and prior user toggle — correct
- Falls through to keep defaultLang if browser lang is neither 'es' nor 'en' — correct
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (confirmed independently)
- No blocking issues — passing review

## Iteration Notes — Finalizer after Step 3.1 review
- Review passed for Step 3.1 (LanguageProvider browser detection) — commit bba2ed9 verified correct
- Step 3 still has 1 unchecked sub-task: 3.2 (Replace CASE_META in layout with registry-driven bilingual metadata)
- Task task-1774081596-bef9 (m9:layout-meta) now unblocked and ready
- Advancing queue for Builder to pick up sub-task 3.2

## Iteration Notes — Planner queue.advance after Step 3.1 (dispatching 3.2)

### Target: webapp/src/app/caso/[slug]/layout.tsx

### Current state
- CASE_META (lines 7-20) hardcodes title, description, defaultLang per slug
- generateMetadata (line 22) uses CASE_META for page title/description
- CasoLayout (line 36) passes `defaultLang` from CASE_META to LanguageProvider

### Registry shape (InvestigationClientConfig)
- `name: BilingualText` (e.g., `{ en: 'Epstein Case', es: 'Caso Epstein' }`)
- `description: BilingualText`
- `casoSlug: string` (e.g., 'caso-epstein')

### Builder instructions for sub-task 3.2
1. Import `getClientConfig` from `@/lib/investigations/registry`
2. In `generateMetadata`:
   - Call `const config = getClientConfig(slug) ?? getClientConfig('caso-' + slug)` (same fallback pattern as InvestigationNav for finanzas-politicas slug mismatch)
   - Use `config?.name.en` as title (append ` — Office of Accountability` or keep current suffix pattern)
   - Use `config?.description.en` as description
   - Fallback if no config: keep current default `'Investigacion — Oficina de Rendicion de Cuentas'`
3. In `CasoLayout`:
   - Same config lookup
   - defaultLang: `config?.casoSlug === 'caso-epstein' ? 'en' : 'es'` (matches current CASE_META behavior)
   - Fallback: `'es'` (matches current default)
4. Delete CASE_META constant entirely
5. Remove unused `type Lang` import if `Lang` is no longer referenced directly (check — it's used for CASE_META type, but LanguageProvider import already brings it)
6. Typecheck must pass after changes

### Dispatching task 3.2 (layout-meta) to Builder

## Iteration Notes — Step 3.2 (layout CASE_META → registry)
- Replaced CASE_META constant with `resolveConfig(slug)` helper using `getClientConfig(slug) ?? getClientConfig('caso-' + slug)`
- generateMetadata: title uses `config.name.en + ' — Office of Accountability'`, fallback to Spanish default
- generateMetadata: description uses `config.description.en`
- CasoLayout: defaultLang derived from `config?.casoSlug === 'caso-epstein' ? 'en' : 'es'`
- Removed unused `type Lang` import (no longer needed after CASE_META deletion)
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (unrelated)
- Net: +11 insertions, -18 deletions
- Commit: cad8dfa

## Iteration Notes — Critic review of Step 3.2 (layout CASE_META → registry)
- Diff reviewed: commit cad8dfa, 1 file changed (11 insertions, 18 deletions)
- CASE_META deleted, replaced with `resolveConfig(slug)` using getClientConfig + caso-prefix fallback — consistent with InvestigationNav pattern
- generateMetadata: title uses `config.name.en + ' — Office of Accountability'`, fallback to Spanish default — correct
- generateMetadata: description uses `config.description.en` — correct
- CasoLayout: defaultLang from `config?.casoSlug === 'caso-epstein' ? 'en' : 'es'` — matches previous CASE_META behavior
- Unused `type Lang` import removed — clean
- Typecheck: only pre-existing EvidenceExplorer.tsx date prop errors (confirmed independently)
- No blocking issues — passing review
- Step 3 is now fully complete (both sub-tasks 3.1 + 3.2 done)

## Final Verification — M9 Complete
- **Typecheck**: passes (only pre-existing EvidenceExplorer.tsx date prop errors, unrelated to M9)
- **Build**: all 5 phases succeed
- **No orphaned TODOs** in changed files
- **All tasks closed**: 8/8 (including parent i18n task)
- **Commits**: 61a1337, 7980792, 5a3e698, bba2ed9, cad8dfa
- **M9 deliverables**:
  1. Step 1: Fixed hardcoded fetch URLs (dinero, actor, evidencia) + deleted static finanzas-politicas routes (kept conexiones/)
  2. Step 2: Replaced CASE_TABS/DEFAULT_TABS with registry-driven config in InvestigationNav + consolidated simulacion→simular route
  3. Step 3: Added browser language detection to LanguageProvider + replaced CASE_META with registry-driven config in layout
- LOOP_COMPLETE
