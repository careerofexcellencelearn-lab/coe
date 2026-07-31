import type { MetadataRoute } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elevaacademy.in"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ]
}
