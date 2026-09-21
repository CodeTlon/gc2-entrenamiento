# CONVENTIONS

## Componentes

- **Server Components por defecto.** Client sólo cuando hay estado/efectos reales: Navbar, Hero (parallax), ScrollProgress, ScrollReveal, ContactForm, CoachModal/PlanModal, DashboardShell, formularios del panel.
- Imágenes siempre con `next/image`. Remote patterns permitidos: `images.unsplash.com`, `*.supabase.co`.

## Server Actions (`src/actions/*.ts`)

- Firma estándar: `(prevState, formData) => Promise<State>`, consumida con `useFormState` + `useFormStatus` de `react-dom`.
- Toda acción que muta datos del dashboard usa `createSupabaseServerClient()` (cliente con sesión real, RLS aplicado) **y además** llama `requireUser()`/`getUser()` explícitamente — no confíes sólo en RLS ni sólo en el gate de `proxy.ts`; es defensa en profundidad intencional, no la quites al refactorizar.
- `createSupabaseServiceClient()` (service-role, bypassea RLS) está reservado para: `contact_leads` (insert/select, porque su RLS de lectura es sólo `service_role`) y la Admin API de Supabase Auth (`admin.generateLink`, para invites/recovery). No lo uses para ninguna otra tabla.

## Validación

Zod para inputs de server actions.

## Uploads

- Imágenes: pasan por `uploadMediaAction` (Server Action) que optimiza con `sharp` antes de guardar.
- PDF/video (posts): usan `uploadDirectToStorage` (`src/lib/client-upload.ts`, `createBrowserClient` de `@supabase/ssr`) para subir **directo al bucket `media` desde el browser**, bypasseando el Server Action. **Motivo**: Vercel corta el body real de una Server Action en ~4.5MB, muy por debajo de los límites de PDF (10MB)/video (60MB). La autorización sigue protegida por la RLS de `storage.objects` (exige `authenticated`), así que el bypass no es un problema de seguridad — sólo significa que el chequeo de tamaño/mime de la app no aplica en ese path puntual (ver nota en `KNOWN_ISSUES.md`).

## Estilos

Tailwind + componentes utilitarios en `globals.css`: `.btn`, `.btn--primary`, `.plan-card`, `.field-input`, `.section-title`, `.gradient-text`, `.reveal`. Paleta `blue-900..blue-100` + `accent` (`#38BDF8`). Spacing custom: `section`, `gap-sm/md/lg/xl`.

## Testing

Playwright (`tests/`) — patrón de smoke test resiliente (no CMS-dependiente): verifica que cada ruta pública renderiza sin 500, navbar/footer presentes, auth-gate de `/dashboard` funciona, redirects `.php` legacy, SEO/robots/sitemap, 404. Corre en Chromium en 3 viewports (no WebKit).

## Idioma y comentarios

- Todo el contenido de usuario y textos de UI en español (es_AR).
- Comentarios de código en español, sólo cuando aportan algo que el código no dice por sí solo — no agregar comentarios obvios.

## SEO / AEO

Metadata + JSON-LD (`SportsOrganization`) en el layout raíz. `sitemap.ts`/`robots.ts` con App Router. Redirects 301 desde URLs `.php` legacy. `public/llms.txt` para agentes de IA/buscadores (contenido de negocio, no técnico — no confundir con esta capa de contexto).
