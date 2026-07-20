import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CtaBanner({
  title = "Let's get connected and start finding your dream job",
  subtitle = "Whether you're hunting for your next role or building a world-class team, Exzelon is your partner from first hello to first day.",
  primary = { label: "Browse Jobs", href: "/jobs" },
  secondary = { label: "Hire Talent", href: "/for-clients" },
}: {
  title?: string;
  subtitle?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-ink-900 px-6 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="display-2 text-3xl font-bold text-white text-balance sm:text-4xl">{title}</h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-brand-100/80 text-pretty">{subtitle}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ButtonLink href={primary.href} variant="accent" size="lg">
                  {primary.label}
                </ButtonLink>
                <ButtonLink href={secondary.href} variant="light" size="lg">
                  {secondary.label}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
