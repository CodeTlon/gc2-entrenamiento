# Pendientes de la migracion fuera de Supabase

Rama: `feature/dev2-coolify`. Estado al 2026-10-13. Todo corre en Coolify (regla de CodeTlon: solo sitios sin base van a Vercel): app y Postgres en la misma red interna, archivos en el volumen `storage`. `main` sin tocar.

## Hecho y verificado (local, imagen Docker real)
- Codigo sin Supabase: Postgres + Drizzle + Better Auth; archivos en disco (`src/lib/storage.ts`, `/media`, `/api/upload`).
- `Dockerfile` + `docker-compose.coolify.yml`: la app migra al arrancar y falla cerrada; healthcheck `/api/health`. Medido en reposo: app ~60 MB, base ~25 MB.
- Alta de admin dentro del contenedor: `docker exec <app> node scripts/crear-usuario.mjs <email> <nombre> admin`.
- Suite: `tsc`, lint (0 errores, 5 avisos previos), `test:db` 13/13 (Postgres real), `test:storage` 11/11, E2E 45/45 contra el contenedor, `ci.yml` en verde en una corrida real de GitHub (PR #3, cerrado sin merge).
- Flujos probados en el navegador contra Postgres real: login/logout, recuperacion de contrasena con Resend de pruebas (mail entregado, set-password, login con la clave nueva), contacto (lead + mail), CRUD de categorias, planes, coaches y posts (categorias, coautores, duplicado rechazado, borrado con confirmacion y cascada), export de Instagram Story (PNG 200; 307 sin sesion).
- Subidas contra el volumen: imagen (sharp, queda webp), PDF y video propio (URL guardada), Range 206 para video, 401 sin sesion, 403 sin origen, 415 SVG/HTML, 413 por tamano, 400 por carpeta invalida, traversal en `/media` sin 200, archivos sobreviven al reinicio del contenedor.
- Bugs hallados y arreglados: `folder` con subniveles rechazado; paginas publicas y sitemap prerenderizados sin base en el build (mostraban el contenido de respaldo hasta una hora): ahora dinamicos; archivos en la raiz del bucket no servibles.
- Ensayo de migracion de datos en limpio (Supabase prod en solo lectura -> Postgres del compose): conteos identicos en las 9 tablas, 33/33 archivos descargados y cargados, 0 referencias a `supabase.co`, 15/15 URLs `/media` en 200, 16/16 imagenes del home cargan. `contact_leads` anonimizados (no hay PII en test).

## A cargo de Mateo (infraestructura)
- [ ] Coolify: crear los recursos Docker Compose `gc2-test` y `gc2-prod` (`docs/environments.md`), dominio en el servicio `app`, variables sin comillas, `BETTER_AUTH_SECRET` y `POSTGRES_PASSWORD` distintos por entorno.
- [ ] Verificar RAM libre del VPS de Coolify (`free -h`): la app necesita ~300-400 MB estables y 1-2 GB de pico solo al compilar (estimado, no medido).
- [ ] Backup de prod: cron en el VPS con `scripts/backup/backup-coolify.sh` (`FILES_MODE=volume`, `PROJECT=gc2`, `ENV_FILE=/etc/backup/gc2.env` copiado del de recoveryparts), y un simulacro con `restore-test.sh`. Probar antes la v2 del script: no esta validada contra la v1 que ya corre para recoveryparts.
- [ ] Rotar las claves que pasaron por el chat: Resend de pruebas, la clave de B2 `backups` (ademas tiene permisos de mas: `deleteFiles`, `writeBuckets`) y el token `sbp_` de Supabase (revocar al terminar).
- [ ] Resend: remitente del dominio verificado para prod; en test `APP_ENV=test` + `MAIL_SANDBOX_TO`.
- [ ] GitHub: proteger `dev` y `test`; secrets de Coolify (`COOLIFY_URL`, `COOLIFY_TOKEN` con minimos permisos, UUIDs) cuando se adapten los workflows.

## Por hacer en el codigo
- [ ] Adaptar `entornos.yml` y `produccion.yml` a todo-en-Coolify (hoy asumen preview de Vercel y base con puerto publico). `actionlint`: `produccion.yml` limpio, `entornos.yml` con un aviso SC2034. Subir `checkout`/`setup-node` (Node 20 deprecado) y fijar `ubuntu-24.04` (`ubuntu-latest` pasa a 26 el 2026-10-19).
- [ ] `posts.author_id` queda sin FK ni valor en posts nuevos (ids de Better Auth son texto): eliminar la columna o migrarla a `text`.
- [ ] Honeypot/rate limit del formulario de contacto.
- [ ] Imagenes originales sin optimizar en la raiz del bucket (hasta 4,7 MB, p. ej. `Mica.jpg`): `next/image` ya las sirve optimizadas; opcional pasarlas por sharp al migrar.
- [ ] Un coach de prueba (`ASDASDASDA`, sin foto) esta en la base de produccion actual: decidir si se borra antes del corte.

## Migracion de datos de produccion (read-only sobre Supabase)
Ver `scripts/migracion/README.md`. Ensayo hecho; falta repetirlo contra `gc2-test` en Coolify y, al final, el corte.
- [ ] Cargar en `gc2-test`: `07` exportar, `08` generar (leads anonimizados), `05 --yes` descargar, aplicar `import.sql`, subir `out/storage/` al volumen, `reescribir-urls.sql`, `verificar-urls.sql` y comparar conteos. Correr E2E contra su URL.
- [ ] Usuarios (`06-usuarios.md`): Supabase tiene 2 usuarios. Alta con `crear-usuario.mjs` por email y reset de contrasena por Resend; avisar que las sesiones e invites de Supabase dejan de funcionar.
- [ ] Backup de la base nueva y simulacro de restauracion; anotar la fecha en `.claude/CLAUDE.md`.

## Corte (lo ejecuta Mateo)
- [ ] Ventana de bajo trafico, aviso a la duena del sitio, `07` + `08 --real` (datos reales de leads) + `05 --yes` finales, modo mantenimiento.
- [ ] DNS al servicio de Coolify, smoke test (`/api/health`, home, blog, login, subida), Google Analytics y sitemap.
- [ ] Supabase en solo lectura 1-2 semanas con fecha de baja anotada; despues dar de baja el proyecto y revocar el token.
- [ ] Promover por PR: `dev` -> `test` -> `main`.

## Sin verificar
- Despliegue en el Coolify real (solo se probo el mismo compose en Docker local).
- Pico de RAM del build y RAM libre del VPS.
- El dashboard con los datos reales migrados (solo se vio el sitio publico); el export de Story con una portada real migrada.
- `entornos.yml` y `produccion.yml` (faltan secrets de Coolify y adaptarlos).
