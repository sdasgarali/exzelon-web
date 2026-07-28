import { z } from "zod";

/** Shared between client forms and API route handlers. */

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(2, "Please add a subject").max(120),
  message: z.string().min(10, "Tell us a little more (10+ characters)").max(2000),
  interest: z.enum(["job-seeker", "employer", "general"]),
  // honeypot — must stay empty
  company_website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Applying now uses the authenticated seeker's profile for identity + resume, so
// the form itself only carries the job + an optional cover note (+ honeypot).
export const applySchema = z.object({
  jobId: z.string().min(1),
  jobTitle: z.string().min(1),
  coverLetter: z.string().max(2500).optional().or(z.literal("")),
  // honeypot
  company_website: z.string().max(0).optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;

/** ---------- Seeker profile ---------- */

const urlOrEmpty = z.string().url("Enter a valid URL").optional().or(z.literal(""));

export const experienceSchema = z.object({
  title: z.string().min(1, "Role title is required").max(120),
  company: z.string().min(1, "Company is required").max(120),
  start: z.string().max(40).optional().or(z.literal("")),
  end: z.string().max(40).optional().or(z.literal("")),
  current: z.boolean().optional(),
  summary: z.string().max(1000).optional().or(z.literal("")),
});

export const educationSchema = z.object({
  school: z.string().min(1, "School/institution is required").max(120),
  qualification: z.string().min(1, "Qualification is required").max(120),
  field: z.string().max(120).optional().or(z.literal("")),
  start: z.string().max(40).optional().or(z.literal("")),
  end: z.string().max(40).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  resumeUrl: urlOrEmpty,
  linkedin: urlOrEmpty,
  otherLink: urlOrEmpty,
  phone: z.string().max(30).optional().or(z.literal("")),
  experienceLevel: z.enum(["fresher", "experienced"]).optional(),
  experiences: z.array(experienceSchema).max(20).optional(),
  education: z.array(educationSchema).max(20).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;

/** ---------- Auth ---------- */

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Shared strong-password rule: 8+ chars with at least one letter and one number. */
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: passwordField,
  role: z.enum(["employer", "seeker"]), // admins are created via seed, not public signup
  company: z.string().max(120).optional().or(z.literal("")),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Invalid reset link"),
  password: passwordField,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** 6-digit email-verification code (typed by the signed-in user on /verify-email). */
export const verifyOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/** Cookie-consent decision from the banner (name/email optional, only on accept). */
export const consentSchema = z.object({
  sessionId: z.string().min(1).max(120),
  source: z.string().max(60).optional(),
  status: z.enum(["accepted", "declined"]),
  name: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").max(160).optional().or(z.literal("")),
});
export type ConsentInput = z.infer<typeof consentSchema>;

/** ---------- Messaging ---------- */

export const messageSchema = z.object({
  body: z.string().min(1, "Write a message").max(2000, "Message is too long"),
});
export type MessageInput = z.infer<typeof messageSchema>;

/** ---------- Employer company profile ---------- */

export const companySchema = z.object({
  company: z.string().min(2, "Company name is required").max(120),
  tagline: z.string().max(140).optional().or(z.literal("")),
  about: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  size: z.string().max(40).optional().or(z.literal("")),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
export type CompanyInput = z.infer<typeof companySchema>;

/** ---------- Job create/edit (employer + admin) ---------- */

export const jobSchema = z.object({
  title: z.string().min(3, "Title is required").max(120),
  industry: z.enum(["healthcare", "construction", "electrical", "tax-legal", "it"]),
  location: z.string().min(2, "Location is required").max(120),
  type: z.enum(["Full-time", "Contract", "Travel", "Part-time", "Temp-to-hire"]),
  remote: z.enum(["On-site", "Hybrid", "Remote"]),
  salary: z.string().min(1, "Salary is required").max(60),
  summary: z.string().min(20, "Add a longer summary (20+ chars)").max(600),
  responsibilities: z.string().min(3, "Add at least one responsibility"), // newline-separated in the form
  requirements: z.string().min(3, "Add at least one requirement"),
  featured: z.boolean().optional(),
  status: z.enum(["open", "closed"]).optional(),
  // yyyy-mm-dd from a <input type="date">, or empty for no expiry.
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
    .optional()
    .or(z.literal("")),
});
export type JobInput = z.infer<typeof jobSchema>;

/** Parse a yyyy-mm-dd form value into an end-of-day Date, or null when empty. */
export function parseExpiryDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T23:59:59`);
  return Number.isNaN(d.getTime()) ? null : d;
}
