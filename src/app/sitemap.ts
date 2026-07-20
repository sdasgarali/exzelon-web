import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { industries } from "@/content/industries";
import { jobs } from "@/content/jobs";
import { blogPosts } from "@/content/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
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
