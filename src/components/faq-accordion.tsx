"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { faqs } from "@/content/site-content";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className={cn("font-semibold transition-colors", isOpen ? "text-brand-700" : "text-ink-900")}>
                {item.q}
              </span>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                  isOpen ? "rotate-180 border-brand-600 bg-brand-600 text-white" : "border-sand-200 text-slate-500"
                )}
              >
                <Icon name="chevron-down" className="h-4 w-4" />
              </span>
            </button>
            {/* The answer is always in the HTML and collapsed with height/opacity, not
                unmounted. Two reasons: the page publishes FAQPage structured data built
                from these same answers, and Google requires that answer text to be on the
                page; and answer engines that do not execute JavaScript could previously
                see only the one open question. The toggle still animates exactly as before. */}
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
              aria-hidden={!isOpen}
            >
              <p className="px-6 pb-6 leading-relaxed text-slate-600">{item.a}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
