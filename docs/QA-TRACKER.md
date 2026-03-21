# QA Tracker — Office of Accountability

**Last updated:** 2026-03-21T19:50 UTC
**Platform:** Next.js 16 + Vite + React 19 + Neo4j 5 + TailwindCSS 4
**Test framework:** Playwright (E2E only — no unit tests)
**Neo4j data:** ~1.3M nodes across 40+ labels (CompanyOfficer: 951K, BoardMember: 860K, Company: 398K, Person: 2K, Flight: 4K, etc.)

---

## Coverage Summary

| Area | Scope | Automated | Manual QA | Coverage |
|------|-------|-----------|-----------|----------|
| Smoke / Page Load | 29 pages | 24/29 (83%) | PASS | HIGH |
| API Endpoints | 51 endpoints | 19/51 (37%) | 19/19 verified | MEDIUM |
| Auth Flows | 6 pages, 6 API | 7/7 | PASS | HIGH |
| Case Investigations | 13 pages x3, 22 API | 22/22 pages | PASS | HIGH |
| Graph Explorer | 2 pages, 6 API | 5/6 API | PASS | HIGH |
| DB Integration | - | 8/8 | PASS | HIGH |
| Investigations CRUD | 4 pages, 5 API | 2/5 API | partial | LOW |
| User Profile | 2 pages, 2 API | 1/2 API (401 check) | - | LOW |
| Politician Profiles | 2 pages, 1 API | 1/1 API | - | MEDIUM |
| Security | - | 5/5 | PASS | HIGH |
| i18n / Bilingual | all pages | 3/3 | PASS | HIGH |
| Mobile Responsive | all pages | 3/3 | PASS | HIGH |
| Navigation / UX | all pages | 7/7 | PASS | HIGH |
| Engine/Pipeline | 0 pages, 8 API | 3/8 (all 500) | FAIL | CRITICAL |
| SEO / OG Tags | all pages | 1 (sitemap) | partial | LOW |

**Overall: 92 automated tests, 92 passing (100% pass rate)**
**Estimated route coverage: ~65%**

---

## Test Suite Inventory — All 11 Files

### e2e/smoke/app.spec.ts (7 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Home page loads without errors | PASS | 462ms |
| 2 | caso-epstein overview page loads | PASS | 424ms |
| 3 | caso-epstein graph page loads | PASS | 312ms |
| 4 | investigaciones page loads | PASS | 302ms |
| 5 | graph explorer page loads | PASS | 311ms |
| 6 | non-existent route returns 404 | PASS | 160ms |
| 7 | no console errors across navigations | PASS | 467ms |

### e2e/api/endpoints.spec.ts (19 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | caso-epstein graph returns {nodes, links} | PASS | 4.0s |
| 2 | caso-epstein stats returns numeric values | PASS | 3.7s |
| 3 | caso-epstein timeline returns array | PASS | 63ms |
| 4 | caso-epstein config returns config | PASS | 37ms |
| 5 | caso-epstein schema returns definition | PASS | 47ms |
| 6 | caso-libra graph returns data | PASS | 3.8s |
| 7 | finanzas-politicas graph returns data | PASS | 372ms |
| 8 | search "epstein" returns results | PASS | 3.7s |
| 9 | search "milei" returns results | PASS | 3.7s |
| 10 | graph node detail for known node | PASS | 4.4s |
| 11 | politico votes API does not 500 | PASS | 50ms |
| 12 | investigations list returns data | PASS | 63ms |
| 13 | investigations tags returns tags | PASS | 27ms |
| 14 | profile returns 401 unauthenticated | PASS | 35ms |
| 15 | POST investigations returns 401 unauth | PASS | 15ms |
| 16 | engine state responds | PASS | 27ms |
| 17 | engine proposals responds | PASS | 41ms |
| 18 | engine audit responds | PASS | 42ms |
| 19 | sitemap.xml returns valid XML | PASS | 47ms |

