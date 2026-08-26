/** Misc marketing content: values, testimonials, FAQs, employer logos, blog. */

import { industryCountWord } from "@/content/industries";

export const employerLogos = [
  "Google", "Microsoft", "Amazon", "Northwestern Medicine", "AbbVie",
  "Turner Construction", "Deloitte", "Accenture", "Rush Health", "Motorola",
];

/** Home page proof strip. Numeric `value` drives the count-up; `suffix` is appended. */
export const homeStats = [
  { value: 98, suffix: "%", label: "Retention rate" },
  { value: 500, suffix: "+", label: "Placements" },
  { value: 48, suffix: "h", label: "Avg. time to shortlist" },
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
  { q: "Which industries do you recruit for?", a: `We specialize in ${industryCountWord} sectors — including Healthcare, Construction, Electrical, Engineering, Manufacturing, Information Technology, Finance, Accounting, Tax & Legal, Administrative, Marketing, and Distribution — with dedicated recruiters in each.` },
  { q: "How quickly can I be placed?", a: "It depends on the role and your credentials, but our average time-to-offer is around 9 days in healthcare and comparable across other sectors. Travel and contract roles can move even faster." },
  { q: "Do you offer travel and contract assignments?", a: "Absolutely. We offer full-time, contract, temp-to-hire, part-time, and travel assignments — including housing and logistics support for travelers." },
  { q: "How do you handle licensing and compliance?", a: "Our compliance team manages credentialing, license verification, background checks, and industry-specific standards so you're fully cleared before day one." },
  { q: "I'm an employer — how do I start hiring with Exzelon?", a: "Head to our For Clients page or contact us directly. We'll learn your needs and start matching qualified, pre-vetted candidates right away." },
];

// Blog posts moved to MongoDB (collection `posts`) — managed at /admin/posts.
// Initial content lives in src/content/blog-seed.ts and is loaded by `npm run db:seed`.

export const complianceItems = [
  { title: "License Verification", description: "Primary-source verification of every professional license and certification before placement." },
  { title: "Background Screening", description: "Comprehensive background and reference checks in line with industry and client requirements." },
  { title: "Credentialing", description: "Full credentialing workflows for healthcare and regulated roles, kept current and audit-ready." },
  { title: "Right-to-Work", description: "I-9 and work-authorization verification for every candidate we place." },
  { title: "Safety & OSHA", description: "OSHA compliance and safety certification tracking for construction and electrical roles." },
  { title: "Data Protection", description: "Candidate and client data handled under strict privacy and confidentiality standards." },
];
