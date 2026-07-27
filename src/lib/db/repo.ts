import "server-only";
import { ObjectId } from "mongodb";
import {
  usersCollection,
  jobsCollection,
  applicationsCollection,
  contactsCollection,
  auditLogsCollection,
  messagesCollection,
  ensureIndexes,
  serialize,
  type UserDoc,
  type JobDoc,
  type ApplicationDoc,
  type ContactDoc,
  type AuditLogDoc,
  type MessageDoc,
  type SeekerProfile,
} from "./models";
import { getIndustry } from "@/content/industries";
import type { Job as PublicJob } from "@/content/jobs";
import { timeAgo } from "@/lib/utils";
import { parseSalary } from "@/lib/salary";
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

/** Update basic user fields. Returns a status code so the API can 409 on a taken email. */
export async function updateUser(
  id: string,
  data: { name?: string; email?: string; company?: string }
): Promise<"ok" | "not_found" | "email_taken"> {
  const _id = oid(id);
  if (!_id) return "not_found";
  const users = await usersCollection();
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set.name = data.name.trim();
  if (data.company !== undefined) set.company = data.company.trim();
  if (data.email !== undefined) {
    const email = data.email.toLowerCase().trim();
    const existing = await users.findOne({ email });
    if (existing && String(existing._id) !== id) return "email_taken";
    set.email = email;
  }
  if (Object.keys(set).length === 0) return "ok";
  const res = await users.updateOne({ _id }, { $set: set });
  return res.matchedCount > 0 ? "ok" : "not_found";
}

export async function setUserPassword(id: string, passwordHash: string) {
  const _id = oid(id);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne({ _id }, { $set: { passwordHash } });
  return res.matchedCount > 0;
}

export async function deleteUser(id: string) {
  const _id = oid(id);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.deleteOne({ _id });
  return res.deletedCount > 0;
}

/** ---------- email verification & password reset ---------- */

/** Store a hashed verification token + expiry on a user (by id). */
export async function setVerifyToken(id: string, hash: string, expires: Date) {
  const _id = oid(id);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne(
    { _id },
    { $set: { verifyTokenHash: hash, verifyTokenExpires: expires } }
  );
  return res.matchedCount > 0;
}

/** Consume a verification token: marks the user verified and clears the token. */
export async function verifyEmailByTokenHash(hash: string): Promise<boolean> {
  const users = await usersCollection();
  const user = await users.findOne({ verifyTokenHash: hash });
  if (!user || !user.verifyTokenExpires || user.verifyTokenExpires.getTime() < Date.now()) {
    return false;
  }
  await users.updateOne(
    { _id: user._id },
    { $set: { emailVerified: true }, $unset: { verifyTokenHash: "", verifyTokenExpires: "" } }
  );
  return true;
}

/** Store a hashed reset token + expiry, looked up by email. Returns the user (or null). */
export async function setResetTokenByEmail(email: string, hash: string, expires: Date) {
  const users = await usersCollection();
  const user = await users.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;
  await users.updateOne(
    { _id: user._id },
    { $set: { resetTokenHash: hash, resetTokenExpires: expires } }
  );
  return user;
}

/** Consume a reset token: sets a new password hash and clears the token. */
export async function resetPasswordByTokenHash(hash: string, passwordHash: string): Promise<boolean> {
  const users = await usersCollection();
  const user = await users.findOne({ resetTokenHash: hash });
  if (!user || !user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
    return false;
  }
  await users.updateOne(
    { _id: user._id },
    { $set: { passwordHash }, $unset: { resetTokenHash: "", resetTokenExpires: "" } }
  );
  return true;
}

export async function updateUserProfile(userId: string, profile: SeekerProfile) {
  const _id = oid(userId);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne(
    { _id },
    { $set: { profile: { ...profile, updatedAt: new Date() } } }
  );
  return res.matchedCount > 0;
}

/** Update an employer's company name + branding profile. */
export async function updateCompanyProfile(
  userId: string,
  data: { company?: string; profile: import("@/lib/company").CompanyProfile }
) {
  const _id = oid(userId);
  if (!_id) return false;
  const users = await usersCollection();
  const set: Record<string, unknown> = {
    companyProfile: { ...data.profile, updatedAt: new Date() },
  };
  if (data.company !== undefined) set.company = data.company.trim();
  const res = await users.updateOne({ _id }, { $set: set });
  return res.matchedCount > 0;
}

/** Public company view: an employer's open, non-expired jobs (mapped to PublicJob). */
export async function listPublicJobsByOwner(userId: string): Promise<PublicJob[]> {
  try {
    const jobs = await jobsCollection();
    const docs = await jobs
      .find({ postedByUserId: userId, status: "open", ...notExpired() })
      .sort({ featured: -1, createdAt: -1 })
      .toArray();
    return docs.map(toPublicJob);
  } catch (e) {
    console.error("[db] listPublicJobsByOwner failed:", e);
    return [];
  }
}

