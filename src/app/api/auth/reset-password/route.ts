import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hashToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordByTokenHash } from "@/lib/db/repo";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`reset:${ip}`, 8, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { token, password } = parsed.data;
  const passwordHash = await hashPassword(password);
  const ok = await resetPasswordByTokenHash(hashToken(token), passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
