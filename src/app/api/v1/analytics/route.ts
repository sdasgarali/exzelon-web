import { NextResponse } from "next/server";
import { getVisitorAnalytics, listConsentedVisitors } from "@/lib/db/repo";
import { requireApiKey } from "@/lib/auth/api-key";

/**
 * Public analytics pull API — AccessHub-compatible (mirrors neuraforz-web's contract).
 *   GET /api/v1/analytics?days=N&source=exz-web
 *   Authorization: Bearer <key>
 * Returns { api_key_name, totals, daily[], sources[], meta }. AccessHub reads `daily[]`.
 */
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const guard = await requireApiKey(req, "analytics:read");
  if ("error" in guard) return guard.error;
  const { key } = guard;

  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days")) || 30;
  const source = url.searchParams.get("source") || undefined;

  const [data, leads] = await Promise.all([
    getVisitorAnalytics({ days, source }),
    listConsentedVisitors({ source, limit: 2000 }),
  ]);

  // Full lead/contact detail — everything captured, exposed via the key.
  const contacts = leads.map((v) => ({
    name: v.name,
    email: v.email,
    country: v.country,
    city: v.city,
    region: v.region,
    browser: v.browser,
    os: v.os,
    device: v.deviceType,
    language: v.language,
    referrer: v.referrer,
    landing_page: v.landingPage,
    last_page: v.lastPage,
    source: v.source,
    visits: v.visitCount,
    consented_at: v.consentedAt,
    first_seen: v.firstSeenAt,
    last_seen: v.lastSeenAt,
  }));

  return NextResponse.json(
    {
      api_key_name: key.name,
      ...data,
      contacts,
      meta: {
        ...data.meta,
        source_filter: source || "all",
        contacts_count: contacts.length,
        generated_at: new Date().toISOString(),
      },
    },
    { headers: CORS }
  );
}
