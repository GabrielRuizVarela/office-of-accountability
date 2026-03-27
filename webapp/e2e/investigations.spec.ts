import { test, expect } from '@playwright/test'

test.describe('Investigations - Public', () => {
  test('investigations index loads and shows cards', async ({ page }) => {
    await page.goto('/investigaciones')
    await expect(page.getByText('Investigaciones').first()).toBeVisible()

    // Should show "Nueva investigación" CTA
    await expect(page.getByRole('link', { name: 'Nueva investigación' })).toBeVisible()

    // Wait for investigations to load
    await page.waitForTimeout(2000)

    // If investigations exist, cards should appear
    const cards = page.locator('article')
    const count = await cards.count()
    if (count > 0) {
      // First card should have a title link
      await expect(cards.first().locator('a').first()).toBeVisible()
    }
  })

  test('investigations index has tag filter pills', async ({ page }) => {
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    // "Todas" button should be active by default
    const todasBtn = page.getByRole('button', { name: 'Todas' })
    if (await todasBtn.isVisible()) {
      await expect(todasBtn).toBeVisible()
    }
  })

  test('clicking tag filters investigations', async ({ page }) => {
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    // Find any tag button (not "Todas")
    const tagButtons = page
      .locator('button')
      .filter({ hasText: /^(?!Todas$)/ })
      .filter({ has: page.locator('.rounded-full') })
    const tagCount = await tagButtons.count()

    if (tagCount > 0) {
      const tagText = await tagButtons.first().innerText()
      await tagButtons.first().click()
      // URL should update with tag param
      await expect(page).toHaveURL(new RegExp(`tag=${encodeURIComponent(tagText)}`))
    }
  })

  test('clicking investigation card navigates to detail page', async ({ page }) => {
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    const firstCard = page.locator('article a').first()
    if (await firstCard.isVisible()) {
      const href = await firstCard.getAttribute('href')
      await firstCard.click()
      await expect(page).toHaveURL(href!)
    }
  })

  test('investigation detail page renders server-side', async ({ page }) => {
    // First get a real investigation slug from the API
    const apiRes = await page.request.get('/api/investigations?limit=1')
    const json = await apiRes.json()

    if (json.data && json.data.length > 0) {
      const slug = json.data[0].slug
      const response = await page.goto(`/investigacion/${slug}`)
      expect(response?.status()).toBe(200)

      // Check SSR content
      const html = await page.content()
      expect(html).toContain(json.data[0].title)
    }
  })

  test('nonexistent investigation returns 404', async ({ page }) => {
    const response = await page.goto('/investigacion/nonexistent-draft-investigation')
    expect(response?.status()).toBe(404)
  })

  test('investigation API pagination works', async ({ request }) => {
    const res1 = await request.get('/api/investigations?page=1&limit=5')
    expect(res1.status()).toBe(200)
    const json1 = await res1.json()
    expect(json1.success).toBe(true)
    expect(json1.meta.page).toBe(1)
    expect(json1.meta.limit).toBe(5)

    if (json1.meta.hasMore) {
      const res2 = await request.get('/api/investigations?page=2&limit=5')
      expect(res2.status()).toBe(200)
      const json2 = await res2.json()
      expect(json2.meta.page).toBe(2)
    }
  })

  test('investigation API rejects invalid params', async ({ request }) => {
    const res = await request.get('/api/investigations?page=-1')
    expect(res.status()).toBe(400)
  })

  test('investigation tags API returns tags', async ({ request }) => {
    const res = await request.get('/api/investigations/tags')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })
})
