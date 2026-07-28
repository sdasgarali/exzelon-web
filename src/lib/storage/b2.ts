import "server-only";
import { randomUUID, createHash } from "crypto";
import { ALLOWED_RESUME_TYPES } from "@/lib/db/files";

/**
 * Resume file storage on Backblaze B2 via its NATIVE API (works with the master
 * application key, which the S3-compatible API rejects). Bucket is PRIVATE — uploads
 * go through our API (auth + validation); downloads are 60s prefix-scoped authorized
 * URLs the browser fetches straight from B2 (bytes never pass through the function).
 *
 * Env (secrets only in .env.local / Vercel):
 *   B2_KEY_ID, B2_APPLICATION_KEY — application key id + secret (master key is fine here)
 *   B2_BUCKET                     — private bucket NAME
 */

const DOWNLOAD_URL_TTL_SECONDS = 60;
const AUTH_TTL_MS = 23 * 60 * 60 * 1000; // re-auth well within B2's 24h token life

export function isB2Configured(): boolean {
  return Boolean(process.env.B2_KEY_ID && process.env.B2_APPLICATION_KEY && process.env.B2_BUCKET);
}

/** True when an id is a legacy GridFS ObjectId (24 hex) rather than a B2 key. */
export function isLegacyGridfsId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}

function bucketName(): string {
  const b = process.env.B2_BUCKET;
  if (!b) throw new Error("B2_BUCKET is not set.");
  return b;
}

type AuthCtx = { apiUrl: string; downloadUrl: string; token: string; accountId: string };
let cachedAuth: { ctx: AuthCtx; expires: number } | null = null;
let cachedBucketId: string | null = null;

async function authorize(): Promise<AuthCtx> {
  if (cachedAuth && cachedAuth.expires > Date.now()) return cachedAuth.ctx;
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  if (!keyId || !appKey) throw new Error("Backblaze B2 is not configured (B2_KEY_ID / B2_APPLICATION_KEY).");
  const basic = Buffer.from(`${keyId}:${appKey}`).toString("base64");
  const res = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`b2_authorize_account failed (${res.status})`);
  const j = await res.json();
  const storage = j.apiInfo?.storageApi;
  if (!storage?.apiUrl) throw new Error("b2_authorize_account: unexpected response shape");
  const ctx: AuthCtx = {
    apiUrl: storage.apiUrl,
    downloadUrl: storage.downloadUrl,
    token: j.authorizationToken,
    accountId: j.accountId,
  };
  cachedAuth = { ctx, expires: Date.now() + AUTH_TTL_MS };
  return ctx;
}

async function bJson(ctx: AuthCtx, path: string, body: unknown) {
  const res = await fetch(`${ctx.apiUrl}/b2api/v3/${path}`, {
    method: "POST",
    headers: { Authorization: ctx.token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed (${res.status})`);
  return res.json();
}

async function getBucketId(ctx: AuthCtx): Promise<string> {
  if (cachedBucketId) return cachedBucketId;
  const j = await bJson(ctx, "b2_list_buckets", { accountId: ctx.accountId, bucketName: bucketName() });
  const bucket = j.buckets?.[0];
  if (!bucket?.bucketId) throw new Error(`B2 bucket "${bucketName()}" not found`);
  cachedBucketId = bucket.bucketId;
  return cachedBucketId as string;
}

/**
 * Upload a resume buffer to B2; returns the object key (stored as the user's resumeFileId).
 * Keys are flat (no "/") so they slot into the existing /api/files/resume/[id] route. Content
 * type + inline disposition are baked into the object so authorized downloads render correctly.
 */
export async function uploadResumeToB2(
  data: Buffer,
  opts: { filename: string; contentType: string; ownerUserId: string }
): Promise<string> {
  const ctx = await authorize();
  const bucketId = await getBucketId(ctx);
  const ext = ALLOWED_RESUME_TYPES[opts.contentType] || "bin";
  const key = `resume_${randomUUID()}.${ext}`;
  const sha1 = createHash("sha1").update(data).digest("hex");
  const disposition = `inline; filename="${opts.filename.replace(/"/g, "")}"`;

  const upload = async () => {
    const uj = await bJson(ctx, "b2_get_upload_url", { bucketId });
    return fetch(uj.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uj.authorizationToken,
        "X-Bz-File-Name": encodeURIComponent(key),
        "Content-Type": opts.contentType,
        "Content-Length": String(data.length),
        "X-Bz-Content-Sha1": sha1,
        "X-Bz-Info-b2-content-disposition": encodeURIComponent(disposition),
        "X-Bz-Info-owneruserid": encodeURIComponent(opts.ownerUserId),
      },
      body: new Uint8Array(data),
    });
  };

  // One retry: upload URLs/tokens are single-use and can go stale.
  let res = await upload();
  if (!res.ok && (res.status === 401 || res.status === 503)) res = await upload();
  if (!res.ok) throw new Error(`b2 upload failed (${res.status})`);
  return key;
}

/** Build a short-lived (60s) authorized download URL for a resume object key. */
export async function getResumeDownloadUrl(key: string): Promise<string> {
  const ctx = await authorize();
  const bucketId = await getBucketId(ctx);
  const j = await bJson(ctx, "b2_get_download_authorization", {
    bucketId,
    fileNamePrefix: key,
    validDurationInSeconds: DOWNLOAD_URL_TTL_SECONDS,
  });
  return `${ctx.downloadUrl}/file/${bucketName()}/${encodeURIComponent(key)}?Authorization=${j.authorizationToken}`;
}

/** Delete a resume object (best-effort). */
export async function deleteResumeFromB2(key: string): Promise<void> {
  try {
    const ctx = await authorize();
    const bucketId = await getBucketId(ctx);
    const j = await bJson(ctx, "b2_list_file_names", {
      bucketId,
      prefix: key,
      startFileName: key,
      maxFileCount: 1,
    });
    const file = j.files?.find((f: { fileName: string }) => f.fileName === key);
    if (!file?.fileId) return;
    await bJson(ctx, "b2_delete_file_version", { fileName: key, fileId: file.fileId });
  } catch {
    // already gone / transient — ignore
  }
}
