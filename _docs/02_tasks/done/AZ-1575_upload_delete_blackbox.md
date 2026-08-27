# Upload and delete blackbox

**Task**: AZ-1575_upload_delete_blackbox
**Name**: Upload and delete blackbox
**Description**: Cover folder/type/magic/traversal rejects and happy-path filename visibility
**Complexity**: 5 points
**Dependencies**: AZ-1570_test_infrastructure, AZ-1572_auth_blackbox
**Component**: Blackbox Tests
**Tracker**: AZ-1575
**Epic**: AZ-1569

## Problem

Admin uploads must reject unsafe folders and bytes; a successful upload must show up to a new visitor.

## Outcome

- Scenarios PASS: FT-P-11, FT-N-08, FT-N-09, FT-N-10, FT-N-11, FT-N-12, NFT-RES-LIM-02

## Scope

### Included
- Manage upload/delete forms with an isolated session
- Filename prefix `bbtest-` and cleanup
- Body over 20 MB reject (NFT-RES-LIM-02)

### Excluded
- Production galleries

## Acceptance Criteria

**AC-1: Rejects**
Given a logged-in isolated session
When folder is `frames`, files are empty, type is `note.txt`, bytes are fake JPEG, or path has `../`
Then the documented error objects and no escape outside allow-listed galleries (FT-N-08–12)

**AC-2: Happy path**
Given a valid JPEG `bbtest-upload.jpg` to `brooches`
When upload completes
Then a new visitor pack lists that name; delete removes it (FT-P-11)

**AC-3: Size limit**
Given a body > 20 MB
When upload is submitted
Then not a success form and pack gains no new `bbtest-` name (NFT-RES-LIM-02)

## System Under Test Boundary

Real manage forms against the isolated SUT. Compare to `results_report.md` Upload #2–8. Observe via pack JSON, not by listing the volume.

## Blackbox Tests

| AC Ref | What to Test | Expected Behavior |
|--------|-------------|-------------------|
| AC-1 | FT-N-08–12 | documented errors |
| AC-2 | FT-P-11 | name in then out of pack |
| AC-3 | NFT-RES-LIM-02 | reject oversize |
