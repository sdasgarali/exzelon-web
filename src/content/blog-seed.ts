/**
 * Initial blog posts migrated into the DB by `npm run db:seed`.
 * Pure data (no server-only imports) so the seed script can read it directly.
 * After seeding, posts are managed from the admin dashboard (/admin/posts).
 */
export type BlogSeed = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // yyyy-mm-dd, used for publishedAt
  body: string; // markdown-lite (see src/lib/markdown.tsx)
};

export const blogSeed: BlogSeed[] = [
  {
    slug: "elevate-your-healthcare-career",
    title: "Elevate Your Healthcare Career with Exzelon Solutions",
    excerpt:
      "From travel nursing to permanent clinical roles, here's how to level up your healthcare career in 2026 — and how the right staffing partner accelerates it.",
    category: "Healthcare",
    author: "Priya Menon",
    date: "2026-06-18",
    body: `Healthcare careers move fast, and the professionals who thrive are the ones who prepare deliberately. Whether you're an ICU nurse eyeing a travel contract or a lab technologist ready for a permanent role, a clear plan and the right partner make all the difference.

## Know what you want before you search

The strongest candidates lead with clarity. Decide on the setting, shift pattern, and pay range that fit your life, then hold to them. A specialist recruiter can only advocate for you when they understand your non-negotiables.

- **Setting** — acute care, ambulatory, travel, or telehealth
- **Schedule** — day, night, rotating, or per-diem flexibility
- **Growth** — the certifications and specialties you want next

## Keep your credentials current

Nothing slows a placement like an expired license or a missing certification. Keep everything verifiable and in one place so you can move the moment the right role appears.

> Pro tip: Candidates with a complete, up-to-date profile reach offer stage dramatically faster than those who scramble for documents after an interview.

## Partner with a specialist

A recruiter who lives in healthcare knows which employers value your background and can position you accordingly. That sector expertise — combined with a relentless focus on compliance — is exactly what turns a stressful search into a confident next step.

Ready to move forward? Browse our live [healthcare opportunities](/opportunities/healthcare) or reach out to a recruiter who specializes in your field.`,
  },
  {
    slug: "working-in-the-usa-guide",
    title: "Navigating the U.S. Job Market as a Skilled Professional",
    excerpt:
      "Licensing, credentials, and culture — everything skilled professionals should know before starting a career in the United States.",
    category: "Career",
    author: "Daniel Okafor",
    date: "2026-05-30",
    body: `Relocating your career to the United States is a huge step, and the professionals who land well are the ones who understand the landscape before they arrive. Here's what matters most.

## Licensing and credential recognition

Many professions — nursing, engineering, accounting — require state or board-level licensing. Start early: verification and equivalency reviews can take weeks, and requirements vary by state.

## Build a U.S.-style resume

American resumes are concise, achievement-led, and one to two pages. Lead every bullet with impact and quantify results wherever you can.

- Skip photos, marital status, and date of birth
- Emphasize outcomes over responsibilities
- Tailor the summary to each role

## Understand workplace culture

Directness, punctuality, and self-advocacy are valued. Ask questions, share progress proactively, and don't wait to be told you're doing well — highlight your wins.

> The candidates who settle in fastest treat their first 90 days as an onboarding project: clarify expectations, build relationships, and document early wins.

A staffing partner who has guided internationally-trained professionals through this process can shorten the learning curve considerably. [Contact us](/contact) to talk through your move.`,
  },
  {
    slug: "5-steps-to-a-standout-resume",
    title: "5 Resume Tips That Actually Get You Noticed",
    excerpt:
      "Recruiters spend seconds on each resume. Make yours count with these five field-tested tips from our recruiting team.",
    category: "Career",
    author: "Aisha Rahman",
    date: "2026-05-12",
    body: `Recruiters skim, they don't read — at least not at first. These five tips come straight from the team that reviews thousands of resumes a year.

## 1. Lead with impact

Open each bullet with a result, not a duty. "Cut onboarding time 40%" beats "responsible for onboarding."

## 2. Mirror the job description

Applicant tracking systems and recruiters both scan for relevant keywords. Reflect the language of the posting — honestly — so the match is obvious.

## 3. Keep it scannable

Clear headings, consistent formatting, and plenty of white space. If a recruiter can't find your current role in three seconds, the layout is working against you.

- One to two pages
- Reverse-chronological order
- No dense paragraphs

## 4. Quantify everything

Numbers create instant credibility. Revenue, percentages, headcount, timelines — specifics turn claims into evidence.

## 5. Proofread ruthlessly

A single typo can undo an otherwise strong resume. Read it aloud, then have someone else check it.

> The best resume is the one that makes the next step obvious. Give the reader a reason to pick up the phone.

Want a second opinion? Our recruiters review candidate profiles every day — [get in touch](/contact).`,
  },
  {
    slug: "how-employers-win-the-talent-race",
    title: "How Employers Win Top Talent Faster",
    excerpt:
      "Speed, transparency, and a great candidate experience — the three levers that help employers land top talent first.",
    category: "Hiring",
    author: "Marcus Bell",
    date: "2026-04-28",
    body: `In a competitive market, the best candidates are off the table in days. Employers who win consistently pull three levers better than everyone else.

## Move fast — without cutting corners

Every extra day in your process is a day a competitor can make an offer. Streamline interviews, pre-align your decision-makers, and be ready to move when you meet the right person.

## Be transparent

Candidates reward clarity. Share the salary range, the process, and the timeline up front. It builds trust and filters for genuine fit early.

- Publish the compensation range
- Explain each interview stage
- Give feedback quickly, win or lose

## Invest in the candidate experience

How you hire signals how you operate. A respectful, well-run process is often the deciding factor when a candidate is weighing two offers.

> The employers who land top talent first treat every candidate — hired or not — like a future customer or referrer.

A staffing partner amplifies all three: pre-vetted candidates, faster shortlists, and a process that keeps talent engaged. [Talk to our team](/for-clients) about your next hire.`,
  },
];
