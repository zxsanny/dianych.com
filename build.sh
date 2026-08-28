#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
IMAGE="${DIANYCH_IMAGE:-docker.azaion.com/dianych:latest}"

cd "$ROOT/dianych-website"
docker build --platform linux/amd64 -t "$IMAGE" .
if ! docker push "$IMAGE"; then
  docker login docker.azaion.com
  docker push "$IMAGE"
fi
echo "Pushed $IMAGE"
