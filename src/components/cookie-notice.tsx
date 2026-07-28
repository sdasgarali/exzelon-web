"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * Cookie consent banner. Accepting sets a first-party cookie (so it shows once) and records
 * the decision — with an OPTIONAL name/email — to /api/analytics/consent, surfaced to admins
 * under Cookie Consent. Analytics still load regardless (per the informational-banner choice);
 * the consent flag + lead capture is what's recorded here.
 * Re-openable from the footer via the `exz:open-cookie-notice` window event.
 */
const NOTICE_COOKIE = "exz_cookie_notice";
const SESSION_KEY = "exz_session";
const SOURCE = "exz-web";

function isDecided(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${NOTICE_COOKIE}=`));
}

function remember(status: "accepted" | "declined") {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${NOTICE_COOKIE}=${status}; path=/; max-age=31536000; samesite=lax${secure}`;
}

function getSessionId(): string {
  const fresh = () => "exz_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = fresh();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return fresh();
  }
}

export function CookieNotice() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!isDecided()) setOpen(true);
    });
    const reopen = () => setOpen(true);
    window.addEventListener("exz:open-cookie-notice", reopen);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("exz:open-cookie-notice", reopen);
    };
  }, []);

  if (!open) return null;

  const decide = async (status: "accepted" | "declined") => {
    setBusy(true);
    remember(status);
    const cleanEmail = /.+@.+\..+/.test(email.trim()) ? email.trim() : "";
    try {
      await fetch("/api/analytics/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId: getSessionId(),
          source: SOURCE,
          status,
          ...(status === "accepted" ? { name: name.trim(), email: cleanEmail } : {}),
        }),
      });
    } catch {
      /* never block the page */
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[60] motion-safe:animate-[fadeUp_0.35s_ease-out]"
    >
      <div className="container-x pb-4">
        <div className="rounded-2xl border border-sand-200 bg-white/95 p-4 shadow-xl shadow-ink-900/10 backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name="shield-check" className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-slate-600">
                We use cookies to analyze traffic and improve your experience. Want new job alerts?
                Leave your details (optional).{" "}
                <Link href="/resources/compliance" className="font-semibold text-brand-600 hover:text-brand-700">
                  Learn more
                </Link>
                .
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  aria-label="Name"
                  className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-40"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional)"
                  aria-label="Email"
                  className="w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-56"
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => decide("declined")}
                disabled={busy}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-ink-900 disabled:opacity-60"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                disabled={busy}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? "Saving…" : "Accept"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
