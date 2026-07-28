import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { industries } from "@/content/industries";
import { blogPosts } from "@/content/site-content";
import { listPublicJobs } from "@/lib/db/repo";

// Refresh the sitemap hourly so newly posted jobs get picked up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;

  const staticRoutes = [
    "", "/about", "/for-clients", "/opportunities", "/jobs", "/contact",
    "/resources", "/resources/blog", "/resources/faq", "/resources/compliance", "/resources/feedback",
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const industryRoutes = industries.map((i) => ({
    url: `${base}/opportunities/${i.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Live, open, non-expired jobs from the DB (falls back to [] if the DB is unreachable).
  const jobs = await listPublicJobs();
  const jobRoutes = jobs.map((j) => ({
    url: `${base}/jobs/${j.id}`,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const blogRoutes = blogPosts.map((p) => ({
    url: `${base}/resources/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...industryRoutes, ...jobRoutes, ...blogRoutes];
}
