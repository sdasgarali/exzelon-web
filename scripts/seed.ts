/**
 * Seed script — populates MongoDB with the initial job listings and demo accounts.
 * Run:  npm run db:seed
 * (loads .env.local via the npm script's --env-file flag)
 *
 * Self-contained: talks to Mongo directly and hashes with bcryptjs so it doesn't
 * import any `server-only` modules. Imports only the pure `jobs` data array.
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { jobs } from "../src/content/jobs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "exzelon";
if (!uri) throw new Error("MONGODB_URI not set (run via `npm run db:seed`).");

const DEMO = [
  { name: "Site Admin", email: "admin@exzelon.com", password: "Admin@12345", role: "admin" as const },
  { name: "Acme Health (Employer)", email: "employer@exzelon.com", password: "Employer@123", role: "employer" as const, company: "Acme Health" },
  { name: "Jamie Candidate", email: "seeker@exzelon.com", password: "Seeker@12345", role: "seeker" as const },
];

async function main() {
  const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to ${dbName}`);

  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("jobs").createIndex({ slug: 1 }, { unique: true });
  await db.collection("applications").createIndex({ jobSlug: 1 });
  await db.collection("contacts").createIndex({ createdAt: -1 });

  // Users (upsert by email)
  for (const u of DEMO) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db.collection("users").updateOne(
      { email: u.email },
      {
        $set: { name: u.name, role: u.role, passwordHash, ...(u.role === "employer" ? { company: u.company } : {}) },
        $setOnInsert: { email: u.email, createdAt: new Date(), savedJobs: [] },
      },
      { upsert: true }
    );
    console.log(`  user: ${u.email} (${u.role})`);
  }

  // Jobs (upsert by slug) — migrate the static seed data
  let count = 0;
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
    count++;
  }
  console.log(`  jobs upserted: ${count}`);

  await client.close();
  console.log("Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
