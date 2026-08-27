#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$PROJECT_ROOT/test-results"
UNIT_ONLY=false
COMPOSE_PROJECT="dianych-bbtest"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.test.yml"
BASE_URL="${BASE_URL:-http://127.0.0.1:13001}"
APP_DIR="$PROJECT_ROOT/dianych-website"
WORK_DIR=""
PASS=0
FAIL=0
SKIP=0

for arg in "$@"; do
  if [[ "$arg" == "--unit-only" ]]; then
    UNIT_ONLY=true
  fi
done

log() { printf '%s\n' "$*"; }
warn() { printf 'WARN: %s\n' "$*" >&2; }
fail() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

cleanup() {
  if [[ -n "${WORK_DIR:-}" && -d "${WORK_DIR:-}" ]]; then
    docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" down --remove-orphans >/dev/null 2>&1 || true
    rm -rf "$WORK_DIR"
  fi
}
trap cleanup EXIT

mkdir -p "$RESULTS_DIR"
REPORT="$RESULTS_DIR/report.csv"
printf '%s\n' "Test ID,Test Name,Execution Time (ms),Result (PASS/FAIL/SKIP),Error Message (if FAIL)" > "$REPORT"

record() {
  local id="$1" name="$2" result="$3" ms="$4" err="${5:-}"
  printf '%s,%s,%s,%s,%s\n' "$id" "$name" "$ms" "$result" "$err" >> "$REPORT"
  if [[ "$result" == "PASS" ]]; then
    PASS=$((PASS + 1))
  elif [[ "$result" == "SKIP" ]]; then
    SKIP=$((SKIP + 1))
  else
    FAIL=$((FAIL + 1))
  fi
  log "$result $id $name (${ms}ms)${err:+ — $err}"
}

now_ms() {
  python3 -c 'import time; print(int(time.time()*1000))'
}

curl_save() {
  local method="$1" url="$2" out="$3"
  shift 3
  curl -sS -X "$method" -D "$out.hdr" -o "$out.body" -w '%{http_code}' "$url" "$@"
}

header_val() {
  local hdr="$1" key="$2"
  python3 - "$hdr" "$key" <<'PY'
import sys
path, key = sys.argv[1], sys.argv[2].lower()
val = ""
for line in open(path, encoding="utf-8", errors="replace"):
    if ":" in line and line.split(":", 1)[0].strip().lower() == key:
        val = line.split(":", 1)[1].strip()
print(val)
PY
}

json_field() {
  python3 - "$1" "$2" <<'PY'
import json, sys
path, key = sys.argv[1], sys.argv[2]
obj = json.load(open(path, encoding="utf-8"))
cur = obj
for part in key.split("."):
    if isinstance(cur, dict):
        cur = cur.get(part)
    else:
        cur = None
        break
if cur is None:
    print("")
elif isinstance(cur, bool):
    print("true" if cur else "false")
else:
    print(cur)
PY
}

# --- Install Dependencies ---
if [[ ! -f "$APP_DIR/package.json" ]]; then
  fail "missing $APP_DIR/package.json"
fi
if [[ ! -d "$APP_DIR/node_modules/bcryptjs" ]]; then
  log "Installing dianych-website dependencies"
  (cd "$APP_DIR" && npm ci)
fi

if $UNIT_ONLY; then
  record "UNIT" "No unit test runner in package.json" "SKIP" "0" "no test script"
  log "Passed=$PASS Failed=$FAIL Skipped=$SKIP"
  exit 0
fi

command -v docker >/dev/null || fail "docker is required"
docker compose version >/dev/null || fail "docker compose v2 is required"

mkdir -p "$PROJECT_ROOT/test-results/work"
WORK_DIR="$(mktemp -d "$PROJECT_ROOT/test-results/work/run.XXXXXX")"
IMAGES_DIR="$WORK_DIR/images"
PW_FILE="$WORK_DIR/pw.txt"
PRICES_DIR="$WORK_DIR/prices"
COOKIE_JAR="$WORK_DIR/cookies.txt"
mkdir -p "$PRICES_DIR" "$IMAGES_DIR/brooches" "$IMAGES_DIR/clothes" "$IMAGES_DIR/panel" "$IMAGES_DIR/felting" "$IMAGES_DIR/kits"

