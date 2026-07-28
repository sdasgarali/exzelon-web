"use client";

import { useState } from "react";
import { Panel, Table, EmptyState } from "@/components/dashboard/ui";

export type ConsentRow = {
  id: string;
  name: string | null;
  email: string | null;
  source: string;
  lastPage: string | null;
  landingPage: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  language: string | null;
  visitCount: number;
  consentedAt: string | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
};

const dash = <span className="text-slate-400">—</span>;

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function locationOf(v: ConsentRow) {
  const parts = [v.city, v.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}
function referrerHost(referrer: string | null) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40);
  }
}

export function ConsentTable({ initial }: { initial: ConsentRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this consent record? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/consent/${id}`, { method: "DELETE" });
      if (res.ok) setRows((r) => r.filter((x) => x.id !== id));
    } catch {
      /* leave the row in place on failure */
    } finally {
      setBusyId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="shield-check"
        title="No consents yet"
        description="When visitors accept the cookie banner, they'll appear here — with any name/email they choose to share."
      />
    );
  }

  return (
    <Panel>
      <Table head={["Name", "Email", "Location", "Device", "Referrer", "Visits", "Consented", ""]}>
        {rows.map((v) => {
          const loc = locationOf(v);
          const device = [v.browser, v.os].filter(Boolean).join(" · ");
          const ref = referrerHost(v.referrer);
          return (
            <tr key={v.id} className="text-slate-700">
              <td className="px-5 py-3.5 font-medium text-ink-900">{v.name || dash}</td>
              <td className="px-5 py-3.5">
                {v.email ? (
                  <a href={`mailto:${v.email}`} className="text-brand-600 hover:underline">{v.email}</a>
                ) : (
                  dash
                )}
              </td>
              <td className="px-5 py-3.5 text-sm">{loc || dash}</td>
              <td className="px-5 py-3.5 text-sm">
                {device ? (
                  <span className="flex items-center gap-1.5">
                    {device}
                    {v.deviceType && (
                      <span className="rounded bg-sand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                        {v.deviceType}
                      </span>
                    )}
                  </span>
                ) : (
                  dash
                )}
              </td>
              <td className="px-5 py-3.5 text-sm">{ref ?? <span className="text-slate-400">Direct</span>}</td>
              <td className="px-5 py-3.5">{v.visitCount}</td>
              <td className="px-5 py-3.5 text-sm">{fmt(v.consentedAt)}</td>
              <td className="px-5 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  disabled={busyId === v.id}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                >
                  {busyId === v.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
    </Panel>
  );
}
