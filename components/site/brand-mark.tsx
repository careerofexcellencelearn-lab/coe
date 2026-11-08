/** Eleva Academy logo + wordmark, used in the header, footer, dashboards and login screens */
export function BrandMark({ light = false, size = "md" }: { light?: boolean; size?: "md" | "lg" }) {
  const logo = size === "lg" ? "w-12 h-12" : "w-10 h-10"
  return (
    <span className="flex items-center gap-2.5">
      <img
        src="/logo.webp"
        alt=""
        width={48}
        height={48}
        className={`${logo} rounded-full flex-shrink-0 ring-1 ring-black/5`}
      />
      <span className="leading-none">
        <span className={`block text-[17px] font-bold tracking-tight ${light ? "text-white" : ""}`}>Eleva Academy</span>
        <span
          className={`block text-[10px] font-medium uppercase tracking-[0.18em] mt-1 ${
            light ? "text-white/60" : "text-muted-foreground"
          }`}
        >
          Center of Excellence
        </span>
      </span>
    </span>
  )
}
