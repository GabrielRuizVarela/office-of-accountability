# Memories

## Patterns

### mem-1773735012-9408
> Como Voto data: legislators.json (compact, fields k/n/c/b/p/co/tv/pres), votaciones.json (id/title/date/result/type/tallies), per-legislator at legislators/<NAME_KEY>.json (votes array with vid/ch/t/d/yr/v/tp/url). Fetch base: https://raw.githubusercontent.com/rquiroga7/Como_voto/main/docs/data/. Legislators identified by uppercase name key, no numeric IDs. 2258 legislators, 5494 sessions.
<!-- tags: como-voto, etl, data-source | created: 2026-03-17 -->

### mem-1773734348-7d9f
> Neo4j schema init at lib/neo4j/schema.ts: 8 unique constraints, 3 fulltext indexes, 5 range indexes. All idempotent (IF NOT EXISTS). Run via npm run db:init-schema. Each statement runs in own implicit tx (Neo4j CE cannot batch schema commands in explicit tx).
<!-- tags: neo4j, schema, database | created: 2026-03-17 -->

## Decisions

## Fixes

## Context
