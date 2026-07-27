"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type CompanyInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { COMPANY_SIZES } from "@/lib/company";

export function CompanyForm({ initial, companyId }: { initial: CompanyInput; companyId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInput>({ resolver: zodResolver(companySchema), defaultValues: initial });

  const onSubmit = async (data: CompanyInput) => {
    setStatus("saving");
    setServerError(null);
    try {
      const res = await fetch("/api/employer/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Could not save");
      setStatus("saved");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6" noValidate>
      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="company" required>Company name</Label>
              <Input id="company" aria-invalid={!!errors.company} {...register("company")} placeholder="Acme Health" />
              <FieldError message={errors.company?.message} />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...register("tagline")} placeholder="Care that never sleeps" />
              <FieldError message={errors.tagline?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="about">About</Label>
            <Textarea id="about" className="min-h-28" {...register("about")} placeholder="Tell candidates who you are, what you do, and why they'd want to work with you." />
            <FieldError message={errors.about?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://acme.com" />
              <FieldError message={errors.website?.message} />
            </div>
            <div>
              <Label htmlFor="location">Headquarters</Label>
              <Input id="location" {...register("location")} placeholder="Chicago, IL" />
              <FieldError message={errors.location?.message} />
            </div>
            <div>
              <Label htmlFor="size">Company size</Label>
              <Select id="size" {...register("size")}>
                <option value="">Select…</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" {...register("logoUrl")} placeholder="https://…/logo.png" />
              <FieldError message={errors.logoUrl?.message} />
            </div>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save company profile"}
          {status !== "saving" && <Icon name="check" className="h-4 w-4" />}
        </Button>
        <a href={`/companies/${companyId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <Icon name="external-link" className="h-4 w-4" /> View public page
        </a>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Icon name="check" className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
