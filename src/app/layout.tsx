import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";
import { CookieNotice } from "@/components/cookie-notice";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} — ${site.tagline}`,
    template: `%s | ${site.brand}`,
  },
  description: site.description,
  keywords: [
    "recruitment", "staffing agency", "job portal", "healthcare jobs",
    "construction jobs", "electrical jobs", "IT jobs", "Chicago staffing", "Exzelon",
  ],
  openGraph: {
    type: "website",
    siteName: site.brand,
    locale: "en_US",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Warm up the third-party analytics origins so their (deferred) scripts
            don't pay DNS+TLS on a cold connection during early interaction. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://accesshub.neuraforz.com" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        {children}
        <VisitorTracker />
        <CookieNotice />
        {/* AccessHub site analytics (Neuraforz) — loads on every page.
            Frameworks must set window.AHP_TRACK_SOURCE/BASE because next/script injects the
            tag dynamically, so track.js's `document.currentScript` (how it reads data-source)
            is null. NOTE: the tracker only loads once accesshub.neuraforz.com serves track.js
            with `Cross-Origin-Resource-Policy: cross-origin` (currently `same-origin` → blocked). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.AHP_TRACK_SOURCE='exz-web';window.AHP_TRACK_BASE='https://accesshub.neuraforz.com/api';",
          }}
        />
        <Script
          src="https://accesshub.neuraforz.com/api/track.js"
          data-source="exz-web"
          strategy="afterInteractive"
        />
        {/* Google Analytics (GA4) — loads on every page, deferred to idle so it stays
            off the critical-interaction path (protects INP). */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KMSE0KNWXF"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-KMSE0KNWXF');`}
        </Script>
      </body>
    </html>
  );
}
