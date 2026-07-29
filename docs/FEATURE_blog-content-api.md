# Feature — Blog Content API v1 (AccessHub Pro integration)

**Goal:** Let AccessHub Pro (or any external system) **list, read, create, edit, publish, and
delete** Exzelon blog posts over an authenticated REST API — the write-capable sibling of the
read-only analytics pull API (`/api/v1/analytics`).

## Auth — scoped API keys
Reuses the existing `analyticsApiKeys` collection + minting UI, extended with **scopes**:
- `AnalyticsApiKeyDoc.scopes?: string[]` — values: `analytics:read`, `posts:read`, `posts:write`.
- **Backward-compatible:** a key with no `scopes` is treated as `["analytics:read"]`, so existing
  AccessHub analytics keys keep working and do **not** silently gain blog-write.
- Admin chooses scopes when minting (checkboxes on `/admin/api-keys`).
- `validateApiKey(rawKey)` → `{ name, scopes }`. Shared guard `src/lib/auth/api-key.ts`
  `requireApiKey(req, scope)` → `{ key }` | `{ error: NextResponse }` (401 missing/invalid,
  403 missing scope). CORS headers on every response.
- `/api/v1/analytics` now requires `analytics:read` (satisfied by the default scope).

## Endpoints (all `Authorization: Bearer <key>`, CORS-enabled, `OPTIONS` preflight)
| Method | Path | Scope | Purpose |
|---|---|---|---|
| GET | `/api/v1/posts?status=&q=&page=&limit=` | `posts:read` | List posts (all statuses by default) |
| POST | `/api/v1/posts` | `posts:write` | Create a post |
| GET | `/api/v1/posts/{slug}` | `posts:read` | Read one post (full body) |
| PUT | `/api/v1/posts/{slug}` | `posts:write` | Full update |
| PATCH | `/api/v1/posts/{slug}` | `posts:write` | Partial update (e.g. publish toggle) |
| DELETE | `/api/v1/posts/{slug}` | `posts:write` | Delete |

### Request body (POST/PUT full; PATCH any subset)
`title, excerpt, category, body, coverImageUrl?, author?, status?("draft"|"published"), featured?`
— validated by `postSchema` (PUT/POST) / `postSchema.partial()` (PATCH). `body` is markdown-lite
(same renderer as the site). Slug is derived from the title on create and is **immutable** after
(AccessHub edits by slug). `readingTime` is auto-derived; `publishedAt` is stamped on first publish.

### Response shape (snake_case, mirrors the analytics contract)
```json
{
  "post": {
    "slug": "…", "title": "…", "excerpt": "…", "category": "…", "body": "…",
    "cover_image_url": null, "author": "…", "reading_time": "6 min read",
    "status": "published", "featured": false,
    "published_at": "2026-…Z", "created_at": "…Z", "updated_at": "…Z",
    "url": "https://www.exzelon.com/resources/blog/…"
  }
}
```
List → `{ "posts": [ … ], "meta": { total, page, per_page, count, generated_at } }`.

## Files
- `src/lib/db/models.ts` — `scopes?: string[]` on `AnalyticsApiKeyDoc`.
- `src/lib/db/repo.ts` — `createAnalyticsApiKey(name, scopes)`, `validateApiKey`, key `scopes`
  surfaced in `PublicApiKey`; `insertPost` (refactor), `apiListPosts`, `apiGetPost`,
  `apiCreatePost`, `apiUpdatePost`, `toApiPost`, `ApiPost` type. (`deletePost` reused.)
- `src/lib/auth/api-key.ts` — `requireApiKey(req, scope)` + `API_CORS`.
- `src/app/api/v1/posts/route.ts` — `GET` (list) + `POST` (create) + `OPTIONS`.
- `src/app/api/v1/posts/[slug]/route.ts` — `GET`/`PUT`/`PATCH`/`DELETE` + `OPTIONS`.
- `src/app/api/v1/analytics/route.ts` — require `analytics:read`.
- `src/app/api/admin/api-keys/route.ts` — accept `scopes` on POST.
- `src/components/dashboard/api-keys-manager.tsx` — scope checkboxes, scopes column,
  Blog-API connection panel.
- `src/app/admin/api-keys/page.tsx` — pass posts endpoint + copy.

## Verification
`lint` + `tsc` + `build` green. E2E with a real minted key: mint key w/ posts scopes → list
(200) → create (201) → read (200) → patch publish (200, appears on public site) → put (200) →
delete (200) → gone (404). Scope enforcement: analytics-only key → 403 on posts:write.
Missing/invalid key → 401. Then verify live after deploy.
