export type Industry = {
  slug: string;
  name: string;
  short: string;
  /** SERP title, used verbatim (the layout template appends the brand) — tuned for the
   *  "<industry> staffing in Chicago" queries while keeping the full title inside 60 chars. */
  metaTitle: string;
  headline: string;
  description: string;
  icon: string; // lucide icon name key (mapped in components)
  roles: string[];
  accent: string; // tailwind gradient classes
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    short: "Nurses, allied health, and clinical support across the U.S.",
    metaTitle: "Healthcare Staffing in Chicago",
    headline: "Healthcare & Travel Nurse Staffing",
    description:
      "From registered nurses and allied health professionals to per-diem and travel assignments, we place compassionate, credentialed talent where care is needed most — with competitive pay, full compliance support, and dedicated recruiters who know the sector.",
    icon: "heart-pulse",
    roles: ["Registered Nurse (RN)", "Licensed Practical Nurse (LPN)", "Certified Nursing Assistant", "Medical Technologist", "Physical Therapist", "Travel Nurse"],
    accent: "from-rose-500/20 to-brand-500/10",
  },
  {
    slug: "construction",
    name: "Construction",
    short: "Skilled trades, supervisors, and site management.",
    metaTitle: "Construction Staffing in Chicago",
    headline: "Construction Staffing & Skilled Trades Jobs",
    description:
      "We connect general laborers, skilled tradespeople, foremen, and project managers with commercial and residential builders — matching the right hands to the right sites, safely and on schedule.",
    icon: "hard-hat",
    roles: ["Site Supervisor", "Project Manager", "Carpenter", "Welder", "Heavy Equipment Operator", "General Laborer"],
    accent: "from-amber-500/20 to-brand-500/10",
  },
  {
    slug: "electrical",
    name: "Electrical",
    short: "Licensed electricians, technicians, and field engineers.",
    metaTitle: "Electrical Staffing in Chicago",
    headline: "Electrical Staffing — Electricians & Technicians",
    description:
      "Journeyman and master electricians, industrial technicians, and field engineers — placed on commercial, industrial, and infrastructure projects with employers who value certified, safety-first talent.",
    icon: "zap",
    roles: ["Journeyman Electrician", "Master Electrician", "Industrial Electrician", "Controls Technician", "Field Engineer", "Apprentice"],
    accent: "from-yellow-400/20 to-brand-500/10",
  },
  {
    slug: "tax-legal",
    name: "Tax & Legal",
    short: "Accounting, tax, compliance, and counsel professionals.",
    metaTitle: "Tax & Legal Staffing in Chicago",
    headline: "Tax, Accounting & Legal Staffing",
    description:
      "Accountants, tax specialists, paralegals, and corporate counsel — matched with firms and in-house teams that need precision, discretion, and deep domain expertise, seasonally or full-time.",
    icon: "scale",
    roles: ["Tax Accountant", "CPA", "Paralegal", "Compliance Analyst", "Corporate Counsel", "Bookkeeper"],
    accent: "from-emerald-500/20 to-brand-500/10",
  },
  {
    slug: "it",
    name: "Information Technology",
    short: "Software, data, cloud, and infrastructure talent.",
    metaTitle: "IT Staffing in Chicago",
    headline: "IT & Technology Staffing",
    description:
      "Software engineers, data professionals, cloud and DevOps specialists, and IT support — placed with startups and enterprises alike through recruiters who speak the language of modern tech.",
    icon: "code",
    roles: ["Software Engineer", "Data Analyst", "Cloud/DevOps Engineer", "IT Support Specialist", "QA Engineer", "Product Manager"],
    accent: "from-brand-400/25 to-brand-600/10",
  },
  {
    slug: "engineering",
    name: "Engineering",
    short: "Mechanical, civil, electrical, and process engineers.",
    metaTitle: "Engineering Staffing in Chicago",
    headline: "Engineering Staffing & Technical Recruitment",
    description:
      "From design and project engineers to QA and process specialists, we place degreed and licensed engineers with manufacturers, EPC firms, and product teams — matching technical depth to the roles that demand it.",
    icon: "pencil-ruler",
    roles: ["Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Process Engineer", "Project Engineer", "QA/QC Engineer"],
    accent: "from-sky-500/20 to-brand-500/10",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    short: "Production, assembly, quality, and plant operations.",
    metaTitle: "Manufacturing Staffing in Chicago",
    headline: "Manufacturing & Production Staffing",
    description:
      "Machine operators, assemblers, quality inspectors, and plant supervisors — staffed for production lines and light-industrial sites with a focus on safety, uptime, and throughput.",
    icon: "factory",
    roles: ["Machine Operator", "Assembler", "Quality Inspector", "Production Supervisor", "Maintenance Technician", "Warehouse Associate"],
    accent: "from-orange-500/20 to-brand-500/10",
  },
  {
    slug: "finance",
    name: "Finance",
    short: "Financial analysts, controllers, and banking professionals.",
    metaTitle: "Finance Staffing in Chicago",
    headline: "Finance Staffing & Recruitment",
    description:
      "Financial analysts, controllers, FP&A leads, and banking professionals — matched with corporate finance teams, banks, and advisory firms that need sharp, numbers-fluent talent.",
    icon: "landmark",
    roles: ["Financial Analyst", "Controller", "FP&A Manager", "Credit Analyst", "Investment Analyst", "Finance Manager"],
    accent: "from-teal-500/20 to-brand-500/10",
  },
  {
    slug: "administrative",
    name: "Administrative",
    short: "Office support, coordinators, and executive assistants.",
    metaTitle: "Administrative Staffing in Chicago",
    headline: "Administrative & Office Support Staffing",
    description:
      "Executive assistants, office managers, coordinators, and front-desk professionals — placed with teams that run on organized, reliable administrative support.",
    icon: "clipboard-list",
    roles: ["Executive Assistant", "Office Manager", "Administrative Coordinator", "Data Entry Specialist", "Receptionist", "Office Clerk"],
    accent: "from-violet-500/20 to-brand-500/10",
  },
  {
    slug: "marketing",
    name: "Marketing",
    short: "Digital, brand, content, and growth marketers.",
    metaTitle: "Marketing Staffing in Chicago",
    headline: "Marketing & Creative Staffing",
    description:
      "Digital marketers, content strategists, brand managers, and growth specialists — matched with in-house teams and agencies building demand and telling their story.",
    icon: "megaphone",
    roles: ["Digital Marketing Manager", "Content Strategist", "Brand Manager", "SEO/SEM Specialist", "Social Media Manager", "Marketing Coordinator"],
    accent: "from-pink-500/20 to-brand-500/10",
  },
  {
    slug: "distribution",
    name: "Distribution",
    short: "Logistics, warehousing, and supply-chain roles.",
    metaTitle: "Distribution Staffing in Chicago",
    headline: "Distribution & Logistics Staffing",
    description:
      "Warehouse leads, forklift operators, dispatchers, and supply-chain coordinators — staffed for distribution centers and logistics operations that can't afford downtime.",
    icon: "truck",
    roles: ["Warehouse Lead", "Forklift Operator", "Dispatcher", "Logistics Coordinator", "Inventory Specialist", "Delivery Driver"],
    accent: "from-lime-500/20 to-brand-500/10",
  },
  {
    slug: "accounting",
    name: "Accounting",
    short: "Bookkeepers, staff accountants, and audit professionals.",
    metaTitle: "Accounting Staffing in Chicago",
    headline: "Accounting Staffing & Recruitment",
    description:
      "Staff accountants, bookkeepers, AP/AR specialists, and audit professionals — placed with firms and finance teams through close, tax season, and year-round.",
    icon: "calculator",
    roles: ["Staff Accountant", "Bookkeeper", "Accounts Payable Specialist", "Accounts Receivable Specialist", "Payroll Specialist", "Audit Associate"],
    accent: "from-emerald-500/20 to-brand-500/10",
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);

