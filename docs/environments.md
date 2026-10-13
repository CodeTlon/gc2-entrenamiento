# Entornos: dev, test y main

Flujo de ramas: `feature/*` -> PR a `dev` -> `test` -> `main`. Promover entre ramas lo hace Mateo.

| Rama | Entorno | Front | Base de datos | Archivos | Correo |
|------|---------|-------|---------------|----------|--------|
| `dev` | Local | `npm run dev` | Postgres en Docker (`docker compose up -d`, `127.0.0.1:42432`) | bucket de pruebas (o R2 de dev) | credenciales de prueba |
| `test` | Preview | Vercel, rama `test` | `gc2-test` en Coolify (se enciende/apaga) | bucket de test | sandbox obligatorio (`APP_ENV=test`, `MAIL_SANDBOX_TO`) |
| `main` | Produccion | Vercel, rama `main` | `gc2-prod` en Coolify con backup diario a B2 | bucket de produccion (R2) | dominio verificado, sin `MAIL_SANDBOX_TO` |

## Principio: lo minimo posible en Coolify
Coolify aloja **solo Postgres** (un contenedor chico por entorno). El resto no consume RAM del VPS:
- Front, Server Actions y Better Auth corren en Vercel (route handlers/serverless).
- Los archivos viven en Cloudflare R2 (S3-compatible), no en un MinIO propio.
- Los backups salen a Backblaze B2.
- La base de `test` se apaga cuando no hay un PR abierto a `main` (`.github/workflows/entornos.yml`).
Para ahorrar mas, `test` y `prod` pueden compartir una sola instancia de Postgres con dos bases y usuarios distintos, a costa de aislamiento.

## Conexion Vercel -> Postgres en Coolify
Coolify publica la base por TCP (*Public access*). Compensaciones obligatorias (doctrina `backend-propio.md`):
- SSL en `DATABASE_URL`: con `pg` 8.x, `sslmode=require` se interpreta como `verify-full` y falla con el certificado autofirmado de Coolify. Usar `?sslmode=require&uselibpqcompat=true` (cifra sin validar el CA) o instalar el CA de Coolify y usar `verify-full`.
- Usuario y base propios por entorno, con privilegios minimos (nunca el superuser en la app) y contrasena larga.
- Puerto publico no estandar. Pool chico en serverless (`DB_POOL_MAX`, default 3 en `src/lib/db.ts`; bajar a 1 o poner PgBouncer si Postgres se queda sin conexiones).
- **Decision a revisar:** la doctrina marca a GC2 (datos de salud) como excepcion con app y base ambas en Coolify y sin puerto publico. Se eligio front en Vercel por RAM; si se prefiere la excepcion, la app pasa a Coolify.

## Variables por entorno
Ver `.env.example`. Archivos `.env.development.local`, `.env.test.local`, `.env.production.local` (gitignored). Variables de Vercel: cargar las de `test` en el scope *Preview* de la rama `test` y las de produccion en *Production*.

## CI
Los workflows viven en `.github/workflows/`. El keep-alive de Supabase ya se elimino.
- PR a `test` y `main`: `.github/workflows/ci.yml` (lint, tsc, build, audit).
- PR a `main`: `entornos.yml` enciende la base de test, migra y corre los E2E contra el preview de `test`.
- Push a `main`: `produccion.yml` (aprobacion manual, backup reciente en B2, migraciones, smoke test). Activar con la variable `PRODUCCION_HABILITADA=true`.
Los workflows son esqueletos sin ejecutar: validar con una corrida real.

## Migraciones
`npx drizzle-kit generate` crea el SQL (se commitea en `drizzle/`); `npx drizzle-kit migrate` lo aplica. `drizzle-kit push` solo en dev local. Migraciones compatibles hacia atras (drop/rename en dos releases).

## Alta de usuarios del dashboard
No hay registro publico: `npx tsx --env-file=.env.development.local scripts/crear-usuario.mts <email> <nombre> admin`.

## Auth: origenes y rate limit
- `BETTER_AUTH_URL` debe ser la URL publica exacta de cada entorno. Origenes extra (previews de Vercel, dominios alternativos): `BETTER_AUTH_TRUSTED_ORIGINS` (coma-separados); `VERCEL_URL`/`VERCEL_BRANCH_URL` se agregan solos.
- El rate limit de login/recuperacion vive en la tabla `rate_limit` (migracion `0001`), no en memoria. Solo se aplica con `NODE_ENV=production`.

## CORS del bucket R2
Las subidas directas desde el navegador (`PUT` a la URL firmada) fallan sin esta regla en el bucket (ajustar los origenes por entorno):
```json
[{ "AllowedOrigins": ["https://gc2entrenamientoderesistencia.com.ar"], "AllowedMethods": ["PUT"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
```
