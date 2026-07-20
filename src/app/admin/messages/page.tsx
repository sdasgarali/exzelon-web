import { DashHeader, Panel, Table, StatusBadge, EmptyState } from "@/components/dashboard/ui";
import { ContactReadButton } from "@/components/dashboard/actions";
import { listContacts } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils";

export default async function AdminMessages() {
  const contacts = await listContacts();

  return (
    <>
      <DashHeader title="Messages" subtitle={`${contacts.length} contact submission${contacts.length === 1 ? "" : "s"}.`} />
      {contacts.length === 0 ? (
        <EmptyState icon="message-circle" title="No messages yet" description="Contact form submissions will appear here." />
      ) : (
        <Panel>
          <Table head={["From", "Interest", "Subject", "Message", "When", "Status", ""]}>
            {contacts.map((m) => (
              <tr key={m.id as string} className={(m.status as string) === "new" ? "bg-brand-50/30" : ""}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-ink-900">{m.name as string}</div>
                  <a href={`mailto:${m.email}`} className="text-xs text-brand-600 hover:underline">{m.email as string}</a>
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={m.interest as string} /></td>
                <td className="px-5 py-3.5 font-medium text-slate-700">{m.subject as string}</td>
                <td className="max-w-xs px-5 py-3.5 text-slate-500"><span className="line-clamp-2">{m.message as string}</span></td>
                <td className="px-5 py-3.5 text-slate-500">{timeAgo(m.createdAt)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={m.status as string} /></td>
                <td className="px-5 py-3.5"><ContactReadButton id={m.id as string} read={(m.status as string) === "read"} /></td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </>
  );
}
