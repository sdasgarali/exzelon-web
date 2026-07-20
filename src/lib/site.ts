/** Central site configuration — single source of truth for brand + contact info. */

export const site = {
  name: "Exzelon",
  brand: "Exzelon — NextGen Hires",
  shortName: "Exzelon",
  tagline: "Find Your Next Career Move",
  description:
    "Exzelon — NextGen Hires connects skilled professionals with careers across healthcare, construction, electrical, tax & legal, and IT — and helps employers hire faster with expert recruitment and staffing.",
  url: "https://www.exzelon.com",
  email: "contactus@exzelon.com",
  phone: "+1 (872) 358-010",
  phoneHref: "tel:+18723580100",
  whatsapp: "https://wa.me/18723580100",
  address: {
    line1: "6422 N Maplewood Ave",
    city: "Chicago",
    state: "Illinois",
    zip: "60645",
    country: "USA",
  },
  rating: { score: 4.4, outOf: 5, source: "AmbitionBox" },
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/exzelon", icon: "linkedin" },
    { label: "Facebook", href: "https://facebook.com/exzelon", icon: "facebook" },
    { label: "Instagram", href: "https://instagram.com/exzelon", icon: "instagram" },
    { label: "X", href: "https://x.com/exzelon", icon: "twitter" },
  ],
} as const;

export const nav = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Who We Are", href: "/about#who-we-are", desc: "Our story and purpose" },
      { label: "Mission & Vision", href: "/about#mission", desc: "What drives us forward" },
      { label: "Our Values", href: "/about#values", desc: "The principles we hire by" },
      { label: "Leadership", href: "/about#leadership", desc: "Meet the team" },
    ],
  },
  { label: "Jobs", href: "/jobs" },
  {
    label: "Opportunities",
    href: "/opportunities",
    children: [
      { label: "Healthcare", href: "/opportunities/healthcare", desc: "Nurses, allied health & more" },
      { label: "Construction", href: "/opportunities/construction", desc: "Trades & site management" },
      { label: "Electrical", href: "/opportunities/electrical", desc: "Licensed electricians & techs" },
      { label: "Tax & Legal", href: "/opportunities/tax-legal", desc: "Accounting, tax & counsel" },
      { label: "Information Technology", href: "/opportunities/it", desc: "Engineering, data & cloud" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Compliance", href: "/resources/compliance", desc: "Credentialing & standards" },
      { label: "Blog", href: "/resources/blog", desc: "Career & hiring insights" },
      { label: "FAQ", href: "/resources/faq", desc: "Answers to common questions" },
      { label: "Feedback", href: "/resources/feedback", desc: "Share your experience" },
    ],
  },
  { label: "For Clients", href: "/for-clients" },
  { label: "Contact Us", href: "/contact" },
] as const;
