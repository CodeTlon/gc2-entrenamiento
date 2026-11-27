# DOMAIN — modelo de datos y reglas de negocio

## Tablas y relaciones (FACT, de `src/db/schema.ts` y `drizzle/`; en `main` vienen de `supabase/migrations/*.sql`)

- **`contact_leads`** — leads del formulario público. Única tabla con lectura restringida (sólo `service_role`); insert abierto a cualquiera (`with check (true)`).
- **`posts`** — artículos de blog: `title`, `slug`, `excerpt`, `content`, `cover_image`, `youtube_url`, `video_url` (video propio, alternativa a YouTube), `attachment_url` (PDF), `published`, `author_id`, `coach_id` (FK→`coaches`), `category_id` (FK→`categories`, **legacy**, no se actualiza desde el form actual).
- **`categories`** — categorías de blog.
- **`post_categories`** — junction N:N posts↔categories. **Es la fuente de verdad real**: el form del dashboard borra y re-inserta filas acá; el listado público filtra por acá, no por `posts.category_id`.
- **`post_authors`** — junction N:N posts↔coaches (multi-coautor).
- **`site_settings`** — clave/valor JSON con los textos editables del home (`hero`, `about`, `disciplines`, `group_classes`, `team_gallery`, `contact`, `locations`).
- **`coaches`** — entrenadores (slug, nombre, especialidad, bio, foto, IG, certificaciones, logros, servicios, `display_order`).
- **`plans`** — planes (`category` ∈ `runner|triathlon|group`, FK a `plan_categories`, `features[]`, `featured`, `description_long` para el modal "más información").
- **`plan_categories`** — categorías de planes.
- **Storage**: bucket `media` para todo lo subido desde el dashboard.

## Regla de negocio no-negociable: fallback de contenido

**FACT** (`src/lib/content.ts`, `src/lib/constants.ts`): el sitio público **tiene que renderizar aunque la base no responda o las env vars sean placeholder**. `content.ts` siempre devuelve datos — cae a `FALLBACK_*` si la query falla o las credenciales no son reales. Cualquier cambio a `content.ts` tiene que preservar esta cadena; romperla tira el sitio público entero abajo si la base tiene un blip.

## RLS por tabla (FACT, ver auditoría completa en `KNOWN_ISSUES.md` → nota positiva)

| Tabla | Lectura | Escritura |
|---|---|---|
| `contact_leads` | sólo `service_role` | insert: cualquiera |
| `posts`, `site_settings`, `coaches`, `plans` | pública (`using(true)` o `published=true`) | `authenticated` |
| `categories`, `plan_categories`, `post_categories` | pública | `authenticated` (forma implícita, ver nota cosmética en `KNOWN_ISSUES.md`) |
| `post_authors` | pública | `authenticated` (arreglado en migración `010`, antes sólo `service_role` — bug histórico ya resuelto) |
| `storage.objects` (bucket `media`) | pública | `authenticated` |

**Regla para tablas nuevas escritas desde el dashboard**: la policy de escritura tiene que ser para `authenticated`, no sólo `service_role` — ese fue exactamente el bug de `post_authors`.

## Límites de upload (FACT, `src/lib/upload-limits.ts`)

- Imagen: 20MB (optimizada a WebP q=82, resize a 2000px máx, EXIF strip, vía `sharp` en `uploadMediaAction`).
- PDF: 10MB.
- Video: 60MB (adjunto a post) / 15MB (`MAX_INLINE_VIDEO_BYTES`, video embebido inline en el contenido del post).
- PDF/video van directo a Storage desde el browser (`uploadDirectToStorage`), no pasan por el Server Action — ver `CONVENTIONS.md` para el motivo.

## i18n

Todo el contenido y las convenciones de código en español (es_AR). No introducir contenido en inglés en el sitio público ni en textos de UI del dashboard.
