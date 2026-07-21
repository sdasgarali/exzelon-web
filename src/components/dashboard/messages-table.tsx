"use client";

import { useMemo, useState } from "react";
import { Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ContactReadButton } from "@/components/dashboard/actions";
import { DashToolbar, FilterSelect } from "@/components/dashboard/filters";
import { timeAgo } from "@/lib/utils";

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  interest: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "Unread" },
  { value: "read", label: "Read" },
];

const INTEREST_OPTIONS = [
  { value: "all", label: "All interests" },
  { value: "job-seeker", label: "Job seeker" },
  { value: "employer", label: "Employer" },
  { value: "general", label: "General" },
];

export function MessagesTable({ messages }: { messages: AdminMessage[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [interest, setInterest] = useState("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return messages.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (interest !== "all" && m.interest !== interest) return false;
      if (!needle) return true;
      return (
        m.name.toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle) ||
        m.subject.toLowerCase().includes(needle) ||
        m.message.toLowerCase().includes(needle)
      );
    });
  }, [messages, q, status, interest]);

  return (
    <>
      <DashToolbar
        search={q}
        onSearch={setQ}
        placeholder="Search name, email, subject, message…"
        count={`${filtered.length} of ${messages.length}`}
      >
        <FilterSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} label="Filter by status" />
        <FilterSelect value={interest} onChange={setInterest} options={INTEREST_OPTIONS} label="Filter by interest" />
      </DashToolbar>

      {filtered.length === 0 ? (
        <EmptyState icon="message-circle" title="No matching messages" description="Try a different search or filter." />
      ) : (
        <Panel>
          <Table head={["From", "Interest", "Subject", "Message", "When", "Status", ""]}>
            {filtered.map((m) => (
              <tr key={m.id} className={m.status === "new" ? "bg-brand-50/30" : ""}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{m.name}</div>
                  <a href={`mailto:${m.email}`} className="text-xs text-brand-600 hover:underline">{m.email}</a>
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={m.interest} /></td>
                <td className="px-5 py-3.5 font-medium text-slate-700">{m.subject}</td>
                <td className="max-w-xs px-5 py-3.5 text-slate-500"><span className="line-clamp-2">{m.message}</span></td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(m.createdAt)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3.5"><ContactReadButton id={m.id} read={m.status === "read"} /></td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
