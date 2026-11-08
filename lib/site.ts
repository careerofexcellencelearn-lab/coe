// Site-wide constants used for SEO (canonical URLs, sitemap, structured data).

/**
 * The live site is served from the www host (elevaacademy.in redirects there),
 * so canonical URLs and the sitemap must use it too. Override with
 * NEXT_PUBLIC_SITE_URL if the domain ever changes.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.elevaacademy.in").replace(/\/+$/, "")

export const SOCIAL_PROFILES = {
  linkedin: "https://www.linkedin.com/company/eleva-academy-india/",
  instagram: "https://www.instagram.com/elevaacademy_official/",
}

/** Default social-share preview image (1200×630) */
export const SHARE_IMAGE = { url: "/og-image.png", width: 1200, height: 630, alt: "Eleva Academy — live online communication training" }
