# Contributing to Office of Accountability

## Development Workflow

### Prerequisites

- **Node.js** 20+
- **pnpm** (package manager)
- **Docker** (for Neo4j)
- **Git**

### Setup

```bash
# Clone the repository
git clone https://github.com/GabrielRuizVarela/office-of-accountability.git
cd office-of-accountability

# Start Neo4j (dev mode — auth disabled)
docker compose up -d

# Install dependencies
cd webapp
pnpm install

# Configure environment
cp ../.env.example .env
# NEO4J_URI, NEO4J_USER are pre-filled for local dev
# Generate AUTH_SECRET: openssl rand -base64 32

# Initialize database schema
pnpm run db:init-schema

# Start dev server
pnpm run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173).

### Environment Variables

Copy `.env.example` to `webapp/.env` and configure:

| Variable | Dev Default | Notes |
|----------|------------|-------|
| `NEO4J_URI` | `bolt://localhost:7687` | Docker Neo4j |
| `NEO4J_USER` | `neo4j` | Default user |
| `NEO4J_PASSWORD` | *(empty)* | Auth disabled in dev |
| `APP_URL` | `http://localhost:3000` | App base URL |
| `AUTH_SECRET` | *(generate)* | `openssl rand -base64 32` |

Optional variables for specific features:

| Variable | Feature |
|----------|---------|
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth login |
| `MIROFISH_API_URL` | Local LLM simulation engine |
| `INVESTIGATION_API_KEY` | Investigation submission API (production) |

### Available Scripts

```bash
# Development
pnpm run dev              # Start dev server (Vite HMR)
pnpm run build            # Production build
pnpm run start            # Preview production build

# Quality
pnpm run lint             # ESLint
pnpm run lint:fix         # Auto-fix lint issues
pnpm run format           # Prettier format
pnpm run format:check     # Check formatting
pnpm run typecheck        # TypeScript strict check

# Testing
pnpm run test             # Vitest unit tests
npx playwright test       # E2E tests (needs running server + Neo4j)

# Database
pnpm run db:init-schema   # Create Neo4j constraints/indexes
```

### ETL & Ingestion

ETL pipelines ingest data from public sources into the Neo4j graph. Each pipeline is a standalone script:

```bash
# Run an ETL pipeline
pnpm run etl:como-voto          # Congressional voting records
pnpm run etl:comprar            # Federal procurement
pnpm run etl:contratar          # Federal contracts

# Seed investigation data
pnpm run ingest:dictadura:seed  # Caso dictadura seed data
pnpm run seed:clarin            # Clarin media group network

# Cross-reference
pnpm run cross-ref              # CUIT/DNI entity resolution
```

Discover all available scripts:
```bash
grep -E '"[^"]+":' webapp/package.json | grep -i "ingest\|cross\|etl\|seed"
```

## Code Standards

### TypeScript

- Strict mode enabled (`tsc --noEmit`)
- Zod 4 for runtime validation at system boundaries
- All Neo4j queries use parameterized Cypher — **never interpolate user input**

### Immutability

Always create new objects, never mutate:

```typescript
// Correct
function updateNode(node: GraphNode, tier: string): GraphNode {
  return { ...node, tier }
}
```

### File Organization

- 200-400 lines typical, 800 max
- Organize by feature/domain (e.g., `src/lib/caso-libra/`)
- Extract shared utilities to `src/lib/`

### Neo4j Query Patterns

```typescript
// Always use parameters
const result = await session.run(
  'MATCH (p:Person {slug: $slug}) RETURN p',
  { slug: userInput }
)

// Use neo4j.int() for LIMIT clauses
import neo4j from 'neo4j-driver-lite'
const result = await session.run(
  'MATCH (p:Person) RETURN p LIMIT $limit',
  { limit: neo4j.int(25) }
)
```

### Confidence Tiers

Every ingested node must have a confidence tier:

| Tier | Standard | Promotion |
|------|----------|-----------|
| **Gold** | Manually curated from primary sources, cross-referenced against 2+ independent sources | Manual review only |
| **Silver** | Verified via web research against credible sources | `/investigate-loop` or manual review |
| **Bronze** | Raw ingested, not independently verified | Verification cycle or community contribution |

## Testing

### Unit Tests

```bash
pnpm run test
```

Tests live in `src/lib/__tests__/` and use Vitest + Testing Library.

### E2E Tests

```bash
# Ensure dev server + Neo4j are running
npx playwright test

# Run specific test
npx playwright test e2e/homepage.spec.ts

# Run with UI
npx playwright test --ui
```

E2E tests are in `webapp/e2e/` and cover:
- Authentication flows
- Graph search and visualization
- Security headers and CSRF
- Input sanitization (XSS/injection)
- Rate limiting
- Mobile responsiveness
- Investigation CRUD
- Social sharing

### Adding Tests

For new features, follow TDD:
1. Write the test first (it should fail)
2. Implement minimal code to pass
3. Refactor
4. Verify coverage

## Branch Strategy

- `main` — production branch, auto-deploys on push
- Feature branches — create a PR against `main`
- CI runs lint + typecheck on all PRs

## Commit Messages

Follow conventional commits:

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Examples:
```
feat: add ENACOM conflict detection to caso-adorni pipeline
fix: prevent cartesian product in multi-label graph query
refactor: extract shared graph query builder from case-specific modules
```

## Investigation Data Guidelines

### Adding a New Case

1. Create case config in `src/lib/caso-<slug>/`
2. Add investigation data types and seed data
3. Create page routes in `src/app/caso/<slug>/`
4. Add API routes if needed in `src/app/api/caso/[slug]/`
5. Register in the investigation registry
6. Add i18n messages in `messages/en.json` and `messages/es.json`

### Data Quality

- All data must come from **public records** and **open data sources**
- Every factual claim must cite its source
- Use the confidence tier system — never present unverified data as confirmed
- Run entity resolution (`pnpm run cross-ref`) after bulk ingestion
- Review conflicts in `_ingestion_data/wave-N-conflicts.json`

### Legal Standards

- Hedge all allegations — use "according to [source]" or "alleged"
- Include presumption of innocence for persons facing legal proceedings
- Distinguish between **public reporting** (cited news) and **exclusive findings** (original analysis)
- All investigation submissions go through a review pipeline before publication

## Reporting Issues

Open an issue on GitHub with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS if relevant
- Screenshots for UI issues
