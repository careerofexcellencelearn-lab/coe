"use client"

import type React from "react"

import {
  Sparkles,
  MessageCircle,
  BookOpen,
  Star,
  GraduationCap,
  Video,
  BadgeCheck,
  Laptop,
  Award,
  CalendarCheck,
  Quote,
  ArrowRight,
  Check,
  Clock,
  Users,
  UserRound,
  Phone,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { formatTime12 } from "@/lib/time"
import { phoneDigits } from "@/lib/content"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { useContact } from "@/components/site/use-contact"

type Service = {
  id: string
  title: string
  description: string
  objectives: string[]
  duration: string
  price: number
  offerPrice: number | null
  offerLabel: string
  classStart: string
  classEnd: string
  oneOnOneStart: string
  oneOnOneEnd: string
  certificateProvided: boolean
}

const serviceIcon = (title: string): LucideIcon => {
  const t = title.toLowerCase()
  if (t.includes("ielts") || t.includes("toefl")) return BookOpen
  if (t.includes("soft") || t.includes("communication")) return Sparkles
  return Star
}

// Shown if the services API is unreachable, so the page never breaks
const fallbackServices: Service[] = [
  {
    id: "soft-skills-business-communication",
    title: "Soft Skills & Business Communication",
    description:
      "One complete program covering the interpersonal and professional communication skills every career is built on — taught through live practice sessions.",
    objectives: [
      "Communicate clearly and confidently in any situation",
      "Write professional emails, reports and messages",
      "Speak up in meetings and deliver impactful presentations",
      "Master teamwork, time management and workplace etiquette",
    ],
    duration: "8 Weeks · Live Online",
    price: 5999,
    offerPrice: null,
    offerLabel: "",
    classStart: "10:00",
    classEnd: "18:00",
    oneOnOneStart: "19:00",
    oneOnOneEnd: "20:00",
    certificateProvided: false,
  },
  {
    id: "ielts-toefl",
    title: "IELTS & TOEFL Training",
    description:
      "Complete preparation for both IELTS and TOEFL with score-boosting strategies, regular mock tests and personal feedback on every module.",
    objectives: [
      "Master Listening, Reading, Writing & Speaking modules",
      "Learn score-boosting strategies and time management",
      "Practise with regular mock tests and personal feedback",
      "Build the vocabulary and grammar for IELTS Band 7+ / TOEFL 100+",
    ],
    duration: "10 Weeks · Live Online",
    price: 8999,
    offerPrice: null,
    offerLabel: "",
    classStart: "10:00",
    classEnd: "18:00",
    oneOnOneStart: "19:00",
    oneOnOneEnd: "20:00",
    certificateProvided: false,
  },
]

const features = [
  {
    icon: Video,
    title: "Live Interactive Classes",
    description: "Real-time online sessions with practice activities and instant feedback — not recorded lectures.",
  },
  {
    icon: BadgeCheck,
    title: "Certified & Qualified Trainer",
    description: "Learn from a trainer with formal diplomas in soft skills, business communication and HR.",
  },
  {
    icon: Laptop,
    title: "Learn from Anywhere",
    description: "All you need is an internet connection — join from home, college or office on any device.",
  },
  {
    icon: Award,
    title: "Practical & Career-Focused",
    description: "Every session is built around real workplace situations you can apply immediately.",
  },
]

const steps = [
  {
    number: "01",
    icon: CalendarCheck,
    title: "Register for a program",
    description: "Choose your program, fill in the enrolment form and create your account in one step.",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "We contact you personally",
    description: "We reach out to guide you, confirm your batch and complete the payment personally.",
  },
  {
    number: "03",
    icon: GraduationCap,
    title: "Login & join live classes",
    description: "Once approved, login to your dashboard and join your live Zoom classes at the scheduled time.",
  },
]

const trainingAreas = [
  "Soft Skills",
  "Business Communication",
  "IELTS",
  "TOEFL",
  "Interview Preparation",
  "Public Speaking",
  "Email Writing",
  "Workplace Etiquette",
]

type Testimonial = { id: string; quote: string; name: string; role: string }

const fallbackTestimonials: Testimonial[] = [
  {
    id: "fallback-1",
    quote:
      "Ma'am's sessions completely changed the way I speak in meetings. The classes are interactive and every concept comes with real practice.",
    name: "Priya S.",
    role: "HR Executive",
  },
  {
    id: "fallback-2",
    quote:
      "I joined for interview preparation before campus placements. The mock interviews and feedback gave me the confidence I was missing.",
    name: "Rahul M.",
    role: "Engineering Graduate",
  },
  {
    id: "fallback-3",
    quote:
      "As a working professional, the online format was perfect. Practical business communication lessons I could apply the very next day.",
    name: "Anjali K.",
    role: "Marketing Professional",
  },
]

const faqs = [
  {
    question: "Are the classes really live?",
    answer:
      "Yes. Every session is conducted live on Zoom by Sneha Durgkar, with interaction, practice activities and personal feedback — not pre-recorded videos.",
  },
  {
    question: "How does enrolment work?",
    answer:
      "Click Enroll on any program and fill in your details with a password. We'll contact you personally to confirm your batch and payment. Once approved, you can login to your dashboard and join live classes.",
  },
  {
    question: "What do I need to attend the classes?",
    answer:
      "Just a smartphone, tablet or laptop with an internet connection and Zoom. You can join from home, college or office — no travel needed.",
  },
  {
    question: "I'm a complete beginner and feel shy speaking. Can I still join?",
    answer:
      "Absolutely — most learners start exactly there. Classes are a safe, supportive space where you practise step by step, and batches are kept small so you get individual attention.",
  },
]

const emptyForm = { name: "", email: "", phone: "", password: "", message: "" }

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string
  title: string
  description?: string
  center?: boolean
}) {
  return (
    <div className={`reveal max-w-2xl mb-10 md:mb-14 ${center ? "mx-auto text-center" : ""}`}>
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-[2.6rem] md:leading-[1.15] font-bold tracking-tight text-balance">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground leading-relaxed md:text-lg">{description}</p>}
    </div>
  )
}

