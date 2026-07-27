import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { issueAndSendReset } from "@/lib/auth/email-flows";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`forgot:${ip}`, 5, 60_000).ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  // Never reveal whether the account exists — always respond the same way.
  await issueAndSendReset(parsed.data.email);
  return NextResponse.json({ ok: true });
}