SEED_JPEG="$IMAGES_DIR/brooches/seed.jpg"
SEED_SRC="$PROJECT_ROOT/e2e/fixtures/seed.jpg"
if [[ ! -f "$SEED_SRC" ]]; then
  fail "missing $SEED_SRC"
fi
cp "$SEED_SRC" "$SEED_JPEG"
chmod -R a+rX "$IMAGES_DIR" "$PRICES_DIR"

TEST_PASSWORD="e2e-isolated-password"
export SECRET_COOKIE_PASSWORD="e2e-cookie-secret-32chars-minimum!!"
export TEST_PW_FILE="$PW_FILE"
export TEST_IMAGES_DIR="$IMAGES_DIR"
export TEST_PRICES_DIR="$PRICES_DIR"

(cd "$APP_DIR" && PASSWORD="$TEST_PASSWORD" OUT="$PW_FILE" node -e '
const bcrypt = require("bcryptjs");
const fs = require("fs");
const p = process.env.PASSWORD;
const expanded = p.length >= 32 ? p : `${p}.${p}.${p}`;
bcrypt.hash(expanded, 10).then((h) => { fs.writeFileSync(process.env.OUT, h + "\n"); });
')
chmod a+r "$PW_FILE"

log "Starting SUT via docker compose"
docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d --build

ready=false
start_wait="$(now_ms)"
while [[ $(( $(now_ms) - start_wait )) -lt 180000 ]]; do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/" || true)"
  if [[ "$code" == "200" ]]; then
    ready=true
    break
  fi
  sleep 2
done
if ! $ready; then
  fail "SUT did not become ready at $BASE_URL"
fi

TMP="$WORK_DIR/http"

run_case() {
  local id="$1" name="$2"
  local t0 t1 ms
  t0="$(now_ms)"
  if ! "$3"; then
    t1="$(now_ms)"
    ms=$((t1 - t0))
    record "$id" "$name" "FAIL" "$ms" "${4:-assertion failed}"
    return 0
  fi
  t1="$(now_ms)"
  ms=$((t1 - t0))
  record "$id" "$name" "PASS" "$ms" ""
}

skip_case() {
  record "$1" "$2" "SKIP" "0" "$3"
}

# --- Blackbox ---

ft_p_01() {
  mkdir -p "$TMP"
  local code
  code="$(curl_save GET "$BASE_URL/" "$TMP/p01")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p01.body" <<'PY'
import sys
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
for gid in ("brooches", "clothes", "panel", "felting", "kits"):
    if f'id="{gid}"' not in html and f"id='{gid}'" not in html:
        raise SystemExit(1)
PY
}

ft_p_02() {
  local code
  code="$(curl_save GET "$BASE_URL/" "$TMP/p02")"
  [[ "$code" == "200" ]]
}

ft_p_03() {
  local code
  code="$(curl_save GET "$BASE_URL/" "$TMP/p03")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p03.body" <<'PY'
import sys
html = open(sys.argv[1], encoding="utf-8", errors="replace").read()
for s in ("Портрети домашніх улюбленців", "Вишивка", "Рамки", "Валяння", "Схеми / набори"):
    if s not in html:
        raise SystemExit(1)
PY
}

ft_p_04() {
  local code
  code="$(curl_save GET "$BASE_URL/api/prices" "$TMP/p04")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p04.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
exp = {"smallFrame8": 450, "smallFrame10": 500, "mediumFrame14": 600, "largeFrame19": 700}
raise SystemExit(0 if o == exp else 1)
PY
}

ft_n_01() {
  local code
  code="$(curl -sS -D "$TMP/n01.hdr" -o "$TMP/n01.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" -F 'password=')"
  [[ "$code" == "400" ]] || return 1
  python3 - "$TMP/n01.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "Password is required" else 1)
PY
}

ft_n_02() {
  local code
  code="$(curl -sS -D "$TMP/n02.hdr" -o "$TMP/n02.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" -F 'password=not-the-password')"
  [[ "$code" == "401" ]] || return 1
  python3 - "$TMP/n02.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "Invalid password" else 1)
PY
}

ft_n_03() {
  local i code
  for i in 1 2 3 4 5; do
    code="$(curl -sS -o "$TMP/n03.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" \
      -H 'X-Forwarded-For: 203.0.113.10' -F 'password=not-the-password')"
    [[ "$code" == "401" ]] || return 1
  done
  code="$(curl -sS -o "$TMP/n03.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" \
    -H 'X-Forwarded-For: 203.0.113.10' -F 'password=not-the-password')"
  [[ "$code" == "429" ]] || return 1
  python3 - "$TMP/n03.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if "Too many login attempts" in str(o.get("message", "")) else 1)
PY
}

ft_n_04() {
  local code loc
  code="$(curl -sS -D "$TMP/n04.hdr" -o "$TMP/n04.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "307" || "$code" == "302" || "$code" == "308" ]] || return 1
  loc="$(header_val "$TMP/n04.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/login" else 1)
