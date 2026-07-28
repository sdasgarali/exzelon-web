import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { revokeAnalyticsApiKey } from "@/lib/db/repo";

/** Revoke (soft-delete) an analytics API key (admin only). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const ok = await revokeAnalyticsApiKey(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
