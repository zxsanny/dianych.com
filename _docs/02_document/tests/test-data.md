# Test Data Management

## Seed Data Sets

| Data Set | Description | Used by Tests | How Loaded | Cleanup |
|----------|-------------|---------------|-----------|---------|
| DS-EMPTY-PRICES | No prices file at SUT runtime path | FT-P-04, NFT-RES-02 | Start SUT with file absent (or rename aside) | Restore previous file if one existed |
| DS-DEFAULT-PRICES | `{450,500,600,700}` | SM-02, NFT-PERF-04 | `expected_results/default_frame_prices.json` as the on-disk file, or omit file | Optional restore |
| DS-POST-PRICES | Four finite ≥ 0 numbers, e.g. `{111,222,333,444}` | FT-P-05, FT-P-06, FT-N-06 | JSON body of `POST /api/prices` | POST original values back |
| DS-WRONG-PASSWORD | Any string that is not the live admin password | FT-N-02, FT-N-03, NFT-SEC-03 | Inline `not-the-password` | none |
| DS-EMPTY-PASSWORD | Empty / omitted `password` field | FT-N-01 | Inline | none |
| DS-ADMIN-PASSWORD | Value of env `TEST_ADMIN_PASSWORD` matching SUT `pw.txt` | FT-P-05–07, FT-P-11, FT-N-06, FT-N-08–12, NFT-SEC-01 | Env only — never a file in `_docs/` | Session cookie discarded; optional logout |
| DS-VALID-JPEG | Minimal valid JPEG bytes, filename `bbtest-upload.jpg` | FT-P-11, FT-N-08 (contrast) | Generated at run time (JFIF SOI) or fixture file under `input_data/` when added | Delete via manage form |
| DS-NOTE-TXT | `note.txt` with plain text | FT-N-10 | Inline bytes | none (rejected) |
| DS-FAKE-JPEG | Filename `bbtest-fake.jpg`, body `not-a-jpeg` | FT-N-11 | Inline bytes | none (rejected) |
| DS-TRAVERSAL | folder `../etc`, name `../x`, `imagePath` `../../etc/passwd` | FT-N-12, FT-N-15, NFT-SEC-02 | Inline strings | Assert no file created outside galleries |
| DS-BAD-FOLDER | folder `frames` (not a gallery id) | FT-N-08 | Inline | none |
| DS-GALLERY-IDS | `{brooches, clothes, panel, felting, kits}` | FT-P-01, FT-N-13 | Inline allow-list | none |
| DS-EMPTY-GALLERY | One allow-listed folder missing or empty (prefer `kits`) | FT-P-02, NFT-RES-01 | Fixture volume / isolated image dir | Restore if local live dirs were copied |
| DS-KNOWN-IMAGE | One existing filename in `brooches` (from pack listing) | FT-P-08–10, FT-N-14–15 | Discovered via `GET /api/gallery-pack?galleryId=brooches` | none |
| DS-LOCALE-PAIRS | UA/EN strings in the mapping below | FT-P-03 | Inline | none |

## Data Isolation Strategy

Each suite run uses one SUT process. Tests that mutate prices or galleries restore state. Rate-limit tests use a dedicated `X-Forwarded-For` value (`203.0.113.10`) unused by other cases. Production smoke is read-only. Do not share a live production `TEST_ADMIN_PASSWORD` session with fixture uploads.

## Input Data Mapping

| Input Data File | Source Location | Description | Covers Scenarios |
|-----------------|----------------|-------------|-----------------|
| `data_parameters.md` | `_docs/00_problem/input_data/data_parameters.md` | Gallery ids, price fields, query defaults | FT-P-01, FT-P-04–06, FT-P-08–09, FT-N-* |
| `default_frame_prices.json` | `_docs/00_problem/input_data/expected_results/default_frame_prices.json` | Default four prices | FT-P-04, SM-02 |
| `results_report.md` | `_docs/00_problem/input_data/expected_results/results_report.md` | Status/message pairs | all FT-* with a mapping row |
| (env) `TEST_ADMIN_PASSWORD` | operator env | Correct password; not a repo file | FT-P-05–07, FT-P-11, authenticated negatives |
| (runtime) valid JPEG | generated | Happy-path upload | FT-P-11 |

