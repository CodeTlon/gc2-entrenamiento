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
| `06-usuarios.md` | Plan de usuarios de Auth |

Ensayo/carga en un entorno (nuevo, con migraciones ya aplicadas por la app):
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
