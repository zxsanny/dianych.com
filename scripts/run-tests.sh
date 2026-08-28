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
  docker rm -f dianych-bbtest-nopw >/dev/null 2>&1 || true
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

wait_ready() {
  local url="${1:-$BASE_URL}"
  local budget="${2:-180000}"
  local start_wait code
  start_wait="$(now_ms)"
  while [[ $(( $(now_ms) - start_wait )) -lt "$budget" ]]; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url/" || true)"
    if [[ "$code" == "200" ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

pack_names() {
  python3 - "$1" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
print("\n".join(sorted(str(x.get("name", "")) for x in o.get("images", []))))
PY
}

cookie_header() {
  python3 - "$COOKIE_JAR" <<'PY'
import sys
out = []
for line in open(sys.argv[1], encoding="utf-8", errors="replace"):
    if line.startswith("#HttpOnly_"):
        line = line[len("#HttpOnly_"):]
    elif line.startswith("#") or not line.strip():
        continue
    parts = line.rstrip("\n").split("\t")
    if len(parts) >= 7:
        out.append(f"{parts[5]}={parts[6]}")
print("; ".join(out))
PY
}

action_id() {
  docker exec "${COMPOSE_PROJECT}-system-under-test-1" \
    cat /app/.next/server/server-reference-manifest.json \
    | node -e '
let s = "";
process.stdin.on("data", (d) => { s += d; });
process.stdin.on("end", () => {
  const o = JSON.parse(s);
  const want = process.argv[1];
  for (const [k, v] of Object.entries(o.node || {})) {
    if (v.exportedName === want) {
      process.stdout.write(k + "\n");
      process.exit(0);
    }
  }
  process.exit(1);
});
' "$1"
}

invoke_manage() {
  node "$PROJECT_ROOT/scripts/invoke-manage-action.js" --base-url "$BASE_URL" "$@"
}

invalidate_pack() {
  curl -sS -b "$COOKIE_JAR" -o /dev/null -X POST "$BASE_URL/api/gallery-pack/invalidate" \
    -H 'Content-Type: application/json' -d '{"galleryId":"brooches"}' || true
}

log "Starting SUT via docker compose"
docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d --build
wait_ready "$BASE_URL" 180000 || fail "SUT did not become ready at $BASE_URL"

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
    -H 'X-Forwarded-Host: evil.example' -X POST "$BASE_URL/api/login" -F "password=$TEST_PASSWORD" || true)"
  [[ "$code" == "307" || "$code" == "302" ]] || return 1
  loc="$(header_val "$TMP/p07.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/manage" and p.hostname != "evil.example" else 1)
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

ft_n_07() {
  local code names1 names2 http
  code="$(curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/n07p1")"
  [[ "$code" == "200" ]] || return 1
  names1="$(pack_names "$TMP/n07p1.body")"
  ft_n_05 || return 1
  ft_n_07_inv || return 1
  invoke_manage --action-id "$(action_id uploadImages)" \
    --folder brooches --file "$SEED_JPEG" --filename bbtest-unauth.jpg > "$TMP/n07u.json"
  http="$(manage_http "$TMP/n07u.json")"
  [[ "$http" == "307" || "$http" == "302" || "$(manage_msg "$TMP/n07u.json")" == "Unauthorized." ]] || return 1
  invoke_manage --action-id "$(action_id deleteImage)" \
    --image-path '/images/brooches/seed.jpg' > "$TMP/n07d.json"
  http="$(manage_http "$TMP/n07d.json")"
  [[ "$http" == "307" || "$http" == "302" || "$(manage_msg "$TMP/n07d.json")" == "Unauthorized." ]] || return 1
  code="$(curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/n07p2")"
  [[ "$code" == "200" ]] || return 1
  names2="$(pack_names "$TMP/n07p2.body")"
  [[ "$names1" == "$names2" ]]
}

nft_sec_01() {
  local code before after
  code="$(curl_save GET "$BASE_URL/api/prices" "$TMP/sec01a")"
  [[ "$code" == "200" ]] || return 1
  before="$(cat "$TMP/sec01a.body")"
  ft_n_07 || return 1
  code="$(curl_save GET "$BASE_URL/api/prices" "$TMP/sec01b")"
  [[ "$code" == "200" ]] || return 1
  after="$(cat "$TMP/sec01b.body")"
  [[ "$before" == "$after" ]]
}

nft_alias_n03() {
  local code
  code="$(curl -sS -o "$TMP/alias.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" \
    -H 'X-Forwarded-For: 203.0.113.10' -F 'password=not-the-password')"
  [[ "$code" == "429" ]]
}

manage_msg() {
  python3 - "$1" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
r = o.get("result") or {}
print(r.get("message") or "")
PY
}

manage_status() {
  python3 - "$1" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
r = o.get("result") or {}
print(r.get("status") or "")
PY
}

manage_http() {
  python3 - "$1" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
print(o.get("httpStatus") or "")
PY
}

ft_n_08() {
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder frames --file "$SEED_JPEG" --filename bbtest-upload.jpg > "$TMP/n08.json"
  [[ "$(manage_msg "$TMP/n08.json")" == "Please select a valid folder." ]]
}

