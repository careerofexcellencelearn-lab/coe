"use client"

import type React from "react"

import { ArrowRight, BadgeCheck, GraduationCap, Laptop, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { DEFAULT_ABOUT, type AboutContent } from "@/lib/content"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { useContact } from "@/components/site/use-contact"

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT)
  const contact = useContact()

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    fetch("/api/about", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.about?.bio?.length) setAbout(data.about)
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="about" phone={contact.phone} />

      <main>
        {/* Profile hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-site relative py-12 md:py-20 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
            <div className="hero-in mx-auto md:mx-0 w-48 h-56 md:w-60 md:h-72 rounded-[2rem] bg-gradient-to-br from-[#FFB547] to-[#EF7D00] overflow-hidden relative shadow-xl shadow-orange-500/20">
              <img
                src="/sneha.webp"
                alt="Sneha Durgkar — communication and soft skills trainer, founder of Eleva Academy"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[92%] w-auto max-w-none object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="hero-in eyebrow mb-3" style={{ "--d": 1 } as React.CSSProperties}>
                About the Trainer
              </p>
              <h1
                className="hero-in text-4xl md:text-6xl font-bold tracking-tight"
                style={{ "--d": 2 } as React.CSSProperties}
              >
                Sneha Durgkar
              </h1>
              <p
                className="hero-in mt-3 text-lg text-muted-foreground max-w-xl mx-auto md:mx-0"
                style={{ "--d": 3 } as React.CSSProperties}
              >
                {about.subtitle}
              </p>
              <div
                className="hero-in mt-6 flex flex-wrap gap-2 justify-center md:justify-start"
                style={{ "--d": 4 } as React.CSSProperties}
              >
                {[
                  { icon: GraduationCap, label: "10+ years in education & training" },
                  { icon: Laptop, label: "100% live online classes" },
                  { icon: Users, label: "Personal one-on-one coaching" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 text-sm font-medium bg-card border border-border rounded-full px-4 py-2 shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container-site grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
            {/* Story + journey */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
                <h2 className="text-2xl font-bold tracking-tight mb-5">Her story</h2>
                <div className="space-y-4 text-[17px] leading-relaxed text-foreground/80">
                  {about.bio.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
                <h2 className="text-2xl font-bold tracking-tight mb-8">The journey</h2>
                <ol className="relative space-y-8 pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {about.experience.map((entry, i) => (
                    <li key={`${entry.title}-${entry.org}`} className="relative">
                      <span
                        className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full border-4 border-card ${
                          i === 0 ? "bg-primary" : "bg-[#FFC27A]"
                        }`}
                        aria-hidden="true"
                      />
                      <h3 className="text-lg font-semibold">{entry.title}</h3>
                      <p className="text-sm font-medium text-brand-ink mt-0.5 mb-2">{entry.org}</p>
                      {entry.description && (
                        <p className="text-muted-foreground leading-relaxed">{entry.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
                <h2 className="text-lg font-bold mb-4">Credentials</h2>
                <ul className="space-y-3.5">
                  {about.qualifications.map((qualification) => (
                    <li key={qualification} className="flex items-start gap-3 text-sm leading-relaxed">
                      <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
                      {qualification}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 md:p-7">
                <h2 className="text-lg font-bold mb-4">Training areas</h2>
                <div className="flex flex-wrap gap-2">
                  {about.trainingAreas.map((area) => (
                    <span key={area} className="text-sm font-medium bg-accent text-brand-ink rounded-full px-3.5 py-1.5">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-foreground text-background p-6 md:p-7">
                <h2 className="text-xl font-bold">Learn with Sneha</h2>
                <p className="mt-2 text-sm text-background/70 leading-relaxed">
                  Live online programs in soft skills, business communication and IELTS/TOEFL — experience the personal
                  approach yourself.
                </p>
                <Link
                  href="/#programs"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 h-11 rounded-full bg-primary text-white text-sm font-semibold hover:bg-[#de7200] transition-colors"
                >
                  Explore Programs
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} />
    </div>
  )
}
