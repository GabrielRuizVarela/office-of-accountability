<!-- Freshness: 2026-03-27 -->
# Architecture Codemap

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
│  react-force-graph-2d  |  Tiptap  |  next-intl      │
└──────────────────────────┬──────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────┐
│              Next.js 16 + Vite 8 (Server)            │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Middleware│  │ API Routes│  │   Page Routes     │  │
│  │ (CSRF,   │──▶ /api/caso │  │   /caso/[slug]   │  │
│  │  Rate    │  │ /api/graph│  │   /explorar      │  │
│  │  Limit,  │  │ /api/og   │  │   /politico      │  │
│  │  Headers)│  └─────┬─────┘  └───────────────────┘  │
│  └──────────┘        │                               │
│                      │ Cypher (parameterized)        │
│              ┌───────▼────────┐                      │
│              │  neo4j-driver  │                      │
│              │    -lite       │                      │
│              └───────┬────────┘                      │
└──────────────────────┼──────────────────────────────┘
                       │ Bolt (TCP/WS)
               ┌───────▼────────┐
               │  Neo4j 5       │
               │  Community     │
               │  (Docker)      │
               └────────────────┘
```

## Request Flow

```
Request → Middleware (IP extract → Rate limit → CSRF check → Security headers)
        → API Route (Zod validate → Neo4j query → JSON response)
        → or Page Route (Server render → Client hydrate → ForceGraph mount)
```

## Key Modules

| Module | Path | Purpose |
|--------|------|---------|
| Middleware | `src/middleware.ts` | CSRF, rate limit, security headers |
| Neo4j | `src/lib/neo4j/` | Driver, schema, config, types |
| Auth | `src/lib/auth/` | CSRF token gen/verify |
| Rate Limit | `src/lib/rate-limit/` | Sliding window per IP |
| Graph | `src/lib/graph/` | Query builders, BFS pathfinding |
| Ingestion | `src/lib/ingestion/` | Dedup, quality, wave reporting |
| Config | `src/config/` | Investigation registry, roadmap |
| i18n | `src/i18n/` | ES/EN locale, next-intl |

## Investigation Architecture

Each `caso-*` follows a consistent pattern:

```
src/lib/caso-{slug}/
  ├── types.ts              # Zod schemas, TypeScript types
  ├── investigation-data.ts # Seed data (factchecks, timeline, actors, money, evidence)
  └── queries.ts            # Neo4j Cypher queries (optional)

src/app/caso/{slug}/
  ├── layout.tsx            # Navigation wrapper
  ├── page.tsx              # Landing
  ├── resumen/page.tsx      # Summary
  ├── investigacion/        # Investigation content
  ├── conexiones/ or grafo/ # Graph visualization
  ├── cronologia/           # Timeline
  ├── dinero/               # Financial flows
  └── evidencia/            # Documents

src/app/api/caso/[slug]/
  ├── graph/route.ts        # Subgraph API
  ├── proximity/route.ts    # Co-location analysis
  └── simulation/           # LLM what-if analysis
```

## Data Flow

```
Public Data Sources
    │
    ▼
ETL Pipelines (src/etl/*)
    │ Zod validation, dedup, tier assignment
    ▼
Neo4j Knowledge Graph
    │ 24 node labels, 40+ relationship types
    ▼
API Routes (/api/caso/[slug]/graph, /api/graph/*)
    │ Parameterized Cypher, two-pass queries
    ▼
React Components (ForceGraph, Investigation views)
```

## Confidence Tier System

```
gold   ← Manual curation, 2+ independent sources, human review only
silver ← Web-verified against credible sources, /investigate-loop
bronze ← Raw ingested, not independently verified
```
