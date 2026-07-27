"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type State = "verifying" | "success" | "error";

export function VerifyEmailClient() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<State>(() => (token ? "verifying" : "error"));
  const [message, setMessage] = useState(() =>
    token ? "" : "This verification link is missing its token."
  );
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React strict-mode double-invoke
    ran.current = true;
    if (!token) return; // missing-token state already set at init

    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error ?? "Verification failed");
        setState("success");
      } catch (err) {
        setState("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    })();
  }, [token]);

  if (state === "verifying") {
    return <p className="text-sm text-slate-600">Verifying your email…</p>;
  }

  if (state === "success") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          Your email is verified. Thanks for confirming!
        </div>
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Continue to sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-rose-50 px-4 py-4 text-sm text-rose-700">{message}</div>
      <p className="text-sm text-slate-600">
        You can request a new link from your account once signed in, or{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">sign in</Link>.
      </p>
    </div>
  );
}
