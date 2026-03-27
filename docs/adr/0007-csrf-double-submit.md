# ADR-0007: CSRF Protection via Signed Double-Submit Cookie

**Status:** Accepted
**Date:** 2026-03-17
**Context:** API mutation endpoints (POST/PATCH/DELETE) need CSRF protection. The app uses cookie-based sessions via Auth.js.

## Decision

Implement CSRF protection using the signed double-submit cookie pattern:

1. Server generates a random token + HMAC-SHA256 signature using `AUTH_SECRET`.
2. Token+signature stored in a non-HttpOnly cookie (readable by JavaScript).
3. Client reads the cookie and sends the token in `X-CSRF-Token` header.
4. Middleware validates: cookie signature is valid AND header token matches cookie token.

## Rationale

- **Stateless:** No server-side token storage needed (signature verification is sufficient).
- **Signed:** HMAC prevents cookie tampering (attacker cannot forge a valid token+signature pair).
- **Non-HttpOnly cookie:** Intentional -- JavaScript must read the token to set the header. The signature prevents exploitation.
- **Constant-time comparison:** Prevents timing attacks on token validation.

## Consequences

- `AUTH_SECRET` must be set in production (CSRF breaks without it).
- Changing `AUTH_SECRET` invalidates all existing CSRF cookies (users must refresh).
- Investigation API (`/api/caso-libra/investigation`) is CSRF-exempt because it uses API key auth for MCP agent access.
