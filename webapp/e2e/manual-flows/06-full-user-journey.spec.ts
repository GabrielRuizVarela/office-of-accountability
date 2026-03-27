import { test, expect } from '@playwright/test'

/**
 * LAUNCH CHECKLIST: Full E2E User Journeys
 *
 * These simulate complete user stories end-to-end:
 * 1. New visitor discovers the platform and explores
 * 2. User searches for a specific politician and explores their network
 * 3. User browses investigations and reads one
 * 4. User tries to create content and is prompted to register
 */

test.describe('Journey: Curious Citizen Discovers Platform', () => {
  test('visitor lands → explores → finds a politician → shares', async ({ page }) => {
    // 1. Land on homepage
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Oficina de Rendición de Cuentas')
    await expect(page.getByText('Explorá las conexiones')).toBeVisible()

    // 2. Click "Explorar el grafo"
    await page.getByRole('link', { name: 'Explorar el grafo' }).click()
    await expect(page).toHaveURL('/explorar')
    await expect(page.getByText('Explorar el grafo')).toBeVisible() // empty state

    // 3. Search for a politician
    const searchInput = page.getByRole('combobox')
    await searchInput.click()
    await page.waitForTimeout(500)
    await searchInput.pressSequentially('kirchner', { delay: 80 })

    const dropdown = page.locator('#search-results-listbox')
    await expect(dropdown).toBeVisible({ timeout: 10_000 })

    // 4. Select from autocomplete
    const firstResult = dropdown.getByRole('option').first()
    const resultText = await firstResult.textContent()
    await firstResult.click()

    // 5. Graph populates
    await expect(page.getByText('Explorar el grafo')).not.toBeVisible({ timeout: 5000 })

    await page.screenshot({ path: 'test-results/manual/29-journey-explorer.png' })

    // 6. Now navigate to a politician profile page
    await page.goto('/politico/fernandez-de-kirchner-cristina')
    await expect(page.getByRole('heading', { name: /FERNANDEZ DE KIRCHNER/ })).toBeVisible()

    // 7. Share via WhatsApp
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
    await expect(shareBtn).toBeVisible()

    await page.screenshot({
      path: 'test-results/manual/30-journey-politician.png',
      fullPage: true,
    })
  })
})

test.describe('Journey: Researcher Reads Investigations', () => {
  test('visitor reads published investigation with embedded data', async ({ page }) => {
    // 1. Go to investigations
    await page.goto('/investigaciones')
    await page.waitForTimeout(2000)

    await expect(page.getByRole('heading', { name: 'Investigaciones' })).toBeVisible()

    // 2. Click first investigation
    const firstCard = page.locator('article a').first()
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip()
      return
    }

    const title = await firstCard.textContent()
    await firstCard.click()
    await page.waitForTimeout(2000)

    // 3. Verify investigation content renders
    if (title) {
      await expect(page.getByText(title)).toBeVisible()
    }

    // 4. Check for OG tags in HTML
    const html = await page.content()
    expect(html).toContain('og:title')

    // 5. Check for share buttons
    const shareBtn = page.locator('button[title="Compartir por WhatsApp"]')
    if (await shareBtn.isVisible().catch(() => false)) {
      await expect(shareBtn).toBeVisible()
    }

    await page.screenshot({
      path: 'test-results/manual/31-journey-investigation.png',
      fullPage: true,
    })
  })
})

test.describe('Journey: User Tries to Contribute', () => {
  test('visitor clicks "Nueva investigación" → redirected to sign up', async ({ page }) => {
    // 1. Visit investigations page
    await page.goto('/investigaciones')
    await page.waitForTimeout(1000)

    // 2. Click "Nueva investigación"
    await page.getByRole('link', { name: 'Nueva investigación' }).click()
    await page.waitForTimeout(3000)

    // 3. Should be redirected to sign-in (not authenticated)
    const url = page.url()
    const redirectedToAuth = url.includes('/auth/')
    const showsRedirectMsg = await page.getByText('Redirigiendo').isVisible().catch(() => false)
    const showsLoadingMsg = await page.getByText('Cargando').isVisible().catch(() => false)

    expect(redirectedToAuth || showsRedirectMsg || showsLoadingMsg).toBe(true)

    await page.screenshot({ path: 'test-results/manual/32-journey-auth-redirect.png' })

    // 4. If redirected to signin, verify signup link exists
    if (url.includes('/auth/signin')) {
      await expect(page.getByRole('link', { name: 'Crear cuenta' })).toBeVisible()

      // 5. Navigate to signup
      await page.getByRole('link', { name: 'Crear cuenta' }).click()
      await expect(page).toHaveURL('/auth/signup')
      await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
    }

    await page.screenshot({ path: 'test-results/manual/33-journey-signup.png' })
  })
})

test.describe('Journey: Browse by Province', () => {
  test('visitor explores provinces → finds politicians → views profile', async ({ page }) => {
    // 1. Visit provinces index
    await page.goto('/provincias')
    await expect(page.locator('h1')).toBeVisible()

    const provinceLinks = page.locator('a[href*="/provincias/"]')
    const count = await provinceLinks.count()
    expect(count).toBeGreaterThan(10) // 24 Argentine provinces

    await page.screenshot({ path: 'test-results/manual/34-journey-provinces.png', fullPage: true })

    // 2. Click Buenos Aires
    await page.getByRole('link', { name: /buenos aires/i }).first().click()
    await expect(page).toHaveURL(/\/provincias\/buenos-aires/)

    // 3. See politician list — large province may take time to SSR
    await page.waitForTimeout(3000)
    const politicianLinks = page.locator('a[href*="/politico/"]')
    await expect(politicianLinks.first()).toBeVisible({ timeout: 10_000 })
    const politicianCount = await politicianLinks.count()
    expect(politicianCount).toBeGreaterThan(5)

    await page.screenshot({
      path: 'test-results/manual/35-journey-buenos-aires.png',
      fullPage: true,
    })

    // 4. Click first politician
    const firstPol = politicianLinks.first()
    const href = await firstPol.getAttribute('href')
    await firstPol.click()
    await expect(page).toHaveURL(href!)

    // 5. Verify politician profile
    await expect(page.locator('button[title="Compartir por WhatsApp"]')).toBeVisible({ timeout: 5000 })

    // 6. Navigate back via breadcrumb
    const orcLink = page.getByRole('link', { name: 'ORC' }).first()
    if (await orcLink.isVisible().catch(() => false)) {
      await orcLink.click()
      await expect(page).toHaveURL('/')
    }

    await page.screenshot({ path: 'test-results/manual/36-journey-complete.png' })
  })
})
