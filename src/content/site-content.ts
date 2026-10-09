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

// Answers are deliberately full-length and self-contained: they are the site's primary
// citation surface for answer engines, and thin one-line answers give a model nothing to
// quote. Every claim here already appears elsewhere on the site — no new or invented figures.
export const faqs = [
  {
    q: "Is it free for job seekers to use Exzelon?",
    a: "Yes — every part of the service is free for candidates. Searching roles, creating a profile, uploading a resume, speaking to a recruiter, and applying through Exzelon costs you nothing, and we never charge a placement fee to the people we place. We are paid by the employers who hire through us, which is how staffing agencies have always worked. That also shapes how we operate: because our fee depends on a placement lasting, it is in our interest to match you to a role that genuinely fits — the right shift, the right setting, and pay that reflects your experience — rather than to push you toward the first opening that appears. If you are comparing agencies, treat a request for payment from a candidate as a red flag.",
  },
  {
    q: "Which industries do you recruit for?",
    a: `We recruit across ${industryCountWord} specialist sectors: Healthcare, Construction, Electrical, Engineering, Manufacturing, Information Technology, Finance, Accounting, Tax & Legal, Administrative, Marketing, and Distribution. Each one has dedicated recruiters rather than generalists, because the credentials, licensing, and hiring norms differ enormously between them — a travel nurse, a journeyman electrician, and a staff accountant are screened against completely different standards. In practice that means the person you speak to already knows which certifications matter in your field, which employers are hiring, and what the role you are applying for typically pays. If your background sits between two of these — controls engineering, clinical administration, or logistics finance, for example — say so when you get in touch and we will point you to the recruiters who see that kind of role most often.`,
  },
  {
    q: "How quickly can I be placed?",
    a: "Our average time-to-offer is around nine days, and travel or contract roles often move faster because we work from pools of candidates who are already vetted and ready to start. The honest caveat is that timelines vary by role: senior and specialist positions, or any role carrying licensing and credentialing requirements, take longer than the average because verification has to run its course. What compresses the timeline most is your own readiness. A complete profile, an up-to-date resume, references you have already alerted, and current licences or certifications mean we can put you in front of an employer the moment the right role appears instead of chasing documents afterwards. Tell your recruiter your earliest realistic start date and any notice period — that single detail prevents most last-minute surprises at offer stage.",
  },
  {
    q: "Do you offer travel and contract assignments?",
    a: "Yes. Alongside permanent, direct-hire placements we place people into contract, temp-to-hire, part-time, and travel assignments. Travel roles are most common in healthcare, where assignments are typically fixed-term and location-variable, and we support travellers with the logistics that make those contracts workable — housing coordination and the licensing and credentialing steps that have to be completed before a first shift. Contract and temp-to-hire engagements suit people who want to test a setting before committing, or who prefer to move between projects rather than settle into one employer. For employers, they are a way to cover a peak or a hard-to-fill gap without a permanent commitment. If you are open to more than one arrangement, tell your recruiter which you would consider and in what order — it widens the range of roles we can bring to you.",
  },
  {
    q: "How do you handle licensing and compliance?",
    a: "Compliance is handled before you reach an interview, so nothing stalls at the offer. It starts with primary-source verification of your professional licence and any certifications your field requires, followed by background and reference checks in line with the employer's requirements and the standards of the sector. For anyone working in the United States we complete I-9 and right-to-work verification. In construction and electrical roles we also track OSHA and site-safety certifications, since those are checked at the gate on most job sites. Everything is kept current and audit-ready, which matters in healthcare and other regulated settings where an expired credential can stop a placement outright. Our compliance team manages the paperwork so that you are cleared to start on day one rather than chasing documents through your first week.",
  },
  {
    q: "I'm an employer — how do I start hiring with Exzelon?",
    a: "Start by telling us what you are hiring for. The fastest route is the request form on our For Clients page, which asks for the roles, quantity, location, timeline, and any must-have credentials; you can also call or email us directly. A sector-specialist recruiter — not a generalist — then arranges a short intake call to understand the role, the team, and what a strong candidate looks like in your context. From there we work from pre-vetted talent pools and active networks, screen for skills, credentials, and fit, and send you a shortlist of people who are genuinely qualified rather than a stack of resumes. We manage the offer, onboarding, and compliance paperwork through to day one. Because we are paid on successful placement, the intake call costs you nothing and commits you to nothing.",
  },
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
