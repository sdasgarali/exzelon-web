import Link from "next/link";
import { notFound } from "next/navigation";
import { DashHeader } from "@/components/dashboard/ui";
import { MessageThread } from "@/components/messaging/message-thread";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { getThreadContext } from "@/lib/db/repo";

export default async function SeekerMessages({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await getThreadContext(id);
  // Only the applicant who owns this application may open the thread.
  if (!ctx || ctx.seekerId !== user!.id) notFound();

  return (
    <>
      <DashHeader title={ctx.jobTitle} subtitle="Your conversation with the employer." />
      <Link href="/account/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <Icon name="arrow-right" className="h-4 w-4 rotate-180" /> Back to applications
      </Link>
      <div className="max-w-2xl">
        <MessageThread applicationId={id} />
      </div>
    </>
  );
}
