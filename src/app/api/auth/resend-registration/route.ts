import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { createOtp, VERIFY_OTP_TTL_MS } from "@/lib/auth/tokens";
import { readPendingId } from "@/lib/auth/pending";
import { getPendingRegistration, setPendingOtp } from "@/lib/db/repo";
import { sendRegistrationOtpEmail } from "@/lib/auth/email-flows";

/** Reissue + resend the signup OTP for the in-escrow registration in the pending cookie. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`resend-reg:${ip}`, 4, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const pendingId = await readPendingId();
  if (!pendingId) {
    return NextResponse.json(
      { error: "Your signup session expired. Please register again." },
      { status: 440 }
    );
  }

  const pending = await getPendingRegistration(pendingId);
  if (!pending) {
    return NextResponse.json(
      { error: "Your signup session expired. Please register again." },
      { status: 440 }
    );
  }

  const otp = createOtp(VERIFY_OTP_TTL_MS);
  await setPendingOtp(pendingId, otp.hash, otp.expires);
  try {
    await sendRegistrationOtpEmail(pending.email, pending.name, otp.code);
  } catch (err) {
    console.error("[resend-registration] email failed:", err);
  }
  return NextResponse.json({ ok: true });
}
