# Plan: Complete M9 — Investigation Standardization (final task)

## Current Step: Step 1 — Bilingual i18n for page titles/metadata

M9 acceptance criteria from PROMPT.md are satisfied (InvestigationConfig nodes, unified API routes, /caso/[slug] landing pages, 404 for unknown slugs). The only remaining task is i18n for page titles/metadata.

### Sub-tasks:
- [x] 1.1 Add browser language detection utility and bilingual page titles/metadata across /caso/[slug] pages (file: webapp/src/app/caso/[slug]/ pages + layout)

### Notes:
- Created `lib/i18n.ts` with `detectLang()` — parses Accept-Language header, returns 'es' or 'en'
- Made layout.tsx CASE_META fully bilingual (both title and description per case)
- Added bilingual `generateMetadata` to: layout.tsx, page.tsx, simulacion, proximidad, cronologia, evidencia
- Client-only pages (grafo, dinero, vuelos, simular, resumen, investigacion, actor) inherit layout metadata
- TypeScript: no new errors. Pre-existing errors in EvidenceExplorer.tsx (unrelated `date` prop)
- Commit: efb517f

## Completed Steps:
- All prior M9 work (unified APIs, types, utils, config, query-builder, registry, seed scripts, landing pages, code review) — done in previous iterations
- Step 1: Bilingual i18n for page titles/metadata — DONE

## Final Verification (2026-03-21)
- tsc --noEmit: PASS (only pre-existing EvidenceExplorer date prop errors)
- pnpm run build: PASS (built in ~1.7s total)
- M9 acceptance criteria: ALL MET
- No orphaned TODOs in M9 code
- No new package.json scripts needed
- **M9 COMPLETE**