PY
}

ft_p_07() {
  rm -f "$COOKIE_JAR"
  local code loc cookie
  code="$(curl -sS -c "$COOKIE_JAR" -D "$TMP/p07.hdr" -o "$TMP/p07.body" -w '%{http_code}' --max-redirs 0 \
    -X POST "$BASE_URL/api/login" -F "password=$TEST_PASSWORD" || true)"
  [[ "$code" == "307" || "$code" == "302" ]] || return 1
  loc="$(header_val "$TMP/p07.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/manage" else 1)
PY
  cookie="$(header_val "$TMP/p07.hdr" set-cookie)"
  [[ "$cookie" == *dianych-manage-session* ]] || return 1
  code="$(curl -sS -b "$COOKIE_JAR" -D "$TMP/p07b.hdr" -o "$TMP/p07b.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "200" ]]
}

ft_p_05() {
  local code
  code="$(curl -sS -b "$COOKIE_JAR" -D "$TMP/p05.hdr" -o "$TMP/p05.body" -w '%{http_code}' \
    -X POST "$BASE_URL/api/prices" -H 'Content-Type: application/json' \
    -d '{"smallFrame8":111,"smallFrame10":222,"mediumFrame14":333,"largeFrame19":444}')"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p05.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
exp = {"smallFrame8": 111, "smallFrame10": 222, "mediumFrame14": 333, "largeFrame19": 444}
raise SystemExit(0 if o == exp else 1)
PY
}

ft_p_06() {
  local code
  code="$(curl_save GET "$BASE_URL/api/prices" "$TMP/p06")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p06.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
exp = {"smallFrame8": 111, "smallFrame10": 222, "mediumFrame14": 333, "largeFrame19": 444}
raise SystemExit(0 if o == exp else 1)
PY
}

ft_n_05() {
  local code
  code="$(curl -sS -D "$TMP/n05.hdr" -o "$TMP/n05.body" -w '%{http_code}' \
    -X POST "$BASE_URL/api/prices" -H 'Content-Type: application/json' \
    -d '{"smallFrame8":1,"smallFrame10":2,"mediumFrame14":3,"largeFrame19":4}')"
  [[ "$code" == "401" ]] || return 1
  python3 - "$TMP/n05.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "Unauthorized" else 1)
PY
}

ft_n_06() {
  local code
  code="$(curl -sS -b "$COOKIE_JAR" -D "$TMP/n06.hdr" -o "$TMP/n06.body" -w '%{http_code}' \
    -X POST "$BASE_URL/api/prices" -H 'Content-Type: application/json' \
    -d '{"smallFrame8":-1,"smallFrame10":222,"mediumFrame14":333,"largeFrame19":444}')"
  [[ "$code" == "400" ]] || return 1
  python3 - "$TMP/n06.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "All prices must be non-negative numbers." else 1)
PY
}

ft_n_07_inv() {
  local code
  code="$(curl -sS -D "$TMP/n07.hdr" -o "$TMP/n07.body" -w '%{http_code}' -X POST "$BASE_URL/api/gallery-pack/invalidate")"
  [[ "$code" == "401" ]] || return 1
  python3 - "$TMP/n07.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("error") == "Unauthorized" else 1)
PY
}

ft_p_08() {
  local code
  code="$(curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/p08")"
  [[ "$code" == "200" ]] || return 1
  [[ "$(json_field "$TMP/p08.body" width)" == "500" ]]
}

