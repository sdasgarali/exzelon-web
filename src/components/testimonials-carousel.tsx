"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { testimonials } from "@/content/site-content";
import { Icon } from "@/components/ui/icon";

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const t = testimonials[index];

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="relative mx-auto max-w-3xl">
      <Icon name="quote" className="mx-auto h-12 w-12 text-brand-200" />
      <div className="relative mt-6 min-h-[11rem]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-balance text-xl font-medium leading-relaxed text-ink-900 sm:text-2xl">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-6">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Icon key={i} name="star" className="h-4 w-4 fill-accent-500 text-accent-500" />
                ))}
              </div>
              <div className="mt-3 font-semibold text-ink-900">{t.name}</div>
              <div className="text-sm text-slate-500">{t.role}</div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={
              "h-2 rounded-full transition-all duration-300 " +
              (i === index ? "w-8 bg-brand-600" : "w-2 bg-sand-300 hover:bg-slate-400")
            }
          />
        ))}
      </div>
    </div>
  );
}
