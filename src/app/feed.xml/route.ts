import { listPublishedPosts } from "@/lib/db/repo";
import { site } from "@/lib/site";

/**
 * RSS 2.0 feed for the blog.
 *
 * The site had no feed at all (/feed.xml, /rss.xml and /resources/blog/feed.xml all 404ed), so
 * the only way to follow new guides was to return to the blog index and diff it by eye. A feed
 * gives feed readers, aggregators and AI crawlers a dated, machine-readable list of the published
 * posts — the same URLs the sitemap carries, with their real publication dates.
 *
 * Posts live in Mongo, so the feed is regenerated hourly rather than baked at build time (the
 * build can run without a database and would then emit an empty channel).
 */
export const revalidate = 3600;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const posts = await listPublishedPosts();
  const feedUrl = `${site.url}/feed.xml`;

  const items = posts
    .map((post) => {
      const url = `${site.url}/resources/blog/${post.slug}`;
      const published = (post.publishedAt as string | null) ?? (post.createdAt as string);
      const date = new Date(published);
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        Number.isNaN(date.getTime()) ? null : `      <pubDate>${date.toUTCString()}</pubDate>`,
        post.category ? `      <category>${escapeXml(post.category)}</category>` : null,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — Career & Hiring Insights`)}</title>
    <link>${site.url}/resources/blog</link>
    <description>${escapeXml(
      "Practical hiring and career guides from Exzelon's Chicago recruiters — how staffing works, what roles pay, and how to hire in the metro.",
    )}</description>
    <language>en-us</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
