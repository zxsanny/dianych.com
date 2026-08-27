# Security Tests

### NFT-SEC-01: Mutations require a session

**Summary**: Missing cookie cannot change prices, files, or pack cache.
**Traces to**: AC-IR-03, AC-PRICE-02, AC-INV-01

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | Record `GET /api/prices` and pack names for `brooches` | baselines stored |
| 2 | `POST /api/prices` no cookie | 401 `Unauthorized`; GET prices = baseline |
| 3 | Upload and delete forms no cookie | `Unauthorized.`; pack names = baseline |
| 4 | `POST /api/gallery-pack/invalidate` no cookie | 401 `{error:'Unauthorized'}` |

**Pass criteria**: all writes rejected; GET prices and pack name set unchanged.

### NFT-SEC-02: Path traversal on image and delete

**Summary**: Allow-list and safe filename block other-path reads and unlinks.
**Traces to**: AC-IR-02, AC-IR-06, AC-IMG-03

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | `GET /api/image?galleryId=brooches&name=../x` | 400 `{error:'Invalid parameters'}` |
| 2 | `GET /api/image?galleryId=not-a-gallery&name=x.jpg` | 400 `{error:'Invalid parameters'}` or invalid gallery |
| 3 | Logged-in delete `imagePath=../../etc/passwd` | `{status:'error', message:'Unauthorized file path.'}` |
| 4 | Logged-in upload `folder=../etc` | error; pack names for the five galleries unchanged |

**Pass criteria**: 400 / documented error objects; no 200 image body for traversal names.

### NFT-SEC-03: Login rate limit per IP

**Summary**: Sixth failed login from one IP is 429.
**Traces to**: AC-AUTH-03

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | Six `POST /api/login` wrong password, `X-Forwarded-For: 203.0.113.10` | 5× 401 then 429 containing `Too many login attempts` |

**Pass criteria**: same as FT-N-03 (may share one execution).

### NFT-SEC-04: Manage page is session-gated

**Summary**: Unauthenticated `/manage` never returns the CMS document.
**Traces to**: AC-AUTH-04

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | `GET /manage` no cookie | redirect `/login` |
| 2 | Response body of the manage GET (no follow) | not the «Менеджмент секцій» page |

**Pass criteria**: Location path `/login`; status is a redirect.

### NFT-SEC-05: Pack invalidate is authenticated

**Summary**: Invalidate without session is 401.
**Traces to**: AC-INV-01

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | `POST /api/gallery-pack/invalidate` no cookie | 401 `{error:'Unauthorized'}` |

**Pass criteria**: exact status and JSON.

### NFT-SEC-06: Public pages do not set a logged-in manage session

**Summary**: Visiting `/` or `/login` does not grant `/manage`.
**Traces to**: AC-AUTH-04, AC-AUTH-05

**Steps**:

| Step | Consumer Action | Expected Response |
|------|----------------|------------------|
| 1 | `GET /` then `GET /login` | 200 |
| 2 | `GET /manage` with any cookies from step 1 | redirect `/login` |

**Pass criteria**: no manage 200 from public navigation alone.
