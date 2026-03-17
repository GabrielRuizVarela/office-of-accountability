# Tasks — Office of Accountability

**Version:** 0.3
**Date:** 2026-03-17
**Stack:** Vinext (App Router) + Neo4j 5 Community + react-force-graph-2d + Cloudflare Workers
**Neo4j transport:** Bolt over WebSocket (neo4j-driver-lite browser/ESM build) — HTTP API as fallback only (deprecated in 5.26)

---

## Milestone 0: Project Scaffolding

**Goal:** Bootable dev environment with Neo4j running, Workers ↔ Neo4j connectivity proven, CI green.

### Setup
- [ ] Initialize Vinext app (App Router, TypeScript, Tailwind CSS)
- [ ] Set up Docker Compose: Neo4j 5 Community + Vinext dev server
- [ ] Create Neo4j schema initialization script (constraints + indexes)
  - Unique constraints: Politician.id, Legislation.expediente_id, LegislativeVote.acta_id
  - Full-text indexes: Politician.name, Legislation.title
  - Inspired by br-acc's `init.cypher` pattern
- [ ] Establish project structure:
  ```
  app/              — Vinext App Router pages + API routes
  lib/neo4j/        — Bolt/WS client wrapper, query helpers
  lib/graph/        — Graph data transforms (Neo4j records -> API responses)
  components/       — React components
  etl/              — Data ingestion scripts
  ```
