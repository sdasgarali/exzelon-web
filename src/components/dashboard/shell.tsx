"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/ui/icon";
import { logout, type ClientUser } from "@/components/auth/use-auth";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string; icon: string; exact?: boolean };

const roleLabel: Record<string, string> = { admin: "Administrator", employer: "Employer", seeker: "Job Seeker" };

export function DashboardShell({
  user,
  nav,
  children,
}: {
  user: ClientUser;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/"><Logo invert /></Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive(item)
                ? "bg-brand-600 text-white shadow-[0_10px_24px_-12px_rgba(26,84,224,0.9)]"
                : "text-brand-100/70 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon name={item.icon} className="h-4.5 w-4.5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-white/5 hover:text-white">
          <Icon name="external-link" className="h-4.5 w-4.5" />
          View site
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-brand-100/70 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Icon name="log-out" className="h-4.5 w-4.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink-900 lg:block">{SidebarContent}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-ink-900 lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-sand-200 bg-white/85 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-sand-200 lg:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-500">{roleLabel[user.role]} Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-ink-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
