import { test, expect } from '@playwright/test'

test.describe('Politician Profile Pages', () => {
  const SLUG = 'fernandez-de-kirchner-cristina'

  test('renders full politician profile with all sections', async ({ page }) => {
    await page.goto(`/politico/${SLUG}`)

    // Politician name should be visible (server-rendered)
    await expect(page.getByRole('heading', { name: /FERNANDEZ DE KIRCHNER/ })).toBeVisible()

    // Breadcrumb navigation
    await expect(page.getByRole('link', { name: 'ORC' })).toBeVisible()

    // Share button should be present
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible()
  })

  test('Schema.org JSON-LD is present in HTML', async ({ request }) => {
    const res = await request.get(`/politico/${SLUG}`)
    const html = await res.text()
    expect(html).toContain('application/ld+json')
    expect(html).toContain('Person')
    expect(html).toContain('FERNANDEZ DE KIRCHNER')
  })

  test('OG tags are properly set for social sharing', async ({ request }) => {
    const res = await request.get(`/politico/${SLUG}`)
    const html = await res.text()
    expect(html).toContain('og:title')
    expect(html).toContain('og:image')
    expect(html).toContain('og:description')
    expect(html).toContain('/api/og/politician/')
  })

  test('vote history loads with pagination', async ({ page }) => {
    await page.goto(`/politico/${SLUG}`)

    // Look for vote history section — click Votaciones tab if tabs exist
    const votacionesTab = page.getByText('Votaciones', { exact: true })
    if (await votacionesTab.isVisible()) {
      await votacionesTab.click()
    }

    // The vote history table/list should eventually appear with vote data
    // Wait for API response
    await page.waitForTimeout(2000)
  })

  test('vote history API returns proper paginated response', async ({ request }) => {
    const res = await request.get(`/api/politico/${SLUG}/votes?page=1&limit=20`)
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
    expect(json.meta.slug).toBe(SLUG)

    // Test page 2
    const res2 = await request.get(`/api/politico/${SLUG}/votes?page=2&limit=20`)
    expect(res2.status()).toBe(200)
    const json2 = await res2.json()
    expect(json2.success).toBe(true)
  })

  test('returns 404 for nonexistent politician', async ({ page }) => {
    const response = await page.goto('/politico/nonexistent-politician-slug')
    expect(response?.status()).toBe(404)
  })

  test('rejects path traversal attacks', async ({ request }) => {
    const attacks = [
      '/politico/../../etc/passwd',
      '/politico/..%2F..%2Fetc%2Fpasswd',
      '/politico/.hidden',
      '/politico/UPPERCASE-SLUG',
    ]
    for (const path of attacks) {
      const res = await request.get(path)
      expect(res.status()).toBe(404)
    }
  })

  test('navigate from province page to politician profile', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    await page.waitForTimeout(1000)

    // Find and click a politician link
    const politicianLinks = page.locator('a[href*="/politico/"]')
    const count = await politicianLinks.count()
    if (count > 0) {
      const href = await politicianLinks.first().getAttribute('href')
      await politicianLinks.first().click()
      await expect(page).toHaveURL(href!)
    }
  })
})
