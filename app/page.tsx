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
  Briefcase,
  Compass,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { formatTime12 } from "@/lib/time"
import { whatsappLink, type Testimonial } from "@/lib/content"
import { SITE_URL } from "@/lib/site"
import { fallbackServices, programHref, programKind, type Service } from "@/lib/programs"
import { DEMO_HREF, SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { useContact } from "@/components/site/use-contact"
import { EnrollDialog } from "@/components/site/enroll-dialog"
import { WhatsAppButton } from "@/components/site/whatsapp-button"

const serviceIcon = (title: string): LucideIcon => {
  const kind = programKind(title)
  if (kind === "exam") return BookOpen
  if (kind === "communication") return Sparkles
  return Star
}

const audiences = [
  {
    icon: GraduationCap,
    title: "College students",
    description: "Build the confidence to speak up in class, group discussions and placement interviews.",
  },
  {
    icon: Compass,
    title: "Fresh graduates",
    description: "Prepare for interviews and learn how to communicate professionally from your very first job.",
  },
  {
    icon: Briefcase,
    title: "Working professionals",
    description: "Speak, write and present with more clarity in meetings, emails and client conversations.",
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
    title: "Qualified Trainer",
    description: "Learn from a trainer with a PGDM and formal qualifications in soft skills, business communication and HR.",
  },
  {
    icon: UserRound,
    title: "Personal One-on-One",
    description: "Alongside group classes, every learner gets a personal session for individual feedback.",
  },
  {
    icon: Laptop,
    title: "Learn from Anywhere",
    description: "All you need is an internet connection — join from home, college or office on any device.",
  },
]

const steps = [
  { icon: Compass, title: "Explore a program", description: "See what each program covers and who it's for." },
  {
    icon: CalendarCheck,
    title: "Book a free demo",
    description: "Request a free demo or counselling call at a time that suits you.",
  },
  {
    icon: MessageCircle,
    title: "Discuss your goals",
    description: "We talk through your learning goals, batch options and fees personally.",
  },
  {
    icon: ClipboardCheck,
    title: "Complete enrolment",
    description: "Register online and we confirm your batch and payment with you directly.",
  },
  {
    icon: GraduationCap,
    title: "Learn & track progress",
    description: "Join live classes and see attendance, materials and certificates in your dashboard.",
  },
]

const faqs = [
  {
    question: "Is the demo really free?",
    answer:
      "Yes. Book a free demo or counselling call and we'll talk through your goals and the right program for you — there's no obligation to enrol.",
  },
  {
    question: "Are the classes really live?",
    answer:
      "Yes. Every session is conducted live on Zoom by Sneha Durgkar, with interaction, practice activities and personal feedback — not pre-recorded videos.",
  },
  {
    question: "How does enrolment work?",
    answer:
      "Book a free demo or click Enroll on a program and fill in your details. We contact you personally to confirm your batch and payment. Once approved, you login to your student dashboard to join live classes.",
  },
  {
    question: "How much does a program cost?",
    answer:
      "Fees depend on the program and batch. We share the current fee and any running offer with you personally on your demo or counselling call.",
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
  // Programs start with the built-in copy so the section renders instantly; live data replaces it.
  // Testimonials are only ever the ones saved by the admin — nothing is shown until they load.
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [enrollService, setEnrollService] = useState<Service | null>(null)
  const contact = useContact()

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
  // effect re-runs when testimonials load (new DOM to attach to). The service
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

  const wa = whatsappLink(contact.phone, "Hi Eleva Academy, I'd like to book a free demo.")

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
                url: `${SITE_URL}${programHref(service)}`,
                provider: { "@type": "EducationalOrganization", name: "Eleva Academy" },
                hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online" },
              },
            })),
          }),
        }}
      />

      {/* FAQ structured data — mirrors the visible FAQ section */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
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

          <div className="container-site relative grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 lg:gap-10 items-center pt-6 pb-14 md:pt-8 md:pb-20">
            <div className="text-center lg:text-left">
              <h1
                className="hero-in text-[2.5rem] leading-[1.08] sm:text-6xl lg:text-[4rem] font-bold tracking-tight text-balance"
                style={{ "--d": 0 } as React.CSSProperties}
              >
                Build Confidence. Master Communication.{" "}
                <span className="relative whitespace-nowrap text-primary">
                  Elevate
                  <svg
                    viewBox="0 0 120 12"
                    className="absolute left-0 -bottom-1.5 w-full h-3 text-[#FFC27A]"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M2 9 C 30 2, 90 2, 118 8" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                Your Career.
              </h1>

              <p
                className="hero-in mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
                style={{ "--d": 2 } as React.CSSProperties}
              >
                Practical live online training for students and professionals who want to communicate confidently,
                perform better in interviews, and succeed in the workplace.
              </p>

              <div
                className="hero-in mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                style={{ "--d": 3 } as React.CSSProperties}
              >
                <Link
                  href={DEMO_HREF}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#de7200] transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                  Book a Free Demo
                </Link>
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-border bg-card font-semibold hover:border-foreground/30 transition-colors"
                >
                  Explore Programs
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              <dl
                className="hero-in mt-10 grid grid-cols-3 max-w-lg mx-auto lg:mx-0 divide-x divide-border rounded-2xl border border-border bg-card/80 py-4 shadow-sm"
                style={{ "--d": 4 } as React.CSSProperties}
              >
                {[
                  ["8+ yrs", "Training experience"],
                  ["Live", "Online classes"],
                  ["1:1", "Personal session"],
                ].map(([value, label]) => (
                  <div key={label} className="px-3 text-center flex flex-col-reverse">
                    <dt className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{label}</dt>
                    <dd className="text-xl sm:text-2xl font-bold tracking-tight">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Trainer visual — fixed aspect so it never jumps while the image loads */}
            <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[460px]">
              <div
                className="hero-in relative aspect-[4/5] rounded-[2.5rem] bg-gradient-to-br from-[#FFB547] via-[#F7931E] to-[#EF7D00] overflow-hidden shadow-2xl shadow-orange-500/20"
                style={{ "--d": 1 } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-dots opacity-30 mix-blend-overlay" />
                <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[78%] aspect-square rounded-full border-[3px] border-dashed border-white/30" />
                <div className="absolute left-1/2 bottom-[-4%] -translate-x-1/2 w-[100%] aspect-square rounded-full border-[14px] border-white/10" />
                <img
                  src="/sneha.webp"
                  alt="Sneha Durgkar, founder and lead trainer of Eleva Academy"
                  width={600}
                  height={750}
                  fetchPriority="high"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[86%] w-auto max-w-none object-contain object-bottom"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />
                <p className="absolute left-6 bottom-5 text-white text-lg sm:text-xl font-semibold tracking-tight [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                  Sneha Durgkar
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── Who it's for ── */}
        <section aria-labelledby="audience-heading" className="bg-foreground text-background">
          <div className="container-site py-12 md:py-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 md:mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary mb-2">Who it's for</p>
                <h2 id="audience-heading" className="text-2xl md:text-3xl font-bold tracking-tight">
                  Training for every stage of your career
                </h2>
              </div>
              <p className="text-background/65 max-w-md">
                Whether you're in college, just graduated or already working — the programs meet you where you are.
              </p>
            </div>
            <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-4">
              {audiences.map((audience) => (
                <div key={audience.title} className="rounded-2xl bg-white/[0.06] border border-white/10 p-6">
                  <audience.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold">{audience.title}</h3>
                  <p className="mt-1.5 text-sm text-background/65 leading-relaxed">{audience.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Programs ── */}
        <section id="programs" className="py-16 md:py-24">
          <div className="container-site">
            <SectionHeading
              eyebrow="Our Programs"
              title="Live online training built around your goals"
              description="Choose a program to see everything it covers — or book a free demo and we'll help you decide."
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
                    className="group relative bg-card rounded-3xl border border-border shadow-sm hover:shadow-xl hover:border-[#F5A623]/50 transition-all duration-300 flex flex-col overflow-hidden"
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

                      <h3 className="text-2xl font-bold tracking-tight mb-2">
                        <Link href={programHref(service)} className="hover:text-brand-ink transition-colors">
                          {service.title}
                        </Link>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="rounded-2xl bg-muted/70 p-4">
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            <Users className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                            Group classes
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
                        <Link
                          href={programHref(service)}
                          className="inline-flex items-center justify-center gap-1.5 h-12 px-5 rounded-full border border-border font-semibold text-sm hover:border-foreground/30 transition-colors"
                        >
                          View full details
                          <span className="sr-only"> of {service.title}</span>
                        </Link>
                        {service.certificateProvided && (
                          <span className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-brand-ink">
                            <Award className="w-4 h-4" aria-hidden="true" />
                            Certificate
                          </span>
                        )}
                        <Button
                          onClick={() => setEnrollService(service)}
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
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
              <div className="reveal relative mx-auto w-full max-w-[340px] sm:max-w-[380px]">
                <div className="absolute -inset-3 rounded-[2.75rem] bg-dots opacity-70" aria-hidden="true" />
                <div className="relative aspect-[5/6] rounded-[2.5rem] bg-gradient-to-br from-[#FFB547] to-[#EF7D00] overflow-hidden">
                  <img
                    src="/sneha.webp"
                    alt="Sneha Durgkar, communication and soft skills trainer"
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
                  With more than 10 years in education — including 8+ years of training — and a background that
                  combines business management, communication and HR, Sneha knows what organisations look for and how
                  to prepare you for it. Her classes are practical, interactive and built around real workplace
                  situations.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Post Graduation in Business Management (PGDM)",
                    "Diploma in Teaching Soft Skills & Business Communication",
                    "Certification in Human Resources — University of Minnesota",
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
            <SectionHeading eyebrow="How It Works" title="From your first question to your first class" center />
            <ol className="reveal-group relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
              <div
                className="hidden lg:block absolute top-8 left-[10%] right-[10%] border-t-2 border-dashed border-border"
                aria-hidden="true"
              />
              {steps.map((step, index) => (
                <li key={step.title} className="relative text-center px-2">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg">
                    <step.icon className="w-7 h-7" aria-hidden="true" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center ring-4 ring-card">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-[15rem] mx-auto">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-12 text-center">
              <Link
                href={DEMO_HREF}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-white font-semibold hover:bg-[#de7200] transition-colors"
              >
                <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                Start with a Free Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials (only real, admin-approved stories) ── */}
        {testimonials.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container-site">
              <SectionHeading eyebrow="Student Stories" title="What learners say about the classes" center />
              <div className="reveal-group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        {testimonial.role && (
                          <span className="block text-xs text-muted-foreground mt-0.5">{testimonial.role}</span>
                        )}
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section className={testimonials.length > 0 ? "pb-16 md:pb-24" : "py-16 md:py-24"}>
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-16 rounded-3xl border border-border bg-card p-6 md:p-12">
              <div className="reveal">
                <p className="eyebrow mb-3">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Common questions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Still have a question?{" "}
                  <Link
                    href="/contact?type=enquiry#enquiry"
                    className="font-semibold text-brand-ink hover:underline underline-offset-4"
                  >
                    Send us an enquiry
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
            <div className="reveal relative overflow-hidden rounded-[2rem] bg-foreground px-6 py-12 md:p-16 text-center">
              <div
                className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-primary/35 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white text-balance">
                  Ready to speak with confidence?
                </h2>
                <p className="mt-5 text-white/75 leading-relaxed md:text-lg">
                  Book a free demo and we'll understand your goals, explain the right program and answer every
                  question — personally.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href={DEMO_HREF}
                    className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-white font-semibold hover:bg-[#de7200] transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                    Book a Free Demo
                  </Link>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-white/10 text-white font-semibold border border-white/25 hover:bg-white/20 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} programs={services} />
      <WhatsAppButton phone={contact.phone} />
      <EnrollDialog service={enrollService} onClose={() => setEnrollService(null)} />
    </div>
  )
}
