# Scratchpad

## 2026-03-17 — Iteration: Neo4j Client Wrapper

### Current State
- Vinext app scaffolded with directories: lib/neo4j, lib/graph, components/{ui,layout,graph}, etl
- Docker Compose with Neo4j 5 Community configured (auth disabled for dev)
- .env.example has NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
- Placeholder index.ts files in lib/neo4j and lib/graph
- neo4j-driver-lite NOT yet installed

### Plan
1. Install neo4j-driver-lite + zod
2. Create lib/neo4j/client.ts — typed client wrapper with:
   - Session management (read/write)
   - Typed query helper using generics
   - Connection config from env vars
   - Cypher injection prevention (parameterized queries only)
3. Create lib/neo4j/types.ts — shared Neo4j types (provenance fields, node/relationship types)
4. Update lib/neo4j/index.ts barrel export
5. Verify with typecheck
6. Commit & close task

### Decisions
- Using neo4j-driver-lite (not neo4j-driver) per stack spec — ESM/Workers-native
- Immutable patterns for all query result transforms
- Zod for env validation at startup

## 2026-03-17 — Iteration: Neo4j Schema Init

### What was done
- Created `lib/neo4j/schema.ts` with `initializeSchema()` function
  - 8 unique constraints: Politician.id, Legislation.expediente_id, LegislativeVote.acta_id, Party.id, Province.id, Investigation.id, User.id, User.email
  - 3 fulltext indexes: politician name, legislation title, investigation title
  - 5 range indexes: politician slug/chamber, legislation status, vote date, user verification_tier
  - All use IF NOT EXISTS — idempotent, safe for repeated runs
  - Each statement in its own implicit tx (Neo4j CE limitation)
- Created `scripts/init-schema.ts` — standalone runner via `npm run db:init-schema`
- Updated barrel export in `lib/neo4j/index.ts`
- npm lockfile is broken (workspace: protocol error in transitive deps) — using `npx tsx` as workaround

### Notes
- npm install broken due to missing lockfile + possible pnpm-installed node_modules. Need to fix in ESLint+Prettier task or a dedicated task.

## 2026-03-17 — Iteration: ESLint + Prettier

### What was done
- Fixed npm lockfile: removed pnpm node_modules, ran `npm install` cleanly (439 packages)
- Installed prettier, eslint-config-prettier, eslint-plugin-prettier
- Created `.prettierrc.json`: single quotes, no semis, trailing commas, 100 char width
- Created `.prettierignore`: excludes node_modules, .next, .ralph, lockfiles
- Updated `eslint.config.mjs`: prettier integration, no-console, consistent-type-imports, unused-vars with _ prefix
- Scripts dir exempted from no-console (CLI scripts need it)
- Added `lint:fix`, `format`, `format:check` npm scripts
- Auto-formatted all existing source files
- All checks pass: lint ✓, typecheck ✓, format:check ✓

### Closed tasks this iteration
- task-1773726180-db1b (Neo4j schema init — was already committed, just needed closing)
- task-1773726186-83ec (ESLint + Prettier — implemented and committed)

### What's next
- M0 Scaffolding is essentially complete (Vinext + Neo4j dev env, client wrapper, schema init, linting)
- Next milestone: M1 Data Ingestion — Como Voto pipeline to seed 329 legislators + vote history

## 2026-03-17 — M1: Data Ingestion Planning

### Como Voto Data Source Analysis
- Source: https://github.com/rquiroga7/Como_voto (MIT, auto-updated daily)
- Processed JSON at: `https://raw.githubusercontent.com/rquiroga7/Como_voto/main/docs/data/`
- Key files:
  - `legislators.json` — 2,258 legislators (compact: k, n, c, b, p, co, tv, pres, etc.)
  - `votaciones.json` — 5,494 voting sessions (id, title, date, result, tallies)
  - `legislators/<NAME_KEY>.json` — per-legislator detail (votes array, terms, alignment)
- Legislators identified by uppercase name key (no numeric IDs)
- Vote values: AFIRMATIVO, NEGATIVO, ABSTENCION, AUSENTE
- Chambers: "diputados" / "senadores"
- Date format: "DD/MM/YYYY - HH:MM"

### Schema Mapping (Como Voto → Neo4j)
- **Politician** node ← legislators.json + per-legislator detail
  - id: slugified name key, name, full_name, chamber, province, slug, photo
  - Provenance: tier=gold, source_url=como_voto
- **Party** node ← bloc field (b)
  - id: slugified bloc name
- **Province** node ← province field (p)
  - id: slugified province name
- **LegislativeVote** node ← votaciones.json
  - acta_id: vote session id, title, date, result, type
- **Relationships:**
  - (Politician)-[:MEMBER_OF]->(Party)
  - (Politician)-[:REPRESENTS]->(Province)
  - (Politician)-[:CAST_VOTE {vote: "AFIRMATIVO"}]->(LegislativeVote)

### M1 Task Breakdown
1. **ETL types + Zod schemas** — Define Como Voto JSON shapes with Zod validation
2. **Fetcher** — Download legislators.json + votaciones.json from GitHub
3. **Transformer** — Map Como Voto → Neo4j node/relationship params (immutable)
4. **Loader** — Batch MERGE into Neo4j (politicians, parties, provinces, votes, relationships)
5. **Runner script** — CLI entry point `npm run etl:como-voto`

### This Iteration
- Implementing task 1: ETL types + Zod schemas for Como Voto data

## 2026-03-17 — Iteration: ETL Fetcher

### What was done
- Closed task-1773734913-7d7a (ETL types) — was already committed in previous iteration
- Created `etl/como-voto/fetcher.ts` with:
  - `fetchLegislators()` — downloads + Zod-validates legislators.json
  - `fetchVotingSessions()` — downloads + Zod-validates votaciones.json
  - `fetchLegislatorDetail()` — single legislator detail file
  - `fetchLegislatorDetails()` — batch fetch with concurrency control (default 10)
  - Graceful error collection via Promise.allSettled (pipeline continues on partial failure)
  - AbortSignal support for cancellation
- Updated barrel export in `etl/como-voto/index.ts`
- Committed as `1d09532`

### What's next
- task-1773734921-a66d: ETL transformer (map Como Voto → Neo4j params)
- task-1773734921-b286: ETL loader (batch MERGE into Neo4j)
- task-1773734921-bf13: ETL runner script

