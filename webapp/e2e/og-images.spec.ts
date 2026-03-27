import { test, expect } from '@playwright/test'

test.describe('OG Image Generation', () => {
  test('politician OG image returns valid 1200x630 PNG', async ({ request }) => {
    const res = await request.get('/api/og/politician/fernandez-de-kirchner-cristina')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/png')
    const body = await res.body()
    expect(body.length).toBeGreaterThan(1000)
    // PNG magic bytes: 89 50 4E 47
    expect(body[0]).toBe(0x89)
    expect(body[1]).toBe(0x50)
    expect(body[2]).toBe(0x4e)
    expect(body[3]).toBe(0x47)
  })

  test('investigation OG image returns valid PNG', async ({ request }) => {
    // Get a real investigation slug
    const listRes = await request.get('/api/investigations?limit=1')
    const listJson = await listRes.json()

    if (listJson.data && listJson.data.length > 0) {
      const slug = listJson.data[0].slug
      const res = await request.get(`/api/og/investigation/${slug}`)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toContain('image/png')
    }
  })

  test('politician OG returns 404 for nonexistent slug', async ({ request }) => {
    const res = await request.get('/api/og/politician/nonexistent-politician')
    expect(res.status()).toBe(404)
  })

  test('politician OG rejects path traversal', async ({ request }) => {
    const attacks = [
      '/api/og/politician/..%2F..%2Fetc%2Fpasswd',
      '/api/og/politician/UPPERCASE',
      '/api/og/politician/.hidden',
    ]
    for (const path of attacks) {
      const res = await request.get(path)
      expect(res.status()).toBe(404)
    }
  })

  test('investigation OG rejects path traversal', async ({ request }) => {
    const res = await request.get('/api/og/investigation/..%2F..%2Fetc%2Fpasswd')
    expect(res.status()).toBe(404)
  })
})
