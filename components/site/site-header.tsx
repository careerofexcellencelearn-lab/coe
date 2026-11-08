"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, GraduationCap, LogIn, Menu, Phone, X } from "lucide-react"
import { phoneDigits } from "@/lib/content"

export type SiteSection = "home" | "about" | "contact"

const navLinks: { key: SiteSection | "programs"; label: string; href: string }[] = [
  { key: "programs", label: "Programs", href: "/#programs" },
  { key: "about", label: "About", href: "/about" },
  { key: "contact", label: "Contact", href: "/contact" },
]

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#EF7D00] text-white flex items-center justify-center shadow-sm shadow-orange-500/30">
        <GraduationCap className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className={`block text-[17px] font-bold tracking-tight ${light ? "text-white" : ""}`}>
          eleva<span className="text-primary">.</span>academy
        </span>
        <span
          className={`block text-[10px] font-medium uppercase tracking-[0.18em] mt-1 ${
            light ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          Center of Excellence
        </span>
      </span>
    </span>
  )
}

export function SiteHeader({ active, phone }: { active: SiteSection; phone?: string }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close the mobile menu if the viewport grows past the breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-200 border-b ${
        scrolled || open
          ? "bg-background/95 backdrop-blur-md border-border shadow-[0_1px_12px_rgba(28,25,23,0.06)]"
          : "bg-background border-transparent"
      }`}
    >
      <div className="container-site h-16 md:h-[72px] flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0" aria-label="Eleva Academy — home" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={link.key === active ? "page" : undefined}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                link.key === active ? "text-foreground bg-muted" : "text-foreground/70 hover:text-foreground hover:bg-muted/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {phone && (
            <a
              href={`tel:+${phoneDigits(phone)}`}
              className="hidden xl:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
              {phone}
            </a>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold border border-border bg-card hover:border-foreground/25 transition-colors"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            Student Login
          </Link>
          <Link
            href="/#programs"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/85 transition-colors"
          >
            Enroll Now
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <button
          className="lg:hidden w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-border bg-background">
          <nav className="container-site py-4 flex flex-col" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={link.key === active ? "page" : undefined}
                className={`py-3 text-base font-medium border-b border-border/70 ${
                  link.key === active ? "text-brand-ink" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border border-border bg-card"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Login
              </Link>
              <Link
                href="/#programs"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold bg-foreground text-background"
              >
                Enroll Now
              </Link>
            </div>
            {phone && (
              <a
                href={`tel:+${phoneDigits(phone)}`}
                className="mt-3 inline-flex items-center justify-center gap-2 h-11 text-sm font-medium text-foreground/75"
              >
                <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
                Call us · {phone}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
