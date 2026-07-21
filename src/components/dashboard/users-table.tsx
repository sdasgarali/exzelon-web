"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { UserRoleSelect } from "@/components/dashboard/actions";
import { DashToolbar, FilterSelect } from "@/components/dashboard/filters";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { timeAgo } from "@/lib/utils";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  createdAt: string;
};

const ROLE_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "admin", label: "Admin" },
  { value: "employer", label: "Employer" },
  { value: "seeker", label: "Seeker" },
];

export function UsersTable({ users, meId }: { users: AdminUser[]; meId: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!needle) return true;
      return (
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.company.toLowerCase().includes(needle)
      );
    });
  }, [users, q, role]);

  const onDelete = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.name} (${u.email})? This cannot be undone.`)) return;
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      alert(b?.error ?? "Failed to delete user");
      return;
    }
    router.refresh();
  };

  return (
    <>
      <DashToolbar
        search={q}
        onSearch={setQ}
        placeholder="Search name, email, company…"
        count={`${filtered.length} of ${users.length}`}
      >
        <FilterSelect value={role} onChange={setRole} options={ROLE_OPTIONS} label="Filter by role" />
      </DashToolbar>

      {filtered.length === 0 ? (
        <EmptyState icon="users" title="No matching users" description="Try a different search or filter." />
      ) : (
        <Panel>
          <Table head={["Name", "Email", "Company", "Joined", "Role", "Actions"]}>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3.5 font-semibold text-ink-900">
                  {u.name}
                  {u.id === meId && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}
                </td>
                <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                <td className="px-5 py-3.5 text-slate-500">{u.company || "—"}</td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(u.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <UserRoleSelect id={u.id} role={u.role} self={u.id === meId} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(u)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-sand-100 hover:text-brand-600"
                      title="Edit user"
                    >
                      <Icon name="pencil" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      disabled={u.id === meId}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                      title={u.id === meId ? "You can't delete yourself" : "Delete user"}
                    >
                      <Icon name="trash-2" className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}

      {editing && (
        <EditUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (typeof document === "undefined") return null;

  const save = async () => {
    setError(null);
    if (name.trim().length < 2) return setError("Name is too short.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError("Enter a valid email.");
    if (password && password.length < 8) return setError("Password must be at least 8 characters.");

    setBusy(true);
    try {
      const body: Record<string, string> = { name: name.trim(), email: email.trim(), company: company.trim() };
      if (password) body.password = password;
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? "Failed to save");
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-sand-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">Edit user</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-sand-100 hover:text-ink-900">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="eu-name" required>Full name</Label>
            <Input id="eu-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="eu-email" required>Email</Label>
            <Input id="eu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="eu-company">Company</Label>
            <Input id="eu-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="—" />
          </div>
          <div>
            <Label htmlFor="eu-password">Set new password</Label>
            <Input
              id="eu-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-400">Min 8 characters. Only changes if you enter something.</p>
          </div>

          {error && <FieldError message={error} />}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
