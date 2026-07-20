"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { interest: "general" },
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
        <p className="mt-2 text-sm text-slate-600">
          Thanks for reaching out. Our team will get back to you within one business day.
        </p>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("company_website")} />

      <div>
        <Label htmlFor="interest">I&apos;m a…</Label>
        <Select id="interest" {...register("interest")}>
          <option value="general">General enquiry</option>
          <option value="job-seeker">Job seeker</option>
          <option value="employer">Employer / hiring</option>
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} placeholder="Your name" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} placeholder="you@email.com" />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="subject" required>Subject</Label>
          <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} placeholder="How can we help?" />
          <FieldError message={errors.subject?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="message" required>Message</Label>
        <Textarea id="message" aria-invalid={!!errors.message} {...register("message")} placeholder="Tell us a bit about what you need…" />
        <FieldError message={errors.message?.message} />
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send message"}
        {status !== "submitting" && <Icon name="send" className="h-4 w-4" />}
      </Button>
    </form>
  );
}
