import { NextResponse } from "next/server";
import { jobSchema } from "@/lib/validation";
import { requireApiUser } from "@/lib/auth/api-guard";
import { updateJob, deleteJob, getUserById } from "@/lib/db/repo";

const toList = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiUser(["admin", "employer"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = jobSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  // Employers may only edit their own jobs; admins may edit any.
  const ownerScope = user.role === "employer" ? user.id : undefined;

  let postedByName: string | undefined;
  if (user.role === "employer") {
    const dbUser = await getUserById(user.id);
    postedByName = dbUser?.company || user.name;
  }

  const ok = await updateJob(
    slug,
    {
      title: data.title,
      industry: data.industry,
      location: data.location,
      type: data.type,
      remote: data.remote,
      salary: data.salary,
      summary: data.summary,
      responsibilities: toList(data.responsibilities),
      requirements: toList(data.requirements),
      status: data.status ?? "open",
      ...(user.role === "admin" ? { featured: !!data.featured } : {}),
      ...(postedByName ? { postedByName } : {}),
    },
    ownerScope
  );

  if (!ok) return NextResponse.json({ error: "Job not found or not permitted." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiUser(["admin", "employer"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { slug } = await params;

  const ownerScope = user.role === "employer" ? user.id : undefined;
  const ok = await deleteJob(slug, ownerScope);
  if (!ok) return NextResponse.json({ error: "Job not found or not permitted." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
