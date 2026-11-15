#!/usr/bin/env bash
# Screenshot a URL with headless Chrome at a fixed size (2x pixel density).
#   scripts/capture.sh <url> <out.png> [1440x900] [--dark]
# Pages behind a login: capture from a signed-in browser instead (macOS ⌘⇧4),
# or point --user-data-dir at a profile (CHROME_PROFILE=/path).
set -euo pipefail
url="${1:-}"; out="${2:-}"; size="${3:-1440x900}"; dark="${4:-}"
[ -z "$url" ] || [ -z "$out" ] && { echo "usage: $0 <url> <out.png> [WxH] [--dark]" >&2; exit 1; }
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" "$(command -v google-chrome || true)" "$(command -v chromium || true)"; do
  [ -n "$c" ] && [ -x "$c" ] && chrome="$c" && break
done
[ -z "${chrome:-}" ] && { echo "error: Chrome not found" >&2; exit 1; }
w="${size%x*}"; h="${size#*x}"
args=(--headless=new --hide-scrollbars --disable-gpu --force-device-scale-factor=2 --window-size="$w,$h" --virtual-time-budget=6000 --screenshot="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")")
[ "$dark" = "--dark" ] && args+=(--force-dark-mode --blink-settings=preferredColorScheme=0)
[ -n "${CHROME_PROFILE:-}" ] && args+=(--user-data-dir="$CHROME_PROFILE")
"$chrome" "${args[@]}" "$url" 2>/dev/null
echo "✓ $out (${w}x${h} @2x, aspect $(node -e "console.log(($w/$h).toFixed(4))"))"
