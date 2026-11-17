#!/usr/bin/env bash
# Scaffold a trailer folder from a template.
#   scripts/new-trailer.sh product|feature|scenario <dir> ["Brand name"] [brand-url]
set -euo pipefail
source "$(dirname "$0")/_common.sh"
type="${1:-}"; dir="${2:-}"; name="${3:-}"; url="${4:-}"
if [[ "$type" != "product" && "$type" != "feature" && "$type" != "scenario" ]] || [ -z "$dir" ]; then
  echo "usage: $0 product|feature|scenario <dir> [\"Brand name\"] [brand-url]" >&2; exit 1
fi
if [ -e "$dir/trailer.json" ]; then echo "error: $dir/trailer.json already exists" >&2; exit 1; fi
mkdir -p "$dir/public"
cp "$KIT/templates/$type/trailer.json" "$dir/trailer.json"
cp "$KIT/templates/storyboard.md" "$dir/storyboard.md"
[ "$type" != "scenario" ] && cp "$KIT/templates/record.mjs" "$dir/record.mjs"
cp -n "$KIT/templates/$type/public/"* "$dir/public/" 2>/dev/null || true
rm -f "$dir/public/.gitkeep"
printf 'out/\n' > "$dir/.gitignore"
if [ -n "$name$url" ]; then
  node -e '
    const fs = require("fs"); const [f, name, url] = process.argv.slice(1);
    const s = JSON.parse(fs.readFileSync(f, "utf8"));
    if (name) { s.brand.name = name; s.title = s.title.replace(/^Acme/, name); }
    if (url) { s.brand.url = url; }
    fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n");
  ' "$dir/trailer.json" "$name" "$url"
fi
echo "✓ Created $type trailer in $dir"
echo "  1. Fill in $dir/storyboard.md: the viewer, the one promise, the session as a chain of actions"
echo "  2. Run the app locally, write $dir/record.mjs, then: node scripts/record.mjs $dir"
echo "  3. Edit $dir/trailer.json (times from clips.json) until check-spec.mjs is clean"
echo "  4. render.sh $dir --draft, then review.mjs $dir: look at the sheets before anyone else does"
