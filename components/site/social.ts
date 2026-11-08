import { Facebook, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from "lucide-react"
import type { ContactContent } from "@/lib/content"

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
