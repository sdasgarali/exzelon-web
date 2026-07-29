import "server-only";
import { ObjectId } from "mongodb";
import { createHash, randomBytes } from "crypto";
import {
  usersCollection,
  jobsCollection,
  applicationsCollection,
  contactsCollection,
  postsCollection,
  auditLogsCollection,
  messagesCollection,
  pendingRegistrationsCollection,
  visitorLogsCollection,
  visitorDailyStatsCollection,
  analyticsApiKeysCollection,
  ensureIndexes,
  serialize,
  type UserDoc,
  type PendingRegistrationDoc,
  type AnalyticsApiKeyDoc,
  type VisitorLogDoc,
  type JobDoc,
  type ApplicationDoc,
  type ContactDoc,
  type PostDoc,
  type AuditLogDoc,
  type MessageDoc,
  type SeekerProfile,
} from "./models";
import { getIndustry } from "@/content/industries";
import type { Job as PublicJob } from "@/content/jobs";
import { timeAgo } from "@/lib/utils";
import { parseSalary } from "@/lib/salary";
import { readingTime } from "@/lib/markdown";
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
  emailVerified?: boolean;
}) {
  await ensureIndexes();
  const users = await usersCollection();
  const doc: UserDoc = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: data.passwordHash,
    role: data.role,
    ...(data.company ? { company: data.company.trim() } : {}),
    ...(data.emailVerified ? { emailVerified: true } : {}),
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

/** Store hashed verification credentials (magic-link token + 6-digit OTP) on a user (by id). */
export async function setVerifyCredentials(
  id: string,
  creds: { tokenHash: string; tokenExpires: Date; otpHash: string; otpExpires: Date }
) {
  const _id = oid(id);
  if (!_id) return false;
  const users = await usersCollection();
  const res = await users.updateOne(
    { _id },
    {
      $set: {
        verifyTokenHash: creds.tokenHash,
        verifyTokenExpires: creds.tokenExpires,
        verifyOtpHash: creds.otpHash,
        verifyOtpExpires: creds.otpExpires,
      },
    }
  );
  return res.matchedCount > 0;
}

/** Fields cleared once an email is verified — both the link token and the OTP. */
const CLEAR_VERIFY_FIELDS = {
  verifyTokenHash: "",
  verifyTokenExpires: "",
  verifyOtpHash: "",
  verifyOtpExpires: "",
} as const;

/** Consume a verification link token: marks the user verified and clears both credentials. */
export async function verifyEmailByTokenHash(hash: string): Promise<boolean> {
  const users = await usersCollection();
  const user = await users.findOne({ verifyTokenHash: hash });
  if (!user || !user.verifyTokenExpires || user.verifyTokenExpires.getTime() < Date.now()) {
    return false;
  }
  await users.updateOne(
    { _id: user._id },
    { $set: { emailVerified: true }, $unset: CLEAR_VERIFY_FIELDS }
  );
  return true;
}

/**
 * Consume a verification OTP for a specific (signed-in) user: marks verified and clears both
 * credentials. Scoped by userId so a code is only valid for the account that requested it.
 */
export async function verifyEmailByOtp(userId: string, otpHash: string): Promise<boolean> {
  const _id = oid(userId);
  if (!_id) return false;
  const users = await usersCollection();
  const user = await users.findOne({ _id });
  if (
    !user ||
    user.verifyOtpHash !== otpHash ||
    !user.verifyOtpExpires ||
    user.verifyOtpExpires.getTime() < Date.now()
  ) {
    return false;
  }
  await users.updateOne(
    { _id: user._id },
    { $set: { emailVerified: true }, $unset: CLEAR_VERIFY_FIELDS }
  );
  return true;
}

/** ---------- pending registrations (OTP-gated signup) ---------- */

/**
 * Create or replace the pending registration for an email, returning its id.
 * One pending record per email (unique index) — re-submitting overwrites the prior code.
 */
export async function upsertPendingRegistration(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "employer" | "seeker";
  company?: string;
  otpHash: string;
  otpExpires: Date;
}): Promise<string> {
  await ensureIndexes();
  const pending = await pendingRegistrationsCollection();
  const email = data.email.toLowerCase().trim();
  const doc: PendingRegistrationDoc = {
    name: data.name.trim(),
    email,
    passwordHash: data.passwordHash,
    role: data.role,
    ...(data.company ? { company: data.company.trim() } : {}),
    otpHash: data.otpHash,
    otpExpires: data.otpExpires,
    createdAt: new Date(),
  };
  const res = await pending.findOneAndReplace({ email }, doc, {
    upsert: true,
    returnDocument: "after",
  });
  return String(res?._id);
}

