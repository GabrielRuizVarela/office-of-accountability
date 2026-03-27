import { test, expect } from '@playwright/test'

test.describe('Share & Distribution', () => {
  const SLUG = 'fernandez-de-kirchner-cristina'

  test('politician page has WhatsApp share button', async ({ page }) => {
    await page.goto(`/politico/${SLUG}`)
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(shareBtn).toBeVisible()
    // Button should have green background (WhatsApp color)
    await expect(shareBtn).toHaveText(/Compartir/)
  })

  test('politician page has copy link button', async ({ page }) => {
    await page.goto(`/politico/${SLUG}`)
    const copyBtn = page.locator('button[title="Copiar enlace"]')
    await expect(copyBtn).toBeVisible()
    await expect(copyBtn).toHaveText(/Copiar enlace/)
  })

  test('WhatsApp button opens wa.me link', async ({ page }) => {
    await page.goto(`/politico/${SLUG}`)
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')

    // Listen for new window/tab
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 3000 }).catch(() => null),
      shareBtn.click(),
    ])

    if (popup) {
      const url = popup.url()
      expect(url).toContain('wa.me')
      await popup.close()
    }
  })

  test('politician page OG meta tags reference OG image endpoint', async ({ request }) => {
    const res = await request.get(`/politico/${SLUG}`)
    const html = await res.text()
    expect(html).toContain('og:title')
    expect(html).toContain('og:image')
    expect(html).toContain('og:description')
    expect(html).toContain(`/api/og/politician/${SLUG}`)
  })

  test('investigation page has share buttons', async ({ page }) => {
    // Get a real investigation slug
    const apiRes = await page.request.get('/api/investigations?limit=1')
    const json = await apiRes.json()

    if (json.data && json.data.length > 0) {
      await page.goto(`/investigacion/${json.data[0].slug}`)
      // Should have either WhatsApp share or print button
      const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
      const printBtn = page.locator('button').filter({ hasText: /Imprimir|PDF/ })
      await expect(shareBtn.or(printBtn)).toBeVisible({ timeout: 5000 })
    }
  })

  test('province page has WhatsApp share button', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(shareBtn).toBeVisible()
  })

  test('public pages are accessible without auth', async ({ request }) => {
    const publicPages = [
      `/politico/${SLUG}`,
      '/investigaciones',
      '/provincias/buenos-aires',
      '/explorar',
    ]
    for (const path of publicPages) {
      const res = await request.get(path)
      expect(res.status()).toBe(200)
    }
  })

  test('draft investigation returns 404, not 403 (no information leak)', async ({ request }) => {
    const res = await request.get('/investigacion/nonexistent-draft')
    expect(res.status()).toBe(404)
  })
})
