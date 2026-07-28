"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Dismissible banner shown to signed-in users whose email isn't verified yet. */
export function VerifyEmailBanner() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const resend = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span className="flex items-center gap-2">
        <Icon name="alert-triangle" className="h-4 w-4 shrink-0" />
        {state === "sent"
          ? "Verification email sent — check your inbox."
          : "Please verify your email address to secure your account."}
      </span>
      {state !== "sent" && (
        <span className="flex items-center gap-3">
          <Link
            href="/verify-email"
            className="text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
          >
            Enter code →
          </Link>
          <button
            type="button"
            onClick={resend}
            disabled={state === "sending"}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : state === "error" ? "Retry" : "Resend email"}
          </button>
        </span>
      )}
    </div>
  );
}
