import Link from "next/link";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/ui/icon";

/** Split-screen auth layout: brand panel + form card. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/"><Logo invert /></Link>
          <div>
            <h2 className="display-2 text-4xl font-bold text-balance">
              The next generation of hiring starts here.
            </h2>
            <p className="mt-4 max-w-md text-brand-100/80">
              Post roles, manage applications, and track your career — all in one place.
            </p>
            <ul className="mt-8 space-y-3">
              {["Employers: post jobs & review applicants", "Job seekers: apply & track in one dashboard", "Fully compliant, secure, and fast"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-brand-100/90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-brand-100/50">© 2026 Exzelon — NextGen Hires</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex lg:hidden"><Logo /></Link>
          <h1 className="display-2 text-3xl font-bold text-ink-900">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-slate-600">{footer}</div>
        </div>
      </div>
    </div>
  );
}
