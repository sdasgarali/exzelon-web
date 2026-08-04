import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // Block API + the role-gated dashboards from crawling. Auth pages
    // (/login, /register, …) are intentionally NOT disallowed here — they are
    // marked `noindex` at the layout level so Google can recrawl and drop the
    // ones already in its index (a Disallow would prevent that recrawl).
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/employer/", "/account/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
