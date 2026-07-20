"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b?.error ?? "Request failed");
  }
  return res.json();
}

export function JobRowActions({ slug, editBase }: { slug: string; editBase: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setBusy(true);
    try {
      await send(`/api/jobs/${slug}`, "DELETE");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/jobs/${slug}`} target="_blank" className="rounded-lg p-2 text-slate-400 hover:bg-sand-100 hover:text-brand-600" title="View">
        <Icon name="eye" className="h-4 w-4" />
      </Link>
      <Link href={`${editBase}/${slug}/edit`} className="rounded-lg p-2 text-slate-400 hover:bg-sand-100 hover:text-brand-600" title="Edit">
        <Icon name="pencil" className="h-4 w-4" />
      </Link>
      <button onClick={onDelete} disabled={busy} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" title="Delete">
        <Icon name="trash-2" className="h-4 w-4" />
      </button>
    </div>
  );
}

const APP_STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;

export function ApplicationStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);

  const onChange = async (next: string) => {
    setBusy(true);
    setValue(next);
    try {
      await send(`/api/applications/${id}`, "PATCH", { status: next });
      router.refresh();
    } catch {
      setValue(status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      className={cn("rounded-lg border border-sand-200 bg-white px-2.5 py-1.5 text-xs font-semibold capitalize outline-none focus:border-brand-400")}
    >
      {APP_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

export function UserRoleSelect({ id, role, self }: { id: string; role: string; self: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [busy, setBusy] = useState(false);

  const onChange = async (next: string) => {
    setBusy(true);
    setValue(next);
    try {
      await send(`/api/users/${id}`, "PATCH", { role: next });
      router.refresh();
    } catch (e) {
      setValue(role);
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (self) return <span className="text-xs text-slate-400">You</span>;

  return (
    <select
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-sand-200 bg-white px-2.5 py-1.5 text-xs font-semibold capitalize outline-none focus:border-brand-400"
    >
      {["admin", "employer", "seeker"].map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

export function SaveJobButton({ slug, saved: initial }: { slug: string; saved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      const res = await send("/api/saved", "POST", { jobSlug: slug });
      setSaved((res.saved as string[]).includes(slug));
      router.refresh();
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
        saved
          ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          : "border-sand-200 text-slate-600 hover:border-brand-300 hover:text-brand-700"
      )}
    >
      <Icon name="bookmark" className="h-3.5 w-3.5" />
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function ContactReadButton({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [isRead, setIsRead] = useState(read);

  const onClick = async () => {
    if (isRead) return;
    setBusy(true);
    try {
      await send(`/api/contacts/${id}`, "PATCH");
      setIsRead(true);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy || isRead}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
        isRead ? "text-slate-400" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
      )}
    >
      {isRead ? "Read" : "Mark read"}
    </button>
  );
}
