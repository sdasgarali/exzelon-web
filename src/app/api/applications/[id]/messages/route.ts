import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { messageSchema } from "@/lib/validation";
import { getThreadContext, listMessages, createMessage } from "@/lib/db/repo";
import type { SessionUser } from "@/lib/auth/session";
import type { ThreadContext } from "@/lib/db/repo";

/** Determine the viewer's role within a thread ("seeker" | "employer" | "admin" | null). */
function threadRole(user: SessionUser, ctx: ThreadContext): "seeker" | "employer" | "admin" | null {
  if (user.id && user.id === ctx.seekerId) return "seeker";
  if (user.id && user.id === ctx.employerId) return "employer";
  if (user.role === "admin") return "admin";
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const ctx = await getThreadContext(id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = threadRole(guard.user, ctx);
  if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await listMessages(id);
  return NextResponse.json({
    role, // viewer's role in this thread
    jobTitle: ctx.jobTitle,
    canPost: role === "seeker" || role === "employer",
    messages,
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`msg:${ip}`, 20, 60_000).ok) {
    return NextResponse.json({ error: "Too many messages. Slow down a moment." }, { status: 429 });
  }

  const guard = await requireApiUser();
  if ("error" in guard) return guard.error;
  const { id } = await params;

  const ctx = await getThreadContext(id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = threadRole(guard.user, ctx);
  // Only the two participants may post; admins can read but not post.
  if (role !== "seeker" && role !== "employer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = messageSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 422 });
  }

  const message = await createMessage({
    applicationId: id,
    senderId: guard.user.id,
    senderRole: role,
    body: parsed.data.body.trim(),
  });

  return NextResponse.json({ ok: true, message });
}
