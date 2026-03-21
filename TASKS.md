# Tasks — Office of Accountability

**Version:** 0.3
**Date:** 2026-03-17
**Stack:** Vinext (App Router) + Neo4j 5 Community + react-force-graph-2d + Cloudflare Workers
**Neo4j transport:** Bolt over WebSocket (neo4j-driver-lite browser/ESM build) — HTTP API as fallback only (deprecated in 5.26)

---

## Milestone 0: Project Scaffolding

**Goal:** Bootable dev environment with Neo4j running, Workers ↔ Neo4j connectivity proven, CI green.

### Setup
- [x] Initialize Vinext app (App Router, TypeScript, Tailwind CSS)
- [x] Set up Docker Compose: Neo4j 5 Community + Vinext dev server
- [x] Create Neo4j schema initialization script (constraints + indexes)
  - Unique constraints: Politician.id, Legislation.expediente_id, LegislativeVote.acta_id
  - Full-text indexes: Politician.name, Legislation.title
  - Inspired by br-acc's `init.cypher` pattern
- [x] Establish project structure:
  ```
  app/              — Vinext App Router pages + API routes
  lib/neo4j/        — Bolt/WS client wrapper, query helpers
  lib/graph/        — Graph data transforms (Neo4j records -> API responses)
  components/       — React components
  etl/              — Data ingestion scripts
  ```