/**
 * The three facts shown on an industry card (home spotlight + `/opportunities/<slug>`).
 *
 * Deliberately limited to claims the site can stand behind: the number of role families the
 * page itself lists, the credential-check policy stated on `/resources/compliance`, and the
 * coverage in `site`. The cards previously carried volume and satisfaction figures — "800+
 * licensed pros", "97% client satisfaction", "Retention @ 1yr 92%" — that no page, case study,
 * or internal source documents. Unsupported performance numbers are an advertising-claim and
 * E-E-A-T risk, and the same class of claim was removed from `/about` in the August audit.
 */
export function industryFacts(industry: Industry): { label: string; value: string }[] {
  return [
    { label: "Role families", value: String(industry.roles.length) },
    { label: "Credential checks", value: "Every hire" },
    { label: "Coverage", value: "US-wide" },
  ];
}

/** Number of sectors Exzelon staffs — derived so copy never hard-codes a stale count. */
export const industryCount = industries.length;

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen", "twenty",
];

/** Spelled-out `industryCount` for prose (e.g. "twelve industries"); falls back to digits. */
export const industryCountWord = NUMBER_WORDS[industryCount] ?? String(industryCount);

/** All sector names, in display order. */
export const industryNames = industries.map((i) => i.name);

/**
 * Short, SEO-friendly phrasing of the sectors. Curated (not the full list) so meta
 * descriptions and marketing copy stay within length limits and read naturally.
 */
export const industriesShort = "healthcare, IT, construction, engineering, finance, and more";
