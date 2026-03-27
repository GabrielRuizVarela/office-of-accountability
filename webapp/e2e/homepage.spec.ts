import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('renders hero and navigates to graph explorer', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Oficina de Rendición de Cuentas')
    await expect(page.getByText('Plataforma de conocimiento cívico')).toBeVisible()
    await expect(page.getByText('Explorá las conexiones entre legisladores')).toBeVisible()

    // Click primary CTA
    await page.getByRole('link', { name: 'Explorar el grafo' }).click()
    await expect(page).toHaveURL('/explorar')
    await page.goBack()
  })

  test('navigation bar has all links and they work', async ({ page }) => {
    await page.goto('/')

    // Header nav links
    const explorarLink = page.locator('header').getByRole('link', { name: 'Explorar' })
    const investigacionesLink = page
      .locator('header')
      .getByRole('link', { name: 'Investigaciones' })
    const signinLink = page.locator('header').getByRole('link', { name: 'Iniciar sesión' })
    await expect(explorarLink).toBeVisible()
    await expect(investigacionesLink).toBeVisible()
    await expect(signinLink).toBeVisible()

    // Navigate via header
    await investigacionesLink.click()
    await expect(page).toHaveURL('/investigaciones')
    await page.goBack()

    // Navigate to sign in
    await page.locator('header').getByRole('link', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL('/auth/signin')
  })

  test('section cards link to correct destinations', async ({ page }) => {
    await page.goto('/')

    // Click "Grafo Interactivo" card
    await page.getByText('Grafo Interactivo').click()
    await expect(page).toHaveURL('/explorar')
    await page.goBack()

    // Click "Contribuí" card goes to signup
    await page.getByText('Contribuí').click()
    await expect(page).toHaveURL('/auth/signup')
  })

  test('stats section displays correct numbers', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('329')).toBeVisible()
    await expect(page.getByText('Legisladores', { exact: true })).toBeVisible()
    await expect(page.getByText('257 Diputados + 72 Senadores')).toBeVisible()
  })

  test('footer links navigate correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Datos abiertos para la democracia argentina')).toBeVisible()
    const footer = page.locator('footer')
    await footer.getByRole('link', { name: 'Explorar' }).click()
    await expect(page).toHaveURL('/explorar')
  })
})
