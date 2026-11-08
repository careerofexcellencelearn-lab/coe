"use client"

import { useEffect, useState } from "react"
import { DEFAULT_CONTACT, type ContactContent } from "@/lib/content"

/** Live contact details (admin-editable), starting from the defaults so nothing flashes empty */
export function useContact(initial: ContactContent = DEFAULT_CONTACT): ContactContent {
  const [contact, setContact] = useState<ContactContent>(initial)

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
