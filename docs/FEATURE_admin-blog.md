# Feature — Admin blog authoring (DB-driven posts)

**Goal:** Let an admin write, edit, publish, and delete blog posts from the admin dashboard.
Replaces the static `blogPosts` array (which had no real per-post body — every post rendered the
same hardcoded template) with real, DB-stored authored content.

## Scope / decisions
- **Admin-only.** Blog is Exzelon editorial. (Jobs allow employers; blog does not.)
- **Body = markdown-lite**, rendered by an in-house zero-dependency renderer
  (`src/lib/markdown.ts`): `##`/`###` headings, blank-line paragraphs, `-`/`*` bullet lists,
  `>` blockquotes, `**bold**` + `[text](url)` inline. No `react-markdown` / heavy deps.
- **Cover image = optional URL** (same convention as employer `logoUrl`). Gradient placeholder
  when empty (keeps the existing card visual).
- **Status:** `draft | published`. Only `published` posts are publicly visible / in the sitemap.
- **Featured:** one post can be flagged featured → renders as the hero card on `/resources/blog`.
- **Reading time** is auto-computed from the body word count (~200 wpm).

## Data model — `PostDoc` (collection `posts`)
```
slug          string (unique, from title)
title         string
excerpt       string   (list/card + meta description)
category      string
body          string   (markdown-lite)
coverImageUrl string?  (optional)
author        string   (display name; defaults to the admin's name)
readingTime   string   ("6 min read", derived)
status        "draft" | "published"
featured      boolean
authorUserId  string | null
publishedAt   Date | null   (set on first publish)
createdAt     Date
updatedAt     Date
```
Indexes: unique `slug`; `{ status, publishedAt: -1 }` for the public feed.

## Files
- `src/lib/db/models.ts` — `PostDoc`, `postsCollection()`, indexes in `ensureIndexes`.
- `src/lib/validation.ts` — `postSchema`.
- `src/lib/markdown.ts` — `renderMarkdown(md)` → sanitized React nodes; `readingTime(body)`.
- `src/lib/db/repo.ts` — `createPost / updatePost / deletePost / listPosts (admin) /
  listPublishedPosts (public) / getPostBySlug (published) / getPostForAdmin`.
- `src/app/api/posts/route.ts` — `POST` (admin).
- `src/app/api/posts/[slug]/route.ts` — `PUT` / `DELETE` (admin, audited).
- `src/components/dashboard/post-form.tsx` — shared create/edit form.
- `src/components/dashboard/actions.tsx` — `PostRowActions` (view/edit/delete).
- `src/app/admin/posts/{page,new/page,[slug]/edit/page}.tsx` — admin list + create + edit.
- `src/app/admin/layout.tsx` — add "Blog" nav item.
- `src/app/(site)/resources/blog/{page,[slug]/page}.tsx` — read from DB (published).
- `src/app/sitemap.ts` — blog routes from DB.
- `scripts/seed.ts` — migrate the 4 static posts into `posts` (idempotent, upsert by slug).

## Public rendering
- `/resources/blog` — `listPublishedPosts()`; featured post → hero, rest → grid. `force-dynamic`
  (or ISR revalidate) so new posts appear without redeploy.
- `/resources/blog/[slug]` — `getPostBySlug()`; renders `renderMarkdown(post.body)`. 404 for
  draft/missing. Related = other published posts.

## Verification
`npm run lint` + `npx tsc --noEmit` + `npm run build` green. Manual: admin create draft →
not public → publish → visible at `/resources/blog/<slug>` with rendered body → edit → delete.