- [x] Create `.env.example` with Neo4j connection config (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
  - NEO4J_URI uses `wss://` scheme for Bolt over WebSocket (e.g., `wss://neo4j.example.com:7688`)
- [x] Add ESLint + Prettier config
- [x] Configure `vinext.config.ts` for Cloudflare Workers deployment

### Neo4j Connectivity Spike (CRITICAL PATH)

Workers run on V8 isolates — no Node.js `net`/`tls` modules. Standard `neo4j-driver` uses TCP sockets and won't work. Three options evaluated:

| Option | Transport | Status | Risk |
|--------|-----------|--------|------|
| **A: neo4j-driver-lite over WebSocket** | Bolt over WS | **Primary — validate first** | Browser build may need polyfills in Workers |
| B: Neo4j HTTP API | HTTP fetch() | Fallback only | Deprecated in Neo4j 5.26, will be removed |
| C: Workers TCP connect() + Bolt | Raw TCP | Rejected | Would require forking driver transport layer |

**Primary path: Option A (Bolt over WebSocket)**

- [x] **SPIKE-1:** neo4j-driver-lite ESM build imports cleanly in Vinext/Workers
  - Install `neo4j-driver-lite` — browser/ESM build uses WebSocket transport
  - Verify: import resolves, no Node.js-only APIs referenced at build time
  - If import fails: identify missing polyfills (likely `globalThis.WebSocket` — Workers have it natively)
- [x] **SPIKE-2:** Neo4j WebSocket listener configuration
  - Enable Bolt over WebSocket on Neo4j instance (Docker + production)
  - Docker Compose: add `NEO4J_server_bolt_listen__address__ws=0.0.0.0:7688` or equivalent config
  - Production (Railway/Fly.io): configure WS listener, expose port, enable TLS
  - Connection URI: `wss://host:7688` for production, `ws://localhost:7688` for dev
- [x] **SPIKE-3:** Round-trip query from Worker → Neo4j via Bolt/WS
  - Deploy minimal Worker with one Cypher query: `RETURN 1 AS ok`
  - Verify: response arrives, latency acceptable (expect 20-80ms edge → Railway)
  - Test multiple queries in single invocation (no connection pool — each invocation opens fresh)
  - Test error case: Neo4j down → Worker returns 503 gracefully
- [x] **SPIKE-4:** Validate Workers constraints don't break driver
  - Workers have 6 simultaneous connections per invocation — each query is 1 connection
  - Workers have 128MB memory — verify driver memory footprint
  - Workers have 30s CPU time — verify query round-trip within budget
  - No persistent state between invocations — driver session must be created per request

**Fallback path: Option B (HTTP API) — only if Option A fails**

- [ ] If Bolt/WS fails: build thin HTTP client (`lib/neo4j/http-fallback.ts`)
  - `POST /db/neo4j/tx/commit` with `fetch()` — parameterized Cypher over JSON
  - Pin Neo4j version below 5.26 (we control the instance)
  - Accept deprecation risk — plan migration to Bolt/WS when driver support improves
  - Track Neo4j HTTP API removal timeline

**Client wrapper (built on whichever transport wins)**

- [x] `lib/neo4j/client.ts` — unified client interface regardless of transport
  - `query(cypher, params)` → typed results
  - `queryGraph(cypher, params)` → `{ nodes, links }` format for react-force-graph-2d
  - Transaction support: read/write transactions per request lifecycle
  - Error handling: connection errors → 503, query errors → 400/500, timeout → 504
  - Retry: single retry on connection drop (Workers invocations are short-lived)
  - Auth: Neo4j credentials from Cloudflare Workers secrets

### Security & Observability (M0)
- [ ] Sentry error monitoring setup (Cloudflare Workers integration)
- [ ] Structured logging (JSON, correlation IDs per request)
- [ ] Neo4j credentials: Cloudflare Workers secrets (not env vars in plaintext)
- [ ] CORS configuration: allowlist production domain only
- [x] Security headers middleware: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`

### CI/CD
- [ ] GitHub Actions: lint, type-check, test on PR
- [ ] GitHub Actions: `vinext deploy` to Cloudflare on merge to main
- [ ] Branch protection: require CI pass before merge

### Verification
- [ ] `docker compose up` → Neo4j healthy (Bolt + WS listeners), schema constraints exist, app loads at localhost:3000
- [ ] Local: `neo4j-driver-lite` connects to Neo4j via `ws://localhost:7688`, runs `RETURN 1 AS ok`
- [ ] Deployed: Worker connects to Neo4j via `wss://`, runs parameterized Cypher query, returns JSON
- [ ] Deployed: Neo4j unreachable → Worker returns `{ error: "Service unavailable" }` with 503
- [ ] Deployed: multiple queries in single invocation succeed (test with 3 sequential queries)
- [ ] `vinext deploy` → deploys to Cloudflare Workers successfully
- [ ] Sentry test event fires from deployed Worker
- [ ] Spike decision documented: which transport won and why

**Dependencies:** None
**Spike exit criteria:** If Option A (Bolt/WS) fails after 2 days of effort, switch to Option B (HTTP API) and document blockers for future revisit.

---

## Milestone 1: Como Voto Data Ingestion

**Goal:** All 329 current legislators with full vote history queryable in Neo4j.

### ETL Pipeline
- [x] ETL script to fetch Como Voto JSON output (`etl/como-voto.ts`)
- [x] Normalize Como Voto data to Neo4j nodes:
  - `Politician` — name, bloc, coalition, chamber, photo_url
  - `LegislativeVote` — acta_id, date, position (afirmativo/negativo/abstencion/ausente)
  - `Legislation` — title, expediente_id, status, chamber
  - `Jurisdiction` — level, name (province)
- [x] Create relationships:
  - `(:Politician)-[:CAST_VOTE]->(:LegislativeVote)`
  - `(:LegislativeVote)-[:ON_LEGISLATION]->(:Legislation)`
  - `(:Politician)-[:REPRESENTS]->(:Jurisdiction)`
- [x] Data validation: reject malformed records, log warnings with line/record context
- [x] Deduplication: match politicians across chambers/sessions by name + jurisdiction
- [x] Seed script: `npm run seed` — one-command full ingestion

### Security
- [x] ETL runs locally or in CI — never from Workers (no user input path)
- [x] Sanitize all string fields before Neo4j insertion (prevent Cypher injection via data)
- [x] Validate Como Voto JSON schema with Zod before processing

### Verification
- [ ] 329 Politician nodes (257 Diputados + 72 Senadores)
- [ ] Every Politician has at least one `CAST_VOTE` relationship
- [ ] Every LegislativeVote has exactly one `ON_LEGISLATION` relationship
- [ ] Every Politician has exactly one `REPRESENTS` relationship to a Jurisdiction
- [ ] No orphan nodes (votes without legislation, politicians without jurisdiction)
- [ ] Idempotency: run `npm run seed` twice → same node count, no duplicates
- [ ] `MATCH (p:Politician)-[:CAST_VOTE]->(v)-[:ON_LEGISLATION]->(l) RETURN p.name, v.position, l.title LIMIT 10` → returns results

**Dependencies:** Milestone 0

---

## Milestone 2: Graph API Layer

**Goal:** API routes that serve graph data in a format compatible with react-force-graph-2d.

### Neo4j Client
- [x] Typed query helpers built on M0 client wrapper (`lib/neo4j/queries.ts`)
- [x] Graph response transformer: Neo4j records → `{ nodes, links }` for react-force-graph-2d
  - Nodes: `{ id, label, type, properties }`
  - Links: `{ source, target, type, properties }`

### API Routes
- [x] `GET /api/graph/node/[id]` — single node + 1-hop connections
- [x] `GET /api/graph/expand/[id]?depth=1` — expand connections (configurable depth, default 1, max 3)
- [x] `GET /api/graph/search?q=` — full-text search across Politician.name, Legislation.title
- [x] `GET /api/graph/query` — structured graph queries (node type filters, date range, jurisdiction)
- [x] Cursor-based pagination on search and query endpoints

### Security & Rate Limiting
- [x] Input validation with Zod on all query parameters
- [x] Depth parameter clamped to max 3 (prevent expensive traversals)
- [x] Query timeout: 5s max per Neo4j query (prevent graph bombs)
- [x] Rate limiting via Cloudflare Rate Limiting Rules:
  - Read endpoints: 60 req/min per IP
  - Search endpoint: 30 req/min per IP (heavier query)
- [x] Error handling: structured error responses, no Neo4j internals leaked
- [x] Node ID validation: reject non-UUID/non-integer IDs before query
- [x] Response size cap: max 500 nodes per response (prevent memory exhaustion)

### Verification
- [x] `GET /api/graph/node/{politician_id}` → returns node + connections in `{ nodes, links }` format
- [x] `GET /api/graph/expand/{id}?depth=2` → returns 2-hop neighborhood (51 nodes, 50 links)
- [x] `GET /api/graph/expand/{id}?depth=5` → returns 400 "must be integer 1-3" (rejects out-of-range depth)
- [x] `GET /api/graph/search?q=cristina` → returns 20 fuzzy matches
- [x] `GET /api/graph/search?q=` (empty) → returns 400 with structured error
- [x] `GET /api/graph/node/nonexistent` → returns 404 with structured error
- [x] 100+ requests in 1 minute → returns 429 (rate limit at 60 req/min per IP)
- [x] Malformed query params → 400, not 500
- [x] Neo4j down → graceful 503 "Database unavailable", no stack trace leaked

**Dependencies:** Milestone 1

---

## Milestone 3: Graph Explorer (Frontend)

**Goal:** Interactive graph visualization — click a politician, see connections fan out.

*Can run in parallel with Milestone 4.*

### Graph Canvas
- [x] react-force-graph-2d integration (following br-acc's GraphCanvas pattern)
- [x] Node rendering by type — distinct colors, sizes, labels per node type:
  - Politician (blue, large), LegislativeVote (green/red by position), Legislation (purple), Jurisdiction (gray)
  - Follow br-acc's `nodeRendering.ts` pattern
- [x] Edge rendering by relationship type (line style, color, label)
- [x] Click-to-expand: click a node → fetch + display 1-hop connections
- [x] Node tooltip on hover: key properties (name, party, province for Politician; title, date for Vote)

### Controls & Navigation
- [x] Filter sidebar: filter by node type (checkboxes), date range (for votes/legislation)
- [x] Zoom controls + minimap for orientation
- [x] Search bar with autocomplete (hits `/api/graph/search`)
- [x] Keyboard navigation: Tab between nodes, Enter to expand, Escape to deselect
- [x] Loading states + empty states

### Mobile
- [x] Mobile-responsive layout (graph fills viewport, sidebar collapses to bottom sheet)
- [x] Touch: pinch-to-zoom, tap-to-select, long-press for tooltip

### Security
- [x] Sanitize all node labels/properties before rendering (prevent stored XSS via graph data)
- [x] CSP: restrict script sources, disallow inline scripts

### Verification (E2E)
- [x] Load `/explorar` → graph canvas renders with nodes visible
- [x] Click politician node → triggers expand API call → new nodes appear
- [x] Type in search bar → autocomplete dropdown appears → select result → graph centers on node
- [x] Toggle node type filter off → those nodes disappear from canvas
- [x] Mobile viewport (375px) → sidebar collapses to bottom sheet, graph is interactive
- [x] Tab navigation: can reach and expand nodes via keyboard only

**Dependencies:** Milestone 2

---

## Milestone 4: Politician Profiles (SEO)

**Goal:** Server-rendered politician pages that rank in Google for "[politician name] votaciones".

*Can run in parallel with Milestone 3.*

### Pages
- [x] Page route: `/politico/[slug]` — server-rendered with Server Components, ISR via Cloudflare KV
- [x] Slug generation: normalize name to URL-safe slug (handle accents, spaces)
- [x] Graph sub-view: react-force-graph-2d centered on the politician node (1-hop)
- [x] Tabs layout:
  - **Conexiones** — graph sub-view (default)
  - **Votaciones** — vote history table
  - **Investigaciones** — empty state until M6 ("Proximamente")
- [x] Vote history: filterable by date/legislation, paginated, color-coded by position
  - Afirmativo (green), Negativo (red), Abstencion (yellow), Ausente (gray)
- [x] Province-first browse page: `/provincias/[province]` — list politicians by province
- [x] Fuzzy search with accent handling (e.g., "Cristina" matches "Cristina Fernandez")
- [x] Breadcrumb navigation: Home > Provincia > Politician

### SEO
- [x] Schema.org structured data: `Person` + `GovernmentOrganization`
- [x] OG tags: auto-generated per politician (name, party, province, photo)
- [x] `sitemap.xml` generation: all politician slugs + province pages
- [x] Canonical URLs to prevent duplicate content

### Security
- [x] Slug validation: reject traversal attempts (`../`, encoded slashes)
- [x] ISR cache: set appropriate `stale-while-revalidate` — no serving stale data indefinitely
- [x] Sanitize all politician data before HTML rendering (prevent stored XSS)

### Verification
- [x] `GET /politico/fernandez-de-kirchner-cristina` → 200, contains Schema.org JSON-LD
- [x] `GET /politico/nonexistent-slug` → 404 page
- [x] `curl /politico/fernandez-de-kirchner-cristina` → HTML contains politician name in body (server-rendered, not client-only)
- [x] OG tags present: `og:title`, `og:image`, `og:description`
- [x] Vote history tab: API returns 830 votes paginated (20/page), hasMore=true
- [x] `/provincias/buenos-aires` → lists all Buenos Aires politicians
- [x] `/sitemap.xml` → contains 2257 politician URLs
- [x] `/politico/../../etc/passwd` → 404, not error

**Dependencies:** Milestone 2

---

## Milestone 5: User Accounts + Auth

**Goal:** Users can register, log in, and own content. Auth in place before investigation engine.

### Auth Setup
- [x] Auth.js setup: email + password provider (credentials)
- [x] Optional social login (Google OAuth)
- [x] User registration with email verification
- [x] User profile page (`/perfil`)
- [x] Role system:
  - `observador` — no account, read-only (default)
  - `participante` — registered user, can create investigations

### Security
- [x] Password hashing: bcrypt with cost factor >= 12
- [x] Session tokens: HTTP-only, Secure, SameSite=Lax cookies
- [x] CSRF protection on all state-changing endpoints
- [x] Rate limiting on auth endpoints:
  - Login: 5 attempts/min per IP, 10 attempts/hour per email
  - Registration: 3 accounts/hour per IP
  - Password reset: 3 requests/hour per email
- [x] Account lockout: temporary lock after 10 failed login attempts (15min lockout, counter resets on success or expiry)
- [x] Email verification tokens: expire after 24h, single-use
- [x] Password requirements: min 8 chars, check against breached password list (haveibeenpwned k-anonymity API)
- [x] Auth middleware: protect all mutation API routes
- [x] Session expiry: 7 days idle, 30 days absolute
- [x] Secure password reset flow: time-constant token comparison, expire on use

### Verification
- [x] Register with email → verification email sent → verify → can log in
- [x] Login with correct credentials → session cookie set (HTTP-only, Secure)
- [x] Login with wrong password → generic error ("Invalid credentials"), no user enumeration
- [x] 6th login attempt in 1 minute → 429, account not locked yet
- [x] 11th failed attempt → temporary account lockout
- [x] Unauthenticated `POST /api/investigations` → 401
- [x] Expired session → 401, redirect to login
- [x] CSRF: POST without token → 403
- [x] Registration from same IP 4 times in 1 hour → 429

**Dependencies:** Milestone 0

---

## Milestone 6: Investigation Engine

**Goal:** Users can create, publish, and read investigations that embed graph data.

### Data Model
- [x] Neo4j `Investigation` node: title, slug, body (TipTap JSON), status (draft/published), author_id, tags, referenced_node_ids, created_at, updated_at

### API Routes
- [x] `GET /api/investigations` — list published investigations (paginated, filterable by tag)
- [x] `GET /api/investigations/[slug]` — get single investigation by slug (public)
- [x] `POST /api/investigations` — create investigation (authenticated)
- [x] `PATCH /api/investigations/[id]` — update investigation (author only)
- [x] `DELETE /api/investigations/[id]` — delete investigation (author only, drafts immediate, published require confirm)
- [x] Input validation with Zod on all mutation routes
- [x] On publish: create `(:Investigation)-[:REFERENCES]->(node)` edges for all embedded nodes

### TipTap Editor
- [x] Base TipTap editor: headings, lists, links, images, blockquotes
- [x] Custom extension: **Graph node embed** — renders as interactive card showing node properties
- [x] Custom extension: **Sub-graph embed** — renders react-force-graph-2d inline within the document
- [x] Custom extension: **Edge/relationship citation** — inline reference with provenance tooltip

### Reading Experience
- [x] Page route: `/investigacion/[slug]` — server-rendered for SEO
- [x] Beautiful typography, mobile-first layout
- [x] Embedded graph nodes are interactive (click to navigate to node/profile)
- [x] OG tags with investigation title + summary

### Index Page
- [x] Page route: `/investigaciones` — grid/list of published investigations
- [x] Filter by tag, sort by date
- [x] Investigation cards: title, author, date, tag badges, excerpt

### Cross-linking
- [x] Investigations appear on politician profile pages (Investigations tab) when they reference that politician
- [x] "My investigations" dashboard (`/mis-investigaciones`) — drafts + published

### Security & Rate Limiting
- [x] Authorization: only author can edit/delete their own investigations
- [x] TipTap content sanitization: strip dangerous HTML, validate embed node IDs exist
- [x] Embedded node IDs: validate against Neo4j before saving (prevent phantom references)
- [x] Rate limiting on mutations:
  - Create: 10 investigations/hour per user
  - Update: 60 updates/hour per user
- [x] Body size limit: 500KB max per investigation (prevent storage abuse)
- [x] Slug generation: sanitize, deduplicate (append `-2`, `-3` on collision)
- [x] Image uploads: validate MIME type, max 5MB, scan for embedded scripts

### Verification
- [x] Create investigation with graph node embeds → saves TipTap JSON to Neo4j
- [x] Publish investigation → `REFERENCES` edges created for all embedded nodes
- [x] `GET /investigacion/[slug]` → server-rendered HTML contains embedded node data
- [x] Embedded graph node card → clicking navigates to `/politico/[slug]`
- [x] `/investigaciones` → lists only published investigations, not drafts
- [x] Author edits own investigation → 200
- [x] Other user edits same investigation → 403
- [x] Author deletes own draft → 200, node removed
- [x] Delete published investigation → confirmation required
- [x] Investigation references politician → appears on politician's Investigations tab
- [x] `/mis-investigaciones` → shows only current user's investigations
- [x] TipTap body with `<script>` tag → stripped on save
- [x] Embed with non-existent node ID → rejected with 400
- [x] 11th investigation created in 1 hour → 429

**Dependencies:** Milestones 2, 3 (for graph embeds), 5 (for auth)

---

## Milestone 7: Share & Distribution

**Goal:** Every page on the platform shares beautifully on WhatsApp and social media.

### Share Cards
- [x] WhatsApp-optimized share cards (1200x630, auto-generated):
  - Per investigation: title + graph snippet + key finding
  - Per politician: photo + name + party + key stats
  - Per vote: legislator photo + vote position + legislation title
- [x] OG tag generation for every shareable URL
- [x] "Compartir por WhatsApp" first-class button on every page

### Export
- [x] Share link with preview for investigations
- [x] PDF export for investigations (following br-acc's pattern)
  - Export as clean PDF with embedded graph snapshots
  - Include provenance footer on every page

### Security & Rate Limiting
- [x] OG image generation: rate limit 30 req/min per IP (image generation is CPU-heavy)
- [x] PDF export: rate limit 5 exports/hour per user (N/A — client-side window.print(), no server endpoint)
- [x] OG image: validate slug input, reject path traversal
- [x] PDF: sanitize investigation content before rendering (N/A — client-side print; TipTap sanitize.ts strips scripts on save)
- [x] Share URLs: no auth tokens or session data in shareable links

### Verification
- [x] OG image endpoint → returns 1200x630 PNG for politician, investigation, vote
- [x] WhatsApp: share URL → preview card renders correctly (test with og-image debugger)
- [x] PDF export → contains investigation text + graph snapshot images + provenance footer
- [x] Share link for published investigation → opens without auth
- [x] Share link for draft investigation → 404 (not 403, no information leak)
- [x] 31st OG image request in 1 minute → 429

**Dependencies:** Milestones 4, 6

---

## Milestone 8: Seed Content + Launch

**Goal:** Platform launches with compelling seed investigations and open registration.

### Seed Content
- [x] Author 3-5 seed investigations using ingested data:
  - "Quienes votan siempre juntos a pesar de estar en partidos diferentes?" — voting bloc analysis
  - "Promesas vs. votos" — promise alignment (requires manual promise data entry for 2-3 politicians)
  - Cross-party voting pattern analysis (achievable with existing Como Voto data)
- [ ] Manual data entry: 10-15 promises for 2-3 high-profile politicians (for seed investigation)

### Pre-Launch
- [ ] Internal review and polish: test all flows end-to-end
- [ ] Performance audit: Lighthouse scores > 80 on politician profiles, graph rendering < 2s for 200 nodes
- [ ] Pre-launch: recruit 2-3 anchor investigators (journalists, NGO analysts)

### Security Audit
- [x] Dependency audit: `npm audit`, no critical/high vulnerabilities
- [x] Secret scan: no API keys, passwords, or tokens in repo (use `gitleaks` or equivalent)
- [ ] Penetration test: auth bypass, IDOR on investigations, Cypher injection via search, XSS via graph data
- [ ] Cloudflare WAF rules: block common attack patterns (SQLi, path traversal, etc.)
- [ ] Rate limiting review: all endpoints have appropriate limits
- [ ] Privacy: no PII in logs, no tracking cookies, analytics is privacy-respecting

### Launch Checklist
- [ ] All seed investigations published
- [ ] Registration flow working end-to-end
- [ ] OG tags verified on WhatsApp, Twitter, Facebook
- [ ] Mobile experience tested on Android + iOS (375px, 414px viewports)
- [ ] Error monitoring live (Sentry)
- [ ] Analytics live (Plausible or Umami — privacy-respecting, no cookies)
- [ ] Backup strategy: Neo4j dump scheduled, tested restore
- [ ] Incident response: on-call contact, rollback procedure documented

### Verification (Full E2E)
- [ ] Register → create investigation → embed politician → publish → view on `/investigaciones`
- [ ] Share investigation on WhatsApp → friend opens link → sees server-rendered investigation
- [ ] Visit `/politico/[slug]` → see Investigations tab with linked investigation
- [ ] Search for politician → navigate to profile → explore graph → return to profile
- [ ] Mobile: full flow on 375px viewport
- [ ] All seed investigations render correctly with embedded graph data
- [ ] Lighthouse: performance > 80, accessibility > 90, SEO > 90

**Dependencies:** All previous milestones

---

## Milestone 9: Investigation Standardization

**Goal:** Standardize three investigations (Caso Libra, Caso Finanzas Politicas, Caso Epstein) under a unified Neo4j-native config and data model with generic labels, `caso_slug` namespace isolation, unified API routes, and schema-driven frontend.

### Current State (as of 2026-03-21)

| Investigation | Backend | Neo4j Labels | Queries | Static Data | Seed Script | API Routes |
|---|---|---|---|---|---|---|
| **Caso Libra** | `lib/caso-libra/` (6 files: types, queries, transform, index, investigation-data, investigation-schema) | `CasoLibra*` prefixed labels (CasoLibraPerson, CasoLibraEvent, etc.) with unique constraints | Full Cypher using CasoLibra* labels | `investigation-data.ts` (103KB — chapters, government responses, editorial content) | `seed-caso-libra.ts` (26KB, CasoLibra* labels) | 8 routes at `/api/caso-libra/*` (graph, person, document, wallets, investigation, simulate) |
| **Caso Finanzas Politicas** | `lib/caso-finanzas-politicas/` (1 file only) | No investigation-specific nodes in Neo4j | No queries.ts — purely client-side | `investigation-data.ts` (48KB — FACTCHECK_ITEMS, TIMELINE_EVENTS, ACTORS, MONEY_FLOWS, IMPACT_STATS) | None | 1 route at `/api/caso/finanzas-politicas/graph/` (queries platform labels, not investigation-specific) |
| **Caso Epstein** | `lib/caso-epstein/` (5 files: types, queries, transform, index, investigation-data) | Generic labels (Person, Event, Document, Location, Flight, Organization, LegalCase) with `caso_slug: "caso-epstein"` | Full Cypher using generic labels + `WHERE n.caso_slug = $casoSlug` | `investigation-data.ts` (130KB — chapters, editorial content) | `seed-caso-epstein.ts` (80KB, generic labels + caso_slug) | 6 routes at `/api/caso/[slug]/*` (graph, flights, proximity, simulation) |

**Key observations:**
- Caso Epstein already follows the target pattern (generic labels + `caso_slug`) — migration is about Libra + Finanzas Politicas alignment and creating the unified infrastructure
- Caso Libra has the most mature backend (Zod submission schemas, 8 API routes, typed queries) but uses the old `CasoLibra*` label prefix
- Caso Finanzas Politicas has no Neo4j backend — all data is static TypeScript arrays
- Neo4j schema (`lib/neo4j/schema.ts`) has CasoLibra* constraints but no generic label constraints or `caso_slug` range indexes
- No `lib/investigations/` directory exists — query builder, registry, config, types all need creation
- No `/api/casos/` unified API exists — current routes split between `/api/caso-libra/*` and `/api/caso/[slug]/*`
- Graph constants (`lib/graph/constants.ts`) have Epstein labels (Person, Flight, etc.) but NOT CasoLibra labels or the new types (ShellCompany, Aircraft, Token, Wallet, Claim, MoneyFlow, GovernmentAction)

### Data Model

Each investigation gets an `InvestigationConfig` node plus its schema subgraph:

```
(InvestigationConfig {id, name, caso_slug, status})
  -[:HAS_SCHEMA]-> (SchemaDefinition {id})
    -[:DEFINES_NODE_TYPE]-> (NodeTypeDefinition {name, properties_json, color, icon})
    -[:DEFINES_REL_TYPE]-> (RelTypeDefinition {name, from_types, to_types})
```

**InvestigationConfig structure:**
```typescript
interface InvestigationConfig {
  id: string           // "caso-libra", "caso-finanzas-politicas", "caso-epstein"
  name: string
  description: string
  caso_slug: string    // Namespace key — matches caso_slug on all data nodes
  status: 'active' | 'draft' | 'archived'
  created_at: string
  tags: string[]
}
```

**Generic labels with caso_slug:** All investigation data nodes use generic labels with a `caso_slug` property for namespace isolation. All queries filter by `WHERE n.caso_slug = $casoSlug`.

| Before (Caso Libra) | After |
|---|---|
| `CasoLibraPerson {id: "cl-person-milei"}` | `Person {id: "caso-libra:cl-person-milei", caso_slug: "caso-libra"}` |
| `CasoLibraEvent {id: "cl-event-launch"}` | `Event {id: "caso-libra:cl-event-launch", caso_slug: "caso-libra"}` |
| `CasoLibraDocument {id: "cl-doc-filing"}` | `Document {id: "caso-libra:cl-doc-filing", caso_slug: "caso-libra"}` |
| `CasoLibraOrganization {id: "cl-org-kip"}` | `Organization {id: "caso-libra:cl-org-kip", caso_slug: "caso-libra"}` |
| `CasoLibraToken {id: "cl-token-libra"}` | `Token {id: "caso-libra:cl-token-libra", caso_slug: "caso-libra"}` |
| `CasoLibraWallet {address: "abc123"}` | `Wallet {id: "caso-libra:abc123", caso_slug: "caso-libra", address: "abc123"}` |

**ID strategy:** Neo4j Community Edition has no composite uniqueness constraints. Node IDs are prefixed: `{caso_slug}:{local_id}`. Helper: `casoNodeId(casoSlug, localId) => \`${casoSlug}:${localId}\``.

**Platform data untouched:** Existing platform labels (`Politician`, `Legislation`, `LegislativeVote`, `Party`, `Province`, `Investigation`, `User`) have no `caso_slug` — they are platform-wide reference data.

### Schema Definitions per Investigation

**Caso Libra (`caso_slug: "caso-libra"`):**

Node types: `Person` (id, name, slug, role, description, photo_url, nationality), `Organization` (id, name, slug, org_type, description, country), `Token` (id, symbol, name, contract_address, chain, launch_date, peak_market_cap), `Event` (id, title, slug, description, date, source_url, event_type), `Document` (id, title, slug, doc_type, summary, source_url, date_published), `Wallet` (id, address, label, owner_id, chain), `GovernmentAction` (id, date, action_es, action_en, effect_es, effect_en, source, source_url)

Relationship types: `CONTROLS` (Person→Wallet), `SENT` (Wallet→Wallet, hash/amount_usd/amount_sol/timestamp), `COMMUNICATED_WITH` (Person→Person, date/medium), `MET_WITH` (Person→Person, date/location), `PARTICIPATED_IN` (Person→Event), `DOCUMENTED_BY` (Event→Document), `MENTIONS` (Document→Person/Org/Token), `PROMOTED` (Person→Token), `CREATED_BY` (Token→Organization), `AFFILIATED_WITH` (Person→Organization)

**Caso Finanzas Politicas (`caso_slug: "caso-finanzas-politicas"`):**

Only narrative investigation data migrated. Platform-graph visualization route (`/api/caso/finanzas-politicas/graph/`) stays as-is — queries platform labels.

Node types: `Person` (id, name, slug, role_es, role_en, description_es, description_en, party, datasets), `Organization` (id, name, slug, type, jurisdiction, incorporation_date), `Event` (id, date, title_es, title_en, description_es, description_en, category, sources), `MoneyFlow` (id, from_label, to_label, amount_ars, description_es, description_en, date, source, source_url), `Claim` (id, claim_es, claim_en, status, tier, source, source_url, detail_es, detail_en)

Relationship types: `OFFICER_OF` (Person→Organization, role/since), `SUBJECT_OF` (Person→Claim), `INVOLVED_IN` (Person→Event), `SOURCE_OF` (MoneyFlow→Person/Org), `DESTINATION_OF` (MoneyFlow→Person/Org)

**Caso Epstein (`caso_slug: "caso-epstein"`):**

Sourced from `_ingestion_data/rhowardstone/` — `knowledge_graph_entities.json` (606 entities), `knowledge_graph_relationships.json` (2,302 relationships), `persons_registry.json` (1,614 persons).

Node types: `Person` (~1,614 merged KG + registry; id, name, slug, aliases, category, entity_type, occupation, legal_status, mention_count, search_terms, sources), `Organization` (9; id, name, slug, aliases, entity_type, metadata), `ShellCompany` (12; id, name, slug, aliases, entity_type, metadata), `Location` (3; id, name, slug, aliases, entity_type, metadata), `Aircraft` (4; id, name, slug, aliases, entity_type, metadata)

Relationship types (10): `ASSOCIATED_WITH`, `COMMUNICATED_WITH`, `TRAVELED_WITH`, `EMPLOYED_BY`, `VICTIM_OF`, `PAID_BY`, `REPRESENTED_BY`, `RECRUITED_BY`, `RELATED_TO`, `OWNED_BY` — all carry weight + optional date_range.

**Victim safeguard:** Any `Person` node that is the source of a `VICTIM_OF` relationship → pseudonymized (`Jane Doe #N` / `John Doe #N`), identifying details stripped. Original name NOT stored in Neo4j.

**Persons registry merge strategy:** 1) Import KG person entities first (stable integer IDs, relationship references). 2) For each registry entry, attempt name match against KG (case-insensitive, alias-aware). 3) If matched: enrich existing KG node with registry fields (slug, category, search_terms, sources). 4) If unmatched: create new Person node. Produces ~1,614 Person nodes.

