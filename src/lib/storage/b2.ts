import "server-only";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ALLOWED_RESUME_TYPES } from "@/lib/db/files";

/**
 * Resume file storage on Backblaze B2 via its S3-compatible API.
 * Bucket is PRIVATE — objects are never public. Uploads go through our API (auth +
 * validation); downloads are served as short-lived presigned URLs, so bytes never
 * flow through the serverless function and access stays gated by our authorization.
 *
 * Env (see .env.example):
 *   B2_KEY_ID, B2_APPLICATION_KEY  — a BUCKET-SCOPED application key (not the master key)
 *   B2_BUCKET                      — bucket name (private)
 *   B2_REGION                      — e.g. us-west-004
 *   B2_ENDPOINT                    — optional; defaults to https://s3.<region>.backblazeb2.com
 */

const DOWNLOAD_URL_TTL_SECONDS = 60;

export function isB2Configured(): boolean {
  return Boolean(
    process.env.B2_KEY_ID &&
      process.env.B2_APPLICATION_KEY &&
      process.env.B2_BUCKET &&
      process.env.B2_REGION
  );
}

function bucketName(): string {
  const b = process.env.B2_BUCKET;
  if (!b) throw new Error("B2_BUCKET is not set.");
  return b;
}

let cachedClient: S3Client | null = null;
function client(): S3Client {
  if (cachedClient) return cachedClient;
  const region = process.env.B2_REGION;
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  if (!region || !keyId || !appKey) {
    throw new Error("Backblaze B2 is not configured (B2_REGION / B2_KEY_ID / B2_APPLICATION_KEY).");
  }
  const endpoint = process.env.B2_ENDPOINT || `https://s3.${region}.backblazeb2.com`;
  cachedClient = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId: keyId, secretAccessKey: appKey },
  });
  return cachedClient;
}

/**
 * Upload a resume buffer to B2; returns the object key (stored as the user's resumeFileId).
 * Keys are flat (no "/") so they slot into the existing /api/files/resume/[id] route, and
 * carry ContentType + inline ContentDisposition so presigned downloads render correctly.
 */
export async function uploadResumeToB2(
  data: Buffer,
  opts: { filename: string; contentType: string; ownerUserId: string }
): Promise<string> {
  const ext = ALLOWED_RESUME_TYPES[opts.contentType] || "bin";
  const key = `resume_${randomUUID()}.${ext}`;
  const disposition = `inline; filename="${opts.filename.replace(/"/g, "")}"`;
  await client().send(
    new PutObjectCommand({
      Bucket: bucketName(),
      Key: key,
      Body: data,
      ContentType: opts.contentType,
      ContentDisposition: disposition,
      Metadata: { owneruserid: opts.ownerUserId, filename: opts.filename },
    })
  );
  return key;
}

/** Presign a short-lived GET URL for a resume object key. */
export async function getResumeDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: bucketName(), Key: key }),
    { expiresIn: DOWNLOAD_URL_TTL_SECONDS }
  );
}

/** Delete a resume object (best-effort). */
export async function deleteResumeFromB2(key: string): Promise<void> {
  try {
    await client().send(new DeleteObjectCommand({ Bucket: bucketName(), Key: key }));
  } catch {
    // already gone / transient — ignore
  }
}

/** True when an id is a legacy GridFS ObjectId (24 hex) rather than a B2 key. */
export function isLegacyGridfsId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}