export default function HomePage() {
  // Start with fallback content so sections render instantly; live data replaces it
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const contact = useContact()

  // Enrolment dialog state
  const [enrollService, setEnrollService] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 8s timeout so a slow network can never leave the sections hanging
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    fetch("/api/services", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`services responded ${res.status}`)
        return res.json()
      })
      .then((data) => {
        const list = data.services ?? []
        if (list.length > 0) setServices(list)
      })
      .catch(() => {
        /* fallback services are already rendered */
      })
      .finally(() => clearTimeout(timer))
    fetch("/api/testimonials", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.testimonials?.length) setTestimonials(data.testimonials)
      })
      .catch(() => {})
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  // Scroll-triggered reveals. Fail-open by design so content can never be left
  // invisible: triggers fire `once` (a later ScrollTrigger refresh can't rewind
  // a played reveal), inline styles are cleared after each reveal, and the
  // effect re-runs when live testimonials replace the fallbacks (React remounts
  // them with new ids, so tweens must re-attach to the new DOM). The service
  // cards are deliberately NOT animated — they show instantly on page open.
  // Already-revealed elements are tagged and skipped so they never re-hide.
  // The hero is not part of this — its entrance is pure CSS (.hero-in).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const pending = (el: Element) => !(el as HTMLElement).dataset.revealed
      const markRevealed = (els: HTMLElement[]) => {
        els.forEach((el) => (el.dataset.revealed = "1"))
        gsap.set(els, { clearProps: "opacity,transform" })
      }
      gsap.utils
        .toArray<HTMLElement>(".reveal")
        .filter(pending)
        .forEach((el) => {
          gsap.from(el, {
            y: 32,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onComplete: () => markRevealed([el]),
          })
        })
      gsap.utils.toArray<HTMLElement>(".reveal-group").forEach((group) => {
        const items = Array.from(group.children).filter(pending) as HTMLElement[]
        if (items.length === 0) return
        gsap.from(items, {
          y: 28,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 90%", once: true },
          onComplete: () => markRevealed(items),
        })
      })
    }, pageRef)
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [testimonials])

  const openEnroll = (service: Service) => {
    setEnrollService(service)
    setForm(emptyForm)
    setResult(null)
  }

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollService) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceId: enrollService.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: data.message })
      } else {
        setResult({ ok: false, message: data.error ?? "Something went wrong. Please try again." })
      }
    } catch {
      setResult({ ok: false, message: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const tel = contact.phone ? `tel:+${phoneDigits(contact.phone)}` : ""

  return (
    <div ref={pageRef} className="min-h-screen bg-background">
      {/* Course structured data for search engines, built from the live services */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: services.map((service, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Course",
                name: service.title,
                description: service.description,
                provider: { "@type": "EducationalOrganization", name: "Eleva Academy" },
                hasCourseInstance: {
                  "@type": "CourseInstance",
                  courseMode: "Online",
                  courseWorkload: service.duration || "PT1H",
                },
              },
            })),
          }),
        }}
      />

      <SiteHeader active="home" phone={contact.phone} />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="absolute -top-40 right-[-10%] w-[560px] h-[560px] rounded-full bg-[#FFD9A8]/40 blur-3xl pointer-events-none" />

          <div className="container-site relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-10 items-center pt-10 pb-16 md:pt-16 md:pb-24">
            <div className="text-center lg:text-left">
              <p
                className="hero-in inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs sm:text-sm font-medium shadow-sm"
                style={{ "--d": 0 } as React.CSSProperties}
              >
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
                  <span className="relative w-2 h-2 rounded-full bg-green-500" />
                </span>
                Admissions open · Live online batches
              </p>

              <h1
                className="hero-in mt-6 text-[2.6rem] leading-[1.08] sm:text-6xl lg:text-[4.1rem] font-bold tracking-tight text-balance"
                style={{ "--d": 1 } as React.CSSProperties}
              >
                Speak with confidence.{" "}
                <span className="relative whitespace-nowrap text-primary">
                  Grow
                  <svg
                    viewBox="0 0 120 12"
                    className="absolute left-0 -bottom-1.5 w-full h-3 text-[#FFC27A]"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M2 9 C 30 2, 90 2, 118 8" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                your career.
              </h1>

              <p
                className="hero-in mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ "--d": 2 } as React.CSSProperties}
              >
                Live online training in soft skills, business communication and IELTS/TOEFL with certified trainer
                Sneha Durgkar — daily group classes plus a personal one-on-one session for every learner.
              </p>

              <div
                className="hero-in mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                style={{ "--d": 3 } as React.CSSProperties}
              >
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#de7200] transition-colors"
                >
                  Explore Programs
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-border bg-card font-semibold hover:border-foreground/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  Talk to Us
                </Link>
              </div>

              <dl
                className="hero-in mt-10 grid grid-cols-3 max-w-lg mx-auto lg:mx-0 divide-x divide-border rounded-2xl border border-border bg-card/80 py-4 shadow-sm"
                style={{ "--d": 4 } as React.CSSProperties}
              >
                {[
                  ["8+", "Years training"],
                  ["Daily", "Live classes"],
                  ["1:1", "Personal session"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 text-center">
                    <dt className="sr-only">{label}</dt>
                    <dd className="text-xl sm:text-2xl font-bold tracking-tight">{value}</dd>
                    <dd className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Trainer visual — fixed aspect so it never jumps while the image loads */}
            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px]">
              <div
                className="hero-in relative aspect-[4/5] rounded-[2.5rem] bg-gradient-to-br from-[#FFB547] via-[#F7931E] to-[#EF7D00] overflow-hidden shadow-2xl shadow-orange-500/20"
                style={{ "--d": 1 } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-dots opacity-30 mix-blend-overlay" />
                <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[78%] aspect-square rounded-full border-[3px] border-dashed border-white/30" />
                <div className="absolute left-1/2 bottom-[-4%] -translate-x-1/2 w-[100%] aspect-square rounded-full border-[14px] border-white/10" />
                <p
                  className="absolute top-6 left-7 text-white/90 text-3xl sm:text-4xl italic"
                  style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
                >
                  Excellence
                </p>
                <img
                  src="/sneha.webp"
                  alt="Sneha Durgkar — soft skills and business communication trainer"
                  width={600}
                  height={750}
                  fetchPriority="high"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[84%] w-auto max-w-none object-contain object-bottom"
                />
              </div>

              <div
                className="hero-pop absolute -left-3 sm:-left-8 top-[22%] rounded-2xl bg-card shadow-xl border border-border px-3.5 py-3 flex items-center gap-3"
                style={{ "--d": 5 } as React.CSSProperties}
              >
                <span className="w-9 h-9 rounded-xl bg-[#2D8CFF]/10 text-[#2D8CFF] flex items-center justify-center">
                  <Video className="w-4.5 h-4.5" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">Live on Zoom</span>
                  <span className="block text-[11px] text-muted-foreground">Interactive classes</span>
                </span>
              </div>

              <div
                className="hero-pop absolute -right-3 sm:-right-6 bottom-[14%] rounded-2xl bg-card shadow-xl border border-border px-3.5 py-3 flex items-center gap-3"
                style={{ "--d": 6 } as React.CSSProperties}
              >
                <span className="w-9 h-9 rounded-xl bg-accent text-brand-ink flex items-center justify-center">
                  <BadgeCheck className="w-4.5 h-4.5" aria-hidden="true" />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">Sneha Durgkar</span>
                  <span className="block text-[11px] text-muted-foreground">Certified trainer</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Training areas band ── */}
        <section aria-label="Training areas" className="bg-foreground text-background">
          <div className="container-site py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium">
            {trainingAreas.map((area, i) => (
              <span key={area} className="flex items-center gap-6 text-background/85">
                {i > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />}
                {area}
              </span>
            ))}
          </div>
        </section>

        {/* ── Programs ── */}
        <section id="programs" className="py-16 md:py-24">
          <div className="container-site">
            <SectionHeading
              eyebrow="Our Programs"
              title="Live online training built around your goals"
              description="Choose a program, register with your details, and we'll personally guide you from enrolment to your first live class."
            />

            {/* No reveal animation on service cards — they must be visible the
                instant the page opens, and live data swaps in silently. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {services.map((service) => {
                const ServiceIcon = serviceIcon(service.title)
                // An offer counts as applied if the admin set a label or a discounted price.
                // Pricing itself is never shown on the card — students learn it on the call.
                const offerActive =
                  service.offerLabel.trim() !== "" ||
                  (service.offerPrice !== null && service.offerPrice < service.price)
                return (
                  <article
                    key={service.id}
                    id={`service-${service.id}`}
                    className="group relative bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-[#F5A623]/50 transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-[#FFB547] to-[#EF7D00]" />
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFB547] to-[#EF7D00] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                          <ServiceIcon className="w-7 h-7" aria-hidden="true" />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {offerActive && (
                            <span className="text-xs font-bold bg-[#16a34a] text-white rounded-full px-3 py-1.5 whitespace-nowrap">
                              {service.offerLabel || "Special Offer"}
                            </span>
                          )}
                          {service.duration && (
                            <span className="text-xs font-semibold text-foreground/75 bg-muted rounded-full px-3 py-1.5 whitespace-nowrap">
                              {service.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold tracking-tight mb-2">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="rounded-2xl bg-muted/70 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                            Daily group class
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            {formatTime12(service.classStart)} – {formatTime12(service.classEnd)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-muted/70 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <UserRound className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                            One-on-one session
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            {formatTime12(service.oneOnOneStart)} – {formatTime12(service.oneOnOneEnd)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        What you'll achieve
                      </p>
                      <ul className="space-y-2.5 mb-7 flex-1">
                        {service.objectives.map((objective) => (
                          <li key={objective} className="flex items-start gap-3 text-[15px]">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent text-brand-ink flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                            </span>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-6 border-t border-border">
                        {service.certificateProvided ? (
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                            <Award className="w-4 h-4" aria-hidden="true" />
                            Certificate on completion
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Laptop className="w-4 h-4" aria-hidden="true" />
                            100% live online
                          </span>
                        )}
                        <Button
                          onClick={() => openEnroll(service)}
                          className="sm:ml-auto h-12 px-7 rounded-full bg-foreground text-background hover:bg-primary font-semibold transition-colors"
                        >
                          Enroll Now
                          <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Why choose us ── */}
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container-site">
            <SectionHeading eyebrow="Why Eleva" title="Learning that actually changes how you work" center />
            <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-border bg-background p-6 md:p-7 hover:border-[#F5A623]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-accent text-brand-ink flex items-center justify-center mb-5">
                    <feature.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Meet your trainer ── */}
        <section className="py-16 md:py-24">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
              <div className="reveal relative mx-auto w-full max-w-[380px]">
                <div className="absolute -inset-3 rounded-[2.75rem] bg-dots opacity-70" aria-hidden="true" />
                <div className="relative aspect-[5/6] rounded-[2.5rem] bg-gradient-to-br from-[#FFB547] to-[#EF7D00] overflow-hidden">
                  <img
                    src="/sneha.webp"
                    alt="Sneha Durgkar"
                    loading="lazy"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[90%] w-auto max-w-none object-contain"
                  />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl bg-foreground text-background px-5 py-3 shadow-xl">
                  <p className="text-xl font-bold leading-none">
                    10+ <span className="text-sm font-medium text-background/70">years in education</span>
                  </p>
                </div>
              </div>

              <div className="reveal space-y-6">
                <div>
                  <p className="eyebrow mb-3">Meet Your Trainer</p>
                  <h2 className="text-3xl md:text-[2.6rem] font-bold tracking-tight">Sneha Durgkar</h2>
                  <p className="text-muted-foreground mt-2">Founder & Lead Trainer, Eleva Academy</p>
                </div>
                <p className="text-foreground/80 leading-relaxed md:text-lg">
                  With over 8 years of training experience and a background that combines management, communication
                  and HR, Sneha knows exactly what organisations look for — and how to prepare you for it. Her classes
                  are practical, interactive and built around real workplace situations.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Diploma in Teaching Soft Skills & Business Communication",
                    "Certification in Human Resources — University of Minnesota",
                    "Bachelor's in Commerce — MIT Pune",
                    "8+ years of training experience",
                  ].map((credential) => (
                    <li
                      key={credential}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-medium"
                    >
                      <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                      {credential}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-full border border-border bg-card text-sm font-semibold hover:border-foreground/30 transition-colors"
                >
                  Read her full story
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="py-16 md:py-24 bg-card border-y border-border">
          <div className="container-site">
            <SectionHeading eyebrow="How It Works" title="From enrolment to your first live class" center />
            <ol className="reveal-group relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              <div
                className="hidden md:block absolute top-8 left-[16%] right-[16%] border-t-2 border-dashed border-border"
                aria-hidden="true"
              />
              {steps.map((step) => (
                <li key={step.number} className="relative text-center px-2">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center ring-4 ring-card">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-16 md:py-24">
          <div className="container-site">
            <SectionHeading eyebrow="Student Stories" title="What learners say about the classes" center />
            <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="rounded-3xl border border-border bg-card p-6 md:p-7 flex flex-col shadow-sm"
                >
                  <Quote className="w-8 h-8 text-primary/80 mb-4" aria-hidden="true" />
                  <blockquote className="text-[15px] leading-relaxed flex-1 text-foreground/85">
                    "{testimonial.quote}"
                  </blockquote>
                  <figcaption className="mt-6 pt-5 border-t border-border flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-full bg-accent text-brand-ink font-bold flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {testimonial.name.charAt(0)}
                    </span>
                    <span>
                      <span className="block font-semibold text-sm">{testimonial.name}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{testimonial.role}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="pb-16 md:pb-24">
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16 rounded-3xl border border-border bg-card p-6 md:p-12">
              <div className="reveal">
                <p className="eyebrow mb-3">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Common questions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Still have a question? Reach out through the{" "}
                  <Link href="/contact" className="font-semibold text-brand-ink hover:underline underline-offset-4">
                    contact page
                  </Link>{" "}
                  — we reply within 24 hours.
                </p>
              </div>
              <Accordion type="single" collapsible className="reveal w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border">
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-16 md:pb-24">
          <div className="container-site">
            <div className="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FFB547] via-[#F7931E] to-[#EF7D00] px-6 py-12 md:p-16 text-center">
              <div className="absolute inset-0 bg-dots opacity-25 mix-blend-overlay" aria-hidden="true" />
              <div className="relative max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white text-balance">
                  Your career deserves excellent communication
                </h2>
                <p className="mt-5 text-white/90 leading-relaxed md:text-lg">
                  Register for a program and experience how the right training can transform your confidence — we'll
                  guide you personally at every step.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="#programs"
                    className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-foreground text-white font-semibold hover:bg-black transition-colors"
                  >
                    Explore Programs & Enroll
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  {tel && (
                    <a
                      href={tel}
                      className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-white/15 text-white font-semibold border border-white/40 hover:bg-white/25 transition-colors"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                      {contact.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} serviceTitles={services.map((s) => s.title)} />

      {/* Enrolment Dialog */}
      <Dialog open={enrollService !== null} onOpenChange={(open) => !open && setEnrollService(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          {result?.ok ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-green-500/15 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Registration received!</DialogTitle>
                <DialogDescription className="text-center leading-relaxed">
                  Our team will contact you soon for confirmation — after that you can access your{" "}
                  <Link href="/dashboard" className="font-medium text-brand-ink hover:underline">
                    dashboard
                  </Link>
                  . Please remember the email and password you used while registering — you'll need them to login.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => setEnrollService(null)} className="w-full h-11 font-semibold">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Enroll — {enrollService?.title}</DialogTitle>
                <DialogDescription>
                  Fill in your details to register. We'll contact you personally to confirm your batch and payment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label htmlFor="enroll-name" className="block text-sm font-medium mb-1.5">
                    Full name *
                  </label>
                  <Input
                    id="enroll-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="enroll-phone" className="block text-sm font-medium mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <Input
                    id="enroll-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="enroll-email" className="block text-sm font-medium mb-1.5">
                    Email *
                  </label>
                  <Input
                    id="enroll-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-11"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="enroll-password" className="block text-sm font-medium mb-1.5">
                    Create a password *
                  </label>
                  <Input
                    id="enroll-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-11"
                    required
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    You'll use this email and password to login to your student dashboard.
                  </p>
                </div>
                <div>
                  <label htmlFor="enroll-message" className="block text-sm font-medium mb-1.5">
                    Anything you'd like us to know?{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="enroll-message"
                    rows={3}
                    placeholder="e.g. I need IELTS Band 7 by December…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
                {result && !result.ok && (
                  <p className="text-sm text-destructive" role="alert">
                    {result.message}
                  </p>
                )}
                <Button type="submit" disabled={submitting} className="w-full h-12 rounded-xl font-semibold">
                  {submitting ? "Registering…" : "Register"}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
