# Feature — Analytics pull API (AccessHub-compatible) + admin key management

## Goal
Expose an Exzelon analytics API that **AccessHub Pro can pull** (Connect API / `pullUrl`), matching the
neuraforz-web contract exactly, plus an **admin page** to mint/copy/revoke the API key. User then pastes
the endpoint URL + key into AccessHub → AccessHub syncs Exzelon's daily visitor stats.

## The contract AccessHub expects (must match)
- Request: `GET {pullUrl}?source={externalSource}&days={N}` with `Authorization: Bearer {key}`.
- Response: `{ daily: [ { date, page_views, unique_visitors, consented } ], totals, sources, meta }`.
  AccessHub only reads `daily[]` (flexible field names). We return neuraforz's full shape for parity.
- Source key for Exzelon: **`exz-web`** (matches the tracker `data-source`).
- Endpoint URL to paste into AccessHub: `https://www.exzelon.com/api/v1/analytics`.

## Data (MongoDB — new collections)
- `visitorLogs`: `{ sessionId, source, pagePath, ipHash, userAgent, consentStatus:'pending'|'accepted'|'declined',
  visitCount, firstSeenAt, lastSeenAt }` — unique index `(sessionId, source)`. ipHash = sha256(ip).slice(0,16).
- `visitorDailyStats`: `{ day:'YYYY-MM-DD', source, totalVisits, uniqueVisitors, consentedCount }` —
  unique index `(day, source)`.
- `analyticsApiKeys`: `{ name, keyHash(sha256), keyPreview, active, createdAt, lastUsedAt }` — unique `keyHash`.

## Endpoints
- **`POST /api/analytics/track`** (CORS *) — body `{ sessionId, path, source?, referrer?, consent? }`.
  Upserts `visitorLogs` (new session → daily.uniqueVisitors++), always daily.totalVisits++, consent=1 →
  consentStatus='accepted' + daily.consentedCount++ (once per session). Returns `{ ok:true }`. Never throws.
- **`GET /api/v1/analytics?days=N&source=`** (CORS *) — `Authorization: Bearer <key>` → sha256 → match
  `analyticsApiKeys.keyHash` (active). Returns `{ api_key_name, totals{all_time_visitors, today_unique,
  today_pageviews, consented_users}, daily[], sources[], meta }`. 401 on missing/invalid. Updates lastUsedAt.
- **Admin (seeker/employer blocked, admin only):** `GET /api/admin/api-keys` (list, no hashes),
  `POST /api/admin/api-keys` `{name}` → returns `{ key, rawKey }` (raw shown ONCE, format `exz_<64hex>`),
  `DELETE /api/admin/api-keys/[id]` (soft-delete active=false).

## Client tracker (same-origin → no CORP issue)
- `components/analytics/visitor-tracker.tsx` — client component in the `(site)` layout (or root). Generates a
  stable `localStorage` sessionId (`exz_session`), reads the consent cookie (`exz_cookie_notice`) for the
  consent flag, and POSTs `/api/analytics/track` on each route change. Silent-fail. Respects existing setup.

## Admin page (the "admin page" ask)
- New `/admin/api-keys` (added to the admin sidebar): "Analytics API / Integrations".
  - Shows the ready-to-paste endpoint URL (`.../api/v1/analytics`) + source (`exz-web`).
  - "Generate key" → modal reveals `rawKey` once with copy button + step-by-step "paste into AccessHub
    Connect API (URL + Source + Key)".
  - Lists existing keys (name, preview, created, lastUsed) with Revoke.
- Optionally surface live visitor totals on `/admin/analytics` (from visitorDailyStats).

## Security / parity notes
- Raw keys never stored (sha256 only); shown once. Admin-guarded key mgmt. CORS `*` only on the public
  analytics + track routes (read-only aggregates + write-only beacon), matching neuraforz.
- Same-origin tracker avoids the CORP block that stopped the AccessHub push tracker.

## Verification
- lint + tsc + build green. Live: track beacon writes; `curl -H "Authorization: Bearer <key>"
  ".../api/v1/analytics?days=30&source=exz-web"` returns the `daily` shape; AccessHub Connect API syncs.
