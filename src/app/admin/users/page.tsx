import { DashHeader, Panel, Table, EmptyState } from "@/components/dashboard/ui";
import { UserRoleSelect } from "@/components/dashboard/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function AdminUsers() {
  const [me, users] = await Promise.all([getCurrentUser(), listUsers()]);

  return (
    <>
      <DashHeader title="Users" subtitle={`${users.length} registered user${users.length === 1 ? "" : "s"}.`} />
      {users.length === 0 ? (
        <EmptyState icon="users" title="No users yet" />
      ) : (
        <Panel>
          <Table head={["Name", "Email", "Company", "Joined", "Role"]}>
            {users.map((u) => (
              <tr key={u.id as string}>
                <td className="px-5 py-3.5 font-semibold text-ink-900">{u.name as string}</td>
                <td className="px-5 py-3.5 text-slate-600">{u.email as string}</td>
                <td className="px-5 py-3.5 text-slate-500">{(u.company as string) || "—"}</td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(u.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <UserRoleSelect id={u.id as string} role={u.role as string} self={u.id === me?.id} />
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
