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

export const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["employer", "seeker"]), // admins are created via seed, not public signup
  company: z.string().max(120).optional().or(z.literal("")),
});
export type RegisterInput = z.infer<typeof registerSchema>;

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
});
export type JobInput = z.infer<typeof jobSchema>;
