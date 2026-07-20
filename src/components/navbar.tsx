"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useAuth, HOME_FOR } from "@/components/auth/use-auth";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-sand-200 bg-white/85 backdrop-blur-xl shadow-[0_4px_24px_-16px_rgba(15,35,79,0.4)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="container-x flex h-18 items-center justify-between py-3" aria-label="Primary">
        <Link href="/" className="relative z-10 shrink-0" aria-label={`${site.name} home`}>
          <Logo invert={!scrolled} priority className="h-8 sm:h-9" />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const hasChildren = "children" in item && item.children;
            return (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenGroup(item.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    scrolled
                      ? active
                        ? "text-brand-700"
                        : "text-slate-700 hover:text-brand-700"
                      : active
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                  )}
                >
                  {item.label}
                  {hasChildren && (
                    <Icon
                      name="chevron-down"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                    />
                  )}
                </Link>

                {hasChildren && (
                  <AnimatePresence>
                    {openGroup === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3"
                      >
                        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white p-2 shadow-[0_24px_60px_-24px_rgba(15,35,79,0.45)]">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="group/i flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 transition-colors group-hover/i:bg-brand-600 group-hover/i:text-white">
                                <Icon name="arrow-up-right" className="h-4 w-4" />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-ink-900">{child.label}</span>
                                <span className="block text-xs text-slate-500">{child.desc}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <ButtonLink href={HOME_FOR[user.role]} variant={scrolled ? "primary" : "accent"} size="sm">
              <Icon name="layout-dashboard" className="h-4 w-4" />
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant={scrolled ? "outline" : "light"} size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" variant={scrolled ? "primary" : "accent"} size="sm">
                Sign up
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            "relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border transition-colors lg:hidden",
            scrolled || open
              ? "border-sand-200 bg-white/70 text-ink-900"
              : "border-white/25 bg-white/10 text-white"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Icon name={open ? "x" : "menu"} className="h-5 w-5" />
        </button>
      </nav>
    </header>

      {/* Mobile sheet — rendered outside <header> so the header's backdrop-filter
          doesn't create a containing block that traps this fixed overlay. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-0 z-40 bg-ink-900/95 backdrop-blur-lg lg:hidden"
          >
            <div className="container-x flex h-full flex-col overflow-y-auto pt-24 pb-10">
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/10 py-3.5 text-lg font-semibold text-white"
                    >
                      {item.label}
                    </Link>
                    {"children" in item && item.children && (
                      <div className="flex flex-col gap-1 py-2 pl-4">
                        {item.children.map((c) => (
                          <Link key={c.href} href={c.href} onClick={() => setOpen(false)} className="py-1.5 text-sm text-brand-100/80">
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3">
                {user ? (
                  <ButtonLink href={HOME_FOR[user.role]} variant="accent" size="lg" onClick={() => setOpen(false)}>
                    Go to Dashboard
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink href="/login" variant="light" size="lg" onClick={() => setOpen(false)}>
                      Sign in
                    </ButtonLink>
                    <ButtonLink href="/register" variant="accent" size="lg" onClick={() => setOpen(false)}>
                      Sign up
                    </ButtonLink>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
