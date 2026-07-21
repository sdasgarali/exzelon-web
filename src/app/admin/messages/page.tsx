import { DashHeader, EmptyState } from "@/components/dashboard/ui";
import { MessagesTable, type AdminMessage } from "@/components/dashboard/messages-table";
import { listContacts } from "@/lib/db/repo";

export default async function AdminMessages() {
  const contacts = await listContacts();

  const rows: AdminMessage[] = contacts.map((m) => ({
    id: String(m.id),
    name: String(m.name ?? ""),
    email: String(m.email ?? ""),
    interest: String(m.interest ?? "general"),
    subject: String(m.subject ?? ""),
    message: String(m.message ?? ""),
    status: String(m.status ?? "new"),
    createdAt: String(m.createdAt ?? ""),
  }));

  return (
    <>
      <DashHeader title="Messages" subtitle={`${contacts.length} contact submission${contacts.length === 1 ? "" : "s"}.`} />
      {contacts.length === 0 ? (
        <EmptyState icon="message-circle" title="No messages yet" description="Contact form submissions will appear here." />
      ) : (
        <MessagesTable messages={rows} />
      )}
    </>
  );
}
