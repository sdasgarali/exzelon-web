import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api-guard";
import { toggleSavedJob, getUserById } from "@/lib/db/repo";

const schema = z.object({ jobSlug: z.string().min(1) });

export async function GET() {
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return NextResponse.json({ saved: [] });
  const dbUser = await getUserById(guard.user.id);
  return NextResponse.json({ saved: dbUser?.savedJobs ?? [] });
}

export async function POST(req: Request) {
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid job." }, { status: 422 });

  const saved = await toggleSavedJob(user.id, parsed.data.jobSlug);
  if (saved === null) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true, saved });
}
