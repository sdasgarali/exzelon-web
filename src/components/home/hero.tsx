"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Job } from "@/content/jobs";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { LogoMarquee } from "@/components/logo-marquee";
import { site } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [where, setWhere] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (where) params.set("loc", where);
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };

  const trust = [
    { value: "1,200+", label: "employers hiring" },
    { value: `${site.rating.score}★`, label: `on ${site.rating.source}` },
    { value: "98%", label: "candidate satisfaction" },
  ];

  return (
    <section className="relative overflow-hidden bg-brand-700 text-white">
      {/* Brand field — a committed periwinkle surface, not a glow-blob template */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(120% 100% at 20% 0%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 20% 0%, black 30%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-[38rem] w-[38rem] rounded-full bg-brand-500/40 blur-[130px]" />

      <div className="container-x relative grid items-center gap-14 pt-32 pb-14 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20">
        {/* Left — message + search */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 py-1.5 pl-2 pr-4 text-sm font-medium text-white ring-1 ring-inset ring-white/15">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              25,000+ live roles across 5 industries
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 max-w-xl text-balance font-extrabold tracking-tight"
            style={{ fontSize: "clamp(2.6rem, 1.6rem + 3.4vw, 4.25rem)", lineHeight: 1.04 }}
          >
            Find your next role,{" "}
            <span className="text-accent-400">matched by specialists.</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
            Search thousands of opportunities across healthcare, construction, electrical, tax &amp;
            legal, and IT — with a dedicated recruiter guiding you from first search to signed offer.
          </motion.p>

          {/* Search — solid, crisp, not glass */}
          <motion.form
            variants={item}
            onSubmit={onSearch}
            className="mt-8 max-w-xl rounded-2xl bg-white p-2 shadow-[0_24px_60px_-24px_rgba(6,12,34,0.7)]"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 sm:border-r sm:border-sand-200">
                <Icon name="search" className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Job title or keyword"
                  aria-label="Job title or keyword"
                  className="h-12 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5">
                <Icon name="map-pin" className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="City or state"
                  aria-label="Location"
                  className="h-12 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <Button type="submit" variant="accent" size="lg" className="shrink-0">
                Search
              </Button>
            </div>
          </motion.form>

          <motion.div variants={item} className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
            <span>Popular:</span>
            {["Registered Nurse", "Electrician", "Software Engineer"].map((t) => (
              <a key={t} href={`/jobs?q=${encodeURIComponent(t)}`} className="font-medium text-white underline-offset-4 hover:underline">
                {t}
              </a>
            ))}
          </motion.div>

          {/* Inline trust row — not a big-number stat-card grid */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-6">
            {trust.map((t) => (
              <div key={t.label} className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white">{t.value}</span>
                <span className="text-sm text-white/60">{t.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — live stack of real job cards */}
        <HeroJobStack jobs={jobs} reduce={!!reduce} />
      </div>

      {/* Trusted-by strip */}
      <div className="relative border-t border-white/10 bg-brand-800/40 py-6">
        <div className="container-x">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.14em] text-white/45">
            Opportunities with leading employers
          </p>
          <LogoMarquee invert />
        </div>
      </div>
    </section>
  );
}

function HeroJobStack({ jobs, reduce }: { jobs: Job[]; reduce: boolean }) {
  const cards = jobs.slice(0, 3);
  const stackRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  // Measure how far the chip can travel: full card-stack height minus its own
  // height, so it rides from the top of the first card to the bottom of the last.
  useEffect(() => {
    if (reduce) return;
    const stack = stackRef.current;
    const chip = chipRef.current;
    if (!stack) return;
    const measure = () => {
      const chipH = chip?.offsetHeight ?? 56;
      setTravel(Math.max(0, stack.offsetHeight - chipH));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stack);
    return () => ro.disconnect();
  }, [reduce]);

  if (cards.length === 0) return null;

  return (
    <div className="relative hidden lg:block" aria-hidden>
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
        className="relative mx-auto max-w-md"
      >
        <div ref={stackRef} className="space-y-4">
          {cards.map((job, i) => (
            <motion.a
              key={job.id}
              href={`/jobs/${job.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40, rotate: i === 1 ? -1.5 : 1 }}
              animate={{ opacity: 1, x: 0, rotate: i === 1 ? -1.2 : i === 2 ? 1 : 0 }}
              transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease: EASE }}
              whileHover={reduce ? undefined : { y: -10, rotate: 0, transition: { duration: 0.28, ease: EASE } }}
              className="relative block rounded-2xl border border-white/60 bg-white p-5 shadow-[0_20px_50px_-24px_rgba(6,12,34,0.65)] transition-shadow duration-300 hover:z-10 hover:shadow-[0_36px_72px_-22px_rgba(6,12,34,0.9)]"
              style={{ marginLeft: i === 1 ? "2rem" : i === 2 ? "1rem" : 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-ink-900">{job.title}</div>
                  <div className="mt-0.5 text-xs font-medium text-brand-600">{job.industryName}</div>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">{job.type}</span>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Icon name="map-pin" className="h-3.5 w-3.5" /> {job.location}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-ink-900"><Icon name="trending-up" className="h-3.5 w-3.5 text-emerald-500" /> {job.salary}</span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Status chip — rides the left edge continuously from the top of the
            first card to the bottom of the last card and back. */}
        <motion.div
          ref={chipRef}
          initial={{ opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: [0, travel, 0] }}
          transition={
            reduce
              ? { duration: 0.4 }
              : {
                  opacity: { duration: 0.5, delay: 0.7 },
                  y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
                }
          }
          className="absolute -left-6 top-0 z-30 flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-[0_18px_44px_-16px_rgba(6,12,34,0.65)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Icon name="badge-check" className="h-4.5 w-4.5" />
          </span>
          <div>
            <div className="text-xs font-bold text-ink-900">Application sent</div>
            <div className="text-[11px] text-slate-500">Recruiter reviewing</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