## Locale pair expected set (AC-F1-03)

Same control slots; click UA vs EN on `/`. Minimum pairs (from public copy):

| Slot | UA | EN |
|------|----|----|
| tagline | Портрети домашніх улюбленців | Pet Portraits |
| tile embroidery | Вишивка | Embroidery |
| tile frames | Рамки | Frames |
| tile felting | Валяння | Felting |
| tile kits | Схеми / набори | Schemes / Kits |
| contacts CTA | Показати Всі Контакти | Show All Contacts |
| order embroidery | Замовити вишивку | Order Embroidery |
| contact heading | Контактна інформація | Contacts |

## Expected Results Mapping

| Test Scenario ID | Input Data | Expected Result | Comparison Method | Tolerance | Expected Result Source |
|-----------------|------------|-----------------|-------------------|-----------|----------------------|
| FT-P-01 | GET `/` | HTML contains `id` attributes for `brooches`, `clothes`, `panel`, `felting`, `kits` | set_contains | N/A | AC-F1-02; listing gap #2 is live files, not ids |
| FT-P-02 | GET `/` with one gallery empty | status 200; that section omitted or empty; no 500 | exact (status) | N/A | results_report Listing #1; AC-F1-01 |
| FT-P-03 | UA then EN toggle | each pair in the locale table appears in the matching locale | exact (strings) | N/A | AC-F1-03 + UI inventory copy |
| FT-P-04 | GET `/api/prices`, prices file missing | `{smallFrame8:450,smallFrame10:500,mediumFrame14:600,largeFrame19:700}` | file_reference | N/A | `default_frame_prices.json` |
| FT-P-05 | POST `/api/prices` logged in, DS-POST-PRICES | 200, body equals posted object | exact | N/A | results_report Prices #4 |
| FT-P-06 | GET `/api/prices` after FT-P-05 | same four numbers | exact | N/A | results_report Prices #4 (IR-04) |
| FT-P-07 | POST `/api/login` + `TEST_ADMIN_PASSWORD` | 302/307, Location path `/manage`, `Set-Cookie` includes `dianych-manage-session` | exact (path + cookie name) | N/A | AC-AUTH-05; results_report Auth #5 was UNKNOWN — this row is the fill |
| FT-P-08 | GET `/api/gallery-pack?galleryId=brooches` (no `size`) | JSON `width` === 500 | exact | N/A | results_report Image #4 |
| FT-P-09 | GET `/api/image` with valid gallery+name, no `width` | JSON `width` === 1600 | exact | N/A | AC-IMG-05 |
| FT-P-10 | GET pack or image (cache hit or miss) | `Cache-Control: public, max-age=300, s-maxage=300` | exact | N/A | results_report Image #7 |
| FT-P-11 | upload `bbtest-upload.jpg` to `brooches`, then GET pack as new visitor | `images[].name` contains `bbtest-upload.jpg` | set_contains | N/A | AC-IR-01; results_report Upload #8 was UNKNOWN — filename set is the fill |
| FT-P-12 | POST `/api/logout` then GET `/manage` | logout body `Logged out`; manage redirects to `/login` | exact / substring | N/A | security_approach logout |
| FT-N-01 | POST `/api/login` empty password | 400, `Password is required` | exact | N/A | results_report Auth #1 |
| FT-N-02 | POST `/api/login` wrong password | 401, `Invalid password` | exact | N/A | results_report Auth #2 |
| FT-N-03 | 6th POST `/api/login` same IP in 15 min | 429, message contains `Too many login attempts` | exact + substring | N/A | results_report Auth #3 |
| FT-N-04 | GET `/manage` no cookie | redirect Location path `/login` | exact | N/A | results_report Auth #4 |
| FT-N-05 | POST `/api/prices` no session | 401, `Unauthorized` | exact | N/A | results_report Prices #2 |
| FT-N-06 | POST `/api/prices` logged in, any price `< 0` or non-finite | 400, `All prices must be non-negative numbers.` | exact | N/A | results_report Prices #3 |
| FT-N-07 | upload / delete / invalidate without cookie | upload/delete `{status:'error', message:'Unauthorized.'}`; invalidate 401 `{error:'Unauthorized'}` | exact | N/A | results_report Upload #1, Image #6 |
| FT-N-08 | upload folder `frames`, logged in | `{status:'error', message:'Please select a valid folder.'}` | exact | N/A | results_report Upload #2 |
| FT-N-09 | upload empty files, logged in | `{status:'error', message:'Please select at least one file to upload.'}` | exact | N/A | results_report Upload #3 |
| FT-N-10 | upload `note.txt`, logged in | message contains `not an allowed image type` | substring | N/A | results_report Upload #4 |
| FT-N-11 | upload fake JPEG, logged in | message contains `file content is not a valid image` | substring | N/A | results_report Upload #5 |
| FT-N-12 | delete `../../etc/passwd` or upload `../` folder | `{status:'error', message:'Unauthorized file path.'}` or valid-folder error; no file outside `/images/<gallery>/` | exact + set_contains (absence) | N/A | results_report Upload #6 |
| FT-N-13 | GET `/api/gallery-pack` missing/invalid `galleryId` | 400, `{error:'Invalid galleryId'}` | exact | N/A | results_report Image #1 |
| FT-N-14 | GET `/api/image` missing `galleryId` or `name` | 400, `{error:'galleryId and name are required'}` | exact | N/A | results_report Image #2 |
| FT-N-15 | GET `/api/image?galleryId=brooches&name=../x` | 400, `{error:'Invalid parameters'}` | exact | N/A | results_report Image #3 |
| FT-N-16 | GET `/api/image` other-path name | 400, no other-path bytes | exact | N/A | AC-IR-06 |
| SM-01 | GET `/` | 200 | exact | N/A | F1 smoke |
| SM-02 | GET `/api/prices` | four numeric keys present | set_contains | N/A | `default_frame_prices.json` keys |
| SM-03 | GET `/login` | 200 | exact | N/A | F3 smoke |
| SM-04 | GET `/manage` no session | redirect `/login` | exact | N/A | results_report Auth #4 |
| SM-05 | prod: same filename via app vs `/images/` | equal Content-Length or digest | exact | N/A | AC-IR-08 (ops) |
| NFT-PERF-01 | GET `/` | TTFB ≤ 3000 ms after one warm-up | threshold_max | ≤ 3000 ms | test-spec threshold (no product SLO) |
| NFT-PERF-02 | GET pack `galleryId=brooches&size=400` | p95 ≤ 5000 ms first; ≤ 800 ms after warm-up | threshold_max | see perf file | test-spec threshold |
| NFT-PERF-03 | GET `/api/image` known file `width=1200` | p95 ≤ 5000 ms first; ≤ 800 ms warm | threshold_max | see perf file | test-spec threshold |
| NFT-PERF-04 | GET `/api/prices` | p95 ≤ 300 ms | threshold_max | ≤ 300 ms | test-spec threshold |
| NFT-RES-01 | missing/empty gallery dir | same as FT-P-02 | exact | N/A | Listing #1 |
| NFT-RES-02 | missing prices file | same as FT-P-04 | file_reference | N/A | Prices #1 |
| NFT-RES-03 | SUT without `pw.txt` | POST login → 500, message `An internal server error occurred.` | exact | N/A | login catch path |
| NFT-RES-04 | container recreate; old cookie | GET `/manage` redirects `/login`; current `TEST_ADMIN_PASSWORD` still logs in | exact | N/A | AC-IR-05 |
| NFT-RES-05 | process restart after 5 failures | next wrong-password login is 401 not 429 | exact | N/A | in-process limit map |
| NFT-SEC-01 | unauth POST prices / invalidate / upload | 401 / Unauthorized; prices GET unchanged | exact | N/A | IR-03 |
| NFT-SEC-02 | traversal on image + delete | 400 / error; no escape | exact | N/A | IR-02, IR-06 |
| NFT-SEC-03 | 6 login attempts | 429 | exact | N/A | Auth #3 |
| NFT-SEC-04 | `/manage` without cookie | `/login` | exact | N/A | Auth #4 |
| NFT-SEC-05 | POST invalidate no session | 401 `{error:'Unauthorized'}` | exact | N/A | Image #6 |
| NFT-RES-LIM-01 | 6th login | 429 | exact | N/A | Auth #3 |
| NFT-RES-LIM-02 | upload body > 20 MB | reject (4xx/5xx), no new `bbtest-` name in pack | threshold_max (size) | 20 MB | RESTRICT-OPS-07 |
| NFT-RES-LIM-03 | thumb cache toward 500 MB | process stays up; later pack/image still 200 | exact (status) | N/A | RESTRICT-HW-05 |

