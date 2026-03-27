# Unified Language Toggle System

**Date:** 2026-03-27
**Status:** Approved

## Problem

The language toggle system has three issues:

1. **Two independent `LanguageProvider`s** — root layout (`defaultLang="es"`) and case layout (per-case defaults) create separate React contexts. SiteNav and InvestigationNav control different state.
2. **Duplicate toggle UI** with inconsistent styling — SiteNav uses `bg-zinc-700`, InvestigationNav uses `bg-blue-600`.
3. **No persistence** — language resets on every navigation/refresh.

## Decision

Global preference wins. If the user sets EN, everything is EN everywhere. Per-case default languages are removed.

## Design

### 1. `LanguageProvider` (`src/lib/language-context.tsx`)

- Single provider at root layout only (remove from case layout)
- Init from `localStorage.getItem('oa-lang')` falling back to `'es'`
- On `setLang`, persist to `localStorage.setItem('oa-lang', lang)`
- Use `useEffect` to hydrate from storage after mount — avoids SSR mismatch (server renders with `'es'`, client corrects on hydrate)

### 2. `LanguageToggle` component (`src/components/ui/LanguageToggle.tsx`)

- Shared pill toggle: `EN | ES` in bordered container
- Consistent active state: `bg-zinc-700 text-zinc-100` (zinc theme)
- Accepts `size` prop: `'sm'` (InvestigationNav inline) | `'default'` (SiteNav)
- Reads/writes via `useLanguage()` hook

### 3. SiteNav (`src/components/layout/SiteNav.tsx`)

- Replace both desktop and mobile inline toggle markup with `<LanguageToggle />`
- Remove `setLang` destructuring (toggle handles it internally)

### 4. InvestigationNav (`src/components/investigation/InvestigationNav.tsx`)

- Replace inline toggle markup with `<LanguageToggle size="sm" />`
- Remove `setLang` destructuring

### 5. Case layout (`src/app/caso/[slug]/layout.tsx`)

- Remove `LanguageProvider` wrapper
- Remove `defaultLang` from `CASE_META` (keep title/description for SEO)
- Remove `Lang` type import

### 6. No changes needed

- `createTranslator` — already accepts locale param
- `useLanguage()` hook API — unchanged
- All 64+ consumer components — unchanged (they read `lang` from context, which now comes from root)

## Files Changed

| File | Action |
|------|--------|
| `src/lib/language-context.tsx` | Add localStorage persistence + useEffect hydration |
| `src/components/ui/LanguageToggle.tsx` | New shared component |
| `src/components/layout/SiteNav.tsx` | Replace inline toggles with `<LanguageToggle />` |
| `src/components/investigation/InvestigationNav.tsx` | Replace inline toggle with `<LanguageToggle size="sm" />` |
| `src/app/caso/[slug]/layout.tsx` | Remove LanguageProvider wrapper + defaultLang |
