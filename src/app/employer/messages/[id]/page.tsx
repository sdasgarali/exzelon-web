import Link from "next/link";
import { notFound } from "next/navigation";
import { DashHeader } from "@/components/dashboard/ui";
import { MessageThread } from "@/components/messaging/message-thread";
import { Icon } from "@/components/ui/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { getThreadContext } from "@/lib/db/repo";

export default async function EmployerMessages({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const ctx = await getThreadContext(id);
  // Only the employer who owns the job may open the thread.
  if (!ctx || ctx.employerId !== user!.id) notFound();

  const applicantName = (ctx.application.name as string) ?? "Applicant";

  return (
    <>
      <DashHeader title={applicantName} subtitle={`Conversation · ${ctx.jobTitle}`} />
      <Link href="/employer/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        <Icon name="arrow-right" className="h-4 w-4 rotate-180" /> Back to applications
      </Link>
      <div className="max-w-2xl">
        <MessageThread applicationId={id} />
      </div>
    </>
  );
}
