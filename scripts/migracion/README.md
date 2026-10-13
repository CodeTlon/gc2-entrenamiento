# Migracion Supabase -> Postgres propio (revision de schema y backup)

Estructura para **revisar** el schema y los datos de produccion sin escribir nunca en Supabase.
Doctrina: `codetlon-cloud/.claude/modules/{backend-propio,entornos,migracion-supabase}.md`.

## Preparacion
1. Crear `scripts/migracion/.env.migracion` (gitignored, `chmod 600`):
   ```
   SUPABASE_PROJECT_REF=<ref>          # el de https://<ref>.supabase.co
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_ACCESS_TOKEN=sbp_...       # token personal: se usa SOLO con el endpoint read-only de la Management API
   ```
2. Node 22. No hace falta `pg_dump` ni la contraseña de la base: todo sale por la API de solo lectura (la base es chica). Revocar el token al terminar.

## Pasos (flujo actual, todo a Coolify con archivos en volumen)
| Script | Que hace |
|---|---|
| `07-exportar-datos.mjs` | Exporta cada tabla de `public` a `out/data/*.json` (solo lectura) y guarda conteos |
| `08-generar-import.mjs` | Genera `out/data/import.sql` (INSERT con `json_populate_recordset`, usa los tipos de la base nueva). **Anonimiza `contact_leads`** salvo `--real` (solo para el corte a producción) |
| `05-copiar-storage.mjs` | Descarga el bucket `media` a `out/storage/` (renombra lo que `/media` no sirve), escribe `out/reescribir-urls.sql` y `out/verificar-urls.sql`. Dry-run por defecto; `--yes` descarga |
| `09-exportar-usuarios.mjs` | Usuarios de `auth.users` -> `out/data/import-usuarios.sql`: mismo id y **mismo hash bcrypt**, rol admin. Entran con su contraseña de siempre |
| `snapshot-completo.sh` | Corre 07, 09, 05, 08 (real y anonimizado) y deja todo en `~/migracion-gc2/<fecha>` (700, fuera del repo) con `MANIFEST.sha256` |
| `10-verificar-paridad.mjs` | Compara el snapshot contra la base y el volumen nuevos: filas, usuarios (incluido el hash) y sha256 de cada archivo. Exit 1 si algo difiere |
| `11-comparar-sitio.mjs` | Compara lo que ve un visitante (texto, imágenes, enlaces) en el sitio actual y en el nuevo |
| `06-usuarios.md` | Plan de usuarios de Auth |

Copia completa para el corte (la que se carga en producción): `scripts/migracion/snapshot-completo.sh`. Contiene datos personales y hashes de contraseña: queda en `~/migracion-gc2/` con permisos 700, nunca en git ni en un chat. Comprobar integridad: `(cd <carpeta> && sha256sum -c MANIFEST.sha256)`.

Carga y verificación (base nueva ya migrada por la app; `SNAP` = carpeta del snapshot):
```
D="docker exec -i <db> psql -U <user> -d <base> -v ON_ERROR_STOP=1 -q"
$D < $SNAP/data/import-real.sql          # en test/dev usar import.sql (leads anonimizados)
$D < $SNAP/data/import-usuarios.sql
tar -C $SNAP/storage -cf - . | docker exec -i <app> tar -C /data/storage -xf -
$D < $SNAP/reescribir-urls.sql
SNAPSHOT=$SNAP DEST_PSQL='docker exec -i <db> psql -U <user> -d <base> -tA' DEST_APP=<app> node scripts/migracion/10-verificar-paridad.mjs
node scripts/migracion/11-comparar-sitio.mjs https://gc2entrenamientoderesistencia.com.ar https://<url-nueva>
```
Ensayo/carga en un entorno (variante manual, con leads anonimizados):
```
docker exec -i <db> psql -U <user> -d <base> -v ON_ERROR_STOP=1 -q < out/data/import.sql
tar -C out/storage -cf - . | docker exec -i <app> tar -C /data/storage -xf -
docker exec -i <db> psql -U <user> -d <base> -v ON_ERROR_STOP=1 -q < out/reescribir-urls.sql
docker exec -i <db> psql -U <user> -d <base> -tA < out/verificar-urls.sql   # todo en 0
```
Comparar conteos con `out/data/_conteos.json`. `out/` contiene PII real (leads, usuarios): gitignored, no copiarlo fuera del servidor.

Scripts `01`-`04` (pg_dump/pg_restore con `SUPABASE_DB_URL`): flujo alternativo si algún día la base es grande; ya no son el camino principal.

## Checklist (del modulo)
- [ ] Inventario hecho
- [ ] Schema saneado revisado y baseline Drizzle generado
- [ ] Datos restaurados en local/test con conteos identicos
- [ ] Storage copiado y URLs reescritas (verificar muestras de imagen, PDF y video)
- [ ] Usuarios: plan de reset acordado
- [ ] Backup de la base nueva con restauracion de prueba (`restore-test.sh`)
- [ ] Supabase queda en solo lectura 1-2 semanas tras el corte

Nota: `drizzle/0000_baseline.sql` se generó desde `src/db/schema.ts` (derivado de las migraciones 001-012). Antes del corte hay que compararlo con el schema real del dump de producción y corregir cualquier drift.
