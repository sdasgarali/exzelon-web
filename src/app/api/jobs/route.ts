import { NextResponse } from "next/server";
import { jobSchema } from "@/lib/validation";
import { requireApiUser } from "@/lib/auth/api-guard";
import { createJob, getUserById } from "@/lib/db/repo";

const toList = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export async function POST(req: Request) {
  const guard = await requireApiUser(["admin", "employer"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;

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

  // Employers post under their company name; admins post as Exzelon.
  let postedByName = "Exzelon";
  if (user.role === "employer") {
    const dbUser = await getUserById(user.id);
    postedByName = dbUser?.company || user.name;
  }

  const job = await createJob({
    title: data.title,
    industry: data.industry,
    location: data.location,
    type: data.type,
    remote: data.remote,
    salary: data.salary,
    summary: data.summary,
    responsibilities: toList(data.responsibilities),
    requirements: toList(data.requirements),
    featured: user.role === "admin" ? !!data.featured : false,
    status: data.status ?? "open",
    postedByUserId: user.id,
    postedByName,
  });

  return NextResponse.json({ ok: true, job });
}
