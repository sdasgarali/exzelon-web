import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/db/repo";
import { renderMarkdown } from "@/lib/markdown";
import { jobsEnabled } from "@/lib/site";
import { articleMetadata, pageMetadata, blogPostingJsonLd, serpDescription } from "@/lib/seo";

// Posts are read from Mongo on demand and cached (ISR) instead of re-querying on every
// request: the page measured 450ms–1.15s TTFB against ~0.1s for the cached routes, and
// a new/edited post still appears within a minute (same window as the home page).
export const revalidate = 60;

/**
 * Prerender the published posts at build time so they are served from cache; a DB
 * that is unreachable during the build returns no paths, and every post is still
 * generated on first request (`dynamicParams` defaults to true).
 */
export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return pageMetadata({ title: "Blog" });
  return articleMetadata({
    title: post.title,
    description: serpDescription(post.excerpt),
    path: `/resources/blog/${post.slug}`,
    author: post.author,
    publishedTime: (post.publishedAt as string | null) ?? (post.createdAt as string),
    modifiedTime: post.updatedAt as string | undefined,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const all = await listPublishedPosts();
  // Prefer topical neighbours (same category) before falling back to the newest posts:
  // "newest three" gave the same three posts every inbound link and left 19 of 24 posts
  // reachable only from the blog index.
  const others = all.filter((p) => p.slug !== post.slug);
  const related = [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, 3);
  const dateStr = (post.publishedAt as string | null) ?? (post.createdAt as string);
  const jsonLd = blogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    author: post.author,
    publishedAt: post.publishedAt as string | null,
    updatedAt: post.updatedAt as string | undefined,
    createdAt: post.createdAt as string,
    coverImageUrl: post.coverImageUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHeader
        eyebrow={post.category}
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "Blog", href: "/resources/blog" }, { label: post.title }]}
        title={post.title}
        description={post.excerpt}
      >
        <span className="flex items-center gap-3 text-sm text-brand-100/70">
          <span>{post.author}</span>
          <span>·</span>
          <span>{formatDate(dateStr)}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </span>
      </PageHeader>

      <article className="container-x max-w-3xl py-16 sm:py-20">
        {post.coverImageUrl && (
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl border border-sand-200">
            <Image src={post.coverImageUrl} alt="" fill unoptimized className="object-cover" />
          </div>
        )}

        {renderMarkdown(post.body)}

        <div className="mt-10 flex flex-wrap gap-3 border-t border-sand-200 pt-8">
          {/* `/jobs` 307s to `/contact` while the board is disabled, so every post sent
              readers (and crawlers) through a redirect on its primary CTA. */}
          <ButtonLink href={jobsEnabled ? "/jobs" : "/opportunities"} variant="primary">
            {jobsEnabled ? "Browse jobs" : "Explore opportunities"} <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/resources/blog" variant="outline">Back to blog</ButtonLink>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-sand-200 bg-sand-50 py-16">
          <div className="container-x">
            <h2 className="text-2xl font-bold text-ink-900">Keep reading</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/resources/blog/${p.slug}`}
                  className="group rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{p.category}</span>
                  <h3 className="mt-2 font-bold text-ink-900 transition-colors group-hover:text-brand-700">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
