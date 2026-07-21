import { NextResponse } from "next/server";
import { applySchema } from "@/lib/validation";
import { sendNotificationEmail, escapeHtml } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createApplication, getUserById } from "@/lib/db/repo";
import { requireApiUser } from "@/lib/auth/api-guard";
import { isProfileComplete, profileMissingFields } from "@/lib/profile";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`apply:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many applications submitted. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  // Must be signed in as a seeker to apply.
  const guard = await requireApiUser(["seeker"]);
  if ("error" in guard) return guard.error;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = applySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // honeypot
  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  // Load the seeker + enforce a complete profile (name, email, resume link).
  const dbUser = await getUserById(guard.user.id);
  const account = { name: dbUser?.name ?? guard.user.name, email: dbUser?.email ?? guard.user.email };
  const profile = dbUser?.profile ?? {};
  if (!isProfileComplete({ ...account, profile })) {
    return NextResponse.json(
      {
        error: "Complete your profile before applying.",
        code: "profile_incomplete",
        missing: profileMissingFields({ ...account, profile }),
      },
      { status: 422 }
    );
  }

  // Snapshot the applicant's identity + resume from their profile at apply time.
  try {
    await createApplication({
      jobSlug: data.jobId,
      jobTitle: data.jobTitle,
      applicantUserId: guard.user.id,
      name: account.name,
      email: account.email,
      phone: profile.phone,
      linkedin: profile.linkedin,
      resumeUrl: profile.resumeUrl,
      experienceLevel: profile.experienceLevel,
      coverLetter: data.coverLetter || undefined,
    });
  } catch (err) {
    console.error("[apply] DB write failed:", err);
  }

  const html = `
    <h2>New job application — ${escapeHtml(data.jobTitle)}</h2>
    <p><strong>Job ID:</strong> ${escapeHtml(data.jobId)}</p>
    <p><strong>Name:</strong> ${escapeHtml(account.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(account.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(profile.phone || "—")}</p>
    <p><strong>Experience:</strong> ${escapeHtml(profile.experienceLevel || "—")}</p>
    <p><strong>LinkedIn:</strong> ${escapeHtml(profile.linkedin || "—")}</p>
    <p><strong>Resume:</strong> ${escapeHtml(profile.resumeUrl || "—")}</p>
    <hr />
    <p><strong>Cover note:</strong></p>
    <p>${escapeHtml(data.coverLetter || "—").replace(/\n/g, "<br/>")}</p>
  `;

  const result = await sendNotificationEmail({
    subject: `[Exzelon] Application: ${data.jobTitle}`,
    html,
    replyTo: account.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "We couldn't submit your application right now. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: result.delivered });
}
