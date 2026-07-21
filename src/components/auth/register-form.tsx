"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [role, setRole] = useState<RegisterInput["role"]>("seeker");
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "seeker" },
  });

  const chooseRole = (value: RegisterInput["role"]) => {
    setRole(value);
    setValue("role", value);
  };

  const onSubmit = async (data: RegisterInput) => {
    setPending(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Registration failed");
      const safeNext = next && next.startsWith("/") ? next : null;
      let dest: string;
      if (body.user.role === "seeker") {
        // New candidates finish their profile first (carry `next` back to the job).
        dest = safeNext ? `/account/profile?next=${encodeURIComponent(safeNext)}` : "/account/profile";
      } else {
        dest = safeNext ?? "/employer";
      }
      router.push(dest);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Role toggle */}
      <div>
        <Label>I&apos;m a…</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "seeker", label: "Candidate", icon: "user-round" as const, desc: "Find & apply to jobs" },
            { value: "employer", label: "Employer", icon: "building-2" as const, desc: "Post jobs & hire" },
          ].map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => chooseRole(opt.value as RegisterInput["role"])}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                role === opt.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                  : "border-sand-200 bg-white hover:border-brand-300"
              )}
            >
              <Icon name={opt.icon} className={cn("h-5 w-5", role === opt.value ? "text-brand-600" : "text-slate-400")} />
              <div className="mt-2 text-sm font-bold text-ink-900">{opt.label}</div>
              <div className="text-xs text-slate-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="name" required>Full name</Label>
        <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} placeholder="Your name" />
        <FieldError message={errors.name?.message} />
      </div>

      {role === "employer" && (
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} placeholder="Company name" />
          <FieldError message={errors.company?.message} />
        </div>
      )}

      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@email.com" />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} placeholder="At least 8 characters" />
        <FieldError message={errors.password?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
        {!pending && <Icon name="arrow-right" className="h-4 w-4" />}
      </Button>
    </form>
  );
}