### InvestigationClientConfig Contract

Each investigation exports a static config for frontend rendering:

```typescript
interface BilingualText { es: string; en: string }

interface InvestigationClientConfig {
  casoSlug: string
  name: BilingualText
  description: BilingualText
  tabs: TabId[]
  features: {
    wallets: boolean        // enables /dinero page
    simulation: boolean     // enables /simular page
    flights: boolean        // enables /vuelos page
    submissions: boolean    // enables evidence submission form
    platformGraph: boolean  // enables /conexiones page
  }
  hero: { title: BilingualText; subtitle: BilingualText }
  chapters?: NarrativeChapter[]  // for /resumen page
  sources?: Array<{ name: string; url: string }>
}

interface NarrativeChapter {
  id: string
  title: BilingualText
  paragraphs: BilingualText[]
  pullQuote?: BilingualText
  citations?: Array<{ id: number; text: string; url?: string }>
}

type TabId = 'resumen' | 'investigacion' | 'cronologia' | 'evidencia' | 'grafo'
           | 'dinero' | 'simular' | 'vuelos' | 'proximidad' | 'conexiones'
```

Feature flags determine conditional page rendering:

| Flag | Page | Investigations |
|---|---|---|
| `wallets` | `/dinero` | caso-libra |
| `simulation` | `/simular` | caso-libra |
| `flights` | `/vuelos` | caso-epstein |
| `submissions` | form on `/investigacion` | caso-libra |
| `platformGraph` | `/conexiones` | caso-finanzas-politicas |

