import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { getUserByEmail } from "@/lib/db/repo";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie } from "@/lib/auth/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`login:${ip}`, 8, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 422 });
  }
  const { email, password } = parsed.data;

  const user = await getUserByEmail(email);
  // Constant-ish response — don't reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const sessionUser = { id: String(user._id), name: user.name, email: user.email, role: user.role };
  await createSessionCookie(sessionUser);
  return NextResponse.json({ ok: true, user: sessionUser });
}
