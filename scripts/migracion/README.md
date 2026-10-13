# Migracion Supabase -> Postgres propio (revision de schema y backup)

Estructura para **revisar** el schema y los datos de produccion sin escribir nunca en Supabase.
Doctrina: `codetlon-cloud/.claude/modules/{backend-propio,entornos,migracion-supabase}.md`.

## Preparacion
1. Crear `scripts/migracion/.env.migracion` (gitignored, `chmod 600`):
   ```
   SUPABASE_DB_URL=postgresql://...        # usuario de solo lectura si es posible
   LOCAL_DB_URL=postgresql://app:app@127.0.0.1:<puerto 42000-42999>/app   # base descartable (docker compose)
   SUPABASE_URL=https://<ref>.supabase.co
   S3_ENDPOINT= S3_BUCKET= S3_ACCESS_KEY_ID= S3_SECRET_ACCESS_KEY= S3_PUBLIC_BASE_URL=
   ```
2. `psql` y `pg_dump` >= la version del servidor de Supabase.

## Pasos
| Script | Que hace |
|---|---|
| `01-dump-schema.sh` | `pg_dump` de `public` (schema y datos, con `.sha256`) a `out/` |
| `02-sanear-dump.mjs` | Quita RLS/policies, FKs a `auth`, funciones con `auth.uid()`, sentencias de `storage.*`; avisa de lo eliminado y falla si queda algo de Supabase |
| `03-inventario.sh` | Filas por tabla, usuarios de auth y peso de storage -> `out/INVENTARIO.md` |
| `04-restaurar-y-validar.sh` | Restaura en la base local y compara conteos tabla por tabla; falla si difieren |
| `05-copiar-storage.mjs` | Copia `media` a S3 conservando rutas; genera `out/reescribir-urls.sql` (dry-run por defecto) |
| `06-usuarios.md` | Plan de usuarios de Auth |

Baseline cruzado: el schema saneado del dump real se compara con el que resulta de `supabase/migrations/*.sql` saneadas (`git show main:supabase/migrations/<archivo>` de cada migración, concatenadas y pasadas por `node 02-sanear-dump.mjs` (las migraciones ya no están en esta rama; siguen en `main`)); toda diferencia es drift entre migraciones y produccion y hay que decidirla antes de congelar el schema de Drizzle.

## Checklist (del modulo)
- [ ] Inventario hecho
- [ ] Schema saneado revisado y baseline Drizzle generado
- [ ] Datos restaurados en local/test con conteos identicos
- [ ] Storage copiado y URLs reescritas (verificar muestras de imagen, PDF y video)
- [ ] Usuarios: plan de reset acordado
- [ ] Backup de la base nueva con restauracion de prueba (`restore-test.sh`)
- [ ] Supabase queda en solo lectura 1-2 semanas tras el corte

Nota: `drizzle/0000_baseline.sql` se generó desde `src/db/schema.ts` (derivado de las migraciones 001-012). Antes del corte hay que compararlo con el schema real del dump de producción y corregir cualquier drift.
