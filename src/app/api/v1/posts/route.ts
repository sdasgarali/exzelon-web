import { NextResponse } from "next/server";
import { postSchema } from "@/lib/validation";
import { requireApiKey, apiKeyError, API_CORS } from "@/lib/auth/api-key";
import { apiListPosts, apiCreatePost } from "@/lib/db/repo";

/**
 * Blog Content API — external systems (AccessHub Pro) manage posts via an API key.
 *   GET  /api/v1/posts?status=&q=&page=&limit=   (scope: posts:read)
 *   POST /api/v1/posts                            (scope: posts:write)
 *   Authorization: Bearer <key>
 */
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: API_CORS });
}

export async function GET(req: Request) {
  const guard = await requireApiKey(req, "posts:read");
  if ("error" in guard) return guard.error;

  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const status = statusParam === "draft" || statusParam === "published" ? statusParam : undefined;
  const q = url.searchParams.get("q") || undefined;
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const { posts, total, page: p, perPage } = await apiListPosts({ status, q, page, limit });

  return NextResponse.json(
    {
      posts,
      meta: {
        total,
        page: p,
        per_page: perPage,
        count: posts.length,
        status_filter: status || "all",
        generated_at: new Date().toISOString(),
      },
    },
    { headers: API_CORS }
  );
}

export async function POST(req: Request) {
  const guard = await requireApiKey(req, "posts:write");
  if ("error" in guard) return guard.error;
  const { key } = guard;

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
  const data = parsed.data;

  const post = await apiCreatePost({
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    body: data.body,
    coverImageUrl: data.coverImageUrl || undefined,
    author: (data.author && data.author.trim()) || key.name || "Exzelon",
    status: data.status ?? "draft",
    featured: !!data.featured,
  });

  return NextResponse.json({ post }, { status: 201, headers: API_CORS });
}
