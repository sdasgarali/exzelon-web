import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { label: "Overview", href: "/employer", icon: "layout-dashboard", exact: true },
  { label: "My Jobs", href: "/employer/jobs", icon: "briefcase" },
  { label: "Post a Job", href: "/employer/jobs/new", icon: "plus" },
  { label: "Applications", href: "/employer/applications", icon: "inbox" },
];

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/employer");
  if (user.role !== "employer") redirect("/");
  return (
    <DashboardShell user={user} nav={nav}>
      {children}
    </DashboardShell>
  );
}
