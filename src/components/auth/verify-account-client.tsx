"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/** OTP gate shown right after registration — no account exists until the code is confirmed. */
export function VerifyAccountClient() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const nextParam = params.get("next");
  const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : null;

  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Verification failed");

      // Account created + signed in — land on the right page.
      let dest: string;
      if (body.user?.role === "seeker") {
        dest = safeNext
          ? `/account/profile?next=${encodeURIComponent(safeNext)}`
          : "/account/profile";
      } else {
        dest = safeNext ?? "/employer";
      }
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setPending(false);
    }
  };

  const resend = async () => {
    setResent(false);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-registration", { method: "POST" });
      if (res.ok) setResent(true);
      else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Couldn't resend right now.");
      }
    } catch {
      setError("Couldn't resend right now — try again shortly.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {email && (
        <p className="text-sm text-slate-600">
          We sent a code to <span className="font-semibold text-ink-900">{email}</span>.
        </p>
      )}
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        aria-label="6-digit verification code"
        placeholder="••••••"
        autoFocus
        className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}
      {resent && <p className="text-sm font-medium text-emerald-700">New code sent — check your inbox.</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending || otp.length !== 6}>
        {pending ? "Verifying…" : "Create my account"}
      </Button>
      <p className="text-center text-sm text-slate-500">
        Didn&apos;t get it?{" "}
        <button type="button" onClick={resend} className="font-semibold text-brand-600 hover:text-brand-700">
          Resend code
        </button>
      </p>
    </form>
  );
}
