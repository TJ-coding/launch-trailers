# Shared helpers for the kit scripts (sourced, not run).
KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ensure_deps() {
  if [ ! -d "$KIT/node_modules/remotion" ]; then
    echo "› Installing kit dependencies (first run)…"
    (cd "$KIT" && npm install --no-audit --no-fund >/dev/null)
  fi
}
trailer_dir() {
  local d="${1:-}"
  if [ -z "$d" ] || [ ! -f "$d/trailer.json" ]; then
    echo "error: '$d' is not a trailer folder (no trailer.json). Create one with scripts/new-trailer.sh." >&2
    exit 1
  fi
  (cd "$d" && pwd)
}
