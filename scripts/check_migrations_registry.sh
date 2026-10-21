#!/usr/bin/env bash
# Verifies migrations dir, Rust registry and rollbacks agree.
set -euo pipefail
DIR="services/api/database/migrations"
RS="services/api/src/migrations.rs"
fail=0

for f in "$DIR"/*.sql; do
  n=$(basename "$f" .sql)
  grep -q "name: \"$n\"" "$RS" || { echo "::error::$n.sql not registered in migrations.rs"; fail=1; }
  [ -f "$DIR/rollbacks/${n}_down.sql" ] || { echo "::error::missing rollback for $n"; fail=1; }
done

for r in "$DIR"/rollbacks/*_down.sql; do
  n=$(basename "$r" _down.sql)
  [ -f "$DIR/$n.sql" ] || { echo "::error::orphan rollback $(basename "$r")"; fail=1; }
done

for n in $(grep -oE 'name: "[^"]+"' "$RS" | cut -d'"' -f2); do
  [ -f "$DIR/$n.sql" ] || { echo "::error::registry entry $n has no file"; fail=1; }
done

dups=$(grep -oE 'version: "[^"]+"' "$RS" | sort | uniq -d || true)
[ -z "$dups" ] || { echo "::error::duplicate registry versions: $dups"; fail=1; }

exit $fail
