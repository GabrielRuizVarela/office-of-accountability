# Loop Summary

**Status:** Completed successfully
**Iterations:** 40
**Duration:** 1h 3m 27s

## Tasks

- [x] 1.1 Create `src/lib/caso-finanzas-politicas/types.ts` — domain types for Claim, MoneyFlow, Event, Person, Organization (file: webapp/src/lib/caso-finanzas-politicas/types.ts)
- [x] 1.2 Create `src/lib/caso-finanzas-politicas/queries.ts` — typed wrappers delegating to generic query builder (file: webapp/src/lib/caso-finanzas-politicas/queries.ts)
- [x] 1.3 Create `src/lib/caso-finanzas-politicas/transform.ts` — pure transform functions for Neo4j records → domain objects (file: webapp/src/lib/caso-finanzas-politicas/transform.ts)
- [x] 1.4 Update `src/lib/caso-libra/queries.ts` — rewrite Cypher from CasoLibra* labels to generic labels + caso_slug, delegate to query builder (file: webapp/src/lib/caso-libra/queries.ts)
- [x] 1.5 Update `src/lib/caso-epstein/transform.ts` — align with generic toInvestigationNode() transform (file: webapp/src/lib/caso-epstein/transform.ts)
- [x] 1.6 Update `src/lib/graph/constants.ts` — add ShellCompany, Aircraft, Wallet, Token, Claim, MoneyFlow, GovernmentAction to LABEL_COLORS and LABEL_DISPLAY (file: webapp/src/lib/graph/constants.ts)
- [x] 1.7 Create 3 unified routes (wallets, person, document) at `/api/caso/[slug]/*` + replace 3 caso-libra routes with 301 redirects (files: webapp/src/app/api/caso/[slug]/{wallets,person,document} + webapp/src/app/api/caso-libra/{wallets,person,document})
- [x] 1.8 Epstein-specific routes already at unified path — no changes needed (flights, proximity, simulation already at /api/caso/[slug]/)
- [ ] 2.1 Update hardcoded fetch URLs in 3 [slug] pages: dinero, actor/[actorSlug], evidencia/[docSlug] (file: webapp/src/app/caso/[slug]/{dinero,actor,evidencia})
- [ ] 2.2 Refactor InvestigationNav.tsx — remove hardcoded CASE_TABS, read from investigation registry/config (file: webapp/src/components/investigation/InvestigationNav.tsx)
- [ ] 2.3 Delete static finanzas-politicas routes except /conexiones (files: webapp/src/app/caso/finanzas-politicas/{page,resumen,investigacion,cronologia,dinero})
- [ ] 2.4 Add browser language detection + bilingual page titles/metadata (file: webapp/src/app/caso/[slug]/layout.tsx)

## Events

_No events recorded._

## Final Commit

88cb132: feat(m10): add stub StageRunner implementations for verify, enrich, analyze, report
