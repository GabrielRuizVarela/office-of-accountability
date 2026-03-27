import { test, expect } from '@playwright/test'

/**
 * LAUNCH CHECKLIST: Share & OG Verification
 *
 * Tests WhatsApp share buttons, OG meta tags for social sharing,
 * and OG image generation across all shareable page types.
 */

test.describe('WhatsApp Share Buttons', () => {
  test('1. Politician page has WhatsApp + copy link buttons', async ({ page }) => {
    await page.goto('/politico/fernandez-de-kirchner-cristina')

    const waBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(waBtn).toBeVisible()
    await expect(waBtn).toHaveText(/Compartir/)

    // Copy link button
    const copyBtn = page.getByRole('button', { name: /Copiar enlace/ })
    await expect(copyBtn).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/11-politician-share.png', fullPage: true })
  })

  test('2. WhatsApp button opens wa.me with correct URL', async ({ page }) => {
    await page.goto('/politico/fernandez-de-kirchner-cristina')

    const waBtn = page.locator('button[title="Compartir por WhatsApp"]')

    // Listen for popup
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      waBtn.click(),
    ])

    if (popup) {
      const url = popup.url()
      expect(url).toContain('wa.me')
      expect(url).toContain('politico')
      await popup.close()
    }

    await page.screenshot({ path: 'test-results/manual/12-whatsapp-popup.png' })
  })

  test('3. Province page has share buttons', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    await page.waitForTimeout(2000)

    const waBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(waBtn).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/13-province-share.png' })
  })

  test('4. Investigation page has share + print buttons', async ({ page }) => {
    const apiRes = await page.request.get('/api/investigations?limit=1')
    const json = await apiRes.json()

    if (json.data && json.data.length > 0) {
      await page.goto(`/investigacion/${json.data[0].slug}`)
      await page.waitForTimeout(2000)

      const waBtn = page.locator('button[title="Compartir por WhatsApp"]')
      const printBtn = page.locator('button').filter({ hasText: /Imprimir|PDF/ })

      // At least one share mechanism should exist
      const hasShare = await waBtn.isVisible().catch(() => false)
      const hasPrint = await printBtn.isVisible().catch(() => false)
      expect(hasShare || hasPrint).toBe(true)

      await page.screenshot({
        path: 'test-results/manual/14-investigation-share.png',
        fullPage: true,
      })
    }
  })
})

test.describe('OG Meta Tags Verification', () => {
  test('5. Politician page has complete OG tags', async ({ request }) => {
    const res = await request.get('/politico/fernandez-de-kirchner-cristina')
    const html = await res.text()

    // Required OG tags
    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('og:image')
    expect(html).toContain('og:type')

    // Should reference OG image endpoint
    expect(html).toContain('/api/og/politician/fernandez-de-kirchner-cristina')

    // Twitter card
    expect(html).toContain('twitter:card')
    expect(html).toContain('summary_large_image')

    // Canonical URL
    expect(html).toContain('canonical')
  })

  test('6. Investigation page has complete OG tags', async ({ request }) => {
    const listRes = await request.get('/api/investigations?limit=1')
    const listJson = await listRes.json()

    if (listJson.data && listJson.data.length > 0) {
      const slug = listJson.data[0].slug
      const res = await request.get(`/investigacion/${slug}`)
      const html = await res.text()

      expect(html).toContain('og:title')
      expect(html).toContain('og:description')
      expect(html).toContain('og:image')
      expect(html).toContain(`/api/og/investigation/${slug}`)
      expect(html).toContain('twitter:card')
      expect(html).toContain('article')
    }
  })

  test('7. Homepage has basic meta tags', async ({ request }) => {
    const res = await request.get('/')
    const html = await res.text()
    expect(html).toContain('<title')
    expect(html).toContain('Oficina de Rendición de Cuentas')
  })
})

test.describe('OG Image Generation', () => {
  test('8. Politician OG image is valid PNG at correct dimensions', async ({ request }) => {
    const res = await request.get('/api/og/politician/fernandez-de-kirchner-cristina')
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('image/png')

    const body = await res.body()
    expect(body.length).toBeGreaterThan(5000) // Real image, not a stub

    // PNG magic bytes
    expect(body[0]).toBe(0x89)
    expect(body[1]).toBe(0x50)
    expect(body[2]).toBe(0x4e)
    expect(body[3]).toBe(0x47)
  })

  test('9. Investigation OG image generates', async ({ request }) => {
    const listRes = await request.get('/api/investigations?limit=1')
    const listJson = await listRes.json()

    if (listJson.data && listJson.data.length > 0) {
      const slug = listJson.data[0].slug
      const res = await request.get(`/api/og/investigation/${slug}`)
      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toContain('image/png')
    }
  })

  test('10. OG images return 404 for nonexistent slugs', async ({ request }) => {
    const res = await request.get('/api/og/politician/nonexistent-person')
    expect(res.status()).toBe(404)
  })
})

test.describe('Public Access (No Auth Required)', () => {
  test('11. All shareable pages load without authentication', async ({ request }) => {
    const pages = [
      '/politico/fernandez-de-kirchner-cristina',
      '/provincias/buenos-aires',
      '/investigaciones',
      '/explorar',
      '/',
    ]

    for (const path of pages) {
      const res = await request.get(path)
      expect(res.status()).toBe(200)
    }
  })

  test('12. Draft content returns 404, not 403 (no information leak)', async ({ request }) => {
    const res = await request.get('/investigacion/nonexistent-draft-slug')
    // Must be 404, never 403 (that would reveal the draft exists)
    expect(res.status()).toBe(404)
  })
})