ft_p_09() {
  local code
  code="$(curl_save GET "$BASE_URL/api/image?galleryId=brooches&name=seed.jpg" "$TMP/p09")"
  [[ "$code" == "200" ]] || return 1
  [[ "$(json_field "$TMP/p09.body" width)" == "1600" ]] || return 1
  python3 - "$TMP/p09.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if str(o.get("dataUrl", "")).startswith("data:image/webp") else 1)
PY
}

ft_p_10() {
  local code cc
  code="$(curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/p10")"
  [[ "$code" == "200" ]] || return 1
  cc="$(header_val "$TMP/p10.hdr" Cache-Control)"
  [[ "$cc" == "public, max-age=300, s-maxage=300" ]]
}

ft_p_12() {
  local code loc
  code="$(curl -sS -b "$COOKIE_JAR" -c "$COOKIE_JAR" -D "$TMP/p12.hdr" -o "$TMP/p12.body" -w '%{http_code}' -X POST "$BASE_URL/api/logout")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/p12.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "Logged out" else 1)
PY
  code="$(curl -sS -b "$COOKIE_JAR" -D "$TMP/p12b.hdr" -o "$TMP/p12b.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "307" || "$code" == "302" || "$code" == "308" ]] || return 1
  loc="$(header_val "$TMP/p12b.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/login" else 1)
PY
}

ft_n_13() {
  local code
  code="$(curl_save GET "$BASE_URL/api/gallery-pack?galleryId=not-a-gallery" "$TMP/n13")"
  [[ "$code" == "400" ]] || return 1
  python3 - "$TMP/n13.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("error") == "Invalid galleryId" else 1)
PY
}

ft_n_14() {
  local code
  code="$(curl_save GET "$BASE_URL/api/image" "$TMP/n14")"
  [[ "$code" == "400" ]] || return 1
  python3 - "$TMP/n14.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("error") == "galleryId and name are required" else 1)
PY
}

ft_n_15() {
  local code
  code="$(curl_save GET "$BASE_URL/api/image?galleryId=brooches&name=../x" "$TMP/n15")"
  [[ "$code" == "400" ]] || return 1
  python3 - "$TMP/n15.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("error") == "Invalid parameters" else 1)
PY
}

ft_n_16() {
  local code
  code="$(curl_save GET "$BASE_URL/api/image?galleryId=brooches&name=foo/bar.jpg" "$TMP/n16")"
  [[ "$code" == "400" ]]
}

sm_01() {
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/")"
  [[ "$code" == "200" ]]
}

sm_02() {
  local code
  code="$(curl_save GET "$BASE_URL/api/prices" "$TMP/sm02")"
  [[ "$code" == "200" ]] || return 1
  python3 - "$TMP/sm02.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
keys = ("smallFrame8", "smallFrame10", "mediumFrame14", "largeFrame19")
raise SystemExit(0 if all(isinstance(o.get(k), (int, float)) for k in keys) else 1)
PY
}

sm_03() {
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/login")"
  [[ "$code" == "200" ]]
}

sm_05() {
  local code
  code="$(curl -sS -o "$TMP/sm05a.bin" -w '%{http_code}' "$BASE_URL/images/brooches/seed.jpg")"
  [[ "$code" == "200" ]] || return 1
  code="$(curl_save GET "$BASE_URL/api/image?galleryId=brooches&name=seed.jpg&width=256" "$TMP/sm05b")"
  [[ "$code" == "200" ]] || return 1
  [[ -s "$TMP/sm05a.bin" ]]
}

nft_res_02() {
  rm -f "$PRICES_DIR/framePrices.json"
  ft_p_04
}

nft_sec_06() {
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/")"
  [[ "$code" == "200" ]] || return 1
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/login")"
  [[ "$code" == "200" ]] || return 1
  ft_n_04
}

