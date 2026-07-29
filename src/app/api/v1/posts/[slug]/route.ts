import { NextResponse } from "next/server";
import { postSchema } from "@/lib/validation";
import { requireApiKey, apiKeyError, API_CORS } from "@/lib/auth/api-key";
import { apiGetPost, apiUpdatePost, deletePost } from "@/lib/db/repo";

/**
 * Blog Content API — single post by slug.
 *   GET    /api/v1/posts/{slug}   (scope: posts:read)  — read (any status)
 *   PUT    /api/v1/posts/{slug}   (scope: posts:write) — full update
 *   PATCH  /api/v1/posts/{slug}   (scope: posts:write) — partial update (e.g. publish)
 *   DELETE /api/v1/posts/{slug}   (scope: posts:write) — delete
 */
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: API_CORS });
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiKey(req, "posts:read");
  if ("error" in guard) return guard.error;
  const { slug } = await params;

  const post = await apiGetPost(slug);
  if (!post) return apiKeyError("Post not found.", 404);
  return NextResponse.json({ post }, { headers: API_CORS });
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiKey(req, "posts:write");
  if ("error" in guard) return guard.error;
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiKeyError("Invalid JSON body.", 400);
  }

  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422, headers: API_CORS }
    );
  }
  const d = parsed.data;
  const post = await apiUpdatePost(slug, {
    title: d.title,
    excerpt: d.excerpt,
    category: d.category,
    body: d.body,
    coverImageUrl: d.coverImageUrl || "",
    author: d.author || undefined,
    status: d.status,
    featured: !!d.featured,
  });
  if (!post) return apiKeyError("Post not found.", 404);
  return NextResponse.json({ post }, { headers: API_CORS });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiKey(req, "posts:write");
  if ("error" in guard) return guard.error;
  const { slug } = await params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return apiKeyError("Invalid JSON body.", 400);
  }

  const parsed = postSchema.partial().safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422, headers: API_CORS }
    );
  }
  const d = parsed.data;
  // Only forward fields that were actually provided (partial update).
  const patch: Parameters<typeof apiUpdatePost>[1] = {};
  if (d.title !== undefined) patch.title = d.title;
  if (d.excerpt !== undefined) patch.excerpt = d.excerpt;
  if (d.category !== undefined) patch.category = d.category;
  if (d.body !== undefined) patch.body = d.body;
  if (d.coverImageUrl !== undefined) patch.coverImageUrl = d.coverImageUrl;
  if (d.author !== undefined) patch.author = d.author || undefined;
  if (d.status !== undefined) patch.status = d.status;
  if (d.featured !== undefined) patch.featured = d.featured;

  if (Object.keys(patch).length === 0) return apiKeyError("No fields to update.", 422);

  const post = await apiUpdatePost(slug, patch);
  if (!post) return apiKeyError("Post not found.", 404);
  return NextResponse.json({ post }, { headers: API_CORS });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await requireApiKey(req, "posts:write");
  if ("error" in guard) return guard.error;
  const { slug } = await params;

  const ok = await deletePost(slug);
  if (!ok) return apiKeyError("Post not found.", 404);
  return NextResponse.json({ ok: true, slug }, { headers: API_CORS });
}
