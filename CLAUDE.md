# Office of Accountability

Civic knowledge platform for investigative research. Multiple active investigation cases.

## Stack
- Next.js 16 + Vite + React 19 + TailwindCSS 4
- Neo4j 5 Community (graph database, Docker)
- neo4j-driver-lite (ESM/browser build)
- Qwen 3.5 9B (local LLM via llama.cpp on GPU)
- TypeScript, Zod 4

## Key Commands
```bash
pnpm run dev                    # Start dev server
pnpm run cross-ref              # Run CUIT/DNI entity resolution engine
```

Discover case-specific commands: `grep -E '"[^"]+":' webapp/package.json | grep -i "ingest\|cross\|etl"`

## Environment
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
MIROFISH_API_URL=http://localhost:8080  # llama.cpp server
```

## Architecture Notes
- All Neo4j queries use parameterized Cypher (never interpolate user input)
- LIMIT clauses need `neo4j.int(n)` or `toInteger($limit)` — JS numbers are floats
- Graph API uses two-pass queries to avoid O(n^2) cartesian products
- Confidence tiers: gold (curated) > silver (web-verified) > bronze (raw ingested)
- Qwen 3.5 uses mandatory thinking mode — check `reasoning_content` field, not just `content`
- Investigation data files use bilingual (ES primary, EN secondary) typed arrays
- ForceGraph components freeze nodes with fx/fy after layout converges (no animation)
- Cross-reference engine uses in-memory Map joins (Cypher cartesian joins timeout on large sets)
- Fuzzy name matching (Levenshtein) capped at 10K targets — always verify against document IDs

## Project Layout
- `src/lib/caso-*/` — per-case investigation data, queries, types
- `src/app/caso/*/` — per-case page routes (resumen, investigacion, conexiones, etc.)
- `src/app/api/caso/*/` — per-case API routes
- `src/etl/*/` — ETL pipelines per data source
- `src/etl/cross-reference/` — CUIT/DNI entity resolution engine (matchers, loader, types)
- `src/components/graph/` — shared ForceGraph component
- `scripts/` — standalone scripts (cross-ref runner, schema init, ingestion)
