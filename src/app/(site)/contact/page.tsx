import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: "Get in touch with Exzelon — NextGen Hires. Reach our Chicago team by phone, email, or the contact form.",
  path: "/contact",
});

const channels = [
  { icon: "map-pin", label: "Visit us", value: `${site.address.line1}, ${site.address.city}, ${site.address.state} ${site.address.zip}`, href: undefined },
  { icon: "mail", label: "Email us", value: site.email, href: `mailto:${site.email}` },
  { icon: "phone", label: "Call us", value: site.phone, href: site.phoneHref },
  { icon: "message-circle", label: "WhatsApp", value: "Chat with our team", href: site.whatsapp },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        crumbs={[{ label: "Contact Us" }]}
        title={<>Let&apos;s <span className="text-gradient">talk</span></>}
        description="Questions about a role, hiring needs, or anything else? Our Chicago team is here to help — we typically reply within one business day."
      />

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr] sm:py-20">
        {/* Left: details */}
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((c) => {
              const inner = (
                <div className="group h-full rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon name={c.icon} className="h-5 w-5" />
                  </span>
                  <div className="mt-4 text-sm font-semibold text-slate-500">{c.label}</div>
                  <div className="mt-1 font-medium text-ink-900">{c.value}</div>
                </div>
              );
              return c.href ? (
                <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={c.label}>{inner}</div>
              );
            })}
          </div>

          <Reveal>
            <div className="mt-6 overflow-hidden rounded-2xl border border-sand-200">
              <iframe
                title="Exzelon office location"
                src="https://www.google.com/maps?q=6422+N+Maplewood+Ave,+Chicago,+IL+60645&output=embed"
                className="h-64 w-full grayscale-[0.2]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>

          <div className="mt-6 rounded-2xl bg-ink-900 p-6 text-white">
            <div className="flex items-center gap-2">
              <Icon name="star" className="h-5 w-5 fill-accent-500 text-accent-500" />
              <span className="text-lg font-bold">{site.rating.score}/{site.rating.outOf}</span>
              <span className="text-sm text-brand-100/70">rated on {site.rating.source}</span>
            </div>
            <p className="mt-2 text-sm text-brand-100/70">
              Join thousands of professionals and employers who trust Exzelon with their next move.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div>
          <div className="rounded-2xl border border-sand-200 bg-white p-7 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="text-2xl font-bold text-ink-900">Send us a message</h2>
            <p className="mt-1 text-sm text-slate-500">Fill out the form and we&apos;ll be in touch.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
