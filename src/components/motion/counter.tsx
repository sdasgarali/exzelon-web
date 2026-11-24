"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/utils";

/** Counts up to `value` when scrolled into view. */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1600,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  // The first render — including the server render — carries the final number, not zero. It used
  // to start at 0, so the home page's proof band shipped "0% retention / 0+ placements / 0h
  // average time to shortlist" in the HTML: a false claim in the markup, and the only version a
  // non-rendering crawler (GPTBot, most answer-engine fetchers, link-preview scrapers) ever reads.
  // The count-up is now a client-side enhancement layered on top of the correct value.
  const [display, setDisplay] = useState(value);
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || reduce || animated.current) return;
    animated.current = true;
    let raf = 0;
    let start: number | null = null;
    setDisplay(0);
    const tick = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(display)}
      {suffix}
    </span>
  );
}
