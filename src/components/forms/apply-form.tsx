"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { applySchema, type ApplyInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplyInput>({
    resolver: zodResolver(applySchema),
    defaultValues: { jobId, jobTitle },
  });

  const onSubmit = async (data: ApplyInput) => {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-ink-900">Application received!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Thanks for applying to <strong>{jobTitle}</strong>. A recruiter will review your application
          and reach out shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("company_website")} />
      <input type="hidden" {...register("jobId")} />
      <input type="hidden" {...register("jobTitle")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Full name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} placeholder="Jane Doe" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} placeholder="jane@email.com" />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" required>Phone</Label>
          <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} placeholder="+1 (555) 000-0000" />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn (optional)</Label>
          <Input id="linkedin" aria-invalid={!!errors.linkedin} {...register("linkedin")} placeholder="https://linkedin.com/in/…" />
          <FieldError message={errors.linkedin?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="resumeUrl">Resume link (optional)</Label>
        <Input id="resumeUrl" aria-invalid={!!errors.resumeUrl} {...register("resumeUrl")} placeholder="Link to your resume (Drive, Dropbox…)" />
        <FieldError message={errors.resumeUrl?.message} />
      </div>

      <div>
        <Label htmlFor="coverLetter">Cover note (optional)</Label>
        <Textarea id="coverLetter" {...register("coverLetter")} placeholder="Tell us why you're a great fit…" />
        <FieldError message={errors.coverLetter?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit application"}
        {status !== "submitting" && <Icon name="send" className="h-4 w-4" />}
      </Button>
      <p className="text-center text-xs text-slate-400">
        By applying you agree to be contacted by an Exzelon recruiter about this role.
      </p>
    </form>
  );
}
