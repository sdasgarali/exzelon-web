import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { markContactRead } from "@/lib/db/repo";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { id } = await params;
  const ok = await markContactRead(id);
  if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
