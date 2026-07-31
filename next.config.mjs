/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows verification builds to use a separate folder (NEXT_DIST_DIR=.next-build)
  // so they never corrupt the dev server's .next while it is running.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async rewrites() {
    // Chrome DevTools probes every localhost site for this file; answer it
    // so the dev log isn't filled with 404s.
    return [
      {
        source: "/.well-known/appspecific/com.chrome.devtools.json",
        destination: "/api/chrome-devtools",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
