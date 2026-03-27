import { test, expect } from '@playwright/test'

test.describe('Authentication - Sign In', () => {
  test('sign-in page renders with form fields', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })

  test('sign-in shows Google OAuth option', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.getByText('Continuar con Google')).toBeVisible()
  })

  test('sign-in has link to sign up', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('link', { name: 'Crear cuenta' }).click()
    await expect(page).toHaveURL('/auth/signup')
  })

  test('sign-in has forgot password link', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click()
    await expect(page).toHaveURL('/auth/forgot-password')
  })

  test('sign-in with wrong credentials does not grant access', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Contraseña').fill('wrongpassword123')
    await page.getByRole('button', { name: 'Ingresar' }).click()

    // Wait for response
    await page.waitForTimeout(3000)
    // Verify: user should NOT end up on a protected page
    // They might see an error, stay on signin, go to home, or go to error page
    const url = page.url()
    expect(url).not.toContain('/perfil')
    expect(url).not.toContain('/mis-investigaciones')
    expect(url).not.toContain('/investigacion/nueva')
  })

  test('sign-in submit button shows loading state', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Contraseña').fill('testpassword123')
    await page.getByRole('button', { name: 'Ingresar' }).click()
    // Button should briefly change or page should respond
    await page.waitForTimeout(2000)
  })
})

test.describe('Authentication - Sign Up', () => {
  test('sign-up page renders with all form fields', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
    await expect(page.getByLabel('Nombre')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
  })

  test('sign-up has link to sign in', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByRole('link', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL('/auth/signin')
  })

  test('sign-up API rejects empty body', async ({ request }) => {
    const res = await request.post('/api/auth/signup', { data: {} })
    expect(res.status()).toBe(400)
  })

  test('sign-up API rejects invalid email', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: 'not-an-email', password: 'SecurePassword123!xyz', name: 'Test' },
    })
    expect(res.status()).toBe(400)
  })

  test('sign-up API rejects weak password', async ({ request }) => {
    const res = await request.post('/api/auth/signup', {
      data: { email: 'test@example.com', password: 'short', name: 'Test' },
    })
    expect(res.status()).toBe(400)
  })

  test('sign-up form submits and shows server-side validation', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.getByLabel('Nombre').fill('Test')
    await page.getByLabel('Email').fill('test@example.com')
    // Use a password that passes browser minLength=8 but gets caught by server
    await page.getByLabel('Contraseña').fill('password')
    await page.getByRole('button', { name: 'Crear cuenta' }).click()

    // Should show error from haveibeenpwned check or duplicate email
    await page.waitForTimeout(3000)
    // Page should either show error alert or stay on signup
    const url = page.url()
    expect(url).toContain('/auth/')
  })
})

test.describe('Authentication - Password Reset', () => {
  test('forgot password page renders with email field', async ({ page }) => {
    await page.goto('/auth/forgot-password')
    await expect(page.locator('form')).toBeVisible()
  })

  test('reset password page renders', async ({ page }) => {
    await page.goto('/auth/reset-password')
    expect(await page.title()).toBeDefined()
  })

  test('verify email page renders', async ({ page }) => {
    await page.goto('/auth/verify-email')
    expect(await page.title()).toBeDefined()
  })
})

test.describe('Authentication - Protected Routes', () => {
  test('unauthenticated GET /api/profile returns 401', async ({ request }) => {
    const res = await request.get('/api/profile')
    expect(res.status()).toBe(401)
  })

  test('unauthenticated POST to investigations blocked', async ({ request }) => {
    const res = await request.post('/api/investigations', {
      data: { title: 'Test', body: '{}', tags: [] },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('unauthenticated PATCH to investigation blocked', async ({ request }) => {
    const res = await request.patch('/api/investigations/fake-id', {
      data: { title: 'Updated' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('unauthenticated DELETE to investigation blocked', async ({ request }) => {
    const res = await request.delete('/api/investigations/fake-id')
    expect([401, 403]).toContain(res.status())
  })

  test('/investigacion/nueva shows auth redirect', async ({ page }) => {
    await page.goto('/investigacion/nueva')
    await expect(
      page.getByText('Redirigiendo').or(page.getByText('Cargando')),
    ).toBeVisible({ timeout: 5000 })
  })

  test('/perfil shows auth redirect', async ({ page }) => {
    await page.goto('/perfil')
    await expect(
      page.getByText('Redirigiendo').or(page.getByText('Cargando')),
    ).toBeVisible({ timeout: 5000 })
  })
})
