import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api-guard";
import { getApplicationById, updateApplicationStatus, getJobBySlug } from "@/lib/db/repo";

const patchSchema = z.object({
  status: z.enum(["new", "reviewed", "shortlisted", "rejected"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin", "employer"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 422 });

  const app = await getApplicationById(id);
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  // Employers may only manage applications to jobs they own.
  if (user.role === "employer") {
    const job = await getJobBySlug(app.jobSlug as string);
    if (!job || job.postedByUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await updateApplicationStatus(id, parsed.data.status);
  return NextResponse.json({ ok: true });
}
