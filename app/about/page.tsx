"use client"

import { ArrowLeft, BadgeCheck, GraduationCap, Laptop } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DEFAULT_ABOUT, type AboutContent } from "@/lib/content"

export default function AboutPage() {
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT)

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative blob shapes */}
      <div className="blob-shape w-[600px] h-[600px] -top-48 -left-48" />
      <div className="blob-shape w-[500px] h-[500px] -bottom-32 -right-32" />
      <div className="blob-shape w-[400px] h-[400px] top-1/2 -right-48" />

      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 mb-4 md:mb-6 border border-border/50">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/about" className="text-sm font-medium text-primary">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {/* Profile intro */}
          <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-[#F5A623] to-[#FF8C00] overflow-hidden flex items-end justify-center">
                  <img src="/sneha.webp" alt="Sneha Durgkar — communication and soft skills trainer, founder of Eleva Academy" className="max-h-[92%] w-auto object-contain" />
                </div>
              </div>
              <div className="space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold text-balance mb-2">Sneha Durgkar</h1>
                  <p className="text-base md:text-lg text-muted-foreground">{about.subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5A623]/15 text-[#B36A00] rounded-full px-3 py-1.5">
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                    10+ years in education & training
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#F5A623]/15 text-[#B36A00] rounded-full px-3 py-1.5">
                    <Laptop className="w-3.5 h-3.5" aria-hidden="true" />
                    100% live online classes
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/85">
              {about.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Credentials + training areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Credentials</h2>
              <ul className="space-y-3">
                {about.qualifications.map((qualification) => (
                  <li key={qualification} className="flex items-start gap-3 text-sm leading-relaxed">
                    <BadgeCheck className="w-5 h-5 text-[#E8890C] flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {qualification}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-border/50">
              <h2 className="text-xl font-bold mb-4">Training Areas</h2>
              <div className="flex flex-wrap gap-2">
                {about.trainingAreas.map((area) => (
                  <span
                    key={area}
                    className="text-sm font-medium bg-muted/60 border border-border/50 rounded-full px-4 py-2"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Journey timeline */}
          <div className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-border/50">
            <h2 className="text-xl font-bold mb-6">The Journey</h2>
            <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {about.experience.map((entry) => (
                <div key={`${entry.title}-${entry.org}`} className="relative">
                  <span
                    className="absolute -left-6 top-1.5 w-[15px] h-[15px] rounded-full bg-gradient-to-br from-[#F5A623] to-[#FF8C00] border-2 border-background"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold">{entry.title}</h3>
                  <p className="text-sm text-[#B36A00] font-medium mb-1.5">{entry.org}</p>
                  {entry.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#F5A623] to-[#FF8C00] rounded-3xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Learn with Sneha</h2>
            <p className="text-white/85 text-sm md:text-base max-w-xl mx-auto mb-6">
              Explore the live online programs in soft skills, business communication and IELTS/TOEFL — and experience
              the personal approach yourself.
            </p>
            <Link
              href="/#programs"
              className="inline-flex items-center gap-2 bg-black text-white rounded-full px-7 py-3.5 text-sm font-semibold hover:bg-black/85 transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
