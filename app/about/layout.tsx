import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Sneha Durgkar — Communication & Soft Skills Trainer",
  description:
    "Meet Sneha Durgkar, certified communication and soft skills trainer with 8+ years of experience and founder of Eleva Academy. Diplomas in soft skills, business communication and HR.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Sneha Durgkar — Communication & Soft Skills Trainer",
    description:
      "Certified trainer with 8+ years of experience helping students and professionals communicate with confidence.",
    url: "/about",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
