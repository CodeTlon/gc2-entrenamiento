#!/usr/bin/env bash
# Restaura schema saneado + datos en una base LOCAL descartable y compara conteos con el origen.
# Falla si cualquier tabla difiere. Nunca escribe en SUPABASE_DB_URL.
source "$(dirname "$0")/lib.sh"
need SUPABASE_DB_URL; need LOCAL_DB_URL
case "$LOCAL_DB_URL" in *supabase*|*pooler*) echo "LOCAL_DB_URL parece remota: abortado" >&2; exit 1;; esac
SQL="${1:-$OUT/schema-clean.sql}"; DUMP="${2:-$OUT/data-latest.dump}"
[ -f "$DUMP.sha256" ] || [ -f "$(readlink -f "$DUMP").sha256" ] && ( cd "$OUT" && sha256sum -c "$(basename "$(readlink -f "$DUMP")").sha256" )
psql "$LOCAL_DB_URL" -X -v ON_ERROR_STOP=1 -qc "drop schema if exists public cascade; create schema public;"
psql "$LOCAL_DB_URL" -X -v ON_ERROR_STOP=1 -q -f "$SQL"
pg_restore --data-only --no-owner --disable-triggers --exit-on-error -d "$LOCAL_DB_URL" "$DUMP"
fallos=0
for t in $(psql "$SUPABASE_DB_URL" -X -At -c "select tablename from pg_tables where schemaname='public' order by 1"); do
  o=$(psql "$SUPABASE_DB_URL" -X -At -c "select count(*) from public.\"$t\"")
  l=$(psql "$LOCAL_DB_URL" -X -At -c "select count(*) from public.\"$t\"" 2>/dev/null || echo "NO EXISTE")
  [ "$o" = "$l" ] && echo "ok   $t $o" || { echo "DIFF $t origen=$o local=$l"; fallos=1; }
done
[ "$fallos" = 0 ] && echo "VALIDACION OK: conteos identicos" || { echo "VALIDACION FALLO" >&2; exit 1; }