### Query Builder Interface

```typescript
interface InvestigationQueryBuilder {
  getGraph(casoSlug: string): Promise<GraphData>
  getNodesByType(casoSlug: string, nodeType: string, opts?: PaginationOpts): Promise<InvestigationNode[]>
  getNodeBySlug(casoSlug: string, nodeType: string, slug: string): Promise<InvestigationNode | null>
  getNodeConnections(casoSlug: string, nodeId: string, depth?: number): Promise<GraphData>
  getTimeline(casoSlug: string): Promise<TimelineItem[]>
  getStats(casoSlug: string): Promise<InvestigationStats>
  getConfig(casoSlug: string): Promise<InvestigationConfig>
  getSchema(casoSlug: string): Promise<InvestigationSchema>
  getNodeTypes(casoSlug: string): Promise<NodeTypeDefinition[]>
  getRelTypes(casoSlug: string): Promise<RelTypeDefinition[]>
}
```

`getGraph()` reads schema's node types and generates Cypher dynamically:
```cypher
-- Generated for caso-libra (has Person, Organization, Token, Event, Document, Wallet):
MATCH (n {caso_slug: $casoSlug})
WHERE n:Person OR n:Organization OR n:Token OR n:Event OR n:Document OR n:Wallet
OPTIONAL MATCH (n)-[r]-(m {caso_slug: $casoSlug})
RETURN n, r, m
```

Per-investigation `queries.ts` are thin wrappers — slug binding + type-safe transforms. Generic query builder handles Cypher generation.

### Unified API Routes

**Generic routes (validate `casoSlug` against InvestigationConfig nodes, unknown → 404):**
```
/api/casos/[casoSlug]/graph          — full investigation graph
/api/casos/[casoSlug]/nodes/[type]   — list nodes by type (paginated)
/api/casos/[casoSlug]/node/[slug]    — single node by slug + connections
/api/casos/[casoSlug]/timeline       — timeline events
/api/casos/[casoSlug]/schema         — schema introspection (node types, rel types, colors)
/api/casos/[casoSlug]/submissions    — submit/read investigation data
/api/casos/[casoSlug]/stats          — aggregate counts
```

**Investigation-specific extensions:**
```
/api/casos/caso-libra/wallets        — wallet flows (only caso-libra)
/api/casos/caso-libra/simulate/*     — MiroFish simulation (only caso-libra)
```

**Backwards compatibility:** Old `/api/caso-libra/*` (8 routes) and `/api/caso/[slug]/*` (6 routes, currently Epstein-specific) become 301 redirects to unified `/api/casos/` routes. Stubs stay for one release cycle then get removed.

**Preserved routes (untouched):**
```
/api/caso/finanzas-politicas/graph   — keeps querying platform labels (separate concern)
/api/investigations/*                — keeps serving user-authored Investigation documents
```

### Frontend Page Routes (existing, no migration needed)

```
/caso/[slug]                   — investigation landing page
/caso/[slug]/grafo             — graph explorer
/caso/[slug]/actor/[actorSlug] — person profile
/caso/[slug]/evidencia/[docSlug] — document detail
/caso/[slug]/cronologia        — timeline
/caso/[slug]/dinero            — wallet/money flows
/caso/[slug]/investigacion     — investigation data submissions
/caso/[slug]/simular           — MiroFish simulation
/caso/[slug]/simulacion        — simulation panel wrapper
/caso/[slug]/vuelos            — flights visualization
/caso/[slug]/proximidad        — proximity analysis
/caso/[slug]/resumen           — summary page
```

Work is: update hardcoded `/api/caso-libra/*` fetch URLs to use dynamic `slug` param, and refactor pages to use query builder + config registry instead of conditional slug dispatch.

### File Changes (all paths relative to `webapp/`)

**Modified:**

