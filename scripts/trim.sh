#!/usr/bin/env bash
# Cut a screen recording into a clip for a screen scene (no audio, h264, ≤1920 wide).
#   scripts/trim.sh <in.mov> <start-seconds> <end-seconds> <out.mp4> [speed]
set -euo pipefail
in="${1:-}"; s="${2:-}"; e="${3:-}"; out="${4:-}"; speed="${5:-1}"
[ -z "$out" ] && { echo "usage: $0 <in.mov> <start> <end> <out.mp4> [speed]" >&2; exit 1; }
ffmpeg -loglevel error -y -ss "$s" -to "$e" -i "$in" -an \
  -vf "setpts=PTS/$speed,scale='min(1920,iw)':-2,fps=30" -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart "$out"
echo "✓ $out ($(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$out"))"
