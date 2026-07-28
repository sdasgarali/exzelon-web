# Feature — Resume storage on Backblaze B2

Move resume file storage off MongoDB GridFS onto **Backblaze B2** (S3-compatible API).
Accepted types unchanged (PDF / DOC / DOCX, ≤5MB). Bucket is **private**; downloads are
served as short-lived **presigned URLs**.

## Why
Keep large binaries out of the app DB; offload download bandwidth from the Vercel function
(presigned URL → browser fetches straight from B2, sidestepping the ~4.5MB function response path).

## Config (env — secrets only in .env.local / Vercel)
- `B2_KEY_ID`, `B2_APPLICATION_KEY` — a **bucket-scoped** application key (listFiles, readFiles,
  writeFiles, deleteFiles, shareFiles). **Not** the master key.
- `B2_BUCKET` — private bucket name.
- `B2_REGION` — e.g. `us-west-004`.
- `B2_ENDPOINT` — optional; defaults to `https://s3.<region>.backblazeb2.com`.

## Design
- `src/lib/storage/b2.ts` — `S3Client` (cached) pointed at the B2 endpoint.
  - `uploadResumeToB2(buf, {filename,contentType,ownerUserId})` → **flat** key `resume_<uuid>.<ext>`
    (no "/" so it slots into the existing `/api/files/resume/[id]` segment). Sets `ContentType` +
    inline `ContentDisposition` at PUT so presigned GETs render correctly.
  - `getResumeDownloadUrl(key)` → presigned GET, 60s TTL.
  - `deleteResumeFromB2(key)`, `isB2Configured()`, `isLegacyGridfsId(id)`.
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
- Upload still flows through the function → Vercel's ~4.5MB request cap applies (most resumes are
  <1MB). A future presigned-PUT (browser → B2 direct) would lift that to the full 5MB.

## Verification
- `npm run lint` + `npx tsc --noEmit` + `npm run build` green.
- Live (once env set): login as seeker → upload PDF → 200; GET → 302 to B2 presigned URL → PDF opens;
  wrong type → 422; unauth → 401; delete → 200; legacy GridFS id still downloads.
