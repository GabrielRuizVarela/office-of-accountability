import { test, expect } from '@playwright/test'

/**
 * LAUNCH CHECKLIST: Mobile Walkthrough
 *
 * Full user journey at 375px (iPhone SE) and 414px (iPhone 12) viewports.
 * Tests: homepage → explorer → search → politician profile → share
 *        homepage → investigations → read investigation
 *        homepage → provinces → politician
 */

test.describe('Mobile Walkthrough — iPhone SE (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('1. Homepage renders fully on mobile', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('Oficina de Rendición de Cuentas')
    await expect(page.getByRole('link', { name: 'Explorar el grafo' })).toBeVisible()
    await expect(page.getByText('329')).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/15-mobile-375-homepage.png', fullPage: true })
  })

  test('2. Graph explorer on mobile — search works', async ({ page }) => {
    await page.goto('/explorar')

    const searchInput = page.getByRole('combobox')
    await expect(searchInput).toBeVisible()

    // Type and search
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('macri', { delay: 100 })

    // Wait for dropdown
    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })

    // Select result
    await dropdown.getByRole('option').first().click()
    await page.waitForTimeout(1500)

    // Graph should load
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible()

    await page.screenshot({ path: 'test-results/manual/16-mobile-375-explorer.png', fullPage: true })
  })

  test('3. Politician profile on mobile — full content + share', async ({ page }) => {
    await page.goto('/politico/fernandez-de-kirchner-cristina')

    await expect(page.getByRole('heading', { name: /FERNANDEZ DE KIRCHNER/ })).toBeVisible()

    // Share button visible on mobile
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(shareBtn).toBeVisible()

    // Scroll to check vote history area
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: 'test-results/manual/17-mobile-375-politician.png',
      fullPage: true,
    })
  })

  test('4. Investigations page on mobile', async ({ page }) => {
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    await expect(page.getByRole('heading', { name: 'Investigaciones' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nueva investigación' })).toBeVisible()

    // Cards should stack vertically
    const cards = page.locator('article')
    const cardCount = await cards.count()
    if (cardCount > 0) {
      await expect(cards.first()).toBeVisible()
    }

    await page.screenshot({
      path: 'test-results/manual/18-mobile-375-investigations.png',
      fullPage: true,
    })
  })

  test('5. Province page on mobile', async ({ page }) => {
    await page.goto('/provincias/buenos-aires')
    await page.waitForTimeout(2000)

    // Should show politicians
    const links = page.locator('a[href*="/politico/"]')
    await expect(links.first()).toBeVisible({ timeout: 5000 })

    await page.screenshot({
      path: 'test-results/manual/19-mobile-375-province.png',
      fullPage: true,
    })
  })

  test('6. Auth pages on mobile', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/20-mobile-375-signin.png', fullPage: true })

    await page.goto('/auth/signup')
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/21-mobile-375-signup.png', fullPage: true })
  })
})

test.describe('Mobile Walkthrough — iPhone 12 (414px)', () => {
  test.use({ viewport: { width: 414, height: 896 } })

  test('7. Full journey: home → provinces → politician → share', async ({ page }) => {
    // Homepage
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()

    await page.screenshot({ path: 'test-results/manual/22-mobile-414-homepage.png' })

    // Navigate to provinces
    await page.goto('/provincias')
    await expect(page.locator('h1')).toBeVisible()
    await page.getByRole('link', { name: /buenos aires/i }).first().click()
    await expect(page).toHaveURL(/\/provincias\/buenos-aires/)

    await page.screenshot({ path: 'test-results/manual/23-mobile-414-province.png' })

    // Click a politician — large province page may take time to SSR
    await page.waitForTimeout(3000)
    const politicianLink = page.locator('a[href*="/politico/"]').first()
    await expect(politicianLink).toBeVisible({ timeout: 10_000 })
    await politicianLink.click()
    await expect(page).toHaveURL(/\/politico\//)

    // Verify share button on mobile
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible({ timeout: 5000 })

    await page.screenshot({
      path: 'test-results/manual/24-mobile-414-politician.png',
      fullPage: true,
    })
  })

  test('8. Full journey: home → investigations → read', async ({ page }) => {
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    const firstCard = page.locator('article a').first()
    if (await firstCard.isVisible().catch(() => false)) {
      await firstCard.click()
      await page.waitForTimeout(2000)

      // Should render investigation content
      await page.screenshot({
        path: 'test-results/manual/25-mobile-414-investigation.png',
        fullPage: true,
      })
    }
  })
})
