/**
 * Shared (client + server) employer company-profile type + helpers.
 * The company *name* lives on UserDoc.company; richer branding lives here.
 */

export type CompanyProfile = {
  tagline?: string;
  about?: string;
  website?: string;
  location?: string;
  size?: string;
  logoUrl?: string;
  updatedAt?: string | Date;
};

export const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1000+",
] as const;
