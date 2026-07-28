"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobSchema, type JobInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { industries, getIndustry } from "@/content/industries";
import { jobTypes, workModes } from "@/content/jobs";

const CUSTOM_INDUSTRY = "__other__";

export type JobFormValues = Partial<JobInput> & { slug?: string };

/** Shared create/edit job form for admin + employer. */
export function JobForm({
  mode,
  slug,
  initial,
  isAdmin = false,
  backHref,
}: {
  mode: "create" | "edit";
  slug?: string;
  initial?: JobFormValues;
  isAdmin?: boolean;
  backHref: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // A job may already carry a custom industry (not in the static list) — surface it on edit.
  const initialCustomIndustry =
    initial?.industry && !getIndustry(initial.industry) ? initial.industry : "";
  const [customIndustry, setCustomIndustry] = useState(initialCustomIndustry);
  const [industryError, setIndustryError] = useState<string | null>(null);

  const defaultIndustry = initial?.industry
    ? getIndustry(initial.industry)
      ? initial.industry
      : CUSTOM_INDUSTRY
    : "healthcare";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      type: "Full-time",
      remote: "On-site",
      status: "open",
      featured: false,
      ...initial,
      industry: defaultIndustry,
    },
  });

  // Admins can add a brand-new industry; the "add" option also appears when editing a custom one.
  const showAddIndustry = isAdmin || !!initialCustomIndustry;
  const [industrySel, setIndustrySel] = useState(defaultIndustry);
  const isCustomIndustry = industrySel === CUSTOM_INDUSTRY;
  const industryReg = register("industry");

  const onSubmit = async (data: JobInput) => {
    // Resolve the "add new industry" choice into the typed value.
    let industry = data.industry;
    if (industry === CUSTOM_INDUSTRY) {
      const custom = customIndustry.trim();
      if (custom.length < 2) {
        setIndustryError("Enter an industry name (2+ characters).");
        return;
      }
      industry = custom;
    }
    setIndustryError(null);
    setPending(true);
    setServerError(null);
    try {
      const url = mode === "create" ? "/api/jobs" : `/api/jobs/${slug}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, industry }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6" noValidate>
      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="space-y-5">
          <div>
            <Label htmlFor="title" required>Job title</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} placeholder="e.g. ICU Registered Nurse" />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="industry" required>Industry</Label>
              <Select
                id="industry"
                {...industryReg}
                onChange={(e) => {
                  industryReg.onChange(e);
                  setIndustrySel(e.target.value);
                }}
              >
                {industries.map((i) => (
                  <option key={i.slug} value={i.slug}>{i.name}</option>
                ))}
                {showAddIndustry && <option value={CUSTOM_INDUSTRY}>+ Add new industry…</option>}
              </Select>
              {isCustomIndustry && (
                <div className="mt-2">
                  <Input
                    aria-label="New industry name"
                    placeholder="New industry (e.g. Marketing)"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                  />
                  <FieldError message={industryError ?? undefined} />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="location" required>Location</Label>
              <Input id="location" aria-invalid={!!errors.location} {...register("location")} placeholder="e.g. Chicago, IL" />
              <FieldError message={errors.location?.message} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="type" required>Type</Label>
              <Select id="type" {...register("type")}>
                {jobTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="remote" required>Work mode</Label>
              <Select id="remote" {...register("remote")}>
                {workModes.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="salary" required>Salary</Label>
              <Input id="salary" aria-invalid={!!errors.salary} {...register("salary")} placeholder="$85k – $105k" />
              <FieldError message={errors.salary?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="summary" required>Summary</Label>
            <Textarea id="summary" aria-invalid={!!errors.summary} {...register("summary")} placeholder="A short overview of the role…" />
            <FieldError message={errors.summary?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="responsibilities" required>Responsibilities</Label>
              <Textarea id="responsibilities" aria-invalid={!!errors.responsibilities} {...register("responsibilities")} placeholder={"One per line"} />
              <p className="mt-1 text-xs text-slate-400">One item per line.</p>
              <FieldError message={errors.responsibilities?.message} />
            </div>
            <div>
              <Label htmlFor="requirements" required>Requirements</Label>
              <Textarea id="requirements" aria-invalid={!!errors.requirements} {...register("requirements")} placeholder={"One per line"} />
              <p className="mt-1 text-xs text-slate-400">One item per line.</p>
              <FieldError message={errors.requirements?.message} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...register("status")}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="expiresAt">Closes on (optional)</Label>
              <Input id="expiresAt" type="date" aria-invalid={!!errors.expiresAt} {...register("expiresAt")} />
              <FieldError message={errors.expiresAt?.message} />
              <p className="mt-1 text-xs text-slate-400">Auto-closes after this date.</p>
            </div>
            {isAdmin && (
              <label className="flex items-center gap-3 self-end rounded-xl border border-sand-200 px-4 py-3">
                <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded border-sand-300 text-brand-600" />
                <span className="text-sm font-medium text-ink-900">Feature on homepage</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create job" : "Save changes"}
          {!pending && <Icon name="check" className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push(backHref)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
