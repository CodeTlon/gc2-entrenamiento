#!/usr/bin/env bash
# Inventario de produccion (solo SELECT): filas por tabla, usuarios de auth y objetos de storage.
source "$(dirname "$0")/lib.sh"
need SUPABASE_DB_URL
q() { psql "$SUPABASE_DB_URL" -X -At -F ' | ' -c "set default_transaction_read_only = on; $1" | grep -v '^SET$'; }
{
  echo "# Inventario Supabase ($(date -u +%FT%TZ))"
  echo; echo "## Filas por tabla (public)"; echo '```'
  for t in $(q "select tablename from pg_tables where schemaname='public' order by 1"); do
    echo "$t | $(q "select count(*) from public.\"$t\"")"
  done
  echo '```'; echo; echo "## Usuarios de auth"; echo '```'
  q "select count(*) as usuarios, count(*) filter (where email_confirmed_at is null) as sin_confirmar from auth.users"
  echo '```'; echo; echo "## Storage por bucket"; echo '```'
  q "select bucket_id, count(*), pg_size_pretty(sum((metadata->>'size')::bigint)) from storage.objects group by 1 order by 1"
  echo '```'
} | tee "$OUT/INVENTARIO.md"
