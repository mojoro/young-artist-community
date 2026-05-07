#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_PROD_URL:?missing}"
: "${NEON_DEV_URL:?missing}"

DUMP=/tmp/yac-prod-dump.bin
trap 'rm -f "$DUMP"' EXIT

echo "==> Dump Supabase prod"
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --no-comments \
  --file="$DUMP" \
  "$SUPABASE_PROD_URL"

echo "==> Restore into Neon (clean overwrite)"
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="$NEON_DEV_URL" \
  "$DUMP"

echo "==> Scrub PII"
psql "$NEON_DEV_URL" <<'SQL'
BEGIN;

UPDATE subscriber
SET email = 'user-' || substring(id::text from 1 for 8) || '@example.test';

UPDATE feedback
SET email = CASE
  WHEN email IS NULL THEN NULL
  ELSE 'user-' || substring(id::text from 1 for 8) || '@example.test'
END;

UPDATE report
SET reporter_email = CASE
  WHEN reporter_email IS NULL THEN NULL
  ELSE 'user-' || substring(id::text from 1 for 8) || '@example.test'
END;

COMMIT;
SQL

echo "==> Done"
