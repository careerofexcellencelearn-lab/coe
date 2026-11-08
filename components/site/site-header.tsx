"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarCheck, LogIn, Menu, Phone, X } from "lucide-react"
import { phoneDigits } from "@/lib/content"
import { BrandMark } from "./brand-mark"

export { BrandMark }

export type SiteSection = "home" | "programs" | "about" | "contact"

const navLinks: { key: SiteSection; label: string; href: string }[] = [
  { key: "programs", label: "Programs", href: "/#programs" },
  { key: "about", label: "About", href: "/about" },
  { key: "contact", label: "Contact", href: "/contact" },
]

/** Where every "Book a Free Demo" button leads (the enquiry form on the contact page) */
export const DEMO_HREF = "/contact#enquiry"

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
            href={DEMO_HREF}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/85 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" aria-hidden="true" />
            Book a Free Demo
          </Link>
        </div>

        <button
          className="lg:hidden w-11 h-11 -mr-2 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-border bg-background max-h-[calc(100dvh-4rem)] overflow-y-auto">
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
            <Link
              href={DEMO_HREF}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold bg-primary text-white"
            >
              <CalendarCheck className="w-4 h-4" aria-hidden="true" />
              Book a Free Demo
            </Link>
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border border-border bg-card"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Login
              </Link>
              {phone ? (
                <a
                  href={`tel:+${phoneDigits(phone)}`}
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border border-border bg-card"
                >
                  <Phone className="w-4 h-4 text-primary" aria-hidden="true" />
                  Call Us
                </a>
              ) : (
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center h-11 rounded-xl text-sm font-semibold border border-border bg-card"
                >
                  Contact
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
