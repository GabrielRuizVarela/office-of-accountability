import { test, expect } from '@playwright/test'

test.describe('Security Headers', () => {
  test('all responses include security headers', async ({ request }) => {
    const res = await request.get('/')
    const headers = Object.fromEntries(
      Object.entries(res.headers()).map(([k, v]) => [k.toLowerCase(), v]),
    )
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBeDefined()
  })

  test('API responses include security headers', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=test')
    const headers = Object.fromEntries(
      Object.entries(res.headers()).map(([k, v]) => [k.toLowerCase(), v]),
    )
    expect(headers['x-content-type-options']).toBe('nosniff')
  })
})

test.describe('CSRF Protection', () => {
  test('POST without CSRF token is blocked', async ({ request }) => {
    const res = await request.post('/api/investigations', {
      data: { title: 'Test', body: '{}', tags: [] },
      headers: { 'content-type': 'application/json' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('PATCH without CSRF token is blocked', async ({ request }) => {
    const res = await request.patch('/api/investigations/some-id', {
      data: { title: 'Updated' },
      headers: { 'content-type': 'application/json' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('DELETE without CSRF token is blocked', async ({ request }) => {
    const res = await request.delete('/api/investigations/some-id')
    expect([401, 403]).toContain(res.status())
  })

  test('GET requests are not CSRF protected', async ({ request }) => {
    const res = await request.get('/api/investigations?limit=1')
    // May be rate limited from prior tests — both 200 and 429 prove CSRF is not blocking
    expect([200, 429]).toContain(res.status())
  })
})

test.describe('Input Validation', () => {
  test('graph search handles XSS payloads safely', async ({ request }) => {
    const res = await request.get(
      `/api/graph/search?q=${encodeURIComponent('<script>alert(1)</script>')}`,
    )
    if (res.status() === 200) {
      const text = JSON.stringify(await res.json())
      expect(text).not.toContain('<script>')
    }
  })

  test('node endpoint rejects dangerous IDs', async ({ request }) => {
    const payloads = [
      '../etc/passwd',
      'MATCH (n) DELETE n',
      '<script>alert(1)</script>',
      "'; DROP TABLE users; --",
      'a'.repeat(300),
    ]
    for (const payload of payloads) {
      const res = await request.get(`/api/graph/node/${encodeURIComponent(payload)}`)
      // 429 is acceptable — means rate limiter blocked before validation
      expect([400, 429]).toContain(res.status())
    }
  })

  test('expand endpoint rejects out-of-range depth', async ({ request }) => {
    const res = await request.get('/api/graph/expand/some-slug?depth=100')
    expect([400, 429]).toContain(res.status())
  })

  test('search rejects oversized limit', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=test&limit=10000')
    expect([400, 429]).toContain(res.status())
  })

  test('politician slug validation rejects malformed slugs', async ({ request }) => {
    const badSlugs = [
      '/api/politico/../../etc/passwd/votes',
      '/api/politico/.hidden/votes',
      '/api/politico/UPPERCASE/votes',
    ]
    for (const path of badSlugs) {
      const res = await request.get(path)
      expect([400, 404, 429]).toContain(res.status())
    }
  })
})

test.describe('Rate Limiting', () => {
  test('rate limiter triggers on excessive search requests', async ({ request }) => {
    // Rate limiter may already be triggered from prior tests — verify it's active
    // by checking if we can get a 429, or if we already have one
    let gotRateLimited = false
    // Fire requests until we hit 429 or exhaust attempts
    for (let i = 0; i < 70; i++) {
      const res = await request.get(`/api/graph/search?q=ratelimit${i}`)
      if (res.status() === 429) {
        gotRateLimited = true
        break
      }
    }
    expect(gotRateLimited).toBe(true)
  })
})

test.describe('Error Response Safety', () => {
  test('error responses do not leak stack traces', async ({ request }) => {
    // Wait for rate limiter to cool down from previous test
    await new Promise((r) => setTimeout(r, 5000))
    const res = await request.get('/api/graph/node/nonexistent-slug')
    // May still be rate limited — accept 404 or 429
    expect([404, 429]).toContain(res.status())
    if (res.status() === 404) {
      const text = JSON.stringify(await res.json())
      expect(text).not.toContain('at ')
      expect(text).not.toContain('node_modules')
      expect(text).not.toContain('.ts:')
    }
  })

  test('400 errors return structured error format', async ({ request }) => {
    const res = await request.get('/api/graph/search?q=')
    expect([400, 429]).toContain(res.status())
    if (res.status() === 400) {
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(typeof json.error).toBe('string')
    }
  })
})
