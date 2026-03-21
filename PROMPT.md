# Office of Accountability — Implementation Prompt

## Objective

Build a civic knowledge platform for Argentine politics as an interactive graph explorer. The platform links politicians, votes, legislation, donors, promises, and user-contributed research into a single explorable, queryable system powered by Neo4j and deployed on Cloudflare Workers via Vinext.

## Stack

- **Frontend + API + SSR:** Vinext (App Router, Server Components, Route Handlers) → Cloudflare Workers
- **Database:** Neo4j 5 Community (primary store for all data)
- **Neo4j Driver:** neo4j-driver-lite (Bolt over WebSocket) — browser/ESM build, Workers-native
- **Graph Visualization:** react-force-graph-2d
- **Rich Text Editor:** TipTap (investigation documents)
- **Auth:** Auth.js (email/password + Google OAuth)
- **Cache:** Cloudflare KV (ISR for politician pages)
- **Data Source:** Como Voto pipeline (Gold-tier legislative data)

## Key Requirements

1. **Neo4j-first architecture** — every entity is a node, every relationship is an edge. No relational DB at launch.
2. **Bolt over WebSocket** — neo4j-driver-lite ESM build connects from Workers via `wss://`. HTTP API is fallback only.
3. **Como Voto ingestion** — seed 329 legislators (257 Diputados + 72 Senadores) with full vote history as Gold-tier data.
4. **Graph explorer** — react-force-graph-2d with click-to-expand, type filters, search, zoom/pan. Mobile-responsive.
5. **Politician profiles** — server-rendered at `/politico/[slug]` with ISR, Schema.org markup, OG tags. SEO-optimized for "[name] votaciones".
6. **Investigation engine** — TipTap editor with custom extensions for embedding graph nodes and sub-graphs inline. Publish creates `REFERENCES` edges.
7. **Provenance on everything** — every node/edge carries source_url, submitted_by, tier (gold/silver/bronze), confidence_score, ingestion_hash.
8. **Auth + verification tiers** — Tier 0 (read-only), Tier 1 (email-verified, can contribute), future Tier 2 (DNI-verified).
9. **Security hardened** — rate limiting on all endpoints, input validation with Zod, Cypher injection prevention, XSS sanitization, CSRF protection, no secrets in code.
10. **WhatsApp-first sharing** — auto-generated OG images (1200x630) for politicians, investigations, and votes.
11. **Investigation standardization** — three investigations (Caso Libra, Caso Finanzas Politicas, Caso Epstein) unified under `InvestigationConfig` schema subgraph in Neo4j. Generic labels (`Person`, `Organization`, `Event`, etc.) with `caso_slug` property for namespace isolation, prefixed IDs (`{caso_slug}:{local_id}`). Unified API at `/api/casos/[casoSlug]/*` (7 endpoints: graph, nodes/[type], node/[slug], timeline, schema, submissions, stats). Schema-aware query builder generates Cypher dynamically from `NodeTypeDefinition` nodes. Config-driven frontend with `InvestigationClientConfig` registry (tabs, feature flags, hero text, chapters). Per-investigation backend modules (`lib/caso-{slug}/`) with types, queries, transform, config. Caso Libra migrates from `CasoLibra*` prefixed labels. Finanzas Politicas imports narrative data from static TypeScript. Epstein imports full rhowardstone dataset (606 KG entities + 1,614 persons registry) with victim pseudonymization.

## Milestones (sequential with noted parallelism)

| # | Name | Goal | Depends On |
|---|------|------|------------|
| 0 | Scaffolding | Vinext + Neo4j dev env, Workers↔Neo4j Bolt/WS connectivity proven | — |
| 1 | Data Ingestion | 329 legislators + vote history in Neo4j via Como Voto | M0 |
| 2 | Graph API | API routes serving `{ nodes, links }` for react-force-graph-2d | M1 |
| 3 | Graph Explorer | Interactive visualization (parallel with M4) | M2 |
| 4 | Politician Profiles | SSR pages with SEO (parallel with M3) | M2 |
| 5 | Auth | User accounts + roles (parallel with M1-M4) | M0 |
| 6 | Investigations | TipTap editor + graph embeds + publish flow | M2, M3, M4, M5 |
| 7 | Share & Distribution | OG images, WhatsApp cards, PDF export | M4, M6 |
| 8 | Seed Content + Launch | 3-5 seed investigations, security audit, launch | All |
| 9 | Investigation Standardization | Unified config, generic labels, unified API, schema-driven frontend for all 3 investigations | M0-M8 |

## Acceptance Criteria

**Given** a fresh environment,
**When** `docker compose up` is run,
**Then** Neo4j is healthy with Bolt + WS listeners and the app loads at localhost:3000.

**Given** the Como Voto pipeline has run,
**When** querying `MATCH (p:Politician) RETURN count(p)`,
**Then** the result is 329, with every politician having CAST_VOTE and REPRESENTS relationships.

**Given** a deployed Worker,
**When** `GET /api/graph/node/{id}` is called,
**Then** it returns `{ nodes, links }` JSON within 200ms, or 503 if Neo4j is unreachable.

**Given** an unauthenticated user,
**When** visiting `/politico/cristina-fernandez`,
**Then** they see a server-rendered page with vote history, graph sub-view, Schema.org JSON-LD, and OG tags.

**Given** a Tier 1 user,
**When** creating an investigation with graph node embeds and publishing it,
**Then** `REFERENCES` edges are created in Neo4j and the investigation appears on referenced politicians' profiles.

**Given** a published investigation URL shared on WhatsApp,
**When** the recipient opens it,
**Then** a preview card renders with title, summary, and auto-generated image.

**Given** the investigation standardization scripts have run,
**When** querying `MATCH (c:InvestigationConfig) RETURN c.id`,
**Then** three configs exist: `caso-libra`, `caso-finanzas-politicas`, `caso-epstein`, each with `SchemaDefinition` → `NodeTypeDefinition` + `RelTypeDefinition` subgraphs.

**Given** a standardized investigation,
**When** `GET /api/casos/caso-libra/graph` is called,
**Then** it returns `{ nodes, links }` with all generic-labeled nodes filtered by `caso_slug: "caso-libra"`.

**Given** any investigation slug,
**When** visiting `/caso/[slug]`,
**Then** the landing page renders using the investigation's `InvestigationClientConfig` (hero, stats, tabs) with no hardcoded per-investigation logic.

**Given** an unknown investigation slug,
**When** `GET /api/casos/nonexistent/graph` is called,
**Then** it returns 404.

## References

- Full PRD: `PRD.md`
- Task breakdown: `TASKS.md`
- Data source: [Como Voto](https://github.com/rquiroga7/Como_voto)
- Graph reference: [br-acc](https://github.com/World-Open-Graph/br-acc) (Neo4j at 220M+ nodes, similar domain)
