import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { phoneDigits, type ContactContent } from "@/lib/content"
import { BrandMark } from "./site-header"
import { socialLinks } from "./use-contact"

export function SiteFooter({ contact, serviceTitles }: { contact: ContactContent; serviceTitles?: string[] }) {
  const socials = socialLinks(contact)
  const programs = serviceTitles?.length
    ? serviceTitles
    : ["Soft Skills & Business Communication", "IELTS & TOEFL Training"]

  return (
    <footer className="bg-[#171412] text-white/70">
      <div className="container-site py-14 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
        <div className="space-y-5">
          <Link href="/" aria-label="Eleva Academy — home" className="inline-block">
            <BrandMark light />
          </Link>
          <p className="text-sm leading-relaxed max-w-xs">
            Live online soft skills, business communication and IELTS/TOEFL training led by Sneha Durgkar — helping
            students and professionals communicate with confidence.
          </p>
          {socials.length > 0 && (
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-white hover:bg-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Footer" className="space-y-4">
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {[
              ["Programs", "/#programs"],
              ["About the Trainer", "/about"],
              ["Contact", "/contact"],
              ["Student Login", "/dashboard"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-white">Programs</p>
          <ul className="space-y-2.5 text-sm">
            {programs.map((title) => (
              <li key={title}>
                <Link href="/#programs" className="hover:text-white transition-colors">
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-white">Get in touch</p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={`mailto:${contact.email}`} className="flex items-start gap-3 hover:text-white transition-colors">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <span className="break-all">{contact.email}</span>
              </a>
            </li>
            {contact.phone && (
              <li>
                <a
                  href={`tel:+${phoneDigits(contact.phone)}`}
                  className="flex items-start gap-3 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
            )}
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
              100% online · India & worldwide
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Eleva Academy. All rights reserved.</p>
          <p>Live online classes · Learn from anywhere</p>
        </div>
      </div>
    </footer>
  )
}