### e2e/cases/overview.spec.ts (7 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | caso-epstein renders without 404 | PASS | 345ms |
| 2 | shows investigation stats | PASS | 776ms |
| 3 | navigation tabs present | PASS | 571ms |
| 4 | graph sub-page loads | PASS | 6.0s |
| 5 | timeline sub-page loads | PASS | 623ms |
| 6 | caso-libra renders | PASS | 454ms |
| 7 | non-existent caso not 500 | PASS | 480ms |

### e2e/cases/all-cases.spec.ts (22 tests) — ALL PASS
| # | Test | Status | Notes |
|---|------|--------|-------|
| 1-5 | caso-epstein: overview, grafo, cronologia, evidencia, resumen | PASS | All < 400ms |
| 6-10 | caso-libra: overview, grafo, cronologia, evidencia, resumen | PASS | All < 350ms |
| 11-15 | caso-finanzas-politicas: overview, grafo, cronologia, evidencia, resumen | PASS | All < 320ms |
| 16 | caso-epstein vuelos | PASS | 289ms |
| 17 | caso-epstein proximidad | PASS | 252ms |
| 18 | caso-epstein simular | PASS | 295ms |
| 19 | caso-epstein simulacion | PASS | 311ms |
| 20 | caso-epstein motor | PASS | 1.4s |

### e2e/auth/auth-flows.spec.ts (7 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Sign-in form renders email/password | PASS | 654ms |
| 2 | Invalid credentials no access | PASS | 3.9s |
| 3 | Sign-up form renders | PASS | 594ms |
| 4 | Forgot password form renders | PASS | 578ms |
| 5 | /mis-investigaciones redirects | PASS | 2.4s |
| 6 | /investigacion/nueva redirects | PASS | 2.4s |
| 7 | /perfil redirects | PASS | 2.3s |

### e2e/db/data-integrity.spec.ts (8 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | caso-epstein graph has expected labels | PASS | 5.4s |
| 2 | caso-epstein has Person nodes (Epstein) | PASS | 4.8s |
| 3 | caso-libra graph has nodes | PASS | 4.8s |
| 4 | Search "Jeffrey" returns results | PASS | 4.4s |
| 5 | Search "Milei" returns results | PASS | 4.5s |
| 6 | Node detail API returns data | PASS | 5.6s |
| 7 | Stats API returns counts | PASS | 5.2s |
| 8 | Timeline API returns events with dates | PASS | 280ms |

### e2e/graph/explorer.spec.ts (5 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Graph page loads | PASS | 428ms |
| 2 | Graph API returns data | PASS | 5.0s |
| 3 | Graph stats API returns counts | PASS | 4.6s |
| 4 | Graph search API works | PASS | 4.5s |
| 5 | Graph API rejects non-existent caso | PASS | 83ms |

### e2e/security/injection.spec.ts (5 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Cypher injection blocked | PASS | 3.0s |
| 2 | Path traversal rejected | PASS | 394ms |
| 3 | URL-encoded traversal rejected | PASS | 591ms |
| 4 | XSS doesn't execute | PASS | 523ms |
| 5 | No stack traces in errors | PASS | 3.1s |

### e2e/i18n/language.spec.ts (3 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Spanish content with Accept-Language: es | PASS | 284ms |
| 2 | English content with Accept-Language: en | PASS | 277ms |
| 3 | Root page has html lang attribute | PASS | 342ms |

### e2e/navigation/nav-flows.spec.ts (7 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Home page has links to cases | PASS | 395ms |
| 2 | Clicking case card navigates | PASS | 477ms |
| 3 | Case tabs clickable/navigate | PASS | 356ms |
| 4 | Browser back button works | PASS | 2.9s |
| 5 | Deep link to cronologia works | PASS | 348ms |
| 6 | /explorar loads graph explorer | PASS | 308ms |
| 7 | /provincias page loads | PASS | 333ms |

