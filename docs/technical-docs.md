# Documentación Técnica — GC² Entrenamiento

## Arquitectura

```
Cliente (Browser)
  ↓
Next.js 14 (Vercel)
  ├── App Router (RSC por defecto)
  ├── Server Actions (formulario contacto)
  ├── Supabase JS Client (blog)
  └── Resend API (emails)
       ↓
     Supabase (PostgreSQL)
     ├── contact_leads
     └── posts
```

## Decisiones de Diseño

### Migración fiel
Todo el diseño fue migrado 1:1 desde los archivos SCSS del sitio PHP original:
- Variables de color → `tailwind.config.ts` (escala blue-900 a blue-100)
- Tipografías Barlow → `next/font` con `display: 'swap'`
- Animaciones → CSS keyframes en Tailwind + IntersectionObserver en React

### Server Components vs Client Components
- **Server:** todas las páginas (`page.tsx`), secciones estáticas
- **Client:** `Navbar` (scroll effect + mobile menu), `Hero` (parallax), `ScrollProgress`, `ScrollReveal`, `ContactForm` (useFormState)

### Formulario de Contacto
- `useFormState` + `useFormStatus` de `react-dom` (Next.js 14 pattern)
- Server Action en `src/actions/contact.ts`
- Firma obligatoria: `(prevState: unknown, formData: FormData)`
- Validación con Zod antes de enviar a DB/Resend
- Doble destino: guarda en Supabase Y envía email (ambos son best-effort)

### Blog
- Datos en Supabase tabla `posts`
- `generateStaticParams` para pre-renderizar artículos
- RLS: solo posts con `published = true` son públicos

## Base de Datos

### Tabla `contact_leads`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK auto |
| nombre | text | Nombre completo |
| email | text | Email del prospecto |
| telefono | text | Teléfono/WhatsApp |
| ciudad | text | Ciudad (opcional) |
| servicio | text | Disciplina de interés |
| objetivo | text | Objetivo del atleta |
| mensaje | text | Consulta libre |
| created_at | timestamptz | Timestamp automático |

### Tabla `posts`
| Campo | Tipo | Descripción |
|---|---|---|
| id | uuid | PK auto |
| title | text | Título del artículo |
| slug | text | URL slug (único) |
| excerpt | text | Resumen corto |
| content | text | HTML del artículo |
| cover_image | text | URL de portada |
| published | boolean | Visibilidad pública |
| created_at | timestamptz | Fecha de creación |

## Variables de Entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Key anónima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Key de servicio (solo server) |
| `RESEND_API_KEY` | Sí | API key de Resend |
| `RESEND_FROM_NAME` | No | Nombre del remitente |
| `RESEND_FROM_EMAIL` | No | Email remitente (verificado) |
| `COMPANY_EMAIL` | Sí | Email destino de consultas |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID |

## Optimización de Imágenes

- Todas las imágenes usan `<Image>` de Next.js
- Formatos AVIF + WebP habilitados en `next.config.ts`
- Hero: `priority={true}` + `sizes="100vw"`
- Coaches: `sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- `sharp` instalado como dependencia para mejor performance

## Redirects 301

Configurados en `next.config.ts` para SEO y migración limpia:
- `/index.php` → `/`
- `/planes.php` → `/planes`
- `/contacto.php` → `/contacto`
