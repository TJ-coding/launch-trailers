#!/usr/bin/env bash
# Render a trailer to <dir>/out/.
#   scripts/render.sh <dir> [landscape|square|vertical|all] [--gif] [--poster] [--draft] [--strict]
#   --gif     also write a 720px-wide GIF (README / social)
#   --poster  also write poster.png (a frame from the closing card)
#   --draft   half resolution, fast, for review
#   --strict  fail on missing media (use for the final render)
set -euo pipefail
source "$(dirname "$0")/_common.sh"
dir="$(trailer_dir "${1:-}")"; shift || true
formats=""; gif=0; poster=0; scale=1; strict=""
for a in "$@"; do
  case "$a" in
    landscape|square|vertical) formats="$formats $a" ;;
    all) formats="landscape square vertical" ;;
    --gif) gif=1 ;;
    --poster) poster=1 ;;
    --draft) scale=0.5 ;;
    --strict) strict="--strict" ;;
    *) echo "unknown option: $a" >&2; exit 1 ;;
  esac
done
ensure_deps
node "$KIT/scripts/check-spec.mjs" "$dir" $strict
[ -z "$formats" ] && formats="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).format||"landscape")' "$dir/trailer.json")"
mkdir -p "$dir/out"
slug="$(basename "$dir")"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
cd "$KIT"
for f in $formats; do
  props="$tmp/$f.json"
  node -e 'const fs=require("fs");const s=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));s.format=process.argv[3];fs.writeFileSync(process.argv[2],JSON.stringify(s))' "$dir/trailer.json" "$props" "$f"
  out="$dir/out/$slug-$f.mp4"
  echo "› Rendering $f → $out"
  npx remotion render Trailer "$out" --props="$props" --public-dir="$dir/public" --scale="$scale" --timeout=120000 --log=error
  if [ "$gif" = 1 ]; then
    ffmpeg -loglevel error -y -i "$out" -vf "fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" "${out%.mp4}.gif"
    echo "  GIF  ${out%.mp4}.gif"
  fi
  if [ "$poster" = 1 ]; then
    frame="$(node "$KIT/scripts/check-spec.mjs" "$dir" --poster-frame)"
    npx remotion still Trailer "$dir/out/$slug-$f-poster.png" --props="$props" --public-dir="$dir/public" --frame="$frame" --timeout=120000 --log=error
    echo "  PNG  $dir/out/$slug-$f-poster.png"
  fi
done
echo "✓ Done: $dir/out/"
