# Entornos: dev, test y main

Flujo de ramas: `feature/*` -> PR a `dev` -> `test` -> `main`. Promover entre ramas lo hace Mateo.

**Regla de plataforma (CodeTlon):** solo los sitios sin base de datos van a Vercel. GC2 tiene base, así que corre completo en Coolify: app, Postgres y archivos.

| Rama | Entorno | App | Base de datos | Archivos | Correo |
|------|---------|-----|---------------|----------|--------|
| `dev` | Local | `npm run dev` | Postgres en Docker (`docker compose up -d`, `127.0.0.1:42432`) | carpeta `./storage` | credenciales de prueba |
| `test` | Coolify (recurso aparte, se enciende/apaga) | `docker-compose.coolify.yml` | Postgres del mismo compose, red interna | volumen `storage` | sandbox obligatorio (`APP_ENV=test`, `MAIL_SANDBOX_TO`) |
| `main` | Coolify | `docker-compose.coolify.yml` | Postgres del mismo compose, red interna, backup diario a B2 | volumen `storage` (incluido en el backup) | dominio verificado, sin `MAIL_SANDBOX_TO` |

## Qué corre en Coolify
Un recurso "Docker Compose" por entorno (`gc2-test`, `gc2-prod`), con `docker-compose.coolify.yml`:
- `db`: Postgres 16, sin ningún puerto publicado (solo lo alcanza `app` por la red del compose). Usuario y contraseña propios del entorno.
- `app`: imagen del `Dockerfile` (Next standalone). Al arrancar **aplica las migraciones** (`scripts/migrate.mjs`) y, si fallan, no levanta.
- Volúmenes `db_data` y `storage` (archivos subidos, `/data/storage`).
RAM medida en reposo con la imagen real: app ~60 MB, base ~25 MB (con tráfico la app sube a 150-250 MB). El build puntea 1-2 GB (estimado) solo mientras despliega. `test` se apaga cuando no hay un PR abierto a `main`.

### Crear un entorno (lo hace el usuario en Coolify)
1. Nuevo recurso, Docker Compose, repo `CodeTlon/gc2-entrenamiento`, rama `test` o `main`, *Docker Compose Location* `/docker-compose.coolify.yml`.
2. Asignar el dominio al servicio `app` (puerto 3000).
3. Variables (sin comillas): `POSTGRES_PASSWORD` (larga, distinta por entorno), `BETTER_AUTH_SECRET` (`openssl rand -base64 32`, distinta por entorno), `NEXT_PUBLIC_SITE_URL` (URL pública exacta; también es `BETTER_AUTH_URL`), `APP_ENV` (`test` o `production`), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `COMPANY_EMAIL`, `NEXT_PUBLIC_GA_ID` (opcional). En test: `MAIL_SANDBOX_TO=codetloncordoba+prueba@gmail.com`. En prod: NO definir `MAIL_SANDBOX_TO`. Ojo: `APP_ENV=test` es obligatorio en test (con `production` y `MAIL_SANDBOX_TO` el mail se niega a proposito) y `NEXT_PUBLIC_GA_ID` se incrusta al compilar: si se cambia, hay que redeployar reconstruyendo la imagen. En test `robots.txt` bloquea la indexacion.
4. Desplegar. El healthcheck usa `/api/health` (consulta la base).
5. Primer usuario del dashboard (no hay registro público): en el VPS, `docker exec <contenedor-app> node scripts/crear-usuario.mjs <email> <nombre> admin`. Imprime una contraseña temporal una sola vez; se cambia con "Olvidé mi contraseña".

## Variables por entorno
Ver `.env.example` (desarrollo local). En Coolify las carga el compose; `DATABASE_URL` se arma sola con la red interna, sin SSL ni puerto público.

## CI
Los workflows viven en `.github/workflows/`. El keep-alive de Supabase ya se eliminó.
- PR a `test` y `main`: `ci.yml` (lint, tsc, `test:db`, `test:storage`, build, audit). Corrida real verificada.
- Push a `test`: Coolify despliega `gc2-test` solo y `entornos.yml` espera ese deploy y corre los E2E contra la URL de test. Necesita la **variable** del repo `TEST_URL` (sin ella no hace nada) y ningun secret.
- Push a `main`: `produccion.yml` (aprobacion manual con Environment `prod-coolify`, backup reciente en B2, deploy de `gc2-prod` por la API de Coolify, espera del deploy y smoke test). Requiere que `gc2-prod` tenga el **auto-deploy desactivado** (si no, Coolify despliega antes de la aprobacion), el token de Coolify con permiso de deploy y nada mas, y `PRODUCCION_HABILITADA=true`. Las migraciones las corre la app al arrancar, no el CI.
- `/api/health` informa `started_at` (arranque del proceso). Coolify no le pasa `SOURCE_COMMIT` al compose (verificado en `gc2-test`: llegaba vacio), asi que los workflows detectan el deploy esperando un contenedor que haya arrancado despues de que empezo el job (test) o de que se pidio el deploy (produccion).
El Environment se llama `prod-coolify` (no `production`: ese nombre ya lo usa la integracion de Vercel y GitHub no distingue mayusculas). Los workflows `entornos.yml` y `produccion.yml` estan validados con `actionlint` y la logica de espera se probo contra un servidor local, pero **no se corrieron en GitHub**: validar con una corrida real.

## Migraciones
`npx drizzle-kit generate` crea el SQL (se commitea en `drizzle/`). Las aplica la app al arrancar (`scripts/migrate.mts`, idempotente, fail-closed); en local `npx drizzle-kit migrate`. `drizzle-kit push` solo en dev local. Migraciones compatibles hacia atrás (drop/rename en dos releases).

## Alta de usuarios del dashboard
Local: `npx tsx --env-file=.env.development.local scripts/crear-usuario.mts <email> <nombre> admin`. En Coolify, dentro del contenedor (ver arriba).

## Auth: orígenes y rate limit
- `BETTER_AUTH_URL` debe ser la URL pública exacta de cada entorno (el compose la toma de `NEXT_PUBLIC_SITE_URL`). Orígenes extra: `BETTER_AUTH_TRUSTED_ORIGINS` (coma-separados).
- El rate limit de login/recuperación vive en la tabla `rate_limit` (migración `0001`), no en memoria. Solo se aplica con `NODE_ENV=production`.

## Archivos subidos
Se guardan en el volumen `storage` y se sirven por `/media/<ruta>`. No hay bucket ni CORS que configurar: la subida es un POST del navegador al mismo dominio. Los archivos entran en el backup con `FILES_MODE=volume` (`docs/BACKUPS.md`). Para mover archivos entre servidores: `tar -C <origen> -cf - . | docker exec -i <app> tar -C /data/storage -xf -`.
