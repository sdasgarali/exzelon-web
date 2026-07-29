"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, type PostInput } from "@/lib/validation";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export type PostFormValues = Partial<PostInput> & { slug?: string };

const CATEGORIES = ["Healthcare", "Career", "Hiring", "Compliance", "Industry", "Company"];

/** Shared create/edit form for admin blog posts. */
export function PostForm({
  mode,
  slug,
  initial,
  backHref,
}: {
  mode: "create" | "edit";
  slug?: string;
  initial?: PostFormValues;
  backHref: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      status: "draft",
      featured: false,
      category: "Career",
      ...initial,
    },
  });

  const submitWith = (status: "draft" | "published") =>
    handleSubmit(async (data) => {
      setPending(true);
      setServerError(null);
      try {
        const url = mode === "create" ? "/api/posts" : `/api/posts/${slug}`;
        const method = mode === "create" ? "POST" : "PUT";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, status }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Something went wrong");
        router.push(backHref);
        router.refresh();
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Something went wrong");
        setPending(false);
      }
    });

  return (
    <form className="max-w-3xl space-y-6" noValidate>
      <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="space-y-5">
          <div>
            <Label htmlFor="title" required>Title</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} placeholder="e.g. 5 Resume Tips That Land Interviews" />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="category" required>Category</Label>
              <Select id="category" {...register("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <FieldError message={errors.category?.message} />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...register("author")} placeholder="Defaults to your name" />
              <FieldError message={errors.author?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
            <Input id="coverImageUrl" aria-invalid={!!errors.coverImageUrl} {...register("coverImageUrl")} placeholder="https://…/image.jpg" />
            <FieldError message={errors.coverImageUrl?.message} />
          </div>

          <div>
            <Label htmlFor="excerpt" required>Excerpt</Label>
            <Textarea id="excerpt" aria-invalid={!!errors.excerpt} {...register("excerpt")} placeholder="A one- or two-sentence summary shown on cards and in search results." />
            <FieldError message={errors.excerpt?.message} />
          </div>

          <div>
            <Label htmlFor="body" required>Body</Label>
            <Textarea id="body" rows={16} aria-invalid={!!errors.body} {...register("body")} placeholder={"Write your post…\n\n## A heading\n\nA paragraph. Use **bold** and [links](https://example.com).\n\n- A bullet\n- Another bullet\n\n> A pull quote."} />
            <p className="mt-1 text-xs text-slate-400">
              Formatting: <code>## Heading</code>, <code>### Subheading</code>, <code>- bullet</code>,
              <code> &gt; quote</code>, <code>**bold**</code>, <code>[text](url)</code>. Blank line = new paragraph.
            </p>
            <FieldError message={errors.body?.message} />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-sand-200 px-4 py-3">
            <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded border-sand-300 text-brand-600" />
            <span className="text-sm font-medium text-ink-900">Feature at the top of the blog</span>
          </label>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{serverError}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="button" size="lg" disabled={pending} onClick={submitWith("published")}>
          {pending ? "Saving…" : "Publish"}
          {!pending && <Icon name="check" className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={pending} onClick={submitWith("draft")}>
          Save as draft
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.push(backHref)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
