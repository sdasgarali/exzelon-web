import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { companySchema } from "@/lib/validation";
import { updateCompanyProfile } from "@/lib/db/repo";
import type { CompanyProfile } from "@/lib/company";

export async function PUT(req: Request) {
  const guard = await requireApiUser(["employer"]);
  if ("error" in guard) return guard.error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = companySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const profile: CompanyProfile = {
    tagline: d.tagline?.trim() || undefined,
    about: d.about?.trim() || undefined,
    website: d.website?.trim() || undefined,
    location: d.location?.trim() || undefined,
    size: d.size?.trim() || undefined,
    logoUrl: d.logoUrl?.trim() || undefined,
  };

  const ok = await updateCompanyProfile(guard.user.id, { company: d.company, profile });
  if (!ok) return NextResponse.json({ error: "Could not save company profile." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
