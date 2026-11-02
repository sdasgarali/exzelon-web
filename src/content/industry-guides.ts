/**
 * Sector guides for the /opportunities/<industry> pages.
 *
 * Why this exists: those pages are the site's main commercial surface, but the shared template
 * only supplies ~130 words of unique copy each (roles + stats + three generic "why us" cards),
 * which is thin for pages targeting competitive queries like "electrical staffing". Each entry
 * here adds field-specific, practical copy and one internal link to a related guide.
 *
 * Rules for this file: no invented statistics, no fabricated credentials or client names — the
 * notes describe how hiring in the sector actually works, nothing that has to be measured.
 * Keys must match `industries[].slug`; the section is skipped when a slug has no guide.
 */
export type IndustryGuide = {
  /** Unique H2 for the section — deliberately different per sector so the pages don't share a heading. */
  heading: string;
  /** One-paragraph description of how hiring works in this sector. */
  overview: string;
  /** What employers should settle before (and while) briefing a search. */
  employerNotes: string[];
  /** What candidates should have ready in order to move quickly. */
  candidateNotes: string[];
  /** An existing blog post worth reading next — slug must exist in `blog-seed.ts`. */
  relatedGuide?: { slug: string; label: string };
};

export const industryGuides: Record<string, IndustryGuide> = {
  healthcare: {
    heading: "Clinical hiring in Illinois: what makes a placement stick",
    overview:
      "Clinical hiring runs on credentials and timing. A nurse who is licensed here, current on the certifications the shift demands, and able to work the rota on offer is a fundamentally different candidate from one who only interviews well — and the difference is usually paperwork, not ability.",
    employerNotes: [
      "Name the licence and the certifications the shift actually requires — RN licensure, BLS, ACLS, PALS, specialty experience — so screening happens before the interview, not after the offer.",
      "State the shift pattern, float expectations, and weekend rotation up front. Those three details decide whether a clinician says yes.",
      "Separate per-diem, contract, and permanent needs. They draw on different pools, move at different speeds, and convert at different rates.",
    ],
    candidateNotes: [
      "Keep your Illinois licence, certifications, immunisation records, and two clinical references in one folder you can send the same day.",
      "Say plainly which settings and shift patterns you will and will not work — a recruiter can only advocate for a clear brief.",
      "If you want travel or contract work, complete the compliance packet once and diarise the renewals rather than rebuilding it each time.",
    ],
    relatedGuide: { slug: "elevate-your-healthcare-career", label: "Elevate Your Healthcare Career" },
  },

  construction: {
    heading: "Construction and trades hiring in Chicago",
    overview:
      "Construction hiring is site-specific. Two candidates in the same trade can differ entirely on whether they can badge onto your site, work the required shift, and produce the safety training your general contractor demands before anyone touches a tool.",
    employerNotes: [
      "Specify the site, the shift, and the safety requirements — OSHA 10 or 30, site inductions, and any owner-mandated badging or orientation.",
      "Say whether the work is publicly funded or prevailing-wage. Certified payroll adds documentation that changes who can be submitted and how fast.",
      "Name the equipment and trades involved, and whether the crew is union or open shop, so the shortlist is genuinely comparable.",
    ],
    candidateNotes: [
      "Carry current OSHA cards, trade certifications, and a short record of the sites and equipment you have actually run.",
      "Be ready to describe your safety record the way a general contractor will ask about it — plainly, with dates.",
      "Keep references from site supervisors and foremen, not just employers; those are the references that get called.",
    ],
    relatedGuide: { slug: "chicago-salary-guide-2026-what-skilled-roles-pay", label: "Chicago Salary Guide 2026" },
  },

  electrical: {
    heading: "Electrical hiring: licensing, sites, and what to verify",
    overview:
      "Electrical work splits into construction wiring, industrial maintenance, and controls — three different candidate pools. In Illinois, electrician licensing is handled largely at the municipal level rather than by the state, so the credential that matters depends on where the work is and who inspects it.",
    employerNotes: [
      "Confirm the licence the job requires in that jurisdiction, plus arc-flash and NFPA 70E training for anything in an energised industrial setting.",
      "State the environment — new construction, plant maintenance, or controls and PLC work. Electricians specialise, and the wrong pool costs you a week.",
      "Decide whether the crew needs a journeyman, a master, or a defined apprentice ratio. That mix drives both cost and how quickly the crew can be mobilised.",
    ],
    candidateNotes: [
      "Have your licence number, issuing jurisdiction, and renewal date to hand — verification is the first thing an employer checks.",
      "List voltage classes, equipment, and control systems you have worked on — panels, switchgear, VFDs, PLCs — rather than job titles alone.",
      "Keep safety training current; industrial sites will ask about arc-flash and lockout/tagout familiarity before your first shift.",
    ],
    relatedGuide: { slug: "chicago-salary-guide-2026-what-skilled-roles-pay", label: "Chicago Salary Guide 2026" },
  },

  engineering: {
    heading: "Engineering hiring: project work versus permanent seats",
    overview:
      "Engineering searches stall on scope far more often than on talent. A process engineer for a plant and a project engineer for a design-build firm are both called engineers, and one advert written for either attracts neither properly.",
    employerNotes: [
      "Define the deliverable — design, commissioning, process improvement, or project controls — and whether a PE stamp is required or merely preferred.",
      "Say which software the team uses and at what level. CAD, PLM, and simulation skills are rarely interchangeable between disciplines.",
      "Choose the engagement shape early. Project work often suits a fixed-term contractor; plant roles need someone who will own the line for years.",
    ],
    candidateNotes: [
      "Lead with the projects you delivered — scope, systems, and your specific role — rather than a list of employers and dates.",
      "State your PE or EIT status plainly if it applies, including which state the licence sits in.",
      "If you want contract work, make your availability and your travel radius explicit from the first conversation.",
    ],
    relatedGuide: { slug: "chicago-salary-guide-2026-what-skilled-roles-pay", label: "Chicago Salary Guide 2026" },
  },

  manufacturing: {
    heading: "Manufacturing hiring: shifts, cells, and machine time",
    overview:
      "Plant hiring is decided by shift structure and equipment. An operator who has run your machine family, on your shift, to your quality tolerances is worth more than a general production CV — and that is the profile the search should be priced around.",
    employerNotes: [
      "Write the requisition around the machine and the shift — press, CNC, assembly, packaging, or maintenance — plus the rotation and overtime expectations.",
      "State the quality regime: inspection frequency, tolerances, and documentation. It filters candidates far more sharply than years of experience.",
      "Plan maintenance and skilled-trade roles separately. Industrial electricians and millwrights are a narrower market and take longer to fill.",
    ],
    candidateNotes: [
      "Describe the equipment you have run and the tolerances or throughput you were measured against.",
      "Be clear about shift availability — most plants will trade a little experience for dependable night and weekend cover.",
      "Keep powered-industrial-truck and other equipment certifications current; plants ask for proof rather than a promise.",
    ],
    relatedGuide: { slug: "where-to-hire-in-chicago-talent-clusters", label: "Where to Hire in Chicago" },
  },

  it: {
    heading: "IT hiring: hire for the work, not the title",
    overview:
      "Technology titles mean different things at different employers, so hiring on a job title is the fastest route to a mismatched shortlist. Hiring on the specific systems, stack, and deliverables is what produces someone who can contribute in week one.",
    employerNotes: [
      "Describe the stack, the environment, and the first ninety days of work rather than a list of technologies you hope to use.",
      "Choose the engagement deliberately — permanent for ownership, contract for a defined build or a migration with an end date.",
      "Build the interview around a real problem from your own codebase or platform. It screens better than a quiz and sells the role at the same time.",
    ],
    candidateNotes: [
      "Lead with what you have shipped and operate: the systems, the scale, and your specific contribution to them.",
      "Say whether you want permanent or contract work and what you are optimising for — craft, learning, or flexibility.",
      "Keep a repository or portfolio link ready. It shortens screening more than any summary paragraph.",
    ],
    relatedGuide: { slug: "will-ai-take-over-software-developer-jobs", label: "Will AI Take Over Software Developer Jobs?" },
  },

  finance: {
    heading: "Finance hiring: cycles, systems, and trust",
    overview:
      "Finance hiring is calendar-driven. Month-end close, budget season, and audit preparation create short, sharp spikes in demand for people who already know the systems and the reporting rhythm — and those people are usually engaged before the spike arrives.",
    employerNotes: [
      "Name the systems and the reporting work — ERP, consolidation, modelling, or analysis — rather than advertising a generic financial analyst.",
      "Say whether the need is cyclical support or a permanent seat. The calendar usually answers that question for you.",
      "Be explicit about confidentiality and any regulatory or background checks at the start, so the process does not stall after the final interview.",
    ],
    candidateNotes: [
      "Show the reporting you have owned: close, forecast, variance analysis, or a modelling review you built.",
      "List the systems you are fluent in and the ones you can pick up quickly — ERP fluency is often the deciding factor.",
      "Be ready to explain the numbers you produced and the decisions they informed, not just the teams you sat in.",
    ],
    relatedGuide: { slug: "chicago-salary-guide-2026-what-skilled-roles-pay", label: "Chicago Salary Guide 2026" },
  },

  accounting: {
    heading: "Accounting hiring: plan for the seasonal reality",
    overview:
      "Accounting demand is not flat. Tax season and year-end work concentrate hiring into a few months, and the firms that plan the ramp before it starts hire better people than the firms that scramble once the work is already late.",
    employerNotes: [
      "Plan the seasonal ramp early. The strongest bookkeepers and staff accountants are engaged before the rush, not during it.",
      "Specify the software and the work — AP, AR, payroll, general ledger, or audit support — and whether public-accounting experience genuinely matters for the seat.",
      "Consider temp-to-hire for seasonal capacity: it converts the people who fit and releases the ones who do not, without a costly permanent mis-hire.",
    ],
    candidateNotes: [
      "State your software fluency directly: QuickBooks, NetSuite, Sage, or a larger ERP, and how recently you used each.",
      "If you hold a CPA or are pursuing one, say so and say which stage you are at.",
      "Be calendar-specific: state when you can start and how many hours you can cover through the peak.",
    ],
    relatedGuide: { slug: "chicago-salary-guide-2026-what-skilled-roles-pay", label: "Chicago Salary Guide 2026" },
  },

  "tax-legal": {
    heading: "Tax and legal hiring: precision and discretion",
    overview:
      "Tax and legal searches reward precision. These roles carry filing deadlines, privilege, and professional liability, so the screening bar is documentation and judgement — not enthusiasm or a polished interview.",
    employerNotes: [
      "State the credential the role needs — CPA, Enrolled Agent, JD, or paralegal certification — together with the practice area, not just the seniority level.",
      "Describe the work: compliance, dispute, transactional, or in-house counsel, and which systems and filing calendars the seat owns.",
      "Set confidentiality and conflict-check expectations early. Late surprises lose good candidates and delay the start date.",
    ],
    candidateNotes: [
      "Lead with credentials, licence or bar numbers, and the filings or matters you have handled end to end.",
      "Be specific about the software and filing platforms you know, and how you keep current when the rules change.",
      "Ask about the calendar during the interview — the roles that fit are the ones whose busy seasons you can actually work.",
    ],
    relatedGuide: { slug: "how-to-hire-through-a-staffing-agency-chicago", label: "How to Hire Through a Staffing Agency in Chicago" },
  },

  administrative: {
    heading: "Administrative hiring: how a support seat is really filled",
    overview:
      "Administrative hiring is decided on judgement and reliability rather than a CV. A strong executive assistant or office manager reads a situation, holds several schedules together, and handles confidential work without needing to be managed closely.",
    employerNotes: [
      "Describe the executive, the calendar, and the discretion required. Supporting a founder is a different job from coordinating a department.",
      "Name the tools involved — Microsoft 365, Google Workspace, scheduling, expenses, or a CRM — and the expectations for each.",
      "Check reliability deliberately. References about past attendance and how someone handled a broken schedule tell you more than any skills test.",
    ],
    candidateNotes: [
      "Show what you coordinated — calendars, travel, events, or a busy front desk — and the volume you handled without escalation.",
      "Say plainly which systems you know well and which you are still learning.",
      "Line up two references who can speak to your reliability and judgement, not only to your manner with people.",
    ],
    relatedGuide: { slug: "5-steps-to-a-standout-resume", label: "5 Resume Tips That Actually Get You Noticed" },
  },

  marketing: {
    heading: "Marketing hiring: hire for evidence, not adjectives",
    overview:
      "Marketing candidates are easy to interview and hard to compare, because most CVs claim the same handful of strengths. The only dependable way to hire is to ask for evidence of work the candidate actually did and what it changed.",
    employerNotes: [
      "Ask for a portfolio or a single campaign, including the decisions the candidate made and the constraints they worked under.",
      "Name the channel and the stack the seat owns — paid, lifecycle, content, or brand — and the tools it runs on day to day.",
      "Be clear whether the role is execution, strategy, or both. Marketing hires fail on that mismatch more often than on skill.",
    ],
    candidateNotes: [
      "Bring three pieces of work: the brief, what you did, and what resulted. Evidence separates you from a field of similar CVs.",
      "List the platforms you run day to day, and be honest about the ones you have only touched.",
      "Say which work you want more of, especially if you are moving between channels — it makes you easier to place well.",
    ],
    relatedGuide: { slug: "how-employers-win-the-talent-race", label: "How Employers Win Top Talent Faster" },
  },

  distribution: {
    heading: "Distribution and warehouse hiring at Chicago scale",
    overview:
      "Warehouse and distribution hiring is volume work with a precision problem. The roles are well understood, but whether a crew stays past the first month is largely decided at the requisition — the shift, the rate, the guarantee, and how the site is actually run.",
    employerNotes: [
      "Fix the shift, the rate, and the guaranteed hours before you advertise. In this market, ambiguity on any of the three shows up later as no-shows.",
      "State the equipment and the certification required — powered-industrial-truck training and evaluation, order-selector experience, or a CDL class.",
      "Plan for the commute. Whether the site is reachable in under an hour decides much of your realistic candidate pool.",
    ],
    candidateNotes: [
      "Keep your equipment certifications and a work history that shows attendance and productivity, not just job titles.",
      "Be clear about the shifts and the commute you can sustain week after week — reliability is the skill employers pay for here.",
      "If the role is temp-to-hire, ask what the conversion path looks like. Well-run sites will tell you straight away.",
    ],
    relatedGuide: { slug: "where-to-hire-in-chicago-talent-clusters", label: "Where to Hire in Chicago" },
  },
};

export function getIndustryGuide(slug: string): IndustryGuide | undefined {
  return industryGuides[slug];
}
