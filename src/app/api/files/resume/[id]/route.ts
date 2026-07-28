import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { getUserById, employerCanAccessResume } from "@/lib/db/repo";
import { getResume } from "@/lib/db/files";
import { getResumeDownloadUrl, isLegacyGridfsId } from "@/lib/storage/b2";

/**
 * Serve a resume file with strict authorization:
 *  - admin: any resume
 *  - seeker: only their own uploaded resume
 *  - employer: only resumes attached to applications on jobs they own
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser();
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { id } = await params;

  let allowed = false;
  if (user.role === "admin") {
    allowed = true;
  } else if (user.role === "seeker") {
    const me = await getUserById(user.id);
    allowed = me?.profile?.resumeFileId === id;
  } else if (user.role === "employer") {
    allowed = await employerCanAccessResume(user.id, id);
  }
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Legacy files still live in GridFS — stream those. New files are on B2: hand back a
  // short-lived presigned URL (302) so bytes never pass through this function.
  if (isLegacyGridfsId(id)) {
    const file = await getResume(id);
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(new Uint8Array(file.data), {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `inline; filename="${file.filename.replace(/"/g, "")}"`,
        "Content-Length": String(file.data.length),
        "Cache-Control": "private, no-store",
      },
    });
  }

  const url = await getResumeDownloadUrl(id);
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, no-store" } });
}
