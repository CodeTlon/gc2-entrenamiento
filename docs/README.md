# GC² Entrenamiento — Sitio Web Oficial

Migración del sitio PHP+SASS original a **Next.js 14** con App Router, TypeScript, Tailwind CSS, Supabase y Resend.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Supabase (PostgreSQL + RLS) |
| Email | Resend API |
| Deploy | Vercel |
| Testing | Playwright E2E |

## Estructura del Proyecto

```
output/gc2/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout (Navbar, Footer, GA)
│   │   ├── page.tsx            ← Home (/)
│   │   ├── planes/page.tsx     ← Planes (/planes)
│   │   ├── contacto/page.tsx   ← Contacto (/contacto)
│   │   ├── blog/
│   │   │   ├── page.tsx        ← Blog listado
│   │   │   └── [slug]/page.tsx ← Artículo individual
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── sections/           ← Secciones de página
│   │   └── ui/                 ← Componentes compartidos
│   ├── actions/
│   │   └── contact.ts          ← Server Action formulario
│   └── lib/
│       ├── constants.ts        ← Datos del negocio
│       ├── supabase.ts         ← Clientes Supabase
│       └── utils.ts
├── supabase/
│   ├── migrations/             ← SQL migrations
│   └── functions/              ← Edge Functions
├── tests/e2e/                  ← Playwright tests
├── public/images/              ← Imágenes locales
└── docs/                       ← Documentación
```

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Completar con los valores reales

# 3. Dev server
npm run dev

# 4. Build + preview
npm run build && npm start
```

## Variables de Entorno Requeridas

Ver `.env.example` para todas las variables. Las esenciales son:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `COMPANY_EMAIL`

## Tests E2E

```bash
npx playwright install  # Solo la primera vez
npm run test:e2e
```

## Deploy

Ver `docs/deployment-guide.md` para instrucciones completas.
