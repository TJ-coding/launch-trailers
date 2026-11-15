#!/usr/bin/env bash
# Live preview of a trailer in Remotion Studio (hot reload on trailer.json is
# not automatic: edit props in the Studio sidebar, or restart after edits).
#   scripts/studio.sh <dir> [port]
set -euo pipefail
source "$(dirname "$0")/_common.sh"
dir="$(trailer_dir "${1:-}")"; port="${2:-3000}"
ensure_deps
node "$KIT/scripts/check-spec.mjs" "$dir" || true
cd "$KIT"
exec npx remotion studio --props="$dir/trailer.json" --public-dir="$dir/public" --port="$port"
