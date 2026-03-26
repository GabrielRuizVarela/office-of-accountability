# MiroFish Integration Plan - Caso Libra Scenario Simulation

## Overview

Integrate [MiroFish](https://github.com/666ghj/MiroFish) as a scenario simulation engine for the Caso Libra investigation. MiroFish uses swarm intelligence (multi-agent simulation + GraphRAG knowledge graphs) to create "digital parallel worlds" where thousands of autonomous agents simulate how events could unfold.

**Goal**: Allow users to ask "what if?" questions about the Caso Libra case and see AI-simulated outcomes - e.g., "What happens if Hayden Davis cooperates with the investigation?" or "How would markets react if phone forensics prove direct presidential involvement?"

## Architecture

```
┌─────────────────────────────────────────────────┐
│  ORC Platform (Next.js)                         │
│                                                 │
│  /caso/caso-libra/simular  ←  new route         │
│       │                                         │
│       ▼                                         │
│  API route: /api/caso-libra/simulate            │
│       │                                         │
│       ▼                                         │
│  MiroFish Backend (Python, port 5001)           │
│  ┌────────────────────────────────────────┐     │
│  │  GraphRAG ← seed data from Neo4j      │     │
│  │  OASIS simulation engine              │     │
│  │  Agent memory (Zep Cloud)             │     │
│  │  ReportAgent → prediction reports     │     │
│  └────────────────────────────────────────┘     │
│       │                                         │
│       ▼                                         │
│  GPU machine (user's dedicated server)          │
└─────────────────────────────────────────────────┘
```

## Prerequisites

- **GPU machine** (user-provided) running MiroFish backend
- **Python** >= 3.11, <= 3.12
- **Node.js** 18+ (for MiroFish frontend, optional - we use our own UI)
- **LLM API key** - OpenAI-compatible (tested with Alibaba Qwen `qwen-plus`)
- **Zep Cloud API key** - for agent memory persistence

## Implementation Phases

### Phase A: MiroFish Deployment on GPU Machine

1. Clone MiroFish repo on GPU machine:
   ```bash
   git clone https://github.com/666ghj/MiroFish.git
   cd MiroFish
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env:
   # LLM_API_KEY=<your key>
   # LLM_BASE_URL=<your OpenAI-compatible endpoint>
   # LLM_MODEL_NAME=<model name>
   # ZEP_API_KEY=<your zep key>
   ```

3. Launch via Docker:
   ```bash
   docker compose up -d
   ```
   Backend API available at `http://<gpu-machine-ip>:5001`

4. Verify: hit the backend health endpoint, confirm simulation works with a small test (< 40 rounds).

### Phase B: Seed Data Export Pipeline

Create a script that exports our Neo4j Caso Libra data into MiroFish-compatible seed format.

**New file**: `webapp/scripts/export-caso-libra-seed.ts`

What it does:
- Queries all CasoLibraPerson, CasoLibraEvent, CasoLibraDocument, CasoLibraOrganization nodes + relationships from Neo4j
- Formats into a narrative document that MiroFish can ingest (it accepts research reports / narrative text as seed)
- Generates agent personality profiles from our Person nodes (role, description, affiliations)
- Outputs a JSON/text file ready for MiroFish's seed data input

**Seed data structure** (approximate - adapt to MiroFish's expected format):
```
# Caso Libra - Seed Data for Simulation

## Actors
- Javier Milei: Presidente de la Nacion. Promoted $LIBRA token to 19M followers...
- Hayden Davis: CEO of Kelsier Ventures. Organized the technical launch...
- [each person with full context]

## Timeline of Events
- 2025-02-10: Julian Peh visits Casa Rosada...
- 2025-02-14: Token launches on Solana...
- [chronological event list]

## Key Relationships
- Milei PROMOTED $LIBRA token
- Hayden Davis CONTROLS team wallets
- Santiago Caputo COMMUNICATED_WITH Julian Peh on 2025-02-14
- [all relationships]

## Financial Flows
- $58M extracted from liquidity pool by team wallets
- $25M consolidated to wallet #1...
- [transaction summary]

## Evidence
- Congressional report details...
- TRM Labs blockchain analysis...
- [document summaries]
```

### Phase C: ORC Platform Integration

#### C.1 - New route: `/caso/[slug]/simular`

Add a "Simular" tab to the investigation nav. Page contains:
- **Scenario input**: Text field where user describes a "what if" scenario in natural language
- **Simulation config**: Number of rounds (start with max 40), agent count
- **Results panel**: Streaming simulation output - prediction report + key agent decisions
- **Chat interface**: Talk to simulated agents or the ReportAgent after simulation completes

#### C.2 - API proxy route: `/api/caso-libra/simulate`

Proxies requests to the MiroFish backend on the GPU machine:
- `POST /api/caso-libra/simulate` - start a new simulation with scenario description
- `GET /api/caso-libra/simulate/[sessionId]` - poll simulation status/results
- `POST /api/caso-libra/simulate/[sessionId]/chat` - chat with agents post-simulation

Environment variable: `MIROFISH_API_URL` pointing to the GPU machine.

#### C.3 - UI components

New components:
- `components/investigation/ScenarioInput.tsx` - scenario description + config form
- `components/investigation/SimulationResults.tsx` - report display + agent decision timeline
- `components/investigation/AgentChat.tsx` - post-simulation chat with agents

### Phase D: Agent Personality Mapping

Map our Caso Libra actors to MiroFish agent personalities:

| Our Actor | MiroFish Agent Personality |
|-----------|---------------------------|
| Milei | Political leader, populist, crypto-sympathetic, media-savvy, defensive under pressure |
| Karina Milei | Political operative, loyal to family, gatekeeping access |
| Hayden Davis | Crypto entrepreneur, profit-motivated, internationally mobile |
| Santiago Caputo | Strategic advisor, communications expert, risk-aware |
| Julian Peh | Tech intermediary, networker, bridge between crypto/government |
| Congressional investigators | Institutional actors, political motivations vary by party |
| Judiciary | Procedural, evidence-driven, slow-moving |
| Media (Infobae, FT) | Information-seeking, impact-maximizing, source-protecting |

These get injected as agent parameters during MiroFish environment setup.

## Example Scenarios to Simulate

1. **"Que pasa si Hayden Davis coopera con la justicia argentina?"**
   - Simulate Davis providing testimony, who gets exposed, political fallout

2. **"Que pasaria si se publican los registros completos de llamadas de Santiago Caputo?"**
   - Simulate media cycle, political responses, legal proceedings

3. **"Como reaccionaria el mercado cripto argentino si Milei enfrenta juicio politico por esto?"**
   - Simulate economic/political/social ripple effects

4. **"Que pasa si aparecen mas billeteras vinculadas a funcionarios?"**
   - Simulate escalation, new actors entering the investigation

## Environment Variables (ORC Platform)

```env
# MiroFish backend URL on GPU machine
MIROFISH_API_URL=http://<gpu-machine-ip>:5001

# Optional: direct LLM access for report formatting
MIROFISH_LLM_API_KEY=<key>
```

## Security Considerations

- MiroFish backend should NOT be publicly exposed - access only from ORC backend via private network or SSH tunnel
- Simulation results are AI-generated speculation, not evidence - UI must clearly label them as such
- Rate-limit simulation requests (GPU-intensive)
- Add disclaimer: "Los resultados de simulacion son generados por IA y no constituyen evidencia ni predicciones factuales"

## Open Questions

- [ ] MiroFish seed data format - need to test exact input format the API expects
- [ ] Streaming vs polling - does MiroFish support SSE/WebSocket for live simulation updates?
- [ ] Agent memory persistence - do we want simulations to build on each other or start fresh?
- [ ] Cost - LLM API costs for multi-agent simulation with thousands of agents can be significant
- [ ] MiroFish API stability - it's a research project, may need to pin to a specific commit

## Timeline Estimate

| Phase | Work |
|-------|------|
| A | Deploy MiroFish on GPU machine, verify it runs |
| B | Build seed data export pipeline from Neo4j |
| C | Build /simular route, API proxy, UI components |
| D | Configure agent personalities, test scenarios |

Phases A and B can happen in parallel. C depends on A being done. D depends on B+C.
