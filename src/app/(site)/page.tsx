import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/home/hero";
import { Section, SectionHeading, Badge } from "@/components/ui/section";
import { Reveal, StaggerGroup, staggerItem } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { IndustryCard } from "@/components/cards/industry-card";
import { JobCard } from "@/components/cards/job-card";
import { CtaBanner } from "@/components/cta-banner";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { industries } from "@/content/industries";
import { steps, services } from "@/content/services";
import { blogPosts } from "@/content/site-content";
import { listFeaturedPublicJobs } from "@/lib/db/repo";
import { MotionItem } from "@/components/motion/motion-item";

export const revalidate = 60;

export default async function HomePage() {
  const healthcare = industries[0];
  const featured = await listFeaturedPublicJobs(6);

  return (
    <>
      <Hero jobs={featured} />

      {/* 4-step process */}
      <Section>
        <SectionHeading
          align="center"
          title="Follow 4 easy steps to your next role"
          description="From first search to signed offer, we've made getting hired refreshingly simple."
        />
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <MotionItem key={step.n} variants={staggerItem} className="relative">
              <div className="group relative flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <span className="absolute right-6 top-5 text-5xl font-extrabold text-sand-100 transition-colors group-hover:text-brand-50">
                  {step.n}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-[0_10px_24px_-10px_rgba(26,84,224,0.9)]">
                  <Icon name={step.icon} className="h-6 w-6" />
                </div>
                <h3 className="relative mt-6 text-lg font-bold text-ink-900">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <span className="absolute right-[-14px] top-1/2 z-10 hidden -translate-y-1/2 text-brand-300 lg:block">
                  <Icon name="arrow-right" className="h-6 w-6" />
                </span>
              )}
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Industries grid */}
      <Section className="bg-sand-50">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <SectionHeading
            title="Five industries. One trusted partner."
            description="Specialist recruiters in each sector who understand the credentials, culture, and cadence of your field."
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/opportunities" variant="outline">
              View all opportunities
              <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <MotionItem key={industry.slug} variants={staggerItem}>
              <IndustryCard industry={industry} />
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* Healthcare spotlight */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white shadow-[var(--shadow-glow)]">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
                <Icon name="heart-pulse" className="relative h-14 w-14 text-white/90" strokeWidth={1.6} />
                <div className="relative mt-8 grid grid-cols-3 gap-4">
                  {healthcare.stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-extrabold">{s.value}</div>
                      <div className="mt-1 text-xs text-brand-100/80">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 right-4 hidden rounded-2xl border border-sand-200 bg-white p-4 shadow-[var(--shadow-card)] sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon name="badge-check" className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-ink-900">Fully compliant</div>
                    <div className="text-xs text-slate-500">Credentialed in 9 days avg.</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              title={healthcare.headline}
              description={healthcare.description}
            />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {healthcare.roles.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm text-slate-700">
                  <Icon name="check" className="h-4 w-4 shrink-0 text-brand-600" />
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <ButtonLink href="/opportunities/healthcare" variant="primary" size="lg">
                Explore healthcare roles
                <Icon name="arrow-right" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* Candidate CTA with pointing professional */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="display-2 text-3xl font-bold text-ink-900 text-balance sm:text-4xl">
                Your next move, guided every step
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">
                Create a free profile, upload your resume once, and let a specialist recruiter match
                you to roles that actually fit — then guide you through to the offer.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Free for job seekers, always",
                  "A dedicated recruiter in your field",
                  "Track every application in one place",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/register" variant="primary" size="lg">
                  Create free profile
                  <Icon name="arrow-right" className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/jobs" variant="outline" size="lg">
                  Browse jobs
                </ButtonLink>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Image
              src="/images/pointing-pro.png"
              alt="A friendly Exzelon recruiter pointing toward open job opportunities"
              width={910}
              height={796}
              className="mx-auto h-auto w-full max-w-md lg:ml-auto"
            />
          </Reveal>
        </div>
      </Section>

      {/* Featured jobs */}
      <Section className="bg-ink-900 text-white">
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <SectionHeading
            invert
            title="Featured opportunities"
            description="Hand-picked roles from employers actively hiring this week."
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/jobs" variant="light">
              See all jobs
              <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {featured.slice(0, 3).map((job) => (
            <MotionItem key={job.id} variants={staggerItem}>
              <JobCard job={job} />
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      {/* For employers teaser */}
      <Section>
        <SectionHeading
          align="center"
          title="Hire faster, with confidence"
          description="Six ways Exzelon helps you build and manage a world-class workforce."
        />
        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <MotionItem key={s.slug} variants={staggerItem}>
              <div className="group flex h-full items-start gap-4 rounded-2xl border border-sand-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[var(--shadow-card)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
                </div>
              </div>
            </MotionItem>
          ))}
        </StaggerGroup>
        <Reveal className="mt-10 text-center">
          <ButtonLink href="/for-clients" variant="primary" size="lg">
            Explore client services
            <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
        </Reveal>
      </Section>

      {/* Testimonials */}
      <Section className="bg-sand-50">
        <SectionHeading
          align="center"
          title="Loved by candidates and clients alike"
        />
        <div className="mt-12">
          <TestimonialsCarousel />
        </div>
      </Section>

      {/* Blog preview */}
      <Section>
        <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
          <SectionHeading
            title="Career &amp; hiring resources"
            description="Guides, tips, and industry insight from our recruiting team."
          />
          <Reveal delay={0.1}>
            <ButtonLink href="/resources/blog" variant="outline">
              Read the blog
              <Icon name="arrow-right" className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => (
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
                  <Icon name="sparkles" className="absolute bottom-4 right-4 h-10 w-10 text-white/40" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-700">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
                  <div className="mt-auto flex items-center gap-3 pt-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Icon name="clock" className="h-3.5 w-3.5" /> {post.readingTime}</span>
                    <span>·</span>
                    <span>{post.author}</span>
                  </div>
                </div>
              </Link>
            </MotionItem>
          ))}
        </StaggerGroup>
      </Section>

      <CtaBanner />
    </>
  );
}
