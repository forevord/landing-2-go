#!/usr/bin/env bash
# Fails if user-visible Polish copy is written directly into components
# instead of living in src/i18n/. Diacritics are the cheap, reliable tell.
set -euo pipefail

matches=$(grep -rnE '[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]' src --include='*.astro' --include='*.ts' \
  --exclude-dir=i18n || true)

if [ -n "$matches" ]; then
  echo "Polish copy found outside src/i18n/:"
  echo "$matches"
  exit 1
fi

echo "OK: no hardcoded copy."
