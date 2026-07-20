import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api-guard";
import { updateUserRole } from "@/lib/db/repo";

const patchSchema = z.object({ role: z.enum(["admin", "employer", "seeker"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { id } = await params;

  // Prevent an admin from demoting themselves (avoid locking out the last admin).
  if (id === user.id) {
    return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid role." }, { status: 422 });

  const ok = await updateUserRole(id, parsed.data.role);
  if (!ok) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
