import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { consentSchema } from "@/lib/validation";
import { recordConsent } from "@/lib/db/repo";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** Record a cookie-consent decision (+ optional name/email lead) from the banner. */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`consent:${ip}`, 20, 60_000).ok) {
    return NextResponse.json({ ok: true }, { headers: CORS });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400, headers: CORS });
  }

  const parsed = consentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid consent" }, { status: 422, headers: CORS });
  }
  const d = parsed.data;

  await recordConsent({
    sessionId: d.sessionId,
    source: d.source || "exz-web",
    status: d.status,
    name: d.name || undefined,
    email: d.email || undefined,
  });

  return NextResponse.json({ ok: true }, { headers: CORS });
}