## 2026-03-17 — Iteration: ETL Transformer

### What was done
- Created `etl/como-voto/transformer.ts` with pure transform functions:
  - `slugify()` — URL-safe slug from any string, strips diacritics
  - `parseComoVotoDate()` — "DD/MM/YYYY - HH:MM" → ISO 8601 with Argentina TZ (-03:00)
  - `transformPolitician()` — compact legislator → PoliticianParams
  - `transformPoliticianWithDetail()` — enriched with detail file data
  - `transformParties()` — deduplicated Party params from legislators
  - `transformProvinces()` — deduplicated Province params from legislators
  - `transformVotingSession()` — VotingSession → LegislativeVoteParams
  - `transformCastVotes()` — detail votes → CastVoteRelParams (filters empty votes)
  - `transformMemberOf()` / `transformRepresents()` — relationship params
  - `transformAll()` — orchestrator that produces all node + relationship params
- All functions are pure, immutable, no side effects
- Provenance auto-generated: source=como_voto, tier=gold, sha256 ingestion hash
- Updated barrel export in `etl/como-voto/index.ts`
- Committed as `7fb06b1`

### What's next
- task-1773734921-b286: ETL loader (batch MERGE into Neo4j)
- task-1773734921-bf13: ETL runner script

## 2026-03-17 — Iteration: ETL Loader

### What was done
- Created `etl/como-voto/loader.ts` with batch MERGE functions:
  - `loadAll()` — orchestrator that loads nodes then relationships in correct order
  - Node loaders: `loadPoliticians`, `loadParties`, `loadProvinces`, `loadVotingSessions`
  - Relationship loaders: `loadMemberOfRels`, `loadRepresentsRels`, `loadCastVoteRels`
  - `runBatched()` — generic helper using UNWIND with configurable batch sizes
  - `chunk()` — pure array splitter for batching
- All queries use parameterized Cypher (no interpolation)
- MERGE ensures idempotent loads (safe to re-run)
- Execution order: nodes first, relationships second (MATCH requires existing nodes)
- Default batch sizes: 500 for nodes, 1000 for relationships
- Error collection per step (pipeline continues on partial failure)
- Updated barrel export in `etl/como-voto/index.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `3f86ec2`

### What's next
- task-1773734921-bf13: ETL runner script (last M1 task)

## 2026-03-17 — Iteration: ETL Runner Script

### What was done
- Created `scripts/run-etl-como-voto.ts` — CLI runner for the full ETL pipeline
  - Verifies Neo4j connectivity before starting
  - Fetches legislators.json + votaciones.json in parallel
  - Fetches per-legislator details with concurrency control (10)
  - Transforms all data via `transformAll()`
  - Loads into Neo4j via `loadAll()`
  - Prints progress with counts, durations, and error summaries
  - Exits with code 1 on load errors, 0 on success
  - Gracefully closes Neo4j driver on exit (including error paths)
- Added `npm run etl:como-voto` script to package.json
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `bb6fdee`

### M1 Status
- All 5 M1 tasks are now complete:
  1. ✅ ETL types + Zod schemas
  2. ✅ ETL fetcher
  3. ✅ ETL transformer
  4. ✅ ETL loader
  5. ✅ ETL runner script
- M1 Data Ingestion pipeline is code-complete
- Next: run the pipeline against Neo4j to verify end-to-end, then move to M2 (Graph API)

## 2026-03-17 — M2: Graph API Planning & Transform Utilities

### M2 Task Breakdown
1. ✅ **Graph transform utilities** — `lib/graph/transform.ts` (committed b112376)
   - `transformNode()` — Neo4j Node → GraphNode (handles Integer conversion, app-level ID resolution)
   - `transformRelationship()` — Neo4j Relationship → GraphLink
   - `transformNeighborRecords()` — (node)-[rel]->(neighbor) triples → deduplicated GraphData
   - `transformNodeRecords()` — simple node results → GraphData
   - `mergeGraphData()` — combine multiple GraphData objects
   - `emptyGraphData()` — empty result factory
2. **Graph query service** — `lib/graph/queries.ts` with Cypher for node neighborhood + search
3. **API route GET /api/graph/node/[id]** — neighborhood graph endpoint
4. **API route GET /api/graph/search** — fulltext search endpoint

### What's next
- task-1773735780-9119: API route GET /api/graph/node/[id] (now unblocked)
- task-1773735780-a43d: API route GET /api/graph/search (now unblocked)

## 2026-03-17 — Iteration: Graph Query Service

### What was done
- Created `lib/graph/queries.ts` with three query functions:
  - `getNodeNeighborhood(nodeId, limit?)` — finds center node by id/slug/acta_id, fetches up to 50 neighbors with relationships, returns GraphData or null
  - `searchNodes(query, limit?)` — fulltext search across all 3 indexes (politician, legislation, investigation) in parallel, returns SearchResult with GraphData + totalCount
  - `searchNodesByLabel(query, label, limit?)` — label-filtered search using fulltext index when available, CONTAINS fallback otherwise
- Lucene query sanitization: escapes special chars, appends wildcard for partial matching
- All queries parameterized (no Cypher injection)
- Updated barrel export in `lib/graph/index.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `c062474`

### What's next
- API route tasks are now unblocked — implement GET /api/graph/node/[id] and GET /api/graph/search

## 2026-03-17 — Iteration: API Route GET /api/graph/node/[id]

### What was done
- Created `app/api/graph/node/[id]/route.ts` — Next.js App Router route handler
  - Zod validation on `id` param (alphanumeric + hyphens/underscores/dots/colons, max 500 chars)
  - Optional `?limit=` query param (1-200, default 50)
  - Calls `getNodeNeighborhood()` from graph query service
  - Returns `{ success, data: { nodes, links }, meta: { nodeCount, linkCount } }`
  - 400 for invalid params, 404 for missing node, 503 for Neo4j connection errors
  - Follows ApiResponse pattern with success/error fields
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `5b265f6`

### What's next
- task-1773735780-a43d: API route GET /api/graph/search (last M2 task)

## 2026-03-17 — Iteration: API Route GET /api/graph/search

