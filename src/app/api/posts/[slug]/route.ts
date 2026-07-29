import { NextResponse } from "next/server";
import { postSchema } from "@/lib/validation";
import { requireApiUser } from "@/lib/auth/api-guard";
import { updatePost, deletePost, logAudit } from "@/lib/db/repo";

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  const ok = await updatePost(slug, {
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    body: data.body,
    coverImageUrl: data.coverImageUrl || undefined,
    author: (data.author && data.author.trim()) || user.name,
    status: data.status ?? "draft",
    featured: !!data.featured,
  });

  if (!ok) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  await logAudit({
    actorId: user.id,
    actorName: user.name,
    action: "post.update",
    target: data.title,
    detail: data.status,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiUser(["admin"]);
  if ("error" in guard) return guard.error;
  const { user } = guard;
  const { slug } = await params;

  const ok = await deletePost(slug);
  if (!ok) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  await logAudit({ actorId: user.id, actorName: user.name, action: "post.delete", target: slug });
  return NextResponse.json({ ok: true });
}
