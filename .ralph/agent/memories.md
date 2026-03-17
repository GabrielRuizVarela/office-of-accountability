# Memories

## Patterns

### mem-1773733328-e765
> neo4j-driver-lite v5.28.3 installed. Client wrapper at lib/neo4j/client.ts exports: readQuery, writeQuery, executeWrite, withReadTransaction, withWriteTransaction, verifyConnectivity, closeDriver. Config validated with zod from env vars. Auth uses basic('neo4j','') for no-auth dev mode (undefined not accepted by driver).
<!-- tags: neo4j, client, architecture | created: 2026-03-17 -->

### mem-1773727840-4222
> Vinext setup: create Next.js app first with create-next-app, then npm install -D vinext vite @vitejs/plugin-react @vitejs/plugin-rsc react-server-dom-webpack, then npx vinext init. Scripts: dev=vite dev, build=vite build. Build completes in ~2s.
<!-- tags: vinext, setup, cloudflare | created: 2026-03-17 -->

## Decisions

## Fixes

### mem-1773734686-67dd
> npm lockfile was broken by pnpm-installed node_modules (workspace: protocol). Fix: rm -rf node_modules && npm install. Lockfile regenerated clean with 439 packages.
<!-- tags: npm, lockfile, pnpm | created: 2026-03-17 -->

### mem-1773732524-f1a2
> Neo4j 5 Docker on this machine: first startup ~12min with many containers running. bcrypt password init extremely slow (~20min) — use NEO4J_AUTH=none for dev. cypher-shell JVM too heavy for healthcheck timeout — use wget HTTP check instead. start_period=300s minimum.
<!-- tags: neo4j, docker, performance | created: 2026-03-17 -->

## Context
