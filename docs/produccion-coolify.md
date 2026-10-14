# Dejar producción lista en Coolify (paso a paso)

Todo corre en Coolify, sin Vercel ni Supabase. Test ya está armado y probado: producción es la misma receta con otros secretos, otro dominio y la copia final de los datos. **No toques `main` ni el DNS hasta el paso 6.** Mientras tanto el sitio real sigue en Vercel + Supabase.

Variables y recursos de referencia: `docs/environments.md`. Scripts de migración: `scripts/migracion/README.md`.

## 0. Antes de empezar
- [ ] Test probado: login de los 2 usuarios con su contraseña real, mail de recuperación y de contacto recibidos, dashboard con datos reales.
- [ ] `free -h` en el VPS de Coolify con RAM libre para otra app (la app usa ~300-400 MB; el build llega a 1-2 GB).
- [ ] Rotadas las claves que pasaron por el chat (Resend de pruebas, clave B2 `backups`, token `sbp_` de Supabase se revoca al final).
- [ ] Anotadas las variables de Vercel que usa el sitio: `NEXT_PUBLIC_GA_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `COMPANY_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Se copian antes de apagar Vercel.

## 1. Código en `main` (lo promueve Mateo)
1. PR `dev` -> `test` -> `main` (ver `PENDIENTES.md`). `main` recién se toca cuando todo lo de arriba esté verde.
2. CI de `main` en verde (lint, tsc, `test:db`, `test:storage`, build, audit).

## 2. Crear `gc2-prod` en Coolify
1. Proyecto `gc2`, entorno `production`, **New Resource -> Docker Compose** desde el repo privado `CodeTlon/gc2-entrenamiento`, rama `main`.
2. **Compose Location:** `/docker-compose.coolify.yml` (con `.yml`).
3. **Dominio del servicio `app`** (puerto 3000): `https://gc2entrenamientoderesistencia.com.ar` y `https://www.gc2entrenamientoderesistencia.com.ar`. Todavía **no** apuntes el DNS: con el dominio cargado Coolify solo emite el certificado cuando el DNS llegue, y hasta entonces el sitio queda accesible por la URL temporal de Coolify.
4. **Variables** (sin comillas; secretos nuevos, distintos de test):

| Variable | Valor |
|---|---|
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 48 \| tr -d '\n=+/' \| cut -c1-64` |
| `NEXT_PUBLIC_SITE_URL` | `https://gc2entrenamientoderesistencia.com.ar` |
| `APP_ENV` | `production` |
| `NEXT_PUBLIC_GA_ID` | el de Vercel (variable de build) |
| `RESEND_API_KEY` | key propia de prod |
| `RESEND_FROM_EMAIL` | remitente de un dominio verificado (el dominio ya está verificado en Resend) |
| `COMPANY_EMAIL` | mail que hoy recibe los leads |
| `MAIL_SANDBOX_TO` | **no definir** (en `production` el envío se niega a propósito si está) |

5. **Deploy.** Esperar `db` y `app` en healthy y `/api/health` en 200 (por la URL temporal).

## 3. Backup antes de cargar datos
1. En el VPS: copiar `/etc/backup/recoveryparts.env` a `/etc/backup/gc2.env` (600) y programar `scripts/backup/backup-coolify.sh` con `PROJECT=gc2 ENVIRONMENT=prod FILES_MODE=volume` y el UUID de `gc2-prod`.
2. Probar la v2 del script contra la v1 que ya corre para recoveryparts, y hacer un simulacro con `scripts/backup/restore-test.sh`. Anotar la fecha en `.claude/CLAUDE.md`.
3. Crear la clave B2 nueva con solo `listFiles`, `readFiles` y `writeFiles`.

## 4. Ensayo con la copia de hoy (sin tocar el sitio real)
Con `~/migracion-gc2/<fecha>` ya existente, cargar en `gc2-prod` **solo para ensayar** y comprobar la paridad (si algo falla, se borran los volúmenes de `gc2-prod` y se repite):
`10-verificar-paridad.mjs`, `11-comparar-sitio.mjs` contra la URL temporal y los E2E. La receta de carga está en `scripts/migracion/README.md` (entrar al VPS con `ssh`, `docker exec` al `db` y al `app` de gc2-prod; nunca por un puerto público).

## 5. Corte (ventana de poco tráfico, lo ejecuta Mateo)
1. Avisar a la dueña del sitio.
2. Repetir `scripts/migracion/snapshot-completo.sh` (entran leads nuevos). La copia final queda en `~/migracion-gc2/<fecha>` (700, no copiar fuera del VPS, ni a git ni a chats).
3. Si hubo ensayo cargado en el paso 4: vaciar `gc2-prod` (borrar volúmenes `db_data` y `storage` y redeployar para que migre de cero).
4. Cargar la copia **real**: `import-real.sql`, `import-usuarios.sql`, `storage/` al volumen, `reescribir-urls.sql`; correr `verificar-urls.sql` (todo en 0) y `10-verificar-paridad.mjs` (debe dar `PARIDAD OK`).
5. Dejar Supabase en solo lectura (no se borra nada).

## 6. DNS
En el proveedor de DNS:
- `A` de la raíz: pasa de `216.198.79.1` (Vercel) a `51.91.253.54`.
- `www`: pasa del `CNAME` de Vercel a un `A` a `51.91.253.54` (o `CNAME` a la raíz).
- **No tocar** los `MX`, el `TXT` de Google, `_dmarc`, `send.` ni `resend._domainkey` (mail).
- Esperar el certificado HTTPS de Coolify (necesita puertos 80 y 443 abiertos y el DNS resolviendo).

## 7. Smoke test
- `/api/health`, home, planes, blog, contacto, privacidad y términos; `sitemap.xml` y `robots.txt` con el dominio real y sin bloqueo.
- Banner de cookies y Analytics.
- Login de cada usuario con su contraseña actual; "Olvidé mi contraseña" (mail llega); formulario de contacto (lead en Consultas + mail a `COMPANY_EMAIL`).
- Subida de una imagen y export de Story de un post de prueba (borrarlo después).
- `11-comparar-sitio.mjs` contra el sitio anterior si todavía responde, y E2E con `BASE_URL`.
- Avisar a los 2 usuarios: las sesiones e invitaciones de Supabase dejan de valer; entran con su contraseña de siempre.

## 8. Después del corte
- Supabase en solo lectura **1 a 2 semanas** con fecha de baja anotada; después darlo de baja y revocar el token `sbp_`.
- Desconectar y borrar el proyecto de Vercel; limpiar sus referencias en `.github/workflows/{entornos,produccion}.yml`, docs y `AGENTS.md` (`@vercel/og` es solo la librería del Story).
- Adaptar `entornos.yml` y `produccion.yml` a todo-en-Coolify (secrets `COOLIFY_URL`, `COOLIFY_TOKEN` con permisos mínimos y UUIDs) y recién ahí `PRODUCCION_HABILITADA=true`. Subir `checkout`/`setup-node` y fijar `ubuntu-24.04`.
- Proteger `dev`, `test` y `main` en GitHub.

## Marcha atrás
Hasta el paso 6 no cambió nada para el público. Después, volver el DNS a Vercel restaura el sitio anterior (Supabase sigue vivo y en solo lectura): por eso no se da de baja hasta pasadas 1 o 2 semanas. Los leads o cambios hechos en el sitio nuevo después del corte no vuelven solos a Supabase.
