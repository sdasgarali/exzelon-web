import Link from "next/link";
import { site } from "@/lib/site";
import { industries } from "@/content/industries";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "For Clients", href: "/for-clients" },
      { label: "Contact Us", href: "/contact" },
      { label: "Feedback", href: "/resources/feedback" },
    ],
  },
  {
    title: "Opportunities",
    links: industries.map((i) => ({ label: i.name, href: `/opportunities/${i.slug}` })),
  },
  {
    title: "Resources",
    links: [
      { label: "Job Board", href: "/jobs" },
      { label: "Blog", href: "/resources/blog" },
      { label: "FAQ", href: "/resources/faq" },
      { label: "Compliance", href: "/resources/compliance" },
    ],
  },
];

export function Footer() {
  const year = 2026;
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink-900 text-brand-100/70">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.6]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      {/* CTA strip */}
      <div className="relative border-b border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="display-2 max-w-xl text-2xl font-bold text-white sm:text-3xl">
              Let&apos;s get connected and start finding your dream job
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/jobs" variant="accent" size="lg">
              Browse Jobs
            </ButtonLink>
            <ButtonLink href="/contact" variant="light" size="lg">
              Talk to a Recruiter
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="relative container-x grid grid-cols-2 gap-10 py-16 md:grid-cols-6">
        <div className="col-span-2 md:col-span-2">
          <Logo invert />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">
            Connecting skilled professionals with careers across five industries — and helping
            employers hire faster, with full compliance.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-white">
              <Icon name="star" className="h-4 w-4 fill-accent-500 text-accent-500" />
              {site.rating.score}/{site.rating.outOf}
            </span>
            <span className="text-xs">on {site.rating.source}</span>
          </div>
          <div className="mt-6 flex gap-2">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-brand-100 transition-colors hover:border-brand-400 hover:bg-brand-600 hover:text-white"
              >
                <Icon name={s.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 md:col-span-1">
          <h3 className="text-sm font-semibold text-white">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <span>
                {site.address.line1}, {site.address.city}, {site.address.state} {site.address.zip}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="mail" className="h-4 w-4 shrink-0 text-brand-400" />
              <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Icon name="phone" className="h-4 w-4 shrink-0 text-brand-400" />
              <a href={site.phoneHref} className="hover:text-white">{site.phone}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>© {year} {site.brand}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/resources/compliance" className="hover:text-white">Privacy</Link>
            <Link href="/resources/compliance" className="hover:text-white">Terms</Link>
            <Link href="/resources/compliance" className="hover:text-white">Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