## External Dependency Mocks

| External Service | Mock/Stub | How Provided | Behavior |
|-----------------|-----------|-------------|----------|
| Instagram / Telegram / TikTok / YouTube / Facebook / Etsy | none | not called | Order CTAs are links; consumer does not follow |
| docker.azaion.com | none | container tests use a locally built image | pull not required for local suite |
| Let's Encrypt | none | prod smoke assumes existing TLS | GET `https://dianych.com` only |

## Data Validation Rules

| Data Type | Validation | Invalid Examples | Expected System Behavior |
|-----------|-----------|-----------------|------------------------|
| password | non-empty string | omitted, `""` | 400 `Password is required` |
| password | bcrypt match vs `pw.txt` | wrong string | 401 `Invalid password` |
| galleryId / folder | one of five ids | `frames`, `../x`, empty | 400 / valid-folder error |
| filename / name | `[a-zA-Z0-9._-]` + image ext | `../x`, `note.txt` | 400 or type error |
| file bytes | magic bytes or SVG head | `.jpg` with text | `file content is not a valid image` |
| prices | four finite numbers ≥ 0 | `-1`, `NaN` | 400 |
| image `width` | omitted → 1600, clamp to allow-list | omitted | JSON `width` 1600 |
| pack `size` | omitted → 500 | omitted | JSON `width` 500 |

## Phase 3 validation

No scenarios removed. Input/output rows all have inline or reference expected results (`results_report.md`, `default_frame_prices.json`, or env/isolated-SUT password). Behavioral rows (NFT-RES-04/05, NFT-RES-LIM-03) have numeric/status criteria.

| # | Test Scenario ID | Shape | Input Provided? | Expected Result Provided? |
|---|------------------|-------|-----------------|---------------------------|
| 1–12 | FT-P-01–12 | I/O | Yes | Yes |
| 13–28 | FT-N-01–16 | I/O | Yes | Yes |
| 29–33 | SM-01–05 | I/O | Yes | Yes |
| 34–37 | NFT-PERF-01–04 | I/O (threshold) | Yes | Yes |
| 38–40 | NFT-RES-01–03 | I/O | Yes | Yes |
| 41–42 | NFT-RES-04–05 | Behavioral | Yes (trigger) | Yes |
| 43–48 | NFT-SEC-01–06 | I/O | Yes | Yes |
| 49–51 | NFT-RES-LIM-01–03 | I/O / behavioral | Yes | Yes |

Authenticated writes use an isolated SUT password created by `scripts/run-tests.sh`, or operator `TEST_ADMIN_PASSWORD` against a non-prod instance. Never commit the live admin password.
