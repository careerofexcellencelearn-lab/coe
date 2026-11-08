"use client"

import { useEffect, useState } from "react"
import { Facebook, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from "lucide-react"
import { DEFAULT_CONTACT, type ContactContent } from "@/lib/content"

/** Live contact details (admin-editable), starting from the defaults so nothing flashes empty */
export function useContact(): ContactContent {
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    fetch("/api/contact", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.contact) setContact({ ...DEFAULT_CONTACT, ...data.contact })
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [])

  return contact
}

export type SocialLink = { icon: LucideIcon; label: string; href: string }

/** Only the socials the admin has filled in — empty ones are hidden, never dead "#" links */
export function socialLinks(contact: ContactContent): SocialLink[] {
  return [
    { icon: Linkedin, label: "LinkedIn", href: contact.linkedin },
    { icon: Instagram, label: "Instagram", href: contact.instagram },
    { icon: Youtube, label: "YouTube", href: contact.youtube },
    { icon: Facebook, label: "Facebook", href: contact.facebook },
    { icon: Twitter, label: "Twitter", href: contact.twitter },
  ].filter((link) => link.href)
}
