"use client"

import type React from "react"

import { ArrowUpRight, Clock, Linkedin, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { phoneDigits } from "@/lib/content"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { socialLinks, useContact } from "@/components/site/use-contact"

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [opened, setOpened] = useState(false)
  const contact = useContact()
  const digits = phoneDigits(contact.phone)
  const socials = socialLinks(contact).filter((s) => s.label !== "LinkedIn")

  // There is no mail backend: the form composes the message in the visitor's
  // own email app, so nothing is silently lost.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `${formData.message}\n\n— ${formData.name} (${formData.email})`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(
      formData.subject || "Enquiry from the Eleva Academy website",
    )}&body=${encodeURIComponent(body)}`
    setOpened(true)
  }

  const methods = [
    {
      icon: Mail,
      label: "Email us",
      value: contact.email,
      href: `mailto:${contact.email}`,
      external: false,
    },
    ...(contact.phone
      ? [
          { icon: Phone, label: "Call us", value: contact.phone, href: `tel:+${digits}`, external: false },
          {
            icon: MessageCircle,
            label: "WhatsApp",
            value: "Chat with us on WhatsApp",
            href: `https://wa.me/${digits}`,
            external: true,
          },
        ]
      : []),
    ...(contact.linkedin
      ? [
          {
            icon: Linkedin,
            label: "LinkedIn",
            value: "Eleva Academy India",
            href: contact.linkedin,
            external: true,
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader active="contact" phone={contact.phone} />

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <div className="container-site relative py-12 md:py-20 text-center max-w-3xl">
            <p className="hero-in eyebrow mb-3">Contact</p>
            <h1
              className="hero-in text-4xl md:text-6xl font-bold tracking-tight text-balance"
              style={{ "--d": 1 } as React.CSSProperties}
            >
              Let's talk about your goals
            </h1>
            <p
              className="hero-in mt-5 text-lg text-muted-foreground leading-relaxed"
              style={{ "--d": 2 } as React.CSSProperties}
            >
              Want to join a program or book a free demo class? Reach us any way you like — we reply within 24 hours.
            </p>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container-site grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-10 items-start">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <MapPin className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                  <p className="font-semibold">100% online</p>
                  <p className="text-sm text-muted-foreground mt-1">Join live from anywhere in India or abroad.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <Clock className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
                  <p className="font-semibold">Quick replies</p>
                  <p className="text-sm text-muted-foreground mt-1">We respond to every message within 24 hours.</p>
                </div>
              </div>

              {socials.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-11 h-11 rounded-full border border-border bg-card flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Message form */}
            <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                This opens your email app with the message ready to send to {contact.email}.
              </p>
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Which program are you interested in?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us about your goals — e.g. interview preparation, public speaking, IELTS band score…"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base">
                  <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                  Send Message
                </Button>
                {opened && (
                  <p className="text-sm text-muted-foreground text-center" role="status">
                    Your email app should have opened. If it didn't, write to{" "}
                    <a href={`mailto:${contact.email}`} className="font-semibold text-brand-ink hover:underline">
                      {contact.email}
                    </a>
                    {contact.phone && <> or call {contact.phone}</>}.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter contact={contact} />
    </div>
  )
}
