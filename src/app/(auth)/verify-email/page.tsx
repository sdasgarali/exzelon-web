import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailClient } from "@/components/auth/verify-email-client";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Verify email", path: "/verify-email" });

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Email verification"
      subtitle="Confirm your email with the 6-digit code or the link we sent."
      footer={
        <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to home
        </Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-slate-600">Verifying…</p>}>
        <VerifyEmailClient />
      </Suspense>
    </AuthShell>
  );
}
