import "server-only";
import {
  sendNotificationEmail,
  emailLayout,
  emailButton,
  siteBaseUrl,
  escapeHtml,
} from "@/lib/email";
import {
  createToken,
  createOtp,
  VERIFY_TOKEN_TTL_MS,
  VERIFY_OTP_TTL_MS,
  RESET_TOKEN_TTL_MS,
} from "./tokens";
import { setVerifyCredentials, setResetTokenByEmail } from "@/lib/db/repo";

/**
 * Issue verification credentials for a user and email them BOTH a magic link and a 6-digit code
 * (best-effort — never blocks signup). The user can click the link or type the code.
 */
export async function issueAndSendVerification(userId: string, name: string, email: string) {
  const link = createToken(VERIFY_TOKEN_TTL_MS);
  const otp = createOtp(VERIFY_OTP_TTL_MS);
  await setVerifyCredentials(userId, {
    tokenHash: link.hash,
    tokenExpires: link.expires,
    otpHash: otp.hash,
    otpExpires: otp.expires,
  });
  const url = `${siteBaseUrl()}/verify-email?token=${link.token}`;
  const html = emailLayout(`
    <h2 style="margin:0 0 12px;font-size:20px">Confirm your email</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6">
      Hi ${escapeHtml(name || "there")}, welcome to Exzelon. Confirm your email address to finish
      setting up your account — enter this code on the verification page:
    </p>
    <p style="margin:0 0 8px;text-align:center">
      <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;color:#0f172a;background:#f1f5f9;border-radius:12px;padding:16px 24px">${otp.code}</span>
    </p>
    <p style="margin:0 0 20px;text-align:center;color:#94a3b8;font-size:12px">This code expires in 15 minutes.</p>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6">Or just click the button:</p>
    <p style="margin:0 0 20px">${emailButton(url, "Verify email")}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px">The link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
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
