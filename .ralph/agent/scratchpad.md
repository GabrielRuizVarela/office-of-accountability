# Scratchpad — Office of Accountability

## 2026-03-17 — Iteration 1: Orientation & M0 Start

### Understanding
- Building a civic knowledge platform for Argentine politics as a graph explorer
- Stack: Vinext (Cloudflare's Vite-based Next.js replacement) + Neo4j + react-force-graph-2d
- Vinext: `npm create vinext@latest`, supports App Router, deploys to Cloudflare Workers
- 8 milestones, starting with M0: Scaffolding

### Plan for M0 (Scaffolding)
Break into atomic tasks:
1. **Initialize Vinext app** — `npm create vinext@latest` in webapp/, TypeScript, Tailwind CSS
2. **Docker Compose** — Neo4j 5 Community with Bolt+WS listeners + dev server
3. **Project structure** — lib/neo4j/, lib/graph/, components/, etl/ directories
4. **Neo4j schema init script** — constraints + indexes
5. **.env.example** — Neo4j connection config
6. **ESLint + Prettier** — config files
7. **Neo4j client wrapper** — lib/neo4j/client.ts with typed query helpers
8. **Spike: neo4j-driver-lite in Workers** — validate Bolt/WS connectivity

### This iteration
Picking task 1: Initialize Vinext app. Foundation for everything else.
