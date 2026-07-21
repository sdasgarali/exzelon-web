/**
 * Shared (client + server) seeker-profile helpers. NOT server-only — imported by
 * both the API routes and the client apply panel / profile form.
 */

export type ExperienceEntry = {
  title: string;
  company: string;
  start?: string;
  end?: string;
  current?: boolean;
  summary?: string;
};

export type EducationEntry = {
  school: string;
  qualification: string;
  field?: string;
  start?: string;
  end?: string;
};

export type SeekerProfile = {
  resumeUrl?: string;
  linkedin?: string;
  otherLink?: string;
  phone?: string;
  experienceLevel?: "fresher" | "experienced";
  experiences?: ExperienceEntry[];
  education?: EducationEntry[];
  updatedAt?: string | Date;
};

/** The only fields that gate applying: name, email, and a resume link. */
export function profileMissingFields(input: {
  name?: string | null;
  email?: string | null;
  profile?: SeekerProfile | null;
}): string[] {
  const missing: string[] = [];
  if (!input.name?.trim()) missing.push("name");
  if (!input.email?.trim()) missing.push("email");
  if (!input.profile?.resumeUrl?.trim()) missing.push("resume link");
  return missing;
}

export function isProfileComplete(input: {
  name?: string | null;
  email?: string | null;
  profile?: SeekerProfile | null;
}): boolean {
  return profileMissingFields(input).length === 0;
}
