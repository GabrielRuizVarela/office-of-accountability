# Plan: Complete M9 — Remaining Tasks

## Analysis

From handoff + summary, 4 sub-tasks remain:

1. **1.4** Delete static finanzas-politicas routes except /conexiones
2. **2.1** Refactor InvestigationNav.tsx — replace hardcoded CASE_TABS with registry-driven tabs
3. **3.1** Add browser language detection to LanguageProvider
4. **3.2** Replace hardcoded CASE_META in layout with registry-driven bilingual metadata

The runtime task `task-1774074000-i18n` covers 3.1 + 3.2 combined.

### Design Notes

**Task 1.4**: Delete `webapp/src/app/caso/finanzas-politicas/` — page.tsx, layout.tsx, resumen/, investigacion/, cronologia/, dinero/. Keep `conexiones/` only.

**Task 2.1**: The registry provides `tabs: TabId[]` but NOT bilingual labels per tab. Two options:
- A) Add a `TAB_LABELS` map from TabId → BilingualText in InvestigationNav (simplest, labels are UI concern)
- B) Add `tabLabels` to InvestigationClientConfig

Going with (A) — a simple lookup map in the nav component. The nav reads `getClientConfig(slug).tabs` and maps each TabId to its bilingual label + href. Confidence: 85.

**Task 3.1**: Detect `navigator.language` on mount, default to 'es' if starts with 'es', else 'en'. Simple.

**Task 3.2**: Replace `CASE_META` in layout.tsx with `getClientConfig(slug)`. The config has `name` and `description` as BilingualText. For SSR metadata, pick the `defaultLang` for the slug. Need to add `defaultLang` to InvestigationClientConfig — or derive it (Argentine cases → 'es', Epstein → 'en'). Simplest: add `defaultLang: Lang` to each config. Confidence: 80.

## Completed: Step 1 — Delete static finanzas-politicas routes

- [x] 1.4 Delete finanzas-politicas static routes except /conexiones
- Deleted: page.tsx, layout.tsx, resumen/, investigacion/, cronologia/, dinero/
- Kept: conexiones/ (platformGraph feature)
- Typecheck: pre-existing errors in EvidenceExplorer.tsx only, no new issues from deletion
- Commit: fdf1217

## Next Steps:
- Step 2: Refactor InvestigationNav.tsx to use registry tabs (file: webapp/src/components/investigation/InvestigationNav.tsx)
- Step 3: Browser language detection + registry-driven metadata (files: webapp/src/lib/language-context.tsx, webapp/src/app/caso/[slug]/layout.tsx, webapp/src/lib/investigations/types.ts)

## Finalizer — Iteration after 1.4 review passed

- Closed task-1774082216-b4cd (1.4 finanzas-politicas route deletion verified)
- 3 tasks remain: nav-refactor (P2), lang-detect (P3), layout-meta (P3)
- Note: task-1774074000-i18n is a combined parent for lang-detect + layout-meta
- Advancing queue for Builder to pick up Step 2 (nav-refactor, highest priority remaining)

## Current Step: Step 2 — Refactor InvestigationNav.tsx

### Sub-tasks:
- [ ] 2.1 Replace hardcoded CASE_TABS with TAB_LABELS lookup map + getClientConfig(slug).tabs (file: webapp/src/components/investigation/InvestigationNav.tsx)

### Design for Builder:

The refactor replaces the per-case `CASE_TABS` object with:

1. A `TAB_LABELS` map: `Record<TabId, { href: string; label: Record<Lang, string> }>` — one entry per TabId. This is a UI concern so it lives in the nav component.

2. A "home" tab (empty href, label "Overview"/"Inicio") is always prepended — it's not a TabId in the registry since every case has it.

3. The nav reads `getClientConfig(slug)?.tabs` and maps each TabId through TAB_LABELS to build the tab list. Falls back to DEFAULT_TABS if slug not found.

**Key mappings from current CASE_TABS** (some cases use different labels for the same TabId):
- TabId `'resumen'` → href `/resumen`, labels vary: Epstein uses "Summary"/"Resumen", Libra uses "What happened"/"Que paso"
- TabId `'simular'` → href `/simular` for Libra (label "Predictions"/"Predicciones"), `/simulacion` for Epstein (label "Simulation"/"Simulacion")

**Problem:** Different cases use different labels AND hrefs for the same TabId. A single TAB_LABELS map won't capture per-case label/href differences.

