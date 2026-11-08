import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { SHARE_IMAGE, SITE_URL, SOCIAL_PROFILES } from "@/lib/site"

// Canonical site URL (www host) — see lib/site.ts
const siteUrl = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eleva Academy | Soft Skills, Communication & IELTS Training",
    template: "%s | Eleva Academy",
  },
  description:
    "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar. Group classes plus 1:1 sessions — book a free demo.",
  keywords: [
    "soft skills training",
    "business communication course",
    "communication skills training online",
    "IELTS coaching online",
    "TOEFL preparation",
    "spoken English classes",
    "interview preparation",
    "soft skills training Gurugram",
    "IELTS coaching Gurugram",
    "Sneha Durgkar",
    "Eleva Academy",
  ],
  applicationName: "Eleva Academy",
  category: "education",
  formatDetection: { telephone: true, email: true, address: true },
  authors: [{ name: "Sneha Durgkar" }],
  creator: "Eleva Academy",
  publisher: "Eleva Academy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Eleva Academy",
    locale: "en_IN",
    title: "Eleva Academy | Build Confidence. Master Communication. Elevate Your Career.",
    description:
      "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar. Group classes plus a personal one-on-one session — book a free demo.",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleva Academy | Build Confidence. Master Communication.",
    description:
      "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar — book a free demo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f4",
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "Eleva Academy",
      slogan: "Center of Excellence",
      url: siteUrl,
      logo: `${siteUrl}/logo-512.png`,
      email: "elevaacadyindia@gmail.com",
      telephone: "+91-81791-28482",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Sector 106, Dwarka Expressway",
        addressLocality: "Gurugram",
        addressRegion: "Haryana",
        addressCountry: "IN",
      },
      sameAs: [SOCIAL_PROFILES.linkedin, SOCIAL_PROFILES.instagram],
      image: `${siteUrl}/og-image.png`,
      description:
        "Online academy for soft skills, business communication and IELTS/TOEFL training — live classes with trainer Sneha Durgkar.",
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: ["Soft skills", "Business communication", "Public speaking", "Interview preparation", "IELTS", "TOEFL"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "admissions",
        telephone: "+91-81791-28482",
        email: "elevaacadyindia@gmail.com",
        availableLanguage: ["English"],
      },
      founder: { "@id": `${siteUrl}/about#sneha-durgkar` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/about#sneha-durgkar`,
      name: "Sneha Durgkar",
      jobTitle: "Founder & Lead Trainer",
      url: `${siteUrl}/about`,
      image: `${siteUrl}/sneha.webp`,
      worksFor: { "@id": `${siteUrl}/#organization` },
      hasCredential: [
        "Post Graduation in Business Management (PGDM)",
        "Diploma in Teaching Soft Skills & Business Communication",
        "Certification in Human Resources — University of Minnesota",
      ].map((name) => ({ "@type": "EducationalOccupationalCredential", name })),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Eleva Academy",
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <link rel="preload" as="image" href="/sneha.webp" />
        <link rel="preload" as="image" href="/logo.webp" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
      </body>
    </html>
  )
}
