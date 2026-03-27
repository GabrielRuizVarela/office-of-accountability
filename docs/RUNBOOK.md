# Operations Runbook

## Infrastructure

| Component | Location | Port | Service |
|-----------|----------|------|---------|
| **Web app** | `/opt/ooa/webapp` | 5174 | `systemctl status ooa` |
| **Neo4j** | Docker container `ooa-neo4j` | 7474 (HTTP), 7687 (Bolt) | `docker ps \| grep neo4j` |
| **Cloudflare** | CDN/proxy | 443 | Cloudflare dashboard |

## Deployment

### Automatic (CI/CD)

Every push to `main` triggers automatic deployment via `.github/workflows/deploy.yml`:

1. SSH to production server
2. `git pull origin main`
3. `pnpm install --frozen-lockfile`
4. Apply vinext production patch
5. `pnpm run build`
6. `systemctl restart ooa`
7. Health check: `curl http://localhost:5174/`

Deployment is gated by concurrency — only one deploy runs at a time.

### Manual Deployment

```bash
ssh root@<SERVER_HOST>
cd /opt/ooa
git pull origin main
cd webapp
pnpm install --frozen-lockfile
# Apply vinext patch (required until vinext fixes production mode detection)
sed -i 's/env?.command === "build"/env?.command === "build" || mode === "production"/' node_modules/vinext/dist/index.js
pnpm run build
systemctl restart ooa
```

### Rollback

```bash
ssh root@<SERVER_HOST>
cd /opt/ooa
git log --oneline -10           # Find the commit to rollback to
git checkout <commit-hash>
cd webapp
pnpm install --frozen-lockfile
sed -i 's/env?.command === "build"/env?.command === "build" || mode === "production"/' node_modules/vinext/dist/index.js
pnpm run build
systemctl restart ooa
```

To return to latest after rollback:
```bash
git checkout main
```

## Monitoring

### Health Check (Automated)

`.github/workflows/healthcheck.yml` runs every 10 minutes:

1. SSH to server, check `curl http://localhost:5174/`
2. If HTTP 200 — healthy, exit
3. If DOWN — auto-rescue:
   - Restart Docker Neo4j if not running
   - Re-apply vinext production patch
   - Restart systemd service
   - Re-check health

### Manual Health Check

```bash
# Check app status
ssh root@<SERVER_HOST> 'systemctl status ooa'

# Check app logs
ssh root@<SERVER_HOST> 'journalctl -u ooa --since "1 hour ago" --no-pager'

# Check Neo4j
ssh root@<SERVER_HOST> 'docker ps | grep neo4j'
ssh root@<SERVER_HOST> 'docker logs ooa-neo4j --tail 50'

# Check disk space
ssh root@<SERVER_HOST> 'df -h'

# Check memory
ssh root@<SERVER_HOST> 'free -h'
```

### Key Metrics to Watch

| Metric | Warning | Critical | Check |
|--------|---------|----------|-------|
| HTTP response | >2s | No response | Health check workflow |
| Disk usage | >80% | >90% | `df -h` |
| Memory | >80% | >90% | `free -h` |
| Neo4j heap | >80% of 512m | OOM | `docker stats ooa-neo4j` |
| Rate limit hits | >100/hr | >500/hr | Application logs |

## Common Issues

### App won't start after deploy

**Symptoms:** `systemctl status ooa` shows failed, health check returns 000.

**Diagnosis:**
```bash
journalctl -u ooa --since "5 minutes ago" --no-pager
```

**Common causes:**

1. **Vinext patch not applied** — the build works but production mode fails
   ```bash
   sed -i 's/env?.command === "build"/env?.command === "build" || mode === "production"/' node_modules/vinext/dist/index.js
   pnpm run build
   systemctl restart ooa
   ```

2. **Neo4j not running** — app starts but API routes fail
   ```bash
   docker start neo4j
   sleep 5
   systemctl restart ooa
   ```

3. **Port conflict** — another process on 5174
   ```bash
   lsof -i :5174
   kill <PID>
   systemctl restart ooa
   ```

4. **Out of memory** — build OOM on small instances
   ```bash
   free -h
   # If low memory, try restarting Neo4j to free heap
   docker restart neo4j
   sleep 10
   pnpm run build
   ```

