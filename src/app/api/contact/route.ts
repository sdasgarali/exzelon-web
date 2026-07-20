import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { sendNotificationEmail, escapeHtml } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createContact } from "@/lib/db/repo";

export async function POST(req: Request) {
  // Rate limit per IP
  const ip = clientIp(req.headers);
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Honeypot — silently accept but do nothing for bots.
  if (data.company_website) {
    return NextResponse.json({ ok: true });
  }

  // Persist to MongoDB (best-effort — don't fail the request if the DB write hiccups).
  try {
    await createContact({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      subject: data.subject,
      message: data.message,
      interest: data.interest,
    });
  } catch (err) {
    console.error("[contact] DB write failed:", err);
  }

  const html = `
    <h2>New contact enquiry — ${escapeHtml(data.subject)}</h2>
    <p><strong>Interest:</strong> ${escapeHtml(data.interest)}</p>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(data.phone || "—")}</p>
    <hr />
    <p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
  `;

  const result = await sendNotificationEmail({
    subject: `[Exzelon] Contact: ${data.subject}`,
    html,
    replyTo: data.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please try again or email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: result.delivered });
}
