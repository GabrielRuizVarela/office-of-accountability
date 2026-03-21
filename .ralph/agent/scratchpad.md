# Plan: Complete i18n — browser language detection + bilingual metadata

## Context
- `detectLang()` in `lib/i18n.ts` parses Accept-Language header → 'en' | 'es'
- `SITE_META` has bilingual title/description for root layout
- `LanguageProvider` + `useLanguage()` in `lib/language-context.tsx` provides client-side lang state
- Caso layout already has per-case `CASE_META` with `defaultLang`
- Typecheck passes clean

## Current Step: Step 1 — Wire auto-detection into layouts

### Sub-tasks:
- [x] 1.1 Update `webapp/src/lib/language-context.tsx` — initialize with browser-detected lang from `navigator.language` when no `defaultLang` prop given (file: webapp/src/lib/language-context.tsx)
- [x] 1.2 Update `webapp/src/app/layout.tsx` — use `detectLang()` + `SITE_META` for dynamic metadata via `generateMetadata`, wrap body in `LanguageProvider` (file: webapp/src/app/layout.tsx)
- [x] 1.3 Update `webapp/src/app/caso/[slug]/layout.tsx` — add bilingual `CASE_META` entries with both es/en versions, use `detectLang()` to pick appropriate metadata (file: webapp/src/app/caso/[slug]/layout.tsx)
- [ ] 1.4 Update static metadata in other pages (proximidad, simulacion, provincias) to use bilingual strings (various files)
- [ ] 1.5 Verify typecheck passes after all changes

## Future Steps:
(none — this completes the remaining i18n work)

## Notes:
- Root layout is a Server Component → can read `headers()` for Accept-Language
- Caso layout already uses `LanguageProvider` with `defaultLang`
- Keep default to 'es' (primary Argentine audience)

### 1.1 Evidence
- Added `detectBrowserLang()` helper: checks `navigator.language`, returns `'en'` if starts with `en`, else `'es'`
- SSR-safe: guards with `typeof navigator === 'undefined'` → returns `'es'`
- `LanguageProvider` now uses lazy initializer: `defaultLang ?? detectBrowserLang()`
- `defaultLang` prop changed from `= 'en'` default to optional (no default)
- Typecheck: clean (no output from `tsc --noEmit`)
- Commit: 1880e58

### 1.2 Evidence
- Replaced static `export const metadata` with `async generateMetadata()` that reads `headers()` Accept-Language
- Uses `detectLang(h.get('accept-language'))` → picks `SITE_META[lang]` for title/description
- Layout component also async: reads headers, passes `lang` to `<html lang={lang}>` and `<LanguageProvider defaultLang={lang}>`
- LanguageProvider wraps the entire body content (SiteNav + children + Footer)
- Typecheck: clean (no output from `tsc --noEmit`)
- Commit: d4f2f55

### Finalizer — post 1.2 review
- review.passed for 1.2: Root layout generateMetadata + LanguageProvider wiring verified. Clean.
- Sub-tasks 1.3, 1.4, 1.5 remain → queue.advance for Builder to pick up 1.3 (caso layout bilingual metadata)

### Planner — advancing to 1.3
- Current caso layout (caso/[slug]/layout.tsx) has monolingual CASE_META: caso-libra in Spanish, caso-epstein in English
- Pattern from 1.2: read `headers()` → `detectLang()` → pick bilingual metadata
- For 1.3, CASE_META should become `Record<string, Record<Lang, { title; description }> & { defaultLang: Lang }>`
- Each case gets es + en title/description; `detectLang()` picks which to serve
- `defaultLang` stays as hint for LanguageProvider (caso-libra→es, caso-epstein→en)
- Builder instructions: import `headers` + `detectLang` from same places as root layout, restructure CASE_META to bilingual, update generateMetadata to read Accept-Language and pick lang-appropriate meta

### 1.3 Evidence
- Restructured CASE_META: each slug now maps to `{ defaultLang, es: { title, description }, en: { title, description } }`
- caso-libra: added English translations for title and description
- caso-epstein: added Spanish translations for title and description
- Fixed accent marks in Spanish strings (Rendicion→Rendición, Investigacion→Investigación, publicos→públicos)
- generateMetadata now imports `headers` from `next/headers` and `detectLang` from `@/lib/i18n`
- Reads Accept-Language via `headers()` → `detectLang()` → picks `caseMeta[lang]`, falls back to `caseMeta[caseMeta.defaultLang]`
- LanguageProvider defaultLang unchanged — still uses case's defaultLang (not detected lang), as specified
- Typecheck: clean (no output from `tsc --noEmit`)
- Commit: db3f895

