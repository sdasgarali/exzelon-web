import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { listAnalyticsApiKeys, createAnalyticsApiKey } from "@/lib/db/repo";

/** List analytics API keys (admin only). Never returns key hashes or raw keys. */
export async function GET() {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  return NextResponse.json({ keys: await listAnalyticsApiKeys() });
}

/** Mint a new analytics API key (admin only). The raw key is returned ONCE. */
export async function POST(req: Request) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;

  let name = "API key";
  try {
    const body = await req.json();
    if (typeof body?.name === "string" && body.name.trim()) name = body.name.trim();
  } catch {
    /* default name */
  }

  const { rawKey, key } = await createAnalyticsApiKey(name);
  return NextResponse.json({ key, rawKey });
}
