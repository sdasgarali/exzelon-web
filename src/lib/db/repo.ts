import "server-only";
import { ObjectId } from "mongodb";
import {
  usersCollection,
  jobsCollection,
  applicationsCollection,
  contactsCollection,
  ensureIndexes,
  serialize,
  type UserDoc,
  type JobDoc,
  type ApplicationDoc,
  type ContactDoc,
} from "./models";
import { getIndustry } from "@/content/industries";
import type { Job as PublicJob } from "@/content/jobs";
import { timeAgo } from "@/lib/utils";
import type { Role } from "@/lib/auth/jwt";

/** ---------- helpers ---------- */

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const oid = (id: string) => {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

/** ---------- users ---------- */

export async function getUserByEmail(email: string) {
  const users = await usersCollection();
  return users.findOne({ email: email.toLowerCase().trim() });
}

export async function getUserById(id: string) {
  const _id = oid(id);
  if (!_id) return null;
  const users = await usersCollection();
  return users.findOne({ _id });
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  company?: string;
}) {
  await ensureIndexes();
  const users = await usersCollection();
  const doc: UserDoc = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role,
    ...(data.company ? { company: data.company.trim() } : {}),
    savedJobs: [],
    createdAt: new Date(),
  };
  const res = await users.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listUsers() {
  const users = await usersCollection();
  const docs = await users.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function updateUserRole(id: string, role: Role) {
  const _id = oid(id);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne({ _id }, { $set: { role } });
  return res.matchedCount > 0;
}

export async function toggleSavedJob(userId: string, jobSlug: string) {
  const _id = oid(userId);
  if (!_id) return null;
  const users = await usersCollection();
  const user = await users.findOne({ _id });
  if (!user) return null;
  const saved = new Set(user.savedJobs ?? []);
  if (saved.has(jobSlug)) saved.delete(jobSlug);
  else saved.add(jobSlug);
  await users.updateOne({ _id }, { $set: { savedJobs: [...saved] } });
  return [...saved];
}

/** ---------- jobs ---------- */

export type JobFilter = { industry?: string; status?: "open" | "closed" };

function mapJob(doc: JobDoc) {
  return serialize(doc);
}

/** Map a DB job to the public-facing `Job` shape used by the marketing components. */
function toPublicJob(doc: JobDoc): PublicJob {
  return {
    id: doc.slug,
    title: doc.title,
    industry: doc.industry,
    industryName: doc.industryName,
    location: doc.location,
    type: doc.type,
    remote: doc.remote,
    salary: doc.salary,
    posted: timeAgo(doc.createdAt),
    summary: doc.summary,
    responsibilities: doc.responsibilities,
    requirements: doc.requirements,
    featured: doc.featured,
  };
}

export async function listPublicJobs(): Promise<PublicJob[]> {
  const jobs = await jobsCollection();
  const docs = await jobs.find({ status: "open" }).sort({ featured: -1, createdAt: -1 }).toArray();
  return docs.map(toPublicJob);
}

export async function listFeaturedPublicJobs(limit = 3): Promise<PublicJob[]> {
  const jobs = await jobsCollection();
  const docs = await jobs
    .find({ status: "open", featured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toPublicJob);
}

export async function listPublicJobsByIndustry(industry: string): Promise<PublicJob[]> {
  const jobs = await jobsCollection();
  const docs = await jobs.find({ status: "open", industry }).sort({ createdAt: -1 }).toArray();
  return docs.map(toPublicJob);
}

export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  const jobs = await jobsCollection();
  const doc = await jobs.findOne({ slug });
  return doc && doc.status === "open" ? toPublicJob(doc) : null;
}

export async function listPublicJobsBySlugs(slugs: string[]): Promise<PublicJob[]> {
  if (slugs.length === 0) return [];
  const jobs = await jobsCollection();
  const docs = await jobs.find({ slug: { $in: slugs } }).toArray();
  return docs.map(toPublicJob);
}

export async function listJobs(filter: JobFilter = {}) {
  const jobs = await jobsCollection();
  const query: Record<string, unknown> = {};
  if (filter.industry) query.industry = filter.industry;
  if (filter.status) query.status = filter.status;
  const docs = await jobs.find(query).sort({ featured: -1, createdAt: -1 }).toArray();
  return docs.map(mapJob);
}

export async function listOpenJobs() {
  return listJobs({ status: "open" });
}

export async function listJobsByOwner(userId: string) {
  const jobs = await jobsCollection();
  const docs = await jobs.find({ postedByUserId: userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(mapJob);
}

export async function getJobBySlug(slug: string) {
  const jobs = await jobsCollection();
  const doc = await jobs.findOne({ slug });
  return doc ? mapJob(doc) : null;
}

export async function createJob(data: {
  title: string;
  industry: string;
  location: string;
  type: JobDoc["type"];
  remote: JobDoc["remote"];
  salary: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  featured?: boolean;
  status?: JobDoc["status"];
  postedByUserId: string | null;
  postedByName: string;
}) {
  await ensureIndexes();
  const jobs = await jobsCollection();
  const industry = getIndustry(data.industry);
  // unique slug
  const base = slugify(data.title) || "job";
  let slug = base;
  let n = 1;
  while (await jobs.findOne({ slug })) slug = `${base}-${n++}`;

  const doc: JobDoc = {
    slug,
    title: data.title.trim(),
    industry: data.industry,
    industryName: industry?.name ?? data.industry,
    location: data.location.trim(),
    type: data.type,
    remote: data.remote,
    salary: data.salary.trim(),
    summary: data.summary.trim(),
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    featured: !!data.featured,
    status: data.status ?? "open",
    postedByUserId: data.postedByUserId,
    postedByName: data.postedByName,
    createdAt: new Date(),
  };
  await jobs.insertOne(doc);
  return mapJob(doc);
}

export async function updateJob(
  slug: string,
  data: Partial<Omit<JobDoc, "_id" | "slug" | "createdAt">>,
  ownerUserId?: string // if set, only update when owned by this user
) {
  const jobs = await jobsCollection();
  const filter: Record<string, unknown> = { slug };
  if (ownerUserId) filter.postedByUserId = ownerUserId;
  if (data.industry) data.industryName = getIndustry(data.industry)?.name ?? data.industry;
  const res = await jobs.updateOne(filter, { $set: data });
  return res.matchedCount > 0;
}

export async function deleteJob(slug: string, ownerUserId?: string) {
  const jobs = await jobsCollection();
  const filter: Record<string, unknown> = { slug };
  if (ownerUserId) filter.postedByUserId = ownerUserId;
  const res = await jobs.deleteOne(filter);
  return res.deletedCount > 0;
}

/** ---------- applications ---------- */

export async function createApplication(data: Omit<ApplicationDoc, "_id" | "status" | "createdAt">) {
  await ensureIndexes();
  const apps = await applicationsCollection();
  const doc: ApplicationDoc = { ...data, status: "new", createdAt: new Date() };
  const res = await apps.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listApplications() {
  const apps = await applicationsCollection();
  const docs = await apps.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function listApplicationsByJobSlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const apps = await applicationsCollection();
  const docs = await apps.find({ jobSlug: { $in: slugs } }).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function listApplicationsByJobSlug(slug: string) {
  const apps = await applicationsCollection();
  const docs = await apps.find({ jobSlug: slug }).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

/** Returns a { jobSlug: applicantCount } map for the given jobs. */
export async function countApplicationsByJobSlugs(slugs: string[]): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  const apps = await applicationsCollection();
  const rows = await apps
    .aggregate<{ _id: string; count: number }>([
      { $match: { jobSlug: { $in: slugs } } },
      { $group: { _id: "$jobSlug", count: { $sum: 1 } } },
    ])
    .toArray();
  const map: Record<string, number> = {};
  for (const r of rows) map[r._id] = r.count;
  return map;
}

export async function listApplicationsByUser(userId: string) {
  const apps = await applicationsCollection();
  const docs = await apps.find({ applicantUserId: userId }).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function getApplicationById(id: string) {
  const _id = oid(id);
  if (!_id) return null;
  const apps = await applicationsCollection();
  const doc = await apps.findOne({ _id });
  return doc ? serialize(doc) : null;
}

export async function updateApplicationStatus(id: string, status: ApplicationDoc["status"]) {
  const _id = oid(id);
  if (!_id) return false;
  const apps = await applicationsCollection();
  const res = await apps.updateOne({ _id }, { $set: { status } });
  return res.matchedCount > 0;
}

/** ---------- contacts ---------- */

export async function createContact(data: Omit<ContactDoc, "_id" | "status" | "createdAt">) {
  await ensureIndexes();
  const contacts = await contactsCollection();
  const doc: ContactDoc = { ...data, status: "new", createdAt: new Date() };
  await contacts.insertOne(doc);
  return doc;
}

export async function listContacts() {
  const contacts = await contactsCollection();
  const docs = await contacts.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(serialize);
}

export async function markContactRead(id: string) {
  const _id = oid(id);
  if (!_id) return false;
  const contacts = await contactsCollection();
  const res = await contacts.updateOne({ _id }, { $set: { status: "read" } });
  return res.matchedCount > 0;
}

/** ---------- stats ---------- */

export async function getAdminStats() {
  const [users, jobs, apps, contacts] = await Promise.all([
    usersCollection(),
    jobsCollection(),
    applicationsCollection(),
    contactsCollection(),
  ]);
  const [userCount, jobCount, openJobs, appCount, newApps, contactCount, newContacts] = await Promise.all([
    users.countDocuments(),
    jobs.countDocuments(),
    jobs.countDocuments({ status: "open" }),
    apps.countDocuments(),
    apps.countDocuments({ status: "new" }),
    contacts.countDocuments(),
    contacts.countDocuments({ status: "new" }),
  ]);
  return { userCount, jobCount, openJobs, appCount, newApps, contactCount, newContacts };
}
