"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong");
      }
      setSent(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
        If an account exists for that email, we&apos;ve sent a password-reset link. Check your inbox
        (and spam). The link expires in 1 hour.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@email.com" />
        <FieldError message={errors.email?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
        {!pending && <Icon name="arrow-right" className="h-4 w-4" />}
      </Button>
    </form>
  );
}
