"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const HOME_FOR: Record<string, string> = { admin: "/admin", employer: "/employer", seeker: "/account" };

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Login failed");
      const dest = next && next.startsWith("/") ? next : HOME_FOR[body.user.role] ?? "/";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Login failed");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@email.com" />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} placeholder="••••••••" />
        <FieldError message={errors.password?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <Icon name="arrow-right" className="h-4 w-4" />}
      </Button>

      <p className="rounded-lg bg-sand-100 px-4 py-3 text-xs text-slate-500">
        <strong>Demo logins:</strong> admin@exzelon.com / Admin@12345 · employer@exzelon.com / Employer@123 · seeker@exzelon.com / Seeker@12345
      </p>
    </form>
  );
}
