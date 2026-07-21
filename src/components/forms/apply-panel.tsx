"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/use-auth";
import { Textarea, Label } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type ProfileData = {
  complete: boolean;
  missing: string[];
  resumeUrl?: string;
  name?: string;
  email?: string;
};

export function ApplyPanel({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const { user, loading: authLoading } = useAuth();
  const next = `/jobs/${jobId}`;

  // null = not yet fetched. Only ever set inside the async fetch callback (no
  // synchronous setState in the effect body — React 19 lint bans that).
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || user?.role !== "seeker") return;
    let active = true;
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setProfile({
          complete: !!d.complete,
          missing: d.missing ?? [],
          resumeUrl: d.profile?.resumeUrl,
          name: d.account?.name,
          email: d.account?.email,
        });
      })
      .catch(() => active && setProfile({ complete: false, missing: [] }));
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const submit = async () => {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, jobTitle, coverLetter }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (body?.code === "profile_incomplete") {
          setProfile((p) => ({ ...(p ?? { complete: false, missing: [] }), complete: false, missing: body.missing ?? p?.missing ?? [] }));
          throw new Error("Please complete your profile before applying.");
        }
        throw new Error(body?.error ?? "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  // --- Success ---
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-ink-900">Application received!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thanks for applying to <strong>{jobTitle}</strong>. A recruiter will review your application
          and reach out shortly.
        </p>
      </motion.div>
    );
  }

  // --- Loading (auth, or seeker profile not fetched yet) ---
  if (authLoading || (user?.role === "seeker" && !profile)) {
    return <div className="h-40 animate-pulse rounded-xl bg-sand-100" />;
  }

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name="user-round" className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm text-slate-600">
          Sign in or create a free candidate account to apply for this role.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <ButtonLink href={`/login?next=${encodeURIComponent(next)}`} size="lg" className="w-full">
            Sign in to apply <Icon name="arrow-right" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={`/register?next=${encodeURIComponent(next)}`} variant="outline" size="lg" className="w-full">
            Create an account
          </ButtonLink>
        </div>
      </div>
    );
  }

  // --- Signed in as employer / admin ---
  if (user.role !== "seeker") {
    return (
      <div className="rounded-xl border border-sand-200 bg-sand-50 p-6 text-center text-sm text-slate-600">
        You&apos;re signed in as a{user.role === "admin" ? "n admin" : "n employer"}. Applications are
        for candidate accounts.
      </div>
    );
  }

  // Seeker past the loading guard always has a fetched profile; narrow for TS.
  if (!profile) return <div className="h-40 animate-pulse rounded-xl bg-sand-100" />;

  // --- Seeker, profile incomplete ---
  if (!profile.complete) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Icon name="clock" className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-ink-900">One quick step before you apply</p>
        <p className="mt-1 text-sm text-slate-600">
          Complete your profile{profile.missing.length ? ` — still needed: ${profile.missing.join(", ")}` : ""}.
        </p>
        <ButtonLink href={`/account/profile?next=${encodeURIComponent(next)}`} size="lg" className="mt-5 w-full">
          Complete your profile <Icon name="arrow-right" className="h-4 w-4" />
        </ButtonLink>
      </div>
    );
  }

  // --- Seeker, ready to apply ---
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-sand-200 bg-sand-50 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-ink-900">
          <Icon name="user-round" className="h-4 w-4 text-brand-600" /> {profile.name}
        </div>
        <div className="mt-1 text-slate-500">{profile.email}</div>
        {profile.resumeUrl && (
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
          >
            <Icon name="file-text" className="h-4 w-4" /> View resume
          </a>
        )}
        <Link href="/account/profile" className="mt-2 block text-xs text-slate-400 hover:text-slate-600">
          Edit profile
        </Link>
      </div>

      <div>
        <Label htmlFor="coverLetter">Cover note (optional)</Label>
        <Textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell us why you're a great fit…"
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="button" size="lg" className="w-full" disabled={status === "submitting"} onClick={submit}>
        {status === "submitting" ? "Submitting…" : "Submit application"}
        {status !== "submitting" && <Icon name="send" className="h-4 w-4" />}
      </Button>
      <p className="text-center text-xs text-slate-400">
        By applying you agree to be contacted by an Exzelon recruiter about this role.
      </p>
    </div>
  );
}
