// Server-only readers for public page data (program pages, sitemap).
// Every reader falls back to the built-in defaults so a database hiccup never breaks a page.
import { getServicesRows, getSupabaseAdmin, isSupabaseConfigured, serviceToApi } from "./supabase"
import { fallbackServices, type Service } from "./programs"
import { DEFAULT_CONTACT, withContactDefaults, type ContactContent } from "./content"

export async function getPublicServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return fallbackServices
  try {
    const rows = await getServicesRows()
    return rows.length ? rows.map((row) => serviceToApi(row, false) as Service) : fallbackServices
  } catch {
    return fallbackServices
  }
}

export async function getPublicContact(): Promise<ContactContent> {
  if (!isSupabaseConfigured()) return DEFAULT_CONTACT
  try {
    const { data } = await getSupabaseAdmin().from("site_content").select("value").eq("key", "contact").maybeSingle()
    return withContactDefaults(data?.value)
  } catch {
    return DEFAULT_CONTACT
  }
}
