# Guía de Deploy — GC² Entrenamiento

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Proyecto en [Supabase](https://supabase.com)
- API Key de [Resend](https://resend.com)
- Repositorio en GitHub

---

## Paso 1 — Supabase

### 1.1 Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → New Project
2. Nombre: `gc2-entrenamiento`
3. Elegir región: South America (São Paulo)

### 1.2 Ejecutar migraciones
En el SQL Editor de Supabase, ejecutar en orden:
```sql
-- Pegar el contenido de supabase/migrations/001_contact_leads.sql
-- Pegar el contenido de supabase/migrations/002_blog_posts.sql
```

### 1.3 Obtener credenciales
En Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key

---

## Paso 2 — Resend

1. Crear cuenta en [resend.com](https://resend.com)
2. Verificar el dominio del email del cliente (o usar `onboarding@resend.dev` para tests)
3. Obtener API Key → `RESEND_API_KEY`

---

## Paso 3 — GitHub

```bash
git init
git add .
git commit -m "feat(GC2): initial commit — migración PHP+SASS → Next.js 14"
git remote add origin https://github.com/codetlon/gc2-entrenamiento.git
git push -u origin main
```

---

## Paso 4 — Vercel

1. Ir a [vercel.com](https://vercel.com) → New Project
2. Importar desde GitHub: `codetlon/gc2-entrenamiento`
3. Framework: **Next.js** (detección automática)
4. Agregar variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
RESEND_FROM_NAME=GC2 Entrenamiento
RESEND_FROM_EMAIL=hola@gc2entrenamiento.com.ar
COMPANY_EMAIL=gc2entrenamiento@gmail.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

5. Deploy → esperar ~2 minutos

---

## Paso 5 — Dominio

### Opción A — Nuevo dominio en Vercel
1. Settings → Domains → Add
2. Registrar: `gc2entrenamiento.com.ar`

### Opción B — Apuntar dominio existente
Si el cliente ya tiene hosting con el sitio PHP:
1. En Vercel → Settings → Domains → agregar `gc2entrenamiento.com.ar`
2. Vercel te da los nameservers o registros DNS
3. En el panel del registrador del dominio:
   - Agregar registro A: `@` → IP de Vercel
   - Agregar CNAME: `www` → `cname.vercel-dns.com`
4. Esperar propagación DNS (hasta 48hs, generalmente < 1hs)

### Importante para la migración desde el hosting PHP
El sitio PHP actual seguirá funcionando hasta que cambies el DNS.
Una vez cambiado el DNS, los redirects 301 en `next.config.ts` garantizan que las URLs viejas (`/index.php`, `/planes.php`, `/contacto.php`) sigan funcionando.

---

## Paso 6 — Google Analytics

1. Crear propiedad en [analytics.google.com](https://analytics.google.com)
2. Obtener Measurement ID (`G-XXXXXXXXXX`)
3. Actualizar variable `NEXT_PUBLIC_GA_ID` en Vercel

---

## Verificación Post-Deploy

- [ ] Sitio carga en el dominio configurado
- [ ] Formulario de contacto envía email
- [ ] Redirecciones PHP funcionan (`/index.php` → `/`)
- [ ] Blog muestra los 3 artículos de ejemplo
- [ ] WhatsApp button funciona
- [ ] Lighthouse > 85 Performance, > 90 SEO, > 80 Accessibility

---

## Accesos a compartir con el cliente

| Servicio | URL | Credenciales |
|---|---|---|
| Sitio web | gc2entrenamiento.com.ar | — |
| Supabase (admin DB) | supabase.com/dashboard | Invitar por email |
| Vercel (deploy) | vercel.com/dashboard | Invitar por email |
| Resend (emails) | resend.com/dashboard | Invitar por email |
