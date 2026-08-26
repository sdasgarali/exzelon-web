import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { homeStats } from "@/content/site-content";

/** Dark social-proof band: animated key metrics, count-up on scroll (reduced-motion safe). */
export function StatsStrip() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-white">
      {/* subtle dot-grid + centered glow — matches the brand's dark surfaces */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[42rem] max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[130px]"
        aria-hidden
      />
      <div className="container-x relative py-16 sm:py-20">
        <dl className="grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-8">
          {homeStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-5xl font-extrabold tracking-tight text-brand-300 [text-shadow:0_0_44px_rgba(88,151,251,0.5)] sm:text-6xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                {s.label}
              </p>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
