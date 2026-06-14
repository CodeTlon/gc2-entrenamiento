import { test, expect } from '@playwright/test'

// Smoke E2E resiliente.
//
// El sitio público de GC² es CMS-driven (hero, secciones, planes, coaches salen de
// Supabase) y el Supabase *dev* está vacío de contenido. Por eso este smoke NO asserta
// sobre el copy del CMS — valida lo determinístico que no depende de los datos:
//   · cada ruta pública renderiza sin 500 (el footer del layout se monta)
//   · chrome estático (navbar)
//   · auth-gate del dashboard
//   · redirects 301 de las URLs legacy .php
//   · SEO / infra (title + meta description, robots.txt, sitemap.xml, 404)
// Corre en 3 viewports (mobile / tablet / desktop) contra `npm run build && npm start`.

const PUBLIC_ROUTES = ['/', '/planes', '/contacto', '/blog', '/privacidad', '/terminos']

test.describe('Público — renderiza sin 500', () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} responde <400 y monta el layout (footer)`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status(), `status HTTP de ${path}`).toBeLessThan(400)
      // El footer vive en el layout (public) → presente en toda página que renderizó OK.
      await expect(page.locator('footer')).toContainText('CodeTlon')
    })
  }
})

test.describe('Chrome estático', () => {
  test('navbar montado en la home', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav#navbar')).toBeVisible()
  })
})

test.describe('Dashboard — auth gate', () => {
  test('/dashboard sin sesión redirige a /dashboard/login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard\/login\b/)
  })
})

test.describe('Redirects legacy .php (301 → ruta limpia)', () => {
  const redirects: [string, string][] = [
    ['/index.php', '/'],
    ['/planes.php', '/planes'],
    ['/contacto.php', '/contacto'],
  ]
  for (const [from, to] of redirects) {
    test(`${from} → ${to}`, async ({ page }) => {
      await page.goto(from)
      expect(new URL(page.url()).pathname).toBe(to)
    })
  }
})

test.describe('SEO / infra', () => {
  test('home tiene title y meta description', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/)
  })

  test('robots.txt responde', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBeLessThan(400)
  })

  test('sitemap.xml responde', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBeLessThan(400)
  })

  test('ruta inexistente devuelve 404', async ({ page }) => {
    const res = await page.goto('/no-existe-xyz-123')
    expect(res?.status()).toBe(404)
  })
})
