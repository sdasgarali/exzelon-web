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
  to,
}: {
  subject: string;
  html: string;
  replyTo?: string;
  /** Recipient override. Defaults to the admin inbox (CONTACT_TO_EMAIL / site.email). */
  to?: string;
}): Promise<{ ok: boolean; delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = to || process.env.CONTACT_TO_EMAIL || site.email;
  const from = process.env.CONTACT_FROM_EMAIL || "Exzelon Website <onboarding@resend.dev>";

  if (!apiKey) {
    // Dev fallback — no secret configured. Log and succeed so UX is testable.
    console.info("[email:dev-fallback] Would send email:", { to: recipient, subject, replyTo });
    console.info("[email:dev-fallback] Body:\n", html.replace(/<[^>]+>/g, " ").trim());
    return { ok: true, delivered: false };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: recipient,
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

/** Public base URL for links in emails (verification, reset, dashboards). */
export function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    site.url ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Wrap body content in a simple branded HTML shell for transactional emails. */
export function emailLayout(bodyHtml: string) {
  return `
  <div style="background:#f1f5f9;padding:32px 0;font-family:Inter,Arial,sans-serif;color:#0f172a">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:#0b1b3a;padding:20px 28px">
        <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.01em">Exzelon</span>
        <span style="color:#93c5fd;font-size:13px;margin-left:8px">NextGen Hires</span>
      </div>
      <div style="padding:28px">${bodyHtml}</div>
      <div style="padding:16px 28px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
        © 2026 Exzelon — NextGen Hires · <a href="${siteBaseUrl()}" style="color:#2563eb;text-decoration:none">exzelon.com</a>
      </div>
    </div>
  </div>`;
}

/** A styled call-to-action button for email bodies. */
export function emailButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px">${label}</a>`;
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