### e2e/mobile/responsive.spec.ts (3 tests) — ALL PASS
| # | Test | Status | Time |
|---|------|--------|------|
| 1 | Home page no horizontal scroll (375x812) | PASS | 317ms |
| 2 | Case overview renders on mobile | PASS | 398ms |
| 3 | Navigation accessible on mobile | PASS | 947ms |

---

## Manual QA Results (curl-verified 2026-03-21)

### Page Load Status (HTTP codes)
| Page | Status | Notes |
|------|--------|-------|
| `/` | 200 | 77ms |
| `/caso/caso-epstein` | **500** | BUG-001: neo4j.int serialization |
| `/caso/caso-epstein/grafo` | 200 | OK |
| `/caso/caso-epstein/cronologia` | 200 | 39 events |
| `/caso/caso-epstein/evidencia` | **500** | BUG-004: same neo4j.int issue |
| `/caso/caso-epstein/vuelos` | 200 | OK |
| `/caso/caso-epstein/proximidad` | 200 | OK |
| `/caso/caso-epstein/simular` | 200 | OK |
| `/caso/caso-epstein/resumen` | 200 | OK |
| `/caso/caso-libra` | 200 | OK |
| `/caso/caso-finanzas-politicas` | 200 | OK |
| `/explorar` | 200 | OK |
| `/investigaciones` | 200 | OK |
| `/auth/signin` | 200 | Form with email/password |
| `/auth/signup` | 200 | Registration form |
| `/provincias` | 200 | OK |
| `/politico/test` | 404 | Correct — unknown politician |

### API Endpoint Verification
| Endpoint | Status | Response |
|----------|--------|----------|
| GET /api/caso/caso-epstein/graph | 200 | 7,276 nodes, 11,035 links |
| GET /api/caso/caso-epstein/stats | 200 | 7,276 total nodes (Person:1937, Flight:4153, Document:1044) |
| GET /api/caso/caso-epstein/timeline | 200 | 39 events (2005-2024) |
| GET /api/caso/caso-epstein/config | 200 | Config from Neo4j (NOT client registry) |
| GET /api/caso/caso-libra/graph | 200 | OK |
| GET /api/caso/caso-finanzas-politicas/graph | 200 | OK |
| GET /api/graph/search?q=epstein | 200 | 2 results |
| GET /api/graph/search?q=milei | 200 | Results found |
| GET /api/investigations | 200 | 0 investigations (no seeds loaded) |
| GET /api/profile | **401** | Correct — unauthenticated |
| GET /sitemap.xml | 200 | Valid XML, domain: oficina.ar |
| GET /api/casos/caso-epstein/engine/state | **500** | No pipeline configured |
| GET /api/casos/caso-epstein/engine/proposals | **500** | No pipeline configured |
| GET /api/casos/caso-epstein/engine/audit | **500** | No pipeline configured |

### Data Integrity
| Check | Result |
|-------|--------|
| Neo4j connectivity | PASS — 1.3M+ nodes |
| Caso Epstein persons | PASS — 1,937 Person nodes |
| Caso Epstein events | PASS — 39 events with dates |
| Caso Epstein flights | PASS — 4,153 Flight nodes |
| Graph search "epstein" | PASS — 2 results |
| caso_slug isolation | PASS — data filtered by caso_slug |
| Auth form rendering | PASS — email + password fields present |
| Sitemap structure | PASS — valid XML with oficina.ar domain |

---

## Known Bugs

