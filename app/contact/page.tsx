import { ArrowUpRight, Clock, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { mapsLink, phoneDigits, whatsappLink } from "@/lib/content"
import { getPublicContact, getPublicServices } from "@/lib/public-data"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { EnquiryForm } from "@/components/site/enquiry-form"
import { WhatsAppButton } from "@/components/site/whatsapp-button"
import { socialLinks } from "@/components/site/social"

export const dynamic = "force-dynamic"

export default async function ContactPage() {
  const [contact, services] = await Promise.all([getPublicContact(), getPublicServices()])
  const digits = phoneDigits(contact.phone)
  const wa = whatsappLink(contact.phone, "Hi Eleva Academy, I'd like to know more about your programs.")
  const socials = socialLinks(contact).filter((s) => s.label !== "LinkedIn")

  const methods = [
    ...(contact.phone
      ? [
          { icon: Phone, label: "Call us", value: contact.phone, href: `tel:+${digits}`, external: false },
          { icon: MessageCircle, label: "WhatsApp", value: "Chat with us on WhatsApp", href: wa, external: true },
        ]
      : []),
    { icon: Mail, label: "Email us", value: contact.email, href: `mailto:${contact.email}`, external: false },
    ...(contact.linkedin
      ? [{ icon: Linkedin, label: "LinkedIn", value: "Eleva Academy India", href: contact.linkedin, external: true }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="contact" phone={contact.phone} />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-site relative py-12 md:py-16 text-center max-w-3xl">
            <p className="hero-in eyebrow mb-3">Contact & Free Demo</p>
            <h1
              className="hero-in text-4xl md:text-6xl font-bold tracking-tight text-balance"
              style={{ ["--d" as string]: 1 }}
            >
              Let's talk about your goals
            </h1>
            <p className="hero-in mt-5 text-lg text-muted-foreground leading-relaxed" style={{ ["--d" as string]: 2 }}>
              Book a free demo or ask us anything about the programs. We reply to every request within 24 hours.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container-site grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-10 items-start">
            {/* Enquiry / demo form — saved to the admin dashboard */}
            <div id="enquiry" className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 sm:p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight">Book a free demo or send an enquiry</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Fields marked <span className="text-destructive">*</span> are required.
              </p>
              <div className="mt-7">
                <EnquiryForm programs={services.map((s) => s.title)} contact={contact} />
              </div>
            </div>

            {/* Ways to reach us */}
            <div className="space-y-4">
              {methods.map(({ icon: Icon, label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-[#F5A623]/60 hover:shadow-md transition-all"
                >
                  <span className="w-12 h-12 rounded-xl bg-accent text-brand-ink flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-muted-foreground">{label}</span>
                    <span className="block font-semibold break-all">{value}</span>
                  </span>
                  <ArrowUpRight
                    className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0"
                    aria-hidden="true"
                  />
                </a>
              ))}

              {contact.address && (
                <a
                  href={mapsLink(contact.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-[#F5A623]/60 hover:shadow-md transition-all"
                >
                  <span className="w-12 h-12 rounded-xl bg-accent text-brand-ink flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-muted-foreground">Location</span>
                    <span className="block font-semibold">{contact.address}</span>
                    <span className="block text-sm text-muted-foreground mt-1">
                      All classes are live online — join from anywhere.
                    </span>
                  </span>
                  <ArrowUpRight
                    className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-3"
                    aria-hidden="true"
                  />
                </a>
              )}

              <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
                <span className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-ink" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold">Quick replies</span>
                  <span className="block text-sm text-muted-foreground mt-0.5">
                    We respond to every message and demo request within 24 hours.
                  </span>
                </span>
              </div>

              {socials.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Eleva Academy on ${label}`}
                      className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} programs={services} />
      <WhatsAppButton phone={contact.phone} />
    </div>
  )
}
