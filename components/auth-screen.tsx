import type React from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"
import { BrandMark } from "@/components/site/brand-mark"

/** Split-screen sign-in layout: brand panel on laptops, form-only on phones */
export function AuthScreen({
  title,
  description,
  highlights,
  children,
  footer,
}: {
  title: string
  description: string
  highlights: string[]
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#FFB547] via-[#F7931E] to-[#EF7D00] p-12 xl:p-16 flex-col justify-between">
        <div className="absolute inset-0 bg-dots opacity-25 mix-blend-overlay" aria-hidden="true" />
        <Link href="/" className="relative" aria-label="Eleva Academy — home">
          <BrandMark light />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-white text-balance leading-tight">
            Confidence is built by doing — every single day.
          </h2>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/95">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <img
          src="/sneha.webp"
          alt=""
          aria-hidden="true"
          className="absolute -right-10 bottom-0 h-[55%] w-auto opacity-25 pointer-events-none"
        />
        <p className="relative text-sm text-white/75">Eleva Academy · Center of Excellence</p>
      </aside>

      <main className="flex flex-col min-h-screen">
        <div className="h-16 px-5 md:px-8 flex items-center justify-between">
          <Link href="/" className="lg:invisible" aria-label="Eleva Academy — home">
            <BrandMark />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to website
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-[400px]">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
