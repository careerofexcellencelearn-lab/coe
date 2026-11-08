import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { GeistSans } from "geist/font/sans"
import "./globals.css"

// Set NEXT_PUBLIC_SITE_URL in the environment once the real domain is connected
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elevaacademy.in"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eleva Academy | Center of Excellence — Soft Skills, Business Communication & IELTS Training",
    template: "%s | Eleva Academy",
  },
  description:
    "Live online soft skills, business communication and IELTS/TOEFL training by Sneha Durgkar — certified trainer with 8+ years of experience. Daily group classes plus a personal one-on-one session for every learner.",
  keywords: [
    "soft skills training",
    "business communication course",
    "IELTS training online",
    "TOEFL preparation",
    "spoken english classes",
    "interview preparation",
    "online classes India",
    "Sneha Durgkar",
    "Eleva Academy",
  ],
  authors: [{ name: "Sneha Durgkar" }],
  creator: "Eleva Academy",
  publisher: "Eleva Academy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Eleva Academy",
    locale: "en_IN",
    title: "Eleva Academy | Center of Excellence",
    description:
      "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar. Learn from anywhere — daily group classes and personal one-on-one sessions.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Eleva Academy — Center of Excellence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleva Academy | Center of Excellence",
    description:
      "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar.",
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
      logo: `${siteUrl}/icon.png`,
      image: `${siteUrl}/og-image.png`,
      description:
        "Online academy for soft skills, business communication and IELTS/TOEFL training — live classes with certified trainer Sneha Durgkar.",
      founder: {
        "@type": "Person",
        name: "Sneha Durgkar",
        jobTitle: "Communication & Soft Skills Trainer",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Eleva Academy",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
