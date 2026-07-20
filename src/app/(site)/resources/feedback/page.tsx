import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { ContactForm } from "@/components/forms/contact-form";
import { testimonials } from "@/content/site-content";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Feedback",
  description: "Share your experience with Exzelon. Your feedback helps us improve for candidates and clients alike.",
  path: "/resources/feedback",
});

export default function FeedbackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Feedback"
        crumbs={[{ label: "Resources", href: "/resources" }, { label: "Feedback" }]}
        title={<>Tell us how we&apos;re <span className="text-gradient">doing</span></>}
        description="Whether it's praise or a suggestion, your feedback shapes how we serve candidates and clients. We read every message."
      />

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] sm:py-20">
        <div>
          <div className="rounded-2xl bg-ink-900 p-8 text-white">
            <div className="flex items-center gap-2">
              <Icon name="star" className="h-6 w-6 fill-accent-500 text-accent-500" />
              <span className="text-2xl font-extrabold">{site.rating.score}/{site.rating.outOf}</span>
            </div>
            <p className="mt-1 text-sm text-brand-100/70">Average rating on {site.rating.source}</p>
            <div className="mt-8 space-y-6">
              {testimonials.slice(0, 3).map((t) => (
                <blockquote key={t.name} className="border-l-2 border-brand-500 pl-4">
                  <p className="text-sm leading-relaxed text-brand-100/90">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-2 text-xs text-brand-100/60">— {t.name}, {t.role}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-2xl font-bold text-ink-900">Share your feedback</h2>
            <p className="mt-1 text-sm text-slate-500">Select &ldquo;General enquiry&rdquo; and tell us what&apos;s on your mind.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
