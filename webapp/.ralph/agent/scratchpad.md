## Iteration — 2026-03-21

### Context
Previous iteration left uncommitted changes across 13 source files:
1. **Query abstraction**: caso-libra → getQueryBuilder() (generic investigation support)
2. **Auth cleanup**: Removed per-page SessionProvider wrappers (now in layout), added UserMenu to SiteNav
3. **Signup CSRF fix**: Added csrfToken to auto-sign-in after registration
4. **SessionProvider fix**: useMemo → useEffect for session fetch (proper React pattern)

### Plan
- Verify TypeScript compilation passes
- Verify the new imports exist (getQueryBuilder, UserMenu)
- Commit the changes

### Result
- TypeScript: clean (pre-existing script errors only)
- ESLint: clean
- Committed as a5bb576
- 12 files changed: query abstraction + auth cleanup
