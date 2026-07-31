import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eleva Academy — Center of Excellence",
    short_name: "Eleva Academy",
    description:
      "Live online soft skills, business communication and IELTS/TOEFL training with Sneha Durgkar.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF8C00",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  }
}
