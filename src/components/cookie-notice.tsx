"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * Informational cookie notice. Analytics (AccessHub) loads regardless — this just tells
 * visitors about cookie use and remembers dismissal in a first-party cookie so it shows once.
 * Re-openable from the footer via the `exz:open-cookie-notice` window event.
 */
const NOTICE_COOKIE = "exz_cookie_notice";

function isDismissed(): boolean {
  return document.cookie.split("; ").some((c) => c === `${NOTICE_COOKIE}=1`);
}

function rememberDismissed() {
  const secure = location.protocol === "https:" ? "; secure" : "";
  // 1 year
  document.cookie = `${NOTICE_COOKIE}=1; path=/; max-age=31536000; samesite=lax${secure}`;
}

export function CookieNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Defer the first show past mount: keeps SSR/CSR in sync and avoids sync setState-in-effect.
    const raf = requestAnimationFrame(() => {
      if (!isDismissed()) setOpen(true);
    });
    const reopen = () => setOpen(true);
    window.addEventListener("exz:open-cookie-notice", reopen);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("exz:open-cookie-notice", reopen);
    };
  }, []);

  if (!open) return null;

  const dismiss = () => {
    rememberDismissed();
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[60] motion-safe:animate-[fadeUp_0.35s_ease-out]"
    >
      <div className="container-x pb-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-white/95 p-4 shadow-xl shadow-ink-900/10 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-5 sm:p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name="shield-check" className="h-5 w-5" />
          </span>
          <p className="flex-1 text-sm leading-relaxed text-slate-600">
            We use cookies and similar technologies to analyze traffic and improve your experience.
            By continuing to use this site, you agree to our use of cookies.{" "}
            <Link href="/resources/compliance" className="font-semibold text-brand-600 hover:text-brand-700">
              Learn more
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
