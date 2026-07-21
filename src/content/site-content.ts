/** Misc marketing content: stats, values, testimonials, FAQs, employer logos, blog. */

export const heroStats = [
  { value: 25000, suffix: "+", label: "Opportunities live" },
  { value: 1200, suffix: "+", label: "Employers hiring" },
  { value: 98, suffix: "%", label: "Candidate satisfaction" },
  { value: 5, suffix: "", label: "Industries served" },
];

export const employerLogos = [
  "Google", "Microsoft", "Amazon", "Northwestern Medicine", "AbbVie",
  "Turner Construction", "Deloitte", "Accenture", "Rush Health", "Motorola",
];

export const values = [
  { title: "People First", description: "Every placement is a person's livelihood. We treat candidates and clients with the care that decision deserves.", icon: "heart" },
  { title: "Integrity", description: "We say what we mean, honor our commitments, and stay transparent about pay, roles, and expectations.", icon: "shield-check" },
  { title: "Speed with Substance", description: "We move fast — but never at the cost of the right fit, full compliance, or quality of hire.", icon: "gauge" },
  { title: "Specialization", description: "Sector-specialist recruiters who understand the credentials, culture, and cadence of each industry.", icon: "target" },
  { title: "Partnership", description: "We build long-term relationships, not transactions — 85% of our clients hire with us again.", icon: "handshake" },
  { title: "Compliance", description: "Credentialing, licensing, and standards are non-negotiable. We get it right, every time.", icon: "badge-check" },
];

export const testimonials = [
  { quote: "Exzelon found me an ICU role in under two weeks — and their recruiter handled every credential along the way. I've never felt so supported in a job search.", name: "Jordan T.", role: "ICU Nurse, Chicago", rating: 5 },
  { quote: "We needed 15 electricians for a tight infrastructure deadline. Exzelon filled every seat with licensed pros, on time. They're our first call now.", name: "Karen S.", role: "Project Director, Infrastructure", rating: 5 },
  { quote: "The team understood our tech stack and only sent engineers who could actually do the work. That saved us weeks of screening.", name: "Wei L.", role: "Engineering Manager, SaaS", rating: 5 },
  { quote: "As a traveler, logistics can be a nightmare. Exzelon handled housing and licensing so I could focus on patient care.", name: "Maria G.", role: "Travel Nurse", rating: 5 },
];

export const faqs = [
  { q: "Is it free for job seekers to use Exzelon?", a: "Yes. Searching jobs, creating a profile, uploading your resume, and applying through Exzelon is always free for candidates. Our employer partners fund our services." },
  { q: "Which industries do you recruit for?", a: "We specialize in five sectors: Healthcare, Construction, Electrical, Tax & Legal, and Information Technology — with dedicated recruiters in each." },
  { q: "How quickly can I be placed?", a: "It depends on the role and your credentials, but our average time-to-offer is around 9 days in healthcare and comparable across other sectors. Travel and contract roles can move even faster." },
  { q: "Do you offer travel and contract assignments?", a: "Absolutely. We offer full-time, contract, temp-to-hire, part-time, and travel assignments — including housing and logistics support for travelers." },
  { q: "How do you handle licensing and compliance?", a: "Our compliance team manages credentialing, license verification, background checks, and industry-specific standards so you're fully cleared before day one." },
  { q: "I'm an employer — how do I start hiring with Exzelon?", a: "Head to our For Clients page or contact us directly. We'll learn your needs and start matching qualified, pre-vetted candidates right away." },
];

export const blogPosts = [
  {
    slug: "elevate-your-healthcare-career",
    title: "Elevate Your Healthcare Career with Exzelon Solutions",
    excerpt: "From travel nursing to permanent clinical roles, here's how to level up your healthcare career in 2026 — and how the right staffing partner accelerates it.",
    category: "Healthcare",
    date: "2026-06-18",
    readingTime: "6 min read",
    author: "Priya Menon",
  },
  {
    slug: "working-in-the-usa-guide",
    title: "Working in the USA: A Practical Guide for Skilled Professionals",
    excerpt: "Licensing, credentials, and culture — everything skilled professionals should know before starting a career in the United States.",
    category: "Career",
    date: "2026-05-30",
    readingTime: "8 min read",
    author: "Daniel Okafor",
  },
  {
    slug: "5-steps-to-a-standout-resume",
    title: "5 Steps to a Standout Resume That Gets Interviews",
    excerpt: "Recruiters spend seconds on each resume. Make yours count with these five field-tested tips from our recruiting team.",
    category: "Career",
    date: "2026-05-12",
    readingTime: "5 min read",
    author: "Aisha Rahman",
  },
  {
    slug: "how-employers-win-the-talent-race",
    title: "How Employers Win the Talent Race in a Tight Market",
    excerpt: "Speed, transparency, and a great candidate experience — the three levers that help employers land top talent first.",
    category: "Hiring",
    date: "2026-04-28",
    readingTime: "7 min read",
    author: "Marcus Bell",
  },
];

export const getPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

export const complianceItems = [
  { title: "License Verification", description: "Primary-source verification of every professional license and certification before placement." },
  { title: "Background Screening", description: "Comprehensive background and reference checks in line with industry and client requirements." },
  { title: "Credentialing", description: "Full credentialing workflows for healthcare and regulated roles, kept current and audit-ready." },
  { title: "Right-to-Work", description: "I-9 and work-authorization verification for every candidate we place." },
  { title: "Safety & OSHA", description: "OSHA compliance and safety certification tracking for construction and electrical roles." },
  { title: "Data Protection", description: "Candidate and client data handled under strict privacy and confidentiality standards." },
];
