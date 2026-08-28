# Loop 1 smoke — proposed checks

LOCAL_URL: http://localhost:3000
Branch: main (short loop, no worktree)

## Perform these checks in the open browser (or via curl)

- [ ] Storefront `/` loads the five galleries (no 500)
- [ ] `GET /manage` without login redirects to `/login`
- [ ] Response includes `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY`
- [ ] Login with a valid password still reaches `/manage` (if you have `pw.txt`)
- [ ] A `.svg` upload on manage is rejected as not an allowed image type

## Notes

Credentials: local `pw.txt` / `TEST_ADMIN_PASSWORD` — do not paste the password here.