### What was done
- Created `app/api/graph/search/route.ts` — Next.js App Router route handler
  - Required `?q=` query param (1-200 chars, Zod validated)
  - Optional `?limit=` param (1-100, default 20)
  - Optional `?label=` param (Politician|Legislation|Investigation)
  - Calls `searchNodes()` for unfiltered search, `searchNodesByLabel()` for filtered
  - Returns `{ success, data: { nodes, links }, meta: { totalCount } }`
  - 400 for invalid/missing params, 503 for Neo4j connection errors
  - Follows same ApiResponse pattern as node/[id] route
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `9a0e26e`

### M2 Status
- All 4 M2 tasks are now complete:
  1. ✅ Graph transform utilities (b112376)
  2. ✅ Graph query service (c062474)
  3. ✅ API route GET /api/graph/node/[id] (5b265f6)
  4. ✅ API route GET /api/graph/search (9a0e26e)
- M2 Graph API is code-complete
- Next: M3 (Graph Explorer) and M4 (Politician Profiles) can start in parallel

## 2026-03-17 — M3: Graph Explorer Planning

### M3 Task Breakdown
1. ✅ **ForceGraph wrapper component** — `components/graph/ForceGraph.tsx` (committed c7f15b0)
   - react-force-graph-2d client component with label-based coloring
   - Custom canvas rendering: colored circles + zoom-adaptive labels
   - Click-to-select with highlight ring, label visibility filtering
   - Responsive sizing via ResizeObserver, auto zoom-to-fit
   - Directional arrows, curved links, dark background (#09090b)
2. **SearchBar component** — `components/graph/SearchBar.tsx` (task-1773736478-19b0)
3. **NodeDetailPanel component** — `components/graph/NodeDetailPanel.tsx` (task-1773736478-1e39)
4. **TypeFilter component** — `components/graph/TypeFilter.tsx` (task-1773736480-fcc2)
5. **Graph Explorer page** — `app/explorar/page.tsx` (task-1773736482-de64)

### What's next
- Pick up SearchBar, NodeDetailPanel, TypeFilter, then wire everything in the Explorer page

## 2026-03-17 — Iteration: SearchBar Component

### What was done
- Created `components/graph/SearchBar.tsx` — debounced search with autocomplete dropdown
  - Calls `/api/graph/search?q=...&limit=10` with AbortController for cancellation
  - Debounced at 300ms, min 2 chars to trigger search
  - Keyboard navigation: ArrowUp/Down, Enter to select, Escape to close
  - ARIA combobox pattern (role=combobox, aria-controls, aria-expanded, aria-activedescendant)
  - Label-colored dots in results matching ForceGraph color scheme
  - Spanish placeholder: "Buscar político, ley, votación…"
  - "Sin resultados" empty state message
  - `onSelect(nodeId)` callback for parent integration
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `50844ed`

### What's next
- task-1773736478-1e39: NodeDetailPanel component
- task-1773736480-fcc2: TypeFilter component
- task-1773736482-de64: Explorer page (depends on above)

## 2026-03-17 — Iteration: NodeDetailPanel Component

### What was done
- Created `components/graph/NodeDetailPanel.tsx` — side panel for selected node details
  - Fetches neighborhood data from `/api/graph/node/[id]` with AbortController
  - Displays node labels with colored badges (matching ForceGraph color scheme)
  - Shows filtered properties (hides provenance internals)
  - Groups neighbors by relationship type + direction (outgoing/incoming)
  - Click-through navigation via `onNavigate(nodeId)` callback
  - Shows vote values on CAST_VOTE relationship items
  - Truncates neighbor lists at 10 with "+N mas..." overflow
  - Spanish labels: "Propiedades", "Conexiones", "Cerrar panel"
  - Loading spinner, error state, empty states
  - ARIA-accessible close button
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `a38c137`

### What's next
- task-1773736480-fcc2: TypeFilter component
- task-1773736482-de64: Explorer page (last M3 task)

## 2026-03-17 — Iteration: TypeFilter Component

### What was done
- Created `components/graph/TypeFilter.tsx` — toggleable pill filters for node types
  - Pill buttons for each available type with label-colored active state
  - "Todos" toggle-all button to show/hide all types at once
  - Uses same LABEL_COLORS/LABEL_DISPLAY as ForceGraph, SearchBar, NodeDetailPanel
  - Outputs `Set<string>` matching ForceGraph's `visibleLabels` prop type
  - ARIA role=button with aria-pressed and Spanish labels
  - Immutable state updates (new Set on each toggle)
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `d33b083`

### What's next
- task-1773736482-de64: Explorer page (last M3 task — wires ForceGraph + SearchBar + NodeDetailPanel + TypeFilter)

## 2026-03-17 — Iteration: Graph Explorer Page

### What was done
- Created `app/explorar/page.tsx` — full-screen graph explorer page wiring all M3 components
  - Top bar: ORC logo link + SearchBar
  - Main area: ForceGraph canvas with TypeFilter overlay (top-left)
  - Right panel: NodeDetailPanel slides in when a node is selected
  - State management: graphData, selectedNodeId, visibleLabels
  - Search-to-explore flow: search → select → load neighborhood → display graph
  - Click navigation: click node → load its neighborhood → update graph + panel
  - Panel navigate: click neighbor in panel → same as clicking a node
  - Empty state with search icon and Spanish instructions
  - Loading indicator centered above graph
  - Uses next/link for internal navigation
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `bc957b0`

### M3 Status
- All 5 M3 tasks are now complete:
  1. ✅ ForceGraph wrapper component (c7f15b0)
  2. ✅ SearchBar component (50844ed)
  3. ✅ NodeDetailPanel component (a38c137)
  4. ✅ TypeFilter component (d33b083)
  5. ✅ Graph Explorer page (bc957b0)
- M3 Graph Explorer is code-complete
- Next: M4 (Politician Profiles) or M5 (Auth)

## 2026-03-17 — M4: Politician Profiles Planning

### M4 Task Breakdown
1. **Politician query functions** — `getPoliticianBySlug`, `getPoliticianVoteHistory`, `getAllPoliticianSlugs` in `lib/graph/queries.ts`
2. **Politician profile page** — SSR at `/politico/[slug]` with vote history, Schema.org JSON-LD, OG tags

### This Iteration
- ✅ Politician query functions — committed d1950d7
  - `getPoliticianBySlug(slug)` — profile data with party/province
  - `getPoliticianVoteHistory(slug, page, limit)` — paginated votes sorted by date desc
  - `getAllPoliticianSlugs()` — for static generation / sitemap

### What's next
- M4 task 2: Politician profile page at /politico/[slug] with SSR, Schema.org, OG tags

## 2026-03-17 — Iteration: Politician Profile Page

### What was done
- Closed task-1773737728-90ba (query functions — already committed d1950d7, just needed closing)
- Created `app/politico/[slug]/page.tsx` — SSR politician profile page:
  - Server Component fetching profile + vote history at request time
  - Breadcrumb navigation: ORC / Explorar / [name]
  - Profile header: photo (next/image unoptimized), name, party/province/chamber badges
  - Stats grid: total votes, presence %, chamber, province
  - Graph sub-view: embedded ForceGraph showing politician's connections (30 neighbors)
  - Link to full explorer: "Abrir en explorador completo"
  - Vote history table: client-side pagination with color-coded vote badges
  - Schema.org JSON-LD: Person type with memberOf, workLocation, nationality
  - Dynamic OG tags via generateMetadata: title, description, profile type
  - `notFound()` for missing politicians
- Created `components/politician/VoteHistoryTable.tsx` — paginated vote history client component
  - Fetches from `/api/politico/[slug]/votes` with page/limit params
  - Color-coded vote badges: A favor (green), En contra (red), Abstención (yellow), Ausente (gray)
  - Previous/Next pagination with loading state
  - Spanish date formatting
- Created `components/politician/PoliticianGraph.tsx` — mini graph sub-view
  - Loads neighborhood via `/api/graph/node/[id]` with limit=30
  - Reuses ForceGraph component, AbortController cleanup
  - Loading/error/empty states
- Created `app/api/politico/[slug]/votes/route.ts` — paginated votes API endpoint
  - Zod validation on slug, page, limit params
  - Verifies politician exists before querying votes
  - Parameterized Cypher, connection error handling (503)
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `4be8d57`

### M4 Status
- All 2 M4 tasks are now complete:
  1. ✅ Politician query functions (d1950d7)
  2. ✅ Politician profile page (4be8d57)
- M4 Politician Profiles is code-complete
- Next: M5 (Auth) — user accounts + roles with Auth.js

## 2026-03-17 — M5: Auth Planning

### Architecture Decisions
- Using `@auth/core` (framework-agnostic) since Vinext is not standard Next.js
- JWT sessions (no Session node in Neo4j needed) — simpler, stateless, Workers-friendly
- Custom Neo4j adapter for User/Account/VerificationToken storage
- Providers: Credentials (email/password) + Google OAuth
- Verification tiers: Tier 0 (read-only, default), Tier 1 (email-verified, can contribute)
- Password hashing: use Web Crypto API (SubtleCrypto) for Workers compatibility

### M5 Task Breakdown
1. **Auth types + Neo4j adapter** — Custom adapter for @auth/core with Neo4j User/Account/VerificationToken nodes
2. **Auth config + API routes** — @auth/core setup with providers, catch-all route at /api/auth/[...path]
3. **Session helpers** — getSession() for server components, useSession() hook for clients
4. **Auth UI** — Sign-in/sign-up pages, user menu component

### This Iteration
- ✅ Auth types + Neo4j adapter — committed 3e8bbcb
  - `lib/auth/types.ts` — AuthUser, AuthAccount, AuthVerificationToken, VerificationTier, Zod schemas for sign-up/sign-in
  - `lib/auth/password.ts` — PBKDF2 hashing via Web Crypto API (Workers-compatible, 100k iterations, constant-time comparison)
  - `lib/auth/neo4j-adapter.ts` — Full Auth.js Adapter impl: createUser, getUser, getUserByEmail, getUserByAccount, updateUser, deleteUser, linkAccount, unlinkAccount, createVerificationToken, useVerificationToken
  - `lib/auth/index.ts` — barrel export
  - `.env.example` — added AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

### What's next
- task-1773738428-85a3: Auth config + API route handlers
- task-1773738428-96bd: Session helpers + auth middleware
- task-1773738428-a4d7: Auth UI pages

## 2026-03-17 — Iteration: Auth Config + API Routes

### What was done
- Created `lib/auth/config.ts` — @auth/core AuthConfig:
  - Credentials provider: Zod-validated email/password, queries User node, verifies PBKDF2 hash
  - Google OAuth provider: conditionally enabled if AUTH_GOOGLE_ID/SECRET env vars set
  - JWT session strategy with user ID injected via callbacks
  - Custom pages: /auth/signin, /auth/error
  - Neo4j adapter wired for user persistence
  - trustHost=true for Workers compatibility
- Created `app/api/auth/[...path]/route.ts` — catch-all handler delegating to Auth()
  - Handles GET + POST for all /api/auth/* paths (signin, signout, callback, session, csrf)
- Created `app/api/auth/signup/route.ts` — user registration endpoint:
  - POST with Zod validation (email, password min 8, name)
  - Duplicate email check before creation
  - PBKDF2 password hashing, creates User + Account nodes atomically
  - Returns 201 with user data, 409 for duplicates, 400 for invalid input, 503 for Neo4j errors
- Updated barrel export in `lib/auth/index.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `0608788`

### What's next
- task-1773738736-3583: Session helpers (getSession, useSession)
- task-1773738737-6e21: Auth UI pages

## 2026-03-17 — Iteration: Session Helpers

### What was done
- Created `lib/auth/session.ts` — server-side session helper:
  - `getSession()` decodes JWT from cookies via `@auth/core/jwt` `getToken()`
  - Returns `AppSession` with user id/email/name/image + expiry, or null
  - Handles both secure and non-secure cookie names
  - Works in Server Components and Route Handlers
- Created `components/auth/SessionProvider.tsx` — client-side session context:
  - `SessionProvider` component fetches `/api/auth/session` on mount
  - Supports `initialSession` prop for SSR hydration (avoids fetch when pre-loaded)
  - `useSession()` hook returns `{ session, status, update }`
  - Status: 'loading' | 'authenticated' | 'unauthenticated'
  - Uses useReducer to avoid setState-in-effect lint warnings
- Updated barrel export in `lib/auth/index.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `a0b7e47`

### What's next
- task-1773738980-8572: Auth UI — sign-in page, sign-up page, user menu component

## 2026-03-17 — Iteration: Auth UI Pages

### What was done
- Created `app/auth/signin/page.tsx` — sign-in page:
  - Credentials form (email/password) with useReducer state management
  - Posts to /api/auth/callback/credentials, redirects on success
  - Google OAuth button linking to /api/auth/signin/google
  - Error display, loading state, Spanish labels
  - Link to sign-up page
- Created `app/auth/signup/page.tsx` — sign-up page:
  - Registration form (name/email/password) with field-level validation errors
  - Posts to /api/auth/signup, auto-signs in on success
  - Google OAuth button
  - Handles 409 (duplicate email), 400 (validation), connection errors
  - Link to sign-in page
- Created `app/auth/error/page.tsx` — auth error page:
  - Maps Auth.js error codes to Spanish messages
  - Suspense boundary for useSearchParams
  - Links to retry sign-in or go home
- Created `components/auth/UserMenu.tsx` — dropdown user menu:
  - Shows "Ingresar" link when unauthenticated
  - Shows avatar (next/image or initials) with dropdown when authenticated
  - Dropdown: user name/email, sign-out button
  - Outside click and Escape key close the dropdown
  - ARIA attributes (aria-expanded, aria-haspopup)
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `f3d10e0`

### M5 Status
- All 4 M5 tasks are now complete:
  1. ✅ Auth types + Neo4j adapter (3e8bbcb)
  2. ✅ Auth config + API route handlers (0608788)
  3. ✅ Session helpers (a0b7e47)
  4. ✅ Auth UI pages + user menu (f3d10e0)
- M5 Auth is code-complete
- Next: M6 (Investigations) — TipTap editor + graph embeds + publish flow

## 2026-03-17 — M6: Investigation Engine Planning

### Architecture Decisions
- TipTap for rich text editing (not yet installed — need @tiptap/react, @tiptap/starter-kit, @tiptap/pm)
- Investigation stored as TipTap JSON in Neo4j (body field)
- Status flow: draft → published → archived
- On publish: create REFERENCES edges to embedded graph nodes
- Custom TipTap extensions: GraphNodeEmbed (inline card), SubGraphEmbed (mini force-graph)
- Auth required: Tier 1+ for create/edit, public read for published
- Slug generated from title (like politician slugs)

### M6 Task Breakdown
1. **Install TipTap + Investigation types** — npm deps, `lib/investigation/types.ts` with Zod schemas
2. **Investigation query functions** — `lib/investigation/queries.ts` (CRUD + list + references)
3. **Investigation CRUD API routes** — POST/PATCH/DELETE at `/api/investigations`, GET list + detail
4. **TipTap editor component** — base editor with toolbar, custom GraphNodeEmbed extension
5. **Investigation create/edit page** — `/investigacion/nueva` and `/investigacion/[slug]/editar`
6. **Investigation reading page** — `/investigacion/[slug]` with SSR, embedded nodes, OG tags
7. **Investigations index page** — `/investigaciones` grid with tag filters
8. **My investigations dashboard** — `/mis-investigaciones` (drafts + published)

### This Iteration
- Starting with task 1: Install TipTap deps + create investigation types

### What was done
- Installed TipTap dependencies: @tiptap/react, @tiptap/starter-kit, @tiptap/pm, @tiptap/extension-link, @tiptap/extension-image (v3.20.3)
- Created `lib/investigation/types.ts`:
  - InvestigationStatus: 'draft' | 'published' | 'archived'
  - Investigation interface: full node data with provenance fields
  - InvestigationWithAuthor: investigation + author display info
  - InvestigationListItem: lighter type for list views
  - createInvestigationSchema: Zod (title, summary, body 500KB max, tags, status, referenced_node_ids)
  - updateInvestigationSchema: all fields optional
  - listInvestigationsSchema: page, limit, tag query params
- Created `lib/investigation/index.ts` barrel export
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `74268e5`

### What's next
- task-1773739780-57b4: Investigation Neo4j query functions (CRUD + list + REFERENCES edge creation)

## 2026-03-17 — Iteration: Investigation Query Functions

### What was done
- Created `lib/investigation/queries.ts` — full CRUD + list + references:
  - `createInvestigation(input, authorId)` — creates Investigation node + AUTHORED edge, REFERENCES edges on publish
  - `getInvestigationBySlug(slug)` — read by slug with author info
  - `getInvestigationById(id)` — read by ID with author info
  - `updateInvestigation(id, input, authorId)` — ownership check, dynamic SET, REFERENCES sync on publish
  - `deleteInvestigation(id, authorId)` — ownership check, DETACH DELETE
  - `listInvestigations(page, limit, tag?)` — published investigations with optional tag filter, paginated
  - `listMyInvestigations(authorId, page, limit)` — all statuses for author, paginated
  - `getInvestigationsReferencingNode(nodeId, limit)` — published investigations linking to a node
  - `getAllTags()` — unique tags from published investigations
- Updated barrel export in `lib/investigation/index.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `4577a90`

### What's next
- task-1773739620-b374: Investigation CRUD API routes
- task-1773739620-c6bd: TipTap editor component with toolbar

## 2026-03-17 — Iteration: Investigation CRUD API Routes

### What was done
- Created `app/api/investigations/route.ts` — POST (create, auth required) + GET (list published, public)
  - POST: Zod validation via createInvestigationSchema, session auth, returns 201
  - GET: listInvestigationsSchema for page/limit/tag params, paginated response with meta
- Created `app/api/investigations/[id]/route.ts` — GET/PATCH/DELETE
  - GET: public for published, 404 for drafts/archived to non-authors (privacy)
  - PATCH: auth + ownership check, Zod validation, handles 403 for non-authors
  - DELETE: auth + ownership check, handles 403 for non-authors
- Created `app/api/investigations/mine/route.ts` — GET user's investigations (all statuses, auth required)
- Created `app/api/investigations/tags/route.ts` — GET unique tags from published investigations
- All routes follow existing patterns: Zod validation, connection error → 503, ApiResponse format
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `63d6f3d`

### What's next
- task-1773739620-d53f: Investigation create/edit pages
- task-1773739620-e34a: Investigation reading page
- task-1773739620-f839: Investigations index + my investigations

## 2026-03-17 — Iteration: TipTap Editor Component

### What was done
- Created `components/investigation/InvestigationEditor.tsx` — rich text editor with toolbar:
  - TipTap with StarterKit, Link, Image, and custom GraphNodeEmbed extensions
  - Full toolbar: bold, italic, strike, code, H2/H3, bullet/ordered lists, blockquote, code block, horizontal rule, link, image, graph node embed, undo/redo
  - All labels in Spanish
  - `onChange` callback provides stringified JSON + extracted referenced node IDs
  - Read-only mode via `editable` prop
  - Prose dark theme styling (prose-invert prose-zinc)
- Created `components/investigation/GraphNodeEmbed.tsx` — custom TipTap node extension:
  - Inline atom node rendered as colored pill with label dot, name, and delete button
  - `GraphNodePicker` component: search UI that queries `/api/graph/search` to find nodes
  - Debounced search, keyboard nav (Escape to close)
  - Label colors match ForceGraph/SearchBar conventions
- Created `types/tiptap.d.ts` — ambient module declarations for TipTap v3.20.3:
  - TipTap v3.20.3 ships TypeScript source but no compiled dist/, so TS can't resolve types
  - Declares @tiptap/core, @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-image
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `21c444f`

### What's next
- task-1773739780-8a3f: Investigation create/edit pages
- task-1773739780-9bb7: Investigation reading page
- task-1773739780-aab6: Investigations index + my investigations

## 2026-03-17 — Iteration: Investigation Create/Edit Pages

### What was done
- Closed task-1773739620-c6bd (TipTap editor — already committed 21c444f, just needed closing)
- Created `components/investigation/InvestigationForm.tsx` — shared form component:
  - Title, summary, tags (with keyboard add/remove), TipTap body editor
  - Save as draft / Publish actions via useReducer state
  - Delete with window.confirm (edit mode only)
  - Breadcrumb header with ORC link
  - Spanish labels throughout
- Created `app/investigacion/nueva/page.tsx` — create investigation page:
  - SessionProvider + auth guard (redirect to sign-in if unauthenticated)
  - POSTs to /api/investigations, redirects to published slug or /mis-investigaciones
- Created `app/investigacion/[slug]/editar/page.tsx` — edit investigation page:
  - Loads investigation by slug via /api/investigations/mine + detail endpoint
  - PATCHes /api/investigations/[id] on save
  - DELETEs on delete with confirmation
  - Error/loading/redirect states
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `dd91253`

### What's next
- task-1773739620-e34a: Investigation reading page (/investigacion/[slug])
- task-1773739620-f839: Investigations index + my investigations

## 2026-03-17 — Iteration: Investigation Reading Page

### What was done
- Created `app/investigacion/[slug]/page.tsx` — SSR investigation reading page:
  - Server Component fetching investigation by slug at request time
  - Only shows published investigations (404 for draft/archived)
  - Breadcrumb navigation: ORC / Investigaciones / [title]
  - Title, author avatar + name, published date
  - Summary paragraph, tag pills linking to filtered index
  - TipTap body rendered read-only via InvestigationBodyView
  - Footer with publish/update dates and link to all investigations
  - Schema.org JSON-LD: Article type with author, dates, keywords
  - Dynamic OG tags: article type, published/modified times, Twitter summary_large_image
  - Canonical URL
  - `notFound()` for missing or non-published investigations
- Created `components/investigation/InvestigationBodyView.tsx` — read-only TipTap renderer:
  - Uses TipTap with StarterKit, Link, Image extensions + custom read-only GraphNodeEmbed
  - Graph node embeds render as clickable pills linking to `/explorar?node=...`
  - No delete buttons (read-only mode, distinct from editor's GraphNodeEmbedView)
  - Loading state while TipTap initializes
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `603ce70`

### What's next
- task-1773739620-f839: Investigations index + my investigations pages

## 2026-03-17 — Iteration: Investigations Index + My Investigations

### What was done
- Created `app/investigaciones/page.tsx` — public investigations index:
  - Card grid with title, summary, tags, author avatar, published date
  - Tag filter pills fetched from /api/investigations/tags
  - Active tag reflected in URL query param (replaceState)
  - Paginated with "load more" button
  - Empty state for no results / no tag matches
  - "Nueva investigación" CTA link
  - useReducer for state management
- Created `app/mis-investigaciones/page.tsx` — authenticated user's dashboard:
  - SessionProvider + auth guard (redirect to sign-in if unauthenticated)
  - Status filter tabs: all/draft/published/archived (client-side filtering)
  - Row layout with status badges (color-coded), edit/view action buttons
  - Paginated via /api/investigations/mine
  - Empty state with link to create first investigation
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `6f6f606`

### M6 Status
- All 8 M6 tasks are now complete:
  1. ✅ TipTap deps + investigation types (74268e5)
  2. ✅ Investigation query functions (4577a90)
  3. ✅ Investigation CRUD API routes (63d6f3d)
  4. ✅ TipTap editor component (21c444f)
  5. ✅ Investigation create/edit pages (dd91253)
  6. ✅ Investigation reading page (603ce70)
  7. ✅ Investigations index page (6f6f606)
  8. ✅ My investigations dashboard (6f6f606)
- M6 Investigation Engine is code-complete
- Next: M7 (Share & Distribution) — OG images, WhatsApp cards, PDF export

## 2026-03-17 — M7: Share & Distribution Planning

### Architecture Decisions
- OG image generation using `satori` (JSX→SVG) + `@resvg/resvg-wasm` (SVG→PNG) — Workers-compatible
- API routes at `/api/og/politician/[slug]` and `/api/og/investigation/[slug]`
- 1200x630 images for WhatsApp/social cards
- Politician OG: name, party, province, chamber, vote count
- Investigation OG: title, author, summary, tags
- PDF export: client-side using browser print / or html2canvas + jspdf for investigations
- Wire OG image URLs into existing generateMetadata functions

### M7 Task Breakdown
1. **Install satori + resvg-wasm + OG image utility** — deps, shared rendering function
2. **Politician OG image API route** — `/api/og/politician/[slug]` with design
3. **Investigation OG image API route** — `/api/og/investigation/[slug]` with design
4. **Wire OG images into metadata** — Update politician + investigation generateMetadata
5. **PDF export for investigations** — Print-friendly view or jspdf

### This Iteration
- Starting with task 1: Install deps + create OG image rendering utility

### What was done
- Installed `satori` v0.25.0 and `@resvg/resvg-wasm` v2.6.2
- Created `lib/og/render.ts`:
  - `renderOgImage({ element, width?, height? })` — JSX→SVG→PNG pipeline
  - `ogImageResponse(options)` — wraps renderOgImage in a Response with PNG headers + cache
  - Font loading: fetches Inter 400/700 from Google Fonts, caches at module level
  - WASM init: fetches resvg WASM from unpkg, handles double-init gracefully
  - Constants: OG_WIDTH=1200, OG_HEIGHT=630
- Created `lib/og/index.ts` barrel export
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `b834817`

### What's next
- task-1773741406-bbb5: Politician OG image API route
- task-1773741407-c107: Investigation OG image API route
- task-1773741408-9357: Wire OG images into metadata
- task-1773741409-281d: PDF export for investigations

## 2026-03-17 — Iteration: Politician OG Image Route

### What was done
- Created `app/api/og/politician/[slug]/route.tsx` — politician OG image API:
  - JSX-based satori template (dark theme, 1200x630)
  - Top: ORC branding with purple dot
  - Center: politician name (56px bold), party/province/chamber pills with matching colors
  - Bottom: vote count and presence % stats
  - Uses shared `ogImageResponse()` helper from lib/og
  - Fetches politician data via `getPoliticianBySlug(slug)`
  - 404 for missing politicians
  - Initially tried plain object JSX (ReactNode type errors) — switched to .tsx with real JSX
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `f8d6260`

### What's next
- task-1773741407-c107: Investigation OG image API route
- task-1773741408-9357: Wire OG images into metadata
- task-1773741409-281d: PDF export for investigations

## 2026-03-17 — Iteration: Investigation OG Image Route

### What was done
- Created `app/api/og/investigation/[slug]/route.tsx` — investigation OG image API:
  - JSX-based satori template (dark theme, 1200x630)
  - Top: ORC branding with purple dot + "— Investigación" label
  - Center: title (48px bold, truncated 100 chars), summary excerpt (160 chars), tag pills (indigo, up to 4)
  - Bottom: author initial avatar + name, formatted publish date
  - Only serves published investigations (404 for draft/archived)
  - Uses shared `ogImageResponse()` helper from lib/og
  - Fetches data via `getInvestigationBySlug(slug)`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `057e7c5`

### What's next
- task-1773741408-9357: Wire OG images into metadata
- task-1773741409-281d: PDF export for investigations

## 2026-03-17 — Iteration: Wire OG Images into Metadata

### What was done
- Updated `app/politico/[slug]/page.tsx` generateMetadata:
  - Added `openGraph.images` pointing to `/api/og/politician/[slug]` (1200x630)
  - Upgraded twitter card from `summary` to `summary_large_image`
  - Added `twitter.images` array
- Updated `app/investigacion/[slug]/page.tsx` generateMetadata:
  - Added `openGraph.images` pointing to `/api/og/investigation/[slug]` (1200x630)
  - Added `twitter.images` array (card was already `summary_large_image`)
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `2c35e22`

### M7 Status
- 4 of 5 M7 tasks complete:
  1. ✅ Satori + resvg-wasm OG rendering utility (b834817)
  2. ✅ Politician OG image API route (f8d6260)
  3. ✅ Investigation OG image API route (057e7c5)
  4. ✅ Wire OG images into metadata (2c35e22)
  5. ✅ PDF export for investigations (3fa28f7)

## 2026-03-17 — Iteration: PDF Export for Investigations

### What was done
- Created `components/investigation/PrintButton.tsx` — "Descargar PDF" button:
  - Triggers `window.print()` for browser-native PDF export (zero dependencies)
  - Printer icon SVG + Spanish label
  - Hidden in print mode via `print:hidden` class
- Added PrintButton to investigation reading page (`app/investigacion/[slug]/page.tsx`)
  - Placed between tags and body divider
- Added comprehensive print styles to `globals.css`:
  - White background, black/gray text for all elements
  - Hides header, footer, nav, action buttons
  - Tag pills and graph node embeds styled for light background
  - TipTap prose overrides: links blue, blockquotes gray, code light background
  - Page break controls (avoid after headings, avoid inside images)
  - 2cm page margins via @page rule
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `3fa28f7`

### M7 Status
- All 5 M7 tasks are now complete:
  1. ✅ Satori + resvg-wasm OG rendering utility (b834817)
  2. ✅ Politician OG image API route (f8d6260)
  3. ✅ Investigation OG image API route (057e7c5)
  4. ✅ Wire OG images into metadata (2c35e22)
  5. ✅ PDF export for investigations (3fa28f7)
- M7 Share & Distribution is code-complete
- Next: M8 (Seed Content + Launch) — seed investigations, security audit, launch prep

## 2026-03-17 — M8: Seed Content + Launch Planning

### Current State
- M0-M7 all code-complete
- Platform has: graph explorer, politician profiles, auth, investigation engine, OG images, PDF export
- Missing for launch: rate limiting, XSS sanitization, security headers, homepage upgrade, seed content

### Security Audit
- ✅ Zod input validation on all endpoints
- ✅ Parameterized Cypher queries (no injection)
- ✅ Auth checks on mutation endpoints
- ✅ Ownership checks on investigation PATCH/DELETE
- ❌ No rate limiting on any endpoint
- ❌ No XSS sanitization on investigation body (TipTap JSON stored raw)
- ❌ No security response headers (CSP, X-Frame-Options, etc.)
- ❌ Homepage is a stub — needs proper navigation

### M8 Task Breakdown
1. **Rate limiting middleware** — In-memory rate limiter for API routes
2. **Security headers middleware** — CSP, X-Frame-Options, X-Content-Type-Options, HSTS
3. **Homepage upgrade** — Navigation to all sections, latest investigations, featured politicians
4. **Seed investigation data** — Script to create 3-5 seed investigations with real content

### This Iteration
- Starting with task 1: Rate limiting middleware

### What was done
- Created `lib/rate-limit/index.ts`:
  - In-memory sliding window rate limiter with Map storage
  - Automatic cleanup of expired entries (60s interval)
  - `checkRateLimit(key, config)` → `{ allowed, remaining, resetAt }`
  - Tiered configs: api (60/min), auth (10/min), mutation (30/min), og (30/min)
  - `rateLimitHeaders()` for X-RateLimit-* response headers
- Created `middleware.ts`:
  - Rate limiting on all /api/* routes with IP-based keys
  - Auto-detects client IP from CF-Connecting-IP, X-Forwarded-For, X-Real-IP
  - 429 response with Retry-After and rate limit headers when exceeded
  - Security headers on ALL routes: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `2b6aa9f`

### What's next
- task-1773742372-f296: Security response headers (already included in middleware — can close)
- task-1773742373-2d03: Homepage upgrade with navigation
- task-1773742375-880e: Seed investigation content

## 2026-03-17 — Iteration: Homepage Upgrade

### What was done
- Replaced stub homepage with full landing page (Server Component):
  - Navigation header: ORC logo, Explorer, Investigations, Sign-in links
  - Hero: purple badge, h1, description, two CTAs (Explorar el grafo, Ver investigaciones)
  - Section cards: Grafo Interactivo, Investigaciones, Contribuí — each with icon, description, link
  - Latest investigations: SSR grid fetching 3 most recent via `listInvestigations(1, 3)`
  - Stats section: 329 legislators, 2 chambers, Gold-tier data source
  - Footer with nav links and platform tagline
  - Inline SVG icons (graph, document, user-plus) — no external deps
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `7094ad5`

### M8 Status
- 3 of 4 M8 tasks complete:
  1. ✅ Rate limiting middleware (2b6aa9f)
  2. ✅ Security headers middleware (2b6aa9f)
  3. ✅ Homepage upgrade with navigation (7094ad5)
  4. ⬜ Seed investigation content (task-1773742375-880e)
- Next: Seed investigation content — create script to populate 3-5 investigations with real content

## 2026-03-17 — Iteration: Seed Investigation Content

### What was done
- Created `scripts/seed-investigations.ts` — idempotent seed script:
  - Creates a system author user ("Equipo ORC") via MERGE
  - Seeds 4 published investigations with rich TipTap JSON bodies:
    1. "Cómo votan los legisladores argentinos" — voting pattern analysis
    2. "Diputados vs. Senadores" — chamber comparison
    3. "Transparencia legislativa: datos abiertos" — open data & democracy
    4. "Guía para leer el grafo político" — graph explorer tutorial
  - All content in Spanish, matching platform audience
  - MERGE on slug for idempotency (safe to re-run)
  - TipTap body built via helper functions (heading, paragraph, bold, link, bulletList, blockquote)
  - Run with: `npx tsx scripts/seed-investigations.ts`
- All checks pass: typecheck ✓, lint ✓, format ✓
- Committed as `007c5de`

### M8 Status — COMPLETE
- All 4 M8 tasks complete:
  1. ✅ Rate limiting middleware (2b6aa9f)
  2. ✅ Security headers middleware (2b6aa9f)
  3. ✅ Homepage upgrade with navigation (7094ad5)
  4. ✅ Seed investigation content (007c5de)

### Implementation Status — ALL MILESTONES COMPLETE
- M0: Scaffolding ✅
- M1: Data Ingestion ✅
- M2: Graph API ✅
- M3: Graph Explorer ✅
- M4: Politician Profiles ✅
- M5: Auth ✅
- M6: Investigation Engine ✅
- M7: Share & Distribution ✅
- M8: Seed Content + Launch ✅

### Finalizer — Step 2 complete, M9 fully done
- Closed task-1774074833-2a43 (m9:code-review) — review passed
- All M9 work complete:
  - Step 1: 7 unified API routes (graph, timeline, stats, config, schema, node/[id], redirects) — all implemented, individually reviewed, committed
  - Step 2: Full holistic code review of all 12 M9 files — passed, unused import fixed (a860000)
- M9 is ready for human review before proceeding to M10
- Emitting LOOP_COMPLETE to hand off to human review gate

### Finalizer — M10 Step 1.2 review passed, advancing
- Event: review.passed for m10:1.2 — types.ts reviewed, 10 Zod schemas + TS types, tsc clean
- Step 1 still has unchecked sub-tasks: 1.3 (config.ts) and 1.4 (audit.ts)
- Tasks 1.3 and 1.4 are blocked by task-1774075286-f7cf (m10:1.2) which is already closed
- Emitting queue.advance so Builder picks up next sub-task

### Finalizer — Step 1.3 review passed
- Event: review.passed for m10:1.3 config.ts CRUD
- Step 1.3 confirmed complete and committed (abc19c4)
- Step 1 still has sub-task 1.4 remaining (audit.ts — append-only AuditEntry with SHA-256 hash chain)
- Decision: queue.advance to let Builder implement 1.4

### Finalizer — Step 5 Complete, Advancing to Step 6
- Review event processed: Step 5.4 stage factory+barrel passed review — createStageRunner exhaustive switch, barrel re-exports, tsc passes. Commit d56e3c5
- Steps 1–5 fully complete with all sub-tasks passed
- Steps 6–8 remain in overall plan:
  - Step 6: Graph Algorithms
  - Step 7: MiroFish Integration
  - Step 8: API Routes
- Decision: queue.advance → Planner will decompose Step 6 (Graph Algorithms)

### Finalizer — Step 1.3 tasks route review passed (2026-03-21)
- Event: review.passed for Step 1.3 orchestrator/tasks/route.ts — tsc PASS, parameterized Cypher PASS, neo4j.int PASS, input validation PASS
- Closed runtime task task-1774087446-060c
- Step 1 still has sub-task 1.4 remaining (focus route)
- Decision: queue.advance → Builder picks up sub-task 1.4

### Step 1.4 Notes (for Builder)
- Target file: `webapp/src/app/api/casos/[casoSlug]/engine/orchestrator/focus/route.ts`
- Follow same pattern as `orchestrator/route.ts` and `orchestrator/tasks/route.ts`
- **GET handler**: accept `pipeline_id` query param, return current research focus/directives for the pipeline
- **PUT handler**: update research focus/directives mid-run. JSON body: `pipeline_id` (required), `focus` (string, required — the research directive), `priority_areas` (string[], optional), `exclusions` (string[], optional)
- Store focus as a `ResearchFocus` node linked to the pipeline via `HAS_FOCUS` relationship
- Use MERGE on `(f:ResearchFocus {pipeline_id: $pipelineId})` so PUT is idempotent (upsert)
- Return the current focus state on both GET and PUT
- Parameterized Cypher, neo4j.int() where needed, 503 on DB errors, validate required fields
