# Resource Limit Tests

### NFT-RES-LIM-01: Login attempt window

**Summary**: More than five login posts from one IP inside 15 minutes are refused.
**Traces to**: AC-AUTH-03, RESTRICT (abuse control)

**Preconditions**:
- Dedicated `X-Forwarded-For: 203.0.113.10`
- Do not interleave other tests on that IP

**Monitoring**:
- HTTP status of each POST `/api/login`

**Duration**: < 15s (six requests; do not wait the 15-minute window)
**Pass criteria**: request 6 status 429; message contains `Too many login attempts`.

### NFT-RES-LIM-02: Server Actions body 20 MB

**Summary**: An upload larger than the Next serverActions body limit is rejected and does not appear in the pack.
**Traces to**: RESTRICT-OPS-07

**Preconditions**:
- Logged-in session
- Consumer can POST a multipart body > 20 MB (e.g. 21 MB JPEG-shaped payload) to the manage upload form
- Isolated SUT (not production)

**Monitoring**:
- HTTP status of the upload
- `GET /api/gallery-pack?galleryId=brooches` name set before vs after

**Duration**: single request (transfer time depends on link; cap 120s)
**Pass criteria**: status 4xx or 5xx (not 200 success form); pack name set does not gain a new `bbtest-` file. Nginx 300M is host-only and is not asserted in local `next dev`.

### NFT-RES-LIM-03: Thumb cache stays within 500 MB without process death

**Summary**: Repeated pack/image generation does not kill the SUT; later requests still succeed.
**Traces to**: RESTRICT-HW-05

**Preconditions**:
- At least one real image in a gallery (DS-KNOWN-IMAGE)
- Local or container SUT with `/tmp` available

**Monitoring**:
- Process still listening
- Status of pack/image GETs
- Optional: container `/tmp` usage if `SUT_MODE=container` (tmpfs 512m, RESTRICT-HW-04)

**Duration**: 5 minutes of repeated GETs across clamp widths `{256,384,512,640,828,1080,1200,1600,2000}` for one file, plus pack sizes `{128,256,384,500,640,700}`
**Pass criteria**: SUT still returns 200 for `GET /` and a final pack GET; no crash. Exact 500 MB eviction is not observable over HTTP — do not fail if disk usage cannot be measured from the consumer. Container tmpfs 512m: process remains up (no OOM kill).
