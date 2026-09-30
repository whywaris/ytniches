#!/usr/bin/env bash
# SQL tests (supabase/tests/*.test.sql) against a plain Postgres 16 +
# pgvector: creates a scratch database, applies supabase/tests/stubs.sql and
# every migration in order, then runs each test file. Needs PG* env vars
# (PGHOST, PGPORT, PGUSER, PGPASSWORD) pointing at a server we may create
# databases on -- never a Supabase project.
set -euo pipefail

cd "$(dirname "$0")/.."
DB="${SQL_TEST_DB:-ytniches_sql_test}"
PSQL=(psql -X -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" -d postgres -c "drop database if exists ${DB}" -c "create database ${DB}"
"${PSQL[@]}" -d "$DB" -f supabase/tests/stubs.sql
for f in supabase/migrations/*.sql; do
  "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null || { echo "migration failed: $f" >&2; exit 1; }
done
for f in supabase/tests/*.test.sql; do
  echo "SQL test: $f"
  "${PSQL[@]}" -d "$DB" -f "$f" >/dev/null
done
echo "SQL tests passed"
