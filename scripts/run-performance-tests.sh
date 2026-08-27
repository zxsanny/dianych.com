#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"
COMPOSE_PROJECT="dianych-bbtest"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.test.yml"
BASE_URL="${BASE_URL:-http://127.0.0.1:3001}"
APP_DIR="$PROJECT_ROOT/dianych-website"
WORK_DIR=""
PASS=0
FAIL=0

log() { printf '%s\n' "$*"; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

cleanup() {
  if [[ -n "${WORK_DIR:-}" && -d "${WORK_DIR:-}" ]]; then
    docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" down --remove-orphans >/dev/null 2>&1 || true
    rm -rf "$WORK_DIR"
  fi
}
trap cleanup EXIT

mkdir -p "$RESULTS_DIR"
REPORT="$RESULTS_DIR/performance-report.csv"
printf '%s\n' "Test ID,Test Name,p95_ms,Threshold_ms,Result" > "$REPORT"

now_ms() {
  python3 -c 'import time; print(int(time.time()*1000))'
}

if [[ ! -d "$APP_DIR/node_modules/bcryptjs" ]]; then
  log "Installing dianych-website dependencies"
  (cd "$APP_DIR" && npm ci)
fi

command -v docker >/dev/null || fail "docker is required"
docker compose version >/dev/null || fail "docker compose v2 is required"

already_up=false
code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/" || true)"
if [[ "$code" == "200" ]]; then
  already_up=true
fi

if ! $already_up; then
  WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dianych-perf.XXXXXX")"
  IMAGES_DIR="$WORK_DIR/images"
  PW_FILE="$WORK_DIR/pw.txt"
  PRICES_DIR="$WORK_DIR/prices"
  mkdir -p "$PRICES_DIR" "$IMAGES_DIR/brooches" "$IMAGES_DIR/clothes" "$IMAGES_DIR/panel" "$IMAGES_DIR/felting" "$IMAGES_DIR/kits"
  python3 - "$IMAGES_DIR/brooches/seed.jpg" <<'PY'
import sys, base64, pathlib
b = base64.b64decode(
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wAALCAABAAEBAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q=="
)
pathlib.Path(sys.argv[1]).write_bytes(b)
PY
  export SECRET_COOKIE_PASSWORD="e2e-cookie-secret-32chars-minimum!!"
  export TEST_PW_FILE="$PW_FILE"
  export TEST_IMAGES_DIR="$IMAGES_DIR"
  export TEST_PRICES_DIR="$PRICES_DIR"
  (cd "$APP_DIR" && PASSWORD="e2e-isolated-password" OUT="$PW_FILE" node -e '
const bcrypt = require("bcryptjs");
const fs = require("fs");
const p = process.env.PASSWORD;
const expanded = p.length >= 32 ? p : `${p}.${p}.${p}`;
bcrypt.hash(expanded, 10).then((h) => { fs.writeFileSync(process.env.OUT, h + "\n"); });
')
  docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d --build
  start_wait="$(now_ms)"
  ready=false
  while [[ $(( $(now_ms) - start_wait )) -lt 180000 ]]; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/" || true)"
    if [[ "$code" == "200" ]]; then
      ready=true
      break
    fi
    sleep 2
  done
  $ready || fail "SUT did not become ready at $BASE_URL"
fi

p95() {
  python3 - "$@" <<'PY'
import sys
vals = sorted(int(x) for x in sys.argv[1:])
if not vals:
    print(0)
    raise SystemExit
idx = max(0, int(round(0.95 * (len(vals) - 1))))
print(vals[idx])
PY
}

measure_get() {
  local url="$1" n="$2"
  local i t0 t1
  local times=()
  for i in $(seq 1 "$n"); do
    t0="$(now_ms)"
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || true)"
    t1="$(now_ms)"
    [[ "$code" == "200" ]] || return 1
    times+=("$((t1 - t0))")
  done
  p95 "${times[@]}"
}

record_perf() {
  local id="$1" name="$2" p95v="$3" thr="$4"
  local result="PASS"
  if [[ "$p95v" -gt "$thr" ]]; then
    result="FAIL"
    FAIL=$((FAIL + 1))
  else
    PASS=$((PASS + 1))
  fi
  printf '%s,%s,%s,%s,%s\n' "$id" "$name" "$p95v" "$thr" "$result" >> "$REPORT"
  log "$result $id p95=${p95v}ms threshold=${thr}ms"
}

log "Warm-up GET /"
curl -sS -o /dev/null "$BASE_URL/" || true

p="$(measure_get "$BASE_URL/" 10)" || fail "NFT-PERF-01 request failed"
record_perf "NFT-PERF-01" "Storefront HTML" "$p" "3000"

log "Cold pack (informational)"
t0="$(now_ms)"
code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/gallery-pack?galleryId=brooches&size=400" || true)"
t1="$(now_ms)"
cold=$((t1 - t0))
[[ "$code" == "200" ]] || fail "NFT-PERF-02 cold pack failed"
if [[ "$cold" -gt 15000 ]]; then
  record_perf "NFT-PERF-02-cold" "Pack cold" "$cold" "15000"
else
  log "INFO NFT-PERF-02 cold ${cold}ms"
  p="$(measure_get "$BASE_URL/api/gallery-pack?galleryId=brooches&size=400" 20)" || fail "NFT-PERF-02 warm failed"
  record_perf "NFT-PERF-02" "Pack warm p95" "$p" "800"
fi

t0="$(now_ms)"
code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/image?galleryId=brooches&name=seed.jpg&width=1200" || true)"
t1="$(now_ms)"
cold=$((t1 - t0))
[[ "$code" == "200" ]] || fail "NFT-PERF-03 cold image failed"
if [[ "$cold" -gt 15000 ]]; then
  record_perf "NFT-PERF-03-cold" "Image cold" "$cold" "15000"
else
  log "INFO NFT-PERF-03 cold ${cold}ms"
  p="$(measure_get "$BASE_URL/api/image?galleryId=brooches&name=seed.jpg&width=1200" 20)" || fail "NFT-PERF-03 warm failed"
  record_perf "NFT-PERF-03" "Image warm p95" "$p" "800"
fi

curl -sS -o /dev/null "$BASE_URL/api/prices" || true
p="$(measure_get "$BASE_URL/api/prices" 30)" || fail "NFT-PERF-04 failed"
record_perf "NFT-PERF-04" "Prices GET" "$p" "300"

log "Passed=$PASS Failed=$FAIL"
log "Report: $REPORT"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
