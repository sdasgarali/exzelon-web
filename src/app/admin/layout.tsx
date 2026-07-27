import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "layout-dashboard", exact: true },
  { label: "Analytics", href: "/admin/analytics", icon: "bar-chart" },
  { label: "Jobs", href: "/admin/jobs", icon: "briefcase" },
  { label: "Applications", href: "/admin/applications", icon: "inbox" },
  { label: "Messages", href: "/admin/messages", icon: "message-circle" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Audit log", href: "/admin/audit", icon: "shield-check" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return (
    <DashboardShell user={user} nav={nav}>
      {children}
    </DashboardShell>
  );
}
