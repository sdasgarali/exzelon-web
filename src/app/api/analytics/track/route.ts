import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { recordVisit } from "@/lib/db/repo";

/** Open CORS — this beacon is embedded/called from the browser on any page. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** Record a page view. Always returns ok — tracking must never break the host page. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  // Generous limit: a busy visitor may fire several page views a minute.
  if (!rateLimit(`track:${ip}`, 120, 60_000).ok) {
    return NextResponse.json({ ok: true }, { headers: CORS });
  }

  let body: { sessionId?: string; path?: string; source?: string; consent?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }, { headers: CORS });
  }

  if (!body.sessionId || typeof body.sessionId !== "string") {
    return NextResponse.json({ ok: false, error: "Missing sessionId" }, { status: 400, headers: CORS });
  }

  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16);
  await recordVisit({
    sessionId: body.sessionId.slice(0, 120),
    source: (body.source || "exz-web").slice(0, 60),
    path: body.path,
    ipHash,
    userAgent: req.headers.get("user-agent") || undefined,
    consent: body.consent === true,
  });

  return NextResponse.json({ ok: true }, { headers: CORS });
}
