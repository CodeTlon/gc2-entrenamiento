#!/usr/bin/env bash
# Utilidades comunes. Las credenciales viven en scripts/migracion/.env.migracion (gitignored, chmod 600):
#   SUPABASE_DB_URL=postgresql://...   (SOLO LECTURA: se usa unicamente con pg_dump y SELECT)
#   LOCAL_DB_URL=postgresql://app:app@127.0.0.1:<puerto>/app   (base descartable donde se restaura)
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$DIR/out"; mkdir -p "$OUT"
if [ -f "$DIR/.env.migracion" ]; then set -a; . "$DIR/.env.migracion"; set +a; fi
need() { [ -n "${!1:-}" ] || { echo "Falta $1 (ver scripts/migracion/README.md)" >&2; exit 1; }; }
