import { test, expect } from '@playwright/test'

test.describe('Security — Injection Prevention', () => {
  test('Cypher injection via search is blocked', async ({ page }) => {
    const response = await page.request.get(
      `/api/graph/search?q=${encodeURIComponent("'; MATCH (n) DETACH DELETE n //")}`,
    )
    // Should return 400 (bad request) or safe empty results — never a 500
    expect(response.status()).not.toBe(500)
  })

  test('path traversal in slug is rejected', async ({ page }) => {
    const response = await page.goto('/politico/../../etc/passwd')
    expect(response?.status()).toBe(404)
  })

  test('URL-encoded traversal in API is rejected', async ({ page }) => {
    const response = await page.request.get('/api/casos/..%2F..%2Fetc%2Fpasswd/graph')
    expect(response.status()).toBeGreaterThanOrEqual(400)
    expect(response.status()).not.toBe(500)
  })

  test('XSS in search query does not execute', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    // Navigate to search with XSS payload
    await page.goto(`/explorar?q=${encodeURIComponent('"><script>alert(1)</script>')}`)
    // Should not trigger any JS errors from the XSS payload
    expect(errors.filter((e) => e.includes('alert'))).toHaveLength(0)
  })

  test('API returns structured errors, not stack traces', async ({ page }) => {
    const response = await page.request.get('/api/graph/node/nonexistent-id-12345')
    if (response.status() >= 400) {
      const text = await response.text()
      // Should not leak Neo4j internals or stack traces
      expect(text).not.toContain('neo4j')
      expect(text).not.toContain('at Object.')
      expect(text).not.toContain('node_modules')
    }
  })
})
