import { NextResponse } from "next/server";
import { MongoServerError } from "mongodb";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyOtpSchema } from "@/lib/validation";
import { hashToken } from "@/lib/auth/tokens";
import { readPendingId, clearPendingCookie } from "@/lib/auth/pending";
import { createSessionCookie } from "@/lib/auth/session";
import {
  getPendingRegistration,
  deletePendingRegistration,
  getUserByEmail,
  createUser,
} from "@/lib/db/repo";

/** Confirm the signup OTP, then actually create the account + sign the user in. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`complete-reg:${ip}`, 10, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const pendingId = await readPendingId();
  if (!pendingId) {
    return NextResponse.json(
      { error: "Your signup session expired. Please register again." },
      { status: 440 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = verifyOtpSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 422 });
  }

  const pending = await getPendingRegistration(pendingId);
  if (!pending || !pending.otpExpires || pending.otpExpires.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Your code expired. Please register again." },
      { status: 440 }
    );
  }

  if (pending.otpHash !== hashToken(parsed.data.otp)) {
    return NextResponse.json({ error: "That code is incorrect." }, { status: 400 });
  }

  // Guard the race where the same email was registered elsewhere during the window.
  const clash = await getUserByEmail(pending.email);
  if (clash) {
    await deletePendingRegistration(pendingId);
    await clearPendingCookie();
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  let user;
  try {
    user = await createUser({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      role: pending.role,
      company: pending.company,
      emailVerified: true,
    });
  } catch (err) {
    if (err instanceof MongoServerError && err.code === 11000) {
      await deletePendingRegistration(pendingId);
      await clearPendingCookie();
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    throw err;
  }

  await deletePendingRegistration(pendingId);
  await clearPendingCookie();

  const sessionUser = { id: String(user._id), name: user.name, email: user.email, role: user.role };
  await createSessionCookie(sessionUser);
  return NextResponse.json({ ok: true, user: sessionUser });
}
