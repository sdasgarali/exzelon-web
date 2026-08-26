import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { homeStats } from "@/content/site-content";

/** Light social-proof band: animated key metrics, count-up on scroll (reduced-motion safe). */
export function StatsStrip() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* dot texture + soft corner tints — same layout as the footer, tuned for a light surface */}
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-70" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" aria-hidden />
      <div className="container-x relative py-16 sm:py-20">
        <dl className="grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-8">
          {homeStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-5xl font-extrabold tracking-tight text-brand-600 sm:text-6xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {s.label}
              </p>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
