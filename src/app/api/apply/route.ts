import { NextResponse } from "next/server";
import { applySchema } from "@/lib/validation";
import { sendNotificationEmail, escapeHtml } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createApplication } from "@/lib/db/repo";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`apply:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many applications submitted. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

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

  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  // Persist to MongoDB, linking to the logged-in seeker if there is one.
  try {
    const user = await getCurrentUser();
    await createApplication({
      jobSlug: data.jobId,
      jobTitle: data.jobTitle,
      applicantUserId: user?.role === "seeker" ? user.id : null,
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin || undefined,
      resumeUrl: data.resumeUrl || undefined,
      coverLetter: data.coverLetter || undefined,
    });
  } catch (err) {
    console.error("[apply] DB write failed:", err);
  }

  const html = `
    <h2>New job application — ${escapeHtml(data.jobTitle)}</h2>
    <p><strong>Job ID:</strong> ${escapeHtml(data.jobId)}</p>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>LinkedIn:</strong> ${escapeHtml(data.linkedin || "—")}</p>
    <p><strong>Resume:</strong> ${escapeHtml(data.resumeUrl || "—")}</p>
    <hr />
    <p><strong>Cover note:</strong></p>
    <p>${escapeHtml(data.coverLetter || "—").replace(/\n/g, "<br/>")}</p>
  `;

  const result = await sendNotificationEmail({
    subject: `[Exzelon] Application: ${data.jobTitle}`,
    html,
    replyTo: data.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "We couldn't submit your application right now. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: result.delivered });
}
