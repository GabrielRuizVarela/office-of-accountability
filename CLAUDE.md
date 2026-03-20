# Office of Accountability

Civic knowledge platform for investigative research. Primary case: Jeffrey Epstein investigation.

## Stack
- Next.js 16 + Vite + React 19 + TailwindCSS 4
- Neo4j 5 Community (graph database, Docker)
- neo4j-driver-lite (ESM/browser build)
- Qwen 3.5 9B (local LLM via llama.cpp on GPU)
- TypeScript, Zod 4

## Key Commands
```bash
pnpm run dev                    # Start dev server
pnpm run ingest:backfill        # Tag existing nodes as gold
pnpm run ingest:wave1           # Import rhowardstone data
pnpm run ingest:wave2           # Import from Epstein Exposed API
pnpm run ingest:wave3           # Document content enrichment
pnpm run ingest:wave4           # Import dleerdefi handwritten logbooks
pnpm run ingest:review -- --wave N  # Review wave quality
pnpm run ingest:promote -- --wave N --to silver  # Promote tier
```

## Environment
```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
MIROFISH_API_URL=http://localhost:8080  # llama.cpp server
```

## Architecture Notes
- All Neo4j queries use parameterized Cypher (never interpolate user input)
- LIMIT clauses need `neo4j.int(n)` — JS numbers are floats
- Graph API rewrote to two-pass to avoid O(n^2) on large graphs
- Confidence tiers: gold (curated) > silver (web-verified) > bronze (raw ingested)
- Qwen 3.5 uses mandatory thinking mode — check `reasoning_content` field, not just `content`
