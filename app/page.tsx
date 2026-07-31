"use client"

import {
  Search,
  ChevronRight,
  Menu,
  X,
  Globe,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
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
  LogIn,
  Clock,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { formatTime12 } from "@/lib/time"
import { DEFAULT_CONTACT, type ContactContent } from "@/lib/content"

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
    title: "Register for a service",
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
      "Click Enroll on any service and fill in your details with a password. We'll contact you personally to confirm your batch and payment. Once approved, you can login to your dashboard and join live classes.",
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

// In-memory flag: the hero entrance plays on every full page load, but not
// again when navigating back to home from another page in the same load.
let heroAnimationPlayed = false

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  // Start with fallback content so sections render instantly; live data replaces it
  const [services, setServices] = useState<Service[]>(fallbackServices)
  const [servicesLoaded, setServicesLoaded] = useState(true)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT)

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
    fetch("/api/contact", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.contact) setContact(data.contact)
      })
      .catch(() => {})
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  const socialIcons = [
    { icon: Youtube, label: "YouTube", href: contact.youtube },
    { icon: Instagram, label: "Instagram", href: contact.instagram },
    { icon: Facebook, label: "Facebook", href: contact.facebook },
    { icon: Twitter, label: "Twitter", href: contact.twitter },
  ]

  // Hero entrance — plays immediately on page load (card slides, rings spin, photo pops).
  // The section starts CSS-hidden (.hero-pending, see globals.css) so the entrance
  // begins from the first paint; we lift that class here, before the browser paints,
  // and the GSAP from-tweens take over the hidden state seamlessly.
  useLayoutEffect(() => {
    const releaseHero = () => pageRef.current?.querySelector(".hero-pending")?.classList.remove("hero-pending")
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || heroAnimationPlayed) {
      releaseHero()
      return
    }
    const ctx = gsap.context(() => {
      releaseHero()
      // Flag is set only when the timeline finishes: React 18 dev StrictMode
      // mounts effects twice, and marking it played up-front made the first
      // (immediately-reverted) run swallow the animation entirely.
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          heroAnimationPlayed = true
        },
      })
      tl.from(".hero-left > *", { y: 26, opacity: 0, stagger: 0.07, duration: 0.55 })
        .from(".hero-card", { x: 140, opacity: 0, duration: 0.7 }, "-=0.45")
        .from(
          ".hero-ring",
          { rotation: 360, opacity: 0, transformOrigin: "50% 50%", duration: 1, ease: "power2.inOut" },
          "-=0.35",
        )
        .from(".hero-photo", { y: 220, opacity: 0, scale: 0.92, duration: 0.8, ease: "back.out(1.4)" }, "-=0.65")
        .from(".hero-float", { scale: 0, opacity: 0, stagger: 0.1, duration: 0.4, ease: "back.out(2)" }, "-=0.4")
    }, pageRef)
    return () => ctx.revert()
  }, [])

  // Scroll-triggered reveals. Fail-open by design so content can never be left
  // invisible: triggers fire `once` (a later ScrollTrigger refresh can't rewind
  // a played reveal), inline styles are cleared after each reveal, and the
  // effect re-runs when live testimonials replace the fallbacks (React remounts
  // them with new ids, so tweens must re-attach to the new DOM). The service
  // cards are deliberately NOT animated — they show instantly on page open.
  // Already-revealed elements are tagged and skipped so they never re-hide.
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
            y: 40,
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
          y: 36,
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

  const query = searchQuery.trim().toLowerCase()
  const searchMatches = query
    ? services.filter(
        (s) => s.title.toLowerCase().includes(query) || s.objectives.some((o) => o.toLowerCase().includes(query)),
      )
    : []

  // Selecting a search result jumps to (and highlights) that enroll card
  const goToService = (id: string) => {
    setSearchQuery("")
    setSearchFocused(false)
    setMobileMenuOpen(false)
    document.getElementById(`service-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
    setHighlightId(id)
    setTimeout(() => setHighlightId(null), 2400)
  }

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

  const searchBox = (widthClass: string) => (
    <div className={`relative ${widthClass}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search services"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        className="pl-9 w-full bg-input/50 border-border/50"
        aria-label="Search services"
      />
      {searchFocused && query && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border/60 rounded-xl shadow-xl overflow-hidden z-[60]">
          {searchMatches.length > 0 ? (
            searchMatches.map((service) => {
              const ResultIcon = serviceIcon(service.title)
              return (
                <button
                  key={service.id}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    goToService(service.id)
                  }}
                  className="w-full text-left px-3.5 py-3 hover:bg-muted/60 transition-colors flex items-center gap-3"
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center flex-shrink-0">
                    <ResultIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium truncate">{service.title}</span>
                    <span className="block text-xs text-muted-foreground truncate">{service.duration}</span>
                  </span>
                </button>
              )
            })
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No services found for "{searchQuery}"</p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div ref={pageRef} className="min-h-screen bg-background relative overflow-hidden">
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
      {/* Decorative blob shapes */}
      <div className="blob-shape w-[600px] h-[600px] -top-48 -left-48" />
      <div className="blob-shape w-[500px] h-[500px] -bottom-32 -right-32" />
      <div className="blob-shape w-[400px] h-[400px] top-1/2 -right-48" />
      <div className="blob-shape w-[450px] h-[450px] -bottom-48 left-1/4" />

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <header className="sticky top-2 z-50 bg-card/80 backdrop-blur-md rounded-2xl p-4 mb-4 md:mb-6 border border-border/50">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center">
                <GraduationCap className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <span className="block text-sm font-bold">Eleva Academy</span>
                <span className="block text-[11px] text-muted-foreground">Center of Excellence</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#programs" className="text-sm font-medium hover:text-primary transition-colors">
                Services
              </a>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
              {searchBox("w-56 lg:w-64")}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-foreground text-background rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Login
              </Link>
            </nav>
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden flex flex-col gap-4 mt-4 pt-4 border-t border-border/50">
              {searchBox("w-full")}
              <a
                href="#programs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium hover:text-primary transition-colors py-1"
              >
                Services
              </a>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors py-1">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors py-1">
                Contact
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold bg-foreground text-background rounded-xl px-4 py-2.5"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Login to Dashboard
              </Link>
            </nav>
          )}
        </header>

        {/* Hero Section */}
        <section className="hero-pending relative bg-card/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 lg:p-16 mb-4 md:mb-6 border border-border/50 overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="hero-left space-y-8">
              {/* Main Heading */}
              <div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-none tracking-tight">
                  <span className="block">eleva</span>
                  <span className="block">academy</span>
                </h1>
                <p className="mt-4 text-sm md:text-base font-semibold uppercase tracking-[0.25em] text-[#E8890C]">
                  Center of Excellence
                </p>
              </div>

              {/* Subtitle */}
              <p className="text-base md:text-lg max-w-md leading-relaxed text-foreground/80">
                Master soft skills, business communication and IELTS/TOEFL through live online classes with Sneha
                Durgkar — and let your confidence speak for you
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {socialIcons.map(({ icon: SocialIcon, label, href }) => (
                  <a
                    key={label}
                    href={href || "#"}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noopener noreferrer" : undefined}
                    className="w-12 h-12 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-foreground/40 hover:bg-muted/50 transition-all"
                    aria-label={label}
                  >
                    <SocialIcon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">8+</div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Years of experience training students, job seekers and working professionals
                  </p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Live online classes with personal attention — learn from anywhere
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Orange Card */}
            <div className="relative">
              <div className="hero-card relative bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-[3rem] p-8 md:p-10 w-full lg:w-[420px] xl:w-[480px] aspect-[4/5] overflow-hidden">
                {/* Globe Icon */}
                <div className="hero-float absolute top-6 right-6 w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>

                {/* Signature Text */}
                <div className="absolute top-8 left-8 right-20">
                  <svg viewBox="0 0 300 80" className="w-full max-w-[220px]">
                    <text
                      x="10"
                      y="50"
                      fill="white"
                      fontSize="48"
                      fontFamily="'Brush Script MT', cursive"
                      style={{ fontStyle: "italic" }}
                    >
                      Excellence
                    </text>
                  </svg>
                </div>

                {/* Trainer photo with rotating rings */}
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64 h-64 md:w-72 md:h-72">
                    <div className="hero-ring w-full h-full rounded-full border-[6px] border-dashed border-white/25" />
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[330px] h-[330px] md:w-[380px] md:h-[380px]">
                    <div className="hero-ring w-full h-full rounded-full border-[10px] border-white/10" />
                  </div>

                  <img
                    src="/sneha.webp"
                    alt="Sneha Durgkar — soft skills and business communication trainer"
                    className="hero-photo relative max-h-[78%] w-auto object-contain object-bottom"
                  />
                </div>

                {/* Scattered icons */}
                <div className="hero-float absolute left-6 top-32 w-12 h-12 rounded-full bg-[#FFB84D] flex items-center justify-center border-2 border-white/20">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div className="hero-float absolute left-6 bottom-6 w-12 h-12 rounded-full bg-[#FFB84D] overflow-hidden border-2 border-white/20">
                  <img src="/diverse-group.webp" alt="Learners" className="w-full h-full object-cover" />
                </div>
                <div className="hero-float absolute right-6 bottom-6 w-12 h-12 rounded-full bg-black flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-white rotate-45" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="programs"
          className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50"
        >
          <div className="reveal max-w-2xl mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Live online training built for your goals
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Choose a service, register with your details, and we'll personally guide you from enrolment to your
              first live class.
            </p>
          </div>

          {!servicesLoaded ? (
            <div className="p-10 text-center text-muted-foreground">Loading services…</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
              {/* No reveal animation on service cards — they must be visible the
                  instant the page opens, and live data swaps in silently. */}
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
                    className={`group bg-background/60 rounded-2xl p-6 md:p-7 border flex flex-col transition-all hover:border-[#F5A623]/60 hover:shadow-lg ${
                      highlightId === service.id
                        ? "border-[#FF8C00] ring-2 ring-[#FF8C00]/60 shadow-xl"
                        : "border-border/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center">
                        <ServiceIcon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {offerActive && (
                          <span className="text-xs font-bold bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white rounded-full px-3 py-1.5 whitespace-nowrap">
                            {service.offerLabel || "Special Offer"}
                          </span>
                        )}
                        {service.duration && (
                          <span className="text-xs font-medium text-muted-foreground bg-muted/60 rounded-full px-3 py-1.5 whitespace-nowrap">
                            {service.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-1.5">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>

                    {/* General features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/60 rounded-full px-3 py-1.5">
                        <Users className="w-3.5 h-3.5 text-[#E8890C]" aria-hidden="true" />
                        Daily Group Classes
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted/60 rounded-full px-3 py-1.5">
                        <UserRound className="w-3.5 h-3.5 text-[#E8890C]" aria-hidden="true" />
                        One-on-One Session
                      </span>
                      {service.certificateProvided && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45D00] bg-[#F5A623]/15 border border-[#F5A623]/40 rounded-full px-3 py-1.5">
                          <Award className="w-3.5 h-3.5 text-[#E8890C]" aria-hidden="true" />
                          Certificate Provided
                        </span>
                      )}
                    </div>

                    {/* Timings */}
                    <div className="space-y-1.5 mb-4 text-sm">
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                        Classes: {formatTime12(service.classStart)} – {formatTime12(service.classEnd)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#E8890C]" aria-hidden="true" />
                        One-on-One: {formatTime12(service.oneOnOneStart)} – {formatTime12(service.oneOnOneEnd)}
                      </p>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      What you'll achieve
                    </p>
                    <ul className="space-y-2 mb-5 flex-1">
                      {service.objectives.map((objective) => (
                        <li key={objective} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 mt-0.5 text-[#E8890C] flex-shrink-0" aria-hidden="true" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => openEnroll(service)}
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl h-11 font-semibold"
                    >
                      Enroll Now
                      <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                    </Button>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Why Choose Us */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50">
          <div className="reveal max-w-2xl mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Learning that actually changes how you work
            </h2>
          </div>
          <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="bg-background/60 rounded-2xl p-6 border border-border/50">
                <div className="w-12 h-12 rounded-xl bg-primary/60 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Meet Your Trainer */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">
            <div className="reveal relative mx-auto lg:mx-0">
              <div className="relative w-64 h-72 md:w-72 md:h-80 bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-[2.5rem] overflow-hidden">
                <img
                  src="/sneha.webp"
                  alt="Sneha Durgkar"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 max-h-[88%] w-auto object-contain"
                />
              </div>
            </div>
            <div className="reveal space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">
                  Meet Your Trainer
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Sneha Durgkar</h2>
                <p className="text-muted-foreground mt-1">Founder & Lead Trainer, Eleva Academy</p>
              </div>
              <p className="text-foreground/80 leading-relaxed max-w-2xl">
                With over 8 years of training experience and a background that combines management, communication and
                HR, Sneha knows exactly what organisations look for — and how to prepare you for it. Her classes are
                practical, interactive and built around real workplace situations.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                {[
                  "Diploma in Soft Skills & Business Communication",
                  "Diploma in Human Resource",
                  "Post Graduation in Business Management",
                  "8+ years of training experience",
                ].map((credential) => (
                  <li key={credential} className="flex items-center gap-2.5 text-sm">
                    <BadgeCheck className="w-5 h-5 text-[#E8890C] flex-shrink-0" aria-hidden="true" />
                    {credential}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E8890C] hover:gap-2.5 transition-all"
              >
                Read her full story
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50">
          <div className="reveal max-w-2xl mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From enrolment to your first live class</h2>
          </div>
          <ol className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {steps.map((step) => (
              <li key={step.number} className="bg-background/60 rounded-2xl p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/60 flex items-center justify-center">
                    <step.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-4xl font-bold text-foreground/10 select-none" aria-hidden="true">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Testimonials */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50">
          <div className="reveal max-w-2xl mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">Student Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What learners say about the classes</h2>
          </div>
          <div className="reveal-group grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="bg-background/60 rounded-2xl p-6 border border-border/50 flex flex-col"
              >
                <Quote className="w-7 h-7 text-[#F5A623] mb-3" aria-hidden="true" />
                <blockquote className="text-sm leading-relaxed flex-1">"{testimonial.quote}"</blockquote>
                <figcaption className="mt-4 pt-4 border-t border-border/50">
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{testimonial.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 lg:p-12 mb-4 md:mb-6 border border-border/50">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
            <div className="reveal">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#E8890C] mb-2">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Common questions</h2>
              <p className="text-muted-foreground leading-relaxed">
                Still have a question? Reach out through the{" "}
                <Link href="/contact" className="font-medium text-[#E8890C] hover:underline underline-offset-4">
                  contact page
                </Link>{" "}
                — we reply within 24 hours.
              </p>
            </div>
            <Accordion type="single" collapsible className="reveal w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border/50">
                  <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="reveal relative overflow-hidden bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-3xl p-8 md:p-14 mb-4 md:mb-6 text-center">
          <div className="max-w-2xl mx-auto space-y-5">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white text-balance">
              Your career deserves excellent communication
            </h2>
            <p className="text-white/85 leading-relaxed">
              Register for a service and experience how the right training can transform your confidence — we'll guide
              you personally at every step.
            </p>
            <a
              href="#programs"
              className="inline-flex items-center gap-2 bg-black text-white rounded-full px-8 py-4 text-sm md:text-base font-semibold hover:bg-black/85 transition-colors"
            >
              Explore Services & Enroll
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <span className="block text-sm font-bold">Eleva Academy</span>
                  <span className="block text-[11px] text-muted-foreground">Center of Excellence</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Online soft skills, business communication and IELTS/TOEFL training led by Sneha Durgkar — helping
                students and professionals communicate with confidence and grow their careers.
              </p>
              <div className="flex items-center gap-2">
                {socialIcons.map(({ icon: SocialIcon, label, href }) => (
                  <a
                    key={label}
                    href={href || "#"}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noopener noreferrer" : undefined}
                    className="w-10 h-10 rounded-full border-2 border-foreground/15 flex items-center justify-center hover:border-foreground/40 hover:bg-muted/50 transition-all"
                    aria-label={label}
                  >
                    <SocialIcon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <nav aria-label="Footer links" className="space-y-3">
              <p className="text-sm font-semibold">Quick Links</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#programs" className="hover:text-foreground transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About the Trainer
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Student Login
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Our Services</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(services.length > 0 ? services.map((s) => s.title) : fallbackServices.map((s) => s.title)).map(
                  (title) => (
                    <li key={title}>{title}</li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Eleva Academy. All rights reserved.</p>
            <p>Live online classes · Learn from anywhere</p>
          </div>
        </footer>
      </div>

      {/* Enrolment Dialog */}
      <Dialog open={enrollService !== null} onOpenChange={(open) => !open && setEnrollService(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          {result?.ok ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-primary/40 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-7 w-7" aria-hidden="true" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Registration received!</DialogTitle>
                <DialogDescription className="text-center leading-relaxed">
                  Our team will contact you soon for confirmation — after that you can access your{" "}
                  <Link href="/dashboard" className="font-medium text-[#E8890C] hover:underline">
                    dashboard
                  </Link>
                  . Please remember the email and password you used while registering — you'll need them to login.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => setEnrollService(null)} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Enroll — {enrollService?.title}</DialogTitle>
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
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
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
                    className="w-full px-3 py-2 bg-input/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                {result && !result.ok && (
                  <p className="text-sm text-destructive" role="alert">
                    {result.message}
                  </p>
                )}
                <Button type="submit" disabled={submitting} className="w-full h-11 font-semibold">
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
