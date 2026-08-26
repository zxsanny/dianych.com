# Wire verification gaps

No inbound vendor webhooks, OAuth callbacks, or third-party request bodies.

Outbound integrations are browser navigations (`<a href>`), not parsed wire contracts.

| Entry | Status |
|-------|--------|
| Instagram / Telegram / TikTok / YouTube / Facebook / Etsy URLs | N/A — navigation only |
| Login form POST | first-party; fields `password` only |
| Prices JSON | first-party schema in `api/prices` |
| Gallery pack / image JSON | first-party |

No `Verify` rows remain for vendor wire formats.
