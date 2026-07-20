"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/components/auth/use-auth";
import { cn } from "@/lib/utils";

/**
 * Self-contained save-toggle for a job. Fetches its own auth + saved state so
 * the job detail page can stay statically cached (ISR).
 */
export function JobSaveButton({ slug }: { slug: string }) {
  const { user, loading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role !== "seeker") return;
    fetch("/api/saved")
      .then((r) => r.json())
      .then((d) => setSaved((d.saved as string[])?.includes(slug) ?? false))
      .catch(() => {});
  }, [user, slug]);

  // Not logged in → prompt sign-in. Employers/admins don't save jobs.
  if (loading) return null;
  if (!user) {
    return (
      <Link
        href={`/login?next=/jobs/${slug}`}
        className="inline-flex items-center gap-2 rounded-full border border-sand-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <Icon name="bookmark" className="h-4 w-4" /> Save job
      </Link>
    );
  }
  if (user.role !== "seeker") return null;

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobSlug: slug }),
      });
      const d = await res.json();
      setSaved((d.saved as string[])?.includes(slug) ?? false);
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
        saved
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-sand-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
      )}
    >
      <Icon name="bookmark" className={cn("h-4 w-4", saved && "fill-brand-600")} />
      {saved ? "Saved" : "Save job"}
    </button>
  );
}
