"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * First-party visitor tracking (same-origin → no cross-origin block). Fires a page-view
 * beacon to /api/analytics/track on first load and every client-side route change. This is
 * the data source behind /api/v1/analytics, which AccessHub pulls. Silent-fail by design.
 */
const SESSION_KEY = "exz_session";
const SOURCE = "exz-web";

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

function hasConsent(): boolean {
  try {
    // The cookie notice sets exz_cookie_notice=accepted when the visitor accepts.
    return document.cookie.split("; ").some((c) => c === "exz_cookie_notice=accepted");
  } catch {
    return false;
  }
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId: getSessionId(),
        path: pathname,
        source: SOURCE,
        consent: hasConsent(),
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      }),
    }).catch(() => {
      /* never break the page */
    });
  }, [pathname]);

  return null;
}
