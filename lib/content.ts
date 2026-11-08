// Shared content types and defaults — safe for both server and client
import { cleanText, isPhone } from "./validate"

export type ExperienceEntry = { title: string; org: string; description: string }

export type AboutContent = {
  subtitle: string
  bio: string[]
  qualifications: string[]
  trainingAreas: string[]
  experience: ExperienceEntry[]
}

export type Testimonial = { id: string; quote: string; name: string; role: string }

// A professional profile — inspired by the resume, not a copy of it
export const DEFAULT_ABOUT: AboutContent = {
  subtitle: "Communication & Soft Skills Trainer · Founder, Eleva Academy",
  bio: [
    "Sneha Durgkar is a communication and soft skills trainer, and the founder of Eleva Academy — an online academy that helps students and working professionals speak, write and present with confidence.",
    "Her journey in education began over a decade ago in career development, where she counselled hundreds of students on employability, opportunities and growth. That experience taught her exactly what organisations look for in a candidate — and how rarely it is taught. Since 2022 she has dedicated herself fully to training, coaching learners one-on-one in communication and soft skills for one of India's leading edtech platforms before founding Eleva Academy to bring that same personal approach to her own students.",
    "Her sessions are live, practical and personal: real workplace scenarios, individual feedback and steady practice — because confidence is built by doing, not just listening.",
  ],
  qualifications: [
    "Post Graduation in Business Management (PGDM)",
    "Diploma in Teaching Soft Skills & Business Communication",
    "Certification in Human Resources — University of Minnesota",
    "Bachelor's in Commerce — MIT Pune",
  ],
  trainingAreas: [
    "Soft Skills Development",
    "Business Communication",
    "IELTS & TOEFL Preparation",
    "Interview Preparation & Career Counselling",
  ],
  experience: [
    {
      title: "Founder & Lead Trainer",
      org: "Eleva Academy",
      description:
        "Live online programs in soft skills, business communication and IELTS/TOEFL — daily group classes with a personal one-on-one session for every learner.",
    },
    {
      title: "Communication & Soft Skills Trainer",
      org: "Leading EdTech Platform · 2022 – Present",
      description:
        "One-on-one online coaching in communication and soft skills, guiding each learner's individual growth with structured feedback.",
    },
    {
      title: "Career Development Professional",
      org: "Reputed Design & Management Institutes · 2014 – 2016",
      description:
        "Counselled students on careers and employability, delivered workforce development trainings and connected learners with the right opportunities.",
    },
  ],
}

export type ContactContent = {
  email: string
  phone: string
  address: string
  linkedin: string
  facebook: string
  twitter: string
  instagram: string
  youtube: string
}

export const DEFAULT_CONTACT: ContactContent = {
  email: "elevaacadyindia@gmail.com",
  phone: "+91 81791 28482",
  address: "Sector 106, Dwarka Expressway, Gurugram, Haryana",
  linkedin: "https://www.linkedin.com/company/eleva-academy-india/",
  facebook: "",
  twitter: "",
  instagram: "https://www.instagram.com/elevaacademy_official/",
  youtube: "",
}

/** Fill fields missing from older stored rows (saved before phone existed) with defaults */
export function withContactDefaults(stored: Partial<ContactContent> | null | undefined): ContactContent {
  return { ...DEFAULT_CONTACT, ...(stored ?? {}) }
}

/** Phone number as digits only, for tel: and wa.me links */
export function phoneDigits(phone: string): string {
  return phone.replace(/[^0-9]/g, "")
}

/** wa.me link with a pre-filled message (empty when no phone is configured) */
export function whatsappLink(phone: string, message: string): string {
  const digits = phoneDigits(phone)
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : ""
}

/** Google Maps search link for the academy's address */
export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** Sanitise an incoming contact payload — email must be valid, links must be http(s) or empty */
export function normalizeContact(body: any): ContactContent {
  const link = (value: unknown): string => {
    const cleaned = cleanText(value, 300)
    if (!cleaned) return ""
    try {
      const url = new URL(cleaned)
      return url.protocol === "https:" || url.protocol === "http:" ? cleaned : ""
    } catch {
      return ""
    }
  }
  const email = cleanText(body?.email, 320).toLowerCase()
  const phone = cleanText(body?.phone, 30)
  return {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : DEFAULT_CONTACT.email,
    phone: isPhone(phone) ? phone : "",
    address: cleanText(body?.address, 200),
    linkedin: link(body?.linkedin),
    facebook: link(body?.facebook),
    twitter: link(body?.twitter),
    instagram: link(body?.instagram),
    youtube: link(body?.youtube),
  }
}

/** Sanitise an incoming about-content payload into a safe, well-shaped object */
export function normalizeAbout(body: any): AboutContent {
  const arr = (value: unknown, max: number, itemLength: number): string[] =>
    Array.isArray(value)
      ? value
          .slice(0, max)
          .map((item) => cleanText(item, itemLength))
          .filter(Boolean)
      : []
  return {
    subtitle: cleanText(body?.subtitle, 200) || DEFAULT_ABOUT.subtitle,
    bio: arr(body?.bio, 8, 2000),
    qualifications: arr(body?.qualifications, 12, 200),
    trainingAreas: arr(body?.trainingAreas, 12, 100),
    experience: Array.isArray(body?.experience)
      ? body.experience
          .slice(0, 10)
          .map((entry: any) => ({
            title: cleanText(entry?.title, 120),
            org: cleanText(entry?.org, 160),
            description: cleanText(entry?.description, 600),
          }))
          .filter((entry: ExperienceEntry) => entry.title)
      : [],
  }
}
