import { Resend } from "resend";
import { site } from "./site";

/**
 * Sends a notification email via Resend when RESEND_API_KEY is configured.
 * Falls back to console logging in development so forms are testable without secrets.
 * Env-driven per the global environment standard.
 */
export async function sendNotificationEmail({
  subject,
  html,
  replyTo,
}: {
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Exzelon Website <onboarding@resend.dev>";

  if (!apiKey) {
    // Dev fallback — no secret configured. Log and succeed so UX is testable.
    console.info("[email:dev-fallback] Would send email:", { to, subject, replyTo });
    console.info("[email:dev-fallback] Body:\n", html.replace(/<[^>]+>/g, " ").trim());
    return { ok: true, delivered: false };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, delivered: false };
    }
    return { ok: true, delivered: true };
  } catch (err) {
    console.error("[email] Unexpected error:", err);
    return { ok: false, delivered: false };
  }
}

/** Minimal HTML escaping for user-supplied values placed into email bodies. */
export function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