- [ ] Create `.env.example` with Neo4j connection config (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
  - NEO4J_URI uses `wss://` scheme for Bolt over WebSocket (e.g., `wss://neo4j.example.com:7688`)
- [ ] Add ESLint + Prettier config
- [ ] Configure `vinext.config.ts` for Cloudflare Workers deployment

### Neo4j Connectivity Spike (CRITICAL PATH)

Workers run on V8 isolates — no Node.js `net`/`tls` modules. Standard `neo4j-driver` uses TCP sockets and won't work. Three options evaluated:

| Option | Transport | Status | Risk |
|--------|-----------|--------|------|
| **A: neo4j-driver-lite over WebSocket** | Bolt over WS | **Primary — validate first** | Browser build may need polyfills in Workers |
| B: Neo4j HTTP API | HTTP fetch() | Fallback only | Deprecated in Neo4j 5.26, will be removed |
| C: Workers TCP connect() + Bolt | Raw TCP | Rejected | Would require forking driver transport layer |

**Primary path: Option A (Bolt over WebSocket)**

- [ ] **SPIKE-1:** neo4j-driver-lite ESM build imports cleanly in Vinext/Workers
  - Install `neo4j-driver-lite` — browser/ESM build uses WebSocket transport
  - Verify: import resolves, no Node.js-only APIs referenced at build time
  - If import fails: identify missing polyfills (likely `globalThis.WebSocket` — Workers have it natively)
- [ ] **SPIKE-2:** Neo4j WebSocket listener configuration
  - Enable Bolt over WebSocket on Neo4j instance (Docker + production)
  - Docker Compose: add `NEO4J_server_bolt_listen__address__ws=0.0.0.0:7688` or equivalent config
  - Production (Railway/Fly.io): configure WS listener, expose port, enable TLS
  - Connection URI: `wss://host:7688` for production, `ws://localhost:7688` for dev
- [ ] **SPIKE-3:** Round-trip query from Worker → Neo4j via Bolt/WS
  - Deploy minimal Worker with one Cypher query: `RETURN 1 AS ok`
  - Verify: response arrives, latency acceptable (expect 20-80ms edge → Railway)
  - Test multiple queries in single invocation (no connection pool — each invocation opens fresh)
  - Test error case: Neo4j down → Worker returns 503 gracefully
- [ ] **SPIKE-4:** Validate Workers constraints don't break driver
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

- [ ] `lib/neo4j/client.ts` — unified client interface regardless of transport
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
- [ ] Security headers middleware: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`

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
- [ ] ETL script to fetch Como Voto JSON output (`etl/como-voto.ts`)
- [ ] Normalize Como Voto data to Neo4j nodes:
  - `Politician` — name, bloc, coalition, chamber, photo_url
  - `LegislativeVote` — acta_id, date, position (afirmativo/negativo/abstencion/ausente)
  - `Legislation` — title, expediente_id, status, chamber
  - `Jurisdiction` — level, name (province)
- [ ] Create relationships:
  - `(:Politician)-[:CAST_VOTE]->(:LegislativeVote)`
  - `(:LegislativeVote)-[:ON_LEGISLATION]->(:Legislation)`
  - `(:Politician)-[:REPRESENTS]->(:Jurisdiction)`
- [ ] Data validation: reject malformed records, log warnings with line/record context
- [ ] Deduplication: match politicians across chambers/sessions by name + jurisdiction
- [ ] Seed script: `npm run seed` — one-command full ingestion

### Security
- [ ] ETL runs locally or in CI — never from Workers (no user input path)
- [ ] Sanitize all string fields before Neo4j insertion (prevent Cypher injection via data)
- [ ] Validate Como Voto JSON schema with Zod before processing

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
- [ ] Typed query helpers built on M0 client wrapper (`lib/neo4j/queries.ts`)
- [ ] Graph response transformer: Neo4j records → `{ nodes, links }` for react-force-graph-2d
  - Nodes: `{ id, label, type, properties }`
  - Links: `{ source, target, type, properties }`

### API Routes
- [ ] `GET /api/graph/node/[id]` — single node + 1-hop connections
- [ ] `GET /api/graph/expand/[id]?depth=1` — expand connections (configurable depth, default 1, max 3)
- [ ] `GET /api/graph/search?q=` — full-text search across Politician.name, Legislation.title
- [ ] `GET /api/graph/query` — structured graph queries (node type filters, date range, jurisdiction)
- [ ] Cursor-based pagination on search and query endpoints

### Security & Rate Limiting
- [ ] Input validation with Zod on all query parameters
- [ ] Depth parameter clamped to max 3 (prevent expensive traversals)
- [ ] Query timeout: 5s max per Neo4j query (prevent graph bombs)
- [ ] Rate limiting via Cloudflare Rate Limiting Rules:
  - Read endpoints: 60 req/min per IP
  - Search endpoint: 30 req/min per IP (heavier query)
- [ ] Error handling: structured error responses, no Neo4j internals leaked
- [ ] Node ID validation: reject non-UUID/non-integer IDs before query
- [ ] Response size cap: max 500 nodes per response (prevent memory exhaustion)

### Verification
- [ ] `GET /api/graph/node/{politician_id}` → returns node + connections in `{ nodes, links }` format
- [ ] `GET /api/graph/expand/{id}?depth=2` → returns 2-hop neighborhood
- [ ] `GET /api/graph/expand/{id}?depth=5` → clamped to 3, returns 3-hop
- [ ] `GET /api/graph/search?q=cristina` → returns fuzzy matches, handles accents
- [ ] `GET /api/graph/search?q=` (empty) → returns 400 with structured error
- [ ] `GET /api/graph/node/nonexistent` → returns 404 with structured error
- [ ] 100+ requests in 1 minute → returns 429
- [ ] Malformed query params → 400, not 500
- [ ] Neo4j down → graceful 503, Sentry alert, no stack trace leaked

**Dependencies:** Milestone 1

---

## Milestone 3: Graph Explorer (Frontend)

**Goal:** Interactive graph visualization — click a politician, see connections fan out.

*Can run in parallel with Milestone 4.*

### Graph Canvas
- [ ] react-force-graph-2d integration (following br-acc's GraphCanvas pattern)
- [ ] Node rendering by type — distinct colors, sizes, labels per node type:
  - Politician (blue, large), LegislativeVote (green/red by position), Legislation (purple), Jurisdiction (gray)
  - Follow br-acc's `nodeRendering.ts` pattern
- [ ] Edge rendering by relationship type (line style, color, label)
- [ ] Click-to-expand: click a node → fetch + display 1-hop connections
- [ ] Node tooltip on hover: key properties (name, party, province for Politician; title, date for Vote)

### Controls & Navigation
- [ ] Filter sidebar: filter by node type (checkboxes), date range (for votes/legislation)
- [ ] Zoom controls + minimap for orientation
- [ ] Search bar with autocomplete (hits `/api/graph/search`)
- [ ] Keyboard navigation: Tab between nodes, Enter to expand, Escape to deselect
- [ ] Loading states + empty states

### Mobile
- [ ] Mobile-responsive layout (graph fills viewport, sidebar collapses to bottom sheet)
- [ ] Touch: pinch-to-zoom, tap-to-select, long-press for tooltip

### Security
- [ ] Sanitize all node labels/properties before rendering (prevent stored XSS via graph data)
- [ ] CSP: restrict script sources, disallow inline scripts

### Verification (E2E)
- [ ] Load `/explorar` → graph canvas renders with nodes visible
- [ ] Click politician node → triggers expand API call → new nodes appear
- [ ] Type in search bar → autocomplete dropdown appears → select result → graph centers on node
- [ ] Toggle node type filter off → those nodes disappear from canvas
- [ ] Mobile viewport (375px) → sidebar collapses to bottom sheet, graph is interactive
- [ ] Tab navigation: can reach and expand nodes via keyboard only

**Dependencies:** Milestone 2

---

## Milestone 4: Politician Profiles (SEO)

**Goal:** Server-rendered politician pages that rank in Google for "[politician name] votaciones".

*Can run in parallel with Milestone 3.*

### Pages
- [ ] Page route: `/politico/[slug]` — server-rendered with Server Components, ISR via Cloudflare KV
- [ ] Slug generation: normalize name to URL-safe slug (handle accents, spaces)
- [ ] Graph sub-view: react-force-graph-2d centered on the politician node (1-hop)
- [ ] Tabs layout:
  - **Conexiones** — graph sub-view (default)
  - **Votaciones** — vote history table
  - **Investigaciones** — empty state until M6 ("Proximamente")
- [ ] Vote history: filterable by date/legislation, paginated, color-coded by position
  - Afirmativo (green), Negativo (red), Abstencion (yellow), Ausente (gray)
- [ ] Province-first browse page: `/provincias/[province]` — list politicians by province
- [ ] Fuzzy search with accent handling (e.g., "Cristina" matches "Cristina Fernandez")
- [ ] Breadcrumb navigation: Home > Provincia > Politician

### SEO
- [ ] Schema.org structured data: `Person` + `GovernmentOrganization`
- [ ] OG tags: auto-generated per politician (name, party, province, photo)
- [ ] `sitemap.xml` generation: all politician slugs + province pages
- [ ] Canonical URLs to prevent duplicate content

### Security
- [ ] Slug validation: reject traversal attempts (`../`, encoded slashes)
- [ ] ISR cache: set appropriate `stale-while-revalidate` — no serving stale data indefinitely
- [ ] Sanitize all politician data before HTML rendering (prevent stored XSS)

### Verification
- [ ] `GET /politico/cristina-fernandez` → 200, contains Schema.org JSON-LD
- [ ] `GET /politico/nonexistent-slug` → 404 page
- [ ] `curl /politico/cristina-fernandez` → HTML contains politician name in body (server-rendered, not client-only)
- [ ] OG tags present: `og:title`, `og:image`, `og:description`
- [ ] Vote history tab: table renders, pagination works, colors match position
- [ ] `/provincias/buenos-aires` → lists all Buenos Aires politicians
- [ ] `/sitemap.xml` → contains all politician URLs
- [ ] `/politico/../../etc/passwd` → 404, not error

**Dependencies:** Milestone 2

---

## Milestone 5: User Accounts + Auth

**Goal:** Users can register, log in, and own content. Auth in place before investigation engine.

### Auth Setup
- [ ] Auth.js setup: email + password provider (credentials)
- [ ] Optional social login (Google OAuth)
- [ ] User registration with email verification
- [ ] User profile page (`/perfil`)
- [ ] Role system:
  - `observador` — no account, read-only (default)
  - `participante` — registered user, can create investigations

### Security
- [ ] Password hashing: bcrypt with cost factor >= 12
- [ ] Session tokens: HTTP-only, Secure, SameSite=Lax cookies
- [ ] CSRF protection on all state-changing endpoints
- [ ] Rate limiting on auth endpoints:
  - Login: 5 attempts/min per IP, 10 attempts/hour per email
  - Registration: 3 accounts/hour per IP
  - Password reset: 3 requests/hour per email
- [ ] Account lockout: temporary lock after 10 failed login attempts
- [ ] Email verification tokens: expire after 24h, single-use
- [ ] Password requirements: min 8 chars, check against breached password list (haveibeenpwned k-anonymity API)
- [ ] Auth middleware: protect all mutation API routes
- [ ] Session expiry: 7 days idle, 30 days absolute
- [ ] Secure password reset flow: time-constant token comparison, expire on use

### Verification
- [ ] Register with email → verification email sent → verify → can log in
- [ ] Login with correct credentials → session cookie set (HTTP-only, Secure)
- [ ] Login with wrong password → generic error ("Invalid credentials"), no user enumeration
- [ ] 6th login attempt in 1 minute → 429, account not locked yet
- [ ] 11th failed attempt → temporary account lockout
- [ ] Unauthenticated `POST /api/investigations` → 401
- [ ] Expired session → 401, redirect to login
- [ ] CSRF: POST without token → 403
- [ ] Registration from same IP 4 times in 1 hour → 429

**Dependencies:** Milestone 0

---

## Milestone 6: Investigation Engine

**Goal:** Users can create, publish, and read investigations that embed graph data.

### Data Model
- [ ] Neo4j `Investigation` node: title, slug, body (TipTap JSON), status (draft/published), author_id, tags, referenced_node_ids, created_at, updated_at

### API Routes
- [ ] `GET /api/investigations` — list published investigations (paginated, filterable by tag)
- [ ] `GET /api/investigations/[slug]` — get single investigation by slug (public)
- [ ] `POST /api/investigations` — create investigation (authenticated)
- [ ] `PATCH /api/investigations/[id]` — update investigation (author only)
- [ ] `DELETE /api/investigations/[id]` — delete investigation (author only, drafts immediate, published require confirm)
- [ ] Input validation with Zod on all mutation routes
- [ ] On publish: create `(:Investigation)-[:REFERENCES]->(node)` edges for all embedded nodes

### TipTap Editor
- [ ] Base TipTap editor: headings, lists, links, images, blockquotes
- [ ] Custom extension: **Graph node embed** — renders as interactive card showing node properties
- [ ] Custom extension: **Sub-graph embed** — renders react-force-graph-2d inline within the document
- [ ] Custom extension: **Edge/relationship citation** — inline reference with provenance tooltip

### Reading Experience
- [ ] Page route: `/investigacion/[slug]` — server-rendered for SEO
- [ ] Beautiful typography, mobile-first layout
- [ ] Embedded graph nodes are interactive (click to navigate to node/profile)
- [ ] OG tags with investigation title + summary

### Index Page
- [ ] Page route: `/investigaciones` — grid/list of published investigations
- [ ] Filter by tag, sort by date
- [ ] Investigation cards: title, author, date, tag badges, excerpt

### Cross-linking
- [ ] Investigations appear on politician profile pages (Investigations tab) when they reference that politician
- [ ] "My investigations" dashboard (`/mis-investigaciones`) — drafts + published

### Security & Rate Limiting
- [ ] Authorization: only author can edit/delete their own investigations
- [ ] TipTap content sanitization: strip dangerous HTML, validate embed node IDs exist
- [ ] Embedded node IDs: validate against Neo4j before saving (prevent phantom references)
- [ ] Rate limiting on mutations:
  - Create: 10 investigations/hour per user
  - Update: 60 updates/hour per user
- [ ] Body size limit: 500KB max per investigation (prevent storage abuse)
- [ ] Slug generation: sanitize, deduplicate (append `-2`, `-3` on collision)
- [ ] Image uploads: validate MIME type, max 5MB, scan for embedded scripts

### Verification
- [ ] Create investigation with graph node embeds → saves TipTap JSON to Neo4j
- [ ] Publish investigation → `REFERENCES` edges created for all embedded nodes
- [ ] `GET /investigacion/[slug]` → server-rendered HTML contains embedded node data
- [ ] Embedded graph node card → clicking navigates to `/politico/[slug]`
- [ ] `/investigaciones` → lists only published investigations, not drafts
- [ ] Author edits own investigation → 200
- [ ] Other user edits same investigation → 403
- [ ] Author deletes own draft → 200, node removed
- [ ] Delete published investigation → confirmation required
- [ ] Investigation references politician → appears on politician's Investigations tab
- [ ] `/mis-investigaciones` → shows only current user's investigations
- [ ] TipTap body with `<script>` tag → stripped on save
- [ ] Embed with non-existent node ID → rejected with 400
- [ ] 11th investigation created in 1 hour → 429

**Dependencies:** Milestones 2, 3 (for graph embeds), 5 (for auth)

---

## Milestone 7: Share & Distribution

**Goal:** Every page on the platform shares beautifully on WhatsApp and social media.

### Share Cards
- [ ] WhatsApp-optimized share cards (1200x630, auto-generated):
  - Per investigation: title + graph snippet + key finding
  - Per politician: photo + name + party + key stats
  - Per vote: legislator photo + vote position + legislation title
- [ ] OG tag generation for every shareable URL
- [ ] "Compartir por WhatsApp" first-class button on every page

### Export
- [ ] Share link with preview for investigations
- [ ] PDF export for investigations (following br-acc's pattern)
  - Export as clean PDF with embedded graph snapshots
  - Include provenance footer on every page

### Security & Rate Limiting
- [ ] OG image generation: rate limit 30 req/min per IP (image generation is CPU-heavy)
- [ ] PDF export: rate limit 5 exports/hour per user
- [ ] OG image: validate slug input, reject path traversal
- [ ] PDF: sanitize investigation content before rendering (no script execution in PDF engine)
- [ ] Share URLs: no auth tokens or session data in shareable links

### Verification
- [ ] OG image endpoint → returns 1200x630 PNG for politician, investigation, vote
- [ ] WhatsApp: share URL → preview card renders correctly (test with og-image debugger)
- [ ] PDF export → contains investigation text + graph snapshot images + provenance footer
- [ ] Share link for published investigation → opens without auth
- [ ] Share link for draft investigation → 404 (not 403, no information leak)
- [ ] 31st OG image request in 1 minute → 429

**Dependencies:** Milestones 4, 6

---

## Milestone 8: Seed Content + Launch

**Goal:** Platform launches with compelling seed investigations and open registration.

### Seed Content
- [ ] Author 3-5 seed investigations using ingested data:
  - "Quienes votan siempre juntos a pesar de estar en partidos diferentes?" — voting bloc analysis
  - "Promesas vs. votos" — promise alignment (requires manual promise data entry for 2-3 politicians)
  - Cross-party voting pattern analysis (achievable with existing Como Voto data)
- [ ] Manual data entry: 10-15 promises for 2-3 high-profile politicians (for seed investigation)

### Pre-Launch
- [ ] Internal review and polish: test all flows end-to-end
- [ ] Performance audit: Lighthouse scores > 80 on politician profiles, graph rendering < 2s for 200 nodes
- [ ] Pre-launch: recruit 2-3 anchor investigators (journalists, NGO analysts)

### Security Audit
- [ ] Dependency audit: `npm audit`, no critical/high vulnerabilities
- [ ] Secret scan: no API keys, passwords, or tokens in repo (use `gitleaks` or equivalent)
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
                     │         ├──→ M6 ──→ M7 ──→ M8
                     └──→ M4 ──┘
M0 ──→ M5 ─────────────────────┘
```

- M3 (Graph Explorer) and M4 (Politician Profiles) are parallel after M2
- M5 (Auth) is parallel with M1-M4 — only depends on M0
- M6 (Investigations) is the merge point: needs M2, M3, M4, M5
