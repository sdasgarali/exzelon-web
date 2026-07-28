import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hashToken } from "@/lib/auth/tokens";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyOtpSchema } from "@/lib/validation";
import { verifyEmailByTokenHash, verifyEmailByOtp } from "@/lib/db/repo";

// Accept either a magic-link token (unauthenticated, from the email link) or a
// 6-digit OTP typed by the currently signed-in user.
const bodySchema = z.union([z.object({ token: z.string().min(10) }), verifyOtpSchema]);

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`verify:${ip}`, 12, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification request." }, { status: 422 });
  }

  // OTP path — must be signed in; the code is only valid for that account.
  if ("otp" in parsed.data) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to verify with a code." }, { status: 401 });
    }
    const ok = await verifyEmailByOtp(user.id, hashToken(parsed.data.otp));
    if (!ok) {
      return NextResponse.json(
        { error: "That code is incorrect or has expired." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  // Magic-link path — token carries its own identity, no session required.
  const ok = await verifyEmailByTokenHash(hashToken(parsed.data.token));
  if (!ok) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
