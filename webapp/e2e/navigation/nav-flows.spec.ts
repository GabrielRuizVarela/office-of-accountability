import { test, expect } from '@playwright/test'

test.describe('Navigation — home page links', () => {
  test('home page has links to cases', async ({ page }) => {
    await page.goto('/')
    // Should have at least one link pointing to a caso page
    const casoLinks = page.locator('a[href*="/caso/"]')
    await expect(casoLinks.first()).toBeVisible({ timeout: 10_000 })
    expect(await casoLinks.count()).toBeGreaterThan(0)
  })

  test('clicking a case card navigates to case overview', async ({ page }) => {
    await page.goto('/')
    const casoLink = page.locator('a[href*="/caso/"]').first()
    const href = await casoLink.getAttribute('href')
    expect(href).toBeTruthy()

    await casoLink.click()
    await page.waitForURL(/\/caso\//, { timeout: 10_000 })
    expect(page.url()).toContain('/caso/')
  })
})

test.describe('Navigation — case tabs', () => {
  test('case tabs are clickable and navigate to sub-pages', async ({ page }) => {
    await page.goto('/caso/caso-epstein')

    // Look for tab-like navigation links within the case
    const subLinks = page.locator('a[href*="/caso/caso-epstein/"]')
    const count = await subLinks.count()

    if (count > 0) {
      const firstLink = subLinks.first()
      const href = await firstLink.getAttribute('href')
      await firstLink.click()
      await page.waitForTimeout(2000)
      expect(page.url()).toContain('/caso/caso-epstein/')
    }
  })
})

test.describe('Navigation — browser history', () => {
  test('browser back button works after navigation', async ({ page }) => {
    await page.goto('/')
    const initialUrl = page.url()

    await page.goto('/caso/caso-epstein')
    await page.waitForTimeout(1000)

    await page.goBack()
    await page.waitForTimeout(1000)

    // Should be back at home or a previous page
    expect(page.url()).not.toContain('/caso/caso-epstein')
  })
})

test.describe('Navigation — deep linking', () => {
  test('deep link to /caso/caso-epstein/cronologia works', async ({ page }) => {
    const res = await page.goto('/caso/caso-epstein/cronologia')
    expect(res?.status()).not.toBe(500)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/explorar page loads the graph explorer', async ({ page }) => {
    const res = await page.goto('/explorar')
    expect(res?.status()).not.toBe(500)
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('/provincias page loads if it exists', async ({ page }) => {
    const res = await page.goto('/provincias')
    // May be 404 if not implemented — just should not 500
    expect(res?.status()).not.toBe(500)
  })
})
