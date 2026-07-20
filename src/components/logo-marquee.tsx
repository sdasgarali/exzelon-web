import { employerLogos } from "@/content/site-content";
import { cn } from "@/lib/utils";

export function LogoMarquee({ invert = false }: { invert?: boolean }) {
  const items = [...employerLogos, ...employerLogos];
  return (
    <div className="mask-fade-x overflow-hidden">
      <div className="flex w-max animate-[var(--animate-marquee)] items-center gap-12 hover:[animation-play-state:paused]">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className={cn(
              "shrink-0 text-lg font-semibold tracking-tight",
              invert ? "text-white/55" : "text-slate-400"
            )}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