| File | Change |
|---|---|
| `src/lib/neo4j/schema.ts` | Drop `CasoLibra*` constraints/indexes, add generic label constraints + `caso_slug` range indexes, add `InvestigationConfig` constraint |
| `src/lib/caso-libra/queries.ts` | Rewrite Cypher: `CasoLibra*` → `{Label} {caso_slug: $casoSlug}`, delegate to query builder |
| `src/lib/caso-libra/transform.ts` | Minor — node labels change but property shapes same |
| `src/lib/graph/constants.ts` | Add `ShellCompany`, `Aircraft`, `Wallet`, `Token`, `Claim`, `MoneyFlow`, `GovernmentAction` to `LABEL_COLORS` and `LABEL_DISPLAY` |
| `scripts/seed-caso-libra.ts` | Use generic labels + `caso_slug` + prefixed IDs |
| `scripts/init-schema.ts` | Include new constraints and indexes |
| `src/app/api/caso-libra/*/route.ts` (8 routes) | Replace with 301 redirects to `/api/casos/caso-libra/*` |
| `src/app/api/caso/[slug]/*/route.ts` (6 routes: graph, flights, proximity, simulation) | Replace with 301 redirects to `/api/casos/[casoSlug]/*` |
| `src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` | Update hardcoded fetch to use dynamic `slug` |
| `src/app/caso/[slug]/dinero/page.tsx` | Update hardcoded fetch to use dynamic `slug` |
| `src/app/caso/[slug]/investigacion/page.tsx` | Update hardcoded fetch to use dynamic `slug` |
| `src/app/caso/[slug]/actor/[actorSlug]/page.tsx` | Update hardcoded fetch to use dynamic `slug` |
| `scripts/seed-caso-epstein.ts` | Update to align with InvestigationConfig schema (already 80KB, uses generic labels + caso_slug, imports rhowardstone data) |
| `src/app/caso/[slug]/page.tsx` | Refactor to schema-driven landing using `InvestigationLanding` + query builder |
| `src/app/caso/[slug]/resumen/page.tsx` | Refactor to config-driven `NarrativeView` |
| `src/app/caso/[slug]/investigacion/page.tsx` | Refactor to query-builder-driven `InvestigacionView` |
| `src/app/caso/[slug]/evidencia/page.tsx` | Remove conditional slug dispatch, use query builder |
| `src/app/caso/[slug]/cronologia/page.tsx` | Remove conditional slug dispatch, use query builder |
| `src/app/caso/[slug]/grafo/page.tsx` | Update API fetch URL to `/api/casos/${slug}/graph` |
| `src/app/caso/[slug]/vuelos/page.tsx` | Update API fetch URL |
| `src/components/investigation/InvestigationNav.tsx` | Remove hardcoded `CASE_TABS`, read from config |
| `src/lib/caso-libra/investigation-data.ts` | Narrative chapter data moves to `config.ts`; static editorial stays until Neo4j seed verified |
| `src/lib/caso-epstein/types.ts` | Update domain types for generic label format + rhowardstone data properties (aliases, entity_type, metadata) |
| `src/lib/caso-epstein/queries.ts` | Delegate to generic query builder |
| `src/lib/caso-epstein/transform.ts` | Rewrite transforms for generic label format |
| `src/lib/caso-epstein/index.ts` | Update re-exports |

**Created:**

| File | Purpose |
|---|---|
| `src/lib/investigations/query-builder.ts` | Schema-aware generic query builder |
| `src/lib/investigations/types.ts` | `InvestigationNode`, `InvestigationSchema`, `InvestigationConfig`, `InvestigationClientConfig` types |
| `src/lib/investigations/config.ts` | Read/write `InvestigationConfig` nodes from Neo4j |
| `src/lib/investigations/utils.ts` | `casoNodeId()` helper, slug generation |
| `src/lib/investigations/registry.ts` | Central registry: `casoSlug` → investigation module |
| `src/lib/caso-libra/config.ts` | Investigation client config (tabs, features, hero, chapters) |
| `src/lib/caso-finanzas-politicas/types.ts` | Domain types for finanzas-politicas entities |
| `src/lib/caso-finanzas-politicas/queries.ts` | Typed wrappers around query builder |
| `src/lib/caso-finanzas-politicas/transform.ts` | Pure transform functions |
| `src/lib/caso-finanzas-politicas/config.ts` | Investigation client config |
| `src/lib/caso-epstein/config.ts` | Investigation client config |
| `scripts/seed-investigation-configs.ts` | Seeds InvestigationConfig + schema subgraphs for all 3 |
| `scripts/migrate-caso-libra-labels.ts` | Two-phase label migration |
| `scripts/seed-caso-finanzas-politicas.ts` | Imports narrative data into Neo4j |
| `src/app/api/casos/[casoSlug]/graph/route.ts` | Unified graph endpoint |
| `src/app/api/casos/[casoSlug]/nodes/[type]/route.ts` | Unified node list endpoint |
| `src/app/api/casos/[casoSlug]/node/[slug]/route.ts` | Unified node detail endpoint |
| `src/app/api/casos/[casoSlug]/timeline/route.ts` | Unified timeline endpoint |
| `src/app/api/casos/[casoSlug]/schema/route.ts` | Schema introspection endpoint |
| `src/app/api/casos/[casoSlug]/submissions/route.ts` | Unified submission endpoint |
| `src/app/api/casos/[casoSlug]/stats/route.ts` | Unified stats endpoint |
| `src/components/investigation/InvestigationLanding.tsx` | Generic landing page (hero + stats + featured actors) |
| `src/components/investigation/InvestigacionView.tsx` | Factcheck/timeline/actors/money-flows page |
| `src/components/investigation/NarrativeView.tsx` | Chapter-based narrative with bilingual toggle |
| `src/components/investigation/ClaimCard.tsx` | Factcheck claim display with status badge |
| `src/components/investigation/MoneyFlowCard.tsx` | Financial flow visualization card |

**Deleted (after migration confirmed working):**

| File | Reason |
|---|---|
| `src/lib/caso-finanzas-politicas/investigation-data.ts` | Data moves to Neo4j |
| `src/app/caso/finanzas-politicas/page.tsx` | Replaced by generic `[slug]` landing page |
| `src/app/caso/finanzas-politicas/layout.tsx` | Replaced by generic `[slug]` layout |
| `src/app/caso/finanzas-politicas/resumen/page.tsx` | Replaced by generic `[slug]/resumen` page |
| `src/app/caso/finanzas-politicas/investigacion/page.tsx` | Replaced by generic `[slug]/investigacion` page |
| `src/app/caso/finanzas-politicas/cronologia/page.tsx` | Replaced by generic `[slug]/cronologia` page |
| `src/app/caso/finanzas-politicas/dinero/page.tsx` | Replaced by generic `[slug]/dinero` page |
| `src/app/caso/caso-epstein/page.tsx` | Replaced by generic `[slug]` landing page |
| `src/app/caso/caso-epstein/layout.tsx` | Replaced by generic `[slug]` layout |
| `src/app/caso/caso-epstein/resumen/page.tsx` | Replaced by generic `[slug]/resumen` page |
| `src/app/caso/caso-epstein/investigacion/page.tsx` | Replaced by generic `[slug]/investigacion` page |
| `src/app/caso/caso-epstein/cronologia/page.tsx` | Replaced by generic `[slug]/cronologia` page |
| `src/app/caso/caso-epstein/evidencia/page.tsx` | Replaced by generic `[slug]/evidencia` page |

**Untouched:**

| File | Reason |
|---|---|
| `src/lib/neo4j/client.ts` | Infrastructure — no changes |
| `src/lib/investigation/*` | TipTap-based Investigation documents — separate concern |
| `src/lib/caso-libra/types.ts` | Domain types don't change |
| `src/lib/caso-libra/investigation-schema.ts` | Zod submission schemas still valid |
| `src/app/api/caso/finanzas-politicas/graph/route.ts` | Queries platform labels, not investigation-specific |
| `src/app/api/investigations/*` | User-authored investigation CRUD — separate concern |
| `src/app/caso/finanzas-politicas/conexiones/page.tsx` | Platform-graph visualization — separate concern |
| All Como Voto ETL scripts | Platform reference data |
| `_ingestion_data/rhowardstone/*` | Source data consumed by seed script |

### Backend Module Layout

Every investigation gets the same file structure under `webapp/src/lib/caso-{slug}/`:

```
lib/caso-libra/
  types.ts          — Domain types specific to this investigation
  queries.ts        — Typed query wrappers delegating to generic query builder
  transform.ts      — Pure functions: Neo4j records → domain objects
  config.ts         — InvestigationClientConfig (tabs, hero, features, chapters)
  index.ts          — Re-exports
  investigation-schema.ts  — Zod submission schemas (caso-libra only, for now)

lib/caso-finanzas-politicas/
  types.ts, queries.ts, transform.ts, config.ts, index.ts

lib/caso-epstein/
  types.ts, queries.ts, transform.ts, config.ts, index.ts
```

Investigation registry resolves `casoSlug` → module config:
```typescript
import { config as libraConfig } from '../caso-libra/config'
import { config as finanzasConfig } from '../caso-finanzas-politicas/config'
import { config as epsteinConfig } from '../caso-epstein/config'

const REGISTRY: Record<string, InvestigationClientConfig> = {
  'caso-libra': libraConfig,
  'caso-finanzas-politicas': finanzasConfig,
  'caso-epstein': epsteinConfig,
}

export function getInvestigationConfig(slug: string): InvestigationClientConfig | null {
  return REGISTRY[slug] ?? null
}
```

### Frontend Data Fetching Pattern

All pages use: **server component fetches via generic query builder, parameterized by slug.**
```typescript
// Example: app/caso/[slug]/cronologia/page.tsx
import { getInvestigationConfig } from '@/lib/investigations/registry'
import { queryBuilder } from '@/lib/investigations/query-builder'

export default async function CronologiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = getInvestigationConfig(slug)
  if (!config) notFound()
  const events = await queryBuilder.getTimeline(slug)
  return <Timeline events={events} config={config} />
}
```

No more conditional slug dispatch (`if (slug === 'caso-epstein') ...`). No hardcoded data imports.

Client components use unified API: `fetch(\`/api/casos/${casoSlug}/graph\`)`

**Resumen pages:** Narrative chapter arrays (editorial content) move from page files into each investigation's `config.ts`. `NarrativeView` is a client component (`'use client'`) for bilingual toggle.

**Investigacion page:** Refactored from ~1000 lines with hardcoded imports to query-builder-driven `InvestigacionView`. Sections render conditionally — no `Claim` nodes → no factcheck section. `GovernmentAction` maps from existing `GOVERNMENT_RESPONSES` data. **Transitional:** page refactor gated on Phase 3/4 data seed completing.

