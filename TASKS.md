# Tasks — Office of Accountability

**Version:** 0.1
**Date:** 2026-03-16
**Stack:** Vinext (App Router) + Neo4j 5 Community + react-force-graph-2d

---

## Milestone 0: Project Scaffolding

**Goal:** Bootable dev environment with Neo4j running, project structure in place, CI green.

- [ ] Initialize Vinext app (App Router, TypeScript, Tailwind CSS)
- [ ] Set up Docker Compose: Neo4j 5 Community + Vinext dev server
- [ ] Create Neo4j schema initialization script (constraints + indexes)
  - Unique constraints: Politician.id, Legislation.expediente_id, LegislativeVote.acta_id
  - Full-text indexes: Politician.name, Legislation.title
  - Inspired by br-acc's `init.cypher` pattern
- [ ] Establish project structure:
  ```
  app/              — Vinext App Router pages + API routes
  lib/neo4j/        — Driver wrapper, connection pool, query helpers
  lib/graph/        — Graph data transforms (Neo4j records -> API responses)
  components/       — React components
  etl/              — Data ingestion scripts
  ```
- [ ] Create `.env.example` with Neo4j connection config (NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
- [ ] Set up GitHub Actions CI: lint, type-check, test
- [ ] Add ESLint + Prettier config
- [ ] Configure `vinext.config.ts` for Cloudflare Workers deployment
- [ ] Verify: `docker compose up` starts Neo4j + Vinext, schema initializes, app loads at localhost:3000
- [ ] Verify: `vinext deploy` deploys to Cloudflare Workers successfully

**Dependencies:** None

---

## Milestone 1: Como Voto Data Ingestion

**Goal:** All 329 current legislators with full vote history queryable in Neo4j.

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
- [ ] Data validation: reject malformed records, log warnings
- [ ] Deduplication: match politicians across chambers/sessions by name + jurisdiction
- [ ] Seed script: `npm run seed` — one-command full ingestion
- [ ] Verify in Neo4j Browser:
  - 329 Politician nodes (257 Diputados + 72 Senadores)
  - Full vote history traversable
  - `MATCH (p:Politician)-[:CAST_VOTE]->(v)-[:ON_LEGISLATION]->(l) RETURN p.name, v.position, l.title LIMIT 10`

**Dependencies:** Milestone 0

---

## Milestone 2: Graph API Layer

**Goal:** API routes that serve graph data in a format compatible with react-force-graph-2d.

- [ ] Neo4j driver wrapper (`lib/neo4j/driver.ts`)
  - Connection pool management
  - Query helper with parameterized queries
  - Transaction support (read/write)
  - Error handling + connection retry
- [ ] API route: `GET /api/graph/node/[id]` — single node + 1-hop connections
- [ ] API route: `GET /api/graph/expand/[id]` — expand connections (configurable depth, default 1, max 3)
- [ ] API route: `GET /api/graph/search?q=` — full-text search across Politician.name, Legislation.title
- [ ] API route: `GET /api/graph/query` — structured graph queries (node type filters, date range, jurisdiction)
- [ ] Response format: `{ nodes: [...], links: [...] }` compatible with react-force-graph-2d
  - Nodes: `{ id, label, type, properties }`
  - Links: `{ source, target, type, properties }`
- [ ] Input validation with Zod on all query parameters
- [ ] Error handling: structured error responses, no Neo4j internals leaked
- [ ] Rate limiting on all endpoints

**Dependencies:** Milestone 1

---

## Milestone 3: Graph Explorer (Frontend)

**Goal:** Interactive graph visualization — click a politician, see connections fan out.

- [ ] react-force-graph-2d integration (following br-acc's GraphCanvas pattern)
- [ ] Node rendering by type — distinct colors, sizes, labels per node type:
  - Politician (blue, large), LegislativeVote (green/red by position), Legislation (purple), Jurisdiction (gray)
  - Follow br-acc's `nodeRendering.ts` pattern
- [ ] Edge rendering by relationship type (line style, color, label)
- [ ] Click-to-expand: click a node to fetch + display its 1-hop connections
- [ ] Node tooltip on hover: key properties (name, party, province for Politician; title, date for Vote)
- [ ] Filter sidebar:
  - Filter by node type (checkboxes)
  - Filter by date range (for votes/legislation)
- [ ] Zoom controls + minimap for orientation
- [ ] Mobile-responsive layout (graph fills viewport, sidebar collapses to bottom sheet)
- [ ] Search bar with autocomplete (hits `/api/graph/search`)
- [ ] Loading states + empty states

**Dependencies:** Milestone 2

---

## Milestone 4: Politician Profiles (SEO)

**Goal:** Server-rendered politician pages that rank in Google for "[politician name] votaciones".

- [ ] Page route: `/politico/[slug]` — server-rendered with Server Components, ISR via Cloudflare KV
- [ ] Slug generation: normalize name to URL-safe slug (handle accents, spaces)
- [ ] Graph sub-view: react-force-graph-2d centered on the politician node (1-hop)
- [ ] Tabs layout:
  - **Conexiones** — graph sub-view (default)
  - **Votaciones** — vote history table
  - **Promesas** — empty state placeholder ("Proximamente")
- [ ] Vote history: filterable by date/legislation, paginated, color-coded by position
  - Afirmativo (green), Negativo (red), Abstencion (yellow), Ausente (gray)
- [ ] Schema.org structured data: `Person` + `GovernmentOrganization`
- [ ] OG tags: auto-generated per politician (name, party, province, photo)
- [ ] Province-first browse page: `/provincias/[province]` — list politicians by province
- [ ] Fuzzy search with accent handling (e.g., "Cristina" matches "Cristina Fernández")
- [ ] Breadcrumb navigation: Home > Provincia > Politician

**Dependencies:** Milestone 2

---

## Milestone 5: Investigation Engine

**Goal:** Users can create, publish, and read investigations that embed graph data.

### Data Model
- [ ] Neo4j `Investigation` node: title, slug, body (TipTap JSON), status (draft/published), author_id, tags, referenced_node_ids, created_at, updated_at

### API Routes
- [ ] `GET /api/investigations` — list published investigations (paginated, filterable by tag)
- [ ] `GET /api/investigations/[slug]` — get single investigation by slug (public)
- [ ] `POST /api/investigations` — create investigation (authenticated)
- [ ] `PATCH /api/investigations/[id]` — update investigation (author only)
- [ ] Input validation with Zod on all mutation routes

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

**Dependencies:** Milestones 2, 3 (for graph embeds)

---

## Milestone 6: User Accounts + Auth

**Goal:** Users can register, log in, and own their investigations.

- [ ] Auth.js setup: email + password provider
- [ ] Optional social login (Google)
- [ ] User registration with email verification
- [ ] User profile page (`/perfil`)
- [ ] Role system:
  - `observador` — no account, read-only (default)
  - `participante` — registered user, can create investigations
- [ ] Investigation authoring tied to user account
- [ ] Draft/published lifecycle: only author can edit, publish toggles visibility
- [ ] "My investigations" dashboard (`/mis-investigaciones`)
- [ ] Protected API routes: auth middleware on mutation endpoints

**Dependencies:** Milestone 5

---

## Milestone 7: Share & Distribution

**Goal:** Every page on the platform shares beautifully on WhatsApp and social media.

- [ ] WhatsApp-optimized share cards (1200x630, auto-generated):
  - Per investigation: title + graph snippet + key finding
  - Per politician: photo + name + party + key stats
  - Per vote: legislator photo + vote position + legislation title
- [ ] OG tag generation for every shareable URL (verify with og:image debuggers)
- [ ] "Compartir por WhatsApp" first-class button on every page
- [ ] Share link with preview for investigations
- [ ] PDF export for investigations (following br-acc's pattern)
  - Export as clean PDF with embedded graph snapshots
  - Include provenance footer on every page

**Dependencies:** Milestones 4, 5, 6

---

## Milestone 8: Seed Content + Launch

**Goal:** Platform launches with compelling seed investigations and open registration.

- [ ] Author 3-5 seed investigations using ingested data:
  - "Quienes votan siempre juntos a pesar de estar en partidos diferentes?" — voting bloc analysis
  - "Promesas vs. votos" — promise alignment (requires manual promise data entry for 2-3 politicians)
  - "Donante -> legislador -> voto" — donor patterns (requires donor data ingestion for sample set)
- [ ] Internal review and polish: test all flows end-to-end
- [ ] Performance audit: Lighthouse scores, graph rendering performance
- [ ] Pre-launch: recruit 2-3 anchor investigators (journalists, NGO analysts)
- [ ] Launch checklist:
  - [ ] All seed investigations published
  - [ ] Registration flow working
  - [ ] OG tags verified on WhatsApp, Twitter, Facebook
  - [ ] Mobile experience tested on Android + iOS
  - [ ] Error monitoring in place (Sentry or equivalent)
  - [ ] Analytics in place (privacy-respecting: Plausible or Umami)

**Dependencies:** All previous milestones
