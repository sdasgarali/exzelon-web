import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { getUserByEmail, upsertPendingRegistration } from "@/lib/db/repo";
import { hashPassword } from "@/lib/auth/password";
import { createOtp, VERIFY_OTP_TTL_MS } from "@/lib/auth/tokens";
import { createPendingCookie } from "@/lib/auth/pending";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendRegistrationOtpEmail } from "@/lib/auth/email-flows";

/**
 * Registration is OTP-gated: this does NOT create an account. It holds the signup in
 * escrow (pendingRegistrations) and emails a 6-digit code. The account is only created
 * once the code is confirmed at POST /api/auth/complete-registration.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`register:${ip}`, 6, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  const existing = await getUserByEmail(data.email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);
  const otp = createOtp(VERIFY_OTP_TTL_MS);
  const pendingId = await upsertPendingRegistration({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    company: data.role === "employer" ? data.company || undefined : undefined,
    otpHash: otp.hash,
    otpExpires: otp.expires,
  });

  // Deliver the code (best-effort — never leaks whether the mailbox exists).
  try {
    await sendRegistrationOtpEmail(data.email, data.name, otp.code);
  } catch (err) {
    console.error("[register] signup OTP email failed:", err);
  }

  await createPendingCookie(pendingId);
  return NextResponse.json({ ok: true, email: data.email });
}