/** Update a subset of seeker-profile fields without replacing the whole object. */
export async function updateProfileFields(userId: string, fields: Partial<SeekerProfile>) {
  const _id = oid(userId);
  if (!_id) return false;
  const users = await usersCollection();
  const set: Record<string, unknown> = { "profile.updatedAt": new Date() };
  for (const [k, v] of Object.entries(fields)) set[`profile.${k}`] = v;
  const res = await users.updateOne({ _id }, { $set: set });
  return res.matchedCount > 0;
}

/** Remove resume-file fields from a seeker profile (used when deleting a file). */
export async function clearResumeFileFields(userId: string) {
  const _id = oid(userId);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne(
    { _id },
    { $unset: { "profile.resumeFileId": "", "profile.resumeFileName": "" }, $set: { "profile.updatedAt": new Date() } }
  );
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
    ...(doc.postedByUserId ? { companyId: doc.postedByUserId } : {}),
    company: doc.postedByName,
    ...(doc.expiresAt ? { expiresAt: new Date(doc.expiresAt).toISOString() } : {}),
  };
}

/**
 * Mongo clause matching jobs that haven't expired: no expiry set, or expiry in
 * the future. Merged into every public read so expired roles disappear from the
 * board without a background job.
 */
function notExpired(): Record<string, unknown> {
  return { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
}

// Public reads degrade to empty/null if the DB is unreachable, so a transient
// DB issue can't hard-fail the build (ISR revalidates with real data at runtime).
export async function listPublicJobs(): Promise<PublicJob[]> {
  try {
    const jobs = await jobsCollection();
    const docs = await jobs.find({ status: "open", ...notExpired() }).sort({ featured: -1, createdAt: -1 }).toArray();
    return docs.map(toPublicJob);
  } catch (e) {
    console.error("[db] listPublicJobs failed:", e);
    return [];
  }
}

export type JobSearchParams = {
  q?: string;
  loc?: string;
  industry?: string;
  type?: string;
  remote?: string;
  salaryMin?: number;
  sort?: "recent" | "salary";
  page?: number;
  pageSize?: number;
};

export type JobSearchResult = {
  jobs: PublicJob[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Server-side, paginated public job search. Filtering + pagination happen in
 * Mongo so the page scales past a handful of jobs. Degrades to an empty result
 * set on DB error (consistent with the other public reads).
 */
export async function searchPublicJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 9));
  try {
    const jobs = await jobsCollection();
    // `$and` composes the expiry-$or with the optional keyword-$or (two $or keys
    // can't share one object).
    const query: Record<string, unknown> = { status: "open", $and: [notExpired()] };
    const and = query.$and as Record<string, unknown>[];

    if (params.q?.trim()) {
      const rx = { $regex: escapeRegex(params.q.trim()), $options: "i" };
      and.push({ $or: [{ title: rx }, { industryName: rx }, { summary: rx }] });
    }
    if (params.loc?.trim()) query.location = { $regex: escapeRegex(params.loc.trim()), $options: "i" };
    if (params.industry && params.industry !== "all") query.industry = params.industry;
    if (params.type && params.type !== "all") query.type = params.type;
    if (params.remote && params.remote !== "all") query.remote = params.remote;
    if (params.salaryMin && params.salaryMin > 0) query.salaryMax = { $gte: params.salaryMin };

    const sort: Record<string, 1 | -1> =
      params.sort === "salary" ? { salaryMax: -1, createdAt: -1 } : { featured: -1, createdAt: -1 };

    const total = await jobs.countDocuments(query);
    const docs = await jobs
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      jobs: docs.map(toPublicJob),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (e) {
    console.error("[db] searchPublicJobs failed:", e);
    return { jobs: [], total: 0, page, pageSize, totalPages: 1 };
  }
}

export async function listFeaturedPublicJobs(limit = 3): Promise<PublicJob[]> {
  try {
    const jobs = await jobsCollection();
    const docs = await jobs
      .find({ status: "open", featured: true, ...notExpired() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map(toPublicJob);
  } catch (e) {
    console.error("[db] listFeaturedPublicJobs failed:", e);
    return [];
  }
}

export async function listPublicJobsByIndustry(industry: string): Promise<PublicJob[]> {
  try {
    const jobs = await jobsCollection();
    const docs = await jobs.find({ status: "open", industry, ...notExpired() }).sort({ createdAt: -1 }).toArray();
    return docs.map(toPublicJob);
  } catch (e) {
    console.error("[db] listPublicJobsByIndustry failed:", e);
    return [];
  }
}

export async function getPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  try {
    const jobs = await jobsCollection();
    const doc = await jobs.findOne({ slug });
    const expired = doc?.expiresAt ? new Date(doc.expiresAt).getTime() <= Date.now() : false;
    return doc && doc.status === "open" && !expired ? toPublicJob(doc) : null;
  } catch (e) {
    console.error("[db] getPublicJobBySlug failed:", e);
    return null;
  }
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
  expiresAt?: Date | null;
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

  const { min: salaryMin, max: salaryMax } = parseSalary(data.salary);
  const doc: JobDoc = {
    slug,
    title: data.title.trim(),
    industry: data.industry,
    industryName: industry?.name ?? data.industry,
    location: data.location.trim(),
    type: data.type,
    remote: data.remote,
    salary: data.salary.trim(),
    ...(salaryMin !== undefined ? { salaryMin } : {}),
    ...(salaryMax !== undefined ? { salaryMax } : {}),
    summary: data.summary.trim(),
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    featured: !!data.featured,
    status: data.status ?? "open",
    ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
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
  // Keep derived salary bounds in sync when the salary string changes.
  if (data.salary !== undefined) {
    const { min, max } = parseSalary(data.salary);
    data.salaryMin = min;
    data.salaryMax = max;
  }
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

/**
 * True if the employer may download the resume file `fileId`: there exists an
 * application carrying that file whose job is owned by this employer.
 */
export async function employerCanAccessResume(employerId: string, fileId: string): Promise<boolean> {
  const apps = await applicationsCollection();
  const app = await apps.findOne({ resumeFileId: fileId });
  if (!app) return false;
  const jobs = await jobsCollection();
  const job = await jobs.findOne({ slug: app.jobSlug });
  return !!job && job.postedByUserId === employerId;
}

/** ---------- messaging (application-scoped threads) ---------- */

export type ThreadContext = {
  application: ReturnType<typeof serialize>;
  seekerId: string | null;
  employerId: string | null;
  jobTitle: string;
};

/**
 * Load the participants + metadata for an application's message thread, so
 * callers can authorize the seeker (applicant) and employer (job owner).
 */
export async function getThreadContext(applicationId: string): Promise<ThreadContext | null> {
  const app = await getApplicationById(applicationId);
  if (!app) return null;
  const job = await getJobBySlug(app.jobSlug as string);
  return {
    application: app,
    seekerId: (app.applicantUserId as string) ?? null,
    employerId: (job?.postedByUserId as string) ?? null,
    jobTitle: (app.jobTitle as string) ?? "",
  };
}

export async function listMessages(applicationId: string) {
  const messages = await messagesCollection();
  const docs = await messages.find({ applicationId }).sort({ createdAt: 1 }).toArray();
  return docs.map(serialize);
}

export async function createMessage(data: Omit<MessageDoc, "_id" | "createdAt">) {
  await ensureIndexes();
  const messages = await messagesCollection();
  const doc: MessageDoc = { ...data, createdAt: new Date() };
  const res = await messages.insertOne(doc);
  return serialize({ ...doc, _id: res.insertedId });
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

/** ---------- audit log ---------- */

export async function logAudit(entry: Omit<AuditLogDoc, "_id" | "createdAt">) {
  try {
    const audit = await auditLogsCollection();
    await audit.insertOne({ ...entry, createdAt: new Date() });
  } catch (e) {
    console.error("[db] logAudit failed:", e);
  }
}

export async function listAuditLogs(limit = 200) {
  const audit = await auditLogsCollection();
  const docs = await audit.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(serialize);
}

/** ---------- analytics ---------- */

export type Analytics = {
  appsByDay: { date: string; count: number }[];
  appsByStatus: Record<string, number>;
  jobsByIndustry: { industry: string; count: number }[];
  topJobs: { title: string; count: number }[];
};

export async function getAnalytics(days = 14): Promise<Analytics> {
  const apps = await applicationsCollection();
  const jobs = await jobsCollection();

  const since = new Date(Date.now() - days * 86_400_000);

  const [dayRows, statusRows, industryRows, topRows] = await Promise.all([
    apps
      .aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      ])
      .toArray(),
    apps
      .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }])
      .toArray(),
    jobs
      .aggregate<{ _id: string; count: number }>([
        { $match: { status: "open" } },
        { $group: { _id: "$industryName", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray(),
    apps
      .aggregate<{ _id: string; count: number; title: string }>([
        { $group: { _id: "$jobSlug", count: { $sum: 1 }, title: { $first: "$jobTitle" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
  ]);

  // Fill a continuous day series so the chart has no gaps.
  const dayMap = new Map(dayRows.map((r) => [r._id, r.count]));
  const appsByDay: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    appsByDay.push({ date: d, count: dayMap.get(d) ?? 0 });
  }

  const appsByStatus: Record<string, number> = { new: 0, reviewed: 0, shortlisted: 0, rejected: 0 };
  for (const r of statusRows) appsByStatus[r._id] = r.count;

  return {
    appsByDay,
    appsByStatus,
    jobsByIndustry: industryRows.map((r) => ({ industry: r._id, count: r.count })),
    topJobs: topRows.map((r) => ({ title: r.title, count: r.count })),
  };
}

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
