import type { MetadataRoute } from "next";
import { site, jobsEnabled } from "@/lib/site";
import { industries } from "@/content/industries";
import { listPublicJobs, listPublishedPosts } from "@/lib/db/repo";

// Refresh the sitemap hourly so newly posted jobs get picked up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;

  // Freshness signal for the static marketing pages. A fixed date (bumped on content
  // changes) is honest — unlike `new Date()`, which would claim edits on every hourly
  // regeneration. Update when static page copy meaningfully changes.
  const SITE_UPDATED = new Date("2026-08-17");

  const staticRoutes = [
    "", "/about", "/for-clients", "/opportunities", ...(jobsEnabled ? ["/jobs"] : []), "/contact",
    "/resources", "/resources/blog", "/resources/faq", "/resources/compliance", "/resources/feedback",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: SITE_UPDATED,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const industryRoutes = industries.map((i) => ({
    url: `${base}/opportunities/${i.slug}`,
    lastModified: SITE_UPDATED,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Live, open, non-expired jobs from the DB (falls back to [] if the DB is unreachable).
  // Skipped entirely while the public jobs board is disabled.
  const jobs = jobsEnabled ? await listPublicJobs() : [];
  const jobRoutes = jobs.map((j) => ({
    url: `${base}/jobs/${j.id}`,
    ...(j.createdAtIso ? { lastModified: new Date(j.createdAtIso) } : {}),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Published blog posts from the DB (falls back to [] if unreachable). Blog posts
  // are prime AI-citation surfaces, so they carry a higher priority than the default.
  const posts = await listPublishedPosts();
  const blogRoutes = posts.map((p) => {
    const lastMod = (p.updatedAt as string | undefined) ?? (p.publishedAt as string | null) ?? undefined;
    return {
      url: `${base}/resources/blog/${p.slug}`,
      ...(lastMod ? { lastModified: new Date(lastMod) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...industryRoutes, ...jobRoutes, ...blogRoutes];
}
