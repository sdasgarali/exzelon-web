"use client";

import { useMemo, useState } from "react";
import { Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { ApplicationStatusSelect } from "@/components/dashboard/actions";
import { DashToolbar, FilterSelect } from "@/components/dashboard/filters";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils";

export type AdminApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
  createdAt: string;
  resumeUrl: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

export function ApplicationsTable({ apps }: { apps: AdminApplication[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [job, setJob] = useState("all");

  const jobOptions = useMemo(() => {
    const titles = Array.from(new Set(apps.map((a) => a.jobTitle))).sort();
    return [{ value: "all", label: "All roles" }, ...titles.map((t) => ({ value: t, label: t }))];
  }, [apps]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return apps.filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (job !== "all" && a.jobTitle !== job) return false;
      if (!needle) return true;
      return (
        a.name.toLowerCase().includes(needle) ||
        a.email.toLowerCase().includes(needle) ||
        a.jobTitle.toLowerCase().includes(needle)
      );
    });
  }, [apps, q, status, job]);

  return (
    <>
      <DashToolbar
        search={q}
        onSearch={setQ}
        placeholder="Search name, email, role…"
        count={`${filtered.length} of ${apps.length}`}
      >
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Filter by status" />
        <FilterSelect value={job} onChange={setJob} options={jobOptions} label="Filter by role" />
      </DashToolbar>

      {filtered.length === 0 ? (
        <EmptyState title="No matching applications" description="Try a different search or filter." />
      ) : (
        <Panel>
          <Table head={["Candidate", "Contact", "Role", "Applied", "Status"]}>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{a.name}</div>
                  {a.resumeUrl && (
                    <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                      <Icon name="external-link" className="h-3 w-3" /> Resume
                    </a>
                  )}
                </td>
                <td className="px-5 py-3.5 text-slate-600">
                  <div>{a.email}</div>
                  {a.phone && <div className="text-xs text-slate-400">{a.phone}</div>}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{a.jobTitle}</td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(a.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <ApplicationStatusSelect id={a.id} status={a.status} />
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
