# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email **officeofaccountability@proton.me** with details of the vulnerability
3. Include steps to reproduce, impact assessment, and suggested fix if possible
4. Allow reasonable time for a fix before public disclosure

## Security Architecture

### API Security

- **CSRF Protection:** Signed double-submit cookie pattern on all POST/PATCH/PUT/DELETE endpoints
- **Rate Limiting:** In-memory sliding window — 60/min reads, 30/min mutations per IP
- **Input Validation:** Zod schemas at all API boundaries
- **Query Safety:** All Neo4j queries use parameterized Cypher (never string interpolation)
- **Query Timeouts:** 5s default, 15s for graph queries — prevents runaway queries

### Authentication

- Auth.js with `AUTH_SECRET` for session signing
- Production requires strong `AUTH_SECRET` (32+ bytes, base64-encoded)
- Optional Google OAuth for social login

### Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0` (relies on CSP instead)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Data Handling

- No user PII is stored beyond authentication sessions
- Investigation data comes from public records only
- All investigation submissions go through a review pipeline
- Bronze-tier data is clearly marked as unverified

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest `main` | Yes |
| Older commits | No |

## Dependencies

Run `pnpm audit` periodically to check for known vulnerabilities in dependencies.
