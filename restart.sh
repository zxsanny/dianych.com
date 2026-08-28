#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
IMAGE="${DIANYCH_IMAGE:-docker.azaion.com/dianych:latest}"
IMAGES="$ROOT/images"
PW="$ROOT/pw.txt"

mkdir -p "$IMAGES"
docker stop dianych.com >/dev/null 2>&1 || true
docker rm dianych.com >/dev/null 2>&1 || true

run=(
  docker run -d
  -p 3001:3000
  -v "$IMAGES:/app/public/images"
  --tmpfs /tmp:noexec,nosuid,size=512m
  --read-only
  -e SECRET_COOKIE_PASSWORD="$(openssl rand -base64 48)"
  --name dianych.com
  --restart always
)
if [[ -f "$PW" ]]; then
  run+=(-v "$PW:/app/pw.txt:ro")
fi
run+=("$IMAGE")
"${run[@]}"
echo "Started $IMAGE on :3001 (images=$IMAGES)"
