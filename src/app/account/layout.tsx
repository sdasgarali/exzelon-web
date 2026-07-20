import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { label: "Overview", href: "/account", icon: "layout-dashboard", exact: true },
  { label: "My Applications", href: "/account/applications", icon: "inbox" },
  { label: "Saved Jobs", href: "/account/saved", icon: "bookmark" },
  { label: "Profile", href: "/account/profile", icon: "user-round" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.role !== "seeker") redirect("/");
  return (
    <DashboardShell user={user} nav={nav}>
      {children}
    </DashboardShell>
  );
}