### Phase 1: Schema & Config Nodes
- [ ] Create `scripts/seed-investigation-configs.ts` — idempotent MERGE of `InvestigationConfig`, `SchemaDefinition`, `NodeTypeDefinition`, `RelTypeDefinition` nodes for all 3 investigations using the schema definitions above
- [ ] Add generic label constraints + `caso_slug` range indexes to `scripts/init-schema.ts`:
  - Uniqueness: `Person.id`, `Organization.id`, `Event.id`, `Document.id`, `Token.id`, `Wallet.id`, `Location.id`, `Aircraft.id`, `ShellCompany.id`, `Claim.id`, `MoneyFlow.id`, `GovernmentAction.id`
  - Range indexes on `caso_slug`: `CREATE INDEX person_caso_slug IF NOT EXISTS FOR (n:Person) ON (n.caso_slug)` (and same for Event, Document, Organization, Token, Wallet, Location, Aircraft, ShellCompany, Claim, MoneyFlow, GovernmentAction)
  - `InvestigationConfig.id IS UNIQUE`
  - Fulltext indexes on generic labels post-filter with `WHERE n.caso_slug = $casoSlug` in application layer

### Phase 2: Caso Libra Label Migration
- [ ] Create `scripts/migrate-caso-libra-labels.ts` — two-phase migration:
  - Step 1 (non-destructive): for each `CasoLibra*` node create a generic-labeled node with `caso_slug: "caso-libra"` + prefixed ID (`caso-libra:{original_id}`), recreate all relationships between new generic nodes. Verify: count new nodes per type matches old.
  - Step 2 (destructive, after verification): delete all `CasoLibra*` nodes + relationships, drop old constraints (`CasoLibraPerson.id IS UNIQUE`, etc.), create new constraints and indexes.
  - Rollback: if step 2 fails, old nodes still exist (step 1 is additive). If both complete but broken downstream, `seed-caso-libra.ts` can re-seed old format.
- [ ] Update `scripts/seed-caso-libra.ts` to use generic labels + `caso_slug` + prefixed IDs

### Phase 3: Caso Finanzas Politicas Import
- [ ] Create `scripts/seed-caso-finanzas-politicas.ts` — reads exported arrays from `investigation-data.ts`:
  - `FACTCHECK_ITEMS` → `Claim` nodes (id, claim_es, claim_en, status, tier, source, source_url, detail_es, detail_en)
  - `TIMELINE_EVENTS` → `Event` nodes (id, date, title_es, title_en, description_es, description_en, category, sources)
  - `ACTORS` → `Person` nodes (id, name, slug, role_es, role_en, description_es, description_en, party, datasets)
  - `MONEY_FLOWS` → `MoneyFlow` nodes (id, from_label, to_label, amount_ars, description_es, description_en, date, source, source_url)
  - `IMPACT_STATS` → properties on `InvestigationConfig` node
  - All nodes get `caso_slug: "caso-finanzas-politicas"` and prefixed IDs
  - Generates slugs using existing slug utility
  - Creates relationships: `SUBJECT_OF` (Person→Claim by name matching), `OFFICER_OF`, `INVOLVED_IN`, `SOURCE_OF`, `DESTINATION_OF`

### Phase 4: Caso Epstein Alignment
- [ ] Update `scripts/seed-caso-epstein.ts` to align with InvestigationConfig schema (script already exists at 80KB, uses generic labels + `caso_slug: "caso-epstein"`, imports rhowardstone data — 10,864+ nodes already in Neo4j):
  - Ensure prefixed IDs match `{caso_slug}:{local_id}` convention
  - Verify all node types match SchemaDefinition from Phase 1
  - Verify persons registry merge strategy is implemented (KG first, then registry enrichment)
  - Verify victim pseudonymization: `VICTIM_OF` relationship sources → `Jane Doe #N` / `John Doe #N`
- [ ] Update `src/lib/caso-epstein/queries.ts` (already 18KB, uses generic labels + `caso_slug`) to delegate to generic query builder once it exists

### Phase 5: Unified Query Layer + API
- [ ] Create `src/lib/investigations/types.ts` — `InvestigationNode`, `InvestigationSchema`, `InvestigationConfig`, `InvestigationClientConfig`, `BilingualText`, `NarrativeChapter`, `TabId` types (see contracts above)
- [ ] Create `src/lib/investigations/utils.ts` — `casoNodeId(casoSlug, localId)` helper, slug generation
- [ ] Create `src/lib/investigations/config.ts` — read/write `InvestigationConfig` nodes from Neo4j
- [ ] Create `src/lib/investigations/query-builder.ts` — schema-aware generic query builder implementing `InvestigationQueryBuilder` interface above. Reads `NodeTypeDefinition` nodes to generate dynamic Cypher. Generic transform: `toInvestigationNode(record, schema)` picks properties from schema `properties_json`.
- [ ] Create `src/lib/investigations/registry.ts` — central registry mapping `casoSlug` → `InvestigationClientConfig` (see code above)
- [ ] Create `src/lib/caso-finanzas-politicas/{types,queries,transform,config}.ts` — per-investigation module following backend module layout. `queries.ts` thin wrappers: `const SLUG = 'caso-finanzas-politicas'` + query builder delegation.
- [ ] Update `src/lib/caso-libra/queries.ts` — rewrite all Cypher from `MATCH (p:CasoLibraPerson)` → `MATCH (p:Person {caso_slug: $casoSlug})`, delegate to query builder
- [ ] Create `src/lib/caso-libra/config.ts` — `InvestigationClientConfig` with tabs, features (`wallets: true, simulation: true`), hero, chapters (moved from `investigation-data.ts`)
- [ ] Update `src/lib/caso-epstein/queries.ts` (already 18KB, uses generic labels + caso_slug) — delegate to generic query builder, `const SLUG = 'caso-epstein'`
- [ ] Update `src/lib/caso-epstein/transform.ts` (exists) — align with generic `toInvestigationNode()` transform
- [ ] Create `src/lib/caso-epstein/config.ts` — `InvestigationClientConfig` with tabs, features (`flights: true`), hero
- [ ] Create 7 unified API routes (see route table above) — each validates `casoSlug` against `InvestigationConfig` nodes, unknown → 404
- [ ] Replace 8 `src/app/api/caso-libra/*/route.ts` with 301 redirects to `/api/casos/caso-libra/*`
- [ ] Replace 6 `src/app/api/caso/[slug]/*/route.ts` (graph, flights, proximity, simulation/init, simulation/query) with 301 redirects to `/api/casos/[casoSlug]/*`
- [ ] Update `src/lib/graph/constants.ts` — add `ShellCompany`, `Aircraft`, `Wallet`, `Token`, `Claim`, `MoneyFlow`, `GovernmentAction` to `LABEL_COLORS` and `LABEL_DISPLAY`

### Phase 6: Frontend Standardization
- [ ] Update hardcoded fetch URLs in `[slug]` pages to use dynamic `slug` param:
  - `src/app/caso/[slug]/dinero/page.tsx` — `fetch('/api/caso-libra/wallets')` → `fetch(\`/api/casos/${slug}/wallets\`)`
  - `src/app/caso/[slug]/investigacion/page.tsx` — `fetch('/api/caso-libra/investigation', ...)` → dynamic
  - `src/app/caso/[slug]/actor/[actorSlug]/page.tsx` — `fetch('/api/caso-libra/person/${actorSlug}')` → dynamic
  - `src/app/caso/[slug]/evidencia/[docSlug]/page.tsx` — `fetch('/api/caso-libra/document/${docSlug}')` → dynamic
- [ ] Refactor `src/components/investigation/InvestigationNav.tsx` — remove hardcoded `CASE_TABS`, read tabs from `getInvestigationConfig(slug).tabs`, map to `TAB_LABELS`
- [ ] Create shared components:
  - `src/components/investigation/InvestigationLanding.tsx` — generic landing page: reads config for hero text, feature flags, available tabs. Renders hero + stats + featured actors. No per-investigation logic.
  - `src/components/investigation/InvestigacionView.tsx` — conditional sections: factcheck (if Claim nodes exist), timeline, actors, money-flows (if MoneyFlow nodes exist), government responses (if GovernmentAction nodes exist)
  - `src/components/investigation/NarrativeView.tsx` — client component (`'use client'`), chapter-based narrative with bilingual `useState` toggle, reads `chapters` + `sources` from config
  - `src/components/investigation/ClaimCard.tsx` — factcheck claim display with status badge (verified/unverified/disputed)
  - `src/components/investigation/MoneyFlowCard.tsx` — financial flow visualization card (from, to, amount, source)
- [ ] Refactor `src/app/caso/[slug]/page.tsx` — `getInvestigationConfig(slug)` + `queryBuilder.getStats(slug)` + `queryBuilder.getSchema(slug)` → `<InvestigationLanding>`
- [ ] Refactor `src/app/caso/[slug]/resumen/page.tsx` — `getInvestigationConfig(slug)`, if no chapters → notFound(), render `<NarrativeView chapters={config.chapters} sources={config.sources} />`
- [ ] Refactor `src/app/caso/[slug]/investigacion/page.tsx` — `Promise.all([queryBuilder.getNodesByType(slug, 'Claim'), ...'Event', ...'Person', ...'MoneyFlow', ...'Document', ...'GovernmentAction'])` → `<InvestigacionView>`. Gated on Phase 3/4 seed completion.
- [ ] Refactor `src/app/caso/[slug]/cronologia/page.tsx` — `queryBuilder.getTimeline(slug)` → `<Timeline>`, no conditional slug dispatch
- [ ] Refactor `src/app/caso/[slug]/evidencia/page.tsx` — `queryBuilder.getNodesByType(slug, 'Document')` → render, no conditional slug dispatch
- [ ] Refactor `src/app/caso/[slug]/grafo/page.tsx` — update fetch to `/api/casos/${slug}/graph`
- [ ] Refactor `src/app/caso/[slug]/vuelos/page.tsx` — update fetch URL, check `config.features.flights`
- [ ] Delete static finanzas-politicas routes (6 pages: page, layout, resumen, investigacion, cronologia, dinero — keep `/conexiones` as platform-graph visualization)
- [ ] Delete static caso-epstein routes (6 pages: page, layout, resumen, investigacion, cronologia, evidencia)

