#!/usr/bin/env bash
# Extrae del Supabase de produccion el schema `public` y un dump de datos. Solo lectura.
# Excluye auth, storage, realtime y supabase_*: se reemplazan por Better Auth y S3.
source "$(dirname "$0")/lib.sh"
need SUPABASE_DB_URL
TS="$(date -u +%Y%m%dT%H%M%SZ)"
pg_dump "$SUPABASE_DB_URL" --schema-only --schema=public --no-owner --no-privileges \
  -f "$OUT/schema-$TS.sql"
pg_dump "$SUPABASE_DB_URL" --data-only --schema=public --no-owner --no-privileges -Fc \
  -f "$OUT/data-$TS.dump"
( cd "$OUT" && sha256sum "data-$TS.dump" > "data-$TS.dump.sha256" )
ln -sf "schema-$TS.sql" "$OUT/schema-latest.sql"
ln -sf "data-$TS.dump" "$OUT/data-latest.dump"
echo "OK: $OUT/schema-$TS.sql y $OUT/data-$TS.dump (+ .sha256). Siguiente: 02-sanear-dump.mjs"
