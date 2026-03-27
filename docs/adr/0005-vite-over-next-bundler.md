# ADR-0005: Vite as Build System (via vinext)

**Status:** Accepted
**Date:** 2026-03-16
**Context:** Next.js 16 introduced experimental Vite support via the `vinext` adapter. The project needed faster builds and HMR for a large codebase with 300+ TypeScript files.

## Decision

Use Vite 8 as the build system with `vinext` adapter for Next.js 16 compatibility, instead of the default webpack/turbopack bundler.

## Rationale

- **Build speed:** Vite's esbuild-based dev server starts in <2s vs. 8-12s with webpack.
- **HMR:** Sub-100ms hot module replacement.
- **ESM-native:** Better compatibility with `neo4j-driver-lite` and other ESM-only packages.

## Consequences

- `vinext` is v0.0.30 (early stage) -- requires a production mode patch:
  ```bash
  sed -i 's/env?.command === "build"/env?.command === "build" || mode === "production"/' node_modules/vinext/dist/index.js
  ```
- This patch must be applied in CI/CD deploy and health check workflows.
- Some Next.js features may not be fully supported (RSC is experimental).
- `next-intl` must be excluded from Vite optimizeDeps to prevent hydration errors.