ft_n_09() {
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --empty-file --filename empty.jpg > "$TMP/n09.json"
  [[ "$(manage_msg "$TMP/n09.json")" == "Please select at least one file to upload." ]]
}

ft_n_10() {
  printf 'note\n' > "$WORK_DIR/note.txt"
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --file "$WORK_DIR/note.txt" --filename note.txt --type text/plain > "$TMP/n10.json"
  python3 - "$TMP/n10.json" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if "not an allowed image type" in str((o.get("result") or {}).get("message", "")) else 1)
PY
  printf '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n' > "$WORK_DIR/xss.svg"
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --file "$WORK_DIR/xss.svg" --filename xss.svg --type image/svg+xml > "$TMP/n10s.json"
  python3 - "$TMP/n10s.json" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if "not an allowed image type" in str((o.get("result") or {}).get("message", "")) else 1)
PY
}

ft_n_11() {
  printf 'not-a-jpeg' > "$WORK_DIR/bbtest-fake.jpg"
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --file "$WORK_DIR/bbtest-fake.jpg" --filename bbtest-fake.jpg > "$TMP/n11.json"
  python3 - "$TMP/n11.json" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if "file content is not a valid image" in str((o.get("result") or {}).get("message", "")) else 1)
PY
}

ft_n_12() {
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder '../etc' --file "$SEED_JPEG" --filename bbtest-upload.jpg > "$TMP/n12u.json"
  python3 - "$TMP/n12u.json" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
msg = str((o.get("result") or {}).get("message", ""))
ok = "valid folder" in msg or "Unauthorized" in msg
raise SystemExit(0 if ok else 1)
PY
  invoke_manage --action-id "$(action_id deleteImage)" --cookie "$(cookie_header)" \
    --image-path '../../etc/passwd' > "$TMP/n12d.json"
  [[ "$(manage_msg "$TMP/n12d.json")" == "Unauthorized file path." ]]
}

ft_p_11() {
  local names
  mkdir -p "$TMP"
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --file "$SEED_JPEG" --filename bbtest-upload.jpg > "$TMP/p11.json"
  [[ "$(manage_status "$TMP/p11.json")" == "success" ]] || return 1
  invalidate_pack
  curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/p11p" >/dev/null
  names="$(pack_names "$TMP/p11p.body")"
  [[ "$names" == *bbtest-upload.jpg* ]] || return 1
  invoke_manage --action-id "$(action_id deleteImage)" --cookie "$(cookie_header)" \
    --image-path '/images/brooches/bbtest-upload.jpg' > "$TMP/p11d.json"
  [[ "$(manage_status "$TMP/p11d.json")" == "success" ]] || return 1
  invalidate_pack
  curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/p11p2" >/dev/null
  names="$(pack_names "$TMP/p11p2.body")"
  [[ "$names" != *bbtest-upload.jpg* ]]
}

nft_res_lim_02() {
  local names http
  curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/lim02a" >/dev/null
  names="$(pack_names "$TMP/lim02a.body")"
  invoke_manage --action-id "$(action_id uploadImages)" --cookie "$(cookie_header)" \
    --folder brooches --filename bbtest-huge.jpg --oversize-mb 21 > "$TMP/lim02.json" || true
  http="$(manage_http "$TMP/lim02.json")"
  [[ "$http" != "200" ]] || [[ "$(manage_status "$TMP/lim02.json")" == "error" ]] || return 1
  invalidate_pack
  curl_save GET "$BASE_URL/api/gallery-pack?galleryId=brooches" "$TMP/lim02b" >/dev/null
  [[ "$(pack_names "$TMP/lim02b.body")" != *bbtest-huge.jpg* ]]
  [[ "$(pack_names "$TMP/lim02b.body")" == "$names" ]]
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

nft_res_03() {
  local image code nopw="http://127.0.0.1:13002"
  image="$(docker inspect -f '{{.Image}}' "${COMPOSE_PROJECT}-system-under-test-1")"
  [[ -n "$image" ]] || return 1
  docker rm -f dianych-bbtest-nopw >/dev/null 2>&1 || true
  docker run -d --name dianych-bbtest-nopw \
    -p 13002:3000 \
    -e NODE_ENV=production \
    -e SECRET_COOKIE_PASSWORD="$SECRET_COOKIE_PASSWORD" \
    --tmpfs /tmp:size=512m \
    --read-only \
    -u 1000:1000 \
    -v "$IMAGES_DIR:/app/public/images:ro" \
    "$image"
  wait_ready "$nopw" 120000 || return 1
  code="$(curl -sS -D "$TMP/r03.hdr" -o "$TMP/r03.body" -w '%{http_code}' \
    -X POST "$nopw/api/login" -F 'password=any-non-empty')"
  [[ "$code" == "500" ]] || return 1
  python3 - "$TMP/r03.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "An internal server error occurred." else 1)
PY
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$nopw/")"
  [[ "$code" == "200" ]] || return 1
  docker rm -f dianych-bbtest-nopw >/dev/null 2>&1 || true
}

nft_res_04() {
  local code loc
  rm -f "$WORK_DIR/old-cookies.txt"
  code="$(curl -sS -c "$WORK_DIR/old-cookies.txt" -D "$TMP/r04.hdr" -o "$TMP/r04.body" -w '%{http_code}' --max-redirs 0 \
    -X POST "$BASE_URL/api/login" -F "password=$TEST_PASSWORD" || true)"
  [[ "$code" == "307" || "$code" == "302" ]] || return 1
  export SECRET_COOKIE_PASSWORD="e2e-cookie-secret-rotated-32chars!!"
  docker compose -f "$COMPOSE_FILE" -p "$COMPOSE_PROJECT" up -d --force-recreate
  wait_ready "$BASE_URL" 120000 || return 1
  code="$(curl -sS -b "$WORK_DIR/old-cookies.txt" -D "$TMP/r04b.hdr" -o "$TMP/r04b.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "307" || "$code" == "302" || "$code" == "308" ]] || return 1
  loc="$(header_val "$TMP/r04b.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/login" else 1)