**Resolution:** Use `TAB_LABELS` for the common/default labels. For cases that need custom labels (e.g. Libra's "What happened" instead of "Summary"), the config could include optional `tabOverrides`. BUT that's overengineering.

**Simpler approach:** The TAB_LABELS map provides default labels. The href is always `/${tabId}` (the TabId IS the route segment in most cases). Exception: `simular` maps to `/simular` and `simulacion` to `/simulacion` — but wait, checking the TabId type: it includes `'simular'` but NOT `'simulacion'`. Epstein config uses `'simular'` but its CASE_TABS entry has href `/simulacion`. That's a mismatch.

**Check Epstein's route:** The actual page route determines the correct href. The TabId should map to the route segment. If Epstein's route is `/caso/caso-epstein/simulacion`, the href should be `/simulacion`. If it's `/simular`, use that.

**Decision:** Use a simple `TAB_LABELS` map with default labels/hrefs. Accept that per-case label customization (like Libra's "What happened") is lost — use generic labels ("Summary"/"Resumen") for all. The TabId determines the href as `/${tabId}`. Confidence: 75 — some label fidelity lost but KISS wins. Builder should verify the actual route segments match TabIds.

**Actually — let me check:** Epstein CASE_TABS uses href `/simulacion` for TabId `simular`. But the TabId type doesn't have `simulacion`. The Epstein config.ts has `'simular'` in its tabs array. So either the route is `/simular` or there's a mismatch. Builder should check `webapp/src/app/caso/caso-epstein/` for the actual route directory name.

### Builder checklist:
1. Import `getClientConfig` from `@/lib/investigations/registry` and `TabId` from `@/lib/investigations/types`
2. Create `TAB_LABELS: Record<TabId, { href: string; label: Record<Lang, string> }>` with default bilingual labels
3. Create a `HOME_TAB` constant for the always-present overview tab (href '', labels "Overview"/"Inicio")
4. Replace `CASE_TABS` and `DEFAULT_TABS` with: `const config = getClientConfig(slug); const tabIds = config?.tabs ?? defaultTabIds; const tabs = [HOME_TAB, ...tabIds.map(id => TAB_LABELS[id])]`
5. Verify route directory names match TabId values (especially `simular` vs `simulacion`)
6. Typecheck with `pnpm tsc --noEmit`

## Completed: Step 2 — Refactor InvestigationNav.tsx

- [x] 2.1 Replace hardcoded CASE_TABS with TAB_LABELS lookup map + getClientConfig(slug).tabs
- Created `TAB_LABELS: Record<TabId, ...>` with generic bilingual labels for all 10 TabIds
- Created `HOME_TAB` constant (always prepended, "Overview"/"Inicio")
- Created `DEFAULT_TAB_IDS` fallback array (5 common tabs)
- Nav now calls `getClientConfig(slug)` and maps `config.tabs` through `TAB_LABELS`
- Verified: `[slug]` route has both `simular/` and `simulacion/` dirs; TabId `'simular'` maps to `/simular`
- Note: Epstein previously used `/simulacion` href but config TabId is `'simular'` — now aligned
- Note: Per-case label customization (Libra "What happened" etc.) intentionally dropped for KISS
- Typecheck: only pre-existing EvidenceExplorer.tsx errors, no new issues
- Commit: 72d5f7c

## Finalizer — Step 2 review passed

- Step 2 review passed: InvestigationNav registry-driven tabs verified clean
- 2 tasks remain: lang-detect (task-1774082220-d036) and layout-meta (task-1774082221-683f)
- Parent task-1774074000-i18n covers both
- Advancing queue for Builder to pick up Step 3 (lang-detect + layout-meta)

## Current Step: Step 3 — Browser language detection + registry-driven metadata

### Sub-tasks:
- [ ] 3.1 Add browser language detection to LanguageProvider (file: webapp/src/lib/language-context.tsx)
- [ ] 3.2 Replace hardcoded CASE_META in layout.tsx with registry-driven bilingual metadata (files: webapp/src/lib/investigations/types.ts, per-caso config.ts files, webapp/src/app/caso/[slug]/layout.tsx)

### Design for Builder:

**Task 3.1 — Browser language detection** (task key: m9:lang-detect)

File: `webapp/src/lib/language-context.tsx`

Add a `useEffect` on mount to detect `navigator.language`:
- If `navigator.language` starts with `'es'`, set lang to `'es'`
- Otherwise keep `'en'`
- Only run detection when `defaultLang` prop is NOT explicitly provided (i.e. don't override server-side defaultLang)
- Actually — simpler: the `defaultLang` prop already comes from the layout (CASE_META or registry). The browser detection should be a CLIENT-SIDE override that runs on mount. But layout already passes `defaultLang` based on case config. So browser detection is a separate concern: detect once on mount, override the initial state.
- **Decision:** Use `useEffect` to detect `navigator.language` on first mount. Set lang to `'es'` if navigator language starts with `'es'`, else `'en'`. This runs AFTER initial render with the `defaultLang` prop value, so there's a brief flash. Acceptable for P3 scope.
- Keep it simple: just add a `useEffect(() => { ... }, [])` after the `useState` hook.

Builder checklist:
1. Add `useEffect` import
2. Add effect after `useState`: detect `navigator.language`, call `setLang('es')` if starts with `'es'`, else `setLang('en')`
3. Guard with `typeof window !== 'undefined'` (SSR safety)
4. Typecheck with `pnpm tsc --noEmit`

**Task 3.2 — Registry-driven layout metadata** (task key: m9:layout-meta)

Files:
- `webapp/src/lib/investigations/types.ts` — add `defaultLang: 'en' | 'es'` to `InvestigationClientConfig`
- `webapp/src/lib/caso-epstein/config.ts` — add `defaultLang: 'en'`
- `webapp/src/lib/caso-libra/config.ts` — add `defaultLang: 'es'`
- `webapp/src/lib/caso-finanzas-politicas/config.ts` — add `defaultLang: 'es'`
- `webapp/src/app/caso/[slug]/layout.tsx` — replace CASE_META with getClientConfig(slug)

The config already has `name: BilingualText` and `description: BilingualText`. For `generateMetadata`, use `config.name[config.defaultLang]` as title and `config.description[config.defaultLang]` as description. Append " — Oficina de Rendicion de Cuentas" or " — Office of Accountability" based on lang.

For `CasoLayout`, replace `CASE_META[slug]?.defaultLang` with `config?.defaultLang ?? 'es'`.

Delete `CASE_META` entirely after migrating.

Builder checklist:
1. Add `defaultLang: Lang` (import Lang from language-context or define inline as `'en' | 'es'`) to `InvestigationClientConfig` in types.ts
2. Add `defaultLang` to each caso config.ts (epstein='en', libra='es', finanzas-politicas='es')
3. In layout.tsx: import `getClientConfig`, replace CASE_META usage with registry lookup, delete CASE_META
4. Typecheck with `pnpm tsc --noEmit`

### Execution order:
3.1 first (independent, smaller), then 3.2 (requires types.ts change that touches multiple files)

## Completed: Step 3.1 — Browser language detection

- [x] 3.1 Add browser language detection to LanguageProvider
- Added `useEffect` import
- Added mount effect: detects `navigator.language`, sets `'es'` if starts with `'es'`, else `'en'`
- Guarded with `typeof window !== 'undefined'` for SSR safety
- Typecheck: only pre-existing EvidenceExplorer.tsx errors, no new issues
- Commit: 4354f09
- Review: passed — clean implementation, no issues

## Finalizer — Step 3.1 review passed

- Closed task-1774082220-d036 (3.1 lang-detect verified)
- 1 task remains: layout-meta (task-1774082221-683f) — replace CASE_META with registry-driven metadata
- Parent task-1774074000-i18n still open (covers both 3.1 + 3.2)
- Advancing queue for Builder to pick up Step 3.2 (layout-meta, last remaining sub-task)

## Planner — Dispatching Step 3.2 (layout-meta)

- Last sub-task of M9: task-1774082221-683f
- Design already written above in "Task 3.2 — Registry-driven layout metadata"
- After this completes and passes review, M9 is done
- Emitting tasks.ready for Builder

## Completed: Step 3.2 — Registry-driven layout metadata

- [x] 3.2 Replace hardcoded CASE_META in layout.tsx with registry-driven bilingual metadata
- Added `defaultLang: 'en' | 'es'` to `InvestigationClientConfig` in types.ts
- Added `defaultLang` to each caso config: epstein='en', libra='es', finanzas-politicas='es'
- Layout now imports `getClientConfig` from registry, uses `config.name[lang]` and `config.description[lang]` for metadata
- Appends bilingual site suffix based on defaultLang (" — Oficina..." for es, " — Office..." for en)
- Deleted `CASE_META` object and removed unused `type Lang` import
- Typecheck: only pre-existing EvidenceExplorer.tsx errors, no new issues
- Commit: 36ca1f7
- This is the LAST sub-task of M9 — after review, M9 is complete

## Critic — Step 3.2 review passed

- Verified commit 36ca1f7 diff: CASE_META deleted, replaced with getClientConfig(slug)
- defaultLang added to InvestigationClientConfig type and all 3 caso configs (epstein=en, libra=es, finanzas-politicas=es)
- Layout uses config.name[lang] + config.description[lang] with bilingual suffix
- Proper null guard for unknown slugs
- Removed unused Lang import — clean
- Typecheck: only pre-existing EvidenceExplorer.tsx errors, no new issues
- All M9 sub-tasks now complete: 1.4 (route deletion), 2.1 (nav refactor), 3.1 (lang detect), 3.2 (layout meta)
- Emitting review.passed — M9 is done

## Final Verification — M9 Complete

- Typecheck: PASS (only pre-existing EvidenceExplorer.tsx errors, not M9-related)
- Build: PASS (client 541ms, SSR 560ms, only pre-existing vinext warnings)
- No orphaned TODOs in new code
- All runtime tasks closed (task-1774082221-683f, task-1774074000-i18n)
- Commits: fdf1217 (1.4), 72d5f7c (2.1), 4354f09 (3.1), 36ca1f7 (3.2)
- M9 is COMPLETE — emitting LOOP_COMPLETE
