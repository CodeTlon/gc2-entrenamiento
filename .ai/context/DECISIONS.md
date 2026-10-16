# DECISIONS

Decisiones de diseño reales, con motivo, reconstruidas de código/comentarios/changelog. Formato: decisión → por qué → alternativa descartada (si se conoce).

## Upload directo a Storage para PDF/video de posts

**Decisión**: `uploadDirectToStorage` (browser → Storage directo) en vez de pasar por un Server Action, para PDF/video adjuntos a posts.
**Por qué (FACT)**: Vercel corta el body real de una Server Action en ~4.5MB, muy por debajo de los límites de PDF (10MB)/video (60MB) que el proyecto quería soportar.
**Alternativa descartada**: subir por Server Action con streaming — no explorada en el código; la RLS de `storage.objects` ya permitía el insert `authenticated` sin cambios, así que ir directo al bucket fue el camino de menor resistencia.

## `contact_leads` con cliente `service_role`

**Decisión**: única tabla leída/escrita con el cliente admin en vez del cliente de sesión.
**Por qué (FACT, RLS en `001_contact_leads.sql`)**: su policy de lectura es sólo `service_role` (los leads no deben ser legibles por cualquier usuario autenticado del dashboard sin pasar por lógica de servidor) mientras el insert queda abierto (`with check(true)`) para que el formulario público, sin sesión, pueda enviar.

## Rename `middleware.ts` → `proxy.ts`

**Decisión**: el auth gate de `/dashboard` se llama `proxy.ts`, no `middleware.ts`.
**Por qué (FACT)**: breaking change de Next 16 — el archivo se renombró convencionalmente. No es una decisión de diseño propia del proyecto, es alineación con el framework.

## Recovery de contraseña vía Resend + `admin.generateLink`, no `resetPasswordForEmail`

**Decisión** (changelog v1.4.0): `forgotPasswordAction` genera el link con la Admin API de Supabase y lo manda con Resend, en vez de usar `supabase.auth.resetPasswordForEmail`.
**Por qué (FACT, changelog)**: el rate limit de emails de Supabase en el free tier es bajo — el email de recovery llegaba lento o a spam. Resend es el mismo proveedor que ya se usa para el resto del sitio.
**Efecto colateral documentado**: el link de recovery apunta a `/auth/confirm` (`verifyOtp`) en vez de `/auth/callback` (PKCE), porque no hay `code_verifier` en el navegador del usuario que recibe el link por email — mismo motivo que los invites del panel.

## ISR (`revalidate = 3600`) en vez de renderizado dinámico

**Decisión** (changelog v1.4.0): home, `/blog`, `/blog/[slug]` y `/planes` pasaron a ISR con revalidate de 1 hora.
**Por qué**: ASSUMPTION — el changelog no da el motivo explícito más allá de "antes eran dinámicas en cada request"; razonablemente es para reducir carga a Supabase/tiempo de respuesta en contenido que cambia poco. No verificado con datos de performance reales.

## `@vercel/og` corriendo server-side (route handler dedicado)

**Decisión**: el export a Instagram Story (`dashboard/(panel)/blog/[id]/story/route.tsx`) genera el PNG enteramente en el servidor.
**Por qué (FACT, comentario en `.claude/CLAUDE.md`)**: evita CORS al leer la portada del post desde `*.supabase.co` — generar la imagen client-side hubiera chocado con la política de CORS del bucket de Storage.

## Límites de upload diferenciados por mime (no un límite fijo único)

**Decisión** (changelog v1.3.0): `src/lib/upload-limits.ts` reemplazó un límite fijo de 12MB por límites específicos (imagen 20MB, PDF 10MB, video 60MB).
**Por qué**: UNKNOWN el razonamiento exacto de cada número — el changelog documenta el cambio pero no una justificación cuantitativa (p. ej. por qué 60MB y no 100MB para video). Asumible que son límites prácticos elegidos a mano, no derivados de un análisis formal.

## Items sin decisión documentada (UNKNOWN explícito)

- Por qué Barlow/Barlow Condensed como tipografías (probablemente heredado 1:1 del sitio PHP+SCSS legacy, según nota de "migración fiel" en `.claude/CLAUDE.md`, pero no hay una decisión explícita registrada).
- Por qué Zod específicamente (y no otra lib de validación) — no hay rationale registrado, es simplemente el estándar del ecosistema Next/TS.

## Video: servicio global de compresion, no ffmpeg en la app (2026-10-15)
**Contexto:** el blog acepta video propio de hasta 60 MB sin compresion. **Decision:** `/api/upload` pasa los videos por el servicio global de CodeTlon (`codetlon-cloud/.claude/modules/video-transcode.md`), preset `web`, server-to-server. **Soft-fail obligatorio:** sin `TRANSCODE_API_KEY`, con error o con resultado mas pesado, se conserva el original. Una sola key para toda la flota, solo en variables de Coolify. **Descartado:** ffmpeg dentro de la app (peso de imagen y RAM) y compresion en el navegador (depende del navegador, tope de duracion).

## Estandar de versiones de la flota: Tailwind 4, React 19, ESLint 10 (2026-10-16)
**Decision**: el proyecto sigue el conjunto de `codetlon-cloud/.claude/modules/stack-versions.md`, con versiones exactas.
**Por que**: reducir vulnerabilidades. Con Tailwind 3 el `npm audit` completo arrastraba una alta (`chokidar`/`braces`/`micromatch`) y moderadas de PostCSS; ESLint 9 ya no tiene soporte. Tailwind 4 y los overrides de `esbuild`/`fflate` las eliminan.
**Consecuencias**: `tailwind.config.ts` desaparece (tokens en `@theme`); `delay-N` pasa a `reveal-delay-N`; `lucide-react` queda en la ultima 0.x porque la 1.x quito los iconos de marca; el braces de lint queda como excepcion documentada.
