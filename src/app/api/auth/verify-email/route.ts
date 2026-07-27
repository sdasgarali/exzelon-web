import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hashToken } from "@/lib/auth/tokens";
import { verifyEmailByTokenHash } from "@/lib/db/repo";

const schema = z.object({ token: z.string().min(10) });

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

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification link." }, { status: 422 });
  }

  const ok = await verifyEmailByTokenHash(hashToken(parsed.data.token));
  if (!ok) {
    return NextResponse.json(
      { error: "This verification link is invalid or has expired." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
