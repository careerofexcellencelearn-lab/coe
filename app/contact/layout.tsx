import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Eleva Academy — questions about soft skills, business communication or IELTS/TOEFL training, enrolment and batches.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Eleva Academy",
    description: "Questions about our live online training programs? Get in touch.",
    url: "/contact",
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
