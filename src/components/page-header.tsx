import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs = [],
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900 pt-32 pb-16 text-white sm:pt-40 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -left-32 -top-24 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-accent-500/15 blur-3xl" />

      <div className="container-x relative">
        <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
          <Reveal>
            <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm text-brand-100/60", align === "center" && "justify-center")}>
              <Link href="/" className="transition-colors hover:text-white">Home</Link>
              {crumbs.map((c) => (
                <span key={c.label} className="flex items-center gap-2">
                  <Icon name="chevron-down" className="h-3.5 w-3.5 -rotate-90" />
                  {c.href ? (
                    <Link href={c.href} className="transition-colors hover:text-white">{c.label}</Link>
                  ) : (
                    <span className="text-brand-100">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </Reveal>

          {eyebrow && (
            <Reveal delay={0.05}>
              <span className="eyebrow mt-6 inline-flex text-brand-300">{eyebrow}</span>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <h1 className="display-2 mt-3 font-extrabold text-balance">{title}</h1>
          </Reveal>
          {description && (
            <Reveal delay={0.15}>
              <p className={cn("mt-5 text-lg leading-relaxed text-brand-100/80 text-pretty", align === "center" && "mx-auto max-w-2xl")}>
                {description}
              </p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.2}>
              <div className={cn("mt-8 flex flex-wrap gap-3", align === "center" && "justify-center")}>{children}</div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
