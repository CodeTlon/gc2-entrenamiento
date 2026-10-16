# Entornos: dev, test y main

Flujo de ramas: `feature/*` -> `dev` -> `test` (merge directo, sin PR) -> PR a `main`. A `main` solo se llega con PR y CI verde, con OK de Mateo (despliega produccion).

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
- **dev** es local (`docker compose`), sin deploy ni CI. **test** (`gc2-test`) se enciende solo cuando se quiere probar algo; **prod** (`gc2-prod`) tiene siempre el auto-deploy de Coolify.
- Push a `test`: si `gc2-test` esta encendido, Coolify despliega y `entornos.yml` espera ese deploy y corre los E2E contra `TEST_URL` (sin secrets). Si esta apagado, avisa y termina sin fallar. Para que un push no lo encienda, desactivar el auto-deploy de `gc2-test`.
- Push a `main`: Coolify despliega `gc2-prod` solo; `produccion.yml` espera el deploy y hace un smoke test (rojo = GitHub avisa por mail). No pide aprobacion ni usa token de Coolify. Se activa con `PRODUCCION_HABILITADA=true`.
- `backup-check.yml`: una vez por dia verifica en B2 que haya un dump de las ultimas 24 h con su `.sha256` (alarma por si el cron del VPS deja de correr). Misma llave `PRODUCCION_HABILITADA`.
- `/api/health` informa `started_at` (arranque del proceso). Coolify no le pasa `SOURCE_COMMIT` al compose (verificado en `gc2-test`), asi que los workflows detectan el deploy esperando un contenedor que haya arrancado despues de que empezo el job.
- Variable del repo `TEST_URL`; Environment `prod-coolify` (solo rama `main`, sin aprobadores; el nombre evita pisar el `Production` de Vercel: GitHub no distingue mayusculas) con `PROD_URL`, `BACKUP_BUCKET` y `BACKUP_PROJECT`, y secrets `B2_READ_KEY_ID`/`B2_READ_APP_KEY` (clave de solo lectura).
Los workflows `entornos.yml`, `produccion.yml` y `backup-check.yml` estan validados con `actionlint`; `entornos.yml` ya corrio en GitHub con exito; los de produccion no (faltan `gc2-prod` y la habilitacion).

## Migraciones
`npx drizzle-kit generate` crea el SQL (se commitea en `drizzle/`). Las aplica la app al arrancar (`scripts/migrate.mts`, idempotente, fail-closed); en local `npx drizzle-kit migrate`. `drizzle-kit push` solo en dev local. Migraciones compatibles hacia atrás (drop/rename en dos releases).

## Alta de usuarios del dashboard
Local: `npx tsx --env-file=.env.development.local scripts/crear-usuario.mts <email> <nombre> admin`. En Coolify, dentro del contenedor (ver arriba).

## Auth: orígenes y rate limit
- `BETTER_AUTH_URL` debe ser la URL pública exacta de cada entorno (el compose la toma de `NEXT_PUBLIC_SITE_URL`). Orígenes extra: `BETTER_AUTH_TRUSTED_ORIGINS` (coma-separados).
- El rate limit de login/recuperación vive en la tabla `rate_limit` (migración `0001`), no en memoria. Solo se aplica con `NODE_ENV=production`.

## Archivos subidos
Se guardan en el volumen `storage` y se sirven por `/media/<ruta>`. No hay bucket ni CORS que configurar: la subida es un POST del navegador al mismo dominio. Los archivos entran en el backup con `FILES_MODE=volume` (`docs/BACKUPS.md`). Para mover archivos entre servidores: `tar -C <origen> -cf - . | docker exec -i <app> tar -C /data/storage -xf -`.

## Video (opcional)
`TRANSCODE_API_KEY` (y `TRANSCODE_SERVICE_URL`, que tiene valor por defecto) activan la compresion de videos subidos con el servicio global de CodeTlon. Se cargan solo en las variables del recurso de Coolify; sin ellas el sitio guarda el video original. Ver `docker-compose.coolify.yml`.
