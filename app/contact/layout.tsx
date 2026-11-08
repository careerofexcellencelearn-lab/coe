import type React from "react"
import type { Metadata } from "next"
import { SHARE_IMAGE } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact Us & Book a Free Demo",
  description:
    "Book a free demo or contact Eleva Academy about soft skills, business communication and IELTS/TOEFL training. Call +91 81791 28482 or send an enquiry.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Eleva Academy & Book a Free Demo",
    description: "Book a free demo or ask about our live online programs. Call or WhatsApp +91 81791 28482.",
    url: "/contact",
    images: [SHARE_IMAGE],
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
