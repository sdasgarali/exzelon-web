import "server-only";
import {
  sendNotificationEmail,
  emailLayout,
  emailButton,
  siteBaseUrl,
  escapeHtml,
} from "@/lib/email";
import { createToken, VERIFY_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from "./tokens";
import { setVerifyToken, setResetTokenByEmail } from "@/lib/db/repo";

/** Issue a verification token for a user and email them a verification link (best-effort). */
export async function issueAndSendVerification(userId: string, name: string, email: string) {
  const { token, hash, expires } = createToken(VERIFY_TOKEN_TTL_MS);
  await setVerifyToken(userId, hash, expires);
  const link = `${siteBaseUrl()}/verify-email?token=${token}`;
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">Confirm your email</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      Hi ${escapeHtml(name || "there")}, welcome to Exzelon. Please confirm your email address to
      finish setting up your account.
    </p>
    <p style="margin:0 0 20px">${emailButton(link, "Verify email")}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
  `);
  return sendNotificationEmail({ to: email, subject: "Verify your Exzelon email", html });
}

/**
 * Issue a reset token for the given email and send a reset link, IF the account exists.
 * Always resolves quietly (no account enumeration) — callers respond 200 regardless.
 */
export async function issueAndSendReset(email: string) {
  const { token, hash, expires } = createToken(RESET_TOKEN_TTL_MS);
  const user = await setResetTokenByEmail(email, hash, expires);
  if (!user) return { ok: true, delivered: false };
  const link = `${siteBaseUrl()}/reset-password?token=${token}`;
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">Reset your password</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      We received a request to reset the password for your Exzelon account. Click below to choose a new password.
    </p>
    <p style="margin:0 0 20px">${emailButton(link, "Reset password")}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `);
  return sendNotificationEmail({ to: user.email, subject: "Reset your Exzelon password", html });
}
