import { test, expect } from '@playwright/test'

test.describe('Sitemap', () => {
  test('returns valid XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('xml')
    const body = await res.text()
    expect(body).toContain('<?xml')
    expect(body).toContain('<urlset')
    expect(body).toContain('</urlset>')
  })

  test('contains politician URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    const body = await res.text()
    expect(body).toContain('/politico/')
    // Should have many politician URLs (2000+)
    const politicoCount = (body.match(/\/politico\//g) || []).length
    expect(politicoCount).toBeGreaterThan(2000)
  })

  test('contains province URLs', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    const body = await res.text()
    expect(body).toContain('/provincias/')
  })

  test('contains static pages', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    const body = await res.text()
    expect(body).toContain('/explorar')
    expect(body).toContain('/investigaciones')
  })

  test('has cache headers', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    const cacheControl = res.headers()['cache-control']
    expect(cacheControl).toBeDefined()
  })
})
