# Entornos — GC2 Entrenamiento

Este proyecto trabaja con **dos entornos** que se deployan y guardan datos por separado.
Así podés probar cambios en `dev` antes de que lleguen a producción.

| Rama  | Vercel Environment | URL                                              | Supabase project | Variables           |
|-------|--------------------|--------------------------------------------------|------------------|---------------------|
| `main`| **Production**     | dominio productivo                               | `gc2-prod`       | Vercel → Production |
| `dev` | **Preview**        | `gc2-entrenamiento-git-dev-<team>.vercel.app`    | `gc2-dev`        | Vercel → Preview    |

**Flujo:** desarrollás en `dev` → Vercel autodeploya a Preview (apuntando a Supabase `gc2-dev`) →
probás → merge `dev` → `main` → Production (apuntando a Supabase `gc2-prod`).

> Toda la infra (Vercel/Supabase) la configurás vos manualmente — el código y esta guía ya están listos.

---

## Setup inicial (una sola vez)

### 1. Crear el segundo proyecto Supabase (DEV)
1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project** → nombre `gc2-dev`,
   región **South America (São Paulo)**.
2. **SQL Editor** → correr en orden los archivos de [`supabase/migrations/`](../supabase/migrations/)
   (`001_contact_leads.sql` … `009_contact_leads_coach.sql`).
3. **Settings → API** → copiar **Project URL**, **anon key** y **service_role key** del proyecto DEV.

> El proyecto `gc2-prod` ya es el que estás usando hoy en producción. No lo toques: el de DEV es nuevo.

### 2. Cargar variables en Vercel, por entorno
Vercel → Project → **Settings → Environment Variables**. Por cada variable elegí el **Environment**:

| Variable                     | ¿Difiere por entorno? | Production (`main`)        | Preview (`dev`)            |
|------------------------------|-----------------------|---------------------------|----------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`   | **sí**                | URL de `gc2-prod`         | URL de `gc2-dev`           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **sí**             | anon key prod            | anon key dev               |
| `SUPABASE_SERVICE_ROLE_KEY`  | **sí**                | service_role prod         | service_role dev           |
| `RESEND_API_KEY`             | no (compartida)       | misma                     | misma                      |
| `RESEND_FROM_NAME`           | no                    | `GC2 Entrenamiento`       | `GC2 Entrenamiento [DEV]`  |
| `RESEND_FROM_EMAIL`          | no                    | mismo                     | mismo                      |
| `COMPANY_EMAIL`              | recomendado           | `gc2entrenamiento@gmail.com` | tu mail de prueba       |
| `NEXT_PUBLIC_GA_ID`          | **sí**                | GA4 real                  | vacío (no medir en dev)    |

### 3. Confirmar la rama de producción
Vercel → **Settings → Git → Production Branch = `main`**.
Con eso, cualquier otra rama (incluida `dev`) se deploya automáticamente como **Preview**.

---

## Desarrollo local

`.env.local` debe apuntar **siempre al Supabase de DEV** (`gc2-dev`), nunca a prod.
Partir de [`.env.example`](../.env.example) y completar con las keys de `gc2-dev`.
