import type { Metadata } from "next";
import { Inter, Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";

/**
 * Italic is loaded on purpose.
 *
 * The display italics — "can't stop citing", "authority engine" — are Inter
 * now, set light against the extrabold around them. Without the italic file the
 * browser would fake the slant by shearing the upright, which at 57px shows.
 */
const inter = Inter({
  variable: "--font-sans",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

/**
 * The serif is the figures face now, and only that.
 *
 * It carried two jobs before: the big serif numerals (The Shift's 45% / 69% /
 * 1, the pull quote on /industries/) and the display italics in the hero and
 * the approach. The second job is Inter's now — a light italic of the heading
 * face, rather than a serif leaning in beside it. What is left is the numerals,
 * and for those Instrument Serif is the face that was always right: the swap to
 * Spectral flattened them.
 */
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const SITE_URL = "https://thallodigital.com";
const DESCRIPTION =
  "We make brands the default citation and recommendation in conversational LLM search answers — ChatGPT, Perplexity, Google AI and Claude.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Thallo · The AI Visibility Agency",
    template: "%s · Thallo Digital",
  },
  description: DESCRIPTION,
  applicationName: "Thallo Digital",
  keywords: [
    "AI visibility",
    "generative engine optimization",
    "GEO agency",
    "LLM search optimization",
    "Brand authority building",
    "AI SEO",
  ],
  // Absolute URLs on purpose: metadataBase carries a path segment (/thallo-digital),
  // and relative canonicals resolve against the origin, dropping it.
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: "Thallo Digital",
    title: "Thallo · The AI Visibility Agency",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "Thallo Digital — the AI visibility agency" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Thallo · The AI Visibility Agency",
    description: DESCRIPTION,
    images: [`${SITE_URL}/og.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${spaceMono.variable} h-full antialiased`}
      style={{ scrollBehavior: 'smooth' }}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900">
        {/* Machine-readable identity. An agency selling AI visibility should be
            unambiguous to the crawlers and models that assemble the answers. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Thallo Digital',
              alternateName: 'Thallo',
              url: `${SITE_URL}/`,
              logo: `${SITE_URL}/logo.png`,
              image: `${SITE_URL}/og.png`,
              description: DESCRIPTION,
              email: 'hello@thallo.co',
              areaServed: 'Worldwide',
              serviceType: [
                'AI visibility',
                'Generative engine optimization',
                'Brand authority building',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'sales',
                email: 'hello@thallo.co',
                url: `${SITE_URL}/contact/`,
                availableLanguage: ['English'],
              },
            }),
          }}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