nft_res_04() {
  local code loc
  rm -f "$WORK_DIR/old-cookies.txt"
  code="$(curl -sS -c "$WORK_DIR/old-cookies.txt" -D "$TMP/r04.hdr" -o "$TMP/r04.body" -w '%{http_code}' --max-redirs 0 \
    -X POST "$BASE_URL/api/login" -F "password=$TEST_PASSWORD" || true)"
  [[ "$code" == "307" || "$code" == "302" ]] || return 1
  export SECRET_COOKIE_PASSWORD="e2e-cookie-secret-rotated-32chars!!"
  docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d --force-recreate
  ready=false
  start_wait="$(now_ms)"
  while [[ $(( $(now_ms) - start_wait )) -lt 120000 ]]; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/" || true)"
    if [[ "$code" == "200" ]]; then
      ready=true
      break
    fi
    sleep 2
  done
  $ready || return 1
  code="$(curl -sS -b "$WORK_DIR/old-cookies.txt" -D "$TMP/r04b.hdr" -o "$TMP/r04b.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "307" || "$code" == "302" || "$code" == "308" ]] || return 1
  loc="$(header_val "$TMP/r04b.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/login" else 1)
PY
}

run_case "FT-P-01" "Five gallery ids" ft_p_01
run_case "FT-P-02" "Empty gallery no 500" ft_p_02
run_case "FT-P-03" "Default UA copy slots" ft_p_03
run_case "FT-P-04" "Default prices" ft_p_04
run_case "FT-N-01" "Login missing password" ft_n_01
run_case "FT-N-02" "Login wrong password" ft_n_02
run_case "FT-N-03" "Login rate limit" ft_n_03
run_case "FT-N-04" "Manage redirect" ft_n_04
run_case "SM-01" "Storefront up" sm_01
run_case "SM-02" "Prices keys" sm_02
run_case "SM-03" "Login page" sm_03
run_case "SM-04" "Manage gate" ft_n_04
run_case "FT-P-07" "Successful login" ft_p_07
run_case "FT-P-05" "POST prices echo" ft_p_05
run_case "FT-P-06" "GET prices after POST" ft_p_06
run_case "FT-N-05" "Unauth POST prices" ft_n_05
run_case "FT-N-06" "Negative price" ft_n_06
run_case "FT-N-07" "Unauth invalidate" ft_n_07_inv
run_case "NFT-SEC-01" "Mutations require session" ft_n_05
run_case "NFT-SEC-04" "Manage gated" ft_n_04
run_case "NFT-SEC-05" "Invalidate 401" ft_n_07_inv
run_case "FT-P-08" "Pack default width" ft_p_08
run_case "FT-P-09" "Image default width" ft_p_09
run_case "FT-P-10" "Cache-Control" ft_p_10
run_case "FT-N-13" "Bad galleryId" ft_n_13
run_case "FT-N-14" "Missing image params" ft_n_14
run_case "FT-N-15" "Invalid image params" ft_n_15
run_case "FT-N-16" "Other-path image name" ft_n_16
run_case "NFT-SEC-02" "Image traversal" ft_n_15
run_case "SM-05" "Static /images/ readable" sm_05
run_case "FT-P-12" "Logout" ft_p_12
run_case "NFT-RES-01" "Empty gallery resilience" ft_p_02
run_case "NFT-RES-02" "Missing prices defaults" nft_res_02
run_case "NFT-RES-04" "Session after recreate" nft_res_04

skip_case "FT-P-11" "Upload visible to new visitor" "manage form / Next server action not HTTP-scriptable"
skip_case "FT-N-08" "Bad folder upload" "manage form / Next server action"
skip_case "FT-N-09" "Empty files upload" "manage form / Next server action"
skip_case "FT-N-10" "Non-image upload" "manage form / Next server action"
skip_case "FT-N-11" "Bad magic bytes" "manage form / Next server action"
skip_case "FT-N-12" "Traversal upload/delete" "manage form / Next server action"
skip_case "NFT-RES-03" "Missing pw.txt" "requires a second isolated SUT"
skip_case "NFT-RES-05" "Rate-limit map reset" "requires process restart mid-suite"
skip_case "NFT-RES-LIM-02" "20MB upload body" "manage form / Next server action"
skip_case "NFT-RES-LIM-03" "500MB thumb cache" "duration soak; run manually"
skip_case "NFT-RES-LIM-01" "Login window" "same run as FT-N-03"
skip_case "NFT-SEC-03" "Rate limit (alias)" "covered by FT-N-03"

run_case "NFT-SEC-06" "Public pages no session" nft_sec_06

log "Passed=$PASS Failed=$FAIL Skipped=$SKIP"
log "Report: $REPORT"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