export async function getPendingRegistration(id: string) {
  const _id = oid(id);
  if (!_id) return null;
  const pending = await pendingRegistrationsCollection();
  return pending.findOne({ _id });
}

/** Reissue the OTP for an existing pending registration (resend). */
export async function setPendingOtp(id: string, otpHash: string, otpExpires: Date) {
  const _id = oid(id);
  if (!_id) return false;
  const pending = await pendingRegistrationsCollection();
  const res = await pending.updateOne({ _id }, { $set: { otpHash, otpExpires } });
  return res.matchedCount > 0;
}

export async function deletePendingRegistration(id: string) {
  const _id = oid(id);
  if (!_id) return false;
  const pending = await pendingRegistrationsCollection();
  const res = await pending.deleteOne({ _id });
  return res.deletedCount > 0;
}

/** ---------- first-party visitor analytics ---------- */

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);

/**
 * Record a page view: upsert the (sessionId, source) visitor log and bump the
 * (day, source) daily counters. Never throws — a tracking beacon must not break a page.
 */
export async function recordVisit(input: {
  sessionId: string;
  source: string;
  path?: string;
  ipHash?: string;
  userAgent?: string;
  consent: boolean;
  // Auto-derived details (recorded once, on first sight of the session).
  referrer?: string;
  country?: string;
  city?: string;
  region?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  language?: string;
}): Promise<void> {
  try {
    await ensureIndexes();
    const source = (input.source || "exz-web").slice(0, 60);
    const logs = await visitorLogsCollection();
    const daily = await visitorDailyStatsCollection();
    const now = new Date();
    const day = utcDay(now);
    const path = (input.path || "/").slice(0, 300);

    const existing = await logs.findOne({ sessionId: input.sessionId, source });
    const isNew = !existing;
    const wasConsented = existing?.consentStatus === "accepted";
    const newlyConsented = input.consent && !wasConsented;
    const consentStatus: VisitorLogDoc["consentStatus"] = input.consent
      ? "accepted"
      : existing?.consentStatus ?? "pending";

    // Fields captured a single time, when the session is first seen.
    const onInsert: Record<string, unknown> = { firstSeenAt: now, landingPage: path };
    const clip = (v: string | undefined, n: number) => (v && v.trim() ? v.trim().slice(0, n) : undefined);
    const details: Record<string, string | undefined> = {
      referrer: clip(input.referrer, 500),
      country: clip(input.country, 4),
      city: clip(input.city, 120),
      region: clip(input.region, 120),
      browser: clip(input.browser, 40),
      os: clip(input.os, 40),
      deviceType: clip(input.deviceType, 20),
      language: clip(input.language, 40),
    };
    for (const [k, v] of Object.entries(details)) if (v !== undefined) onInsert[k] = v;

    await logs.updateOne(
      { sessionId: input.sessionId, source },
      {
        $set: {
          pagePath: path,
          consentStatus,
          lastSeenAt: now,
          ...(input.ipHash ? { ipHash: input.ipHash } : {}),
          ...(input.userAgent ? { userAgent: input.userAgent.slice(0, 400) } : {}),
        },
        $inc: { visitCount: 1 },
        $setOnInsert: onInsert,
      },
      { upsert: true }
    );

    await daily.updateOne(
      { day, source },
      {
        $inc: {
          totalVisits: 1,
          uniqueVisitors: isNew ? 1 : 0,
          consentedCount: newlyConsented ? 1 : 0,
        },
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("[analytics] recordVisit failed:", e);
  }
}

/**
 * Record a consent decision from the cookie banner. On "accepted" with details, capture
 * the visitor's name/email as a lead and bump the day's consentedCount (once per visitor).
 */
export async function recordConsent(input: {
  sessionId: string;
  source: string;
  status: "accepted" | "declined";
  name?: string;
  email?: string;
}): Promise<void> {
  try {
    await ensureIndexes();
    const source = (input.source || "exz-web").slice(0, 60);
    const logs = await visitorLogsCollection();
    const now = new Date();

    const existing = await logs.findOne({ sessionId: input.sessionId, source });
    const wasConsented = existing?.consentStatus === "accepted";

    const set: Record<string, unknown> = { consentStatus: input.status, lastSeenAt: now };
    if (input.status === "accepted") {
      set.consentedAt = now;
      if (input.name?.trim()) set.visitorName = input.name.trim().slice(0, 120);
      if (input.email?.trim()) set.visitorEmail = input.email.trim().toLowerCase().slice(0, 160);
    }

    await logs.updateOne(
      { sessionId: input.sessionId, source },
      { $set: set, $setOnInsert: { firstSeenAt: now, visitCount: 0 } },
      { upsert: true }
    );

    // Count this visitor as consented in today's bucket only on the first accept.
    if (input.status === "accepted" && !wasConsented) {
      const daily = await visitorDailyStatsCollection();
      await daily.updateOne(
        { day: utcDay(now), source },
        { $inc: { consentedCount: 1, totalVisits: 0, uniqueVisitors: 0 } },
        { upsert: true }
      );
    }
  } catch (e) {
    console.error("[analytics] recordConsent failed:", e);
  }
}

/** Consented visitors (leads) for the admin view + API, newest first. */
export async function listConsentedVisitors(opts: { source?: string; limit?: number } = {}) {
  const limit = Math.min(Math.max(opts.limit ?? 500, 1), 5000);
  const logs = await visitorLogsCollection();
  const query: Record<string, unknown> = { consentStatus: "accepted" };
  if (opts.source) query.source = opts.source;
  const docs = await logs
    .find(query)
    .sort({ consentedAt: -1, lastSeenAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({
    id: String(d._id),
    name: d.visitorName ?? null,
    email: d.visitorEmail ?? null,
    source: d.source,
    lastPage: d.pagePath ?? null,
    landingPage: d.landingPage ?? null,
    referrer: d.referrer ?? null,
    country: d.country ?? null,
    city: d.city ?? null,
    region: d.region ?? null,
    browser: d.browser ?? null,
    os: d.os ?? null,
    deviceType: d.deviceType ?? null,
    language: d.language ?? null,
    visitCount: d.visitCount ?? 0,
    consentedAt: d.consentedAt ? d.consentedAt.toISOString() : null,
    firstSeenAt: d.firstSeenAt ? d.firstSeenAt.toISOString() : null,
    lastSeenAt: d.lastSeenAt ? d.lastSeenAt.toISOString() : null,
  }));
}

/** Delete a visitor log (used to clear a consent row). Returns the doc's contact for the audit. */
export async function deleteVisitorLog(id: string): Promise<{ name?: string; email?: string } | null> {
  const _id = oid(id);
  if (!_id) return null;
  const logs = await visitorLogsCollection();
  const doc = await logs.findOne({ _id });
  if (!doc) return null;
  await logs.deleteOne({ _id });
  return { name: doc.visitorName, email: doc.visitorEmail };
}

/** Summary counters for the Cookie Consent header. */
export async function getConsentSummary() {
  const logs = await visitorLogsCollection();
  const [total, accepted, declined, withContact] = await Promise.all([
    logs.countDocuments({}),
    logs.countDocuments({ consentStatus: "accepted" }),
    logs.countDocuments({ consentStatus: "declined" }),
    logs.countDocuments({ consentStatus: "accepted", visitorEmail: { $exists: true, $ne: "" } }),
  ]);
  const decided = accepted + declined;
  return {
    totalVisitors: total,
    accepted,
    declined,
    withContact,
    consentRate: decided > 0 ? Math.round((accepted / decided) * 100) : 0,
  };
}

/** Build the analytics payload (neuraforz-compatible) for the public pull API. */
export async function getVisitorAnalytics(params: { days: number; source?: string }) {
  const days = Math.min(Math.max(Math.floor(params.days) || 30, 1), 90);
  const daily = await visitorDailyStatsCollection();
  const logs = await visitorLogsCollection();
  const today = utcDay();
  const cutoff = utcDay(new Date(Date.now() - (days - 1) * 86_400_000));

  const match: Record<string, unknown> = { day: { $gte: cutoff } };
  if (params.source) match.source = params.source;
  const rows = await daily.find(match).sort({ day: -1 }).toArray();

  const logFilter: Record<string, unknown> = {};
  if (params.source) logFilter.source = params.source;
  const [allTimeVisitors, consentedUsers] = await Promise.all([
    logs.countDocuments(logFilter),
    logs.countDocuments({ ...logFilter, consentStatus: "accepted" }),
  ]);

  let todayPv = 0;
  let todayUnique = 0;
  const bySource = new Map<string, number>();
  for (const r of rows) {
    if (r.day === today) {
      todayPv += r.totalVisits;
      todayUnique += r.uniqueVisitors;
    }
    bySource.set(r.source, (bySource.get(r.source) ?? 0) + r.totalVisits);
  }

  return {
    totals: {
      all_time_visitors: allTimeVisitors,
      today_unique: todayUnique,
      today_pageviews: todayPv,
      consented_users: consentedUsers,
    },
    daily: rows.map((r) => ({
      date: r.day,
      source: r.source,
      page_views: r.totalVisits,
      unique_visitors: r.uniqueVisitors,
      consented: r.consentedCount,
    })),
    sources: [...bySource.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count),
    meta: { period_days: days },
  };
}

/** ---------- analytics API keys (for AccessHub pull) ---------- */

type PublicApiKey = { id: string; name: string; keyPreview: string; active: boolean; createdAt: string; lastUsedAt?: string };

function publicApiKey(doc: AnalyticsApiKeyDoc & { _id?: ObjectId }): PublicApiKey {
  return {
    id: String(doc._id),
    name: doc.name,
    keyPreview: doc.keyPreview,
    active: doc.active,
    createdAt: doc.createdAt.toISOString(),
    ...(doc.lastUsedAt ? { lastUsedAt: doc.lastUsedAt.toISOString() } : {}),
  };
}

/** Mint a new API key. Returns the raw key ONCE — only its hash is stored. */
export async function createAnalyticsApiKey(name: string) {
  await ensureIndexes();
  const rawKey = "exz_" + randomBytes(32).toString("hex");
  const doc: AnalyticsApiKeyDoc = {
    name: (name || "").trim().slice(0, 80) || "API key",
    keyHash: sha256(rawKey),
    keyPreview: rawKey.slice(0, 12) + "…",
    active: true,
    createdAt: new Date(),
  };
  const col = await analyticsApiKeysCollection();
  const res = await col.insertOne(doc);
  return { rawKey, key: publicApiKey({ ...doc, _id: res.insertedId }) };
}

export async function listAnalyticsApiKeys(): Promise<PublicApiKey[]> {
  const col = await analyticsApiKeysCollection();
  const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(publicApiKey);
}

export async function revokeAnalyticsApiKey(id: string) {
  const _id = oid(id);
  if (!_id) return false;
  const col = await analyticsApiKeysCollection();
  const res = await col.updateOne({ _id }, { $set: { active: false } });
  return res.matchedCount > 0;
}

/** Validate a raw key from an Authorization header; returns the key name or null. */
export async function validateAnalyticsApiKey(rawKey: string): Promise<{ name: string } | null> {
  const col = await analyticsApiKeysCollection();
  const doc = await col.findOne({ keyHash: sha256(rawKey), active: true });
  if (!doc) return null;
  void col.updateOne({ _id: doc._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {});
  return { name: doc.name };
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
  // Known industry → its canonical slug + name; a custom one → slugified key + the typed name.
  const known = getIndustry(data.industry);
  const industrySlug = known ? data.industry : slugify(data.industry) || data.industry.trim();
  const industryName = known?.name ?? data.industry.trim();
  // unique slug
  const base = slugify(data.title) || "job";
  let slug = base;
  let n = 1;
  while (await jobs.findOne({ slug })) slug = `${base}-${n++}`;

  const { min: salaryMin, max: salaryMax } = parseSalary(data.salary);
  const doc: JobDoc = {
    slug,
    title: data.title.trim(),
    industry: industrySlug,
    industryName,
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
  if (data.industry) {
    const raw = data.industry;
    const known = getIndustry(raw);
    data.industry = known ? raw : slugify(raw) || raw.trim();
    data.industryName = known?.name ?? raw.trim();
  }
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

/** ---------- blog posts ---------- */

function mapPost(doc: PostDoc) {
  return serialize(doc as unknown as Record<string, unknown>) as ReturnType<typeof serialize> & {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    body: string;
    coverImageUrl?: string;
    author: string;
    readingTime: string;
    status: PostDoc["status"];
    featured: boolean;
  };
}

/** All posts (admin), newest first. */
export async function listPosts() {
  const posts = await postsCollection();
  const docs = await posts.find({}).sort({ createdAt: -1 }).toArray();
  return docs.map(mapPost);
}

/** Published posts for the public blog, featured first then newest published. */
export async function listPublishedPosts() {
  try {
    const posts = await postsCollection();
    const docs = await posts
      .find({ status: "published" })
      .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
      .toArray();
    return docs.map(mapPost);
  } catch (e) {
    console.error("[db] listPublishedPosts failed:", e);
    return [];
  }
}

/** A single published post by slug (public). */
export async function getPublishedPostBySlug(slug: string) {
  const posts = await postsCollection();
  const doc = await posts.findOne({ slug, status: "published" });
  return doc ? mapPost(doc) : null;
}

/** A single post by slug regardless of status (admin edit). */
export async function getPostForAdmin(slug: string) {
  const posts = await postsCollection();
  const doc = await posts.findOne({ slug });
  return doc ? mapPost(doc) : null;
}

export async function createPost(data: {
  title: string;
  excerpt: string;
  category: string;
  body: string;
  coverImageUrl?: string;
  author: string;
  status: PostDoc["status"];
  featured: boolean;
  authorUserId: string | null;
}) {
  await ensureIndexes();
  const posts = await postsCollection();
  const base = slugify(data.title) || "post";
  let slug = base;
  let n = 1;
  while (await posts.findOne({ slug })) slug = `${base}-${n++}`;

  const now = new Date();
  const doc: PostDoc = {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    body: data.body,
    coverImageUrl: data.coverImageUrl || undefined,
    author: data.author,
    readingTime: readingTime(data.body),
    status: data.status,
    featured: data.featured,
    authorUserId: data.authorUserId,
    publishedAt: data.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
  const res = await posts.insertOne(doc);
  return mapPost({ ...doc, _id: res.insertedId });
}

export async function updatePost(
  slug: string,
  data: {
    title: string;
    excerpt: string;
    category: string;
    body: string;
    coverImageUrl?: string;
    author: string;
    status: PostDoc["status"];
    featured: boolean;
  }
) {
  const posts = await postsCollection();
  const existing = await posts.findOne({ slug });
  if (!existing) return false;

  const set: Partial<PostDoc> = {
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    body: data.body,
    coverImageUrl: data.coverImageUrl || undefined,
    author: data.author,
    readingTime: readingTime(data.body),
    status: data.status,
    featured: data.featured,
    updatedAt: new Date(),
  };
  // Stamp publishedAt the first time a post goes public.
  if (data.status === "published" && !existing.publishedAt) set.publishedAt = new Date();

  const res = await posts.updateOne({ slug }, { $set: set });
  return res.matchedCount > 0;
}

export async function deletePost(slug: string) {
  const posts = await postsCollection();
  const res = await posts.deleteOne({ slug });
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
