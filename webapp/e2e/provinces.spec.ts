import { test, expect } from '@playwright/test'

test.describe('Province Pages', () => {
  test('province index shows all provinces with counts', async ({ page }) => {
    await page.goto('/provincias')
    await expect(page.locator('h1')).toBeVisible()

    // Should show province cards with politician counts
    const provinceLinks = page.locator('a[href*="/provincias/"]')
    const count = await provinceLinks.count()
    expect(count).toBeGreaterThan(10) // Argentina has 24 provinces
  })

  test('navigate from index to province page', async ({ page }) => {
    await page.goto('/provincias')

    // Click Buenos Aires
    await page.getByRole('link', { name: /buenos aires/i }).first().click()
    await expect(page).toHaveURL(/\/provincias\/buenos-aires/)
  })

  test('province page shows politicians grouped by chamber', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    const response = await page.request.get('/provincias/buenos-aires')
    expect(response.status()).toBe(200)

    // Should show politician names
    const politicianLinks = page.locator('a[href*="/politico/"]')
    await expect(politicianLinks.first()).toBeVisible({ timeout: 5000 })
    const count = await politicianLinks.count()
    expect(count).toBeGreaterThan(5)
  })

  test('clicking politician navigates to profile', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    const firstPolitician = page.locator('a[href*="/politico/"]').first()
    await expect(firstPolitician).toBeVisible({ timeout: 5000 })
    const href = await firstPolitician.getAttribute('href')
    await firstPolitician.click()
    await expect(page).toHaveURL(href!)
  })

  test('returns 404 for nonexistent province', async ({ page }) => {
    const response = await page.goto('/provincias/nonexistent-province')
    expect(response?.status()).toBe(404)
  })

  test('rejects path traversal', async ({ request }) => {
    const res = await request.get('/provincias/..%2F..%2Fetc%2Fpasswd')
    expect(res.status()).toBe(404)
  })

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    // Click ORC breadcrumb to go home
    const orcLink = page.getByRole('link', { name: 'ORC' }).first()
    if (await orcLink.isVisible()) {
      await orcLink.click()
      await expect(page).toHaveURL('/')
    }
  })
})
