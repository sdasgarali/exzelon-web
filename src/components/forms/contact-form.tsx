"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type ContactFormProps = {
  /** Pre-select the "I'm a…" value (defaults to a general enquiry). */
  defaultInterest?: ContactInput["interest"];
  /** Hide the interest selector entirely (used by the pre-scoped employer form). */
  lockInterest?: boolean;
  /** Show a Company field (employer inquiries). */
  showCompany?: boolean;
  subjectLabel?: string;
  subjectPlaceholder?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successBody?: string;
};

export function ContactForm({
  defaultInterest = "general",
  lockInterest = false,
  showCompany = false,
  subjectLabel = "Subject",
  subjectPlaceholder = "How can we help?",
  messageLabel = "Message",
  messagePlaceholder = "Tell us a bit about what you need…",
  submitLabel = "Send message",
  successBody = "Thanks for reaching out. Our team will get back to you within one business day.",
}: ContactFormProps = {}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { interest: defaultInterest },
  });

  const onSubmit = async (data: ContactInput) => {
    setStatus("submitting");
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong");
      }
      setStatus("success");
      reset();
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
        <h3 className="mt-5 text-xl font-bold text-ink-900">Message sent!</h3>
        <p className="mt-2 text-sm text-slate-600">{successBody}</p>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("company_website")} />

      {lockInterest ? (
        // The employer form is already scoped to "employer" — keep the value without the UI.
        <input type="hidden" {...register("interest")} />
      ) : (
        <div>
          <Label htmlFor="interest">I&apos;m a…</Label>
          <Select id="interest" {...register("interest")}>
            <option value="general">General enquiry</option>
            <option value="job-seeker">Job seeker</option>
            <option value="employer">Employer / hiring</option>
          </Select>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} placeholder="Your name" />
          <FieldError message={errors.name?.message} />
        </div>
        {showCompany ? (
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register("company")} placeholder="Your company" />
            <FieldError message={errors.company?.message} />
          </div>
        ) : (
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@email.com" />
            <FieldError message={errors.email?.message} />
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {showCompany && (
          <div>
            <Label htmlFor="email" required>Work email</Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@company.com" />
            <FieldError message={errors.email?.message} />
          </div>
        )}
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" />
          <FieldError message={errors.phone?.message} />
        </div>
        {!showCompany && (
          <div>
            <Label htmlFor="subject" required>{subjectLabel}</Label>
            <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} placeholder={subjectPlaceholder} />
            <FieldError message={errors.subject?.message} />
          </div>
        )}
      </div>

      {showCompany && (
        <div>
          <Label htmlFor="subject" required>{subjectLabel}</Label>
          <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} placeholder={subjectPlaceholder} />
          <FieldError message={errors.subject?.message} />
        </div>
      )}

      <div>
        <Label htmlFor="message" required>{messageLabel}</Label>
        <Textarea id="message" aria-invalid={!!errors.message} {...register("message")} placeholder={messagePlaceholder} />
        <FieldError message={errors.message?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : submitLabel}
        {status !== "submitting" && <Icon name="send" className="h-4 w-4" />}
      </Button>
    </form>
  );
}
