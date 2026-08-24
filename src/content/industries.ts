export type Industry = {
  slug: string;
  name: string;
  short: string;
  headline: string;
  description: string;
  icon: string; // lucide icon name key (mapped in components)
  roles: string[];
  stats: { label: string; value: string }[];
  accent: string; // tailwind gradient classes
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    short: "Nurses, allied health, and clinical support across the U.S.",
    headline: "Healthcare & Travel Nurse Staffing",
    description:
      "From registered nurses and allied health professionals to per-diem and travel assignments, we place compassionate, credentialed talent where care is needed most — with competitive pay, full compliance support, and dedicated recruiters who know the sector.",
    icon: "heart-pulse",
    roles: ["Registered Nurse (RN)", "Licensed Practical Nurse (LPN)", "Certified Nursing Assistant", "Medical Technologist", "Physical Therapist", "Travel Nurse"],
    stats: [
      { label: "Facilities served", value: "120+" },
      { label: "Avg. time-to-offer", value: "9 days" },
      { label: "Compliance pass rate", value: "99%" },
    ],
    accent: "from-rose-500/20 to-brand-500/10",
  },
  {
    slug: "construction",
    name: "Construction",
    short: "Skilled trades, supervisors, and site management.",
    headline: "Construction Staffing & Skilled Trades Jobs",
    description:
      "We connect general laborers, skilled tradespeople, foremen, and project managers with commercial and residential builders — matching the right hands to the right sites, safely and on schedule.",
    icon: "hard-hat",
    roles: ["Site Supervisor", "Project Manager", "Carpenter", "Welder", "Heavy Equipment Operator", "General Laborer"],
    stats: [
      { label: "Active job sites", value: "60+" },
      { label: "Safety-certified", value: "100%" },
      { label: "Repeat clients", value: "85%" },
    ],
    accent: "from-amber-500/20 to-brand-500/10",
  },
  {
    slug: "electrical",
    name: "Electrical",
    short: "Licensed electricians, technicians, and field engineers.",
    headline: "Electrical Staffing — Electricians & Technicians",
    description:
      "Journeyman and master electricians, industrial technicians, and field engineers — placed on commercial, industrial, and infrastructure projects with employers who value certified, safety-first talent.",
    icon: "zap",
    roles: ["Journeyman Electrician", "Master Electrician", "Industrial Electrician", "Controls Technician", "Field Engineer", "Apprentice"],
    stats: [
      { label: "Licensed pros", value: "800+" },
      { label: "Project types", value: "12" },
      { label: "On-time fill rate", value: "96%" },
    ],
    accent: "from-yellow-400/20 to-brand-500/10",
  },
  {
    slug: "tax-legal",
    name: "Tax & Legal",
    short: "Accounting, tax, compliance, and counsel professionals.",
    headline: "Tax, Accounting & Legal Staffing",
    description:
      "Accountants, tax specialists, paralegals, and corporate counsel — matched with firms and in-house teams that need precision, discretion, and deep domain expertise, seasonally or full-time.",
    icon: "scale",
    roles: ["Tax Accountant", "CPA", "Paralegal", "Compliance Analyst", "Corporate Counsel", "Bookkeeper"],
    stats: [
      { label: "Firms partnered", value: "40+" },
      { label: "Seasonal placements", value: "300+" },
      { label: "Retention @ 1yr", value: "92%" },
    ],
    accent: "from-emerald-500/20 to-brand-500/10",
  },
  {
    slug: "it",
    name: "Information Technology",
    short: "Software, data, cloud, and infrastructure talent.",
    headline: "IT & Technology Staffing",
    description:
      "Software engineers, data professionals, cloud and DevOps specialists, and IT support — placed with startups and enterprises alike through recruiters who speak the language of modern tech.",
    icon: "code",
    roles: ["Software Engineer", "Data Analyst", "Cloud/DevOps Engineer", "IT Support Specialist", "QA Engineer", "Product Manager"],
    stats: [
      { label: "Tech roles filled", value: "500+" },
      { label: "Remote-friendly", value: "70%" },
      { label: "Avg. offer uplift", value: "18%" },
    ],
    accent: "from-brand-400/25 to-brand-600/10",
  },
  {
    slug: "engineering",
    name: "Engineering",
    short: "Mechanical, civil, electrical, and process engineers.",
    headline: "Engineering Staffing & Technical Recruitment",
    description:
      "From design and project engineers to QA and process specialists, we place degreed and licensed engineers with manufacturers, EPC firms, and product teams — matching technical depth to the roles that demand it.",
    icon: "pencil-ruler",
    roles: ["Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Process Engineer", "Project Engineer", "QA/QC Engineer"],
    stats: [
      { label: "Engineers placed", value: "400+" },
      { label: "Disciplines covered", value: "8" },
      { label: "Client satisfaction", value: "97%" },
    ],
    accent: "from-sky-500/20 to-brand-500/10",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    short: "Production, assembly, quality, and plant operations.",
    headline: "Manufacturing & Production Staffing",
    description:
      "Machine operators, assemblers, quality inspectors, and plant supervisors — staffed for production lines and light-industrial sites with a focus on safety, uptime, and throughput.",
    icon: "factory",
    roles: ["Machine Operator", "Assembler", "Quality Inspector", "Production Supervisor", "Maintenance Technician", "Warehouse Associate"],
    stats: [
      { label: "Plants staffed", value: "45+" },
      { label: "Shifts covered", value: "24/7" },
      { label: "Fill rate", value: "95%" },
    ],
    accent: "from-orange-500/20 to-brand-500/10",
  },
  {
    slug: "finance",
    name: "Finance",
    short: "Financial analysts, controllers, and banking professionals.",
    headline: "Finance Staffing & Recruitment",
    description:
      "Financial analysts, controllers, FP&A leads, and banking professionals — matched with corporate finance teams, banks, and advisory firms that need sharp, numbers-fluent talent.",
    icon: "landmark",
    roles: ["Financial Analyst", "Controller", "FP&A Manager", "Credit Analyst", "Investment Analyst", "Finance Manager"],
    stats: [
      { label: "Finance roles filled", value: "250+" },
      { label: "Avg. offer uplift", value: "15%" },
      { label: "Retention @ 1yr", value: "93%" },
    ],
    accent: "from-teal-500/20 to-brand-500/10",
  },
  {
    slug: "administrative",
    name: "Administrative",
    short: "Office support, coordinators, and executive assistants.",
    headline: "Administrative & Office Support Staffing",
    description:
      "Executive assistants, office managers, coordinators, and front-desk professionals — placed with teams that run on organized, reliable administrative support.",
    icon: "clipboard-list",
    roles: ["Executive Assistant", "Office Manager", "Administrative Coordinator", "Data Entry Specialist", "Receptionist", "Office Clerk"],
    stats: [
      { label: "Roles filled", value: "300+" },
      { label: "Temp-to-hire", value: "60%" },
      { label: "Avg. time-to-start", value: "5 days" },
    ],
    accent: "from-violet-500/20 to-brand-500/10",
  },
  {
    slug: "marketing",
    name: "Marketing",
    short: "Digital, brand, content, and growth marketers.",
    headline: "Marketing & Creative Staffing",
    description:
      "Digital marketers, content strategists, brand managers, and growth specialists — matched with in-house teams and agencies building demand and telling their story.",
    icon: "megaphone",
    roles: ["Digital Marketing Manager", "Content Strategist", "Brand Manager", "SEO/SEM Specialist", "Social Media Manager", "Marketing Coordinator"],
    stats: [
      { label: "Marketers placed", value: "180+" },
      { label: "Agency & in-house", value: "50/50" },
      { label: "Remote-friendly", value: "65%" },
    ],
    accent: "from-pink-500/20 to-brand-500/10",
  },
  {
    slug: "distribution",
    name: "Distribution",
    short: "Logistics, warehousing, and supply-chain roles.",
    headline: "Distribution & Logistics Staffing",
    description:
      "Warehouse leads, forklift operators, dispatchers, and supply-chain coordinators — staffed for distribution centers and logistics operations that can't afford downtime.",
    icon: "truck",
    roles: ["Warehouse Lead", "Forklift Operator", "Dispatcher", "Logistics Coordinator", "Inventory Specialist", "Delivery Driver"],
    stats: [
      { label: "Centers served", value: "35+" },
      { label: "Peak-season cover", value: "100%" },
      { label: "Fill rate", value: "94%" },
    ],
    accent: "from-lime-500/20 to-brand-500/10",
  },
  {
    slug: "accounting",
    name: "Accounting",
    short: "Bookkeepers, staff accountants, and audit professionals.",
    headline: "Accounting Staffing & Recruitment",
    description:
      "Staff accountants, bookkeepers, AP/AR specialists, and audit professionals — placed with firms and finance teams through close, tax season, and year-round.",
    icon: "calculator",
    roles: ["Staff Accountant", "Bookkeeper", "Accounts Payable Specialist", "Accounts Receivable Specialist", "Payroll Specialist", "Audit Associate"],
    stats: [
      { label: "Accountants placed", value: "220+" },
      { label: "Seasonal & permanent", value: "Both" },
      { label: "Retention @ 1yr", value: "91%" },
    ],
    accent: "from-emerald-500/20 to-brand-500/10",
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);

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
