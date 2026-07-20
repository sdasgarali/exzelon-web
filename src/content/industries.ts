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
    headline: "Elevate Your Healthcare Career with Exzelon Solutions",
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
    headline: "Build Your Future in Construction",
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
    headline: "Power Your Career in the Electrical Trade",
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
    headline: "Advance Your Tax & Legal Career",
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
    headline: "Level Up Your Tech Career",
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
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
