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
  /** GridFS id of an uploaded resume file (alternative to resumeUrl). */
  resumeFileId?: string;
  resumeFileName?: string;
  linkedin?: string;
  otherLink?: string;
  phone?: string;
  experienceLevel?: "fresher" | "experienced";
  experiences?: ExperienceEntry[];
  education?: EducationEntry[];
  updatedAt?: string | Date;
};

/** True when the profile has a resume — either an uploaded file or a link. */
export function hasResume(profile?: SeekerProfile | null): boolean {
  return !!(profile?.resumeFileId || profile?.resumeUrl?.trim());
}

/** The only fields that gate applying: name, email, and a resume (file or link). */
export function profileMissingFields(input: {
  name?: string | null;
  email?: string | null;
  profile?: SeekerProfile | null;
}): string[] {
  const missing: string[] = [];
  if (!input.name?.trim()) missing.push("name");
  if (!input.email?.trim()) missing.push("email");
  if (!hasResume(input.profile)) missing.push("resume (upload or link)");
  return missing;
}

export function isProfileComplete(input: {
  name?: string | null;
  email?: string | null;
  profile?: SeekerProfile | null;
}): boolean {
  return profileMissingFields(input).length === 0;
}
