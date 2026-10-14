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

## Paridad con el sitio actual (Vercel + Supabase)
- [x] Copia completa en `~/migracion-gc2/20261013-232723` (VPS, 700, 50 archivos, 37 MB, `MANIFEST.sha256`): 9 tablas (25 filas), 2 usuarios con hash bcrypt, 33 archivos, SQL de importacion real y anonimizado. Es una foto de ese momento: **repetir `snapshot-completo.sh` justo antes del corte**.
- [x] Usuarios con su contrasena actual: `auth.ts` verifica bcrypt (`bcryptjs`) ademas de scrypt; 2 tests nuevos en `test:db` (15/15). Login incorrecto sobre un hash migrado responde 401 (sin errores de servidor). Verificado en `gc2-test` (2026-10-14): la cuenta `mateopavoni6` entra con la contrasena que puso en Supabase (hash bcrypt migrado, mismo que el de origen). Falta que la otra cuenta (`gce***`) pruebe la suya.
- [x] `10-verificar-paridad.mjs` contra una carga completa con datos reales: 9 tablas idénticas en todas las columnas, 2 usuarios identicos (incluido el hash), 33/33 archivos identicos por sha256. Con prueba negativa: detecta un dato, un hash y un archivo alterados.
- [x] `11-comparar-sitio.mjs` contra https://gc2entrenamientoderesistencia.com.ar: las 6 paginas publicas identicas en texto, imagenes (el unico renombre es `LUIS (2).jpg` -> `LUIS-2.jpg`) y enlaces. La comparacion encontro y se arreglo que `/privacidad` y `/terminos` mostraban WhatsApp y mail de relleno (layout publico prerenderizado sin base): ahora dinamico.
- [ ] **Configurar `NEXT_PUBLIC_GA_ID` en Coolify con el mismo valor que hoy en Vercel**: sin esa variable no aparece el banner de cookies ni se mide (el sitio actual lo tiene). Es variable de build (ARG del compose).
- [ ] Revisar en Vercel otras variables que usa el sitio actual (`RESEND_*`, `COMPANY_EMAIL`, `NEXT_PUBLIC_SITE_URL`) y copiarlas a Coolify de produccion.

## A cargo de Mateo (infraestructura)
- [ ] Coolify: crear los recursos Docker Compose `gc2-test` y `gc2-prod` (`docs/environments.md`), dominio en el servicio `app`, variables sin comillas, `BETTER_AUTH_SECRET` y `POSTGRES_PASSWORD` distintos por entorno.
- [ ] Verificar RAM libre del VPS de Coolify (`free -h`): la app necesita ~300-400 MB estables y 1-2 GB de pico solo al compilar (estimado, no medido).
- [ ] Backup de prod: cron en el VPS con `scripts/backup/backup-coolify.sh` (`FILES_MODE=volume`, `PROJECT=gc2`, `ENV_FILE=/etc/backup/gc2.env` copiado del de recoveryparts), y un simulacro con `restore-test.sh`. Probar antes la v2 del script: no esta validada contra la v1 que ya corre para recoveryparts.
- [ ] Rotar las claves que pasaron por el chat: Resend de pruebas, la clave de B2 `backups` (ademas tiene permisos de mas: `deleteFiles`, `writeBuckets`) y el token `sbp_` de Supabase (revocar al terminar).
- [ ] Resend: remitente del dominio verificado para prod; en test `APP_ENV=test` + `MAIL_SANDBOX_TO`.
- [ ] GitHub: proteger `dev`, `test` y `main` (decide Mateo; ojo: la proteccion bloquea los pushes directos). Ya no hacen falta secrets de Coolify.

