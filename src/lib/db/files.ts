import "server-only";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "./mongodb";

/**
 * Resume file storage via GridFS (bucket: "resumes"). Keeps binaries in Mongo so
 * the app needs no extra object-storage infra. Files are small (<= MAX_RESUME_BYTES).
 */

export const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_RESUME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

async function bucket() {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: "resumes" });
}

const oid = (id: string) => {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

/** Store a resume buffer; returns the new file id as a string. */
export async function uploadResume(
  data: Buffer,
  opts: { filename: string; contentType: string; ownerUserId: string }
): Promise<string> {
  const b = await bucket();
  return new Promise((resolve, reject) => {
    const stream = b.openUploadStream(opts.filename, {
      metadata: { ownerUserId: opts.ownerUserId, contentType: opts.contentType },
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(String(stream.id)));
    stream.end(data);
  });
}

/** Fetch a resume's bytes + metadata by id, or null if not found. */
export async function getResume(
  id: string
): Promise<{ data: Buffer; filename: string; contentType: string } | null> {
  const _id = oid(id);
  if (!_id) return null;
  const b = await bucket();
  const files = await b.find({ _id }).toArray();
  if (files.length === 0) return null;
  const file = files[0];
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    b.openDownloadStream(_id)
      .on("data", (c: Buffer) => chunks.push(c))
      .on("error", reject)
      .on("end", () =>
        resolve({
          data: Buffer.concat(chunks),
          filename: file.filename,
          contentType: file.metadata?.contentType || "application/octet-stream",
        })
      );
  });
}

/** Delete a resume file by id (best-effort). */
export async function deleteResume(id: string): Promise<void> {
  const _id = oid(id);
  if (!_id) return;
  const b = await bucket();
  try {
    await b.delete(_id);
  } catch {
    // already gone — ignore
  }
}
