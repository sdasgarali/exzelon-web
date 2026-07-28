# Feature — Resume storage on Backblaze B2

Move resume file storage off MongoDB GridFS onto **Backblaze B2** via its **native API**
(chosen so the master application key works — B2's S3-compatible API rejects the master key).
Accepted types unchanged (PDF / DOC / DOCX, ≤2MB). Bucket is **private**; downloads are served as
short-lived **authorized URLs**.

## Why
Keep large binaries out of the app DB; offload download bandwidth from the Vercel function
(authorized URL → browser fetches straight from B2, sidestepping the ~4.5MB function response path).

## Config (env — secrets only in .env.local / Vercel)
- `B2_KEY_ID`, `B2_APPLICATION_KEY` — application key id + secret. **Master key is accepted** by the
  native API. Bucket must be private.
- `B2_BUCKET` — private bucket name. (No region/endpoint — `b2_authorize_account` returns them.)

## Design
- `src/lib/storage/b2.ts` — native B2 API over `fetch`, with cached auth token (23h) + bucketId.
  - `authorize()` → `b2_authorize_account` (Basic keyId:appKey) → apiUrl/downloadUrl/token/accountId.
  - `uploadResumeToB2(buf, {filename,contentType,ownerUserId})` → `b2_get_upload_url` → POST bytes with
    `X-Bz-Content-Sha1`; **flat** key `resume_<uuid>.<ext>` (no "/" → slots into `/api/files/resume/[id]`);
    bakes in Content-Type + inline `b2-content-disposition` so downloads render. One retry on 401/503.
  - `getResumeDownloadUrl(key)` → `b2_get_download_authorization` (60s, prefix-scoped) → `downloadUrl/file/<bucket>/<key>?Authorization=…`.
  - `deleteResumeFromB2(key)` → `b2_list_file_names` (find fileId) → `b2_delete_file_version`.
  - `isB2Configured()`, `isLegacyGridfsId(id)`.
- `profile.resumeFileId` (and the application snapshot) now hold the **B2 key** instead of a GridFS id.
  Authorization is unchanged — it compares the stored id against the requested id.
- **Backward compatible:** any legacy 24-hex GridFS id still streams from GridFS (upload/delete/download
  branch on `isLegacyGridfsId`). New uploads always go to B2.

## Routes
- `POST /api/account/resume` — 503 if B2 unconfigured; else validate (type/size/auth) → upload to B2 →
  store key; delete previous file (B2 or legacy GridFS).
- `DELETE /api/account/resume` — delete from the right backend + clear fields.
- `GET /api/files/resume/[id]` — authorize (admin / owner-seeker / job-owning-employer), then:
  legacy GridFS → stream bytes; B2 → **302 redirect** to a 60s presigned URL.

## Security
- Bucket private; objects never public. Presigned URLs are short-lived (60s) and only minted after
  our authorization check passes.
- Master key must NOT be used; the one shared in chat should be regenerated. Use a bucket-scoped key.

## Known limits / future
- Upload flows through the function, but the 2MB cap sits well under Vercel's ~4.5MB request limit,
  so that's a non-issue. Client-side size guard rejects >2MB before the request even leaves the browser.

## Verification
- `npm run lint` + `npx tsc --noEmit` + `npm run build` green.
- Live (once env set): login as seeker → upload PDF → 200; GET → 302 to B2 presigned URL → PDF opens;
  wrong type → 422; unauth → 401; delete → 200; legacy GridFS id still downloads.
