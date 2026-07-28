import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { deleteVisitorLog, logAudit } from "@/lib/db/repo";

/** Delete a consent/visitor row (admin only). Audited. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;

  const { id } = await params;
  const removed = await deleteVisitorLog(id);
  if (!removed) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logAudit({
    actorId: guard.user.id,
    actorName: guard.user.name,
    action: "consent.delete",
    target: removed.email || removed.name || id,
  });

  return NextResponse.json({ ok: true });
}