### Execution Order

Phases 1–4 are data scripts. Phases 5–6 are code changes. Scripts run before deploying code changes. Each phase is independently runnable and verifiable.

### Verification
- [ ] `InvestigationConfig` nodes exist for all 3 investigations with correct schema subgraphs (`SchemaDefinition` → `NodeTypeDefinition` × N + `RelTypeDefinition` × N)
- [ ] Caso Libra data accessible via generic labels with `caso_slug` filtering — same node count as before migration, all relationships preserved
- [ ] Finanzas Politicas narrative data queryable from Neo4j — Claim, Event, Person, MoneyFlow nodes with correct `caso_slug` and relationships
- [ ] Epstein full dataset (~1,614 Person nodes, 9 Organization, 12 ShellCompany, 3 Location, 4 Aircraft, 2,302 relationships) in Neo4j with victim pseudonymization
- [ ] All 7 unified API endpoints return correct data for all 3 investigations
- [ ] `/api/casos/nonexistent/graph` → 404
- [ ] All `/caso/[slug]/*` pages render correctly for caso-libra, caso-finanzas-politicas, caso-epstein
- [ ] Old `/api/caso-libra/*` routes return 301 redirects to `/api/casos/caso-libra/*`
- [ ] No hardcoded `/api/caso-libra/*` fetch URLs remain in `[slug]` pages
- [ ] Feature flag pages return 404 for wrong investigation (e.g., `/caso/caso-epstein/dinero` → 404)
- [ ] `pnpm run dev` starts without errors
- [ ] Idempotency: run seed scripts twice → same node count, no duplicates

**Dependencies:** Milestones 0-8 (existing investigations must be functional before standardization)

---

## Milestone 10: Motor de Investigación Autónomo

**Goal:** Pipeline automatizado: el motor busca, valida, consolida y reporta hallazgos con revisión humana en cada paso. The engine runs inside the Next.js app as server-side operations. All config lives in Neo4j as first-class graph entities. LLM never writes directly — all outputs are `Proposal` nodes reviewed at gates.

### Current State (as of 2026-03-21)

| Component | Exists | Location | Notes |
|---|---|---|---|
| Ingestion scripts | Yes | `scripts/ingest-wave-*.ts` (4 waves) | Hardcoded per-wave, not config-driven |
| Dedup module | Yes | `src/lib/ingestion/dedup.ts` | Levenshtein-based, `caso_slug` namespaced — reused directly |
| Quality/conflict resolution | Yes | `src/lib/ingestion/quality.ts` | Conflict detection — reused directly |
| Wave review script | Yes | `scripts/review-wave.ts` | CLI-based, becomes gate UI data provider |
| Promote nodes script | Yes | `scripts/promote-nodes.ts` | CLI-based, becomes gate approval handler |
| MiroFish client | Yes | `src/lib/mirofish/client.ts` | Reads `MIROFISH_API_URL` at module load — needs `endpoint` param |
| MiroFish seed export | Yes | `src/lib/mirofish/export.ts` | Hardcodes Person/Organization/Location — needs generalization |
| Graph algorithms | Yes | `src/lib/graph/algorithms.ts` | Basic implementations — needs centrality, community detection, anomaly |
| InvestigationConfig nodes | No | — | Created by M9 Phase 1 (prerequisite) |
| LLM abstraction | No | — | Only raw MiroFish/llama.cpp client exists |
| Pipeline executor | No | — | No stage runner, gate mechanism, or proposal system |
| Source connectors | No | — | Ingestion is hardcoded scripts, not config-driven connectors |
| Audit trail | No | — | No AuditEntry nodes or hash chain |

### Data Model

Builds on M9's `InvestigationConfig` + `SchemaDefinition` subgraph. New node types added:

```
(InvestigationConfig)
  -[:HAS_SOURCE]-> (SourceConnector {id, name, type, config_json, mapping_json, dedup_config_json, tier, enabled})
  -[:HAS_PIPELINE]-> (PipelineConfig)
    -[:HAS_STAGE]-> (PipelineStage {id, name, type, order, config_json})
      -[:HAS_GATE]-> (Gate {type, prompt, actions, show_components})
  -[:HAS_MODEL]-> (ModelConfig {name, provider, endpoint, model, config_json, api_key_env})
  -[:HAS_MIROFISH]-> (MiroFishConfig {endpoint, llm_backend})
  -[:CURRENT_STATE]-> (PipelineState {current_stage, status, progress_json})
  -[:HAS_AUDIT]->(AuditEntry)-[:NEXT]->(AuditEntry)
  -[:HAS_SNAPSHOT]-> (Snapshot {name, created, stage, graph_state_json, pipeline_state_json})
  -[:FORKED_FROM]-> (InvestigationConfig)  # for branches
```

**SourceConnector types:** `rest-api`, `file-upload`, `web-scraper`, `court-records`, `corporate-registry`, `custom-script`

**PipelineStage types:** `ingest`, `verify`, `enrich`, `analyze`, `report`

**Gate actions:** `approve`, `reject`, `partial`, `back_to_analyze`

**Proposal node:**
```typescript
interface Proposal {
  id: string
  investigation_id: string
  stage: string
  type: 'node' | 'edge' | 'promotion' | 'merge' | 'hypothesis' | 'report_section'
  payload_json: string
  confidence: number            // 0-1
  reasoning: string
  proposed_by: string           // "llm:qwen-3.5-9b" | "connector:epstein-exposed" | "algorithm:centrality"
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  review_rationale?: string
}
```

**AuditEntry node (hash-chained):**
```typescript
interface AuditEntry {
  id: string
  investigation_id: string
  ts: string                    // ISO timestamp
  actor: string                 // "engine" | "researcher:gabriel" | "llm:qwen-3.5-9b"
  action: string                // "stage_start" | "node_created" | "gate_decision" | "proposal_approved"
  details_json: string
  prev_hash: string             // SHA-256 of previous entry — "genesis" for first
}
```

Chain: `(InvestigationConfig)-[:HAS_AUDIT]->(AuditEntry)-[:NEXT]->(AuditEntry)`. Validated on engine startup.

### LLM Abstraction

```typescript
interface LLMProvider {
  chat(messages: Message[], options?: LLMOptions): Promise<LLMResponse>
  stream(messages: Message[], options?: LLMOptions): AsyncIterable<LLMChunk>
}

interface LLMResponse {
  content: string
  reasoning?: string       // Qwen's reasoning_content, Claude's thinking blocks
  tool_calls?: ToolCall[]
  usage: { prompt_tokens: number; completion_tokens: number }
}
```

**Built-in providers:** `llamacpp` (OpenAI-compatible, maps Qwen `reasoning_content` → `reasoning`), `openai`, `anthropic`, `ollama`, `custom`

**Three execution modes:**
- `single` — direct LLM call (summarization, extraction, report drafting)
- `tool-agent` — LLM with scoped tools per stage:
  - enrich: `read_graph`, `propose_node`, `propose_edge`, `fetch_url`, `extract_entities`
  - analyze: `read_graph`, `run_algorithm`, `propose_hypothesis`, `compare_timelines`
  - report: `read_graph`, `read_hypotheses`, `draft_section`
- `swarm` — MiroFish multi-agent simulation (graph entities become autonomous agents)

### Pipeline Execution Flow

```
Researcher clicks "Run Pipeline" on dashboard
  │
  ├─ Read InvestigationConfig + PipelineConfig from Neo4j
  ├─ Resolve current stage from PipelineState node
  │
  ├─ Stage: ingest
  │   ├─ Read SourceConnector nodes
  │   ├─ Run connectors server-side (parallel where independent)
  │   ├─ Source-level dedup against existing graph (caso_slug filter)
  │   ├─ Write bronze nodes to Neo4j
  │   ├─ Create AuditEntry nodes
  │   ├─ PipelineState → status: "gate_pending"
  │   └─ Redirect to gate review UI
  │
  ├─ Gate: researcher reviews proposals → approve/reject
  │   ├─ AuditEntry with decision + rationale
  │   ├─ Snapshot auto-created
  │   └─ PipelineState → next stage
  │
  ├─ Stage: verify → parallel agents, web search, propose tier promotions
  ├─ Stage: enrich → fetch docs, LLM entity extraction, reverse lookups
  ├─ Stage: analyze → graph algorithms + LLM analysis (tool-agent or swarm)
  ├─ Stage: report → LLM drafts investigation report
  │
  └─ Pipeline complete → PipelineState status: "completed"
```

