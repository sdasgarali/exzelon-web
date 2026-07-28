import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-guard";
import { listConsentedVisitors } from "@/lib/db/repo";
import { toCsv } from "@/lib/csv";

/** Export consented visitors (leads) as CSV — admin only. */
export async function GET() {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;

  const visitors = await listConsentedVisitors(5000);
  const rows = visitors.map((v) => ({
    name: v.name ?? "",
    email: v.email ?? "",
    country: v.country ?? "",
    city: v.city ?? "",
    region: v.region ?? "",
    browser: v.browser ?? "",
    os: v.os ?? "",
    deviceType: v.deviceType ?? "",
    language: v.language ?? "",
    referrer: v.referrer ?? "",
    landingPage: v.landingPage ?? "",
    lastPage: v.lastPage ?? "",
    source: v.source,
    visitCount: v.visitCount,
    consentedAt: v.consentedAt ?? "",
    firstSeenAt: v.firstSeenAt ?? "",
    lastSeenAt: v.lastSeenAt ?? "",
  }));

  const csv = toCsv(rows, [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "country", header: "Country" },
    { key: "city", header: "City" },
    { key: "region", header: "Region" },
    { key: "browser", header: "Browser" },
    { key: "os", header: "OS" },
    { key: "deviceType", header: "Device" },
    { key: "language", header: "Language" },
    { key: "referrer", header: "Referrer" },
    { key: "landingPage", header: "Landing Page" },
    { key: "lastPage", header: "Last Page" },
    { key: "source", header: "Source" },
    { key: "visitCount", header: "Visits" },
    { key: "consentedAt", header: "Consented At" },
    { key: "firstSeenAt", header: "First Seen" },
    { key: "lastSeenAt", header: "Last Seen" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cookie-consent.csv"',
    },
  });
}