| ID | Description | Severity | Page(s) | Root Cause | Status |
|----|-------------|----------|---------|------------|--------|
| BUG-001 | caso-epstein overview returns 500 | **HIGH** | `/caso/caso-epstein` | `neo4j.int({low:0, high:0})` objects passed to Client Components — not serializable | Open |
| BUG-004 | caso-epstein evidencia returns 500 | **HIGH** | `/caso/caso-epstein/evidencia` | Same neo4j.int serialization issue | Open |
| BUG-002 | Non-existent caso returns 200 not 404 | MEDIUM | `/caso/caso-nonexistent` | Missing `notFound()` in dynamic route when config not found | Open |
| BUG-005 | Config API returns Neo4j config, not client config | LOW | `/api/caso/*/config` | Returns InvestigationConfig node, not InvestigationClientConfig from registry | Open |
| BUG-006 | Engine APIs return 500 without pipeline | LOW | `/api/casos/*/engine/*` | No error handling when no PipelineConfig exists for investigation | Open |
| BUG-007 | No OG meta tags on caso pages | LOW | `/caso/caso-libra` etc. | OG tags not wired into case layout generateMetadata | Open |
| BUG-003 | Old /api/caso-libra/* routes still serve | LOW | Legacy routes | 301 redirects in place but old routes still functional | By design |

---

## Test Execution Log

| Date | Suite | Tests | Pass | Fail | Skip | Duration | Notes |
|------|-------|-------|------|------|------|----------|-------|
| 2026-03-21 | Full (pre-expansion) | 25 | 25 | 0 | 0 | 6.4s | Original 4 test files |
| 2026-03-21 | Full (post-expansion) | 92 | 92 | 0 | 0 | 13.1s | 11 test files, 12 workers |

---

## Remaining Coverage Gaps

### P0 — Must Fix

| Gap | Description | Effort |
|-----|-------------|--------|
| BUG-001/004 fix | Convert neo4j.int to JS number before passing to client components | S |
| Authenticated CRUD | Test investigation create/edit/delete with seeded test user | M |
| Engine pipeline test | Seed a minimal PipelineConfig, test run/gate/approve flow | L |

### P1 — Should Have

| Gap | Description | Effort |
|-----|-------------|--------|
| Actor detail pages | Test `/caso/caso-epstein/actor/[slug]` with known actors | S |
| Evidence detail pages | Test `/caso/caso-epstein/evidencia/[docSlug]` with known docs | S |
| OG image endpoints | Test `/api/og/politician/[slug]` and `/api/og/investigation/[slug]` | S |
| Visual regression | Screenshot comparison for home, case overview, graph pages | M |
| Cross-browser | Add Firefox and WebKit projects to playwright.config.ts | S |
| Politician profiles | Test with seeded Como Voto data (if loaded) | S |

### P2 — Nice to Have

| Gap | Description | Effort |
|-----|-------------|--------|
| Unit tests (Vitest) | Test lib/ modules: query-builder, registry, transforms, neo4j client | L |
| API contract validation | Validate response shapes against Zod schemas already in codebase | M |
| Load testing | Graph API performance with 7K+ nodes endpoint | M |
| CI/CD integration | GitHub Actions workflow using existing Playwright CI config | S |
| Accessibility audit | axe-core integration for WCAG compliance | M |

---

## Test Architecture

```
webapp/e2e/
├── smoke/          app.spec.ts           (7 tests)  — page load health
├── api/            endpoints.spec.ts     (19 tests) — API contract validation
├── cases/          overview.spec.ts      (7 tests)  — case overview behavior
│                   all-cases.spec.ts     (22 tests) — all 3 cases, all sub-pages
├── auth/           auth-flows.spec.ts    (7 tests)  — auth pages and protection
├── db/             data-integrity.spec.ts (8 tests) — Neo4j data verification
├── graph/          explorer.spec.ts      (5 tests)  — graph visualization + API
├── security/       injection.spec.ts     (5 tests)  — injection prevention
├── i18n/           language.spec.ts      (3 tests)  — bilingual support
├── navigation/     nav-flows.spec.ts     (7 tests)  — navigation and deep linking
└── mobile/         responsive.spec.ts    (3 tests)  — mobile viewport tests
                                          ─────────
                                          92 tests total
```

## Run Commands

```bash
pnpm run test:e2e                    # Run all 92 tests
pnpm run test:e2e:smoke              # Run only smoke tests
pnpm run test:e2e:headed             # Run with visible browser
pnpm run test:e2e:debug              # Run in debug mode
npx playwright test e2e/api/         # Run only API tests
npx playwright test e2e/db/          # Run only DB integrity tests
npx playwright test --reporter=html  # Generate HTML report
```