### Critic — 1.3 review
- Diff reviewed: CASE_META restructured to bilingual, generateMetadata reads Accept-Language, falls back to defaultLang
- Spanish strings have proper accents (Rendición, Investigación, públicos, tráfico)
- Null-slug case handled with fallback metadata
- Pattern matches root layout (1.2)
- Typecheck: independently verified clean (no output from tsc --noEmit)
- review.passed for 1.3: Caso layout bilingual metadata verified. Clean.
- Sub-tasks 1.4, 1.5 remain → queue.advance for Finalizer to route

### Finalizer — post 1.3 review
- review.passed for 1.3: CASE_META bilingual verified. Clean.
- Sub-tasks 1.4 (bilingual metadata for other pages) and 1.5 (typecheck) remain in Step 1
- Decision: queue.advance → Builder picks up 1.4 (proximidad, simulacion, provincias bilingual metadata)

### Planner — advancing to 1.4

Three files have static `export const metadata` that need bilingual conversion:

**1.4a** `webapp/src/app/caso/[slug]/proximidad/page.tsx`
- Current: `{ title: 'Proximity Analysis', description: 'Analyze where and when...' }` (English only)
- Convert to `generateMetadata()` with `headers()` + `detectLang()`
- es: `{ title: 'Análisis de Proximidad', description: 'Analizar dónde y cuándo personas de interés coinciden en ubicaciones, eventos y documentos.' }`
- en: keep current English strings

**1.4b** `webapp/src/app/caso/[slug]/simulacion/page.tsx`
- Current: `{ title: 'Simulation', description: 'AI-powered network analysis using MiroFish swarm intelligence.' }` (English only)
- Convert to `generateMetadata()` with `headers()` + `detectLang()`
- es: `{ title: 'Simulación', description: 'Análisis de redes impulsado por IA usando inteligencia de enjambre MiroFish.' }`
- en: keep current English strings

**1.4c** `webapp/src/app/provincias/page.tsx`
- Current: Spanish-only with OG + canonical. Richest metadata of the three.
- Convert to `generateMetadata()` with `headers()` + `detectLang()`
- es: keep current Spanish strings (title, description, OG, siteName)
- en: `{ title: 'Provinces — Legislators by Province | ORC', description: 'Explore Argentine legislators by province. View representatives and senators from each jurisdiction.' }`, OG mirrors, siteName: 'Office of Accountability'

**Pattern:** Same as 1.2/1.3 — import `headers` from `next/headers`, import `detectLang` from `@/lib/i18n`, define bilingual const, `generateMetadata` reads Accept-Language and picks lang. For provincias, preserve `openGraph` and `alternates` structure.

**Important:** proximidad and simulacion are inside `caso/[slug]/` which already has a layout with `generateMetadata` — these page-level metadata will merge/override the layout's. That's fine, Next.js handles this correctly.

Builder: implement all three files in one task (they're small, identical pattern). Then 1.5 typecheck.

### 1.4 Evidence
- All three pages converted from static `export const metadata` to `async generateMetadata()` with `headers()` + `detectLang()`
- **proximidad**: `PAGE_META` with es/en title+description, imported `detectLang` from `@/lib/i18n`
- **simulacion**: `PAGE_META` with es/en title+description, same pattern
- **provincias**: `PAGE_META` with es/en title+description+siteName, preserves `openGraph` and `alternates.canonical` structure
- Spanish strings include proper accents (Análisis, Proximidad, Simulación, etc.)
- Typecheck: clean (no output from `tsc --noEmit`)
- Commit: fece79c

### 1.5 Evidence
- Typecheck verified clean after all 1.4 changes — no output from `pnpm exec tsc --noEmit`
- All sub-tasks 1.1–1.5 now complete → Step 1 done

### Critic — 1.4+1.5 review
- Diff reviewed (fece79c): proximidad, simulacion, provincias all converted to generateMetadata with bilingual PAGE_META
- Pattern consistent with 1.2 (root layout) and 1.3 (caso layout): headers() → detectLang() → pick lang metadata
- Provincias preserves openGraph (type, url, siteName) and alternates.canonical — no metadata regression
- Spanish accents correct (Análisis, Proximidad, Simulación, Rendición)
- Lang type imported from language-context, no `any` types
- Typecheck: independently verified clean (no output from tsc --noEmit)
- No YAGNI violations, no speculative code
- review.passed for 1.4+1.5: All Step 1 sub-tasks complete. i18n browser detection + bilingual metadata fully wired.

### Finalizer — Final Verification (all steps done)
- Plan exhausted: no future steps remain
- `pnpm exec tsc --noEmit`: clean (no errors)
- `pnpm run build`: succeeds (5/5 phases, warnings are pre-existing framework-level only)
- No orphaned TODOs in any changed file
- No new package.json scripts needed
- Reconciliation: all i18n requirements met — browser language detection via Accept-Language + navigator.language, bilingual metadata in root layout, caso layout, proximidad, simulacion, provincias
- Commits: 5 clean commits (9cb5762, 1880e58, d4f2f55, db3f895, fece79c)
- LOOP_COMPLETE