## Por hacer en el codigo
- [x] Workflows adaptados (v2.1.6): `entornos.yml` (ya corrio en GitHub; test encendido a demanda), `produccion.yml` (verifica el auto-deploy de `main`) y `backup-check.yml` (alarma diaria). Configurado en GitHub: `TEST_URL` y el Environment `prod-coolify`. Falta cuando exista prod: programar el cron de backup de gc2 en el VPS, secrets `B2_READ_*` en `prod-coolify` y al final `PRODUCCION_HABILITADA=true` (ver `docs/produccion-coolify.md`).
- [ ] `posts.author_id` queda sin FK ni valor en posts nuevos (ids de Better Auth son texto): eliminar la columna o migrarla a `text`.
- [ ] Honeypot/rate limit del formulario de contacto.
- [ ] Imagenes originales sin optimizar en la raiz del bucket (hasta 4,7 MB, p. ej. `Mica.jpg`): `next/image` ya las sirve optimizadas; opcional pasarlas por sharp al migrar.
- [ ] Un coach de prueba (`ASDASDASDA`, sin foto) esta en la base de produccion actual: decidir si se borra antes del corte.

## Migracion de datos de produccion (read-only sobre Supabase)
Ver `scripts/migracion/README.md`. Ensayo hecho; falta repetirlo contra `gc2-test` en Coolify y, al final, el corte.
- [ ] Cargar en `gc2-test`: `07` exportar, `08` generar (leads anonimizados), `05 --yes` descargar, aplicar `import.sql`, subir `out/storage/` al volumen, `reescribir-urls.sql`, `verificar-urls.sql` y comparar conteos. Correr E2E contra su URL.
- [ ] Usuarios (`06-usuarios.md`): `import-usuarios.sql` (mismo id y hash). Que cada uno pruebe entrar con su contrasena actual en `gc2-test`; avisar que las sesiones e invites de Supabase dejan de funcionar al corte.
- [ ] Backup de la base nueva y simulacro de restauracion; anotar la fecha en `.claude/CLAUDE.md`.

## Corte (lo ejecuta Mateo)
Paso a paso completo: `docs/produccion-coolify.md`.
- [ ] Ventana de bajo trafico, aviso a la duena del sitio, `07` + `08 --real` (datos reales de leads) + `05 --yes` finales, modo mantenimiento.
- [ ] Antes de apagar Vercel: copiar de su panel las variables que usa el sitio (`NEXT_PUBLIC_GA_ID` ya esta en test, `RESEND_*`, `COMPANY_EMAIL`, `NEXT_PUBLIC_SITE_URL`) a `gc2-prod`.
- [ ] DNS: el `A` de la raiz (hoy `216.198.79.1`, Vercel) y el `CNAME` de `www` (hoy `*.vercel-dns-017.com`) pasan a la IP del VPS de Coolify; dejar intactos los `MX`/`TXT` de Resend, DMARC y Google. Agregar `www` al servicio `app` (redirect a la raiz).
- [ ] Despues del corte (no antes): desconectar y borrar el proyecto de Vercel, y limpiar referencias: `.github/workflows/{entornos,produccion}.yml`, docs (`deployment-guide`, `maintenance-guide`, `technical-docs`), `AGENTS.md`, `.claude/CLAUDE.md`. `@vercel/og` es solo la libreria del export de Story, no requiere Vercel.
- [ ] DNS al servicio de Coolify, smoke test (`/api/health`, home, blog, login, subida), Google Analytics y sitemap.
- [ ] Supabase en solo lectura 1-2 semanas con fecha de baja anotada; despues dar de baja el proyecto y revocar el token.
- [ ] Promover por PR: `dev` -> `test` -> `main`.

- [x] Archivos huerfanos: `src/lib/media-cleanup.ts` (v2.1.4). Residual: lo que se sube y nunca se guarda en el formulario queda en el volumen.

## Sin verificar
- Despliegue en el Coolify real (solo se probo el mismo compose en Docker local).
- Pico de RAM del build y RAM libre del VPS.
- El dashboard con los datos reales migrados (solo se vio el sitio publico); el export de Story con una portada real migrada.
- `produccion.yml` y `backup-check.yml` (solo `actionlint`; faltan `gc2-prod`, el cron de backup y `PRODUCCION_HABILITADA`). `entornos.yml` ya corrio en GitHub.
