import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { CtaBanner } from "@/components/cta-banner";
import { blogPosts, getPost } from "@/content/site-content";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return pageMetadata({ title: "Blog" });
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/resources/blog/${post.slug}` });
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
  const post = getPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow={post.category}
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "Blog", href: "/resources/blog" }, { label: post.title }]}
        title={post.title}
        description={post.excerpt}
      >
        <span className="flex items-center gap-3 text-sm text-brand-100/70">
          <span>{post.author}</span>
          <span>·</span>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </span>
      </PageHeader>

      <article className="container-x max-w-3xl py-16 sm:py-20">
        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
          <p className="text-xl font-medium text-ink-900">{post.excerpt}</p>
          <p>
            The job market moves fast, and the professionals who thrive are the ones who prepare
            deliberately. In this guide, our recruiting team shares the practical steps that make the
            biggest difference — the same advice we give the candidates and clients we work with every day.
          </p>

          <h2 className="pt-4 text-2xl font-bold text-ink-900">Why this matters now</h2>
          <p>
            Whether you&apos;re early in your career or a seasoned specialist, the fundamentals rarely change:
            clarity about what you want, credentials that are current and verifiable, and a partner who
            can open the right doors. At Exzelon, we combine sector expertise with a relentless focus on
            compliance so nothing slows you down.
          </p>

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <div className="flex items-start gap-3">
              <Icon name="sparkles" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="text-base text-brand-900">
                <strong>Pro tip:</strong> Keep your credentials and resume up to date in one place — it
                dramatically shortens time-to-offer when the right role appears.
              </p>
            </div>
          </div>

          <h2 className="pt-4 text-2xl font-bold text-ink-900">Putting it into practice</h2>
          <p>
            Start small and stay consistent. Update your profile, get clear on your must-haves, and lean
            on a specialist recruiter who understands your field. The right support turns a stressful
            search into a confident, well-guided next step.
          </p>
          <p>
            Ready to take the next step? Browse our live opportunities or reach out to a recruiter who
            specializes in your industry — we&apos;re here to help you move forward.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-sand-200 pt-8">
          <ButtonLink href="/jobs" variant="primary">Browse jobs <Icon name="arrow-right" className="h-4 w-4" /></ButtonLink>
          <ButtonLink href="/resources/blog" variant="outline">Back to blog</ButtonLink>
        </div>
      </article>

      {/* Related */}
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

      <CtaBanner />
    </>
  );
}
