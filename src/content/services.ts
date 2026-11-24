/** Employer services — copy recovered verbatim from the original /for-clients page. */

import { industryCountWord } from "@/content/industries";
import { jobsEnabled } from "@/lib/site";

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  points: string[];
};

export const services: Service[] = [
  {
    slug: "recruitment",
    title: "Recruitment",
    description:
      "We have a team of experienced recruiters who are experts in their fields. We can help you find the right talent quickly and efficiently.",
    icon: "users-round",
    points: ["Sector-specialist recruiters", "Pre-vetted talent pool", "Fast, efficient matching"],
  },
  {
    slug: "staffing",
    title: "Staffing",
    description:
      "We offer a variety of staffing options to help you meet your short-term and long-term workforce requirements with ease.",
    icon: "briefcase",
    points: ["Temp & temp-to-hire", "Seasonal surge cover", "Long-term contracts"],
  },
  {
    slug: "travelers",
    title: "Travelers",
    description:
      "We have a network of professionals who are willing to travel for work, making it easy for you to find flexible staffing solutions.",
    icon: "plane",
    points: ["Nationwide mobility", "Housing & logistics support", "Flexible assignments"],
  },
  {
    slug: "direct-hire",
    title: "Direct Hire",
    description:
      "We can help you find qualified candidates for permanent positions. We work with you to understand your needs and then we search our database of candidates to find the best fit for your company.",
    icon: "user-check",
    points: ["Permanent placements", "Culture-fit screening", "Guarantee period"],
  },
  {
    slug: "onboarding",
    title: "Onboarding",
    description:
      "We can help you onboard new employees quickly and efficiently. We can provide training, orientation, and other resources to help your new employees get up to speed quickly.",
    icon: "clipboard-check",
    points: ["Structured orientation", "Training resources", "Day-one readiness"],
  },
  {
    slug: "administration",
    title: "Administration",
    description:
      "We can help you administer your employee benefits program. This can save you time and money, and it can help you ensure that your employees have access to the benefits they need.",
    icon: "settings-2",
    points: ["Benefits administration", "Payroll coordination", "Compliance handling"],
  },
];

/** The 4-step job seeker process (recovered: Search Job / CV-Resume / Create Account / Apply). */
export const steps = [
  {
    n: "01",
    // The public board is flag-gated (`jobsEnabled`). While it is off, `/jobs` 307s to
    // /contact and there is no search or filter UI, so the old "Browse thousands of live
    // openings … filter by role, location, and type" line promised a product the home page
    // could not deliver — on the site's most-crawled page, and in a sentence a crawler reads
    // as page content. Describe the real first step in each state instead.
    title: jobsEnabled ? "Search Jobs" : "Tell Us What You Want",
    description: jobsEnabled
      ? `Browse open roles across ${industryCountWord} industries and filter by role, location, and type.`
      : `Tell a recruiter the role, shift and location you want. We work from live openings across ${industryCountWord} industries and bring you the ones that fit.`,
    icon: "search",
  },
  {
    n: "02",
    title: "Upload CV / Resume",
    description: "Add your resume once and let our recruiters match you to roles that fit your skills and goals.",
    icon: "file-text",
  },
  {
    n: "03",
    title: "Create Account",
    description: "Set up your profile to track applications, save jobs, and get personalized recommendations.",
    icon: "user-plus",
  },
  {
    n: "04",
    title: "Apply",
    description: "Apply in one click and get support from a dedicated recruiter through to your offer.",
    icon: "send",
  },
];
