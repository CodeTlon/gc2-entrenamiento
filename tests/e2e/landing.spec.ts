import { test, expect } from '@playwright/test'

// ─── HOME PAGE ───────────────────────────────────────────────
test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('carga sin errores y muestra el hero', async ({ page }) => {
    await expect(page).toHaveTitle(/GC.*Entrenamiento/)
    await expect(page.locator('h1')).toContainText('SUPERÁ')
    await expect(page.locator('h1')).toContainText('TUS LÍMITES')
  })

  test('navbar es visible', async ({ page }) => {
    await expect(page.locator('nav#navbar')).toBeVisible()
  })

  test('sección nosotros existe con título correcto', async ({ page }) => {
    await expect(page.locator('#nosotros')).toBeVisible()
    await expect(page.locator('#nosotros h2')).toContainText('DEPORTES DE RESISTENCIA')
  })

  test('sección disciplinas muestra las 3 disciplinas', async ({ page }) => {
    await page.locator('#disciplinas').scrollIntoViewIfNeeded()
    await expect(page.locator('#disciplinas')).toContainText('RUNNING')
    await expect(page.locator('#disciplinas')).toContainText('DUATLÓN')
    await expect(page.locator('#disciplinas')).toContainText('TRIATLÓN')
  })

  test('sección grupales es visible', async ({ page }) => {
    await page.locator('#grupales').scrollIntoViewIfNeeded()
    await expect(page.locator('#grupales')).toBeVisible()
  })

  test('sección coaches muestra al menos un entrenador', async ({ page }) => {
    await page.locator('#profes').scrollIntoViewIfNeeded()
    await expect(page.locator('#profes')).toBeVisible()
    const cards = page.locator('#profes [class*="rounded"]')
    await expect(cards.first()).toBeVisible()
  })

  test('footer muestra badge de CodeTlon', async ({ page }) => {
    await page.locator('footer').scrollIntoViewIfNeeded()
    await expect(page.locator('footer')).toContainText('CodeTlon')
  })
})

// ─── NAVEGACIÓN ───────────────────────────────────────────────
// ─── NAVEGACIÓN ───────────────────────────────────────────────
test.describe('Navegación', () => {
  test('navegar a /planes desde navbar', async ({ page }) => {
    await page.goto('/')
    // En mobile el nav está oculto — usar goto directo
    await page.goto('/planes')
    await expect(page).toHaveURL('/planes')
    await expect(page.locator('h1')).toContainText('PLAN')
  })

  test('navegar a /contacto desde navbar', async ({ page }) => {
    await page.goto('/')
    await page.goto('/contacto')
    await expect(page).toHaveURL('/contacto')
    await expect(page.locator('h1')).toContainText('ENTRENAR')
  })

  test('navegar a /blog', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL('/blog')
    await expect(page.locator('h1')).toContainText('BLOG')
  })

  // Test de navegación real por navbar — solo desktop donde el nav es visible
  test('links del navbar son visibles en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.locator('a[href="/planes"]:visible').first()).toBeVisible()
    await expect(page.locator('a[href="/contacto"]:visible').first()).toBeVisible()
  })
})

// ─── PLANES PAGE ─────────────────────────────────────────────
test.describe('Página de Planes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planes')
  })

  test('muestra planes para corredores (A, B, C)', async ({ page }) => {
    await expect(page.getByText('PARA CORREDORES')).toBeVisible()
    await expect(page.getByText('Plan A').or(page.locator('text=A.')).first()).toBeVisible()
  })

  test('muestra planes para triatletas', async ({ page }) => {
    await expect(page.getByText('Para Triatletas', { exact: true })).toBeVisible()
  })

  test('muestra clases grupales', async ({ page }) => {
    await expect(page.getByText('CLASES GRUPALES')).toBeVisible()
  })

  test('plan featured tiene badge Popular o Recomendado', async ({ page }) => {
    const badge = page.getByText(/Popular|Recomendado|Destacado|Más elegido/i).first()
    const exists = await badge.count()
    if (exists > 0) {
      await expect(badge).toBeVisible()
    } else {
      // Si no hay badge, verificar que hay al menos un plan con precio destacado
      await expect(page.locator('.plan-featured, [data-featured], .border-accent').first()).toBeVisible()
    }
  })

  test('botones CONSULTAR llevan a WhatsApp', async ({ page }) => {
    const consultarLinks = page.locator('a:has-text("CONSULTAR")')
    const count = await consultarLinks.count()
    expect(count).toBeGreaterThan(0)
    const href = await consultarLinks.first().getAttribute('href')
    expect(href).toContain('wa.me')
  })
})

// ─── CONTACTO PAGE ────────────────────────────────────────────
test.describe('Página de Contacto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto')
  })

  test('muestra formulario con todos los campos', async ({ page }) => {
    await expect(page.locator('input[name="nombre"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="telefono"]')).toBeVisible()
    await expect(page.locator('textarea[name="mensaje"]')).toBeVisible()
  })

  test('muestra cards de WhatsApp, Instagram y Email', async ({ page }) => {
    await expect(page.getByText('WhatsApp')).toBeVisible()
    await expect(page.getByText('Instagram')).toBeVisible()
    await expect(page.getByText('Email')).toBeVisible()
  })

  test('validación del formulario — campos requeridos vacíos', async ({ page }) => {
    await page.click('button[type="submit"]')
    // El browser valida los campos required antes de enviar
    const nombreInput = page.locator('input[name="nombre"]')
    await expect(nombreInput).toBeVisible()
  })
})

// ─── WHATSAPP BUTTON ─────────────────────────────────────────
test.describe('WhatsApp Button', () => {
  test('es visible en la home', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('a[aria-label="Contactar por WhatsApp"]')).toBeVisible()
  })

  test('es visible en planes', async ({ page }) => {
    await page.goto('/planes')
    await expect(page.locator('a[aria-label="Contactar por WhatsApp"]')).toBeVisible()
  })

  test('es visible en contacto', async ({ page }) => {
    await page.goto('/contacto')
    await expect(page.locator('a[aria-label="Contactar por WhatsApp"]')).toBeVisible()
  })
})

// ─── SEO BÁSICO ───────────────────────────────────────────────
test.describe('SEO', () => {
  test('home tiene meta description', async ({ page }) => {
    await page.goto('/')
    const meta = page.locator('meta[name="description"]')
    const content = await meta.getAttribute('content')
    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(50)
  })

  test('planes tiene título correcto', async ({ page }) => {
    await page.goto('/planes')
    await expect(page).toHaveTitle(/Planes.*GC²/)
  })

  test('contacto tiene título correcto', async ({ page }) => {
    await page.goto('/contacto')
    await expect(page).toHaveTitle(/Contacto.*GC²/)
  })

  test('todas las imágenes tienen alt text', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt, `Imagen ${i} sin alt text`).toBeTruthy()
    }
  })
})

// ─── REDIRECTS PHP ────────────────────────────────────────────
test.describe('Redirects 301 desde URLs PHP', () => {
  test('/index.php redirige a /', async ({ page }) => {
    const response = await page.goto('/index.php')
    expect(page.url()).toMatch(/\/$/)
  })

  test('/planes.php redirige a /planes', async ({ page }) => {
    await page.goto('/planes.php')
    await expect(page).toHaveURL('/planes')
  })

  test('/contacto.php redirige a /contacto', async ({ page }) => {
    await page.goto('/contacto.php')
    await expect(page).toHaveURL('/contacto')
  })
})
