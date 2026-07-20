/**
 * Auth route group — full-bleed layout WITHOUT the marketing navbar/footer.
 * (The root layout renders Navbar/Footer; this group overrides the visual frame
 * by simply not rendering them and letting the AuthShell fill the screen.)
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
