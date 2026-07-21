import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api-guard";
import { updateUserRole, updateUser, setUserPassword, deleteUser } from "@/lib/db/repo";
import { hashPassword } from "@/lib/auth/password";

const patchSchema = z.object({
  role: z.enum(["admin", "employer", "seeker"]).optional(),
  name: z.string().min(2, "Name is too short").max(80).optional(),
  email: z.string().email("Enter a valid email").optional(),
  company: z.string().max(120).optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(100).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { id } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  // Role change: never let an admin change their own role (avoid lockout).
  if (data.role !== undefined) {
    if (id === user.id) {
      return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
    }
    const ok = await updateUserRole(id, data.role);
    if (!ok) return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Basic profile fields.
  if (data.name !== undefined || data.email !== undefined || data.company !== undefined) {
    const result = await updateUser(id, { name: data.name, email: data.email, company: data.company });
    if (result === "email_taken") {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
    if (result === "not_found") {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
  }

  // Set a new password.
  if (data.password !== undefined) {
    const hash = await hashPassword(data.password);
    const ok = await setUserPassword(id, hash);
    if (!ok) return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const ok = await deleteUser(id);
  if (!ok) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
