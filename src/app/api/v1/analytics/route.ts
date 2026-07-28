import { NextResponse } from "next/server";
import { validateAnalyticsApiKey, getVisitorAnalytics } from "@/lib/db/repo";

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
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json(
      { error: "Missing API key. Pass: Authorization: Bearer <your-key>" },
      { status: 401, headers: CORS }
    );
  }

  const key = await validateAnalyticsApiKey(token);
  if (!key) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401, headers: CORS });
  }

  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days")) || 30;
  const source = url.searchParams.get("source") || undefined;

  const data = await getVisitorAnalytics({ days, source });

  return NextResponse.json(
    {
      api_key_name: key.name,
      ...data,
      meta: {
        ...data.meta,
        source_filter: source || "all",
        generated_at: new Date().toISOString(),
      },
    },
    { headers: CORS }
  );
}
