import type React from "react"
import type { Metadata } from "next"
import { SHARE_IMAGE } from "@/lib/site"

export const metadata: Metadata = {
  title: "About Sneha Durgkar — Soft Skills Trainer",
  description:
    "Meet Sneha Durgkar, founder of Eleva Academy: communication and soft skills trainer with a PGDM, 10+ years in education and 8+ years of training.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sneha Durgkar — Communication & Soft Skills Trainer",
    description:
      "Founder of Eleva Academy with 10+ years in education and 8+ years of training — helping students and professionals communicate with confidence.",
    url: "/about",
    type: "profile",
    images: [SHARE_IMAGE],
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
