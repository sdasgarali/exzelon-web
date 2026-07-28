import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getUserById, updateProfileFields, clearResumeFileFields } from "@/lib/db/repo";
import { deleteResume as deleteGridfsResume, MAX_RESUME_BYTES, ALLOWED_RESUME_TYPES } from "@/lib/db/files";
import { uploadResumeToB2, deleteResumeFromB2, isB2Configured, isLegacyGridfsId } from "@/lib/storage/b2";

/** Delete a stored resume regardless of backend (new B2 key or legacy GridFS id). */
async function deleteStoredResume(id: string) {
  if (isLegacyGridfsId(id)) return deleteGridfsResume(id);
  return deleteResumeFromB2(id);
}

/** Upload (or replace) the signed-in seeker's resume file. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`resume-up:${ip}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  }

  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;

  if (!isB2Configured()) {
    return NextResponse.json(
      { error: "Resume storage is not configured. Please try again later." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 422 });
  }
  if (!ALLOWED_RESUME_TYPES[file.type]) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF, DOC, or DOCX." },
      { status: 422 }
    );
  }
  if (file.size === 0 || file.size > MAX_RESUME_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 2 MB." }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "resume";

  const user = await getUserById(guard.user.id);
  const oldFileId = user?.profile?.resumeFileId;

  const fileId = await uploadResumeToB2(buffer, {
    filename: safeName,
    contentType: file.type,
    ownerUserId: guard.user.id,
  });
  await updateProfileFields(guard.user.id, { resumeFileId: fileId, resumeFileName: safeName });

  // Clean up the previous file after the new one is committed (handles legacy GridFS too).
  if (oldFileId && oldFileId !== fileId) await deleteStoredResume(oldFileId);

  return NextResponse.json({ ok: true, fileId, fileName: safeName });
}

/** Remove the signed-in seeker's uploaded resume file. */
export async function DELETE() {
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;

  const user = await getUserById(guard.user.id);
  const fileId = user?.profile?.resumeFileId;
  if (fileId) {
    await deleteStoredResume(fileId);
    await clearResumeFileFields(guard.user.id);
  }
  return NextResponse.json({ ok: true });
}
