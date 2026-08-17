import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Gated paths kept out of every crawler's reach (API + role-gated dashboards).
const disallow = ["/api/", "/admin/", "/employer/", "/account/"];
// Named AI/search crawlers we explicitly welcome — makes the (already-default)
// allow intent unambiguous so answer engines index and cite the public content.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot",
  "Google-Extended", "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    // Auth pages (/login, /register, …) are intentionally NOT disallowed here — they
    // are marked `noindex` at the layout level so Google can recrawl and drop the
    // ones already in its index (a Disallow would prevent that recrawl).
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
