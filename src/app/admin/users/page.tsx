import { DashHeader, EmptyState } from "@/components/dashboard/ui";
import { UsersTable, type AdminUser } from "@/components/dashboard/users-table";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/db/repo";

export default async function AdminUsers() {
  const [me, users] = await Promise.all([getCurrentUser(), listUsers()]);

  const rows: AdminUser[] = users.map((u) => ({
    id: String(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    company: u.company ? String(u.company) : "",
    role: String(u.role ?? "seeker"),
    createdAt: String(u.createdAt ?? ""),
  }));

  return (
    <>
      <DashHeader title="Users" subtitle={`${users.length} registered user${users.length === 1 ? "" : "s"}.`} />
      {users.length === 0 ? (
        <EmptyState icon="users" title="No users yet" />
      ) : (
        <UsersTable users={rows} meId={String(me?.id ?? "")} />
      )}
    </>
  );
}
