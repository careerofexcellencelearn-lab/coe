// Shared time helpers — safe for both server and client use

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24
  const m = Math.round(mins % 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function formatTime12(time: string): string {
  if (!time) return ""
  const [h, m] = time.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hr = h % 12 === 0 ? 12 : h % 12
  return `${hr}:${String(m || 0).padStart(2, "0")} ${period}`
}

export function isWithinWindow(start: string, end: string, now: Date = new Date()): boolean {
  if (!start || !end) return false
  const mins = now.getHours() * 60 + now.getMinutes()
  return mins >= timeToMinutes(start) && mins < timeToMinutes(end)
}

/** Split a time window into `count` equal slots (e.g. one-on-one sessions) */
export function computeSlots(start: string, end: string, count: number): { start: string; end: string }[] {
  if (!start || !end || count <= 0) return []
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  if (e <= s) return []
  const duration = (e - s) / count
  return Array.from({ length: count }, (_, i) => ({
    start: minutesToTime(s + i * duration),
    end: minutesToTime(s + (i + 1) * duration),
  }))
}
