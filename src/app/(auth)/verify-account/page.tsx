import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyAccountClient } from "@/components/auth/verify-account-client";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Confirm your email", path: "/verify-account" });

export default function VerifyAccountPage() {
  return (
    <AuthShell
      title="Confirm your email"
      subtitle="Enter the 6-digit code we emailed you to finish creating your account."
      footer={
        <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Start over
        </Link>
      }
    >
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <VerifyAccountClient />
      </Suspense>
    </AuthShell>
  );
}
