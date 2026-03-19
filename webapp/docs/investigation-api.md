# Caso Libra Investigation API

Unified input system for submitting investigation data. Works for humans and MCP agents.

## Endpoint

```
POST /api/caso-libra/investigation
GET  /api/caso-libra/investigation
GET  /api/caso-libra/investigation?schema=true
```

## Quick Start

### Get the schema (MCP agents: start here)
```bash
curl http://localhost:3000/api/caso-libra/investigation?schema=true | jq
```

### Submit a factchecked claim
```bash
curl -X POST http://localhost:3000/api/caso-libra/investigation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "factcheck",
    "data": {
      "claim_es": "El token fue creado minutos antes de la publicacion de Milei",
      "claim_en": "The token was created minutes before Milei posted",
      "status": "confirmed",
      "source": "Blockchain data",
      "source_url": "https://solscan.io/token/..."
    }
  }'
```

### Submit a timeline event
```bash
curl -X POST http://localhost:3000/api/caso-libra/investigation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event",
    "data": {
      "date": "2025-02-14",
      "title_es": "Milei publica el token en X",
      "title_en": "Milei posts token on X",
      "description_es": "A las 19:01 hora argentina...",
      "description_en": "At 7:01 PM Argentina time...",
      "category": "political",
      "sources": [{"name": "Multiple", "url": "https://..."}],
      "is_new": false
    }
  }'
```

### Submit a new actor
```bash
curl -X POST http://localhost:3000/api/caso-libra/investigation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "actor",
    "data": {
      "name": "Dave Portnoy",
      "role_es": "Influencer cripto",
      "role_en": "Crypto influencer",
      "description_es": "Recibio tokens para promocion, perdio $6.3M",
      "description_en": "Received tokens for promotion, lost $6.3M",
      "nationality": "estadounidense",
      "is_new": true,
      "status_es": "Perdidas de $6.3M",
      "status_en": "$6.3M losses"
    }
  }'
```

### Bulk import
```bash
curl -X POST http://localhost:3000/api/caso-libra/investigation \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"type": "factcheck", "data": {...}},
      {"type": "event", "data": {...}},
      {"type": "actor", "data": {...}}
    ]
  }'
```

### Read submitted data
```bash
# All items
curl http://localhost:3000/api/caso-libra/investigation

# By type
curl http://localhost:3000/api/caso-libra/investigation?type=factcheck

# By review status
curl http://localhost:3000/api/caso-libra/investigation?status=pending_review
```

## Entity Types

### factcheck
A verified or alleged claim with source attribution.

| Field | Required | Description |
|-------|----------|-------------|
| claim_es | Yes | The claim in Spanish (min 10 chars) |
| claim_en | Yes | The claim in English (min 10 chars) |
| status | Yes | `confirmed`, `alleged`, `denied`, or `under_investigation` |
| source | Yes | Source name (e.g. "Nansen Research") |
| source_url | Yes | URL to the source |
| detail_es | No | Additional detail in Spanish |
| detail_en | No | Additional detail in English |

### event
A timeline event in the investigation.

| Field | Required | Description |
|-------|----------|-------------|
| date | Yes | YYYY-MM-DD format |
| title_es | Yes | Event title in Spanish |
| title_en | Yes | Event title in English |
| description_es | Yes | Description in Spanish |
| description_en | Yes | Description in English |
| category | Yes | `political`, `financial`, `legal`, `media`, or `coverup` |
| sources | Yes | Array of `{name, url}` (min 1) |
| is_new | No | `true` if newly discovered |

### actor
A person or organization involved.

| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Full name |
| role_es | Yes | Role in Spanish |
| role_en | Yes | Role in English |
| description_es | Yes | Description in Spanish |
| description_en | Yes | Description in English |
| nationality | Yes | e.g. "argentina" |
| is_new | No | `true` if newly discovered |
| status_es | No | Current legal status in Spanish |
| status_en | No | Current legal status in English |

### money_flow
A financial transaction.

| Field | Required | Description |
|-------|----------|-------------|
| from_label | Yes | Source entity name |
| to_label | Yes | Destination entity name |
| amount_usd | Yes | Amount in USD (positive number) |
| date | Yes | YYYY-MM-DD format |
| source | Yes | Data source |

### evidence
A source document.

| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Document title |
| type_es | Yes | Document type in Spanish |
| type_en | Yes | Document type in English |
| date | Yes | YYYY-MM-DD format |
| summary_es | Yes | Summary in Spanish |
| summary_en | Yes | Summary in English |
| source_url | Yes | URL to the document |
| verification_status | Yes | `verified`, `partially_verified`, or `unverified` |

### stat
An impact statistic.

| Field | Required | Description |
|-------|----------|-------------|
| value | Yes | Display value (e.g. "$251M") |
| label_es | Yes | Label in Spanish |
| label_en | Yes | Label in English |
| source | Yes | Data source |

### government_response
A government coverup action.

| Field | Required | Description |
|-------|----------|-------------|
| date | Yes | YYYY-MM-DD format |
| action_es | Yes | What the government did (Spanish) |
| action_en | Yes | What the government did (English) |
| effect_es | Yes | The consequence (Spanish) |
| effect_en | Yes | The consequence (English) |
| source | Yes | Source name |
| source_url | Yes | URL to source |

## Review Workflow

All submissions start as `pending_review`. A human reviewer approves or rejects them before they appear on the public investigation page.

## For MCP Agents

1. **Read the schema first**: `GET /api/caso-libra/investigation?schema=true`
2. **Submit findings**: `POST /api/caso-libra/investigation` with `{type, data}`
3. **All fields are validated** — you'll get specific error messages if something is wrong
4. **Bilingual required** — every text field needs both `_es` (Spanish) and `_en` (English) versions
5. **Sources required** — every claim must have a verifiable source URL
