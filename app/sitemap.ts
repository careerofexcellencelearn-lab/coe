import type { MetadataRoute } from "next"
import { getPublicServices } from "@/lib/public-data"
import { programHref } from "@/lib/programs"
import { SITE_URL } from "@/lib/site"

const siteUrl = SITE_URL

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const services = await getPublicServices()
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...services.map((service) => ({
      url: `${siteUrl}${programHref(service)}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
  ]
}
