import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Award,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  Laptop,
  MessageCircle,
  Timer,
  UserRound,
  Users,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { WhatsAppButton } from "@/components/site/whatsapp-button"
import { ProgramEnrollButton } from "@/components/site/program-enroll-button"
import { getPublicContact, getPublicServices } from "@/lib/public-data"
import { findProgramBySlug, programDetails, programHref, programKind } from "@/lib/programs"
import { formatTime12 } from "@/lib/time"
import { whatsappLink } from "@/lib/content"
import { SHARE_IMAGE, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"

const siteUrl = SITE_URL

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = findProgramBySlug(await getPublicServices(), params.slug)
  if (!service) return { title: "Program not found", robots: { index: false } }
  // Keep within ~155 characters so search results show it in full
  const full = `${service.description} Live online with Sneha Durgkar.`
  const description = full.length <= 155 ? full : `${full.slice(0, 152).replace(/\s+\S*$/, "")}…`
  return {
    title: `${service.title} Online`,
    description,
    alternates: { canonical: programHref(service) },
    openGraph: { title: `${service.title} | Eleva Academy`, description, url: programHref(service), images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: `${service.title} | Eleva Academy`, description, images: [SHARE_IMAGE.url] },
  }
}

export default async function ProgramPage({ params }: { params: { slug: string } }) {
  const [services, contact] = await Promise.all([getPublicServices(), getPublicContact()])
  const service = findProgramBySlug(services, params.slug)
  if (!service) notFound()

  const details = programDetails[programKind(service.title)]
  const demoHref = `/contact?program=${encodeURIComponent(service.title)}#enquiry`
  const askHref = `/contact?type=enquiry&program=${encodeURIComponent(service.title)}#enquiry`
  const wa = whatsappLink(contact.phone, `Hi Eleva Academy, I'm interested in the ${service.title} program.`)
  const otherPrograms = services.filter((s) => s.id !== service.id)

  const facts = [
    { icon: Timer, label: "Duration", value: service.duration || "Shared on your demo call" },
    { icon: Laptop, label: "Class format", value: "Live online on Zoom" },
    {
      icon: Users,
      label: "Group classes",
      value: `${formatTime12(service.classStart)} – ${formatTime12(service.classEnd)}`,
    },
    {
      icon: UserRound,
      label: "One-on-one session",
      value: `${formatTime12(service.oneOnOneStart)} – ${formatTime12(service.oneOnOneEnd)}`,
    },
    { icon: IndianRupee, label: "Course fee", value: "Shared personally on your demo call" },
    ...(service.certificateProvided ? [{ icon: Award, label: "Certificate", value: "Certificate on completion" }] : []),
  ]

  const faqs = [
    {
      q: "Can I attend a free demo before enrolling?",
      a: "Yes. Book a free demo and we'll explain the program, understand your goals and answer your questions — with no obligation to enrol.",
    },
    {
      q: "Are the batch timings fixed?",
      a: "The timings shown are the current batch timings. We confirm the exact batch that suits you on your demo or counselling call.",
    },
    {
      q: "How much does the program cost?",
      a: "We share the current fee and any running offer with you personally on your demo call, along with the batch options.",
    },
    {
      q: "What if I miss a class?",
      a: "Let your trainer know — your one-on-one session is the place to catch up on anything you missed and get individual guidance.",
    },
  ]

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: service.title,
    description: service.description,
    url: `${siteUrl}${programHref(service)}`,
    provider: { "@type": "EducationalOrganization", "@id": `${siteUrl}/#organization`, name: "Eleva Academy", url: siteUrl },
    inLanguage: "en",
    teaches: service.objectives,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      instructor: { "@type": "Person", name: "Sneha Durgkar" },
    },
  }

  const pageJsonLd = [
    courseJsonLd,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Programs", item: `${siteUrl}/#programs` },
        { "@type": "ListItem", position: 3, name: service.title, item: `${siteUrl}${programHref(service)}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
      <SiteHeader active="programs" phone={contact.phone} />

      <main>
        {/* Program hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-site relative pt-8 pb-12 md:pt-12 md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                <li>
                  <Link href="/#programs" className="hover:text-foreground">
                    Programs
                  </Link>
                </li>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                <li aria-current="page" className="text-foreground font-medium truncate">
                  {service.title}
                </li>
              </ol>
            </nav>
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold bg-accent text-brand-ink rounded-full px-3 py-1.5">
                  Live online program
                </span>
                {service.duration && (
                  <span className="text-xs font-semibold bg-card border border-border rounded-full px-3 py-1.5">
                    {service.duration}
                  </span>
                )}
                {service.offerLabel && (
                  <span className="text-xs font-bold bg-[#16a34a] text-white rounded-full px-3 py-1.5">
                    {service.offerLabel}
                  </span>
                )}
              </div>
              <h1 className="hero-in text-4xl md:text-6xl font-bold tracking-tight text-balance">{service.title}</h1>
              <p className="hero-in mt-5 text-lg text-muted-foreground leading-relaxed" style={{ ["--d" as string]: 1 }}>
                {service.description}
              </p>
              <div className="hero-in mt-8 flex flex-col sm:flex-row gap-3" style={{ ["--d" as string]: 2 }}>
                <Link
                  href={demoHref}
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-primary text-white font-semibold shadow-lg shadow-orange-500/25 hover:bg-[#de7200] transition-colors"
                >
                  <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                  Book a Free Demo
                </Link>
                <ProgramEnrollButton service={{ id: service.id, title: service.title }} />
              </div>
            </div>
          </div>
        </section>

        <div className="container-site py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-12 items-start">
          <div className="space-y-12 min-w-0">
            {/* Who it's for */}
            <section aria-labelledby="audience">
              <h2 id="audience" className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
                Who this program is for
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {details.audience.map((item) => (
                  <li key={item} className="rounded-2xl border border-border bg-card p-5 text-sm font-medium leading-relaxed">
                    <Users className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Outcomes */}
            {service.objectives.length > 0 && (
              <section aria-labelledby="outcomes">
                <h2 id="outcomes" className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
                  What you'll achieve
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {service.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-3 rounded-2xl bg-card border border-border p-4">
                      <span className="mt-0.5 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span className="text-[15px]">{objective}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Topics */}
            {details.topics.length > 0 && (
              <section aria-labelledby="topics">
                <h2 id="topics" className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
                  What the program covers
                </h2>
                <ol className="rounded-3xl border border-border bg-card divide-y divide-border overflow-hidden">
                  {details.topics.map((topic, index) => (
                    <li key={topic.title} className="flex gap-4 p-5 md:p-6">
                      <span className="w-9 h-9 rounded-xl bg-foreground text-background text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-semibold">{topic.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Learning experience */}
            <section aria-labelledby="experience">
              <h2 id="experience" className="text-2xl md:text-3xl font-bold tracking-tight mb-5">
                How you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <Users className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-semibold">Live group classes</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Interactive sessions on Zoom in small batches, with practice activities in every class.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <BadgeCheck className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-semibold">Assessment & feedback</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{details.assessment}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <FileText className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                  <h3 className="font-semibold">Learning materials</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    Notes, PDFs and presentations are shared in your student dashboard, along with your attendance.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section aria-labelledby="program-faq">
              <h2 id="program-faq" className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.q} value={`faq-${index}`} className="border-border">
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline py-5">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[15px] text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Sticky facts + CTA */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#FFB547] to-[#EF7D00]" />
              <div className="p-6">
                <h2 className="text-lg font-bold">Program at a glance</h2>
                <dl className="mt-4 space-y-4">
                  {facts.map((fact) => (
                    <div key={fact.label} className="flex items-start gap-3">
                      <fact.icon className="w-5 h-5 text-brand-ink flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-muted-foreground">{fact.label}</dt>
                        <dd className="text-sm font-semibold">{fact.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  Current batch timings (IST) — your exact batch is confirmed with you before enrolment.
                </p>
                <div className="mt-6 space-y-2.5">
                  <Link
                    href={demoHref}
                    className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white font-semibold hover:bg-[#de7200] transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                    Book a Free Demo
                  </Link>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border font-semibold text-sm hover:border-foreground/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#128C7E]" aria-hidden="true" />
                      Ask on WhatsApp
                    </a>
                  ) : (
                    <Link
                      href={askHref}
                      className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border font-semibold text-sm"
                    >
                      Ask a question
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {otherPrograms.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Other programs</h2>
                <ul className="mt-3 space-y-2">
                  {otherPrograms.map((other) => (
                    <li key={other.id}>
                      <Link
                        href={programHref(other)}
                        className="flex items-center justify-between gap-2 min-h-11 font-semibold hover:text-brand-ink transition-colors"
                      >
                        {other.title}
                        <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Final CTA */}
        <section className="pb-16 md:pb-24">
          <div className="container-site">
            <div className="rounded-[2rem] bg-foreground text-white px-6 py-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Not sure if this program is right for you?</h2>
                <p className="mt-2 text-white/70">Book a free demo — we'll talk through your goals and recommend the best fit.</p>
              </div>
              <Link
                href={demoHref}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-white font-semibold hover:bg-[#de7200] transition-colors flex-shrink-0"
              >
                <CalendarCheck className="w-4 h-4" aria-hidden="true" />
                Book a Free Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} programs={services} />
      <WhatsAppButton
        phone={contact.phone}
        message={`Hi Eleva Academy, I'm interested in the ${service.title} program.`}
      />
    </div>
  )
}

