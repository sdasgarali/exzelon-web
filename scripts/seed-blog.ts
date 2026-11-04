/**
 * Blog-only seed — upserts the posts in `src/content/blog-seed.ts` into the
 * `posts` collection, by slug. Does NOT touch users or jobs (unlike the full
 * `db:seed`), so it is safe to run against production to publish new posts.
 *
 * Run:  npm run db:seed-blog
 * (loads .env.local via the npm script's --env-file flag)
 */
import { MongoClient } from "mongodb";
import { blogSeed } from "../src/content/blog-seed";

const readingTime = (body: string) => {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "exzelon";
if (!uri) throw new Error("MONGODB_URI not set (run via `npm run db:seed-blog`).");

async function main() {
  const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to ${dbName}`);

  const posts = db.collection("posts");
  await posts.createIndex({ slug: 1 }, { unique: true });
  await posts.createIndex({ status: 1, publishedAt: -1 });

  let count = 0;
  for (const p of blogSeed) {
    const publishedAt = new Date(`${p.date}T12:00:00Z`);
    const content = {
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      body: p.body,
      author: p.author,
      readingTime: readingTime(p.body),
      status: "published",
      featured: !!p.featured,
      ...(p.coverImageUrl ? { coverImageUrl: p.coverImageUrl } : {}),
      authorUserId: null,
      publishedAt,
    };

    // `updatedAt` is the sitemap's `lastmod` for every post. Bumping it on every run made
    // all 25 posts claim they were modified in the same second, which tells Google the
    // lastmod is noise and gets it ignored. Only stamp it when the content actually
    // differs from what is stored, so an unchanged post keeps its real modification date.
    const existing = await posts.findOne(
      { slug: p.slug },
      {
        projection: {
          title: 1, excerpt: 1, category: 1, body: 1, author: 1, readingTime: 1,
          status: 1, featured: 1, coverImageUrl: 1, publishedAt: 1,
        },
      }
    );
    const changed =
      !existing ||
      Object.entries(content).some(([key, value]) => {
        const current = (existing as Record<string, unknown>)[key];
        if (key === "publishedAt") {
          return !(current instanceof Date) || current.getTime() !== publishedAt.getTime();
        }
        if (key === "featured") return !!current !== !!value;
        if (typeof value === "string" && current === undefined) return false;
        return current !== value;
      });

    const res = await posts.updateOne(
      { slug: p.slug },
      {
        $set: { ...content, ...(changed ? { updatedAt: new Date() } : {}) },
        $setOnInsert: { slug: p.slug, createdAt: publishedAt },
      },
      { upsert: true }
    );
    const action = res.upsertedCount ? "inserted" : changed ? "updated" : "unchanged";
    console.log(`  ${action}: ${p.slug}${p.featured ? " (featured)" : ""}`);
    count++;
  }
  console.log(`Blog seed complete — ${count} posts upserted.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
