import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { requireApiUser } from "@/lib/auth/api-guard";
import { getUserById } from "@/lib/db/repo";
import { issueAndSendVerification } from "@/lib/auth/email-flows";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`resend-verify:${ip}`, 4, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const guard = await requireApiUser();
  if ("error" in guard) return guard.error;

  const user = await getUserById(guard.user.id);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  await issueAndSendVerification(guard.user.id, user.name, user.email);
  return NextResponse.json({ ok: true });
}
