"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { Input, Textarea, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Account = { name: string; email: string };

const emptyExperience = { title: "", company: "", start: "", end: "", current: false, summary: "" };
const emptyEducation = { school: "", qualification: "", field: "", start: "", end: "" };

export function ProfileForm({ account, initial }: { account: Account; initial: ProfileInput }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      resumeUrl: initial.resumeUrl ?? "",
      linkedin: initial.linkedin ?? "",
      otherLink: initial.otherLink ?? "",
      phone: initial.phone ?? "",
      experienceLevel: initial.experienceLevel,
      experiences: initial.experiences?.length ? initial.experiences : [],
      education: initial.education?.length ? initial.education : [],
    },
  });

  const level = useWatch({ control, name: "experienceLevel" });

  const expArray = useFieldArray({ control, name: "experiences" });
  const eduArray = useFieldArray({ control, name: "education" });

  const onSubmit = async (data: ProfileInput) => {
    setStatus("saving");
    setServerError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Could not save profile");
      setStatus("saved");
      // Came here to apply? bounce back once the profile is complete.
      if (next && body.complete) {
        router.push(next);
        router.refresh();
        return;
      }
      router.refresh();
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Could not save profile");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {/* Account (read-only) */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6">
        <h3 className="text-sm font-bold text-ink-900">Account</h3>
        <p className="mt-1 text-xs text-slate-500">Name and email come from your account.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Full name</Label>
            <Input value={account.name} disabled readOnly />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={account.email} disabled readOnly />
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6">
        <h3 className="text-sm font-bold text-ink-900">Resume &amp; links</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="resumeUrl" required>Resume link</Label>
            <Input
              id="resumeUrl"
              aria-invalid={!!errors.resumeUrl}
              {...register("resumeUrl")}
              placeholder="Link to your resume (Google Drive, Dropbox…)"
            />
            <FieldError message={errors.resumeUrl?.message} />
            <p className="mt-1 text-xs text-slate-400">Required before you can apply to jobs.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="linkedin">LinkedIn (optional)</Label>
              <Input id="linkedin" aria-invalid={!!errors.linkedin} {...register("linkedin")} placeholder="https://linkedin.com/in/…" />
              <FieldError message={errors.linkedin?.message} />
            </div>
            <div>
              <Label htmlFor="otherLink">Other link (optional)</Label>
              <Input id="otherLink" aria-invalid={!!errors.otherLink} {...register("otherLink")} placeholder="Portfolio, GitHub, X…" />
              <FieldError message={errors.otherLink?.message} />
            </div>
          </div>
          <div className="sm:max-w-xs">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" />
            <FieldError message={errors.phone?.message} />
          </div>
        </div>
      </section>

      {/* Experience level */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6">
        <h3 className="text-sm font-bold text-ink-900">Experience</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-sm">
          {[
            { value: "fresher", label: "Fresher", desc: "New to the workforce" },
            { value: "experienced", label: "Experienced", desc: "I have work history" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all",
                level === opt.value
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                  : "border-sand-200 bg-white hover:border-brand-300"
              )}
            >
              <input type="radio" value={opt.value} className="sr-only" {...register("experienceLevel")} />
              <div className="text-sm font-bold text-ink-900">{opt.label}</div>
              <div className="text-xs text-slate-500">{opt.desc}</div>
            </label>
          ))}
        </div>

        {level === "experienced" && (
          <div className="mt-6 space-y-4">
            {expArray.fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-sand-200 bg-sand-50/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Experience {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => expArray.remove(i)}
                    className="text-slate-400 transition-colors hover:text-rose-600"
                    aria-label="Remove experience"
                  >
                    <Icon name="trash-2" className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`exp-${i}-title`}>Role title</Label>
                    <Input id={`exp-${i}-title`} aria-invalid={!!errors.experiences?.[i]?.title} {...register(`experiences.${i}.title`)} placeholder="Journeyman Electrician" />
                    <FieldError message={errors.experiences?.[i]?.title?.message} />
                  </div>
                  <div>
                    <Label htmlFor={`exp-${i}-company`}>Company</Label>
                    <Input id={`exp-${i}-company`} aria-invalid={!!errors.experiences?.[i]?.company} {...register(`experiences.${i}.company`)} placeholder="Acme Electric" />
                    <FieldError message={errors.experiences?.[i]?.company?.message} />
                  </div>
                  <div>
                    <Label htmlFor={`exp-${i}-start`}>Start</Label>
                    <Input id={`exp-${i}-start`} {...register(`experiences.${i}.start`)} placeholder="Jan 2021" />
                  </div>
                  <div>
                    <Label htmlFor={`exp-${i}-end`}>End</Label>
                    <Input id={`exp-${i}-end`} {...register(`experiences.${i}.end`)} placeholder="Present" />
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-sand-300 text-brand-600 focus:ring-brand-200" {...register(`experiences.${i}.current`)} />
                  I currently work here
                </label>
                <div className="mt-3">
                  <Label htmlFor={`exp-${i}-summary`}>What you did (optional)</Label>
                  <Textarea id={`exp-${i}-summary`} className="min-h-20" {...register(`experiences.${i}.summary`)} placeholder="Key responsibilities & achievements…" />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => expArray.append(emptyExperience)}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
            >
              <Icon name="plus" className="h-4 w-4" /> Add experience
            </button>
          </div>
        )}
      </section>

      {/* Education */}
      <section className="rounded-2xl border border-sand-200 bg-white p-6">
        <h3 className="text-sm font-bold text-ink-900">Education</h3>
        <div className="mt-4 space-y-4">
          {eduArray.fields.map((field, i) => (
            <div key={field.id} className="rounded-xl border border-sand-200 bg-sand-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Education {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => eduArray.remove(i)}
                  className="text-slate-400 transition-colors hover:text-rose-600"
                  aria-label="Remove education"
                >
                  <Icon name="trash-2" className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`edu-${i}-qual`}>Qualification</Label>
                  <Input id={`edu-${i}-qual`} aria-invalid={!!errors.education?.[i]?.qualification} {...register(`education.${i}.qualification`)} placeholder="B.Sc. Electrical Engineering" />
                  <FieldError message={errors.education?.[i]?.qualification?.message} />
                </div>
                <div>
                  <Label htmlFor={`edu-${i}-school`}>School / institution</Label>
                  <Input id={`edu-${i}-school`} aria-invalid={!!errors.education?.[i]?.school} {...register(`education.${i}.school`)} placeholder="University of Illinois" />
                  <FieldError message={errors.education?.[i]?.school?.message} />
                </div>
                <div>
                  <Label htmlFor={`edu-${i}-field`}>Field (optional)</Label>
                  <Input id={`edu-${i}-field`} {...register(`education.${i}.field`)} placeholder="Power systems" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`edu-${i}-start`}>Start</Label>
                    <Input id={`edu-${i}-start`} {...register(`education.${i}.start`)} placeholder="2016" />
                  </div>
                  <div>
                    <Label htmlFor={`edu-${i}-end`}>End</Label>
                    <Input id={`edu-${i}-end`} {...register(`education.${i}.end`)} placeholder="2020" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => eduArray.append(emptyEducation)}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-sand-300 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <Icon name="plus" className="h-4 w-4" /> Add education
          </button>
        </div>
      </section>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save profile"}
          {status !== "saving" && <Icon name="check" className="h-4 w-4" />}
        </Button>
        {status === "saved" && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <Icon name="check" className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
