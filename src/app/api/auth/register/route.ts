import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { getUserByEmail, createUser } from "@/lib/db/repo";
import { hashPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

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
  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    company: data.role === "employer" ? data.company || undefined : undefined,
  });

  const sessionUser = { id: String(user._id), name: user.name, email: user.email, role: user.role };
  await createSessionCookie(sessionUser);
  return NextResponse.json({ ok: true, user: sessionUser });
}
