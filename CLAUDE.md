# Office of Accountability

Civic knowledge platform for investigative research. Three active cases: Argentine Political Finance, Jeffrey Epstein, Caso Libra.

## Stack
- Next.js 16 + Vite + React 19 + TailwindCSS 4
- Neo4j 5 Community (graph database, Docker)
- neo4j-driver-lite (ESM/browser build)
- Qwen 3.5 9B (local LLM via llama.cpp on GPU)
- TypeScript, Zod 4

## Key Commands
```bash
pnpm run dev                    # Start dev server
pnpm run cross-ref              # Run CUIT/DNI entity resolution (finanzas-politicas)
pnpm run ingest:backfill        # Tag existing nodes as gold
pnpm run ingest:wave1           # Import rhowardstone data (Epstein)
pnpm run ingest:wave2           # Import from Epstein Exposed API
pnpm run ingest:wave3           # Document content enrichment (Epstein)
pnpm run ingest:wave4           # Import dleerdefi handwritten logbooks (Epstein)
pnpm run ingest:review -- --wave N  # Review wave quality
pnpm run ingest:promote -- --wave N --to silver  # Promote tier
```

## Active Cases

| Case | Data Location | Nodes | Key Feature |
|------|--------------|-------|-------------|
| **Finanzas Politicas** | Platform labels (no caso_slug) | 317K CUIT entities, 840K DNI | Cross-label entity resolution: CUIT→DNI extraction |
| **Epstein** | `caso_slug: "caso-epstein"` | 10,864+ | Flight logs, document enrichment, victim network |
| **Libra** | `CasoLibra*` prefixed labels | ~500 | Token flows, wallet tracking, government comms |

## Environment
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
MIROFISH_API_URL=http://localhost:8080  # llama.cpp server
```

## Architecture Notes
- All Neo4j queries use parameterized Cypher (never interpolate user input)
- LIMIT clauses need `neo4j.int(n)` or `toInteger($limit)` — JS numbers are floats
- Graph API rewrote to two-pass to avoid O(n^2) on large graphs
- Confidence tiers: gold (curated) > silver (web-verified) > bronze (raw ingested)
- Qwen 3.5 uses mandatory thinking mode — check `reasoning_content` field, not just `content`

## Cross-Reference Engine (caso-finanzas-politicas)
- `src/etl/cross-reference/matchers.ts` — 3-tier matching: CUIT (1.0), DNI (0.95), Name (0.6-0.8)
- `src/etl/cross-reference/loader.ts` — 12 label-pair MERGE configs for SAME_ENTITY
- CUIT→DNI extraction: middle 8 digits of 11-digit CUIT (person prefixes 20/23/24/27)
- Fuzzy name matching capped at 10K targets to prevent multi-minute hangs
- Last run: 34,776 matches, 2,155 revolving door flags, 146 shell companies

## ForceGraph
- `src/components/graph/ForceGraph.tsx` — shared component, fx/fy frozen after layout
- `src/app/caso/finanzas-politicas/conexiones/ConexionesGraph.tsx` — custom graph with presets
- warmupTicks=300, cooldownTicks=0 for instant off-screen convergence
- Degree-0 isolated nodes hidden from both graphs
- filteredData memoized in ConexionesGraph to prevent hover-triggered resets

## Investigation Data Pattern
All cases use bilingual (ES primary, EN secondary) typed arrays:
- `FACTCHECK_ITEMS` — verified claims with status, tier, source
- `TIMELINE_EVENTS` — chronological events with categories
- `ACTORS` — key persons with roles and dataset presence
- `MONEY_FLOWS` — traced financial flows
- `IMPACT_STATS` — headline numbers for overview pages
