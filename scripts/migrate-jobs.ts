/**
 * One-off migration: remove all IT / software jobs from the database and sync
 * the current (non-IT) job set from src/content/jobs.ts.
 * Run: npx tsx --env-file=.env.local scripts/migrate-jobs.ts
 */
import { MongoClient } from "mongodb";
import { jobs } from "../src/content/jobs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "exzelon";
if (!uri) throw new Error("MONGODB_URI not set (run with --env-file=.env.local).");

async function main() {
  const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(dbName);
  console.log("Connected to", dbName);

  // 1. Remove IT jobs + any applications tied to them
  const itJobs = await db.collection("jobs").find({ industry: "it" }).toArray();
  const itSlugs = itJobs.map((j) => j.slug);
  console.log("IT jobs to remove:", itSlugs);
  if (itSlugs.length) {
    const apps = await db.collection("applications").deleteMany({ jobSlug: { $in: itSlugs } });
    console.log("  deleted applications for IT jobs:", apps.deletedCount);
  }
  const del = await db.collection("jobs").deleteMany({ industry: "it" });
  console.log("  deleted IT jobs:", del.deletedCount);

  // 2. Upsert the current content jobs (non-IT + new replacements)
  let n = 0;
  for (const j of jobs) {
    await db.collection("jobs").updateOne(
      { slug: j.id },
      {
        $set: {
          title: j.title,
          industry: j.industry,
          industryName: j.industryName,
          location: j.location,
          type: j.type,
          remote: j.remote,
          salary: j.salary,
          summary: j.summary,
          responsibilities: j.responsibilities,
          requirements: j.requirements,
          featured: !!j.featured,
          status: "open",
          postedByUserId: null,
          postedByName: "Exzelon",
        },
        $setOnInsert: { slug: j.id, createdAt: new Date() },
      },
      { upsert: true }
    );
    n++;
  }
  console.log("Upserted content jobs:", n);

  const total = await db.collection("jobs").countDocuments();
  const itLeft = await db.collection("jobs").countDocuments({ industry: "it" });
  console.log(`Total jobs now: ${total} | IT jobs remaining: ${itLeft}`);

  await client.close();
  console.log("Migration complete.");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