### Neo4j connection errors

**Symptoms:** API routes return 500, graph pages empty.

```bash
# Check Neo4j is running
docker ps | grep neo4j

# Check Neo4j logs
docker logs ooa-neo4j --tail 20

# Restart Neo4j
docker restart neo4j

# Verify Bolt connectivity
docker exec ooa-neo4j cypher-shell "RETURN 1"
```

**Neo4j memory tuning** (in `docker-compose.yml`):
- `heap_initial_size: 256m` / `heap_max_size: 512m`
- `pagecache_size: 128m`
- Total ~640m — adjust based on server RAM

### Slow graph queries

**Symptoms:** Graph page takes >5s to load, API timeouts.

**Diagnosis:**
```bash
# Check query execution in Neo4j browser (http://server:7474)
PROFILE MATCH (n:Person)-[r]->(m) WHERE n.caso = 'caso-libra' RETURN n, r, m LIMIT 100
```

**Common fixes:**

1. **Missing index** — run `pnpm run db:init-schema` to ensure indexes exist
2. **Cartesian product** — check if query joins multiple unrelated patterns (should use two-pass approach)
3. **Too many nodes** — ensure LIMIT is applied with `neo4j.int(n)`
4. **Large response** — check if client-side filtering can reduce data transfer

### Rate limiting false positives

**Symptoms:** Legitimate users getting 429 responses.

Rate limit tiers (configured in `src/lib/rate-limit/`):
- **API reads:** 60 requests/minute per IP
- **Mutations:** 30 requests/minute per IP
- **OG images:** Separate limit (image generation is expensive)

Rate limits use in-memory sliding window — restarting the app resets all counters.

### CSRF token errors

**Symptoms:** POST requests return 403 "CSRF token missing or invalid".

**Diagnosis:**
1. Check that the CSRF cookie is being set (browser dev tools > cookies)
2. Check that the `X-CSRF-Token` header is being sent with POST requests
3. Check that `AUTH_SECRET` is set in the environment

**Root cause:** Often happens when `AUTH_SECRET` changes — invalidates all existing CSRF tokens. Users need to refresh the page to get a new cookie.

## Database Operations

### Backup Neo4j

```bash
# Stop writes (if critical)
ssh root@<SERVER_HOST> 'docker exec ooa-neo4j neo4j-admin database dump neo4j --to-path=/data/'

# Copy backup locally
scp root@<SERVER_HOST>:/var/lib/docker/volumes/ooa_neo4j-data/_data/neo4j.dump ./backup-$(date +%Y%m%d).dump
```

### Restore Neo4j

```bash
# Stop the app
systemctl stop ooa

# Load backup
docker exec ooa-neo4j neo4j-admin database load neo4j --from-path=/data/ --overwrite-destination

# Restart
docker restart neo4j
sleep 10
systemctl start ooa
```

### Re-seed from scratch

```bash
# Caution: this drops all data
docker exec ooa-neo4j cypher-shell "MATCH (n) DETACH DELETE n"

cd /opt/ooa/webapp
pnpm run db:init-schema
npx tsx scripts/seed-caso-libra.ts
npx tsx scripts/seed-caso-epstein.ts
# ... additional seeds as needed
```

## GitHub Secrets

Required secrets in GitHub repository settings:

| Secret | Purpose |
|--------|---------|
| `SERVER_SSH_KEY` | ED25519 SSH private key for deployment |
| `SERVER_HOST` | Production server IP or hostname |

## Service Configuration

### systemd unit (`/etc/systemd/system/ooa.service`)

The app runs as a systemd service on the production server. Typical configuration:

```ini
[Unit]
Description=Office of Accountability
After=network.target docker.service

[Service]
Type=simple
WorkingDirectory=/opt/ooa/webapp
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Docker Compose (Neo4j)

Neo4j runs via Docker Compose at `/opt/ooa/docker-compose.yml`. Production should override `NEO4J_AUTH` with real credentials:

```bash
# Production override (do NOT use NEO4J_AUTH=none in production)
NEO4J_AUTH=neo4j/<strong-password> docker compose up -d
```
