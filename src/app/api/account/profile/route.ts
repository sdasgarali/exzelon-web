import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { profileSchema } from "@/lib/validation";
import { getUserById, updateUserProfile } from "@/lib/db/repo";
import { isProfileComplete, profileMissingFields, type SeekerProfile } from "@/lib/profile";

export async function GET() {
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;

  const dbUser = await getUserById(guard.user.id);
  const profile = (dbUser?.profile ?? {}) as SeekerProfile;
  const account = { name: dbUser?.name ?? guard.user.name, email: dbUser?.email ?? guard.user.email };

  return NextResponse.json({
    account,
    profile,
    complete: isProfileComplete({ ...account, profile }),
    missing: profileMissingFields({ ...account, profile }),
  });
}

export async function PUT(req: Request) {
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Normalise: strip empty strings, drop blank experience/education rows.
  const p = parsed.data;
  const profile: SeekerProfile = {
    resumeUrl: p.resumeUrl?.trim() || undefined,
    linkedin: p.linkedin?.trim() || undefined,
    otherLink: p.otherLink?.trim() || undefined,
    phone: p.phone?.trim() || undefined,
    experienceLevel: p.experienceLevel,
    experiences:
      p.experienceLevel === "experienced"
        ? (p.experiences ?? []).filter((e) => e.title?.trim() && e.company?.trim())
        : [],
    education: (p.education ?? []).filter((e) => e.school?.trim() && e.qualification?.trim()),
  };

  const ok = await updateUserProfile(guard.user.id, profile);
  if (!ok) return NextResponse.json({ error: "Could not save profile." }, { status: 404 });

  const account = { name: guard.user.name, email: guard.user.email };
  return NextResponse.json({
    ok: true,
    profile,
    complete: isProfileComplete({ ...account, profile }),
    missing: profileMissingFields({ ...account, profile }),
  });
}
