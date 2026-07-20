import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section, Badge } from "@/components/ui/section";
import { StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { MotionItem } from "@/components/motion/motion-item";
import { Icon } from "@/components/ui/icon";
import { blogPosts } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Career advice, hiring insights, and industry updates from the Exzelon recruiting team.",
  path: "/resources/blog",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "Blog" }]}
        title={<>Career &amp; hiring <span className="text-gradient">insights</span></>}
        description="Practical guides and perspective from the people who place talent every day."
      />

      <Section>
        {/* Featured */}
        <Link
          href={`/resources/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-4xl border border-sand-200 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:border-brand-300 lg:grid-cols-2"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 lg:aspect-auto">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <Icon name="sparkles" className="absolute bottom-6 right-6 h-16 w-16 text-white/30" />
            <span className="absolute left-6 top-6">
              <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">{featured.category}</Badge>
            </span>
          </div>
          <div className="flex flex-col justify-center p-8 lg:p-10">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">Featured</span>
            <h2 className="mt-3 text-2xl font-bold text-ink-900 transition-colors group-hover:text-brand-700 sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 leading-relaxed text-slate-600">{featured.excerpt}</p>
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <span>{featured.author}</span>
              <span>·</span>
              <span>{formatDate(featured.date)}</span>
              <span>·</span>
              <span>{featured.readingTime}</span>
            </div>
          </div>
        </Link>

        {/* Rest */}
        <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-3">
          {rest.map((post) => (
            <MotionItem key={post.slug} variants={staggerItem}>
              <Link
                href={`/resources/blog/${post.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <span className="absolute left-4 top-4">
                    <Badge className="border-white/20 bg-white/15 text-white backdrop-blur">{post.category}</Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-slate-500">
                    <Icon name="clock" className="h-3.5 w-3.5" /> {post.readingTime}
                    <span>·</span>
                    <span>{formatDate(post.date)}</span>
                  </div>
                </div>
              </Link>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>
    </>
  );
}
