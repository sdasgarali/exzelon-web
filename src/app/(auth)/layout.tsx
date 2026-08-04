import type { Metadata } from "next";

/**
 * Auth route group — full-bleed layout WITHOUT the marketing navbar/footer.
 * (The root layout renders Navbar/Footer; this group overrides the visual frame
 * by simply not rendering them and letting the AuthShell fill the screen.)
 */

// Auth utility pages (login, register, forgot/reset password, verify) carry no
// SEO value and were being indexed (e.g. /login ranked in Search Console). Mark
// the whole group `noindex, follow` so crawlers drop them but still traverse the
// in-page links. Applies to every page under (auth) unless a page overrides it.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