PY
  rm -f "$COOKIE_JAR"
  code="$(curl -sS -c "$COOKIE_JAR" -D "$TMP/r04c.hdr" -o "$TMP/r04c.body" -w '%{http_code}' --max-redirs 0 \
    -X POST "$BASE_URL/api/login" -F "password=$TEST_PASSWORD" || true)"
  [[ "$code" == "307" || "$code" == "302" ]] || return 1
  loc="$(header_val "$TMP/r04c.hdr" Location)"
  python3 - "$loc" <<'PY'
import sys
from urllib.parse import urlparse
p = urlparse(sys.argv[1])
raise SystemExit(0 if p.path.rstrip("/") == "/manage" else 1)
PY
  code="$(curl -sS -b "$COOKIE_JAR" -D "$TMP/r04d.hdr" -o "$TMP/r04d.body" -w '%{http_code}' --max-redirs 0 "$BASE_URL/manage" || true)"
  [[ "$code" == "200" ]]
}

nft_res_05() {
  local code
  code="$(curl -sS -o "$TMP/r05.body" -w '%{http_code}' -X POST "$BASE_URL/api/login" \
    -H 'X-Forwarded-For: 203.0.113.10' -F 'password=not-the-password')"
  [[ "$code" == "401" ]] || return 1
  python3 - "$TMP/r05.body" <<'PY'
import json, sys
o = json.load(open(sys.argv[1], encoding="utf-8"))
raise SystemExit(0 if o.get("message") == "Invalid password" else 1)
PY
}

nft_res_lim_03() {
  local end code w s
  end=$(( $(now_ms) + 300000 ))
  while [[ $(now_ms) -lt $end ]]; do
    for w in 256 384 512 640 828 1080 1200 1600 2000; do
      code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/image?galleryId=brooches&name=seed.jpg&width=$w")"
      [[ "$code" == "200" ]] || return 1
    done
    for s in 128 256 384 500 640 700; do
      code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/gallery-pack?galleryId=brooches&size=$s")"
      [[ "$code" == "200" ]] || return 1
    done
  done
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/")"
  [[ "$code" == "200" ]] || return 1
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/gallery-pack?galleryId=brooches")"
  [[ "$code" == "200" ]]
}

run_case "FT-P-01" "Five gallery ids" ft_p_01
run_case "FT-P-02" "Empty gallery no 500" ft_p_02
run_case "FT-P-03" "Default UA copy slots" ft_p_03
run_case "FT-P-04" "Default prices" ft_p_04
run_case "FT-N-01" "Login missing password" ft_n_01
run_case "FT-N-02" "Login wrong password" ft_n_02
run_case "FT-N-03" "Login rate limit" ft_n_03
run_case "NFT-SEC-03" "Rate limit (alias)" nft_alias_n03
run_case "NFT-RES-LIM-01" "Login window" nft_alias_n03
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
run_case "FT-N-08" "Bad folder upload" ft_n_08
run_case "FT-N-09" "Empty files upload" ft_n_09
run_case "FT-N-10" "Non-image upload" ft_n_10
run_case "FT-N-11" "Bad magic bytes" ft_n_11
run_case "FT-N-12" "Traversal upload/delete" ft_n_12
run_case "FT-P-11" "Upload visible to new visitor" ft_p_11
run_case "NFT-RES-LIM-02" "20MB upload body" nft_res_lim_02
run_case "FT-N-07" "Unauth mutations" ft_n_07
run_case "NFT-SEC-01" "Mutations require session" nft_sec_01
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
run_case "NFT-RES-03" "Missing pw.txt" nft_res_03
run_case "NFT-RES-04" "Session after recreate" nft_res_04
run_case "NFT-RES-05" "Rate-limit map reset" nft_res_05
run_case "NFT-RES-LIM-03" "Thumb cache soak" nft_res_lim_03

run_case "NFT-SEC-06" "Public pages no session" nft_sec_06

log "Passed=$PASS Failed=$FAIL Skipped=$SKIP"
log "Report: $REPORT"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
exit 0