**Key properties:**
- Stages are re-runnable (re-running ingest after adding a source only processes what's new)
- Gates are blocking (pipeline stops until researcher acts)
- Stages can loop (`back_to_analyze` action on report gate)
- LLM scope is per-stage (defined in stage config)

### Dedup Two-Pass Model

1. **Source-level dedup** (per SourceConnector's `dedup_config_json`): at connector time, dedup incoming records against existing graph
2. **Pipeline-level dedup** (verify stage): cross-source global pass after all sources ingested

Both use existing Levenshtein algorithm from `dedup.ts`. Thresholds configurable per pass.

### Graph Algorithms (application-side TypeScript, not Neo4j GDS)

| Algorithm | Purpose | Implementation |
|---|---|---|
| Degree centrality | Identify most-connected nodes | Count relationships per node |
| Betweenness centrality | Find bridge nodes | BFS-based approximation (extend `algorithms.ts`) |
| Community detection | Find clusters | Label propagation (iterative, O(n) per pass) |
| Anomaly detection | Unusual patterns | Statistical outliers on degree, temporal gaps, isolated clusters |
| Temporal patterns | Timeline correlations | Event co-occurrence within time windows |

Results stored as `Proposal` nodes of type `hypothesis`, presented at analyze gate.

### Phase 1: Engine Data Model
- [ ] Add engine node type constraints to `scripts/init-schema.ts`:
  - Uniqueness: `SourceConnector.id`, `PipelineConfig.id`, `PipelineStage.id`, `Gate.id`, `PipelineState.id`, `Proposal.id`, `AuditEntry.id`, `Snapshot.id`, `ModelConfig.id`, `MiroFishConfig.id`
- [ ] Create `src/lib/engine/types.ts` — TypeScript interfaces + Zod schemas for all engine node types: `SourceConnector`, `PipelineConfig`, `PipelineStage`, `Gate`, `PipelineState`, `Proposal`, `AuditEntry`, `Snapshot`, `ModelConfig`, `MiroFishConfig`
- [ ] Create `src/lib/engine/config.ts` — CRUD operations for engine config nodes (read/write to Neo4j)
- [ ] Create `src/lib/engine/audit.ts` — append-only AuditEntry creation with SHA-256 hash chain, chain validation on startup

### Phase 2: LLM Abstraction Layer
- [ ] Create `src/lib/engine/llm/types.ts` — `LLMProvider`, `LLMResponse`, `LLMOptions`, `Message`, `ToolCall` interfaces
- [ ] Create `src/lib/engine/llm/llamacpp.ts` — OpenAI-compatible provider, maps Qwen `reasoning_content` → `reasoning` (mandatory — without it, proposals from thinking-mode models have empty reasoning)
- [ ] Create `src/lib/engine/llm/openai.ts` — OpenAI provider adapter
- [ ] Create `src/lib/engine/llm/anthropic.ts` — Anthropic provider adapter, maps `thinking` blocks → `reasoning`
- [ ] Create `src/lib/engine/llm/factory.ts` — provider factory from `ModelConfig` node
- [ ] Create `src/lib/engine/llm/tools.ts` — scoped tool definitions per stage (read_graph, propose_node, propose_edge, fetch_url, extract_entities, run_algorithm, propose_hypothesis, compare_timelines, draft_section)

### Phase 3: Pipeline Executor
- [ ] Create `src/lib/engine/pipeline.ts` — pipeline stage runner:
  - Reads `PipelineConfig` + stages from Neo4j
  - Resolves current stage from `PipelineState` node
  - Executes stage handler (dispatch to stage-specific module)
  - Updates `PipelineState` (progress, status)
  - Creates `AuditEntry` nodes per action
  - On gate: sets `status: "gate_pending"`, returns gate info
- [ ] Create `src/lib/engine/proposals.ts` — Proposal CRUD:
  - Create proposals (from connectors, LLM, algorithms)
  - List pending proposals per stage
  - Batch approve/reject with rationale
  - Apply approved proposals to graph (create nodes/edges, promote tiers)
- [ ] Create `src/lib/engine/snapshots.ts` — snapshot management:
  - Auto-create at gate approval
  - Manual create from dashboard
  - List/restore snapshots (restore = regenerate from audit log replay)

### Phase 4: Source Connectors
- [ ] Create `src/lib/engine/connectors/types.ts` — connector interface
- [ ] Create `src/lib/engine/connectors/rest-api.ts` — paginated REST API connector with rate limiting and resumability
- [ ] Create `src/lib/engine/connectors/file-upload.ts` — CSV/JSON/PDF file connector (files stored in webapp upload directory)
- [ ] Create `src/lib/engine/connectors/custom-script.ts` — server-side script that outputs JSONL
- [ ] Create `src/lib/engine/connectors/factory.ts` — connector factory from `SourceConnector` node config
- [ ] Integrate existing dedup module (`src/lib/ingestion/dedup.ts`) for source-level dedup per connector's `dedup_config_json`

### Phase 5: Stage Implementations
- [ ] Create `src/lib/engine/stages/ingest.ts` — run source connectors, source-level dedup, write bronze nodes, create audit entries
- [ ] Create `src/lib/engine/stages/verify.ts` — dispatch parallel verification agents, propose tier promotions, cross-source dedup (pipeline-level)
- [ ] Create `src/lib/engine/stages/enrich.ts` — fetch document content, LLM entity extraction (tool-agent mode), reverse lookups
- [ ] Create `src/lib/engine/stages/analyze.ts` — graph algorithms + LLM analysis (tool-agent or swarm mode), produce hypothesis proposals
- [ ] Create `src/lib/engine/stages/report.ts` — LLM drafts investigation report sections as proposals
- [ ] Create `src/lib/engine/agents.ts` — parallel agent dispatch per stage config (scoped queries, concurrent execution, progress updates on PipelineState)

### Phase 6: Graph Algorithms
- [ ] Extend `src/lib/graph/algorithms.ts` with:
  - Degree centrality (count relationships per node)
  - Betweenness centrality (BFS-based approximation)
  - Community detection (label propagation, iterative)
  - Anomaly detection (statistical outliers on degree, temporal gaps, isolated clusters)
  - Temporal patterns (event co-occurrence within time windows)
- [ ] Results produce `Proposal` nodes of type `hypothesis` with confidence scores and reasoning

### Phase 7: MiroFish Integration
- [ ] Refactor `src/lib/mirofish/client.ts` — add `endpoint` parameter to `initializeSimulation`, `querySimulation`, `getSimulationStatus` (currently reads `MIROFISH_API_URL` at module load)
- [ ] Refactor `src/lib/mirofish/export.ts` — generalize `graphToMiroFishSeed()` to read `agent_source` and `context_from` from stage config (currently hardcodes Person, Organization, Location)

### Phase 8: API Routes
- [ ] Create engine API routes:
  - `src/app/api/engine/[investigationId]/run/route.ts` — trigger pipeline execution
  - `src/app/api/engine/[investigationId]/state/route.ts` — get pipeline state
  - `src/app/api/engine/[investigationId]/proposals/route.ts` — list/batch-review proposals
  - `src/app/api/engine/[investigationId]/gate/[stageId]/route.ts` — gate review actions
  - `src/app/api/engine/[investigationId]/audit/route.ts` — audit log
  - `src/app/api/engine/[investigationId]/snapshots/route.ts` — snapshot CRUD

### Scope Boundaries

**In scope:**
- Engine data model (all config nodes in Neo4j)
- LLM abstraction layer (4 providers + 3 execution modes)
- Pipeline executor (stage runner, gates, proposals, audit trail, snapshots)
- Source connectors (rest-api, file-upload, custom-script)
- Stage implementations (ingest, verify, enrich, analyze, report)
- Graph algorithms (5 algorithms, application-side TypeScript)
- MiroFish refactor (endpoint param, generalized seed export)
- API routes for engine control

**Out of scope (future milestones):**
- Webapp UI (dashboard, gate review pages, schema editor, create wizard)
- Template system (InvestigationTemplate nodes, built-in templates, community templates)
- Forking/branching (lazy copy-on-write, merge gates)
- Cycle mode (scheduled re-runs)
- Coalition-owned investigations (consensus gates)
- `web-scraper`, `court-records`, `corporate-registry` connector types

### Existing Code Reuse

| Current Code | Engine Component | Action |
|---|---|---|
| `src/lib/ingestion/dedup.ts` | Engine dedup module | Reuse directly |
| `src/lib/ingestion/quality.ts` | Conflict resolution | Reuse directly |
| `scripts/review-wave.ts` | Gate review data provider | Pattern reference |
| `scripts/promote-nodes.ts` | Gate approval handler | Pattern reference |
| `src/lib/mirofish/client.ts` | Swarm execution mode | Refactor (add endpoint param) |
| `src/lib/mirofish/export.ts` | Swarm seed generation | Refactor (generalize node types) |
| `src/lib/graph/algorithms.ts` | Analyze stage | Extend (add 5 algorithms) |
| `scripts/ingest-wave-*.ts` | Connector implementations | Pattern reference (connectors replace these) |

### Verification
- [ ] Engine config nodes (SourceConnector, PipelineConfig, PipelineStage, Gate, ModelConfig) can be CRUD'd via API
- [ ] LLM providers (llamacpp, openai, anthropic) produce valid `LLMResponse` with `reasoning` field mapped correctly
- [ ] Pipeline runs ingest stage → creates bronze nodes → PipelineState → "gate_pending"
- [ ] Gate approval → creates AuditEntry with hash chain → creates Snapshot → advances to next stage
- [ ] Proposals accumulate during stage, presented at gate, batch approve/reject works
- [ ] AuditEntry hash chain validates on startup (tamper detection)
- [ ] Source-level dedup prevents duplicate nodes within connector run
- [ ] Pipeline-level dedup (verify stage) catches cross-source duplicates
- [ ] Graph algorithms produce hypothesis Proposals with confidence scores
- [ ] MiroFish swarm mode reads endpoint from MiroFishConfig node, seed generation uses schema-defined node types
- [ ] Full pipeline run (ingest → verify → enrich → analyze → report) completes with gates at each step
- [ ] `pnpm run dev` starts without errors

**Dependencies:** Milestone 9 (InvestigationConfig + SchemaDefinition nodes must exist)

---

## Rate Limiting Summary

| Endpoint | Limit | Key |
|----------|-------|-----|
| Graph API (read) | 60 req/min | IP |
| Graph search | 30 req/min | IP |
| Login | 5 req/min, 10 req/hour | IP + email |
| Registration | 3 req/hour | IP |
| Password reset | 3 req/hour | email |
| Investigation create | 10 req/hour | user |
| Investigation update | 60 req/hour | user |
| OG image generation | 30 req/min | IP |
| PDF export | 5 req/hour | user |

---

## Parallelization Map

```
M0 ──→ M1 ──→ M2 ──┬──→ M3 ──┐
                     │         ├──→ M6 ──→ M7 ──→ M8 ──→ M9 ──→ M10
                     └──→ M4 ──┘
M0 ──→ M5 ─────────────────────┘
```

- M3 (Graph Explorer) and M4 (Politician Profiles) are parallel after M2
- M5 (Auth) is parallel with M1-M4 — only depends on M0
- M9 (Investigation Standardization) follows M8 — standardizes all 3 existing investigations
- M10 (Motor de Investigación Autónomo) follows M9 — automated pipeline with human gates
- M6 (Investigations) is the merge point: needs M2, M3, M4, M5
