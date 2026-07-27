"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "Reset failed");
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-lg bg-rose-50 px-4 py-4 text-sm text-rose-700">
        This reset link is missing its token.{" "}
        <Link href="/forgot-password" className="font-semibold underline">Request a new one</Link>.
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        Your password has been reset. Redirecting you to sign in…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register("token")} />
      <div>
        <Label htmlFor="password" required>New password</Label>
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} placeholder="••••••••" />
        <FieldError message={errors.password?.message} />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters, with a letter and a number.</p>
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Resetting…" : "Reset password"}
        {!pending && <Icon name="arrow-right" className="h-4 w-4" />}
      </Button>
    </form>
  );
}
