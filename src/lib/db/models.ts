import "server-only";
import { getDb } from "./mongodb";
import type { Collection, Document } from "mongodb";
import type { Role } from "@/lib/auth/jwt";
import type { SeekerProfile } from "@/lib/profile";

export type { SeekerProfile, ExperienceEntry, EducationEntry } from "@/lib/profile";

/** ---------- Document shapes ---------- */

export type UserDoc = {
  _id?: import("mongodb").ObjectId;
  name: string;
  email: string; // stored lowercase, unique
  passwordHash: string;
  role: Role;
  company?: string; // employers
  phone?: string;
  savedJobs?: string[]; // seeker: job ids
  profile?: SeekerProfile; // seeker
  createdAt: Date;
};

export type JobDoc = {
  _id?: import("mongodb").ObjectId;
  slug: string; // stable public id (unique)
  title: string;
  industry: string;
  industryName: string;
  location: string;
  type: "Full-time" | "Contract" | "Travel" | "Part-time" | "Temp-to-hire";
  remote: "On-site" | "Hybrid" | "Remote";
  salary: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  featured: boolean;
  status: "open" | "closed";
  postedByUserId: string | null; // employer/admin user id, or null for seed
  postedByName: string; // company or "Exzelon"
  createdAt: Date;
};

export type ApplicationDoc = {
  _id?: import("mongodb").ObjectId;
  jobSlug: string;
  jobTitle: string;
  applicantUserId: string | null;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  resumeUrl?: string;
  experienceLevel?: "fresher" | "experienced";
  coverLetter?: string;
  status: "new" | "reviewed" | "shortlisted" | "rejected";
  createdAt: Date;
};

export type ContactDoc = {
  _id?: import("mongodb").ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  interest: "job-seeker" | "employer" | "general";
  status: "new" | "read";
  createdAt: Date;
};

/** ---------- Collection accessors ---------- */

async function collection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export const usersCollection = () => collection<UserDoc>("users");
export const jobsCollection = () => collection<JobDoc>("jobs");
export const applicationsCollection = () => collection<ApplicationDoc>("applications");
export const contactsCollection = () => collection<ContactDoc>("contacts");

/** Ensure indexes exist (idempotent). Safe to call from seed or on first write. */
export async function ensureIndexes() {
  const users = await usersCollection();
  await users.createIndex({ email: 1 }, { unique: true });
  const jobs = await jobsCollection();
  await jobs.createIndex({ slug: 1 }, { unique: true });
  await jobs.createIndex({ industry: 1 });
  await jobs.createIndex({ status: 1, createdAt: -1 });
  const apps = await applicationsCollection();
  await apps.createIndex({ jobSlug: 1 });
  await apps.createIndex({ applicantUserId: 1 });
  await apps.createIndex({ createdAt: -1 });
  const contacts = await contactsCollection();
  await contacts.createIndex({ createdAt: -1 });
}

/** Serialize a Mongo document to a plain JSON-safe object (ObjectId/Date → string). */
export function serialize<T extends Record<string, unknown>>(doc: T): T & { id: string } {
  const out: Record<string, unknown> = { ...doc };
  if (out._id) {
    out.id = String(out._id);
    delete out._id;
  }
  for (const [k, v] of Object.entries(out)) {
    if (v instanceof Date) out[k] = v.toISOString();
  }
  return out as T & { id: string };
}
