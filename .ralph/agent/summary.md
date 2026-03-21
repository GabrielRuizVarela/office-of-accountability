# Loop Summary

**Status:** Completed successfully
**Iterations:** 44
**Duration:** 1h 2m 23s

## Tasks

- [x] 1.1 Fix TypeScript errors in EvidenceExplorer.tsx — `date` → `datePublished` prop (file: webapp/src/components/investigation/EvidenceExplorer.tsx)
- [x] 1.2 Update caso-libra queries.ts to use generic labels + caso_slug filter (file: webapp/src/lib/caso-libra/queries.ts)
- [x] 1.3 Create caso-finanzas-politicas backend module — types.ts, queries.ts, transform.ts (files: webapp/src/lib/caso-finanzas-politicas/{types,queries,transform}.ts)
- [x] 1.4 Replace remaining caso-libra API routes with 301 redirects (files: webapp/src/app/api/caso-libra/*/route.ts — investigation, wallets, person/[actorSlug])
- [x] 1.5 Update graph constants — add ShellCompany, Aircraft, Wallet, Token, Claim, MoneyFlow, GovernmentAction to LABEL_COLORS + LABEL_DISPLAY (file: webapp/src/lib/graph/constants.ts)
- [ ] 2.1 Update EventCard.tsx imports from caso-libra/types → investigations/types
- [ ] 2.2 Update Timeline.tsx imports from caso-libra/types → investigations/types
- [ ] 3.1 Fix [slug]/page.tsx — pass slug to getStats, getActors, getDocuments (3 errors)
- [ ] 3.2 Fix [slug]/cronologia/page.tsx — accept params, pass slug to getTimeline (1 error)
- [ ] 3.3 Fix [slug]/evidencia/page.tsx — pass slug to getDocuments (1 error)
- [ ] 3.4 Fix api/og/caso/[slug]/actor/[actorSlug]/route.tsx — pass slug to getPersonBySlug (1 error)
- [ ] 4.1 Delete static case route folders (caso/caso-epstein/, caso/finanzas-politicas/)
- [ ] 4.2 Verify typecheck passes

## Events

_No events recorded._

## Final Commit

c1394e8: fix(m9): pass slug to getPersonBySlug in og/actor route.tsx
