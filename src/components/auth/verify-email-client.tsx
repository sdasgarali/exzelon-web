"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type State = "verifying" | "otp" | "success" | "error";

export function VerifyEmailClient() {
  const token = useSearchParams().get("token") ?? "";
  // With a token in the URL we auto-verify the link; otherwise we ask for the 6-digit code.
  const [state, setState] = useState<State>(() => (token ? "verifying" : "otp"));
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React strict-mode double-invoke
    ran.current = true;
    if (!token) return; // OTP-entry state already set at init

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

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the 6-digit code from your email.");
      return;
    }
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Verification failed");
      setState("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    setResent(false);
    setMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) setResent(true);
      else setMessage("Sign in first, then resend your code.");
    } catch {
      setMessage("Couldn't resend right now — try again shortly.");
    }
  };

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

  if (state === "otp") {
    return (
      <form onSubmit={submitOtp} className="space-y-4" noValidate>
        <p className="text-sm text-slate-600">
          Enter the 6-digit code we emailed you, or open the link in that email from this device.
        </p>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-label="6-digit verification code"
          placeholder="••••••"
          className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        {message && <p className="text-sm font-medium text-rose-700">{message}</p>}
        {resent && <p className="text-sm font-medium text-emerald-700">New code sent — check your inbox.</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending || otp.length !== 6}>
          {pending ? "Verifying…" : "Verify email"}
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

  // error (bad/expired link) — offer the code path as a fallback
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-rose-50 px-4 py-4 text-sm text-rose-700">{message}</div>
      <p className="text-sm text-slate-600">
        You can{" "}
        <button
          type="button"
          onClick={() => {
            setState("otp");
            setMessage("");
          }}
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          enter the 6-digit code
        </button>{" "}
        instead, or{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">sign in</Link>{" "}
        to request a new one.
      </p>
    </div>
  );
}
